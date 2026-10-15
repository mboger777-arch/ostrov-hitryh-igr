'use strict';
// ===== Рисованная графика: всё из нарисованных спрайтов (окна 9-slice, кнопки-доски и компас, дублоны, ядра, тарелки, частицы) =====
const UA={};function ua(n){const i=new Image();i.src='assets/ui/'+n+'.png';UA[n]=i;return i}
['coin','chest','ball','balls','plate','ship','xmark','plank','compass','frame','scroll','bubble','logo','star','shadow','cell','tabletop'].forEach(ua);
const SPL=[];for(let i=0;i<7;i++)SPL.push(ua('p_splash'+i));
const okI=i=>i&&i.complete&&i.naturalWidth>0;
const GREY={};function grey(n){if(GREY[n])return GREY[n];const i=UA[n];if(!okI(i))return null;const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const g=c.getContext('2d');g.drawImage(i,0,0);
 const d=g.getImageData(0,0,c.width,c.height),p=d.data;for(let k=0;k<p.length;k+=4){const l=(p[k]*.3+p[k+1]*.55+p[k+2]*.15)*.62+30;p[k]=l;p[k+1]=l*.95;p[k+2]=l*.88}g.putImageData(d,0,0);return GREY[n]=c}
function dimg(n,x,y,w,h,o){o=o||{};const i=o.grey?grey(n):UA[n];if(!i||(i.complete===false)||(i.naturalWidth===0))return;X.drawImage(i,x,y,w,h)}
function spr(n,x,y,h,o){o=o||{};const i=UA[n];if(!okI(i))return 0;const w=h*i.naturalWidth/i.naturalHeight;X.save();X.translate(x,y);if(o.rot)X.rotate(o.rot);if(o.a!=null)X.globalAlpha*=o.a;if(o.sc)X.scale(o.sc,o.sc);
 if(o.glow){X.save();X.globalCompositeOperation='lighter';X.globalAlpha*=.25*o.glow;X.drawImage(i,-w*.6,-h*.6,w*1.2,h*1.2);X.restore()}
 if(o.dark)X.filter='brightness('+o.dark+') saturate(.7)';dimg(n,-w/2,-h/2,w,h,{grey:o.grey});X.restore();return w}
function nine(n,x,y,w,h,l,t,r,b,flip,cap){if(X.globalAlpha>=.05){FB.c.push({n:NTAG||n,b:lbox(x,y,x+w,y+h)});if(AUD)AUD.c.push({n:NTAG||n,b:tbox(x,y,x+w,y+h)})}const i=UA[n];if(!okI(i))return;const iw=i.naturalWidth,ih=i.naturalHeight;const k=Math.min(w/iw,h/ih,cap||1.6);
 const sx=[0,l*iw,iw-r*iw,iw],sy=[0,t*ih,ih-b*ih,ih],dx=[0,l*iw*k,w-r*iw*k,w],dy=[0,t*ih*k,h-b*ih*k,h];
 X.save();X.translate(x,y);if(flip){X.translate(w,0);X.scale(-1,1)}
 for(let a=0;a<3;a++)for(let c=0;c<3;c++){const sw=sx[c+1]-sx[c],sh=sy[a+1]-sy[a],ddw=dx[c+1]-dx[c],ddh=dy[a+1]-dy[a];if(sw>0&&sh>0&&ddw>0&&ddh>0)X.drawImage(i,sx[c],sy[a],sw,sh,dx[c]-.5,dy[a]-.5,ddw+1,ddh+1)}
 X.restore()}
