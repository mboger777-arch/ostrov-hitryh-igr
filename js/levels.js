'use strict';
// ===== сцены и уровни «Остров хитрых игр» =====
const LNAMES=['Монеты из сундука','Пушечные ядра','Тарелки на столе','Морская карта','Капитан Флинт'];
const ROUNDS=[3,4,3,4,3];
let LV=null;
// ---------- точная математика игр (обратная индукция) ----------
const GW=7,GH=5;
const RULES={king:(x,y)=>[[1,0],[0,1],[1,1]].map(([a,b])=>[x-a,y-b]).filter(([u,v])=>u>=0&&v>=0),
 rook:(x,y)=>{const o=[];for(let a=1;a<=x;a++)o.push([x-a,y]);for(let b=1;b<=y;b++)o.push([x,y-b]);return o}};
const PG={};function gridP(rule){if(PG[rule])return PG[rule];const W={};for(let s=0;s<GW+GH;s++)for(let x=0;x<GW;x++){const y=s-x;if(y<0||y>=GH)continue;W[x+','+y]=RULES[rule](x,y).some(([u,v])=>!W[u+','+v])}return PG[rule]=W}
const PS_={};function subW(k,n){const key=k;if(!PS_[key]){const W=[false];for(let i=1;i<=60;i++){let w=false;for(let t=1;t<=Math.min(k,i);t++)if(!W[i-t])w=true;W.push(w)}PS_[key]=W}return PS_[key][n]}
// позиция: {t:'sub',k,n} | {t:'grid',rule,x,y}
function gMoves(g){return g.t==='sub'?Array.from({length:Math.min(g.k,g.n)},(_,i)=>({...g,n:g.n-i-1})):RULES[g.rule](g.x,g.y).map(([x,y])=>({...g,x,y}))}
function gWin(g){return g.t==='sub'?subW(g.k,g.n):gridP(g.rule)[g.x+','+g.y]}// выигрышна для того, кто ходит
function gEnd(g){return g.t==='sub'?g.n===0:g.x===0&&g.y===0}
function aiMove(g){const m=gMoves(g),good=m.filter(p=>!gWin(p));if(good.length)return good[Math.floor(Math.random()*good.length)];
 // проигрышная позиция: случайный, но «осторожный» ход (не подходит вплотную к концу без нужды)
 const safe=m.filter(p=>gMoves(p).every(q=>!gEnd(q)));const pool=safe.length?safe:m;return pool[Math.floor(Math.random()*pool.length)]}
// стол: 19 мест гекс-решётки, нельзя ставить на соседнее место
const SPOTS=[];for(let q=-2;q<=2;q++)for(let r=-2;r<=2;r++)if(Math.abs(q+r)<=2)SPOTS.push([q,r]);
const SXY=SPOTS.map(([q,r])=>[q+r/2,r*Math.sqrt(3)/2]);
const CF=SPOTS.map((a,i)=>SPOTS.reduce((m,b,j)=>Math.hypot(SXY[i][0]-SXY[j][0],SXY[i][1]-SXY[j][1])<1.5?m|(1<<j):m,0));
const CENTER=SPOTS.findIndex(([q,r])=>q===0&&r===0);
const mirrorOf=i=>SPOTS.findIndex(([q,r])=>q===-SPOTS[i][0]&&r===-SPOTS[i][1]);
const TW=new Map();function tLegal(b){const o=[];for(let i=0;i<19;i++)if(!(b>>i&1))o.push(i);return o}
function tWin(b){if(TW.has(b))return TW.get(b);const w=tLegal(b).some(i=>!tWin(b|CF[i]));TW.set(b,w);return w}
// ---------- заставка ----------
SC.title={enter(){cast=[{n:'tim',x:170,y:705,h:300},{n:'mark',x:1010,y:705,h:270},{n:'mey',x:1150,y:705,h:270}]},
 draw(){bgDraw('title');motes(45);drawCast();
  {const lg=UA.logo;if(okI(lg)){const w=640,h=w*lg.naturalHeight/lg.naturalWidth;X.save();X.translate(640,165+Math.sin(T*1.5)*5);X.rotate(Math.sin(T*.8)*.012);X.drawImage(lg,-w/2,-h/2,w,h);X.restore()}}
  win('scroll',400,318,480,80);ink('Урок 309 · Игры и выигрышная стратегия',640,358,26);
  for(let i=0;i<5;i++)coinTok(500+i*70,440+Math.sin(T*2+i)*8,24,{rot:Math.sin(T+i)*.2})},
 ui(){btn('play',640,560,300,90,'Играть!',()=>{go('intro')},{pulse:1,fs:46})}};
// ---------- вступление ----------
SC.intro={enter(){cast=[{n:'tim',x:200,y:700,h:330},{n:'mark',x:420,y:700,h:290},{n:'mey',x:600,y:700,h:290},{n:'flint',x:1060,y:705,h:400,flip:1}];
 run(async()=>{for(const k of['p1','p2','p3','p4','p5','p6']){if(scene!=='intro')return;if(k==='p5'){swing('flint');mood('flint','laugh')}if(k==='p6')cheer();await say(k)}if(scene==='intro')go('map')})},
 draw(){bgDraw('title',.12);motes(45);drawCast()},
 ui(){btn('skip',1170,50,170,60,'Дальше ›',()=>go('map'),{always:1,fs:28})}};
