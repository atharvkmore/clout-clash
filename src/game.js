'use strict';
(function(){
const W=1280,H=720,WORLD=1700;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const A=window.ASSETS;
const ROSTER=[
 {id:'rex',short:'REX',name:'REX IRONREPS',niche:'FITNESS',color:'#ff7a1a',hp:112,speed:4.3,pd:7,kd:11,spName:'PROTEIN SHOT',suName:'LEG DAY',sp:'shaker',su:'slam',quote:'No rest days. No mercy.',koFlip:true},
 {id:'kira',short:'KIRA',name:'KIRA FRAMERATE',niche:'GAMING',color:'#a855f7',hp:96,speed:5.5,pd:6,kd:10,spName:'PIXEL BLAST',suName:'RAGE QUIT',sp:'pixel',su:'bolts',quote:'GG EZ. Clip that.',koFlip:true},
 {id:'bao',short:'BAO',name:'BIG BAO',niche:'MUKBANG',color:'#ef4444',hp:136,speed:3.8,pd:8,kd:12,spName:'CHILI BREATH',suName:'NOODLE TSUNAMI',sp:'fire',su:'wave',quote:'You look delicious.',koFlip:true,spR:320},
 {id:'dev',short:'DEV',name:'DEV GADGET',niche:'TECH REVIEWS',color:'#22d3ee',hp:100,speed:4.9,pd:6,kd:10,spName:'PHONE LASER',suName:'DRONE STRIKE',sp:'laser',su:'bombs',quote:'Build quality: fragile.'},
 {id:'glam',short:'CONTOUR',name:'LADY CONTOUR',niche:'BEAUTY',color:'#ec4899',hp:96,speed:5.1,pd:6,kd:11,spName:'LIPSTICK MISSILE',suName:'GLITTER STORM',sp:'lipstick',su:'storm',quote:'Blend. Or be blended.'},
 {id:'wanda',short:'WANDA',name:'WANDA LUST',niche:'TRAVEL VLOGS',color:'#f59e0b',hp:102,speed:4.8,pd:7,kd:10,spName:'FLASH!',suName:'FIRST CLASS',sp:'flash',su:'plane',quote:'Next stop: the floor.',spR:390}
];
let loaded=0,total=0;
function mkImg(src){const i=new Image();total++;i.onload=()=>{loaded++;};i.src=src;return i;}
for(const d of ROSTER){const fr=A.chars[d.id].frames;for(const k in fr)fr[k].img=mkImg(fr[k].s);d.fr=fr;d.h=fr.idle.h;
 d.reachP=Math.min(fr.punch.w-fr.punch.ax,265);d.reachK=Math.min(fr.kick.w-fr.kick.ax,230);d.bw=d.id==='bao'?74:57;}
const STAGE_NAMES=['NEON STREAM STUDIO','ROOFTOP BILLBOARD ROW','CREATOR-CON MAIN STAGE'];
const STAGES=A.stages.map((s,i)=>({img:mkImg(s.s),g:s.g,name:STAGE_NAMES[i]}));
function mkPortraits(){for(const d of ROSTER){const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');const fr=d.fr.idle;const S=fr.h*0.36;
 const gr=g.createLinearGradient(0,0,0,160);gr.addColorStop(0,d.color);gr.addColorStop(1,'#15131f');g.fillStyle=gr;g.fillRect(0,0,160,160);
 let sx=fr.hx-S/2+S*0.06,sy=Math.max(0,fr.hy-S*0.42);sx=Math.max(0,Math.min(fr.w-S,sx));
 g.drawImage(fr.img,sx,sy,S,S,0,0,160,160);d.por=c;}}

// ---------- audio
let ac=null,masterG,mg,sg,bufs={},musicSrc=null,musicName=null,wantMusic=null,muted=false,noiseBuf;
function b64buf(u){const b=atob(u.split(',')[1]);const a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer;}
function initAudio(){
 if(ac){if(ac.state==='suspended')ac.resume();return;}
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 try{ac=new AC();}catch(e){ac=null;return;}
 masterG=ac.createGain();masterG.connect(ac.destination);
 mg=ac.createGain();mg.gain.value=0.38;mg.connect(masterG);sg=ac.createGain();sg.gain.value=0.9;sg.connect(masterG);
 noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 for(const k in A.audio){try{ac.decodeAudioData(b64buf(A.audio[k]),b=>{bufs[k]=b;if(wantMusic===k)music(k,true);},()=>{});}catch(e){}}
}
function voice(n,v){if(!ac||!bufs[n])return;const s=ac.createBufferSource();s.buffer=bufs[n];const g=ac.createGain();g.gain.value=v||1.25;s.connect(g);g.connect(sg);s.start();}
function music(n,force){wantMusic=n;if(!ac)return;if(musicName===n&&!force)return;if(!bufs[n])return;if(musicSrc){try{musicSrc.stop();}catch(e){}}
 musicSrc=ac.createBufferSource();musicSrc.buffer=bufs[n];musicSrc.loop=true;musicSrc.connect(mg);musicSrc.start();musicName=n;}
function tone(f0,f1,dur,type,vol,delay){if(!ac)return;const t=ac.currentTime+(delay||0);const o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(sg);o.start(t);o.stop(t+dur+0.02);}
function noise(dur,f0,f1,vol,q,type){if(!ac)return;const t=ac.currentTime;const s=ac.createBufferSource();s.buffer=noiseBuf;const f=ac.createBiquadFilter();f.type=type||'bandpass';f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);s.connect(f);f.connect(g);g.connect(sg);s.start(t,Math.random()*0.4,dur+0.05);}
const SFX={
 whoosh(){noise(0.16,900,2600,0.22,1.2);},
 hit(){noise(0.12,2200,300,0.7,0.7,'lowpass');tone(170,50,0.14,'sine',0.8);},
 heavy(){noise(0.22,1800,150,0.9,0.6,'lowpass');tone(120,35,0.3,'sine',1);tone(300,60,0.12,'square',0.2);},
 block(){noise(0.07,3200,1800,0.35,3);tone(520,380,0.07,'triangle',0.25);},
 shoot(){tone(880,220,0.22,'sawtooth',0.2);noise(0.2,3000,800,0.18,2);},
 laser(){tone(1800,300,0.3,'sawtooth',0.22);tone(2400,600,0.3,'square',0.1);},
 fire(){noise(0.55,500,1600,0.4,0.8);},
 flash(){noise(0.15,6000,3000,0.4,1);tone(2600,1800,0.2,'sine',0.25);},
 boom(){noise(0.6,900,60,1,0.5,'lowpass');tone(90,28,0.6,'sine',1);},
 sup(){tone(200,1200,0.6,'sawtooth',0.28);tone(300,1800,0.6,'square',0.1);noise(0.6,400,5000,0.3,1);},
 jump(){tone(260,520,0.12,'sine',0.2);},
 land(){noise(0.08,400,120,0.3,0.7,'lowpass');},
 ui(){tone(660,880,0.06,'square',0.13);},
 ok(){tone(520,1040,0.12,'square',0.18);tone(780,1560,0.14,'square',0.1,0.06);},
 zap(){noise(0.25,5000,900,0.6,1.5);tone(1400,90,0.25,'sawtooth',0.3);}
};

// ---------- input
const keys={},pressed={},touch={},touchP={};
addEventListener('keydown',e=>{if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;initAudio();
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Backspace'].indexOf(e.code)>=0)e.preventDefault();
 if(e.code==='KeyM'&&masterG){muted=!muted;masterG.gain.value=muted?0:1;}});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;for(const k in touch)touch[k]=false;});