const SL={frame:[.2,.26,.2,.26,1.3],scroll:[.2,.2,.2,.2,1.2],bubble:[.3,.3,.3,.42,1.1],plank:[.3,.3,.3,.3,1]};
let NTAG=null;function win(n,x,y,w,h,flip,tag){const s=SL[n];NTAG=tag||null;nine(n,x,y,w,h,s[0],s[1],s[2],s[3],flip,s[4]);NTAG=null}
function panel(x,y,w,h){win('frame',x,y,w,h)}
// ---- текст: сказочный шрифт, обводка, тень, градиент ----
function hx(c){if(typeof c!=='string'||c[0]!=='#')return null;if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function mix(a,b,k){return`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')})`}
// оптический центр: середина между линией шрифта и высотой прописных (измеряется по 'Н' для каждого кегля)
const CAPH={};function capHalf(size){if(CAPH[size]==null){X.font=size+'px '+FONT;X.textBaseline='alphabetic';const m=X.measureText('Н');CAPH[size]=m.actualBoundingBoxAscent>0?m.actualBoundingBoxAscent/2:size*.35;if(!document.fonts||document.fonts.check(size+'px FairyLogo')===false)delete CAPH[size]}return CAPH[size]!=null?CAPH[size]:size*.35}
// ---- аудит текста (для автотеста): рамки текста/контейнеров/героев в CSS-пикселях ----
let AUD=null,FB={c:[],t:[],h:[]},FBP=FB;function frameBoxes(){FBP=FB;FB={c:[],t:[],h:[]}}
function lbox(x0,y0,x1,y1){const b=tbox(x0,y0,x1,y1);return[(b[0]-OX)/S,(b[1]-OY)/S,(b[2]-OX)/S,(b[3]-OY)/S]}
const PADS={plank:[.08,.14,.14],scroll:[.09,.16,.16],frame:[.08,.09,.09],bubble:[.06,.07,.25],coinbtn:[.15,.15,.15],cell:[.06,.06,.06]};
function innerOf(c){const b=c.b,w=b[2]-b[0],h=b[3]-b[1],p=PADS[c.n]||[.07,.1,.1];const px=Math.max(4,Math.min(w*p[0],h*.55));return[b[0]+px,b[1]+h*p[1],b[2]-px,b[3]-h*p[2]]}
// подгонка кегля: текст целиком внутри своего нарисованного контейнера (с полями)
function fitK(t,x,y,w,asc,desc,al){const m=X.getTransform(),k=Math.hypot(m.a,m.b)/(DPR*S);const P=new DOMPoint(x,y-(asc-desc)/2).matrixTransform(m),lx=(P.x/DPR-OX)/S,ly=(P.y/DPR-OY)/S;
 let best=null;for(const c of FB.c){const b=c.b;if(lx>=b[0]&&lx<=b[2]&&ly>=b[1]&&ly<=b[3]&&(!best||(b[2]-b[0])*(b[3]-b[1])<(best.b[2]-best.b[0])*(best.b[3]-best.b[1])))best=c}
 if(!best)return 1;const I=innerOf(best);const aw=al==='left'?(I[2]-lx):al==='right'?(lx-I[0]):2*Math.min(lx-I[0],I[2]-lx);const ah=2*Math.min(ly-I[1],I[3]-ly);
 return clamp(Math.min(aw/(w*k),ah/((asc+desc)*k)),.3,1)}
function tbox(x0,y0,x1,y1){const m=X.getTransform();const P=[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m));const xs=P.map(p=>p.x/DPR),ys=P.map(p=>p.y/DPR);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]}
function audT(t,x,y,w,asc,desc,al){if(X.globalAlpha<.05)return;const l=al==='left'?x:al==='right'?x-w:x-w/2;FB.t.push({t,bub:AUDBUB,b:lbox(l,y-asc,l+w,y+desc)});if(AUD)AUD.t.push({t,b:tbox(l,y-asc,l+w,y+desc)})}let AUDBUB=0;
// цифры: не меньше ~28px высоты глифа на экране (телефон), остальной текст — как задан
const DIGIT_PX=28;function txt(t,x,y,size,col,o){o=o||{};t=String(t);if(!o._seg&&(/^\d+$/.test(t)||/^[^\d]{1,20}\s\d+(\s?(\/|из)\s?\d+)?$/.test(t))){if(o.maxW){X.font=size+'px '+FONT;const mw=X.measureText(t).width;if(mw>o.maxW)size=Math.floor(size*o.maxW/mw)}
  let D=Math.min(Math.max(size,Math.ceil(DIGIT_PX/(.72*S))),Math.round(size*2.3));if(D>size){const runs=t.match(/\d+|\D+/g).map(r=>({r,d:/\d/.test(r)}));
   if(o.maxD){X.font=D+'px '+FONT;const w=Math.max(...runs.filter(q=>q.d).map(q=>X.measureText(q.r).width));if(w>o.maxD)D=Math.max(size,Math.floor(D*o.maxD/w))}
   if(D>size){const mk=()=>{runs.forEach(q=>{q.s=q.d?D:size;X.font=q.s+'px '+FONT;q.w=X.measureText(q.r).width});return runs.reduce((a,q)=>a+q.w,0)};let tw=mk();{X.font=D+'px '+FONT;const m0=X.measureText('0'),ff=o.noFit?1:fitK(t,x,y+capHalf(D),tw,m0.actualBoundingBoxAscent,m0.actualBoundingBoxDescent,o.al||'center');if(ff<1){size=Math.max(8,Math.floor(size*ff));D=Math.max(size,Math.floor(D*ff));tw=mk()}}let cx=o.al==='left'?x:o.al==='right'?x-tw:x-tw/2;
    {X.font=D+'px '+FONT;const mm=X.measureText('0');audT(t,cx,y+capHalf(D),tw,mm.actualBoundingBoxAscent,mm.actualBoundingBoxDescent,'left')}runs.forEach(q=>{txt(q.r,cx,y,q.s,col,{...o,al:'left',maxW:0,_seg:1,lw:o.lw?o.lw*q.s/size:0});cx+=q.w});return}}}
 if(o.maxW){X.font=size+'px '+FONT;const mw=X.measureText(t).width;if(mw>o.maxW)size=Math.floor(size*o.maxW/mw)}if(!o._seg&&!o.noFit){X.font=size+'px '+FONT;const m=X.measureText(t),c0=capHalf(size),ff=fitK(t,x,y+c0,m.width,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent,o.al||'center');if(ff<1)size=Math.max(8,Math.floor(size*ff))}const ch=capHalf(size);X.font=size+'px '+FONT;X.textAlign=o.al||'center';X.textBaseline='alphabetic';y+=ch;X.lineJoin='round';
 const c=hx(col||'#fff');X.save();
 if(o.st!==0){X.shadowColor='rgba(0,0,0,.5)';X.shadowBlur=size*.16;X.shadowOffsetY=size*.06;X.lineWidth=o.lw||Math.max(3,size*.17);X.strokeStyle=o.st||'#3a1a06';X.strokeText(t,x,y);X.shadowColor='transparent'}
 if(c){const g=X.createLinearGradient(0,y-ch-size*.5,0,y-ch+size*.45);g.addColorStop(0,mix(c,[255,255,255],.6));g.addColorStop(.5,mix(c,[255,255,255],.08));g.addColorStop(1,mix(c,[40,20,0],.25));X.fillStyle=g}else X.fillStyle=col;
 X.fillText(t,x,y);if(!o._seg){const m=X.measureText(t);audT(t,x,y,m.width,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent,o.al||'center')}X.restore()}
