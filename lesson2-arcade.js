(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('arcadeCanvas'), c = canvas.getContext('2d');
  const studio = $('studioCanvas'), sc = studio.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('fxToggle').checked = !reduced;
  const assistLabel = document.createElement('label');
  assistLabel.className = 'effects-toggle';
  const assist = document.createElement('input');
  assist.type = 'checkbox';assist.id = 'jumpAssist';
  assistLabel.append(assist,document.createTextNode('練習輔助（自動跳躍）'));
  document.querySelector('.engine-controls').appendChild(assistLabel);
  let world = 'obby', raf = 0, running = false, previous = 0, clock = 0;
  let distance = 0, height = 0, velocity = 0, station = 0, checkpoint = 0, particles = [], shake = 0;
  let detective = 0, chips = new Set(), lenses = new Set();
  const stations = [
    {at:650,title:'錄影站 01 · 開始前',question:'要讓朋友知道你在挑戰什麼，先拍哪個？',choices:['只有角色的鞋子','起點、終點和中間的障礙','十秒鐘的天空'],ok:1,reason:'全景先交代場地和目標。觀眾不用玩過，也知道你要跨過什麼。'},
    {at:1400,title:'錄影站 02 · 差點失敗',question:'你差一點踩空。哪一段最值得保留？',choices:['離平台邊緣很近 → 起跳 → 落地','起跳前一直站著的時間','只有落地後的角色'],ok:0,reason:'保留危機、動作和結果，觀眾才知道這一跳有多難。等待可以縮短。'},
    {at:2200,title:'錄影站 03 · 抵達終點',question:'最後一段要怎麼拍，故事才完整？',choices:['再放一次空白天空','抵達終點後立刻黑畫面','碰到終點旗子，再留一點開心的反應'],ok:2,reason:'結果和反應一起留，讓觀眾有時間感受到成功。'}
  ];
  const obstacles = [340,1020,1750,1920];
  const shots = [
    {id:'goal',name:'起點與目標',icon:'⚑',sec:2,detail:'交代這次要跑去哪裡',scene:'goal'},
    {id:'wait',name:'站著等一下',icon:'⌛',sec:6,detail:'沒有新的事情發生',scene:'wait'},
    {id:'danger',name:'差點踩空',icon:'⚠',sec:2,detail:'讓觀眾知道危機',scene:'danger'},
    {id:'jump',name:'跳過平台',icon:'↗',sec:4,detail:'看清楚關鍵動作',scene:'jump'},
    {id:'win',name:'終點與反應',icon:'★',sec:3,detail:'交代結果，留一點開心',scene:'win'}
  ];
  let step = 0, selected = new Set(), order = [], trim = 3, caption = '這一跳，差點沒過！';
  let filmPlaying = false, filmTime = 0, filmLast = 0, filmRAF = 0;
  function effects(){return $('fxToggle').checked;}
  function box(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
  function block(ctx,x,y,w,h,color,depth=20){
    ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#ffffff33';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+depth,y-depth);ctx.lineTo(x+w+depth,y-depth);ctx.lineTo(x+w,y);ctx.fill();
    ctx.fillStyle='#00000035';ctx.beginPath();ctx.moveTo(x+w,y);ctx.lineTo(x+w+depth,y-depth);ctx.lineTo(x+w+depth,y+h-depth);ctx.lineTo(x+w,y+h);ctx.fill();
  }
  function avatar(ctx,x,y,size=1,pose='idle',phase=0){
    const run=pose==='run', air=pose==='jump', win=pose==='win';
    const stride=run?Math.sin(phase*12)*.65:0;
    const bob=run?Math.abs(Math.sin(phase*12))*3:Math.sin(phase*2)*1.2;
    ctx.save();ctx.translate(x,y);ctx.scale(size,size);
    ctx.fillStyle='#08162b50';ctx.beginPath();ctx.ellipse(5,8,28,7,0,0,Math.PI*2);ctx.fill();
    ctx.translate(0,-bob);ctx.rotate(air?-.1:run?.06:0);
    function limb(lx,ly,angle,color,w,h){ctx.save();ctx.translate(lx,ly);ctx.rotate(angle);block(ctx,-w/2,0,w,h,color,4);ctx.restore();}
    limb(-10,-18,air?-.55:stride,'#253757',13,24);
    limb(10,-18,air?.8:-stride,'#334768',13,24);
    limb(-25,-49,win?-2.5:air?-1.1:-stride*.8,'#edba98',11,28);
    block(ctx,-18,-54,36,38,'#8062d7',7);
    box(ctx,-12,-47,24,5,'#baa2ff');box(ctx,-10,-36,20,11,'#5b49ae');box(ctx,-3,-34,6,7,'#8ff0db');
    limb(25,-49,win?2.5:air?1.1:stride*.8,'#f5caaa',11,28);
    block(ctx,-16,-83,32,29,'#f5cfac',6);
    block(ctx,-17,-87,34,10,'#39405c',6);box(ctx,-16,-80,8,9,'#39405c');
    box(ctx,-8,-72,4,5,'#243652');box(ctx,6,-72,4,5,'#243652');box(ctx,-7,-72,2,2,'#fff');box(ctx,7,-72,2,2,'#fff');
    ctx.strokeStyle='#aa6158';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-3,-61);ctx.quadraticCurveTo(3,win?-54:-59,9,-61);ctx.stroke();
    ctx.restore();
  }
  function star(ctx,x,y,r=12,color='#ffe393'){
    ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fill();
  }
  function city(ctx,t=0){
    const sky=ctx.createLinearGradient(0,0,0,540);sky.addColorStop(0,'#252b62');sky.addColorStop(.65,'#697dbc');sky.addColorStop(1,'#8bbed1');ctx.fillStyle=sky;ctx.fillRect(0,0,960,540);
    ctx.fillStyle='#efdcb6';ctx.beginPath();ctx.arc(773,103,43,0,Math.PI*2);ctx.fill();
    for(let i=0;i<15;i++){const x=((i*103-t*.08)%1150+1150)%1150-100,h=60+(i%5)*25;block(ctx,x,270-h,65,h,'#414d82',15);box(ctx,x+10,280-h,7,12,'#aac5dc50');}
    ctx.fillStyle='#c3d9ed18';for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse((i*197+100-t*.03+1100)%1100,130+(i%3)*28,75,12,0,0,7);ctx.fill();}
    box(ctx,0,427,960,113,'#121b3a');for(let x=0;x<1000;x+=55){ctx.strokeStyle='#738fc02c';ctx.beginPath();ctx.moveTo(x,427);ctx.lineTo(480+(x-480)*1.7,540);ctx.stroke();}for(let y=447;y<540;y+=25){ctx.strokeStyle='#738fc02c';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  }
  function burst(x,y,color='#aaf8e1'){if(!effects())return;for(let i=0;i<35;i++)particles.push({x,y,vx:(Math.random()-.5)*440,vy:-Math.random()*320,life:.6+Math.random()*.6,color});}
  function paintParticles(dt){particles=particles.filter(p=>p.life>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.life-=dt;c.globalAlpha=Math.max(0,p.life);box(c,p.x,p.y,5,5,p.color);});c.globalAlpha=1;}
  function drawObby(dt=0){
    c.save();if(shake>0&&effects()){c.translate(Math.sin(clock*85)*shake,Math.cos(clock*70)*shake*.4);shake=Math.max(0,shake-dt*20);}city(c,distance);
    for(let i=-1;i<8;i++){const x=i*180-(distance%180);block(c,x,398,168,29,i%2?'#6874bb':'#607ba2',20);box(c,x+10,401,148,3,'#9dc9ec');}
    obstacles.forEach(o=>{const x=260+o-distance;if(x>-100&&x<1000){block(c,x,347,37,51,'#f6a888',15);box(c,x+4,349,29,4,'#ffe0a3');}});
    stations.forEach((s,i)=>{const x=260+s.at-distance;if(x>-100&&x<1000){box(c,x+12,252,5,143,'#cfe4f0');block(c,x+17,251,72,37,chips.has(i)?'#84e1c6':'#b7a0fa',8);c.font='bold 18px sans-serif';c.fillStyle='#182647';c.fillText('REC '+(i+1),x+23,276);if(effects()){c.shadowBlur=20;c.shadowColor='#a59aff';}star(c,x+39,318,18);c.shadowBlur=0;}});
    avatar(c,260,395-height,1.08,height>1?'jump':running?'run':'idle',clock);
    if(effects()&&running){c.strokeStyle='#baf5ee44';for(let i=0;i<6;i++){const yy=330+i*18;c.beginPath();c.moveTo(30+(clock*220+i*60)%130,yy);c.lineTo(105+(clock*220+i*60)%130,yy);c.stroke();}}
    paintParticles(dt);c.restore();
  }
  function overlay(title,detail){$('engineOverlay').replaceChildren();if(!title)return;const a=document.createElement('strong'),b=document.createElement('span');a.textContent=title;b.textContent=detail;$('engineOverlay').append(a,b);}
  function feedback(text){$('arcadeFeedback').textContent=text;}
  function task(text){$('arcadeTask').replaceChildren();const p=document.createElement('p');p.textContent=text;$('arcadeTask').appendChild(p);}
  function chooseStation(){running=false;$('startArcade').textContent='繼續跑酷 ▶';const s=stations[station];overlay('抵達錄影站 '+(station+1),'看看右邊，選一個要留下的鏡頭');$('journalTitle').textContent=s.title;task(s.question);s.choices.forEach((text,i)=>{const b=document.createElement('button');b.className='quiet';b.textContent=text;b.onclick=()=>{if(i!==s.ok){feedback('再想一下：沒有在現場的朋友，最需要看見什麼？');return;}chips.add(station);checkpoint=s.at+30;station++;distance=checkpoint;feedback('✓ '+s.reason);burst(300,250);$('arcadeScore').textContent='鏡頭晶片 '+chips.size+' / 3';$('arcadeTask').querySelectorAll('button').forEach(n=>n.disabled=true);if(station===3){overlay('三個鏡頭晶片，收集完成！','接著把素材帶進剪輯工作站');$('startArcade').textContent='前往剪輯工作站 →';const next=document.createElement('button');next.textContent='把鏡頭帶去剪輯 →';next.onclick=()=>switchWorld('studio');$('arcadeTask').appendChild(next);}else{overlay('鏡頭收好，準備繼續！','按「繼續跑酷」，前往下一個錄影站');}drawObby();};$('arcadeTask').appendChild(b);});}
  function jump(){if(world!=='obby'||!running||height>1)return;velocity=640;burst(250,394,'#d4c7ff');}
  function update(dt){clock+=dt;if(running&&(!document.documentElement.classList.contains('gate-ready')||($('tb')&&!$('tb').hidden))){running=false;$('startArcade').textContent='繼續跑酷 ▶';overlay('暫停中','準備好再按繼續跑酷');}if(world==='obby'){if(running){distance+=175*dt;if(assist.checked&&height<1&&obstacles.some(o=>o-distance>65&&o-distance<90))velocity=640;velocity-=1350*dt;height=Math.max(0,height+velocity*dt);if(height===0)velocity=0;for(const o of obstacles){if(Math.abs(distance-o)<25&&height<53){running=false;distance=checkpoint;height=0;velocity=0;shake=7;$('startArcade').textContent='繼續跑酷 ▶';overlay('再試一次，你可以的。','靠近橘色障礙時跳起來 · 按開始繼續');feedback('碰到障礙會回到錄影站。剪影片時，失敗也可以成為有用的故事線索。');break;}}if(running&&station<3&&distance>=stations[station].at)chooseStation();}drawObby(dt);}else if(world==='detective'){drawDetective(dt);}}
  function loop(now){const dt=Math.min(.033,(now-previous)/1000||0);previous=now;update(dt);if(!document.hidden&&document.querySelector('.extra-worlds').open&&world!=='studio'&&world!=='village')raf=requestAnimationFrame(loop);else raf=0;}
  function ensureLoop(){if(!raf&&!document.hidden&&document.querySelector('.extra-worlds').open&&(world==='obby'||world==='detective')){previous=performance.now();raf=requestAnimationFrame(loop);}}
  const puzzles=[
    {title:'01 · 全景：挑戰在哪裡？',q:'如果朋友沒玩過這個跑酷，哪個鏡頭最適合先交代起點、路線和終點？',choices:['全景：看得到整條路','特寫：只有鞋子'],ok:0,reason:'全景建立位置關係。先知道路在哪裡，再看角色怎麼跑。'},
    {title:'02 · 中景：動作怎麼完成？',q:'要看懂這一跳，哪個鏡頭能同時看到角色和平台邊缘？',choices:['特寫：只看角色的臉','中景：角色和平台一起入鏡'],ok:1,reason:'動作需要上下文。這段保留角色與平台，才看得懂起跳和落地。'},
    {title:'03 · 特寫：注意關鍵線索',q:'終點藏著一把小鑰匙。選好景別後，在畫面上點出鑰匙。',choices:['特寫：讓小鑰匙清楚可見','全景：鑰匙小得看不清'],ok:0,reason:'特寫突出重要細節。用在真正影響故事的線索上，不需要每個鏡頭都放大。'}
  ];
  let lens = 'wide', findKey = false;
  function drawDetective(dt=0){city(c,0);c.save();if(lens==='close'){c.translate(-1250,-545);c.scale(2.7,2.7);}else if(lens==='medium'){c.translate(-160,-175);c.scale(1.5,1.5);}block(c,90,375,240,35,'#7f81c8');block(c,390,345,150,35,'#b59adc');block(c,610,375,240,35,'#72b7bb');avatar(c,260,370,1.1);box(c,755,229,5,142,'#e5e4fe');block(c,760,228,62,34,'#a5f0c8',9);star(c,795,246,12);const kx=706,ky=346;c.strokeStyle='#ffe28d';c.lineWidth=5;c.beginPath();c.arc(kx,ky,9,0,7);c.stroke();box(c,kx+8,ky-3,24,6,'#ffe28d');box(c,kx+25,ky,5,10,'#ffe28d');c.restore();
    if(effects()){c.strokeStyle='#9deacb40';c.strokeRect(30,30,900,480);const yy=40+(clock*80)%470;box(c,32,yy,895,1,'#b1c8ff25');}paintParticles(dt);
    c.fillStyle='#ffffff';c.font='bold 20px sans-serif';c.fillText(lens==='wide'?'全景 / 看場地':lens==='medium'?'中景 / 看動作':'特寫 / 看線索',42,496);
  }
  function detectiveTask(){const p=puzzles[detective];if(!p){overlay('鏡頭偵探，全部完成！','你會用不同景別，幫觀眾看到重要的事情');task('接下來，進工作站把這些判斷變成一支短片。');const b=document.createElement('button');b.textContent='前往剪輯工作站 →';b.onclick=()=>switchWorld('studio');$('arcadeTask').appendChild(b);return;}$('journalTitle').textContent=p.title;task(p.q);p.choices.forEach((text,i)=>{const b=document.createElement('button');b.textContent=text;b.className='quiet';b.onclick=()=>{lens=text.startsWith('全景')?'wide':text.startsWith('中景')?'medium':'close';drawDetective();if(i!==p.ok){feedback('這個鏡頭不是最合適的。想想現在要讓觀眾知道「位置、動作，還是細節」？');return;}feedback(p.reason);if(detective===2){findKey=true;overlay('在畫面上找到鑰匙','點一下金色的小鑰匙');$('arcadeTask').querySelectorAll('button').forEach(n=>n.disabled=true);}else finishDetective();};$('arcadeTask').appendChild(b);});}
  function finishDetective(){lenses.add(detective);detective++;findKey=false;$('arcadeScore').textContent='鏡頭判斷 '+lenses.size+' / 3';burst(700,280,'#ffdf9b');overlay('', '');detectiveTask();}
  function reset(){running=false;particles=[];height=velocity=distance=station=checkpoint=0;chips.clear();detective=0;lenses.clear();findKey=false;lens='wide';feedback('');if(world==='obby')setupObby();else setupDetective();}
  function setupObby(){$('arcadeLabel').textContent='WORLD 01 / SKYLINE OBBY';$('arcadeTitle').textContent='天空積木跑酷';$('arcadeDesc').textContent='跳過障礙，遇到錄影站就選鏡頭。不是每段畫面都值得留下。';$('arcadeScore').textContent='鏡頭晶片 '+chips.size+' / 3';$('journalTitle').textContent='帶回一個看得懂的故事';$('arcadeConcept').textContent='跑酷成功是遊戲目標；讓沒玩過的人也看懂你怎麼成功，是剪輯目標。';$('engineHelp').textContent='自動前進，空白鍵／點畫面跳躍。碰到障礙會回到最近的錄影站，不扣分。';$('jumpArcade').hidden=false;$('startArcade').hidden=false;assistLabel.hidden=false;$('startArcade').textContent=station===3?'前往剪輯工作站 →':'開始跑酷 ▶';canvas.setAttribute('aria-label','積木跑酷遊戲。空白鍵或跳躍按鈕跳過障礙，抵達錄影站時選鏡頭。');task('三個錄影站：交代目標 → 保留挑戰 → 看見結果。點「開始跑酷」出發。');overlay(station===3?'晶片收集完成':'準備出發？',station===3?'進剪輯工作站試著組合鏡頭':'跳過橘色障礙，帶回三個鏡頭晶片');drawObby();}
  function setupDetective(){$('arcadeLabel').textContent='WORLD 02 / CAMERA DETECTIVE';$('arcadeTitle').textContent='鏡頭偵探';$('arcadeDesc').textContent='同一個場景，用不同鏡頭說清楚位置、動作和細節。';$('arcadeScore').textContent='鏡頭判斷 '+lenses.size+' / 3';$('arcadeConcept').textContent='景別就是畫面給你看多少。先問「這一刻要知道什麼」，再選全景、中景或特寫。';$('engineHelp').textContent='先回答右側任務，畫面會切換景別；最後在特寫裡找出鑰匙。';$('startArcade').hidden=true;assistLabel.hidden=true;$('jumpArcade').hidden=true;canvas.setAttribute('aria-label','鏡頭偵探場景。選擇景別後，第三關在畫面右側點金色鑰匙。');overlay('','');drawDetective();detectiveTask();}
  function switchWorld(name){pauseFilm();running=false;world=name;cancelAnimationFrame(raf);raf=0;document.querySelectorAll('[data-world]').forEach(b=>{const on=b.dataset.world===name;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});$('arcadePanel').hidden=name==='studio'||name==='village';$('studioPanel').hidden=name!=='studio';$('villagePanel').hidden=name!=='village';$('resetGame').hidden=name!=='village';$('stopPreview').click();feedback('');if(name==='obby')setupObby();if(name==='detective')setupDetective();if(name==='studio')renderStudio();ensureLoop();}
  $('startArcade').onclick=()=>{if(station===3){switchWorld('studio');return;}if($('arcadeTask').querySelector('button:not(:disabled)')){feedback('先選好錄影站要留下的鏡頭，再繼續跑。');return;}if(running){running=false;$('startArcade').textContent='繼續跑酷 ▶';overlay('暫停中','準備好再繼續');return;}running=true;overlay('','');$('startArcade').textContent='暫停跑酷';ensureLoop();};
  $('jumpArcade').onclick=jump;$('resetArcade').onclick=reset;
  canvas.onclick=e=>{if(world==='obby'){jump();return;}if(world==='detective'&&findKey){const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*960/r.width,y=(e.clientY-r.top)*540/r.height;const tx=706*2.7-1250,ty=346*2.7-545;if(Math.abs(x-tx)<90&&Math.abs(y-ty)<65){feedback('找到鑰匙了！重要的小細節可以用特寫，但要先讓人知道它在哪裡。');finishDetective();}else feedback('再找找金色圓圈和短短的鑰匙齒。');}};
  document.addEventListener('keydown',e=>{if(!document.querySelector('.extra-worlds').open||!document.documentElement.classList.contains('gate-ready')||document.hidden||e.target.closest('input,textarea,select,button,a')||document.querySelector('dialog[open]')||($('tb')&&!$('tb').hidden))return;if(world==='obby'&&e.code==='Space'){e.preventDefault();jump();}});
  const tabs=[...document.querySelectorAll('[data-world]')];tabs.forEach((b,i)=>{b.onclick=()=>switchWorld(b.dataset.world);b.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];switchWorld(next.dataset.world);next.focus();}};});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;cancelAnimationFrame(raf);raf=0;pauseFilm();if(world==='obby'&&station<3){$('startArcade').textContent='繼續跑酷 ▶';overlay('暫停中','回來後按繼續跑酷');}}else ensureLoop();});
  // The editing lab uses the same block-art renderer; timeline time is independent of game time.
  function studioFrame(scene='goal',t=0,target){const sc=target||studio.getContext('2d');city(sc,0);block(sc,70,397,250,32,'#727fbb');block(sc,370,362,180,32,'#a18bd6');block(sc,615,397,260,32,'#7eb9bd');let x=185,y=390;if(scene==='danger'){x=230+t*74;y=390;}if(scene==='jump'){x=292+t*167;y=390-35*t-Math.sin(t*Math.PI)*130;}if(scene==='win'){x=745;y=390;box(sc,808,233,5,158,'#e9ecfa');block(sc,813,230,66,34,'#99eaca');star(sc,845,247,13);}avatar(sc,x,y,1.3,scene==='jump'?(t>0&&t<1?'jump':'idle'):scene==='danger'?'run':scene==='win'?'win':'idle',t*3);sc.font='bold 22px sans-serif';sc.fillStyle='#fff0cd';sc.fillText(shots.find(s=>s.scene===scene)?.name||'跑酷預覽',34,54);if(scene==='goal'){sc.font='20px sans-serif';sc.fillText('起點 → 跨過平台 → 終點',300,160);}if(scene==='win'&&effects())for(let i=0;i<10;i++)star(sc,680+(i*37)%220,120+(i%3)*35,6,'#fff0ad');}
  function clipDuration(id){return id==='jump'?trim:shots.find(s=>s.id===id).sec;}
  function total(){return order.reduce((n,id)=>n+clipDuration(id),0);}
  function renderTimeline(){const root=$('studioTimeline');root.replaceChildren();order.forEach(id=>{const s=shots.find(n=>n.id===id),b=document.createElement('button');b.textContent=s.name+' · '+clipDuration(id)+'s';b.onclick=()=>{pauseFilm();filmTime=order.slice(0,order.indexOf(id)).reduce((n,k)=>n+clipDuration(k),0);paintFilm();};root.appendChild(b);});$('studioTime').textContent=order.length?'0.0 / '+total().toFixed(1)+' 秒':'尚未組合素材';}
  function paintFilm(){if(!order.length){studioFrame();$('studioCaption').replaceChildren();$('studioTime').textContent='尚未組合素材';return;}let acc=0,index=Math.max(0,order.length-1);for(let i=0;i<order.length;i++){if(filmTime<acc+clipDuration(order[i])){index=i;break;}acc+=clipDuration(order[i]);}if(filmTime>=total())acc=total()-clipDuration(order[index]);const s=shots.find(n=>n.id===order[index]);if(!s){studioFrame();return;}const local=filmTime-acc;const progress=s.id==='jump'?(local+(4-trim)/2-.8)/2.4:local/clipDuration(s.id);studioFrame(s.scene,Math.min(1,Math.max(0,progress)));$('studioCaption').replaceChildren();if(step>=3&&s.id==='jump'&&caption.trim()){const n=document.createElement('span');n.textContent=caption;$('studioCaption').appendChild(n);}$('studioTime').textContent=filmTime.toFixed(1)+' / '+total().toFixed(1)+' 秒';[...$('studioTimeline').children].forEach((n,i)=>n.classList.toggle('playing',i===index));}
  function pauseFilm(){filmPlaying=false;cancelAnimationFrame(filmRAF);$('studioPlay').textContent='▶ 預覽我的短片';}
  function filmTick(now){if(!filmPlaying)return;filmTime=Math.min(total(),filmTime+Math.min(.05,(now-filmLast)/1000));filmLast=now;paintFilm();if(filmTime>=total()){pauseFilm();return;}filmRAF=requestAnimationFrame(filmTick);}
  $('studioPlay').onclick=()=>{if(!order.length){$('studioFeedback').textContent='先在素材庫選好鏡頭，才能預覽短片。';return;}if(filmPlaying){pauseFilm();return;}if(filmTime>=total())filmTime=0;filmPlaying=true;filmLast=performance.now();$('studioPlay').textContent='⏸ 暫停';filmRAF=requestAnimationFrame(filmTick);};$('studioStop').onclick=()=>{pauseFilm();filmTime=0;paintFilm();};
  const steps=['匯入選材','排列故事','修剪長度','補上字幕','預覽輸出'];
  const headings=['先把素材放進來','把鏡頭排成看得懂的故事','只剪掉多餘的時間','用一句話幫觀眾看懂','最後自己當一次觀眾'];
  const instructions=['這裡有五段素材。挑出能交代目標、危機、動作和結果的片段。','素材順序打亂了，用上下按鈕調整。先知道挑戰，再遇到問題，接著解決，最後看到結果。','拖動長度，從這段素材的前後剪掉等待。注意：這是修剪，不是加速播放；剪太多會把起跳和落地也剪掉。','替跳躍畫面補一句短字幕。字會放在畫面空位；不需要把看到的每件事都寫出來。','完整播放一次。確認開始、中間、結尾都看得懂，才輸出你的剪輯計畫。'];
  function workNode(tag,text,parent=$('studioWork')){const n=document.createElement(tag);if(text)n.textContent=text;parent.appendChild(n);return n;}
  function renderStudio(){pauseFilm();filmTime=0;$('studioSteps').replaceChildren();steps.forEach((s,i)=>{const n=document.createElement('div');n.textContent=(i<step?'✓ ':String(i+1)+'. ')+s;n.className=i===step?'current':i<step?'done':'';$('studioSteps').appendChild(n);});$('studioScore').textContent='工作站 '+(step+1)+' / 5';$('studioStepLabel').textContent='STEP 0'+(step+1)+' / 剪映裡也會用到';$('studioHeading').textContent=headings[step];$('studioInstruction').textContent=instructions[step];$('studioWork').replaceChildren();$('studioFeedback').textContent='';$('studioBack').disabled=step===0;$('studioNext').textContent=step===4?'下載剪輯計畫 .md':'完成這步 →';$('studioCaption').replaceChildren();
    if(step===0){shots.forEach(s=>{const label=workNode('label');label.className='clip-card';const input=workNode('input',null,label);input.type='checkbox';input.checked=selected.has(s.id);input.setAttribute('aria-label',s.name);const icon=workNode('span',s.icon,label);icon.className='clip-icon';const info=workNode('span',s.name+' · '+s.sec+' 秒',label);info.className='clip-info';workNode('small',s.detail,info);input.onchange=()=>{input.checked?selected.add(s.id):selected.delete(s.id);order=shots.filter(n=>selected.has(n.id)).map(n=>n.id);renderTimeline();paintFilm();};});}
    if(step===1){order.forEach((id,i)=>{const s=shots.find(n=>n.id===id),row=workNode('div');row.className='clip-card';const icon=workNode('span',s.icon,row);icon.className='clip-icon';const info=workNode('span',s.name,row);info.className='clip-info';for(const [label,delta] of [['↑',-1],['↓',1]]){const b=workNode('button',label,row);b.setAttribute('aria-label',s.name+(delta<0?'往前':'往後'));b.disabled=i+delta<0||i+delta>=order.length;b.onclick=()=>{[order[i],order[i+delta]]=[order[i+delta],order[i]];renderStudio();};}});}
    if(step===2){const label=workNode('label','跳躍鏡頭長度：'+trim+' 秒');label.htmlFor='trimRange';const input=workNode('input');input.id='trimRange';input.type='range';input.min='.5';input.max='4';input.step='.5';input.value=trim;input.oninput=()=>{trim=Number(input.value);label.textContent='跳躍鏡頭長度：'+trim+' 秒';pauseFilm();filmTime=0;renderTimeline();paintFilm();};workNode('p','原始素材 4 秒，前後各有等待。試試 0.5 秒和 3 秒：哪一版保留了起跳和落地？');}
    if(step===3){const label=workNode('label','跳躍畫面的字幕');label.htmlFor='captionInput';const input=workNode('input');input.type='text';input.id='captionInput';input.maxLength=24;input.value=caption;input.oninput=()=>{caption=input.value;paintFilm();};workNode('p','先抓一個重點，不誇大，也不編造畫面裡沒有的事情。');}
    if(step===4){for(const text of ['開始能看出這次的挑戰','跳躍動作看得清楚，字幕不擋主角','最後有結果，也有時間看反應']){const label=workNode('label');label.className='clip-card';const cb=workNode('input',null,label);cb.type='checkbox';cb.setAttribute('aria-label',text);workNode('span',text,label);}workNode('p','這裡下載的是剪輯計畫，不是影片檔。下一堂在剪映依計畫匯入真實素材、剪輯，再輸出影片。');}
    renderTimeline();paintFilm();
  }
  $('studioBack').onclick=()=>{if(step>0){step--;renderStudio();}};
  $('studioNext').onclick=()=>{let message='';if(step===0){if(selected.has('wait'))message='站著等待的片段沒有新訊息，先試著不選它。';else if(!['goal','danger','jump','win'].every(id=>selected.has(id)))message='再補上目標、危機、跳躍動作和終點，故事才完整。';else order=['jump','goal','win','danger'];}if(step===1&&order.join(',')!=='goal,danger,jump,win')message='再調整一下：先交代目標 → 出現危機 → 跳過平台 → 抵達終點。';if(step===2&&trim<2.5)message='跳躍有點太急了。這份素材需要至少 2.5 秒才容易看清動作，再預覽看看。';if(step===3&&(!caption.trim()||caption.trim().length>16))message='寫一句 1 到 16 個字的短字幕，讓人一眼讀完。';if(step===4&&[...$('studioWork').querySelectorAll('input')].some(n=>!n.checked))message='先完成三個觀看檢查，再下載計畫。';if(message){$('studioFeedback').textContent=message;return;}if(step<4){step++;renderStudio();}else{downloadPlan();$('studioFeedback').textContent='✓ 剪輯計畫完成！帶著它進剪映：匯入 → 排列 → 修剪 → 字幕 → 預覽與輸出。';burst(480,180);}};
  function downloadPlan(){const text='# 我的跑酷剪輯計畫\n\n## 1. 匯入素材\n挑出有用的畫面，省略無新訊息的等待。\n\n## 2. 排列與修剪\n'+order.map((id,i)=>{const s=shots.find(n=>n.id===id);return(i+1)+'. '+s.name+'：'+clipDuration(id)+' 秒';}).join('\n')+'\n\n## 3. 字幕\n'+caption+'\n放在畫面空位，不擋起跳和落地。\n\n## 4. 預覽與輸出\n全片 '+total()+' 秒。確認目的、原因、動作與結果都清楚。\n在剪映匯入真實素材，依上述計畫編輯，再依課堂設定輸出影片。\n\n## 給 AI 的規範\n依畫面提供建議；不要編造事件；不要把全片都剪成固定速度；字幕短且不遮住重要動作。\n';const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='我的跑酷剪輯計畫.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  document.querySelector('.extra-worlds').addEventListener('toggle',()=>{if(document.querySelector('.extra-worlds').open)ensureLoop();else{running=false;cancelAnimationFrame(raf);raf=0;pauseFilm();}});
  window.Lesson2Visuals={draw:studioFrame};
  switchWorld('obby');studioFrame();
})();