// ---------- карта ----------
const MPB=[[205,420],[420,372],[640,420],[860,372],[1075,410]];let MP=MPB.map(p=>p.slice()),MK=1;
function mapLayout(){const v=vis(),bs=bgScale(),si=typeof SAFE!=='undefined'?SAFE.l/Math.max(S,.01):0,safe=Math.max(si+12,20);
  const[cX,lid]=bgXY(.795*1280,.63*720);MK=clamp(1.25-S*.45,.85,1.15)*PK();
  const tc=cast[0],timR=tc?tc.x+(IM[tc.n]&&IM[tc.n].naturalWidth?tc.h*IM[tc.n].naturalWidth/IM[tc.n].naturalHeight:tc.h*.6)*.5:v.x0+safe+80;const L=Math.max(timR+90*MK,bgXY(.12*1280,.55*720)[0]);
  const R=Math.min(cX-40,bgXY(.92*1280,.55*720)[0]);const sp=Math.min(300,Math.max(140,(R-L)/4));
  MK=Math.max(.75,Math.min(MK,(sp-14)/196,1.4));
  MP=MPB.map((p,i)=>i===4?[cX,lid-150*MK]:[L+i*sp,(i%2?372:425)+(MK-1)*40]);
  // держим остановки в видимой зоне
  MP.forEach(p=>{p[0]=clamp(p[0],v.x0+safe+80,v.x0+v.w-safe-80);p[1]=clamp(p[1],v.y0+90,v.y0+v.h-160)});
  const pts=[];for(let i=1;i<MP.length;i++){const a=MP[i-1],b=MP[i],mx=(a[0]+b[0])/2,my=Math.max(a[1],b[1])+50*MK;
  const n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/(26*MK));for(let k=0;k<=n;k++){const u=k/n,x=(1-u)*(1-u)*a[0]+2*u*(1-u)*mx+u*u*b[0],y=(1-u)*(1-u)*a[1]+2*u*(1-u)*my+u*u*b[1];
   if(Math.hypot(x-a[0],y-a[1])>66*MK&&Math.hypot(x-b[0],y-b[1])>66*MK)pts.push([x,y,i,k])}}return{v,safe,pts}}
SC.map={enter(){cast=[{n:'tim',x:70,y:715,h:160}];if(!SV.seenMap){SV.seenMap=1;save();run(()=>say('map'))}},
 draw(){bgDraw('title',.25);motes(45);const{v,safe,pts}=mapLayout();
  pts.forEach(([x,y,i,k])=>{const op=i<SV.open,tw=op?Math.sin(T*3-k*.6)*.15:0;coinTok(x,y,6.5*MK,{rot:k*.7,a:op?.95:.75,dark:op?0:.5,sc:1+tw*.3})});
  win('scroll',505,14,270,66);ink('Карта острова',640,47,34);
  const sc=SV.secret.reduce((a,b)=>a+b,0),rx=Math.min(1245,v.x0+v.w-safe)-250;win('plank',rx,22,250,46);coinTok(rx+27,45,11,{glow:sc?1:0});txt('Редкие дублоны: '+sc+'/4',rx+137,45,19,'#fff0c8',{st:'#2a1004',lw:4,maxW:190});
  MP.forEach((p,i)=>{const open=i<SV.open,cur=i===SV.open-1;const bob=open?Math.sin(T*1.6+i)*4:0;X.save();X.translate(p[0],p[1]);X.scale(MK,MK);
   spr('shadow',0,50,26,{a:.35});
   spr(i===4?'chest':'ship',0,bob,i===4?96:108,{dark:open?0:.5,glow:open?(cur?1.3+Math.sin(T*4)*.4:.6):0});
   if(!open)spr('xmark',0,bob,46,{a:.8});
   coinTok(42,bob-40,17,{dark:open?0:.6});txt(String(i+1),42,bob-40,22,open?'#fff3c0':'#d8cbb0',{st:'#3a1a06',lw:4});
   win('plank',-98,60,196,44);txt(LNAMES[i],0,82,19,open?'#fff0c8':'#cfc4b0',{st:'#2a1004',lw:4,maxW:164});
   for(let s=0;s<3;s++)star(-30+s*30,124,11,s<SV.stars[i]);X.restore()});
  drawCast()},
 tap(x,y){MP.forEach((p,i)=>{if(Math.abs(x-p[0])<100*MK&&y>p[1]-70*MK&&y<p[1]+140*MK){if(i<SV.open){SFX.click();go('l'+(i+1))}else{SFX.bad();oops('tim')}}})}};
// ---------- общая рамка уровня ----------
const SECRET_POS=[[1215,250],[80,250],[1230,300],[70,330]];
const DEF={};
function levelScene(n){SC['l'+n]={enter(){if(LV&&LV.n===n&&LV.resume){LV.resume=false;cast=LV.cast;return}
  LV={n,r:0,mist:0,lv:0,done:false,banner:null,def:DEF[n],reveal:false};DEF[n].init(LV);cast=LV.cast;DEF[n].start(LV).catch(e=>{if(e!==STALE)console.error(e)})},
 draw(){bgDraw('l'+n,0);motes(45);if(!LV.done)DEF[n].draw(LV);drawCast();
  if(n<5&&!SV.secret[n-1]&&!LV.done){const[sx,sy]=SECRET_POS[n-1];coinTok(sx,sy,13,{a:.45+.35*Math.sin(T*3),glow:.8+.4*Math.sin(T*3),rot:T})}
},
 ui(){win('scroll',450,0,380,64);ink(LNAMES[n-1],640,32,28);for(let i=0;i<ROUNDS[n-1];i++)coinTok(640-(ROUNDS[n-1]-1)*17+i*34,82,12,{grey:i>=LV.r});
  btn('home',74,66,84,64,'⌂',()=>{go('map')},{always:1});if(!LV.done)btn('hint',1214,58,76,64,'?',()=>{if(!(talk&&/h$/.test(talk.k||'')))run(()=>DEF[n].hint(LV))},{fs:36});
  if(DEF[n].ui&&!LV.done)DEF[n].ui(LV);if(LV.done)endPanel(n)},
 tap(x,y){if(LV.done)return;if(n<5&&!SV.secret[n-1]&&!LV.lock){const[sx,sy]=SECRET_POS[n-1];if(Math.hypot(x-sx,y-sy)<Math.max(40,30/S)){LV.resume=true;go('secret',n);return}}if(DEF[n].tap)DEF[n].tap(LV,x,y)}}}