const MAP=[{l:'KeyA',r:'KeyD',u:'KeyW',d:'KeyS',p:'KeyF',k:'KeyG',s:'KeyH',x:'KeyR'},{l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown',p:'KeyJ',k:'KeyK',s:'KeyL',x:'KeyI'}];
function readInput(i,merge){const m=MAP[i],o={};for(const a in m){o[a]=!!keys[m[a]]||(i===0&&!!touch[a]);o[a+'P']=!!pressed[m[a]]||(i===0&&!!touchP[a]);}
 if(merge){const m2=MAP[1];for(const a in m2){o[a]=o[a]||!!keys[m2[a]];o[a+'P']=o[a+'P']||!!pressed[m2[a]];}}return o;}
function mp(a){switch(a){case 'up':return pressed.KeyW||pressed.ArrowUp;case 'down':return pressed.KeyS||pressed.ArrowDown;case 'left':return pressed.KeyA||pressed.ArrowLeft;case 'right':return pressed.KeyD||pressed.ArrowRight;
 case 'ok':return pressed.Enter||pressed.Space||pressed.KeyF||pressed.KeyJ||touchP.p;case 'back':return pressed.Escape||pressed.Backspace;}return false;}
let hots=[];
function hot(x,y,w,h,fn){hots.push({x:x,y:y,w:w,h:h,fn:fn});}
let touchOn=false;
function showTouch(){if(touchOn)return;touchOn=true;const tc=document.getElementById('tc');tc.className='on';
 const defs=[['l','<','left:3vmin;bottom:12vmin'],['r','>','left:33vmin;bottom:12vmin'],['u','^','left:18vmin;bottom:26vmin'],['d','GRD','left:18vmin;bottom:2vmin'],
  ['p','P','right:33vmin;bottom:12vmin'],['k','K','right:18vmin;bottom:26vmin'],['s','SP','right:3vmin;bottom:12vmin'],['x','SUP','right:18vmin;bottom:2vmin']];
 for(const d of defs){const b=document.createElement('div');b.className='tb';b.textContent=d[1];b.style.cssText=d[2];
  const on=e=>{e.preventDefault();initAudio();if(!touch[d[0]])touchP[d[0]]=true;touch[d[0]]=true;b.classList.add('act');};
  const off=e=>{e.preventDefault();touch[d[0]]=false;b.classList.remove('act');};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);tc.appendChild(b);}
 const pb=document.createElement('div');pb.className='tb';pb.textContent='II';pb.style.cssText='left:50%;top:1vmin;width:8vmin;height:8vmin;margin-left:-4vmin;font-size:3vmin';
 pb.addEventListener('pointerdown',e=>{e.preventDefault();pressed.Escape=true;});tc.appendChild(pb);}
cv.addEventListener('pointerdown',e=>{initAudio();if(e.pointerType==='touch')showTouch();const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
 for(let i=hots.length-1;i>=0;i--){const h=hots[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){h.fn();break;}}});

// ---------- state
let scene='load',st=0,mode='arcade',sel=[0,1],locked=[false,false],lockT=0,ladder=[],ladIdx=0,stageIdx=0,mi=0,paused=false,aiLevel=0.2;
let F=[],ents=[],parts=[],cam=0,shake=0,hitstop=0,freeze=0,freezeInfo=null,round=1,phase='intro',pt=0,timer=3600,flashA=0,winner=-1,perfect=false,timeup=false,gY=620,tick=0;
function setScene(s){scene=s;st=0;mi=0;}
function toTitle(){setScene('title');music('m_menu');}
function toSelect(){setScene('select');locked=[false,mode==='arcade'];lockT=0;voice('v_choose');music('m_menu');}
function beginVs(){if(mode==='arcade'){sel[1]=ladder[ladIdx];stageIdx=ladIdx%3;}else stageIdx=Math.floor(Math.random()*3);setScene('vs');}
function newFighter(def,side,cpu){return{def:def,side:side,cpu:cpu,x:side?WORLD/2+230:WORLD/2-230,y:0,vx:0,vy:0,face:side?-1:1,hp:def.hp,dhp:def.hp,meter:0,st:'idle',t:0,cd:0,inv:0,combo:0,comboShow:null,chain:0,hitDone:false,stun:0,guard:false,lie:0,wins:0,fl:0,launch:false,ai:{t:20,act:null,hold:0,move:null}};}
function startMatch(){F=[newFighter(ROSTER[sel[0]],0,mode==='demo'),newFighter(ROSTER[sel[1]],1,mode!=='versus')];round=1;aiLevel=mode==='arcade'?Math.min(0.9,0.12+0.18*ladIdx):0.6;gY=STAGES[stageIdx].g*(H+20)-10;setScene('fight');paused=false;music('m_fight');startRound();}
function startRound(){for(let i=0;i<2;i++){const f=F[i],w=f.wins,m=f.meter;F[i]=newFighter(f.def,f.side,f.cpu);F[i].wins=w;F[i].meter=m;}
 ents=[];parts=[];phase='intro';pt=0;timer=3600;hitstop=0;freeze=0;shake=0;cam=WORLD/2-W/2;winner=-1;perfect=false;timeup=false;voice(round>=3?'v_final':'v_round'+round);}
function go(f,s){f.st=s;f.t=0;f.hitDone=false;}

// ---------- combat
function spark(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=3+Math.random()*9;parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:14,max:14,r:3+Math.random()*4,col:col,line:true});}
 parts.push({x:x,y:y,vx:0,vy:0,life:8,max:8,r:n*3.2,col:'#fff',star:true});}
function boomFx(x,y){for(let i=0;i<22;i++){const a=Math.random()*6.283,v=2+Math.random()*8;parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-3,life:26,max:26,r:12+Math.random()*18,col:['#ffe14a','#ff8a1a','#ff3b1a','#555'][i%4],fire:true});}}
function hit(o,f,h){
 if(o.inv>0||phase!=='fight')return false;
 if(o.st==='down'&&o.y<=0)return false;
 const dir=h.dir||(o.x>=f.x?1:-1);
 const cx=o.x-dir*24,cy=gY-o.y-o.def.h*0.62;
 if(o.guard&&!h.unblock&&o.y<=0){
  o.hp=Math.max(1,o.hp-h.dmg*0.12);go(o,'bstun');o.stun=Math.round(h.stun*0.55);o.vx=dir*h.kb*0.7;
  f.meter=Math.min(100,f.meter+(h.nometer?0:h.dmg*0.5));o.meter=Math.min(100,o.meter+h.dmg*0.4);
  SFX.block();spark(cx,cy,'#9cf',6);hitstop=Math.max(hitstop,3);return true;}
 const sc=Math.max(0.45,1-0.1*f.combo);o.hp=Math.max(0,o.hp-h.dmg*sc);f.combo++;f.comboShow={n:f.combo,t:80};
 f.meter=Math.min(100,f.meter+(h.nometer?0:h.dmg*1.1));o.meter=Math.min(100,o.meter+h.dmg*0.75);
 o.fl=8;o.vx=dir*h.kb;const air=o.y>0;
 hitstop=Math.max(hitstop,h.hs||5);shake=Math.max(shake,h.heavy?11:5);
 if(h.heavy)SFX.heavy();else SFX.hit();spark(cx,cy,h.col||'#ffd54a',h.heavy?16:9);
 if(o.hp<=0){go(o,'down');o.lie=0;o.vy=12;o.y=Math.max(o.y,0.1);o.vx=dir*8;
  phase='ko';pt=0;winner=f.side;f.wins++;perfect=f.hp>=f.def.hp-0.01;voice('v_ko');SFX.boom();shake=22;flashA=0.7;}
 else if(h.launch||air){go(o,'down');o.lie=0;o.vy=h.launch?(h.lv||11.5):8;o.y=Math.max(o.y,0.1);}
 else{go(o,'hit');o.stun=h.stun;}
 return true;
}
function tryMelee(f,o,h){const dist=(o.x-f.x)*f.face;if(dist<-30||dist>h.reach+o.def.bw*0.6)return;
 if(h.air){if(Math.abs(f.y-o.y)>o.def.h*0.8+40)return;}else if(o.y>o.def.h*0.55)return;
 f.hitDone=true;hit(o,f,h);}
