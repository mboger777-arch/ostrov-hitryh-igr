# Настоящие тапы (hasTouch, мобильная эмуляция) на 844x390, 667x375, 932x430: на каждом уровне — нарочная ошибка
# (ход в выигрышную для соперника позицию / неверный ответ / неверный выбор «кто ходит»), ход берётся назад, ребёнок
# сразу ходит снова (<=600 мс), партии доигрываются до конца; тайные комнаты: ошибка → верный ответ; финал.
# python tools/test_touch.py   (сервер: python3 -m http.server 18601 в корне игры)
import asyncio,os,time,json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:18601/index.html'
VPS=[(844,390),(667,375),(932,430)]
if os.environ.get('VPS'):VPS=[tuple(map(int,v.split('x'))) for v in os.environ['VPS'].split(',')]
async def run(b,W,H,F,R):
  tag=f'{W}x{H}';out=f'shots/touch/{tag}';os.makedirs(out,exist_ok=True)
  ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=2)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(2500)
  await pg.evaluate('G.fast=true;SV.open=5');ev=pg.evaluate
  async def tap(x,y,w=200):
    q=await ev(f'G.pg({x},{y})');await pg.touchscreen.tap(q['x'],q['y']);await pg.wait_for_timeout(w)
  async def btn(i):
    bb=[x for x in await ev('G.btns()') if x['id']==i]
    if not bb:F.append(f'{tag} {await ev("G.scene")}: no btn {i}');return
    await tap(bb[0]['x'],bb[0]['y'])
  async def hitcheck(where):
    for s in await ev("UI.filter(b=>!b.dis).map(b=>({id:b.id,w:Math.max(b.w+12,56/S)*S,h:Math.max(b.h+12,56/S)*S})).filter(b=>b.w<56||b.h<56)"):F.append(f'{tag} {where}: btn {s["id"]} hit {s["w"]:.0f}x{s["h"]:.0f}')
  async def move(v):
    inf=await ev('G.info()')
    if isinstance(v,bool):await btn('first' if v else 'second')
    elif isinstance(v,int) and inf.get('q') is not None:await btn(f'q{v}')
    elif isinstance(v,dict) and v['t']=='sub':await btn('t%d'%(inf['g']['n']-v['n']))
    else:
      xy=await ev(f'G.tapFor({json.dumps(v)})');await tap(xy[0],xy[1])
  async def mistake_possible():
    return await ev("(()=>{const L=G.LV();if(L.q||L.choose)return true;if(L.n===3)return tWin(L.b)&&tLegal(L.b).some(j=>tWin(L.b|CF[j]));return gWin(L.g)&&gMoves(L.g).some(p=>gWin(p))})()")
  for lv in range(1,6):
    await ev(f'G.go("l{lv}")');await pg.wait_for_timeout(500);done_m=False;n=0
    while not await ev('G.LV().done') and n<300:
      n+=1;t=time.time()
      while not await ev('G.waiting()||G.LV().done') and time.time()-t<30:await pg.wait_for_timeout(30)
      if await ev('G.LV().done'):break
      await hitcheck(f'l{lv}')
      if not done_m and await mistake_possible():
        m0=await ev('G.LV().mist');await move(await ev('G.worst()'))
        t=time.time()
        while await ev('G.LV().mist')<=m0 and time.time()-t<3:await pg.wait_for_timeout(20)
        if await ev('G.LV().mist')<=m0:F.append(f'{tag} l{lv}: mistake not registered');done_m=True;continue
        t=time.time()
        while not await ev('G.waiting()') and time.time()-t<5:await pg.wait_for_timeout(20)
        ms=(time.time()-t)*1000;R.append(f'{tag} l{lv}: can move again {ms:.0f} ms after mistake')
        if ms>600:F.append(f'{tag} l{lv}: input locked {ms:.0f} ms after mistake')
        if W==844:await pg.wait_for_timeout(100);await pg.screenshot(path=f'{out}/l{lv}_mistake.png')
        await move(await ev('G.best()'));done_m=True
        if W==844:await pg.wait_for_timeout(250);await pg.screenshot(path=f'{out}/l{lv}_fixed.png')
        continue
      await move(await ev('G.best()'))
    if not await ev('G.LV().done'):F.append(f'{tag} l{lv}: not finished');continue
    if not done_m:F.append(f'{tag} l{lv}: no mistake made')
    R.append(f'{tag} l{lv}: finished, mistakes {await ev("G.LV().mist")}')
    if lv<5:
      await ev(f'SV.secret[{lv-1}]=0;go("secret",{lv})');await pg.wait_for_timeout(500);await hitcheck(f'secret{lv}')
      a=(await ev('G.info()'))['a'];await btn(f'o{(a+1)%3}');t=time.time()
      while await ev('G.locked()') and time.time()-t<3:await pg.wait_for_timeout(20)
      ms=(time.time()-t)*1000
      if ms>600:F.append(f'{tag} secret{lv}: locked {ms:.0f} ms')
      if lv==1 and W==844:await pg.screenshot(path=f'{out}/s1_mistake.png')
      await btn(f'o{a}');await pg.wait_for_timeout(300)
      if not await ev(f'SV.secret[{lv-1}]'):F.append(f'{tag} secret{lv}: right answer after mistake not accepted')
      else:R.append(f'{tag} secret{lv}: wrong then right ok')
  await ev('G.go("fin")');await pg.wait_for_timeout(1200);await hitcheck('fin');await btn('map');await pg.wait_for_timeout(500)
  if await ev('G.scene')!='map':F.append(f'{tag}: finale map button failed')
  F.extend(f'{tag} JSERR {e}' for e in errs);await ctx.close()
async def main():
  F=[];R=[]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for W,H in VPS:await run(b,W,H,F,R)
    await b.close()
  print('\n'.join(R));print('FAILS',F);print('PASS' if not F else 'FAIL')
asyncio.run(main())