function banner(t,bad,y){LV.banner={t,bad,t0:T,y}}
async function roundDone(){LV.r++;LV.banner=null;if(LV.r>=ROUNDS[LV.n-1]){LV.done=true;LV.doneT=T;const st=LV.mist===0?3:LV.mist<=2?2:1;LV.stars=st;SV.stars[LV.n-1]=Math.max(SV.stars[LV.n-1],st);SV.open=Math.max(SV.open,Math.min(5,LV.n+1));save();cheer();const cx_=ctxNow();for(let i=0;i<3;i++)setTimeout(()=>{if(i<st&&alive(cx_)){SFX.star();burst(560+i*80,368,24,'spark',48)}},500+i*350);if(LV.n<5)await say('win');return true}return false}
function endPanel(n){win('frame',340,110,600,430);ink(n<5?'Игра пройдена!':'Флинт побеждён!',640,215,40,{col:'#8a4a08'});
 for(let i=0;i<3;i++){const k=ease((T-LV.doneT-.5-i*.35)*3);star(560+i*80,320,30,i<LV.stars&&k>0,k>0?.4+.6*k:1)}
 ink(LV.mist===0?'Без единой ошибки!':'Ошибок: '+LV.mist,640,420,28);
 btn('map',520,600,200,70,'Карта',()=>go('map'),{always:1});
 if(n<5)btn('next',770,600,220,70,'Дальше ›',()=>go('l'+(n+1)),{always:1,pulse:1});else btn('fin',770,600,220,70,'Финал ›',()=>go('fin'),{always:1,pulse:1})}
// ---------- общий движок «игра на двоих» ----------
function waitInput(L){return new Promise(r=>{L.inp=r})}
function give(L,v){if(L.inp&&!L.animB){const r=L.inp;L.inp=null;L.banner=null;L.flash=null;r(v)}}
function nameOf(n){return{mark:'Марк',mey:'Мэй',flint:'Флинт'}[n]}
function fmt(g){return g.t==='sub'?String(g.n):'('+g.x+', '+g.y+')'}
function explain(L,before,after,opp){const m=gMoves(before).filter(p=>!gWin(p))[0];
 if(before.t==='sub'){const K=before.k+1;const w=[1,2,3,4][Math.max(0,after.n%K-1)];
  if(m.n===0)return 'Можно было сразу взять '+before.n+' и забрать всё сразу! А теперь последнее заберёт '+nameOf(opp)+'.';
  return 'Ты оставил '+after.n+' — это не делится на '+K+'. '+nameOf(opp)+' возьмёт '+(after.n%K)+' и оставит '+(after.n-after.n%K)+'. Нужно было взять '+(before.n-m.n)+' и оставить '+m.n+'.'}
 return 'Корабль не на крестике: '+nameOf(opp)+' сможет приплыть на крестик. Лучше было плыть на мерцающую клетку.'}
// L.g — позиция, L.turn 'me'|'ai'. Возвращает true, если ребёнок взял последний / доплыл
// пока ребёнок в секретной комнате — партия ждёт, а не обрывается (иначе после возврата ИИ не ходит)
async function holdSec(L){while(scene==='secret'&&LV===L&&L.resume)await wait(150)}
async function playGame(L,opp,meFirst){L.turn=meFirst?'me':'ai';L.over=false;L.banner=null;
 while(true){if(gEnd(L.g)){L.over=true;return L.turn==='ai'}// ход перешёл к ИИ, значит конец сделал ребёнок
  await holdSec(L);if(scene!=='l'+L.n)return null;
  if(L.turn==='me'){const before=L.g;if(L.badFor!==before){L.badFor=before;L.bad={}}L.myTurn=true;const nxt=await waitInput(L);L.myTurn=false;L.flash=null;
   if(gWin(before)&&gWin(nxt)){L.mist++;L.lv=Math.max(0,L.lv-1);SFX.bad();oops('tim');L.bad[fmt(nxt)]=1;L.flash={g:gMoves(before).find(p=>!gWin(p)),t0:T};banner(explain(L,before,nxt,opp)+' Попробуй ещё раз!',true);sayNow('oops');continue}
   else{L.moveAnim(before,nxt);if(gWin(before)&&!gEnd(nxt)&&Math.random()<.35){SFX.ok();mood('tim','happy')}await wait(650)}
   L.g=nxt;L.turn='ai'}
  else{await wait(800);await holdSec(L);if(scene!=='l'+L.n)return null;const nxt=aiMove(L.g);swing(opp);L.moveAnim(L.g,nxt);L.g=nxt;L.turn='me';await wait(700)}}}