function doSpecial(f,o){
 const k=f.def.sp,hx=f.x+f.face*70,hy=f.def.h*0.68;
 if(k==='shaker'){ents.push({t:'proj',k:k,x:hx,y:hy,vx:f.face*11.5,o:f,dmg:11,r:22,life:120,rot:0});SFX.shoot();}
 else if(k==='pixel'){ents.push({t:'proj',k:k,x:hx+f.face*20,y:hy,vx:f.face*15,o:f,dmg:9,r:20,life:100,rot:0});SFX.shoot();}
 else if(k==='lipstick'){ents.push({t:'proj',k:k,x:hx+f.face*40,y:hy+10,vx:f.face*7.5,o:f,dmg:11,r:20,life:170,home:true,rot:0});SFX.shoot();}
 else if(k==='laser'){ents.push({t:'beam',x:hx+f.face*30,y:hy+18,dir:f.face,o:f,life:14});SFX.laser();
  const dist=(o.x-f.x)*f.face;if(dist>0&&o.y<hy)hit(o,f,{dmg:9,kb:6,stun:20,hs:5,col:'#5ff'});}
 else if(k==='flash'){flashA=0.85;SFX.flash();ents.push({t:'ring',x:hx+f.face*30,y:hy+30,life:16,o:f});
  const dist=(o.x-f.x)*f.face;if(dist>0&&dist<400&&o.y<f.def.h)hit(o,f,{dmg:5,kb:2,stun:56,hs:6,col:'#fff'});}
 else if(k==='fire'){SFX.fire();}
}
function fireTick(f,o){const mx=f.x+f.face*95,my=gY-f.def.h*0.66;
 for(let i=0;i<3;i++)parts.push({x:mx,y:my,vx:f.face*(7+Math.random()*6),vy:(Math.random()-0.5)*4,life:22,max:22,r:14+Math.random()*14,col:['#ffe14a','#ff8a1a','#ff3b1a'][i],fire:true});
 if(f.t%9===0){const dist=(o.x-f.x)*f.face;if(dist>0&&dist<335&&o.y<f.def.h*0.8)hit(o,f,{dmg:5.2,kb:3,stun:16,hs:2,col:'#f80'});}}
