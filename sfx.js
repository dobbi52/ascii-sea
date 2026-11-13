// 글자 풍경 소리: 파일 없이 Web Audio로 직접 만드는 효과음과 배경음
window.SFX=(()=>{
 let ac=null,master=null,on=false,scene=null,amb={},ambT=null,lvl={night:0,rain:0},last={};
 let noiseBuf=null,brownBuf=null;
 const R=Math.random;
 function init(){
  if(ac)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  ac=new AC();master=ac.createGain();master.gain.value=0;
  const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;
  master.connect(comp).connect(ac.destination);
  const len=ac.sampleRate*2;noiseBuf=ac.createBuffer(1,len,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=R()*2-1;
  const l2=ac.sampleRate*4;brownBuf=ac.createBuffer(1,l2,ac.sampleRate);const b=brownBuf.getChannelData(0);let x=0;for(let i=0;i<l2;i++){x=(x+.02*(R()*2-1))/1.02;b[i]=x*3.5;}
 }
 function env(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dur);}
 function osc(type,f0,f1,dur,vol,delay){const t=ac.currentTime+(delay||0),o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);env(g,t,.005,vol,dur);o.connect(g).connect(master);o.start(t);o.stop(t+dur+.1);}
 function nz(type,freq,q,dur,vol,delay,f1,buf){const t=ac.currentTime+(delay||0),s=ac.createBufferSource();s.buffer=buf||noiseBuf;s.loop=true;
  const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(freq,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);fl.Q.value=q;
  const g=ac.createGain();env(g,t,.012,vol,dur);s.connect(fl).connect(g).connect(master);s.start(t,R()*1.5);s.stop(t+dur+.1);}
 const S={
  plop:()=>{osc('sine',720,170,.2,.32);nz('bandpass',1300,1.2,.1,.08);},
  bubble:o=>{const p=(o&&o.p)||1;osc('sine',280*p,900*p,.07,.13);},
  pop:()=>osc('sine',900,1600,.04,.08),
  gulp:()=>{osc('sine',240,520,.08,.16);},
  splash:()=>{nz('bandpass',1400,.8,.4,.22);osc('sine',380,110,.3,.14);},
  whoosh:o=>{const v=Math.min(1,(o&&o.v)||.5);nz('bandpass',350,1.3,.45,.06+.16*v,0,1300);},
  wind:o=>{const v=Math.min(1,(o&&o.v)||.5);nz('bandpass',500,.7,.7,.05+.12*v,0,900);},
  drip:()=>osc('sine',1500,700,.06,.1),
  tick:()=>nz('highpass',3200,.7,.025,.14),
  peck:()=>{nz('bandpass',2600,5,.025,.2);},
  chime:o=>{const f=(o&&o.f)||880;osc('sine',f,0,1.5,.1);osc('triangle',f*2.01,0,.7,.03);},
  tension:()=>{const t=ac.currentTime,g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=260;
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+1.2);g.gain.linearRampToValueAtTime(.0001,t+4);
   [55,58.3].forEach(f=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(lp);o.start(t);o.stop(t+4.1);});lp.connect(g).connect(master);},
  chirp:()=>{const b=2000+R()*900;for(let k=0;k<2+(R()*3|0);k++)osc('sine',b+R()*300,b*1.6,.06,.06,k*.1);},
  flutter:()=>{for(let k=0;k<9;k++)nz('bandpass',800+R()*300,1,.03,.12,k*.035);},
  crickets:()=>{for(let k=0;k<4;k++)osc('sine',4300+R()*200,0,.03,.025,k*.06);},
  thud:()=>{osc('sine',95,38,.35,.42);nz('lowpass',260,.7,.25,.22);},
  scratch:()=>nz('highpass',2600,.6,.05,.06),
  bite:()=>{nz('bandpass',3000,5,.02,.18);nz('bandpass',2500,5,.02,.15,.06);},
  buzz:()=>{for(let k=0;k<14;k++)osc('sawtooth',170+R()*20,0,.025,.035,k*.03);},
  thunder:()=>{nz('lowpass',160,.4,3,.55,0,90,brownBuf);nz('lowpass',700,.5,.35,.28);},
  rumble:()=>nz('lowpass',110,.7,.9,.3,0,0,brownBuf),
  egg:()=>osc('sine',620,980,.06,.08),
  glitch:()=>{for(let k=0;k<7;k++)osc('square',200+R()*1800,0,.025,.04,k*.045);},
  croak:()=>{for(let k=0;k<2;k++){const t=ac.currentTime+k*.16,o=ac.createOscillator(),lp=ac.createBiquadFilter(),g=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(140,t);o.frequency.linearRampToValueAtTime(95,t+.12);lp.type='bandpass';lp.frequency.value=600;lp.Q.value=3;env(g,t,.01,.22,.12);o.connect(lp).connect(g).connect(master);o.start(t);o.stop(t+.2);}},
  quack:()=>{const t=ac.currentTime,o=ac.createOscillator(),bp=ac.createBiquadFilter(),g=ac.createGain();o.type='square';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(300,t+.15);bp.type='bandpass';bp.frequency.value=1200;bp.Q.value=4;env(g,t,.01,.12,.16);o.connect(bp).connect(g).connect(master);o.start(t);o.stop(t+.22);},
  chirpBird:()=>{for(let k=0;k<3;k++)osc('sine',2600,3900,.05,.07,k*.09);},
 };
 function play(name,o){if(!on||!ac||!S[name])return;const now=performance.now(),min=(o&&o.min)||40;if(last[name]&&now-last[name]<min)return;last[name]=now;try{S[name](o);}catch(e){}}
 function loopNoise(buf,type,freq,q,vol){const s=ac.createBufferSource();s.buffer=buf;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=freq;fl.Q.value=q;
  const g=ac.createGain();g.gain.setValueAtTime(.0001,ac.currentTime);g.gain.linearRampToValueAtTime(vol+.0001,ac.currentTime+1.5);s.connect(fl).connect(g).connect(master);s.start();return{s,fl,g};}
 function stopAmb(){if(!ac)return;const t=ac.currentTime;for(const k in amb){const a=amb[k];try{a.g.gain.cancelScheduledValues(t);a.g.gain.setValueAtTime(a.g.gain.value,t);a.g.gain.linearRampToValueAtTime(.0001,t+.6);a.s.stop(t+.7);}catch(e){}}amb={};clearInterval(ambT);ambT=null;}
 function lvlTo(a,v){if(a)a.g.gain.linearRampToValueAtTime(Math.max(.0001,v),ac.currentTime+.6);}
 function startAmb(sc){if(!on||!ac)return;stopAmb();
  if(sc==='sea'){amb.a=loopNoise(brownBuf,'lowpass',240,.7,.32);
   ambT=setInterval(()=>{if(R()<.35)S.bubble({p:.6+R()*.8});if(lvl.night>.5&&R()<.18)S.chime({f:[660,880,990,1320][R()*4|0]});},700);}
  else if(sc==='forest'){amb.a=loopNoise(noiseBuf,'bandpass',650,.5,.05);amb.r=loopNoise(noiseBuf,'highpass',1800,.5,0);
   ambT=setInterval(()=>{amb.a.fl.frequency.linearRampToValueAtTime(450+R()*500,ac.currentTime+.8);lvlTo(amb.r,lvl.rain*.1);
    if(lvl.night<.5){if(R()<.3)S.chirp();}else{if(R()<.6)S.crickets();if(R()<.12)S.croak();}},900);}
  else if(sc==='ant'){amb.a=loopNoise(brownBuf,'lowpass',130,.7,.28);amb.r=loopNoise(noiseBuf,'highpass',1600,.5,0);
   ambT=setInterval(()=>{lvlTo(amb.r,lvl.rain*.12);if(R()<.35)S.scratch();if(lvl.night>.5&&R()<.4)S.crickets();},500);}
 }
 function setOn(v){on=!!v;if(on){init();if(!ac){on=false;return false;}ac.resume&&ac.resume();master.gain.cancelScheduledValues(ac.currentTime);master.gain.linearRampToValueAtTime(.85,ac.currentTime+.4);startAmb(scene);}
  else if(ac){master.gain.cancelScheduledValues(ac.currentTime);master.gain.linearRampToValueAtTime(0,ac.currentTime+.3);setTimeout(()=>{if(!on)stopAmb();},400);}return on;}
 function setScene(sc){if(sc===scene)return;scene=sc;lvl={night:0,rain:0};if(on)startAmb(sc);}
 function set(k,v){lvl[k]=v;}
 return{play,set,setOn,setScene,isOn:()=>on};
})();