// ---------- куча (монеты / ядра) ----------
function pileSlots(n,cx,cy,sp,per,rowH){const o=[];for(let i=0;i<n;i++){const row=Math.floor(i/per),col=i%per,cnt=Math.min(per,n-row*per);o.push([cx+(col-(cnt-1)/2)*sp,cy-row*rowH])}return o}
function drawPile(L,spr_,h,cx,cy,sp,per,rowH){const n=L.g.n;const sl=pileSlots(n,cx,cy,sp,per,rowH);
 for(let i=sl.length-1;i>=0;i--){const[x,y]=sl[i];spr(spr_,x,y+Math.sin(T*2+i)*1.5,h,{rot:spr_==='coin'?Math.sin(i*1.7)*.15:0})}
 (L.fly||[]).forEach(f=>{const u=ease((T-f.t0)/.6);if(u>=1)return;spr(spr_,f.x+(f.tx-f.x)*u,f.y+(f.ty-f.y)*u-Math.sin(u*Math.PI)*120,h*(1-u*.3),{rot:u*6})});
 L.fly=(L.fly||[]).filter(f=>T-f.t0<.6)}
function pileAnim(L,cx,cy,sp,per,rowH){return(a,b)=>{const sl=pileSlots(a.n,cx,cy,sp,per,rowH);const tx=L.turn==='me'||L.myTurnAnim?160:1130;
 for(let i=b.n;i<a.n;i++){const[x,y]=sl[i];(L.fly=L.fly||[]).push({x,y,tx:L.turn==='me'?170:1110,ty:520,t0:T+(i-b.n)*.08})}SFX.clang()}}
function strip(L,k,max,y,maxW,cx){cx=cx||640;// «лестница секретов»: числа 0..max, крестики на проигрышных
 const n=Math.min(max,18),sp=Math.min(47,(maxW||1100)/(n+1));const x0=cx-n*sp/2;win('scroll',x0-60,y-38,n*sp+120,76,false,'strip');
 for(let i=0;i<=n;i++){const x=x0+i*sp,p=!subW(k,i);if(p)spr('xmark',x,y,sp*.95,{a:.85});txt(String(i),x,y,i===L.g.n?32:24,i===L.g.n?'#ffe066':p?'#ffd8c0':'#fff3d6',{st:'#3a1a06',lw:5,maxD:sp*.8})}}
function subLevel(n,o){DEF[n]={opp:o.opp,init(L){L.cast=[{n:'tim',x:110,y:712,h:230},{n:o.opp,x:1160,y:712,h:250,flip:1}];L.moveAnim=pileAnim(L,...o.pile)},
 newGame(L){const r=L.r;const pf=o.pf(r);const pool=pf?o.pP[Math.min(L.lv,2)]:o.pN[Math.min(L.lv,2)];L.g={t:'sub',k:o.k,n:pool[Math.floor(Math.random()*pool.length)]};L.pf=pf;L.fly=[]},
 async start(L){await this.loop(L)},
 async loop(L){while(L.r<ROUNDS[n-1]&&(await holdSec(L),scene==='l'+n)){if(o.quiz&&L.r===o.quiz.r){await this.quiz(L);continue}
   this.newGame(L);if(!L.introDone){L.introDone=1;say(o.intro).catch(()=>{})}if(L.pf)say(o.pfk).catch(()=>{});const res=await playGame(L,o.opp,!L.pf);if(res==null)return;
   if(res){burst(640,400,30,'spark',48);SFX.star();cheer();mood(o.opp,'laugh');await say(o.wk);L.lv++;if(await roundDone())return}
   else{SFX.bad();mood(o.opp,'laugh');sayNow(o.lk);if(!L.reveal){L.reveal=true;say(o.hk).catch(()=>{})}}}},
 async quiz(L){L.q={opts:o.quiz.opts,a:o.quiz.a,tried:{}};say(o.quiz.k).catch(()=>{});let v;while(true){v=await waitInput(L);if(v===o.quiz.a)break;L.mist++;L.q.tried[v]=1;SFX.bad();oops('tim');banner(o.quiz.why,true);sayNow(o.quiz.wk)}L.q=null;
  SFX.ok();cheer();banner(o.quiz.ok);await say(o.quiz.ok_k);await wait(500);L.banner=null;await roundDone()},
 async hint(L){L.reveal=true;await say(o.hk)},
 draw(L){if(!L.g)return;drawPile(L,...o.draw);win('plank',1010,150,250,70);txt((o.k===2?'Монет: ':'Ядер: ')+L.g.n,1135,186,30,'#fff0c8',{st:'#2a1004'});
  if(L.reveal)strip(L,o.k,Math.max(L.g.n,o.k===2?12:16),o.stripY,800);
  if(L.q){win('frame',300,150,680,330);para(LINES[o.quiz.k].t,640,230,560,28)}
  if(L.turn||L.choose||L.myTurn)win('plank',150,6,250,62);if(L.turn||L.choose||L.myTurn)txt(L.myTurn?'Твой ход':L.over?'':'Ходит '+nameOf(o.opp),275,37,28,L.myTurn?'#ffe066':'#fff0c8',{st:'#2a1004',maxW:200})},
 ui(L){if(L.q){L.q.opts.forEach((t,i)=>btn('q'+i,420+i*220,400,200,70,t,()=>{if(!L.q.tried[i])give(L,i)},{fs:28,dis:!!L.q.tried[i]}));return}
  if(L.myTurn&&!L.done)for(let t=1;t<=o.k;t++)btn('t'+t,640+(t-(o.k+1)/2)*230,650,200,74,'Взять '+t,()=>{if(t<=L.g.n)give(L,{...L.g,n:L.g.n-t})},{dis:t>L.g.n||!!(L.bad&&L.bad[String(L.g.n-t)]),fs:32})},
 info(L){return{r:L.r,g:L.g,my:!!L.myTurn,q:L.q?L.q.a:null}}};levelScene(n)}