function startSuper(f){f.meter=0;go(f,'super');f.vx=0;f.inv=52;freeze=48;freezeInfo={f:f,t:0};SFX.sup();}
function doSuper(f,o){
 const k=f.def.su,face=f.face;
 if(k==='slam'){shake=26;SFX.boom();ents.push({t:'shock',x:f.x,y:0,life:26,o:f});
  if(o.y<30&&Math.abs(o.x-f.x)<560)hit(o,f,{dmg:30,kb:6,stun:30,hs:12,launch:true,lv:15,heavy:true,nometer:1,col:'#ff7a1a'});}
 else if(k==='bolts'){for(let i=0;i<3;i++)ents.push({t:'bolt',delay:14+i*18,o:f,life:14,x:o.x,y:0,dmg:11,tgt:o});}
 else if(k==='wave'){ents.push({t:'proj',k:'wave',x:f.x+face*90,y:90,vx:face*8.5,o:f,dmg:30,r:95,life:200,launch:true,big:true,rot:0});SFX.fire();}
 else if(k==='bombs'){ents.push({t:'drone',x:f.x,y:470,o:f,tgt:o,life:130,n:0});}
 else if(k==='storm'){ents.push({t:'storm',x:0,y:0,o:f,tgt:o,life:84});SFX.zap();}
 else if(k==='plane'){const sx=face>0?cam-220:cam+W+220;ents.push({t:'proj',k:'plane',x:sx,y:f.def.h*0.5,vx:face*19,o:f,dmg:30,r:110,life:140,launch:true,big:true,rot:0});SFX.boom();}
}
function updEnts(){
 for(const e of ents){
  e.life--;const f=e.o,o=F[1-f.side];
  if(e.t==='proj'){e.x+=e.vx;e.rot+=0.3;
   if(e.home){const ty=o.y+o.def.h*0.6;e.y+=Math.max(-3,Math.min(3,(ty-e.y)*0.08));e.vx+=Math.sign(e.vx)*0.12;}
   if(!e.done&&Math.abs(e.x-o.x)<e.r+o.def.bw&&e.y+e.r>o.y&&e.y-e.r<o.y+o.def.h){
    if(hit(o,f,{dmg:e.dmg,kb:e.big?9:6,stun:20,hs:e.big?10:5,launch:e.launch,lv:13,heavy:e.big,nometer:e.big,dir:Math.sign(e.vx)})){if(e.big)e.done=true;else e.life=0;}}
   if(e.k==='pixel'&&(tick&1))parts.push({x:e.x,y:gY-e.y,vx:0,vy:0,life:10,max:10,r:9,col:'#c084fc',sq:true});
   if(e.k==='lipstick'&&(tick&1))parts.push({x:e.x-Math.sign(e.vx)*24,y:gY-e.y,vx:0,vy:0,life:12,max:12,r:7,col:'#ff9fd0',fire:true});
   if(e.k==='wave')for(let i=0;i<2;i++)parts.push({x:e.x-Math.sign(e.vx)*40,y:gY-Math.random()*160,vx:-Math.sign(e.vx)*2,vy:-2,life:16,max:16,r:8,col:'#ffe9a8',fire:true});
  }
  else if(e.t==='bolt'){if(e.delay>0){e.delay--;e.life++;if(e.delay>10)e.x=e.tgt.x;
    if(e.delay===0){SFX.zap();flashA=0.4;shake=12;if(Math.abs(o.x-e.x)<85)hit(o,f,{dmg:e.dmg,kb:3,stun:24,hs:6,heavy:true,nometer:1,col:'#c8f'});}}}
  else if(e.t==='drone'){e.x+=(e.tgt.x-e.x)*0.08;if(e.life<112&&e.life%24===0&&e.n<4){e.n++;ents.push({t:'bomb',x:e.x+(Math.random()-0.5)*70,y:e.y-20,vy:0,o:f,life:200});SFX.ui();}}
  else if(e.t==='bomb'){e.vy-=0.7;e.y+=e.vy;if(e.y<=0){e.life=0;SFX.boom();shake=12;boomFx(e.x,gY-20);
    if(Math.abs(o.x-e.x)<108&&o.y<120)hit(o,f,{dmg:9,kb:5,stun:22,hs:5,heavy:true,nometer:1,col:'#fa0'});}}
  else if(e.t==='storm'){for(let i=0;i<6;i++)parts.push({x:cam+Math.random()*W,y:Math.random()*gY,vx:(Math.random()-0.5)*6,vy:2+Math.random()*5,life:24,max:24,r:3+Math.random()*5,col:['#ff6ec7','#ffd700','#fff','#c084fc'][i%4],sq:true});
   if(e.life%10===0&&Math.abs(o.x-f.x)<660)hit(o,f,{dmg:4.2,kb:1.5,stun:14,hs:1,nometer:1,col:'#f6c'});}
 }
 ents=ents.filter(e=>e.life>0);
 for(const p of parts){p.life--;p.x+=p.vx;p.y+=p.vy;if(p.line){p.vx*=0.86;p.vy*=0.86;}if(p.fire){p.vy-=0.15;p.vx*=0.94;}}
 parts=parts.filter(p=>p.life>0);
}
function updF(f,o,inp,active){
 f.t++;if(f.cd>0)f.cd--;if(f.inv>0)f.inv--;if(f.fl>0)f.fl--;
 f.dhp+=(f.hp-f.dhp)*0.06;if(f.dhp<f.hp)f.dhp=f.hp;
 const d=f.def,s=f.st;f.guard=false;
 if(s==='idle'||s==='walk'||s==='block'||s==='win'){
  if(!active){f.vx=0;const ws=(phase==='post'&&winner===f.side)?'win':'idle';if(s!==ws)go(f,ws);}
  else{
   f.face=o.x>=f.x?1:-1;
   const dir=(inp.r?1:0)-(inp.l?1:0),back=dir!==0&&dir===-f.face;
   f.guard=!!(inp.d||back);
   if(inp.xP&&f.meter>=100){startSuper(f);}
   else if(inp.sP&&f.cd<=0){go(f,'special');f.vx=0;f.cd=78;SFX.whoosh();}
   else if(inp.pP){go(f,'punch');f.chain=0;f.vx=0;SFX.whoosh();}
   else if(inp.kP){go(f,'kick');f.vx=0;f.launch=false;SFX.whoosh();}
   else if(inp.uP){go(f,'jump');f.vy=16.5;f.vx=dir*d.speed*1.15;f.y=0.1;SFX.jump();}
   else if(inp.d){if(s!=='block')go(f,'block');f.vx=0;}
   else if(dir){if(s!=='walk')go(f,'walk');f.vx=dir*d.speed*(back?0.8:1);}
   else{if(s!=='idle')go(f,'idle');f.vx=0;}
  }
 }else if(s==='punch'){
  f.vx=f.t<6?f.face*2.5:0;
  if(f.t>=6&&f.t<=10&&!f.hitDone)tryMelee(f,o,{dmg:d.pd,reach:d.reachP,kb:5,stun:18,hs:4});
  if(f.hitDone&&f.t>=11&&f.t<22){
   if(inp.pP){if(f.chain>=1){go(f,'kick');f.launch=true;f.chain=0;}else{const c=f.chain+1;go(f,'punch');f.chain=c;}SFX.whoosh();}
   else if(inp.kP){go(f,'kick');f.launch=false;SFX.whoosh();}}
  if(f.st==='punch'&&f.t>=22)go(f,'idle');
 }else if(s==='kick'){
  f.vx=f.t<8?f.face*3:0;
  if(f.t>=9&&f.t<=15&&!f.hitDone)tryMelee(f,o,{dmg:f.launch?d.kd+2:d.kd,reach:d.reachK,kb:f.launch?7:9,stun:22,hs:7,launch:f.launch,heavy:true});
  if(f.t>=32)go(f,'idle');
 }else if(s==='jump'||s==='airkick'){
  if(s==='jump'&&active&&(inp.kP||inp.pP)){go(f,'airkick');SFX.whoosh();}
  if(f.st==='airkick'&&f.t>=3&&!f.hitDone)tryMelee(f,o,{dmg:d.kd-1,reach:d.reachK*0.85,kb:8,stun:22,hs:6,air:true,heavy:true});
 }else if(s==='special'){
  f.vx=0;if(f.t===16)doSpecial(f,o);
  if(d.sp==='fire'&&f.t>16&&f.t<44)fireTick(f,o);
  if(f.t>=(d.sp==='fire'?52:40))go(f,'idle');
 }else if(s==='super'){f.vx=0;if(f.t===12)doSuper(f,o);if(f.t>=62)go(f,'idle');
 }else if(s==='hit'){f.vx*=0.86;if(f.t>=f.stun)go(f,'idle');
 }else if(s==='bstun'){f.vx*=0.84;f.guard=true;if(f.t>=f.stun)go(f,'idle');
 }else if(s==='down'){if(f.y<=0&&f.vy<=0){f.vx*=0.85;f.lie++;if(f.hp>0&&f.lie>32){go(f,'getup');f.inv=42;}}
 }else if(s==='getup'){f.vx=0;if(f.t>=14)go(f,'idle');}
 if(f.y>0||f.vy>0){f.vy-=0.9;f.y+=f.vy;
  if(f.y<=0){f.y=0;f.vy=0;
   if(f.st==='jump'||f.st==='airkick'){go(f,'idle');f.vx=0;SFX.land();}
   else if(f.st==='down'){SFX.land();shake=Math.max(shake,7);f.lie=0;for(let i=0;i<8;i++)parts.push({x:f.x+(Math.random()-0.5)*120,y:gY,vx:(Math.random()-0.5)*4,vy:-Math.random()*2,life:18,max:18,r:10+Math.random()*10,col:'#bbb',fire:true});}}}
 f.x+=f.vx;
}
function aiInput(f,o){
 const a=f.ai,inp={},L=aiLevel,d=f.def;
 const dist=Math.abs(o.x-f.x),toward=o.x>f.x?'r':'l',away=o.x>f.x?'l':'r';
 if(a.hold>0){a.hold--;if(a.act)inp[a.act]=true;return inp;}
 a.t--;
 if(a.t>0){if(a.move)inp[a.move]=true;return inp;}
 a.t=5+Math.random()*(17-11*L);a.move=null;
 const oAtk=(o.st==='punch'||o.st==='kick'||o.st==='airkick'||o.st==='special'||o.st==='super');
 let threat=oAtk&&dist<310;for(const e of ents)if(e.o===o&&e.t==='proj'&&Math.abs(e.x-f.x)<280)threat=true;
 const r=Math.random();
 if(threat&&r<0.28+0.55*L){a.act=away;a.hold=14;inp[away]=true;return inp;}
 if(f.meter>=100&&dist<620&&Math.random()<0.3+0.4*L){inp.xP=true;return inp;}
 if(f.st==='punch'&&f.hitDone){if(r<0.45+0.45*L)inp.pP=true;return inp;}
 const inP=dist<d.reachP+o.def.bw*0.5,inK=dist<d.reachK+o.def.bw*0.5;
 const spOK=f.cd<=0&&(!d.spR||dist<d.spR);
 if(inP){if(r<0.45+0.2*L)inp.pP=true;else if(r<0.8)inp.kP=true;else if(r<0.9)a.move=away;else inp.uP=true;}
 else if(inK){if(r<0.5)inp.kP=true;else if(r<0.62&&spOK)inp.sP=true;else a.move=toward;}
 else if(dist>380){if(r<0.2+0.18*L&&spOK)inp.sP=true;else if(r<0.9)a.move=toward;else{inp.uP=true;inp[toward]=true;}}
 else{if(r<(d.spR?0.3:0.12)&&spOK)inp.sP=true;else if(r<0.85)a.move=toward;else if(r<0.93)a.move=away;else{inp.uP=true;inp[toward]=true;}}
 if(a.move)inp[a.move]=true;return inp;
}
function matchEnd(w){
 if(mode==='arcade'){if(w===0){ladIdx++;if(ladIdx>=ladder.length){setScene('ending');music('m_menu');voice('v_win');}else beginVs();}else{setScene('cont');music('m_menu');}}
 else if(mode==='demo'){toTitle();}else{setScene('result');music('m_menu');}
}
function stepFight(){
 if(pressed.Escape||pressed.KeyP){paused=!paused;mi=0;SFX.ui();}
 if(paused){menuStep(MENUS.pause());return;}
 tick++;shake*=0.86;if(shake<0.4)shake=0;if(flashA>0)flashA=Math.max(0,flashA-0.06);
 if(freeze>0){freeze--;freezeInfo.t++;return;}
 if(hitstop>0){hitstop--;return;}
 pt++;
 if(phase==='intro'){if(pt===70)voice('v_fight');if(pt>=112){phase='fight';pt=0;}}
 else if(phase==='fight'){timer--;if(timer<=0){timeup=true;phase='post';pt=0;const a=F[0],b=F[1],pa=a.hp/a.def.hp,pb=b.hp/b.def.hp;
   if(Math.abs(pa-pb)<0.001)winner=-1;else{winner=pa>pb?0:1;F[winner].wins++;}postVoice();}}
 else if(phase==='ko'){if(pt<80&&pt%2)return;if(pt>=150){phase='post';pt=0;postVoice();}}
 else if(phase==='post'){if(pt>=175){const w=F[0].wins>=2?0:F[1].wins>=2?1:-1;if(w>=0)matchEnd(w);else{round++;startRound();}return;}}
 const active=phase==='fight';
 const i0=active?(F[0].cpu?aiInput(F[0],F[1]):readInput(0,mode==='arcade')):{};
 const i1=active?(F[1].cpu?aiInput(F[1],F[0]):readInput(1)):{};
 updF(F[0],F[1],i0,active);updF(F[1],F[0],i1,active);
 updEnts();
 const a=F[0],b=F[1];
 if(a.y<110&&b.y<110){const min=a.def.bw+b.def.bw,dx=b.x-a.x;if(Math.abs(dx)<min){const push=(min-Math.abs(dx))/2,sgn=dx>=0?1:-1;a.x-=sgn*push;b.x+=sgn*push;}}
 for(const f of F){f.x=Math.max(60,Math.min(WORLD-60,f.x));}
 const sep=Math.abs(a.x-b.x)-(W-150);if(sep>0){const sgn=a.x<b.x?1:-1;a.x+=sgn*sep/2;b.x-=sgn*sep/2;}
 for(const f of F){const o=F[1-f.side];if(!(o.st==='hit'||o.st==='down'||o.st==='getup'))f.combo=0;if(f.comboShow&&--f.comboShow.t<=0)f.comboShow=null;}
 const target=Math.max(0,Math.min(WORLD-W,(a.x+b.x)/2-W/2));cam+=(target-cam)*0.12;
}
function postVoice(){if(winner<0)return;if(perfect&&!timeup){voice('v_perfect');return;}
 if(mode==='arcade')voice(winner===0?'v_win':'v_lose');else if(mode==='demo')voice('v_'+F[winner].def.id);else voice(winner===0?'v_p1':'v_p2');}
