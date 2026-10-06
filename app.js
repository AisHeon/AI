(() => {
  const DURATION = 90;
  const TAU = Math.PI * 2;
  const canvas = document.querySelector('#stage');
  const ctx = canvas.getContext('2d');
  const play = document.querySelector('#play-animation');
  const pause = document.querySelector('#pause');
  const restart = document.querySelector('#restart');
  const timeline = document.querySelector('#timeline');
  const download = document.querySelector('#download-mp4');
  const current = document.querySelector('#current-time');
  const status = document.querySelector('#status');
  const kicker = document.querySelector('#scene-kicker');
  const title = document.querySelector('#scene-title');
  const description = document.querySelector('#scene-description');
  let time = 0, playing = false, last = 0, raf = 0;

  const scenes = [
    {start:0,end:14,kicker:'A LIVING SYSTEM',title:'A quiet world, in motion',description:'Inside a single cell, thousands of tiny decisions are already underway.'},
    {start:14,end:30,kicker:'01 / THE ENCOUNTER',title:'A signal meets the membrane',description:'A bright messenger finds its receptor and changes the cell’s rhythm.'},
    {start:30,end:48,kicker:'02 / CROSSING THE BOUNDARY',title:'The membrane opens a path',description:'Proteins shift, ions flow, and information travels inward.'},
    {start:48,end:68,kicker:'03 / THE CORE',title:'Instructions become action',description:'The nucleus answers with a new pattern: copy, translate, respond.'},
    {start:68,end:82,kicker:'04 / THE RESPONSE',title:'One cell becomes many signals',description:'Energy ripples through the cytoplasm and the system adapts.'},
    {start:82,end:90,kicker:'05 / CONTINUOUS',title:'Life keeps moving',description:'Every ending is another beginning in the microscopic world.'}
  ];
  const particles = Array.from({length:90},(_,i)=>({a:(i*2.399)%TAU,r:30+(i*37)%390,s:.5+(i%5)/5,phase:i*1.7}));
  const organelles = Array.from({length:15},(_,i)=>({a:i*TAU/15,r:210+(i%4)*35,w:16+(i%4)*7,h:8+(i%3)*5,spin:i*.7}));

  function fit(){const d=Math.min(devicePixelRatio||1,2); canvas.width=1920*d;canvas.height=1080*d;ctx.setTransform(d,0,0,d,0,0)}
  addEventListener('resize',fit); fit();
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  function sceneFor(t){return scenes.find(s=>t>=s.start&&t<s.end)||scenes.at(-1)}
  function updateCopy(){const s=sceneFor(time); if(kicker.textContent!==s.kicker){kicker.textContent=s.kicker;title.textContent=s.title;description.textContent=s.description}current.textContent=fmt(time);timeline.value=time}
  function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
  function draw(t){
    const w=1920,h=1080,cx=960,cy=550;ctx.clearRect(0,0,w,h);
    const bg=ctx.createRadialGradient(cx,cy,50,cx,cy,950);bg.addColorStop(0,'#12384a');bg.addColorStop(.55,'#061923');bg.addColorStop(1,'#020a10');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=.3;for(let i=0;i<12;i++){const x=(i*223+t*8)%2100-100;circle(x,120+(i*113)%900,2+(i%3), '#79e6d3')}ctx.globalAlpha=1;
    const s=sceneFor(t), local=(t-s.start)/(s.end-s.start), pulse=.5+.5*Math.sin(t*2.2), grow=ease(clamp((t-14)/16));
    // outer living cell and membrane
    ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(t*.12)*.025);ctx.scale(1+.018*Math.sin(t*.8),1+.014*Math.cos(t*.7));
    ctx.beginPath();for(let i=0;i<=80;i++){const a=i/80*TAU,r=445+15*Math.sin(a*3+t*.25)+10*Math.cos(a*7-t*.13);const x=Math.cos(a)*r,y=Math.sin(a)*r*.68;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fillStyle='rgba(45,176,178,.11)';ctx.fill();ctx.lineWidth=8;ctx.strokeStyle='#47c8c0';ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle='rgba(174,255,234,.34)';ctx.stroke();ctx.restore();
    // particles inside
    for(const p of particles){const a=p.a+t*p.s*.08,x=cx+Math.cos(a)*p.r,y=cy+Math.sin(a)*p.r*.68;circle(x,y,1.5+(p.s),`rgba(141,240,218,${.17+.22*p.s})`)}
    // organelles
    for(const o of organelles){const a=o.a+t*.04,x=cx+Math.cos(a)*o.r,y=cy+Math.sin(a)*o.r*.68;ctx.save();ctx.translate(x,y);ctx.rotate(o.spin+Math.sin(t*.2));ctx.beginPath();ctx.ellipse(0,0,o.w,o.h,0,0,TAU);ctx.fillStyle='rgba(244,164,103,.3)';ctx.fill();ctx.strokeStyle='#e99e76';ctx.stroke();ctx.restore()}
    // nucleus + DNA
    const nr=190+8*Math.sin(t*.5);circle(cx,cy,nr,'rgba(81,104,211,.26)','#9bafff');circle(cx,cy,nr-11,'rgba(76,62,171,.22)','rgba(161,177,255,.4)');
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.08);ctx.lineWidth=4;for(let x=-72;x<=72;x+=8){const y=Math.sin(x*.12+t*1.5)*55;ctx.strokeStyle=x%16?'#74e8d6':'#f6b27c';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+10,y+24*Math.sin(x*.2));ctx.stroke()}ctx.restore();
    // signal molecule and route after encounter
    const signalProgress=clamp((t-10)/25);const sx=230+signalProgress*520,sy=cy-80+Math.sin(t*2)*25;for(let i=0;i<7;i++){const xx=sx-i*24,yy=sy+Math.sin(t*3+i)*10;circle(xx,yy,7+(i===0?4:0),i===0?'#ffe08b':'#ffae80','#fff0bf')}
    if(t>14){ctx.save();ctx.setLineDash([12,18]);ctx.lineDashOffset=-t*32;ctx.strokeStyle='rgba(255,225,143,.7)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(520,cy-80);ctx.quadraticCurveTo(750,cy-40,cx-185,cy);ctx.stroke();ctx.restore()}
    // arrows / response waves
    const response=clamp((t-48)/28);if(response>0){for(let i=0;i<4;i++){const rr=nr+35+i*37+Math.sin(t*2+i)*4;ctx.beginPath();ctx.arc(cx,cy,rr,-Math.PI*.8,-Math.PI*.2);ctx.strokeStyle=`rgba(113,229,208,${(1-i/5)*response*.7})`;ctx.lineWidth=5;ctx.stroke()}}
    if(s.end-t<2&&t<DURATION){ctx.fillStyle=`rgba(3,10,15,${clamp(1-(s.end-t)/2)})`;ctx.fillRect(0,0,w,h)}
    if(t>88){ctx.fillStyle=`rgba(3,10,15,${clamp((t-88)/2)})`;ctx.fillRect(0,0,w,h)}
  }
  function loop(now){if(!playing)return;const dt=Math.min((now-last)/1000,.08);last=now;time=Math.min(DURATION,time+dt);draw(time);updateCopy();if(time>=DURATION){playing=false;status.textContent='Complete — replay whenever you like';play.innerHTML='▶ <span>Play Again</span>';return}raf=requestAnimationFrame(loop)}
  function start(){if(time>=DURATION)time=0;playing=true;status.textContent='Playing';play.innerHTML='Ⅱ <span>Playing</span>';last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
  play.onclick=start;pause.onclick=()=>{playing=false;status.textContent='Paused';play.innerHTML='▶ <span>Play Animation</span>';cancelAnimationFrame(raf)};restart.onclick=()=>{playing=false;time=0;draw(time);updateCopy();status.textContent='Ready to play';play.innerHTML='▶ <span>Play Animation</span>';cancelAnimationFrame(raf)};timeline.oninput=()=>{playing=false;time=Number(timeline.value);draw(time);updateCopy();status.textContent='Scrubbed — press play to continue';play.innerHTML='▶ <span>Play Animation</span>'};
  download.onclick=()=>{const url='assets/cell-signal-90s-1080p.mp4';const a=document.createElement('a');a.href=url;a.download='cell-signal-90s-1080p.mp4';a.click();status.textContent='MP4 download started'};
  draw(0);updateCopy();
})();