subLevel(1,{opp:'mark',k:2,intro:'l1i',hk:'l1h',wk:'l1win',lk:'l1lose',pfk:'l1pf',pf:r=>r===2,
 pN:[[4,5,7],[7,8,10],[11,13,14,16]],pP:[[6],[9],[12,15]],pile:[640,470,64,9,48],draw:['coin',62,640,470,64,9,48],stripY:528});
subLevel(2,{opp:'mey',k:3,intro:'l2i',hk:'l2h',wk:'l2win',lk:'l2lose',pfk:'l1pf',pf:r=>r===3,
 pN:[[5,6,7],[9,10,11],[13,14,15,17]],pP:[[8],[12],[16]],pile:[640,560,74,8,58],draw:['ball',70,640,560,74,8,58],stripY:445,
 quiz:{r:1,k:'l2q',opts:['5, 10, 15','6, 12, 18','4, 8, 12'],a:1,wk:'l2qw',ok_k:'l2qok',why:'Если брать можно от 1 до 5, соперник и ты вместе всегда можете добрать до 6. Значит, проигрышные — кратные шести.',ok:'Верно! Можно брать до 5 → оставляй кратное 6 (5 + 1).'}});
DEF[2].opp='mey';
// ---------- УРОВЕНЬ 3: тарелки, симметрия ----------
const TC={x:640,y:430,R:118,K:.5};function spotXY(i){return[TC.x+SXY[i][0]*TC.R,TC.y+SXY[i][1]*TC.R*TC.K]}
DEF[3]={init(L){L.cast=[{n:'tim',x:110,y:712,h:230},{n:'mark',x:1160,y:712,h:250,flip:1}];L.ghost=true},
 async start(L){L.b=0;L.plates=[];say('l3i').catch(()=>{});await this.loop(L)},
 async loop(L){while(L.r<ROUNDS[2]&&(await holdSec(L),scene==='l3')){L.b=0;L.plates=[];L.lastAI=null;L.ghost=L.r===0||L.reveal;const res=await this.game(L);if(res==null)return;
   if(res){SFX.star();cheer();mood('mark','laugh');await say('l3win');if(L.r===0)await say('l3d');L.lv++;if(await roundDone())return}else{SFX.bad();sayNow('l3lose');L.reveal=true;say('l3h').catch(()=>{})}}},
 async game(L){L.banner=null;let me=true;L.turn='me';while(true){await holdSec(L);if(scene!=='l3')return null;const lg=tLegal(L.b);if(!lg.length)return !me;
   if(me){L.myTurn=true;const i=await waitInput(L);L.myTurn=false;const before=L.b,after=L.b|CF[i];
    if(tWin(before)&&tWin(after)){L.mist++;SFX.bad();oops('tim');const good=lg.find(j=>!tWin(before|CF[j]));L.flash={i:good,t0:T};
     banner(L.plates.length===0?'Первую тарелку ставь в центр стола — он сам себе зеркало!':'Это место не напротив тарелки Марка. Ставь симметрично через центр — туда, где мерцает.',true);sayNow('oops');continue}
    else{this.put(L,i,'me');await wait(600)}}
   else{await wait(850);const lg2=tLegal(L.b);const good=lg2.filter(j=>!tWin(L.b|CF[j]));const pool=good.length?good:lg2;const i=pool[Math.floor(Math.random()*pool.length)];swing('mark');this.put(L,i,'ai');L.lastAI=i;
    if(L.ghost&&tLegal(L.b).includes(mirrorOf(i))&&!L.mirSaid&&L.plates.length<=3){L.mirSaid=1;await say('l3mir')}await wait(400)}
   me=!me}},
 put(L,i,who){L.b|=CF[i];L.plates.push({i,who,t0:T});SFX.clang();const[x,y]=spotXY(i);burst(x,y,8,'spark',48,.4)},
 async hint(L){L.reveal=true;L.ghost=true;await say('l3h')},
 draw(L){const tt=UA.tabletop;if(okI(tt))X.drawImage(tt,TC.x-330,TC.y-170,660,340);
  const lg=L.b!=null?tLegal(L.b):[];if(L.myTurn)lg.forEach(i=>{const[x,y]=spotXY(i);X.save();X.translate(x,y);X.scale(1,TC.K);spr('plate',0,0,92,{a:.22+.08*Math.sin(T*3+i)});X.restore()});
  (L.plates||[]).forEach(p=>{const[x,y]=spotXY(p.i);const u=ease((T-p.t0)/.35);X.save();X.translate(x,y-(1-u)*60);X.scale(1,TC.K);spr('plate',0,0,96);X.restore();spr(p.who==='me'?'coin':'xmark',x,y-4,26,{a:.9})});
  if(L.myTurn&&L.ghost){const target=L.plates.length===0?CENTER:L.lastAI!=null?mirrorOf(L.lastAI):-1;
   if(target>=0&&lg.includes(target)){const[x,y]=spotXY(target);X.save();X.translate(x,y);X.scale(1,TC.K);spr('plate',0,0,100,{a:.55+.25*Math.sin(T*5),glow:1});X.restore();
    if(L.lastAI!=null){const[ax,ay]=spotXY(L.lastAI);for(let k=0;k<=12;k++){const u=k/12;coinTok(ax+(x-ax)*u,ay+(y-ay)*u,5,{a:.5+.4*Math.sin(T*6-k)})}spr('compass',TC.x,TC.y,34,{a:.9,rot:T})}}}
  if(L.flash&&T-L.flash.t0<5){const[x,y]=spotXY(L.flash.i);X.save();X.translate(x,y);X.scale(1,TC.K);spr('plate',0,0,104,{a:.5+.4*Math.sin(T*8),glow:1.5});X.restore()}
  if(L.turn||L.choose||L.myTurn)win('plank',30,150,250,70);if(L.turn||L.choose||L.myTurn)txt(L.myTurn?'Твой ход':'Ходит Марк',155,185,28,L.myTurn?'#ffe066':'#fff0c8',{st:'#2a1004',maxW:200})},
 tap(L,x,y){if(!L.myTurn)return;let best=-1,bd=1e9;tLegal(L.b).forEach(i=>{const[sx,sy]=spotXY(i);const d=Math.hypot(x-sx,(y-sy)/TC.K);if(d<bd){bd=d;best=i}});if(best>=0&&bd<TC.R*.5)give(L,best)},
 info(L){return{r:L.r,b:L.b,my:!!L.myTurn,best:L.b!=null?tLegal(L.b).find(j=>!tWin(L.b|CF[j])):null,legal:L.b!=null?tLegal(L.b):[]}}};levelScene(3);
