(() => {
  'use strict';
  const root = document.getElementById('editorQuest');
  const $ = id => document.getElementById(id);
  const library = [
    {id:'goal',name:'起點與目標',scene:'goal',duration:2,icon:'⚑'},
    {id:'wait',name:'站著空等',scene:'wait',duration:4,icon:'⌛'},
    {id:'run',name:'接近平台邊緣',scene:'danger',duration:2,icon:'↗'},
    {id:'jump',name:'起跳到落地',scene:'jump',duration:4,icon:'✦'},
    {id:'win',name:'終點與歡呼',scene:'win',duration:3,icon:'★'}
  ];
  const missions = [
    ['素材尋寶','從素材庫選進時間軸','點素材庫的「＋加入」。保留起點、接近邊緣、跳躍與結果；空等先留在素材庫。','素材庫是原料，時間軸才是你要給觀眾看的影片。'],
    ['故事接片','在時間軸重新排列','點選片段，用「往前／往後」，也可拖曳。把目的、危機、解決與結果排好。','時間軸上的左右順序，就是觀眾看到事情的先後。'],
    ['空等消除','移播放頭 → 分割 → 刪除','把播放頭移到 3 秒，在空等片段中按「分割」。再選兩段空等，各按一次刪除。','分割只把片段切開；選取再刪除，才會拿掉多餘的畫面。'],
    ['落地救援','拖片段邊界，保住動作','點「起跳到落地」，調整開始／結束時間，剪掉前後等待。保留起跳與落地，讓片段不超過 3.2 秒。','修剪改變保留的範圍，不會把角色的動作加速。'],
    ['字幕避障','加進字幕軌，避開主角','在右側寫一句短字幕，再放在畫面下方。播放跳躍鏡頭，確認字幕沒有遮住動作。','字幕有自己的軌道，能改文字與位置；它不是畫面的一部分。'],
    ['鏡頭追蹤','選片段 → 調整畫面','這一跳要看清角色和平台。調整畫面景別，選出能同時交代動作和落點的中景。','畫面縮放要服務內容。放太近會丟掉位置線索。'],
    ['速度守門','區分快轉與修剪','把接近平台的移動調成 2 倍速；跳躍維持 1 倍速。播放看看，重點動作有沒有被加快？','變速會改變動作快慢；修剪是拿掉一段，兩者不一樣。'],
    ['聲音調音台','用音軌照顧重點','勾選「試聽聲音」並播放，背景音樂調到 25% 以下，成功提示音保留 70% 以上。','不同聲音分開調音量。音樂是陪伴，別蓋過重要的訊息。'],
    ['首映檢查','完整預覽，再輸出計畫','完整播放一次，確認目的、動作與結果都清楚。勾選檢查項目，再領取剪輯計畫。','剪映的輸出會產生影片；這裡先帶走你的 .md 操作計畫。']
  ];
  let current=0, clips=[], selected=null, playhead=0, playing=false, raf=0, last=0, splitCount=0, uid=0;
  let subtitle='', position='center', framing='wide', music=60, cue=90, audition=false, audio=null, gain=null, cueGain=null, oscillator=null;
  let completed = new Set();
  try {const saved=JSON.parse(sessionStorage.getItem('vshort_edit_missions_v1')||'[]');if(Array.isArray(saved))completed=new Set(saved.filter(n=>Number.isInteger(n)&&n>=0&&n<9));} catch (_) {}
  function create(id){const s=library.find(n=>n.id===id);return {...s,key:++uid,in:0,out:s.duration,speed:1,framing:'wide'};}
  function length(s){return(s.out-s.in)/s.speed;}
  function total(){return clips.reduce((a,s)=>a+length(s),0);}
  function chosen(){return clips.find(n=>n.key===selected);}
  function stop(){playing=false;cancelAnimationFrame(raf);raf=0;if($('editPlay'))$('editPlay').textContent='▶ 播放';if(gain)gain.gain.value=0;if(cueGain)cueGain.gain.value=0;}
  function note(text){$('editFeedback').textContent=text;}
  function node(tag,text,parent,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;parent.appendChild(n);return n;}
  root.innerHTML='<div class="edit-shell"><div class="edit-heading"><div><h2>剪輯任務控制台</h2><p>左邊拿素材，中間看結果，下方剪片段，右邊調設定。</p></div><span id="editCount" class="edit-count"></span></div><div id="editMissions" class="edit-missions" aria-label="九個剪輯操作任務"></div><div class="edit-workspace"><aside id="editLibrary" class="edit-library" aria-label="素材庫"></aside><section class="edit-preview"><div class="edit-area-title">② 預覽窗 · 看你剪出來的故事</div><div class="edit-preview-stage"><canvas id="editCanvas" width="960" height="540" aria-label="時間軸片段的角色動畫預覽"></canvas><div id="editSubtitle"></div><div id="editToast" class="edit-toast"></div></div><div class="edit-transport"><button id="editPlay">▶ 播放</button><button id="editStop" class="quiet">回到開頭</button><span id="editTime"></span><label style="font-size:11px;margin:0"><input id="editAudition" type="checkbox"> 試聽聲音</label></div><div class="edit-comparison"><button id="editBefore">看修改前</button><button id="editAfter" class="chosen">看我的版本</button></div><p class="edit-mini-note">這是剪輯操作模擬；下一堂在剪映使用真實素材。</p></section><aside class="edit-instructor"><div><div class="edit-area-title">④ 任務與設定 · 選到哪段，就調哪段</div><span id="editMissionNumber" class="eyebrow"></span><h3 id="editTitle"></h3><p id="editInstruction"></p></div><div><div id="editSettings"></div><div id="editFeedback" class="edit-feedback" role="status"></div><button id="editCheck">檢查這次的剪輯 ✓</button></div></aside></div><section class="edit-timeline" aria-label="剪輯時間軸"><div class="edit-tools"><strong class="edit-area-title" style="margin:0 8px 0 0">③ 時間軸</strong><button id="editSplit">✂ 分割</button><button id="editDelete">刪除選取</button><button id="editLeft">← 往前</button><button id="editRight">往後 →</button><button id="editReset">重置本關</button></div><label class="edit-ruler">播放頭 <input id="editScrub" aria-label="時間軸播放頭" type="range" min="0" max="1" step="0.1" value="0"><span id="editRulerTime">0.0s</span></label><div class="edit-tracks"><div class="edit-track"><span class="edit-track-label">影片軌</span><div id="editVideoTrack" style="display:flex;gap:6px;flex:1;min-width:0"></div></div><div class="edit-track"><span class="edit-track-label">字幕軌</span><div id="editCaptionTrack" class="edit-caption-empty">還沒加入字幕</div></div><div class="edit-track"><span class="edit-track-label">聲音軌</span><div id="editSoundTrack" class="edit-track-block sound"></div></div></div></section><div id="editConcept" class="edit-callout"></div></div>';
  const playLine=node('div',null,root.querySelector('.edit-tracks'),'edit-playline');playLine.setAttribute('aria-hidden','true');
  let before=[], beforeSettings={}, comparison=false, fullWatch=false, watchFromStart=false;
  function load(i,carry=false){const project=carry&&i>=4?{clips:clips.map(s=>({...s})),subtitle,position,music,cue}:null;stop();current=i;uid=0;splitCount=0;comparison=false;fullWatch=false;subtitle='';position='center';framing='wide';music=60;cue=90;playhead=0;
    clips=i===0?[]:(i===1?['jump','goal','win','run']:i===2?['goal','wait','jump','win']:['goal','run','jump','win']).map(create);
    if(i>=5){subtitle='這一跳，差點沒過！';position='bottom';}if(i>=6){framing='medium';clips.find(s=>s.id==='jump').framing='medium';}if(i===8){clips.find(s=>s.id==='run').speed=2;clips.find(s=>s.id==='jump').in=.5;clips.find(s=>s.id==='jump').out=3.5;music=20;}
    if(project){clips=project.clips;uid=Math.max(...clips.map(s=>s.key));subtitle=project.subtitle;position=project.position;music=project.music;cue=project.cue;}before=clips.map(s=>({...s}));beforeSettings={subtitle,position,music,cue};selected=clips.find(n=>n.id==='jump')?.key||clips[0]?.key||null;if(i>=3&&i<8){const index=clips.findIndex(s=>s.key===selected);playhead=clips.slice(0,index).reduce((sum,s)=>sum+length(s),0);}watchFromStart=false;render();note('');$('editToast').replaceChildren();}
  function render(){
    $('editMissions').replaceChildren();missions.forEach((m,i)=>{const b=node('button',(completed.has(i)?'✓ ':String(i+1)+'. ')+m[0],$('editMissions'),(i===current?'current ':'')+(completed.has(i)?'passed':''));b.onclick=()=>load(i);});
    $('editCount').textContent='操作徽章 '+completed.size+' / 9';$('editMissionNumber').textContent='MISSION 0'+(current+1);$('editTitle').textContent=missions[current][1];$('editInstruction').textContent=missions[current][2];$('editConcept').textContent='剪映裡也會用到：'+missions[current][3];
    $('editLibrary').replaceChildren();node('div','① 素材庫',$('editLibrary'),'edit-area-title');library.forEach(s=>{const b=node('button',s.icon+' '+s.name,$('editLibrary'),clips.some(n=>n.id===s.id)?'in-use':'');node('small',s.duration+' 秒 · ＋加入時間軸',b);b.onclick=()=>{if(clips.some(n=>n.id===s.id)){note('這段已經在時間軸上。點片段就能選取與調整。');return;}stop();comparison=false;const clip=create(s.id);playhead=total();clips.push(clip);selected=clip.key;fullWatch=false;render();note('素材已加入影片軌，現在試著播放或排列它。');};});
    renderTracks();renderSettings();paint();
  }
  function renderTracks(){watchFromStart=false;
    const track=$('editVideoTrack');track.replaceChildren();let acc=0;
    clips.forEach((s,i)=>{const start=acc;acc+=length(s);const b=node('button',s.icon+' '+s.name,track,'edit-clip '+(s.id==='wait'?'wait ':'')+(s.key===selected?'selected':''));b.style.flexGrow=length(s);node('small',length(s).toFixed(1)+'s · '+s.speed+'×',b);b.draggable=true;b.setAttribute('aria-label','選取 '+s.name+' 片段 '+(i+1));b.onclick=()=>{stop();comparison=false;selected=s.key;playhead=start;watchFromStart=false;renderTracks();renderSettings();paint();};b.ondragstart=e=>e.dataTransfer.setData('text/plain',String(s.key));b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();if(comparison){note('先切回我的版本，再調整時間軸。');return;}const key=Number(e.dataTransfer.getData('text/plain')),from=clips.findIndex(n=>n.key===key);if(from<0)return;stop();const [moving]=clips.splice(from,1);clips.splice(i,0,moving);fullWatch=false;playhead=0;renderTracks();paint();};});
    if(!clips.length)node('span','從素材庫加入第一段鏡頭 →',track,'edit-caption-empty');
    $('editScrub').max=total()||1;$('editScrub').value=Math.min(playhead,total());$('editCaptionTrack').textContent=subtitle?subtitle+' · 跟著跳躍鏡頭出現':'還沒加入字幕';$('editCaptionTrack').className=subtitle?'edit-track-block':'edit-caption-empty';$('editSoundTrack').textContent='♫ 背景音樂 '+music+'%　／　★ 成功提示音 '+cue+'%';
    const index=clips.findIndex(n=>n.key===selected);$('editSplit').disabled=!clips.length;$('editDelete').disabled=index<0;$('editLeft').disabled=index<=0;$('editRight').disabled=index<0||index>=clips.length-1;if(comparison)for(const id of ['editSplit','editDelete','editLeft','editRight'])$(id).disabled=true;
  }
  function slider(label,min,max,value,onchange,step=.1){const wrap=node('label',label,$('editSettings'));const input=node('input',null,wrap);input.type='range';input.min=min;input.max=max;input.step=step;input.value=value;input.setAttribute('aria-label',label.split('：')[0]);input.oninput=()=>{if(current!==7)stop();comparison=false;onchange(Number(input.value));const unit=label.includes('%')?'%':' 秒';wrap.firstChild.textContent=label.split('：')[0]+'：'+Number(input.value).toFixed(unit==='%'?0:1)+unit;fullWatch=false;renderTracks();paint();};return input;}
  function select(label,options,value,onchange){const wrap=node('label',label,$('editSettings')),input=node('select',null,wrap);input.setAttribute('aria-label',label);options.forEach(([v,text])=>{const n=node('option',text,input);n.value=v;});input.value=value;input.onchange=()=>{stop();comparison=false;onchange(input.value);fullWatch=false;renderTracks();paint();};}
  function renderSettings(){const settings=$('editSettings');settings.replaceChildren();const s=chosen();node('p',s?'選取：'+s.name:'先從素材庫加入鏡頭',settings,'edit-mini-note');
    if(current===3&&s){slider('片段開始：'+s.in.toFixed(1)+' 秒',0,s.duration-.5,s.in,v=>{s.in=Math.min(v,s.out-.5);});slider('片段結束：'+s.out.toFixed(1)+' 秒',.5,s.duration,s.out,v=>{s.out=Math.max(v,s.in+.5);});}
    if(current===4){const label=node('label','跳躍字幕（最多 16 字）',settings),input=node('input',null,label);input.type='text';input.maxLength=16;input.value=subtitle;input.setAttribute('aria-label','跳躍字幕');input.oninput=()=>{subtitle=input.value;comparison=false;fullWatch=false;renderTracks();paint();};select('字幕位置',[['center','中央：可能遮住跳躍'],['bottom','下方：避開重要動作']],position,v=>position=v);}
    if(current===5)select('畫面景別',[['wide','全景：交代整條路'],['close','特寫：只看表情'],['medium','中景：角色與落點']],s?.framing||'wide',v=>{framing=v;if(s)s.framing=v;});
    if(current===6&&s)select('選取片段的速度',[['1','1 倍：原本的速度'],['2','2 倍：加速'],['.5','0.5 倍：放慢']],String(s.speed),v=>{s.speed=Number(v);playhead=0;});
    if(current===7){node('p','試聽使用合成背景音與成功提示音，練習聽出音量的差別。',settings,'edit-mini-note');slider('背景音樂：'+music+'%',0,100,music,v=>{music=v;syncAudio();},1);slider('成功提示音：'+cue+'%',0,100,cue,v=>{cue=v;syncAudio();},1);}
    if(current===8){for(const text of ['起點與目的交代清楚','關鍵動作和字幕看得懂','結尾有結果，音樂不搶戲']){const label=node('label',null,settings),cb=node('input',null,label);cb.type='checkbox';cb.setAttribute('aria-label',text);label.append(document.createTextNode(' '+text));}node('p','先完整播放一次，最後再按檢查下載計畫。',settings,'edit-mini-note');}
    if(current<3)node('p',current===2?'工具提示：播放頭在片段內部才能分割。按片段可選取，紫框表示目前選取。':'工具提示：紫框表示選取的片段。先選取，再排列或刪除。',settings,'edit-mini-note');
  }
  function paint(){const source=comparison?before:clips;const sum=source.reduce((a,s)=>a+length(s),0);let acc=0,idx=-1,s=null;for(let i=0;i<source.length;i++){if(playhead<acc+length(source[i])||i===source.length-1){s=source[i];idx=i;break;}acc+=length(source[i]);}
    const ctx=$('editCanvas').getContext('2d');ctx.clearRect(0,0,960,540);ctx.save();if(s?.framing==='medium'){ctx.translate(-195,-135);ctx.scale(1.45,1.45);}if(s?.framing==='close'){ctx.translate(-535,-430);ctx.scale(3,3);}
    const local=s?Math.max(0,Math.min(s.out-s.in,(playhead-acc)*s.speed)):0;const original=s?s.in+local:0;const t=s?.id==='jump'?Math.max(0,Math.min(1,(original-.8)/2.4)):s?original/s.duration:0;window.Lesson2Visuals.draw(s?.scene||'goal',t,ctx);ctx.restore();
    $('editSubtitle').replaceChildren();const shownText=comparison?beforeSettings.subtitle:subtitle;const shownPosition=comparison?beforeSettings.position:position;$('editSubtitle').className=shownPosition==='center'?'center':'';if(s?.id==='jump'&&shownText)node('span',shownText,$('editSubtitle'));
    $('editTime').textContent=(comparison?'修改前 · ':'')+playhead.toFixed(1)+' / '+sum.toFixed(1)+' 秒';$('editScrub').value=Math.min(playhead,total());$('editRulerTime').textContent=playhead.toFixed(1)+'s';[...$('editVideoTrack').children].forEach((n,i)=>n.classList.toggle('now',!comparison&&i===idx));$('editBefore').classList.toggle('chosen',comparison);$('editAfter').classList.toggle('chosen',!comparison);
    playLine.style.display=clips.length&&!comparison?'block':'none';const track=$('editVideoTrack');playLine.style.left=(track.offsetLeft+(total()?Math.min(1,playhead/total()):0)*Math.max(0,track.scrollWidth-2))+'px';syncAudio(s?.id==='win');
  }
  function invalidate(){stop();comparison=false;fullWatch=false;playhead=Math.min(playhead,total());renderTracks();renderSettings();paint();}
  $('editSplit').onclick=()=>{let acc=0;const i=clips.findIndex(s=>{const end=acc+length(s),inside=playhead>acc+.1&&playhead<end-.1;if(inside)return true;acc=end;return false;});if(i<0){note('把播放頭放在片段中間，避開邊界，再按分割。');return;}const s=clips[i],cut=s.in+(playhead-acc)*s.speed;clips.splice(i,1,{...s,out:cut},{...s,key:++uid,in:cut});selected=clips[i+1].key;if(s.id==='wait')splitCount++;invalidate();note('已分割成兩段。畫面還沒消失；要拿掉哪段，先點選再刪除。');};
  $('editDelete').onclick=()=>{clips=clips.filter(n=>n.key!==selected);selected=clips[0]?.key||null;invalidate();};
  function move(delta){const i=clips.findIndex(n=>n.key===selected);if(i<0||i+delta<0||i+delta>=clips.length)return;[clips[i],clips[i+delta]]=[clips[i+delta],clips[i]];playhead=0;invalidate();}
  $('editLeft').onclick=()=>move(-1);$('editRight').onclick=()=>move(1);$('editReset').onclick=()=>load(current);
  $('editScrub').oninput=()=>{stop();comparison=false;playhead=Number($('editScrub').value);watchFromStart=false;renderTracks();paint();};
  $('editBefore').onclick=()=>{stop();comparison=true;playhead=0;renderTracks();paint();note(current===0?'素材還在素材庫中。先加入片段，再比較你的排列。':'這是本關剛開始的排列與長度。按播放，再切回你的版本比較。');};$('editAfter').onclick=()=>{stop();comparison=false;playhead=0;renderTracks();paint();};
  function tick(now){if(!playing)return;if(document.hidden||!document.documentElement.classList.contains('gate-ready')||($('tb')&&!$('tb').hidden)){stop();return;}playhead+=Math.min(.05,(now-last)/1000);last=now;const sum=(comparison?before:clips).reduce((a,s)=>a+length(s),0);playhead=Math.min(playhead,sum);paint();if(playhead>=sum){if(!comparison&&watchFromStart)fullWatch=true;stop();return;}raf=requestAnimationFrame(tick);}
  $('editPlay').onclick=()=>{const sum=(comparison?before:clips).reduce((a,s)=>a+length(s),0);if(!sum){note('先從素材庫加入鏡頭到時間軸。');return;}if(playing){stop();return;}if(playhead>=sum)playhead=0;if(playhead===0)watchFromStart=true;playing=true;last=performance.now();$('editPlay').textContent='⏸ 暫停';if(audition)startAudio();raf=requestAnimationFrame(tick);};$('editStop').onclick=()=>{stop();playhead=0;paint();};
  function startAudio(){if(!audio){audio=new(window.AudioContext||window.webkitAudioContext)();gain=audio.createGain();gain.gain.value=0;gain.connect(audio.destination);oscillator=audio.createOscillator();oscillator.type='sine';oscillator.frequency.value=196;oscillator.connect(gain);oscillator.start();const bell=audio.createOscillator();bell.frequency.value=784;cueGain=audio.createGain();cueGain.gain.value=0;bell.connect(cueGain);cueGain.connect(audio.destination);bell.start();}audio.resume().catch(()=>{});syncAudio();}
  function syncAudio(isWin=false){if(gain){gain.gain.value=playing&&audition?(comparison?beforeSettings.music:music)/100*.06:0;cueGain.gain.value=playing&&audition&&isWin?(comparison?beforeSettings.cue:cue)/100*.045:0;if(oscillator)oscillator.frequency.value=196+Math.floor(playhead*2)%3*49;}}
  $('editAudition').onchange=()=>{audition=$('editAudition').checked;if(audition)try{startAudio();}catch(_){audition=false;$('editAudition').checked=false;note('這個瀏覽器無法試聽；仍可用音軌數值完成任務。');}syncAudio();};
  $('editCheck').onclick=()=>{let message='';const ids=clips.map(s=>s.id),jump=clips.find(s=>s.id==='jump'),run=clips.find(s=>s.id==='run');
    if(current===0&&(!['goal','run','jump','win'].every(id=>ids.includes(id))||ids.includes('wait')))message='留下目標、接近邊緣、跳躍與結果。空等片段可以先從時間軸刪除。';
    if(current===1&&ids.join()!=='goal,run,jump,win')message='在時間軸上排出：起點 → 接近邊緣 → 起跳落地 → 終點。';
    if(current===2&&(splitCount<1||ids.includes('wait')||!['goal','jump','win'].every(id=>ids.includes(id))))message='先在空等片段中分割，再選取刪掉空等；其他故事片段要留下。';
    if(current===3&&(!jump||jump.in>.8||jump.out<3.2||length(jump)>3.2))message='這份素材在 0.8 秒起跳、3.2 秒落地。試著從 0.5 秒保留到 3.5 秒，完整動作才不會不見。';
    if(current===4&&(!subtitle.trim()||position!=='bottom'))message='加一句短字幕，再把位置改到下方，避開主角。';
    if(current===5&&jump?.framing!=='medium')message='這一段要同時看見角色和落點。試試中景，別只留下表情。';
    if(current===6&&(!run||run.speed!==2||!jump||jump.speed!==1))message='先點移動片段調成 2 倍，再點跳躍片段確認 1 倍。重點動作需要看清楚。';
    if(current===7&&(music>25||cue<70))message='讓音樂退到 25% 以下，成功提示音留在 70% 以上。這是這一段的練習設定，不是所有影片的固定規則。';
    if(current===8&&(!fullWatch||[...$('editSettings').querySelectorAll('input[type=checkbox]')].some(n=>!n.checked)))message='先完整播放你的版本，再完成三個檢查。';
    if(message){note(message);return;}completed.add(current);try{sessionStorage.setItem('vshort_edit_missions_v1',JSON.stringify([...completed]));}catch(_){}stop();render();note('✓ '+missions[current][3]);node('strong','剪輯任務完成 ✦',$('editToast'));setTimeout(()=>$('editToast').replaceChildren(),1500);
    if(current===8){download();}else{const next=node('button','下一個剪輯任務 →',$('editSettings'));next.onclick=()=>load(current+1,true);}
  };
  function download(){const text='# 我的剪輯操作計畫\n\n'+clips.map((s,i)=>`${i+1}. ${s.name}：保留 ${s.in.toFixed(1)}–${s.out.toFixed(1)} 秒，${s.speed} 倍速\n`).join('')+`\n字幕：${subtitle}\n位置：${position}\n音樂 ${music}%；成功提示音 ${cue}%\n\n## 剪映操作順序\n匯入素材 → 加入時間軸 → 排列 → 分割與刪除 → 修剪 → 字幕 → 畫面與變速 → 音量 → 預覽 → 輸出影片。\n\n實際影片請按素材與觀眾需求調整，不需套用本練習的固定數值。\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='我的剪輯操作計畫.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});document.querySelector('.extra-worlds').addEventListener('toggle',()=>{stop();$('stopPreview').click();$('studioStop').click();});
  load(0);
})();