const INK='#4a2208',INKST='rgba(255,240,205,.85)';
function ink(t,x,y,s,o){o=o||{};txt(t,x,y,s,o.col||'#5a2a0a',{st:o.st||INKST,lw:o.lw||Math.max(3,s*.14),al:o.al})}
function para(t,x,y,maxW,s,o){X.font=s+'px '+FONT;const L=wrap(t,maxW),lh=s*1.2;L.forEach((l,i)=>ink(l,x,y+(i-(L.length-1)/2)*lh,s,o));return L.length*lh}
// ---- кнопки: доска с канатами (широкие), дублон / компас (круглые) ----
function btn(id,x,y,w,h,label,fn,o){o=o||{};UI.push({id,x,y,w,h,fn,always:o.always,dis:o.dis});const hov=Math.abs(PX-x)<w/2&&Math.abs(PY-y)<h/2;const pr=o.pulse?1+Math.sin(T*5)*.04:1;
 X.save();X.translate(x,y);const sc=pr*(hov?1.06:1);X.scale(sc,sc);if(o.dis)X.globalAlpha*=.55;
 const round=w<=h*1.45;
 if(round){const d=Math.max(w,h)*1.25;
  if(label==='⌂'){const c=UA.compass;if(okI(c)){const ww=d*1.25,hh=ww*c.naturalHeight/c.naturalWidth;X.rotate(Math.sin(T*1.2)*.04);dimg('compass',-ww/2,-hh/2,ww,hh)}}
  else{FB.c.push({n:'coinbtn',b:lbox(-d/2,-d/2,d/2,d/2)});if(AUD)AUD.c.push({n:'coinbtn',b:tbox(-d/2,-d/2,d/2,d/2)});dimg('coin',-d/2,-d/2,d,d*UA.coin.naturalHeight/Math.max(1,UA.coin.naturalWidth),{grey:o.dis});X.save();X.globalAlpha*=.5;dimg('coin',-d*.33,-d*.33,d*.66,d*.66);X.restore();txt(label,0,0,o.fs||d*.5,'#fff3c0',{st:'#4a2600',lw:(o.fs||d*.5)*.2})}}
 else{const hh=h*1.3,ww=w*1.15;win('plank',-ww/2,-hh/2,ww,hh);const fs=o.fs||Math.min(h*.5,34);txt(label,0,0,fs,'#fff0c8',{st:'#2a1004',lw:fs*.18,maxW:ww*.74})}
 X.restore()}