// ---------- УРОВЕНЬ 4: корабль на карте ----------
const GB={x:668,y:432,c:108};function cellXY(x,y,gb){gb=gb||GB;return[gb.x+(x-(GW-1)/2)*gb.c,gb.y+((GH-1)/2-y)*gb.c]}
function drawGrid(L,gb){gb=gb||GB;const g=L.g;if(!g)return;const reach=L.myTurn?gMoves(g).filter(p=>!(L.bad&&L.bad[fmt(p)])):[];const P=gridP(g.rule);
 for(let x=0;x<GW;x++)for(let y=0;y<GH;y++){const[cx,cy]=cellXY(x,y,gb);const r=reach.some(p=>p.x===x&&p.y===y);X.save();X.globalAlpha*=r?1:.45;if(r){X.globalCompositeOperation='source-over'}win('frame',cx-gb.c*.47,cy-gb.c*.47,gb.c*.94,gb.c*.94,0,'cell');X.restore();if(r)spr('coin',cx,cy,gb.c*.28,{a:.55+.3*Math.sin(T*4+x+y),glow:1});
  if(L.reveal&&!P[x+','+y]&&!(x===0&&y===0))spr('xmark',cx,cy,gb.c*.7,{a:.75})}
 const[tx,ty]=cellXY(0,0,gb);spr('chest',tx,ty-6,gb.c*1.05);
 if(L.flash&&T-L.flash.t0<5&&L.flash.g){const[fx,fy]=cellXY(L.flash.g.x,L.flash.g.y,gb);spr('coin',fx,fy,gb.c*.6,{a:.6+.4*Math.sin(T*8),glow:1.5})}
 let[sx,sy]=cellXY(g.x,g.y,gb);if(L.sa){const u=ease((T-L.sa.t0)/.55);if(u<1){const[ax,ay]=cellXY(L.sa.a.x,L.sa.a.y,gb);sx=ax+(sx-ax)*u;sy=ay+(sy-ay)*u}}
 spr('ship',sx,sy-4+Math.sin(T*2.5)*3,gb.c*1.15,{rot:Math.sin(T*1.8)*.06})}
function gridAnim(L){return(a,b)=>{L.sa={a,t0:T};SFX.whoosh();setTimeout(()=>{const[x,y]=cellXY(b.x,b.y,L.gb);drops(x,y+20,10)},450)}}
function gridTap(L,x,y,gb){if(!L.myTurn)return;gb=gb||GB;const m=gMoves(L.g);let best=null,bd=1e9;m.forEach(p=>{if(L.bad&&L.bad[fmt(p)])return;const[cx,cy]=cellXY(p.x,p.y,gb);const d=Math.hypot(x-cx,y-cy);if(d<bd){bd=d;best=p}});if(best&&bd<gb.c*.6)give(L,best)}
const R4=[{rule:'king',pf:false,starts:[[5,3],[6,3],[3,4],[5,4]]},{rule:'king',pf:true,starts:[[6,4],[4,4],[6,2]]},{rule:'rook',pf:false,starts:[[5,3],[6,2],[4,1],[6,4]]},{rule:'rook',pf:true,starts:[[4,4],[3,3]]}];
DEF[4]={init(L){L.cast=[{n:'tim',x:100,y:712,h:220},{n:'mey',x:1170,y:712,h:250,flip:1}];L.moveAnim=gridAnim(L);L.gb=GB},
 async start(L){L.g={t:'grid',rule:'king',x:5,y:3};say('l4i').catch(()=>{});await this.loop(L)},
 async loop(L){let rule='';while(L.r<ROUNDS[3]&&(await holdSec(L),scene==='l4')){const R=R4[L.r];if(R.rule!==rule){if(rule){await say('l4r');L.reveal=false}rule=R.rule}
   const st=R.starts.filter(([x,y])=>R.pf?!gWin({t:'grid',rule:R.rule,x,y}):gWin({t:'grid',rule:R.rule,x,y}));const[x,y]=st[Math.floor(Math.random()*st.length)];L.g={t:'grid',rule:R.rule,x,y};
   if(R.pf)say('l1pf').catch(()=>{});const res=await playGame(L,'mey',!R.pf);if(res==null)return;
   if(res){SFX.star();cheer();mood('mey','laugh');await say('l4win');if(!L.shownMap){L.shownMap=1;L.reveal=true;await say('l4map');await wait(1500)}L.lv++;if(await roundDone())return}
   else{SFX.bad();sayNow('l4lose');L.reveal=true;say(rule==='king'?'l4h':'l4rh').catch(()=>{})}}},
 async hint(L){L.reveal=true;await say(L.g&&L.g.rule==='rook'?'l4rh':'l4h')},
 draw(L){drawGrid(L);if(L.turn||L.choose||L.myTurn)win('plank',150,6,250,62);if(L.turn||L.choose||L.myTurn)txt(L.myTurn?'Твой ход':'Ходит Мэй',275,37,28,L.myTurn?'#ffe066':'#fff0c8',{st:'#2a1004'});
  if(L.g){win('scroll',1046,150,226,150);para(L.g.rule==='king'?'На 1 клетку влево, вниз или наискосок':'Влево или вниз на сколько угодно',1159,225,170,22)}},
 tap(L,x,y){gridTap(L,x,y)},
 info(L){return{r:L.r,g:L.g,my:!!L.myTurn}}};levelScene(4);
