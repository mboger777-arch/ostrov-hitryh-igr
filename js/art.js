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
function nine(n,x,y,w,h,l,t,r,b,flip,cap){const i=UA[n];if(!okI(i))return;const iw=i.naturalWidth,ih=i.naturalHeight;const k=Math.min(w/iw,h/ih,cap||1.6);
 const sx=[0,l*iw,iw-r*iw,iw],sy=[0,t*ih,ih-b*ih,ih],dx=[0,l*iw*k,w-r*iw*k,w],dy=[0,t*ih*k,h-b*ih*k,h];
 X.save();X.translate(x,y);if(flip){X.translate(w,0);X.scale(-1,1)}
 for(let a=0;a<3;a++)for(let c=0;c<3;c++){const sw=sx[c+1]-sx[c],sh=sy[a+1]-sy[a],ddw=dx[c+1]-dx[c],ddh=dy[a+1]-dy[a];if(sw>0&&sh>0&&ddw>0&&ddh>0)X.drawImage(i,sx[c],sy[a],sw,sh,dx[c]-.5,dy[a]-.5,ddw+1,ddh+1)}
 X.restore()}
const SL={frame:[.2,.26,.2,.26,1.3],scroll:[.2,.2,.2,.2,1.2],bubble:[.3,.3,.3,.42,1.1],plank:[.3,.3,.3,.3,1]};
function win(n,x,y,w,h,flip){const s=SL[n];nine(n,x,y,w,h,s[0],s[1],s[2],s[3],flip,s[4])}
function panel(x,y,w,h){win('frame',x,y,w,h)}
// ---- текст: сказочный шрифт, обводка, тень, градиент ----
function hx(c){if(typeof c!=='string'||c[0]!=='#')return null;if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function mix(a,b,k){return`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')})`}
// оптический центр: середина между линией шрифта и высотой прописных (измеряется по 'Н' для каждого кегля)
const CAPH={};function capHalf(size){if(CAPH[size]==null){X.font=size+'px '+FONT;X.textBaseline='alphabetic';const m=X.measureText('Н');CAPH[size]=m.actualBoundingBoxAscent>0?m.actualBoundingBoxAscent/2:size*.35;if(!document.fonts||document.fonts.check(size+'px FairyLogo')===false)delete CAPH[size]}return CAPH[size]!=null?CAPH[size]:size*.35}
// цифры: не меньше ~28px высоты глифа на экране (телефон), остальной текст — как задан
const DIGIT_PX=28;function txt(t,x,y,size,col,o){o=o||{};t=String(t);if(!o._seg&&/\d/.test(t)&&t.replace(/[\d\s]/g,'').length<=16){if(o.maxW){X.font=size+'px '+FONT;const mw=X.measureText(t).width;if(mw>o.maxW)size=Math.floor(size*o.maxW/mw)}
  let D=Math.min(Math.max(size,Math.ceil(DIGIT_PX/(.72*S))),Math.round(size*2.3));if(D>size){const runs=t.match(/\d+|\D+/g).map(r=>({r,d:/\d/.test(r)}));
   if(o.maxD){X.font=D+'px '+FONT;const w=Math.max(...runs.filter(q=>q.d).map(q=>X.measureText(q.r).width));if(w>o.maxD)D=Math.max(size,Math.floor(D*o.maxD/w))}
   if(D>size){runs.forEach(q=>{q.s=q.d?D:size;X.font=q.s+'px '+FONT;q.w=X.measureText(q.r).width});const tw=runs.reduce((a,q)=>a+q.w,0);let cx=o.al==='left'?x:o.al==='right'?x-tw:x-tw/2;
    runs.forEach(q=>{txt(q.r,cx,y,q.s,col,{...o,al:'left',maxW:0,_seg:1,lw:o.lw?o.lw*q.s/size:0});cx+=q.w});return}}}
 if(o.maxW){X.font=size+'px '+FONT;const mw=X.measureText(t).width;if(mw>o.maxW)size=Math.floor(size*o.maxW/mw)}const ch=capHalf(size);X.font=size+'px '+FONT;X.textAlign=o.al||'center';X.textBaseline='alphabetic';y+=ch;X.lineJoin='round';
 const c=hx(col||'#fff');X.save();
 if(o.st!==0){X.shadowColor='rgba(0,0,0,.5)';X.shadowBlur=size*.16;X.shadowOffsetY=size*.06;X.lineWidth=o.lw||Math.max(3,size*.17);X.strokeStyle=o.st||'#3a1a06';X.strokeText(t,x,y);X.shadowColor='transparent'}
 if(c){const g=X.createLinearGradient(0,y-ch-size*.5,0,y-ch+size*.45);g.addColorStop(0,mix(c,[255,255,255],.6));g.addColorStop(.5,mix(c,[255,255,255],.08));g.addColorStop(1,mix(c,[40,20,0],.25));X.fillStyle=g}else X.fillStyle=col;
 X.fillText(t,x,y);X.restore()}
const INK='#4a2208',INKST='rgba(255,240,205,.85)';
function ink(t,x,y,s,o){o=o||{};txt(t,x,y,s,o.col||'#5a2a0a',{st:o.st||INKST,lw:o.lw||Math.max(3,s*.14),al:o.al})}
function para(t,x,y,maxW,s,o){X.font=s+'px '+FONT;const L=wrap(t,maxW),lh=s*1.2;L.forEach((l,i)=>ink(l,x,y+(i-(L.length-1)/2)*lh,s,o));return L.length*lh}
// ---- кнопки: доска с канатами (широкие), дублон / компас (круглые) ----
function btn(id,x,y,w,h,label,fn,o){o=o||{};UI.push({id,x,y,w,h,fn,always:o.always,dis:o.dis});const hov=Math.abs(PX-x)<w/2&&Math.abs(PY-y)<h/2;const pr=o.pulse?1+Math.sin(T*5)*.04:1;
 X.save();X.translate(x,y);const sc=pr*(hov?1.06:1);X.scale(sc,sc);if(o.dis)X.globalAlpha*=.55;
 const round=w<=h*1.45;
 if(round){const d=Math.max(w,h)*1.25;
  if(label==='⌂'){const c=UA.compass;if(okI(c)){const ww=d*1.25,hh=ww*c.naturalHeight/c.naturalWidth;X.rotate(Math.sin(T*1.2)*.04);dimg('compass',-ww/2,-hh/2,ww,hh)}}
  else{dimg('coin',-d/2,-d/2,d,d*UA.coin.naturalHeight/Math.max(1,UA.coin.naturalWidth),{grey:o.dis});X.save();X.globalAlpha*=.5;dimg('coin',-d*.33,-d*.33,d*.66,d*.66);X.restore();txt(label,0,0,o.fs||d*.5,'#fff3c0',{st:'#4a2600',lw:(o.fs||d*.5)*.2})}}
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
function drawTalk(){if(!talk){drawReacts();return}const c=cast.find(c=>c.n===talk.who);const fs=26,lh=32;X.font=fs+'px '+FONT;const maxW=c?440:860;const L=wrap(talk.text,maxW);
 X.font=fs+'px '+FONT;const tw=Math.max(...L.map(l=>X.measureText(l).width));X.font='24px '+FONT;const nw=c?X.measureText(NAMES[c.n][0]).width:0;
 const padX=46,padY=34;const bw=Math.max(240,Math.max(tw,nw)+padX*2);const textH=L.length*lh+(c?32:0);
 const bi=UA.bubble,iw=okI(bi)?bi.naturalWidth:257,ih=okI(bi)?bi.naturalHeight:185;const tailF=.24;// доля высоты спрайта под хвостик
 let bodyH=textH+padY*2,bh=bodyH;for(let k=0;k<3;k++){const kk=Math.min(bw/iw,bh/ih,1.1);bh=bodyH+tailF*ih*kk}
 const kk=Math.min(bw/iw,bh/ih,1.1);bodyH=bh-tailF*ih*kk;
 const age=T-talk.t0,pop=age<.18?.7+.3*ease(age/.18):1;let bx,by,flip=false;
 if(c){const hy=c.y-c.h*1.0-(c.jump&&T-c.jump<.75?50:0);flip=c.x>640;bx=flip?c.x-bw+40:c.x-40;bx=clamp(bx,4,1276-bw);by=clamp(hy-bh+30,4,720-bh-4)}else{bx=640-bw/2;by=8}
 X.save();const ox=flip?bx+bw*.85:bx+bw*.15;X.translate(ox,by+bh);X.scale(pop,pop);X.translate(-ox,-by-bh);
 win('bubble',bx,by,bw,bh,flip);const cx=bx+bw/2;let y0=by+bodyH/2-textH/2;
 if(c){txt(NAMES[c.n][0],cx,y0+12,24,NAMES[c.n][1],{st:'#fff4dc',lw:5});y0+=32}
 L.forEach((l,i)=>txt(l,cx,y0+i*lh+lh/2,fs,'#2a1004',{st:'rgba(255,244,220,.7)',lw:3}));X.restore();
 talk.box=[bx,by,bw,bh];drawReacts()}
go('title');requestAnimationFrame(loop);