// ---- звёзды-дублоны ----
function star(x,y,r,on,sc){const s=(sc||1)*r*2.4;X.save();X.translate(x,y);if(on){X.save();X.globalCompositeOperation='lighter';X.globalAlpha*=.3+.1*Math.sin(T*4+x);dimg('coin',-s*.65,-s*.65,s*1.3,s*1.3);X.restore()}
 dimg('coin',-s/2,-s/2,s,s,{grey:!on});X.restore()}
function coinTok(x,y,r,o){o=o||{};spr('coin',x,y,r*2,{grey:o.grey,dark:o.dark,a:o.a,rot:o.rot,glow:o.glow,sc:o.sc})}
// ---- частицы: нарисованные дублоны-искры, брызги ----
function drawParticles(){for(const p of PS){X.save();X.globalAlpha=Math.min(1,p.life*1.5);X.translate(p.x,p.y);X.rotate(p.rot);
 if(p.kind==='drop'||p.kind==='shard'){if(p.im==null)p.im=Math.floor(Math.random()*SPL.length);const i=SPL[p.im];if(okI(i)){const s=p.s*4/Math.max(i.naturalWidth,i.naturalHeight);X.drawImage(i,-i.naturalWidth*s/2,-i.naturalHeight*s/2,i.naturalWidth*s,i.naturalHeight*s)}}
 else{if(p.kind==='mote')X.globalCompositeOperation='lighter';const s=p.s*(p.kind==='mote'?2.6:4.5);X.scale(Math.cos(T*6+p.rot*3),1);dimg('coin',-s/2,-s/2,s,s)}
 X.restore()}}