// ---------- УРОВЕНЬ 5: Капитан Флинт ----------
const BOSS_GB={x:620,y:356,c:88};
DEF[5]={init(L){L.cast=[{n:'tim',x:100,y:712,h:220},{n:'flint',x:1140,y:712,h:330,flip:1}];L.hp=3;L.kinds=shuffle(['sub2','sub3','king','rook']);L.gb=BOSS_GB},
 async start(L){await this.loop(L)},
 newPos(L){const kd=L.kinds[L.r%4];const wantP=Math.random()<.5;let g;
  if(kd.startsWith('sub')){const k=+kd[3];const c=[];for(let n=9;n<=17;n++)if(!subW(k,n)===wantP)c.push(n);g={t:'sub',k,n:c[Math.floor(Math.random()*c.length)]};L.moveAnim=pileAnim(L,640,560,66,9,54)}
  else{const c=[];for(let x=2;x<GW;x++)for(let y=2;y<GH;y++)if(!gWin({t:'grid',rule:kd,x,y})===wantP)c.push([x,y]);const p=c[Math.floor(Math.random()*c.length)];g={t:'grid',rule:kd,x:p[0],y:p[1]};L.moveAnim=gridAnim(L)}
  L.g=g;L.kd=kd},
 async loop(L){while(L.r<ROUNDS[4]&&(await holdSec(L),scene==='l5')){this.newPos(L);if(!L.introDone){L.introDone=1;say('l5i').catch(()=>{})}say({sub2:'gc',sub3:'gb',king:'gk',rook:'gr'}[L.kd]).catch(()=>{});
   let first;while(true){L.choose=true;const v=await waitInput(L);L.choose=false;const right=gWin(L.g);
    if(v!==right){L.mist++;SFX.bad();oops('tim');mood('flint','laugh');banner(right?'Позиция выигрышная: ходи первым и оставь Флинту проигрышную!':'Позиция проигрышная: кто ходит — проиграет. Отдай ход Флинту!',true);sayNow('l5wch');continue}
    first=v;L.banner=null;SFX.ok();await say('l5ok');break}
   const res=await playGame(L,'flint',first);if(res==null)return;
   if(res){L.hp--;const c=cast.find(c=>c.n==='flint');if(c)c.hit=T;shake=10;SFX.hit();burst(1140,450,30,'spark',48);if(L.hp>0)await say('l5hit');else await say('l5end');if(await roundDone())return}
   else{SFX.bad();mood('flint','laugh');sayNow('l5lose');L.reveal=true}}},
 async hint(L){L.reveal=true;await say('l5h')},
 draw(L){if(!L.g)return;if(L.g.t==='sub'){drawPile(L,L.g.k===2?'coin':'ball',L.g.k===2?58:64,640,560,66,9,54);win('plank',515,100,250,62);txt((L.g.k===2?'Монет: ':'Ядер: ')+L.g.n,640,132,28,'#fff0c8',{st:'#2a1004'});if(L.reveal)strip(L,L.g.k,Math.max(L.g.n,12),448,600,600)}
  else{win('frame',BOSS_GB.x-GW*BOSS_GB.c/2-30,BOSS_GB.y-GH*BOSS_GB.c/2-22,GW*BOSS_GB.c+60,GH*BOSS_GB.c+44);drawGrid(L,BOSS_GB)}
  win('scroll',990,150,280,130);para({sub2:'Берём 1 или 2',sub3:'Берём от 1 до 3',king:'На 1 клетку влево, вниз или наискосок',rook:'Влево или вниз на сколько угодно'}[L.kd],1130,215,210,22);
  if(L.turn||L.choose)win('plank',150,6,250,62);if(L.turn||L.choose)txt(L.choose?'Кто ходит?':L.myTurn?'Твой ход':'Ходит Флинт',275,37,28,L.myTurn||L.choose?'#ffe066':'#fff0c8',{st:'#2a1004'});
  win('scroll',150,6,250,62);for(let i=0;i<3;i++)spr('chest',210+i*65,37,40,{grey:i>=L.hp})},
 ui(L){if(L.choose){btn('first',500,656,240,64,'Хожу первым',()=>give(L,true),{fs:28});btn('second',780,656,240,64,'Ходи, Флинт',()=>give(L,false),{fs:28})}
  else if(L.myTurn&&L.g.t==='sub')for(let t=1;t<=L.g.k;t++)btn('t'+t,640+(t-(L.g.k+1)/2)*230,650,200,74,'Взять '+t,()=>{if(t<=L.g.n)give(L,{...L.g,n:L.g.n-t})},{dis:t>L.g.n||!!(L.bad&&L.bad[String(L.g.n-t)]),fs:32})},
 tap(L,x,y){if(L.g&&L.g.t==='grid')gridTap(L,x,y,BOSS_GB)},
 info(L){return{r:L.r,g:L.g,my:!!L.myTurn,choose:!!L.choose,hp:L.hp}}};levelScene(5);