// ---------- menus
const MENUS={
 title:()=>[{label:'ARCADE  -  1 PLAYER',fn(){mode='arcade';toSelect();}},{label:'VERSUS  -  2 PLAYERS',fn(){mode='versus';toSelect();}},{label:'WATCH CPU vs CPU',fn(){mode='demo';sel=[Math.floor(Math.random()*6),0];sel[1]=(sel[0]+1+Math.floor(Math.random()*5))%6;beginVs();}},{label:'HOW TO PLAY',fn(){setScene('help');}}],
 result:()=>[{label:'REMATCH',fn(){beginVs();}},{label:'CHARACTER SELECT',fn(){toSelect();}},{label:'MAIN MENU',fn(){toTitle();}}],
 cont:()=>[{label:'RETRY',fn(){beginVs();}},{label:'MAIN MENU',fn(){toTitle();}}],
 pause:()=>[{label:'RESUME',fn(){paused=false;}},{label:'QUIT TO MENU',fn(){paused=false;toTitle();}}]
};
function menuStep(items){const n=items.length;if(mp('up')){mi=(mi+n-1)%n;SFX.ui();}if(mp('down')){mi=(mi+1)%n;SFX.ui();}if(mp('ok')){SFX.ok();items[mi].fn();}}
function menuDraw(items,x,y,gap,size){items.forEach((it,i)=>{const yy=y+i*gap,on=i===mi;
 if(on){ctx.fillStyle='rgba(255,225,74,.16)';ctx.fillRect(x-280,yy-gap*0.42,560,gap*0.84);ctx.fillStyle='#ffe14a';ctx.beginPath();ctx.moveTo(x-262,yy-12);ctx.lineTo(x-240,yy);ctx.lineTo(x-262,yy+12);ctx.fill();}
 T(it.label,x,yy,size,on?'#ffe14a':'#fff','center','#000');hot(x-280,yy-gap/2,560,gap,()=>{mi=i;SFX.ok();it.fn();});});}
function lockSel(i){locked[i]=true;SFX.ok();voice('v_'+ROSTER[sel[i]].id);}
function stepSelect(){
 const n=ROSTER.length,arc=mode==='arcade';
 const c0={l:pressed.KeyA||(arc&&pressed.ArrowLeft)||touchP.l,r:pressed.KeyD||(arc&&pressed.ArrowRight)||touchP.r,ok:pressed.KeyF||touchP.p||(arc&&(pressed.Enter||pressed.Space||pressed.KeyJ))};
 const c1={l:pressed.ArrowLeft,r:pressed.ArrowRight,ok:pressed.KeyJ||pressed.Enter};
 [c0,c1].forEach((c,i)=>{if(locked[i])return;if(c.l){sel[i]=(sel[i]+n-1)%n;SFX.ui();}if(c.r){sel[i]=(sel[i]+1)%n;SFX.ui();}if(c.ok)lockSel(i);});
 if(mp('back')){toTitle();return;}
 if(locked[0]&&locked[1]){lockT++;if(lockT>55){if(arc){ladder=[];for(let i=0;i<n;i++)if(i!==sel[0])ladder.push(i);for(let i=ladder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=ladder[i];ladder[i]=ladder[j];ladder[j]=t;}ladIdx=0;}beginVs();}}else lockT=0;
}
function step(){
 st++;
 if(scene==='load'){if(loaded>=total&&total>0){mkPortraits();toTitle();}}
 else if(scene==='title'){if(st===2)music('m_menu');const had=!!ac;menuStep(MENUS.title());}
 else if(scene==='help'){if(st>10&&(mp('ok')||mp('back'))){SFX.ui();toTitle();}}
 else if(scene==='select')stepSelect();
 else if(scene==='vs'){if(st===12)voice('v_'+ROSTER[sel[0]].id);if(st===80)voice('v_'+ROSTER[sel[1]].id);if(st>185||(st>30&&mp('ok')))startMatch();}
 else if(scene==='fight')stepFight();
 else if(scene==='result')menuStep(MENUS.result());
 else if(scene==='cont')menuStep(MENUS.cont());
 else if(scene==='ending'){if(st>90&&mp('ok'))toTitle();}
}

// ---------- drawing helpers
function T(s,x,y,size,col,al,stroke,sw){ctx.font='italic 900 '+size+'px Impact,"Arial Black","Segoe UI",Roboto,sans-serif';ctx.textAlign=al||'center';ctx.textBaseline='middle';
 if(stroke){ctx.lineJoin='round';ctx.lineWidth=sw||Math.max(3,size*0.16);ctx.strokeStyle=stroke;ctx.strokeText(s,x,y);}ctx.fillStyle=col;ctx.fillText(s,x,y);}
function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);}
function drawBG(i,camx,dim){const s=STAGES[i];const bw=s.img.width*(H+20)/s.img.height;const px=-(camx/(WORLD-W))*(bw-W-20)-10;ctx.drawImage(s.img,px,-10,bw,H+20);
 if(dim){ctx.fillStyle='rgba(8,6,20,'+dim+')';ctx.fillRect(0,0,W,H);}}
