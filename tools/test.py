# Полный прогон настоящими тапами. python tools/test.py desktop|phone
import asyncio,sys,os,json
from playwright.async_api import async_playwright
MODE=sys.argv[1] if len(sys.argv)>1 else 'desktop';URL='http://127.0.0.1:18601/index.html';OUT='shots/'+MODE;FAILS=[]
async def main():
  os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    vp={'width':1280,'height':720} if MODE=='desktop' else {'width':844,'height':390}
    ctx=await b.new_context(viewport=vp,has_touch=MODE=='phone',is_mobile=MODE=='phone',device_scale_factor=1 if MODE=='desktop' else 3)
    pg=await ctx.new_page();logs=[]
    pg.on('pageerror',lambda e:logs.append(str(e)));pg.on('console',lambda m:logs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(2500)
    e=await pg.evaluate('G.selftest()')
    if e:FAILS.append('selftest '+str(e))
    await pg.screenshot(path=f'{OUT}/00_title.png')
    async def tapL(x,y):
      q=await pg.evaluate(f'G.pg({x},{y})')
      if MODE=='phone': await pg.touchscreen.tap(q['x'],q['y'])
      else: await pg.mouse.click(q['x'],q['y'])
    async def btn(id):
      bs=await pg.evaluate('G.btns()');bb=[x for x in bs if x['id']==id]
      if not bb: FAILS.append(f'no button {id} in {await pg.evaluate("G.scene")}');return False
      await tapL(bb[0]['x'],bb[0]['y']);return True
    async def waitin(t=40000):
      await pg.wait_for_function('G.waiting()||(G.LV()&&G.LV().done)',timeout=t)
    async def move(v):  # сыграть ход v настоящим тапом
      await pg.wait_for_timeout(150)
      inf=await pg.evaluate('G.info()')
      if isinstance(v,bool): await btn('first' if v else 'second')
      elif isinstance(v,int) and inf.get('q') is not None: await btn(f'q{v}')
      elif isinstance(v,dict) and v['t']=='sub': await btn('t%d'%(inf['g']['n']-v['n']))
      else:
        xy=await pg.evaluate(f'G.tapFor({json.dumps(v)})');await tapL(xy[0],xy[1])
      await pg.wait_for_timeout(120)
    await btn('play');await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{OUT}/01_intro.png')
    await pg.evaluate('G.fast=true');await btn('skip');await pg.wait_for_timeout(900)
    await pg.screenshot(path=f'{OUT}/02_map.png')
    for lv in range(1,6):
      await tapL(*(await pg.evaluate('G.mp()'))[lv-1]);await pg.wait_for_timeout(500)
      if await pg.evaluate('G.scene')!=f'l{lv}':FAILS.append(f'map tap l{lv} failed');await pg.evaluate(f'G.go("l{lv}")')
      if lv<5:
        await pg.wait_for_timeout(300);s=await pg.evaluate('G.secretXY()');await tapL(s['x'],s['y']);await pg.wait_for_timeout(400)
        if await pg.evaluate('G.scene')!='secret':FAILS.append(f'secret{lv} no open')
        else:
          await pg.wait_for_function('!G.busy',timeout=20000);await pg.screenshot(path=f'{OUT}/s{lv}.png')
          a=(await pg.evaluate('G.info()'))['a'];await btn(f'o{(a+1)%3}');await pg.wait_for_function('!G.busy',timeout=20000)
          if await pg.evaluate('G.S.secret[%d]'%(lv-1)):FAILS.append(f'secret{lv} wrong accepted')
          await btn(f'o{a}');await pg.wait_for_function(f'G.scene=="l{lv}"',timeout=15000)
          if not await pg.evaluate('G.S.secret[%d]'%(lv-1)):FAILS.append(f'secret{lv} not credited')
      mist=False;moves=0;shot=0
      while not await pg.evaluate('G.LV().done'):
        await waitin()
        if await pg.evaluate('G.LV().done'):break
        if shot==0: await pg.wait_for_timeout(250);await pg.screenshot(path=f'{OUT}/l{lv}.png');shot=1
        if not mist and moves>=1:
          v=await pg.evaluate('G.worst()');ok=await pg.evaluate('G.LV().mist');await move(v);mist=await pg.evaluate('G.LV().mist')>ok
          await pg.wait_for_timeout(500);await pg.screenshot(path=f'{OUT}/l{lv}_mistake.png')
          continue
        v=await pg.evaluate('G.best()');await move(v);moves+=1
        if moves==4: await pg.screenshot(path=f'{OUT}/l{lv}_mid.png')
        if moves>200:FAILS.append(f'l{lv} too many moves');break
      await pg.wait_for_timeout(1800);await pg.screenshot(path=f'{OUT}/l{lv}_done.png')
      print('level',lv,'done moves',moves,'mist',await pg.evaluate('G.LV().mist'),'stars',await pg.evaluate('G.S.stars'),flush=True)
      await btn('map');await pg.wait_for_timeout(400)
    await pg.evaluate('G.go("fin")');await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{OUT}/fin.png')
    await pg.evaluate('G.go("map")');await pg.wait_for_timeout(600);await pg.screenshot(path=f'{OUT}/map_end.png')
    print('fps',await pg.evaluate('G.fps()'))
    if logs:FAILS.append('console: '+' | '.join(logs[:5]))
    await b.close()
  print('FAILS',FAILS);print('PASS' if not FAILS else 'FAIL')
asyncio.run(main())