// ---------- тайные комнаты ----------
const SECRETS=[{k:'s1',o:['1','2','Нельзя'],a:1,why:'20 не делится на 3. Возьми 2 — останется 18, кратное трём!'},
 {k:'s2',o:['4, 8, 12','5, 10, 15','6, 12, 18'],a:1,why:'Берём до 4 — значит, проигрышные кратны 5 (4 + 1).'},
 {k:'s3',o:['1','2','3'],a:0,why:'Возьми 1 — останется 12, это кратно 4!'},
 {k:'s4',o:['(3, 2)','(4, 2)','(5, 4)'],a:1,why:'Проигрышные клетки — где оба числа чётные: (4, 2).'}];
let SEC=null;
SC.secret={enter(n){SEC={n,i:n-1,why:null};cast=[{n:'mey',x:150,y:712,h:250}];run(async()=>{await say('sec');await say(SECRETS[n-1].k)})},
 draw(){bgDraw('l5',.35);motes(45);const s=SECRETS[SEC.i];win('frame',260,50,760,500);ink('Тайная комната',640,130,44,{col:'#8a4a08'});
  para(LINES[s.k].t,640,215,600,27);
  if(SEC.why)para(SEC.why,640,440,600,23,{col:SEC.ok?'#1a5a10':'#8a1a08'});
  if(SEC.ok)coinTok(640,330,60,{sc:1+.1*Math.sin(T*5),glow:1.6,rot:Math.sin(T*3)*.3});drawCast()},
 ui(){const s=SECRETS[SEC.i];if(!SEC.ok)s.o.forEach((o,i)=>btn('o'+i,430+i*210,335,165,70,o,()=>ansS(i),{fs:o.length>3?26:38}));
  btn('back',1170,50,170,60,'‹ Назад',()=>go('l'+SEC.n),{always:1,fs:28})}};
function ansS(i){if(SEC.lock)return;const s=SECRETS[SEC.i];run(async()=>{if(i!==s.a){SFX.bad();oops('mey');SEC.why=s.why;sayNow('secw');return}
 SEC.lock=1;SEC.ok=1;SEC.why=s.why;SV.secret[SEC.i]=1;save();SFX.star();burst(640,330,50,'spark',48);cheer();await say('secok');await wait(600);go('l'+SEC.n)})}
// ---------- финал ----------
SC.fin={enter(){cast=[{n:'tim',x:240,y:705,h:300},{n:'mark',x:430,y:705,h:270},{n:'mey',x:600,y:705,h:270},{n:'flint',x:1000,y:712,h:380,flip:1}];
 run(async()=>{cheer();await say('fin');await say('l5end')})},
 draw(){bgDraw('l5',.05);motes(45);if(Math.random()<.2)burst(rnd(100,1180),rnd(80,300),8,'spark',48,.6);if(Math.random()<.01)cheer();
  win('scroll',30,20,520,120);ink('Остров покорён!',290,80,54,{col:'#7a3a0a'});const st=SV.stars.reduce((a,b)=>a+b,0);
  win('plank',30,150,520,66);txt('Дублонов: '+st+' из 15 · редких: '+SV.secret.reduce((a,b)=>a+b,0)+' из 4',290,183,24,'#fff0c8',{st:'#2a1004',lw:4});spr('chest',820,600,150,{glow:1});drawCast()},
 ui(){btn('map',1150,60,160,60,'Карта',()=>go('map'),{always:1,fs:28})}};
// ---------- API для тестов ----------
G.info=()=>LV&&scene[0]==='l'?LV.def.info(LV):scene==='secret'?{sec:SEC.i,a:SECRETS[SEC.i].a}:{};
G.give=v=>give(LV,v);G.LV=()=>LV;G.cast=()=>cast;G.T=()=>T;
G.best=()=>{const L=LV;if(!L)return null;if(L.n===3){const lg=tLegal(L.b);return lg.find(j=>!tWin(L.b|CF[j]))??lg[0]}if(L.choose)return gWin(L.g);if(L.q)return L.q.a;const m=gMoves(L.g);return m.find(p=>!gWin(p))||m[0]};
G.worst=()=>{const L=LV;if(L.n===3){const lg=tLegal(L.b);return lg.find(j=>tWin(L.b|CF[j]))??lg[0]}if(L.choose)return !gWin(L.g);if(L.q)return(L.q.a+1)%3;const m=gMoves(L.g);return m.find(p=>gWin(p))||m[0]};
G.waiting=()=>!!(LV&&LV.inp);G.secretXY=()=>{const p=SECRET_POS[LV.n-1];return{x:p[0],y:p[1]}};
G.selftest=()=>{const e=[];for(let k=1;k<=5;k++)for(let n=0;n<=60;n++)if(subW(k,n)!==(n%(k+1)!==0))e.push('sub'+k+':'+n);
 for(let x=0;x<GW;x++)for(let y=0;y<GH;y++){if(gridP('king')[x+','+y]!==!(x%2===0&&y%2===0))e.push('king'+x+y);if(gridP('rook')[x+','+y]!==(x!==y))e.push('rook'+x+y)}
 if(!tWin(0)||tWin(CF[CENTER]))e.push('table');for(let i=0;i<19;i++)if(i!==CENTER&&(CF[i]>>mirrorOf(i)&1))e.push('mir'+i);return e};
G.tapFor=v=>{const L=LV;if(L.n===3)return spotXY(v);if(v&&v.t==='grid'){return cellXY(v.x,v.y,L.gb)}return null};
G.mp=()=>MP;