function drawSprite(def,name,x,y,scale,flip,alpha){const fr=def.fr[name];ctx.save();ctx.translate(x,y);ctx.scale(flip?-scale:scale,scale);if(alpha!=null)ctx.globalAlpha=alpha;ctx.drawImage(fr.img,-fr.ax,-fr.h,fr.w,fr.h);ctx.restore();}
function drawPor(def,x,y,r,flip,ring){ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(def.por,-r,-r,r*2,r*2);ctx.restore();ctx.strokeStyle=ring||'#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();}
function logo(x,y,size){const g=ctx.createLinearGradient(0,y-size/2,0,y+size/2);g.addColorStop(0,'#fff36b');g.addColorStop(0.5,'#ff9a1f');g.addColorStop(1,'#ff2d87');
 ctx.save();ctx.shadowColor='#ff2d87';ctx.shadowBlur=30;T('CLOUT CLASH',x+6,y+8,size,'#1a0b2e','center','#1a0b2e',size*0.2);ctx.restore();T('CLOUT CLASH',x,y,size,g,'center','#fff',size*0.07);}
function frameOf(f){const t=f.t;switch(f.st){
 case 'walk':return (t>>3)&1?'idle':'walk';
 case 'punch':return t<3?'idle':t<15?'punch':'idle';
 case 'kick':return t<5?'walk':t<24?'kick':'idle';
 case 'jump':return 'walk';case 'airkick':return 'kick';
 case 'special':case 'super':return t<6?'idle':'special';
 case 'block':case 'bstun':case 'getup':return 'block';
 case 'hit':return 'hit';
 case 'down':return (f.y>0||f.vy>0)?'hit':'ko';
 default:return 'idle';}}
function drawF(f){
 const name=frameOf(f),fr=f.def.fr[name],sx=f.x-cam;
 ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(sx,gY+4,(name==='ko'?120:74)*(1-Math.min(0.5,f.y/400)),13,0,0,7);ctx.fill();
 ctx.save();ctx.translate(sx,gY-f.y+6);
 let sys=1,rot=0,oy=0;
 if(f.st==='idle')sys=1+Math.sin(f.t*0.09)*0.012;
 else if(f.st==='walk')oy=-Math.abs(Math.sin(f.t*0.2))*5;
 else if(f.st==='win')oy=-Math.abs(Math.sin(f.t*0.12))*26;
 else if(f.st==='getup')sys=0.55+0.45*Math.min(1,f.t/14);
 else if(f.st==='down'&&name==='hit')rot=-0.75;
 else if(f.st==='hit')oy=0;
 ctx.translate((f.st==='hit'||f.st==='bstun')&&f.t<6?(Math.random()-0.5)*6:0,oy);
 ctx.scale(f.face*(name==='ko'&&f.def.koFlip?-1:1),sys);
 if(rot){ctx.translate(0,-fr.h/2);ctx.rotate(rot);ctx.translate(0,fr.h/2);}
 if(f.inv>0&&f.st!=='super'&&(f.t&2))ctx.globalAlpha=0.55;
 ctx.drawImage(fr.img,-fr.ax,-fr.h,fr.w,fr.h);
 if(f.fl>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=f.fl/8;ctx.drawImage(fr.img,-fr.ax,-fr.h,fr.w,fr.h);}
 if(f.st==='super'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.35+0.25*Math.sin(tick*0.6);ctx.drawImage(fr.img,-fr.ax,-fr.h,fr.w,fr.h);}
 ctx.restore();
}
function drawEnt(e){
 const x=e.x-cam,y=gY-e.y;ctx.save();
 if(e.t==='proj'){ctx.translate(x,y);const dir=Math.sign(e.vx)||1;
  if(e.k==='shaker'){ctx.rotate(e.rot*dir);ctx.fillStyle='#eaf6ff';ctx.strokeStyle='#123';ctx.lineWidth=3;rr(-11,-16,22,34,5);ctx.fill();ctx.stroke();ctx.fillStyle='#8b5a2b';ctx.fillRect(-8,0,16,14);ctx.fillStyle='#ff7a1a';rr(-12,-25,24,11,3);ctx.fill();ctx.stroke();}
  else if(e.k==='pixel'){ctx.shadowColor='#a855f7';ctx.shadowBlur=24;ctx.fillStyle='#fff';ctx.fillRect(-14,-14,28,28);ctx.fillStyle='#a855f7';ctx.fillRect(-22,-6,8,12);ctx.fillRect(14,-22,8,8);ctx.fillRect(14,14,8,8);ctx.fillStyle='#e9d5ff';ctx.fillRect(-8,-8,16,16);}
  else if(e.k==='lipstick'){ctx.scale(dir,1);ctx.rotate(Math.sin(e.rot)*0.08);ctx.shadowColor='#ff5fa8';ctx.shadowBlur=16;ctx.fillStyle='#111';rr(-30,-10,30,20,3);ctx.fill();ctx.fillStyle='#d4af37';ctx.fillRect(0,-9,10,18);ctx.fillStyle='#e11d48';ctx.beginPath();ctx.moveTo(10,-8);ctx.lineTo(26,-8);ctx.lineTo(34,2);ctx.lineTo(26,8);ctx.lineTo(10,8);ctx.closePath();ctx.fill();}
  else if(e.k==='wave'){ctx.scale(dir,1);ctx.translate(0,90);ctx.lineCap='round';
   for(let i=0;i<7;i++){ctx.strokeStyle=i%2?'#f5b942':'#ffe9a8';ctx.lineWidth=15;ctx.beginPath();const ox=-90+i*24;ctx.moveTo(ox-40,0);ctx.bezierCurveTo(ox-20,-120-i*8,ox+60,-235+Math.sin(e.rot+i)*16,ox+112,-150+i*6);ctx.stroke();}
   ctx.fillStyle='#e11d48';ctx.strokeStyle='#7f1d1d';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-8,125,24,0,0,7);ctx.fill();ctx.stroke();}
  else if(e.k==='plane'){ctx.scale(dir,1);ctx.strokeStyle='#223';ctx.lineWidth=3;
   ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.moveTo(-120,-6);ctx.lineTo(-152,-62);ctx.lineTo(-122,-62);ctx.lineTo(-78,-12);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#f4f6fb';ctx.beginPath();ctx.ellipse(0,0,132,25,0,0,7);ctx.fill();ctx.stroke();
   ctx.fillStyle='#cfd6e6';ctx.beginPath();ctx.moveTo(-10,6);ctx.lineTo(-72,64);ctx.lineTo(-40,64);ctx.lineTo(42,8);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#38bdf8';for(let i=0;i<7;i++)ctx.fillRect(-72+i*24,-11,12,9);ctx.beginPath();ctx.ellipse(104,-7,16,8,0,0,7);ctx.fill();}
 }
 else if(e.t==='beam'){const a=e.life/14,x2=e.dir>0?W+20:-20;ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle='rgba(34,211,238,'+a+')';ctx.lineWidth=26*a+4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,'+a+')';ctx.lineWidth=8*a+2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y);ctx.stroke();}
 else if(e.t==='ring'){const p=1-e.life/16;ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,255,255,'+(1-p)+')';ctx.lineWidth=12*(1-p)+2;ctx.beginPath();ctx.arc(x,y,30+p*360,0,7);ctx.stroke();}
 else if(e.t==='shock'){const p=1-e.life/26;ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const rad=Math.max(1,p*560-i*40);ctx.strokeStyle='rgba(255,140,40,'+(1-p)+')';ctx.lineWidth=10-i*3;ctx.beginPath();ctx.ellipse(x,gY,rad,rad*0.14,0,0,7);ctx.stroke();}}
 else if(e.t==='bolt'){if(e.delay>0){ctx.fillStyle='rgba(200,130,255,'+(0.35+0.3*Math.sin(tick*0.8))+')';ctx.beginPath();ctx.ellipse(x,gY,72,13,0,0,7);ctx.fill();}
  else{ctx.globalCompositeOperation='lighter';const a=e.life/14;ctx.lineJoin='round';ctx.beginPath();let py=-10;ctx.moveTo(x,py);while(py<gY){py+=52;ctx.lineTo(py>=gY?x:x+(Math.random()-0.5)*76,Math.min(py,gY));}
   ctx.strokeStyle='rgba(192,132,252,'+a+')';ctx.lineWidth=20*a+3;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,'+a+')';ctx.lineWidth=5;ctx.stroke();}}
 else if(e.t==='drone'){ctx.translate(x,y);ctx.fillStyle='#1f2937';rr(-28,-8,56,16,6);ctx.fill();ctx.fillStyle='#22d3ee';ctx.fillRect(-6,6,12,6);ctx.strokeStyle='#9ca3af';ctx.lineWidth=3;
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*26,-6);ctx.lineTo(s*40,-16);ctx.stroke();ctx.beginPath();ctx.ellipse(s*40,-18,22*Math.abs(Math.sin(tick*0.9))+4,3,0,0,7);ctx.stroke();}}
 else if(e.t==='bomb'){ctx.translate(x,y);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(0,0,14,0,7);ctx.fill();ctx.fillStyle=(tick&4)?'#f33':'#700';ctx.beginPath();ctx.arc(0,-4,5,0,7);ctx.fill();}
 ctx.restore();
}
function drawParts(){for(const p of parts){const a=p.life/p.max,x=p.x-cam;
 if(p.star){ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.beginPath();for(let i=0;i<8;i++){const ang=i*0.785+0.4,rad=i%2?p.r*0.35:p.r;ctx.lineTo(x+Math.cos(ang)*rad,p.y+Math.sin(ang)*rad);}ctx.fill();}
 else if(p.line){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=p.col;ctx.globalAlpha=a;ctx.lineWidth=p.r;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,p.y);ctx.lineTo(x-p.vx*2.5,p.y-p.vy*2.5);ctx.stroke();}
 else if(p.sq){ctx.globalAlpha=a;ctx.fillStyle=p.col;ctx.fillRect(x-p.r,p.y-p.r,p.r*2,p.r*2);}
 else{ctx.globalCompositeOperation=(p.col==='#bbb'||p.col==='#555')?'source-over':'lighter';ctx.globalAlpha=a*0.8;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(x,p.y,p.r*(0.5+a*0.5),0,7);ctx.fill();}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}}
