(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('world'), ctx = canvas.getContext('2d');
  const film = $('previewCanvas'), fc = film.getContext('2d');
  const KEY = 'vshort_lesson2_quest_v1';
  const quests = [
    {name:'村長的委託',skill:'刪等待，留原因',npc:'村長',x:3,y:7,
      story:'勇者在門口等了六秒，接著突然跑向橋。看的人問：「他要去哪？為什麼？」',
      question:'影片太拖，你會怎麼修？',choices:['刪掉所有對話，只留跑步','縮短等待，留下「去橋邊取回星石」','每個畫面都加閃光'],ok:1,
      hint:'跑得快不代表看得懂。觀眾還需要知道這趟冒險的目的。',
      reason:'等待可以縮短，但目的要留下。剪掉沒有新訊息的時間，別把事情的原因也剪走。',transfer:'拍校園闖關時，先交代要找什麼，再省略排隊等待。'},
    {name:'迷霧橋的線索',skill:'先有線索，再有反應',npc:'守橋人',x:8,y:5,
      story:'片子先出現勇者嚇一跳，下一秒卻已經在橋的另一邊。原來橋上有一隻史萊姆，但畫面被剪掉了。',
      question:'補哪個畫面，最能讓人理解？',choices:['勇者的新鞋','天空的雲','橋上的史萊姆 → 勇者停下來'],ok:2,
      hint:'想想勇者是「看見了什麼」才停下來。',
      reason:'先讓觀眾看到原因，再看角色的反應。不是所有鏡頭都要留，但重要線索不能不見。',transfer:'球賽先看到球飛過來，再看到接球的人撲出去，動作才連得起來。'},
    {name:'字幕森林',skill:'讓字幕幫忙，別擋畫面',npc:'森林精靈',x:11,y:3,
      story:'勇者正在閃躲史萊姆，正中央卻出現巨大字幕，把怪物和腳步都遮住了。',
      question:'試映室可以換字幕位置。你想怎麼調？',choices:['放在下方空位，短短寫「先躲開！」','把字幕再放大兩倍','整段放十行說明'],ok:0,
      hint:'這一刻最重要的是看清楚閃躲動作。字幕要幫眼睛，而不是和畫面搶位置。',
      reason:'字幕的位置要配合這個鏡頭。這段下方有空位，短句能幫忙；換一個畫面，位置也可能要換。',transfer:'拍做菜時別把字幕蓋在手和食材上。先找不遮重要動作的空位。'},
    {name:'星光城堡',skill:'關鍵瞬間，給時間看清楚',npc:'星石守護者',x:13,y:7,
      story:'找到星石的那一刻只有 0.2 秒。大家還沒看清楚，影片就結束了。',
      question:'怎麼讓這趟冒險有個完整收尾？',choices:['全片都放慢','讓拿到星石和開心的反應多停留一下','直接刪掉結尾'],ok:1,
      hint:'不是每一秒都一樣重要。觀眾期待的結果，值得多看一下。',
      reason:'移動可以快一點；拿到星石和角色反應要留閱讀時間。節奏跟事情的重要性有關，沒有固定的快慢公式。',transfer:'進球後留一點慶祝畫面，觀眾才有時間感受到「成功了！」。'}
  ];
  let saved = {};
  try {saved = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {};} catch (_) {}
  let completed = new Set(Array.isArray(saved.completed) ? saved.completed.filter(n => Number.isInteger(n) && n >= 0 && n < 4) : []);
  let player = {x:2,y:8}, active = -1, animation = null, playing = false, elapsed = 0, last = 0;
  const tile = 40;
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
  function hero(c,x,y,scale=1,color='#65b5f0') {
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    rect(c,-9,-23,18,8,'#4e314a');rect(c,-8,-16,16,12,'#f5c39c');rect(c,-10,-5,20,15,color);
    rect(c,-13,-5,5,12,'#f5c39c');rect(c,8,-5,5,12,'#f5c39c');rect(c,-8,10,6,8,'#26314a');rect(c,3,10,6,8,'#26314a');
    rect(c,2,-13,3,3,'#283144');rect(c,-15,0,4,16,'#ffd478');c.restore();
  }
  function slime(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);rect(c,-15,-10,30,16,'#80cfbe');rect(c,-10,-16,20,6,'#80cfbe');rect(c,-5,-20,10,4,'#80cfbe');rect(c,-8,-8,4,4,'#142d38');rect(c,5,-8,4,4,'#142d38');rect(c,-4,0,10,3,'#fff1c9');c.restore();}
  function tree(c,x,y){rect(c,x+15,y+24,9,18,'#70523c');rect(c,x+5,y+8,30,23,'#204f40');rect(c,x+10,y,20,25,'#2b6745');rect(c,x+15,y+3,6,8,'#438351');}
  function blocked(x,y){return x<1||x>14||y<1||y>9||(x===7&&y!==5);}
  function drawWorld(){
    ctx.clearRect(0,0,640,440);rect(ctx,0,0,640,440,'#467455');
    for(let y=0;y<11;y++)for(let x=0;x<16;x++){rect(ctx,x*40+((x+y)%3)*7,y*40+18,3,5,'#588661');if(x===0||y===0||x===15||y===10)tree(ctx,x*40,y*40);}
    rect(ctx,45,305,245,28,'#b09b6b');rect(ctx,120,210,40,108,'#b09b6b');rect(ctx,130,202,420,28,'#b09b6b');rect(ctx,430,120,30,95,'#b09b6b');rect(ctx,525,215,30,110,'#b09b6b');
    rect(ctx,280,40,40,360,'#427fa1');for(let i=0;i<9;i++)rect(ctx,287,48+i*40,25,3,'#6cabc1');
    rect(ctx,276,200,48,40,'#8e6949');for(let i=0;i<5;i++)rect(ctx,277,202+i*8,46,3,'#c39d63');
    rect(ctx,80,240,80,45,'#d6b987');rect(ctx,70,223,100,20,'#9c5951');rect(ctx,80,209,80,14,'#bd7260');rect(ctx,111,256,20,29,'#5b433d');
    for(const [x,y] of [[10,2],[12,2],[10,4],[12,4],[4,2],[5,2]])tree(ctx,x*40,y*40);
    rect(ctx,500,260,80,47,'#9cabb7');rect(ctx,490,250,25,65,'#748799');rect(ctx,565,250,25,65,'#748799');for(let i=0;i<4;i++){rect(ctx,490+i*7,244,4,9,'#c5d5d8');rect(ctx,565+i*7,244,4,9,'#c5d5d8');}rect(ctx,532,280,20,35,'#283d50');
    quests.forEach((q,i)=>{const x=q.x*40+20,y=q.y*40+20;hero(ctx,x,y,.8,i===2?'#bd94da':'#edba68');rect(ctx,x+12,y-39,3,28,'#e9d7ae');rect(ctx,x+15,y-39,16,12,completed.has(i)?'#91e0bc':'#ffd478');ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#152530';ctx.fillText(completed.has(i)?'✓':String(i+1),x+23,y-29);ctx.fillStyle='#fff4d2';ctx.fillText(q.npc,x,y+32);});
    hero(ctx,player.x*40+20,player.y*40+20);
    ctx.textAlign='left';ctx.font='14px sans-serif';rect(ctx,14,12,166,28,'#132c36');ctx.fillStyle='#ffdfa0';ctx.fillText('翠葉村 · 剪輯勇者',24,32);
  }
  function move(dir){const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!d)return;const x=player.x+d[0],y=player.y+d[1];if(!blocked(x,y)){player={x,y};drawWorld();}const near=quests.find(q=>Math.abs(q.x-player.x)+Math.abs(q.y-player.y)<=1);$('locationText').textContent=near?'附近：'+near.npc:'探索中 · 找找金色旗子';}
  function interact(){const i=quests.findIndex(q=>Math.abs(q.x-player.x)+Math.abs(q.y-player.y)<=1);if(i<0){$('locationText').textContent='再靠近旗子一點，或點下方任務卡';return;}openQuest(i);}
  function append(tag,text,cls,parent=$('mission')){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;parent.appendChild(n);return n;}
  function openQuest(i){active=i;const q=quests[i];$('mission').replaceChildren();$('questStatus').textContent=completed.has(i)?'徽章已取得 · 可以再練習':'任務 '+(i+1)+' / 4';append('div',q.npc+' 說：','speaker');append('h2',q.name);append('p',q.story);append('h3',q.question);const choices=append('div','','choices');const fb=document.createElement('div');fb.className='feedback';fb.setAttribute('role','status');q.choices.forEach((text,n)=>{const b=append('button',text,'quiet',choices);b.onclick=()=>{if(n!==q.ok){fb.textContent='再試一次。'+q.hint;return;}completed.add(i);save();updateProgress();fb.textContent='✓ '+q.reason+' 換到生活中：'+q.transfer;choices.querySelectorAll('button').forEach(btn=>btn.disabled=true);b.style.borderColor='#91e0bc';const next=append('button',i<3?'前往下一個任務 →':'查看通關筆記 →');next.onclick=()=>{if(i<3){const nextQ=quests[i+1];player={x:nextQ.x,y:nextQ.y+1};drawWorld();openQuest(i+1);}else if(completed.size===4){$('summary').scrollIntoView({behavior:'smooth'});}else {const pending=quests.findIndex((_,n)=>!completed.has(n));openQuest(pending);}};};});$('mission').appendChild(fb);renderQuestList();}
  function renderQuestList(){$('questList').replaceChildren();quests.forEach((q,i)=>{const b=document.createElement('button');b.className=(i===active?'active ':'')+(completed.has(i)?'done':'');b.textContent=(completed.has(i)?'✓ ':'0'+(i+1)+' ')+q.name;const small=document.createElement('small');small.textContent=q.skill;b.appendChild(small);b.onclick=()=>{player={x:q.x,y:q.y+1};drawWorld();openQuest(i);};$('questList').appendChild(b);});}
  function save(){try{sessionStorage.setItem(KEY,JSON.stringify({completed:[...completed]}));}catch(_) {}}
  function updateProgress(){$('progressText').textContent='像素徽章 '+completed.size+' / 4';$('progressBar').style.width=(completed.size*25)+'%';$('summary').hidden=completed.size!==4;renderQuestList();drawWorld();}
  const sequences={raw:[{scene:'wait',sec:6,label:'門口等待'},{scene:'bridge',sec:2,label:'突然過橋'},{scene:'dodge',sec:2,label:'匆忙閃躲'},{scene:'gem',sec:.2,label:'結果一閃而過'},{scene:'end',sec:1.8,label:'空白結尾'}],edited:[{scene:'purpose',sec:1.5,label:'交代目的'},{scene:'clue',sec:1.5,label:'看見障礙'},{scene:'dodge',sec:2,label:'看清楚閃躲'},{scene:'gem',sec:3,label:'星石＋反應'}]};
  function sequence(){return sequences[$('editMode').value];}
  function duration(){return sequence().reduce((a,s)=>a+s.sec,0);}
  function filmFrame(){const seq=sequence();let start=0,index=seq.length-1;for(let i=0;i<seq.length;i++){if(elapsed<start+seq[i].sec){index=i;break;}start+=seq[i].sec;}if(elapsed>=duration())start=duration()-seq[index].sec;const shot=seq[index],t=Math.max(0,Math.min(1,(elapsed-start)/shot.sec));
    rect(fc,0,0,640,360,'#8ec4cd');rect(fc,0,180,640,180,'#527d51');rect(fc,0,276,640,35,'#bea577');rect(fc,290,180,80,180,'#4e8eaf');rect(fc,278,271,105,48,'#a4774c');for(let i=0;i<6;i++)rect(fc,279,274+i*7,103,3,'#dec08a');tree(fc,70,192);tree(fc,550,183);rect(fc,455,144,100,82,'#8299a6');rect(fc,475,176,30,50,'#2a4055');
    let caption='',hx=165,hy=266;
    if(shot.scene==='wait'){hero(fc,hx,hy,1.6);caption='……還在等';}
    if(shot.scene==='purpose'){hero(fc,hx,hy,1.6);hero(fc,75,hy,1.4,'#edba68');caption='去橋邊，取回星石！';}
    if(shot.scene==='bridge'){hx=180+t*270;hero(fc,hx,hy,1.6);caption='出發！';}
    if(shot.scene==='clue'){hero(fc,230,hy,1.6);slime(fc,350,hy,1.9);caption='橋上有史萊姆，先看看！';}
    if(shot.scene==='dodge'){hx=220+t*230;hy=266-Math.sin(t*Math.PI)*55;slime(fc,340,266,1.9);hero(fc,hx,hy,1.6);caption='先躲開！';}
    if(shot.scene==='gem'){hero(fc,440,266,1.6);rect(fc,473,204,16,28,'#ffe597');rect(fc,469,212,24,12,'#fff3c5');caption='拿到了！這趟沒有白跑。';}
    if(shot.scene==='end'){rect(fc,0,0,640,360,'#142639');caption='結束';}
    rect(fc,16,14,240,32,'#163342');fc.font='16px sans-serif';fc.textAlign='left';fc.fillStyle='#fff0bb';fc.fillText('冒險模擬 / '+shot.label,28,36);
    const subtitle=$('subtitle');subtitle.replaceChildren();if($('captionMode').value!=='none'){const span=document.createElement('span');span.textContent=caption;subtitle.appendChild(span);}subtitle.style.bottom=$('captionMode').value==='center'?'25%':'10%';subtitle.style.fontSize=$('captionMode').value==='center'?'clamp(22px,4vw,36px)':'clamp(14px,2vw,21px)';
    $('timeText').textContent=elapsed.toFixed(1)+' / '+duration().toFixed(1)+' 秒';[...$('timeline').children].forEach((n,i)=>n.classList.toggle('playing',i===index));
  }
  function timeline(){$('timeline').replaceChildren();sequence().forEach(s=>{const n=document.createElement('span');n.textContent=s.label;n.style.flex=s.sec;$('timeline').appendChild(n);});}
  function pause(){playing=false;if(animation!==null)cancelAnimationFrame(animation);animation=null;$('playPreview').textContent='▶ 播放';}
  function tick(now){if(!playing)return;elapsed=Math.min(duration(),elapsed+(now-last)/1000);last=now;filmFrame();if(elapsed>=duration()){pause();return;}animation=requestAnimationFrame(tick);}
  $('playPreview').onclick=()=>{if(playing){pause();return;}if(elapsed>=duration())elapsed=0;playing=true;last=performance.now();$('playPreview').textContent='⏸ 暫停';animation=requestAnimationFrame(tick);};
  $('stopPreview').onclick=()=>{pause();elapsed=0;filmFrame();};
  $('editMode').onchange=()=>{pause();elapsed=0;timeline();filmFrame();$('previewExplain').textContent=$('editMode').value==='edited'?'這版縮短等待，補上目的與障礙，讓閃躲和結果有時間看清楚。比較看看：你理解了哪些原本沒看懂的事？':'等待佔了影片一半，卻沒有交代任務；星石出現太短。留意你在哪一段開始感到疑惑。';};
  $('captionMode').onchange=filmFrame;
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>move(b.dataset.move));$('interact').onclick=interact;
  canvas.onclick=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*640/r.width,y=(e.clientY-r.top)*440/r.height;const i=quests.findIndex(q=>Math.abs(x-(q.x*40+20))<32&&Math.abs(y-(q.y*40+20))<40);if(i>=0){player={x:quests[i].x,y:quests[i].y+1};drawWorld();openQuest(i);}canvas.focus();};
  document.addEventListener('keydown',e=>{if(document.getElementById('villagePanel')?.hidden||!document.documentElement.classList.contains('gate-ready')||($('tb') && !$('tb').hidden)||e.target.closest('input,textarea,select,button,a')||document.querySelector('dialog[open]'))return;const dir={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key];if(dir){e.preventDefault();move(dir);}if(e.key==='Enter'){e.preventDefault();interact();}});
  $('resetGame').onclick=()=>{if(!confirm('要重新冒險嗎？這會清除這一堂的四枚徽章。'))return;completed.clear();save();player={x:2,y:8};pause();elapsed=0;filmFrame();updateProgress();openQuest(0);};
  $('downloadNotes').onclick=()=>{const text='# 我的剪輯勇者筆記\n\n'+quests.map((q,i)=>'## '+(i+1)+'. '+q.skill+'\n'+q.reason+'\n\n生活中可以用在：'+q.transfer+'\n').join('\n')+'\n## 下一堂剪映實作\n- 素材：\n- 我會刪掉：\n- 我一定保留的原因與線索：\n- 字幕放哪裡：\n- 結果要停留多久：\n\n## 給 AI 的規範\n先交代目的；保留原因與反應；字幕不遮住動作；重要結果留時間看清楚。不要編造素材中沒有的事情。\n';const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='我的剪輯勇者筆記.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  timeline();filmFrame();updateProgress();openQuest(0);window.DirectorToolbox?.mount({fab:false});
})();