// ---- облачко речи: пергаментный пузырь ----
function ovl(a,b){return Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]))}
function bubbleCost(r,c){let o=0;for(const q of FBP.c)if(q.n!=='bubble')o+=ovl(r,q.b);for(const q of FBP.t)if(!q.bub)o+=ovl(r,q.b)*2;for(const q of FBP.h)o+=ovl(r,q.b);return o}
function placeBubble(c,bw,bh){const v=vis();
 const hx=c?c.x:640,hy=c?c.y-c.h*.97:0;let best=null;const x0=v.x0+6,x1=v.x0+v.w-bw-6,y0=Math.max(v.y0+6,0),y1=v.y0+v.h-bh-6;
 for(let by=y0;by<=y1+.1;by+=Math.max(8,(y1-y0)/36))for(let bx=x0;bx<=x1+.1;bx+=Math.max(8,(x1-x0)/60)){const r=[bx,by,bx+bw,by+bh];const o=bubbleCost(r,c);
  const fl=c?hx>bx+bw/2:false,tx=fl?bx+bw*.85:bx+bw*.15,ty=by+bh;const d=c?Math.hypot(tx-hx,ty-hy):Math.abs(bx+bw/2-640)+by;const sc=o*40+d;if(!best||sc<best[4])best=[bx,by,fl,o,sc]}
 if(!best)best=[640-bw/2,8,false,1e9,0];return best}
function bubbleDims(c,fs,maxW){const lh=Math.round(fs*1.23),nfs=Math.round(fs*.92);X.font=fs+'px '+FONT;const L=wrap(talk.text,maxW);const tw=Math.max(...L.map(l=>X.measureText(l).width));X.font=nfs+'px '+FONT;const nw=c?X.measureText(NAMES[c.n][0]).width:0;
 const padX=Math.round(fs*1.75),padY=Math.round(fs*1.3);const bw=Math.max(200,Math.max(tw,nw)+padX*2);const nh=c?Math.round(fs*1.23):0,textH=L.length*lh+nh;
 const bi=UA.bubble,iw=okI(bi)?bi.naturalWidth:257,ih=okI(bi)?bi.naturalHeight:185;const tailF=.24;
 let bodyH=textH+padY*2,bh=bodyH;for(let k=0;k<3;k++){const kk=Math.min(bw/iw,bh/ih,1.1);bh=bodyH+tailF*ih*kk}const kk=Math.min(bw/iw,bh/ih,1.1);bodyH=bh-tailF*ih*kk;
 return{fs,lh,nfs,nh,L,bw,bh,bodyH,textH}}
const BCFG=[[26,440],[26,560],[23,640],[23,380],[21,720],[21,320],[19,820],[19,280],[17,900],[17,240]];
function drawTalk(){if(!talk){drawReacts();return}const c=cast.find(c=>c.n===talk.who);
 const key=talk.k+'|'+W+'x'+H;let D,pl;
 if(talk.dk===key&&talk.D&&(T-talk.dT<.5||talk.dpl[3]===0)){D=talk.D;pl=talk.dpl}
 else{let best=null;for(const[fs,mw]of BCFG){const d=bubbleDims(c,fs,c?mw:Math.max(mw,860));talk.pl=null;const p=placeBubble(c,d.bw,d.bh);if(!best||p[3]<best[1][3]-1)best=[d,p];if(p[3]===0)break}
  D=best[0];pl=best[1];talk.D=D;talk.dpl=pl;talk.dk=key;talk.dT=T}
 const{fs,lh,nfs,nh,L,bw,bh,bodyH,textH}=D;
 const age=T-talk.t0,pop=age<.18?.7+.3*ease(age/.18):1;const bx=pl[0],by=pl[1],flip=pl[2];
 X.save();const ox=flip?bx+bw*.85:bx+bw*.15;X.translate(ox,by+bh);X.scale(pop,pop);X.translate(-ox,-by-bh);
 win('bubble',bx,by,bw,bh,flip);AUDBUB=1;const cx=bx+bw/2;let y0=by+bodyH/2-textH/2;
 if(c){txt(NAMES[c.n][0],cx,y0+nh*.4,nfs,NAMES[c.n][1],{st:'#fff4dc',lw:5});y0+=nh}
 L.forEach((l,i)=>txt(l,cx,y0+i*lh+lh/2,fs,'#2a1004',{st:'rgba(255,244,220,.7)',lw:3}));AUDBUB=0;X.restore();
 talk.box=[bx,by,bw,bh];drawReacts()}
go('title');requestAnimationFrame(loop);