function drawHUD(){
 for(const f of F){const L=f.side===0,bw=455,bx=L?112:W-112-bw,by=40,bh=30,p=Math.max(0,f.hp/f.def.hp),dp=Math.max(0,f.dhp/f.def.hp);
  ctx.fillStyle='rgba(0,0,0,.72)';rr(bx-6,by-6,bw+12,bh+12,6);ctx.fill();ctx.fillStyle='#3b0f14';ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle='#ff3b3b';if(L)ctx.fillRect(bx+bw*(1-dp),by,bw*dp,bh);else ctx.fillRect(bx,by,bw*dp,bh);
  const g=ctx.createLinearGradient(0,by,0,by+bh);if(p<0.25){g.addColorStop(0,(tick&8)?'#ff8a3d':'#ffd23d');g.addColorStop(1,'#d9480f');}else{g.addColorStop(0,'#fff36b');g.addColorStop(0.5,'#ffd23d');g.addColorStop(1,'#3ddc5a');}
  ctx.fillStyle=g;if(L)ctx.fillRect(bx+bw*(1-p),by,bw*p,bh);else ctx.fillRect(bx,by,bw*p,bh);
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(bx,by,bw,bh);
  drawPor(f.def,L?58:W-58,58,44,!L,f.def.color);
  T(f.def.name,L?bx:bx+bw,by+bh+22,24,'#fff',L?'left':'right','#000');
  T(f.cpu?'CPU':(L?'P1':'P2'),L?bx+bw-86:bx+90,by+bh+22,18,L?'#5fd4ff':'#ff7a7a','center','#000');
  for(let i=0;i<2;i++){const px=L?bx+bw-14-i*26:bx+14+i*26;ctx.fillStyle=i<f.wins?'#ffe14a':'rgba(0,0,0,.6)';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,by+bh+22,9,0,7);ctx.fill();ctx.stroke();}
  const mw=300,mx=L?60:W-60-mw,my=H-44,full=f.meter>=100;
  ctx.fillStyle='rgba(0,0,0,.72)';rr(mx-4,my-4,mw+8,22,5);ctx.fill();
  ctx.fillStyle=full?((tick&8)?'#fff':f.def.color):f.def.color;const fw=mw*f.meter/100;if(L)ctx.fillRect(mx,my,fw,14);else ctx.fillRect(mx+mw-fw,my,fw,14);
  ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.strokeRect(mx,my,mw,14);
  T(full?'SUPER READY!  '+f.def.suName:'SUPER',L?mx:mx+mw,my-16,full?19:15,full?'#ffe14a':'#ddd',L?'left':'right','#000');
  if(f.comboShow&&f.comboShow.n>=2){const cs=f.comboShow,sc=1+Math.max(0,(cs.t-70))*0.05;T(cs.n+' HITS!',L?150:W-150,230,56*sc,'#ffe14a','center','#b3001b');}
 }
 ctx.fillStyle='rgba(0,0,0,.78)';rr(W/2-46,22,92,66,10);ctx.fill();ctx.strokeStyle='#ffe14a';ctx.lineWidth=3;ctx.stroke();
 const sec=Math.max(0,Math.ceil(timer/60));T(String(sec),W/2,58,48,sec<=10?'#ff5252':'#fff','center','#000');
 T(STAGES[stageIdx].name,W/2,H-22,14,'rgba(255,255,255,.7)','center');
}
function bannerText(s,sub,lt,col){const sc=1+Math.max(0,12-lt)*0.09;ctx.save();ctx.translate(W/2,H*0.4);ctx.scale(sc,sc);ctx.globalAlpha=Math.min(1,lt/6);
 T(s,5,6,118,'rgba(0,0,0,.6)','center');T(s,0,0,118,col||'#fff36b','center','#b3001b',14);if(sub)T(sub,0,96,50,'#fff','center','#000');ctx.restore();}
function renderFight(){
 let ox=0,oy=0;if(shake>0&&!paused){ox=(Math.random()-0.5)*shake;oy=(Math.random()-0.5)*shake;}
 ctx.save();ctx.translate(ox,oy);drawBG(stageIdx,cam,0.12);
 if(freeze>0){ctx.fillStyle='rgba(0,0,10,.62)';ctx.fillRect(-20,-20,W+40,H+40);}
 for(const e of ents)if(e.t==='shock'||e.t==='bolt'&&e.delay>0)drawEnt(e);
 const atk=s=>s==='punch'||s==='kick'||s==='airkick'||s==='special'||s==='super';
 const first=atk(F[0].st)&&!atk(F[1].st)?1:0;drawF(F[first]);drawF(F[1-first]);
 for(const e of ents)if(!(e.t==='shock'||e.t==='bolt'&&e.delay>0))drawEnt(e);
 drawParts();ctx.restore();
 if(flashA>0){ctx.fillStyle='rgba(255,255,255,'+flashA+')';ctx.fillRect(0,0,W,H);}
 drawHUD();
 if(phase==='intro'){if(pt<70)bannerText(round>=3?'FINAL ROUND':'ROUND '+round,null,pt);else bannerText('FIGHT!',null,pt-70,'#fff');}
 else if(phase==='ko')bannerText('K.O.',null,pt,'#ff5252');
 else if(phase==='post'){if(timeup&&pt<55)bannerText('TIME UP',null,pt);else if(winner<0)bannerText('DRAW',null,pt);else bannerText(F[winner].def.short+' WINS',perfect&&!timeup?'PERFECT!':'"'+F[winner].def.quote+'"',timeup?pt-55:pt);}
 if(freeze>0&&freezeInfo){const f=freezeInfo.f,t=freezeInfo.t,L=f.side===0;ctx.save();const slide=Math.min(1,t/8);
  ctx.fillStyle=f.def.color;ctx.globalAlpha=0.9;ctx.beginPath();const y0=H*0.56;ctx.moveTo(0,y0+30);ctx.lineTo(W,y0-30);ctx.lineTo(W,y0+90);ctx.lineTo(0,y0+150);ctx.fill();ctx.globalAlpha=1;
  drawPor(f.def,L?-120+slide*260:W+120-slide*260,y0+60,92,!L,'#fff');
  T(f.def.suName+'!',L?W*0.56:W*0.44,y0+58,86,'#fff','center','#000',12);ctx.restore();}
 if(paused){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);T('PAUSED',W/2,220,96,'#fff36b','center','#b3001b');menuDraw(MENUS.pause(),W/2,380,74,44);}
}
function infoBlock(d,x,al,tag,col){T(tag,x,64,22,col,al,'#000');T(d.name,x,104,50,'#fff',al,'#000');T(d.niche+' INFLUENCER',x,146,22,d.color,al,'#000');
 T('SPECIAL: '+d.spName,x,180,19,'#ddd',al,'#000');T('SUPER: '+d.suName,x,206,19,'#ddd',al,'#000');}
function render(){
 hots=[];ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;
 if(scene==='load'){ctx.fillStyle='#0b0915';ctx.fillRect(0,0,W,H);T('LOADING',W/2,H/2-30,48,'#fff');ctx.fillStyle='#333';ctx.fillRect(W/2-200,H/2+20,400,14);ctx.fillStyle='#ffe14a';ctx.fillRect(W/2-200,H/2+20,400*(total?loaded/total:0),14);return;}
 if(scene==='fight'){renderFight();return;}
 const t=st;
 if(scene==='title'){drawBG(0,210+Math.sin(t*0.004)*200,0.5);
  const a=ROSTER[Math.floor(t/260)%6],b=ROSTER[(Math.floor(t/260)+3)%6];
  drawSprite(a,(t>>5)&1?'idle':'special',190,650,1.25,false);drawSprite(b,(t>>5)&1?'kick':'idle',W-190,650,1.25,true);
  logo(W/2,150+Math.sin(t*0.05)*5,150);T('THE INFLUENCER FIGHTING CHAMPIONSHIP',W/2,246,30,'#fff','center','#000');
  menuDraw(MENUS.title(),W/2,360,70,40);
  T('W/S or UP/DOWN to choose  -  ENTER / F to confirm  -  M mute  -  ESC pause',W/2,H-28,17,'rgba(255,255,255,.75)','center','#000',3);return;}
 if(scene==='help'){drawBG(1,200,0.78);T('HOW TO PLAY',W/2,70,64,'#fff36b','center','#b3001b');
  const rows=[['MOVE','A / D','LEFT / RIGHT'],['JUMP','W','UP'],['GUARD','S  (or hold back)','DOWN  (or hold back)'],['PUNCH','F','J'],['KICK','G','K'],['SPECIAL POWER','H','L'],['SUPER (meter full)','R','I']];
  T('PLAYER 1',W/2-60,140,26,'#5fd4ff','center','#000');T('PLAYER 2',W/2+300,140,26,'#ff7a7a','center','#000');
  rows.forEach((r,i)=>{const y=186+i*44;ctx.fillStyle=i%2?'rgba(255,255,255,.06)':'rgba(255,255,255,.12)';ctx.fillRect(170,y-20,940,40);T(r[0],200,y,24,'#fff','left','#000');T(r[1],W/2-60,y,24,'#ffe14a','center','#000');T(r[2],W/2+300,y,24,'#ffe14a','center','#000');});
  const tips=['COMBO: Punch, Punch, Punch chains into a launcher. Kick cancels a landed punch.','Jump + Punch/Kick = air kick. Hits on an airborne rival juggle.','Dealing and taking damage fills SUPER. Each fighter has a unique niche super.','In 1-player modes both key sets work. First to win 2 rounds takes the match.','Touch screen: on-screen buttons appear on first tap.'];
  tips.forEach((s,i)=>T(s,W/2,516+i*30,20,'#eee','center','#000',3));T('PRESS ENTER TO GO BACK',W/2,H-26,22,(t&32)?'#fff':'#ffe14a','center','#000');hot(0,0,W,H,()=>{toTitle();});return;}
 if(scene==='select'){drawBG(2,220,0.72);T('CHOOSE YOUR FIGHTER',W/2,34,34,'#fff36b','center','#b3001b');
  const d0=ROSTER[sel[0]],d1=ROSTER[sel[1]],arc=mode==='arcade';
  drawSprite(d0,locked[0]?'special':((t>>4)&1?'idle':'walk'),530,478,1.1,false);infoBlock(d0,40,'left','PLAYER 1'+(locked[0]?'  -  READY!':''),'#5fd4ff');
  if(arc){T('ARCADE LADDER',W-40,104,44,'#fff','right','#000');T('Defeat all 5 rival creators',W-40,146,22,'#ffe14a','right','#000');T('to rule the algorithm.',W-40,174,22,'#ffe14a','right','#000');T('?',W-250,340,260,'rgba(255,255,255,.25)','center','#000');}
  else{drawSprite(d1,locked[1]?'special':((t>>4)&1?'idle':'walk'),W-530,478,1.1,true);infoBlock(d1,W-40,'right','PLAYER 2'+(locked[1]?'  -  READY!':''),'#ff7a7a');}
  const cw=150,gap=18,x0=(W-(6*cw+5*gap))/2,cy=500;
  ROSTER.forEach((d,i)=>{const x=x0+i*(cw+gap);ctx.drawImage(d.por,x,cy,cw,cw);const s0=sel[0]===i,s1=!arc&&sel[1]===i;
   ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.5)';ctx.strokeRect(x,cy,cw,cw);
   if(s0){ctx.lineWidth=7;ctx.strokeStyle='#5fd4ff';ctx.strokeRect(x-3,cy-3,cw+6,cw+6);T('1P',x+22,cy+16,24,'#5fd4ff','center','#000');}
   if(s1){ctx.lineWidth=7;ctx.strokeStyle='#ff7a7a';ctx.strokeRect(x-(s0?9:3),cy-(s0?9:3),cw+(s0?18:6),cw+(s0?18:6));T('2P',x+cw-22,cy+16,24,'#ff7a7a','center','#000');}
   T(d.short,x+cw/2,cy+cw-14,22,'#fff','center','#000');T(d.niche,x+cw/2,cy+cw+18,15,d.color,'center','#000',3);
   hot(x,cy,cw,cw+30,()=>{const p=!locked[0]?0:(!locked[1]?1:-1);if(p<0)return;if(sel[p]===i)lockSel(p);else{sel[p]=i;SFX.ui();}});});
  T(arc?'A/D or ARROWS: choose   F / ENTER: confirm   ESC: back':'P1: A/D + F      P2: ARROWS + J      ESC: back',W/2,H-16,17,'rgba(255,255,255,.8)','center','#000',3);return;}
 if(scene==='vs'){const d0=ROSTER[sel[0]],d1=ROSTER[sel[1]];drawBG(stageIdx,210,0.6);
  ctx.globalAlpha=0.55;ctx.fillStyle=d0.color;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W/2+90,0);ctx.lineTo(W/2-90,H);ctx.lineTo(0,H);ctx.fill();ctx.fillStyle=d1.color;ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W/2+90,0);ctx.lineTo(W/2-90,H);ctx.lineTo(W,H);ctx.fill();ctx.globalAlpha=1;
  const sl=Math.min(1,t/14);drawSprite(d0,'idle',-200+sl*500,660,1.6,false);drawSprite(d1,'idle',W+200-sl*500,660,1.6,true);
  T('VS',W/2,H/2,190,'#fff36b','center','#b3001b',22);
  T(d0.name,40,70,54,'#fff','left','#000');T(d0.niche,40,118,26,'#fff','left','#000');T(d1.name,W-40,H-110,54,'#fff','right','#000');T(d1.niche,W-40,H-62,26,'#fff','right','#000');
  T(STAGES[stageIdx].name,W/2,H-28,22,'#fff','center','#000');
  if(mode==='arcade')T('MATCH '+(ladIdx+1)+' / '+ladder.length,W/2,40,30,'#ffe14a','center','#000');hot(0,0,W,H,()=>{if(st>30)startMatch();});return;}
 if(scene==='result'||scene==='cont'||scene==='ending'){
  const w=scene==='cont'?1:(scene==='ending'?0:(F[0].wins>=2?0:1)),d=F[w]?F[w].def:ROSTER[sel[0]];drawBG(stageIdx,210,0.7);
  drawSprite(d,'idle',300,640-Math.abs(Math.sin(t*0.1))*18,1.5,false);
  if(scene==='ending'){logo(W/2+180,120,84);T('CHAMPION OF THE ALGORITHM',W/2+180,230,44,'#fff','center','#000');T(d.name,W/2+180,300,64,d.color,'center','#000');T('"'+d.quote+'"',W/2+180,366,28,'#eee','center','#000');
   T('10 BILLION VIEWS. ZERO RIVALS LEFT.',W/2+180,440,26,'#ffe14a','center','#000');if(t>90)T('PRESS ENTER',W/2+180,560,30,(t&32)?'#fff':'#ffe14a','center','#000');
   for(let i=0;i<60;i++){const cx=(i*211+t*(1+i%3))%W,cyy=(i*97+t*(2+i%4))%H;ctx.fillStyle=['#ffe14a','#ff2d87','#22d3ee','#a855f7'][i%4];ctx.fillRect(cx,cyy,8,14);}
   hot(0,0,W,H,()=>{if(st>90)toTitle();});return;}
  if(scene==='cont'){T('YOU LOSE',W/2+180,150,110,'#ff5252','center','#000');T(d.name+' takes your subscribers.',W/2+180,250,30,'#fff','center','#000');menuDraw(MENUS.cont(),W/2+180,400,80,46);return;}
  T((w===0?'PLAYER 1':'PLAYER 2')+' WINS',W/2+180,130,84,'#fff36b','center','#b3001b');T(d.name,W/2+180,220,50,d.color,'center','#000');T('"'+d.quote+'"',W/2+180,276,26,'#eee','center','#000');menuDraw(MENUS.result(),W/2+180,400,74,42);return;}
}
let last=0,acc=0;
function loop(ts){const dt=Math.min(100,ts-last);last=ts;acc+=dt;let n=0;
 while(acc>=16.667&&n<4){try{step();}catch(e){console.error('step',e&&e.stack||e);}acc-=16.667;n++;for(const k in pressed)delete pressed[k];for(const k in touchP)delete touchP[k];}
 if(n===4)acc=0;try{render();}catch(e){console.error('render',e&&e.stack||e);}requestAnimationFrame(loop);}
window.__cc={scene:()=>scene,phase:()=>phase,F:()=>F,info:()=>({scene:scene,phase:phase,round:round,timer:timer,f:F.map(f=>({id:f.def.id,hp:Math.round(f.hp),st:f.st,wins:f.wins,meter:Math.round(f.meter),x:Math.round(f.x)})),ents:ents.length,loaded:loaded,total:total}),
 press:c=>{pressed[c]=true;},end:w=>{matchEnd(w);},setScene:s=>{setScene(s);},hold:(c,v)=>{keys[c]=v;},start:(a,b,m,stg)=>{mode=m||'demo';sel=[a,b];ladder=[b];ladIdx=0;stageIdx=stg||0;startMatch();},meter:()=>{F.forEach(f=>{f.meter=100;});},stepN:n=>{for(let i=0;i<n;i++){step();for(const k in pressed)delete pressed[k];}render();}};
requestAnimationFrame(loop);
})();
