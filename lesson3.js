(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const steps = [
    {tab:'開工',phase:'00–05 分 · 先看成品',title:'今天的任務：讓紙飛機飛起來',goal:'把三段原片，變成「準備 → 試飛 → 結果」的小短片。',
      cue:'今天下課，要帶走的是一份計畫，還是一支真的能播放的影片？',answer:'一支<b>能播放的 MP4 影片</b>。今天在真正的剪映動手做，完成後還要打開影片檔看看。',zones:[],
      actions:['先看老師播放原片與成品：找到「少了等待、多了字幕」的地方。','打開剪映電腦版，按「開始創作／建立專案」。','在專案名稱處改成「紙飛機_我的代號」。今天先做基本剪接，完成後再挑加分操作。'],
      proof:'真正的剪映已開啟編輯畫面，下方有時間軸；不是還停在首頁。',rescue:'找不到同名按鈕？找「建立／新建專案」的入口。先由老師確認大家都進入編輯畫面。',teacher:'只用一句話銜接前兩堂，不重講故事理論。播放自備成品，請孩子指出具體差異。沒有個人電腦時，兩人一組輪流操作與口述。'},
    {tab:'認位置',phase:'05–09 分 · 找到工作區',title:'四個地方，各有一份工作',goal:'不必背每個按鈕。先知道「拿材料、看結果、排時間、改設定」。',
      cue:'我想把第二段的聲音變小。是先點素材庫，還是先選時間軸上的第二段？',answer:'先選<b>時間軸上的第二段</b>，再到<b>設定區</b>找音量。記一句：<b>先選誰，再改誰。</b>',zones:['library','preview','timeline','settings'],
      actions:['在真正的剪映上，用手指出：素材庫、預覽窗、時間軸、右側設定區。','老師點一段影片，觀察選取外框，再看右側出現哪些設定。','把滑鼠移到一個不認識的圖示上稍停，看功能提示；不急著亂按。'],
      proof:'老師說「看結果」你能指預覽窗；說「改哪一段」你能先指時間軸上的片段。',rescue:'右側空白或顯示專案資訊時，可能還沒選片段。若面板收起，請老師協助還原工作區。',teacher:'這頁做指認，不要求孩子在空專案裡調音量。先在老師的示範專案點一段影片，讓孩子看見選取前後的差異。本頁四區按鈕可複習工作，再切回剪映找位置。'},
    {tab:'匯入',phase:'09–13 分 · 讓素材進來',title:'先放進素材庫，再放上時間軸',goal:'匯入像把食材放上桌；排進時間軸，才開始成為這支片。',
      cue:'左邊已經有三個縮圖，為什麼按播放，下面還沒有影片？',answer:'影片還在<b>素材庫</b>，要再把它們<b>拖到時間軸</b>。匯入完成，不等於已經排進作品。',zones:['library','timeline'],
      actions:['在「媒體／本地」找「導入／匯入」，選老師準備的三支影片。','等縮圖出現，先把「準備」拖到下方影片軌，再把「試飛、結果」接在後面。','在預覽窗下方找「比例／原始」，選 9:16。若主角被裁掉，先縮小或調位置，讓紙飛機完整看得到。'],
      proof:'時間軸上有三段影片；移動播放頭時，預覽會跟著換畫面。',rescue:'只看到素材、時間軸還空著？再拖一次到影片軌。橫式原片放入直式畫布可能留黑邊，先保留完整內容，不要為了填滿而裁掉主角。',teacher:'素材統一放在好找的資料夾。9:16 是畫布比例，不是把人物拉長；不假設建立專案時一定會跳出比例選單。'},
    {tab:'選取與播放',phase:'13–17 分 · 先選誰，再改誰',title:'選片段，和看第幾秒，是兩件事',goal:'選取外框決定「改誰」；播放頭決定「看哪裡／切哪裡」。',
      cue:'我明明看到試飛畫面，按刪除卻刪了準備片段，可能是哪裡沒確認？',answer:'預覽看的位置，和選到的片段可能不同。先看<b>哪段有選取外框</b>，再操作；白色豎線是<b>播放頭</b>，不是選取外框。',zones:['timeline','preview'],
      actions:['在時間軸點一下「試飛」片段，看它出現選取外框。','點時間軸上方的時間刻度，把播放頭移到另一個位置，觀察預覽改變。','按預覽的播放鍵，再暫停。焦點不在文字輸入框時，也可試空白鍵播放／暫停。'],
      proof:'你能分別指出「目前選哪一段」和「現在看到第幾秒」，兩個答案不必相同。',rescue:'空白鍵一直打出空格？先離開文字輸入框。剪錯先用左上方復原箭頭；Windows 可按 Ctrl+Z，Mac 用 Command+Z。',teacher:'故意在老師專案選第一段，卻把播放頭移到第二段，讓孩子看出差別。後面每次操作前都 CUE「你現在選到誰？」。'},
    {tab:'排列',phase:'17–20 分 · 排出播放順序',title:'把三段接起來，完整播一次',goal:'從左到右，就是影片播放的順序。',
      cue:'結果跑到第一段了。我該拖左邊素材庫的縮圖，還是下方已排好的片段？',answer:'拖<b>下方時間軸上的片段</b>，把它放回最後。再把播放頭移回開頭，確認順序和接縫。',zones:['timeline','preview'],
      actions:['看時間軸，排成「準備 → 試飛 → 結果」。順序正確就不用重排。','要換位置時，按住片段中間拖曳，看插入位置的提示，再放開。','從第一秒播放：檢查有沒有重複、空白或奇怪的順序。若有空隙，把下一段接到上一段尾端。'],
      proof:'播放先看到準備，再看到飛出去，最後看到落地反應；接縫沒有多餘黑畫面。',rescue:'一拖變成片段縮短？你可能抓到邊緣。復原，改抓片段中間。若拖到上方變成另一條軌道，復原後放回主要影片軌。',teacher:'本頁只確認拖曳、插入位置與連續播放，不再重講故事結構。'},
    {tab:'剪頭尾',phase:'20–24 分 · 第一種剪法',title:'頭尾多一點？抓邊邊，往內收',goal:'先拿掉「準備」開頭的發呆，保留真正開始動手的畫面。',
      cue:'只有片頭多了兩秒等待，需要先切兩刀嗎？',answer:'可以直接<b>拖片段左邊緣往內</b>，修掉開頭。頭尾用修剪很方便；原本的動作快慢沒有改變。',zones:['timeline','preview'],
      actions:['點選「準備」。滑鼠移到片段最左邊，確認游標變成修剪邊界的樣子。','把左邊緣往右拖一點，去掉開頭等待；邊看預覽，停在開始動手前。','若前面留下空隙，把片段移回開頭，再播放前幾秒。'],
      proof:'開頭等待不見了，但折紙的手沒有突然變快，開始動作也還完整。',rescue:'切太多？先復原重試，或把邊界往外拉回。片段太小時，用時間軸縮放滑桿放大刻度，再抓邊緣。',teacher:'先示範「抓中間＝移動；抓邊緣＝修剪」。秒數依自備原片調整，不要求孩子死守 2 秒。'},
    {tab:'剪中間',phase:'24–31 分 · 第二種剪法',title:'中間有等待？兩刀夾住，再刪掉',goal:'把試飛中間多餘的等候拿掉，前後動作都要留下。',
      cue:'等待夾在中間，只切一刀就按刪除，會不會連後面的試飛也刪掉？',answer:'可能會！先在<b>等待開始與結束各分割一次</b>，再<b>只選中間的等待段刪除</b>。分割只切開，不會自動拿掉畫面。',zones:['timeline','preview'],
      actions:['選「試飛」，移播放頭到等待的開始，按時間軸工具列的「分割／剪刀」。','移播放頭到等待結束，再選對那一段，按第二次分割。','點兩刀中間的等待段，看清選取外框，再按 Delete／刪除。若留空隙，把後段接回來。'],
      proof:'等待消失；前面的準備動作、後面的放飛和落地都還在。播放剪口前後，確認沒有黑畫面。',rescue:'分割沒反應？確認播放頭在所選片段裡，不在邊界；也確認沒有仍在輸入字幕。刪錯先復原，不必重做整支片。',teacher:'比第二堂更進一步：處理單支原片「中間不要、前後都要」的情況。示範兩刀→選中間→刪除→播放剪口；走到孩子旁邊看一次，不只問懂不懂。'},
    {tab:'加字幕',phase:'31–37 分 · 文字也有時間',title:'字寫好了，還要決定何時出現',goal:'加入一句「紙飛機，能飛多遠？」，讓它只在開頭出現。',
      cue:'我只想改字幕，為什麼一拖連影片都動了？應該先選哪一條？',answer:'先選<b>文字軌上的字幕片段</b>。改內容看文字設定，改位置看預覽窗，改出現時間看時間軸。',zones:['timeline','settings','preview'],
      actions:['上方選「文字／文本」→「新增／新建文字」，輸入一句短標題。','在預覽窗把字移到不擋手、紙飛機的位置，離畫面邊緣留一點距離。','回時間軸選文字片段，拖到開頭，收短右邊緣，讓字幕在試飛前消失。'],
      proof:'播放開頭看得到字；到試飛時字已消失。字沒有遮住主要動作，也沒有跑出畫面。',rescue:'打字沒變？先確認選中的是文字片段，再找右側文字輸入區。字一直留到片尾？縮短的是文字軌，不是下方影片軌。',teacher:'今天只用手動輸入一句，避免花整堂課挑字體、動畫或處理自動字幕。CUE「位置去哪改？時間去哪改？」讓孩子指出兩個地方。'},
    {tab:'聽聲音',phase:'37–41 分 · 選對聲音',title:'音樂小一點，重要的聲音留著',goal:'加入老師準備的音樂，讓試飛後的反應還聽得清楚。',
      cue:'音樂蓋住「成功了！」，我該把整台電腦音量關小嗎？',answer:'先選<b>音樂片段</b>，在設定區降低它的音量。電腦總音量會連人聲一起變小；要改的是作品裡的音樂。',zones:['library','timeline','settings'],
      actions:['把老師提供的音樂匯入素材庫，拖到時間軸的音訊軌。','只選音樂片段，到右側「音訊／音量」往下調，再播放比較。若顯示百分比可先試 20–30%，顯示 dB 就從原值慢慢降低。','把音樂尾端修到影片結尾。選影片片段，確認原本的反應聲沒有被靜音。'],
      proof:'實際播放能聽清「成功了」或落地反應；畫面結束後不會只剩音樂一直播。',rescue:'沒聲音時先看預覽是否靜音、電腦輸出裝置與音軌是否靜音。不要把音樂與影片一起選取後才調音量。',teacher:'固定百分比不是合格標準；素材音量不同，要用耳朵確認。若原片沒有反應聲，改以「音樂不刺耳、尾端對齊」驗收。'},
    {tab:'匯出',phase:'41–47 分 · 完成真正影片',title:'剪映裡看得到，還要做成影片檔',goal:'完整看一次，再把作品匯出到自己找得到的資料夾。',
      cue:'我把剪映關掉，朋友就能用播放器打開我的專案嗎？',answer:'專案是可繼續修改的工作紀錄。要用一般播放器觀看，需要<b>匯出影片檔</b>；匯出後還要找到它，實際播放。',zones:['preview','timeline'],
      actions:['把播放頭移回開頭，完整播放：順序對、沒黑畫面、字幕出現時間對、重要聲音聽得到。','右上角「匯出／導出」：確認檔名、儲存位置與 MP4。今天選直式 1080 × 1920；fps 用老師確認的值（例如 30）。若只顯示 1080p，也要確認方向和實際尺寸。','等匯出完成，到指定資料夾找到 MP4，用播放器從頭看一次。'],
      proof:'在剪映以外的播放器能看完約 15–30 秒的影片，字幕和聲音都正常。記得自己存在哪個資料夾。',rescue:'找不到檔案？回匯出視窗確認儲存路徑，或按完成後的「開啟資料夾」。若有付費素材提示，先移除該項，改用今天的基本功能與自備素材。',teacher:'先讓孩子口頭說出儲存位置再匯出；不是按下匯出就算完成。15–30 秒是練取捨的目標；稍長時先找多餘等待，不為湊秒數剪斷關鍵動作。課前用教室版本試匯出一次。'},
    {tab:'獨立挑戰',phase:'47–57 分 · 不看步驟再試一次',title:'換成投籃影片，你還找得到嗎？',goal:'六題情境可輪流口頭回答，再回剪映完成一次獨立修改。',
      cue:'老師只說「讓第一句字幕早一點消失」，你能指出要選誰、去哪裡改嗎？',answer:'選<b>時間軸上的第一段字幕</b>，把它的<b>右邊緣往左收</b>，再播放確認。不是刪影片，也不是只移動播放頭。',zones:[],
      actions:['兩人一組：A 操作、B 只口述；在自己的作品把第一句字幕縮短一點，再交換角色。','老師加一題：「把片頭的等待再拿掉一點」或「把音樂再小一點」。先說要選誰，再自己操作。','改完先預覽，再匯出成「紙飛機_我的代號_v2.mp4」，打開檔案比較。'],
      proof:'沒有照著老師的滑鼠走，也能完成一項修改，說出選了哪個片段、改了什麼、在哪裡看到結果。',rescue:'想不起來時先問自己：要改的是影片、文字還是音樂？先選對那條軌，再找設定或邊緣。必要時回看前面的步驟後重試。',teacher:'網頁選擇題只檢查理解，不代表已會用軟體。實作觀察三件事：能否自行選對物件、完成操作、播放驗證。對需要幫忙的孩子給「先選誰」提示，不直接代按。',challenge:true},
    {tab:'作品分享',phase:'57–60 分 · 用作品回答',title:'給同伴看，也說得出自己怎麼改',goal:'秀出作品，用一句話連起「操作」和「結果」。',
      cue:'如果老師問「你剛才改了什麼」，除了「我按了剪刀」，還能怎麼說？',answer:'例如：「我<b>在等待前後各切一刀，刪掉中間那段</b>，所以試飛更快開始，而且放飛動作還完整。」用作品指出改動。',zones:[],
      actions:['播放匯出的影片給同伴看，請對方指出一個看得清楚的地方。','說一句：「我選了＿＿，用了＿＿，所以畫面／聲音變成＿＿。」','最後指給老師看：素材庫、預覽窗、時間軸、設定區；說出匯出影片的位置。'],
      proof:'你有可播放的影片檔，並能解釋至少一項修改。還沒完成的地方，能說出卡在哪一步。',rescue:'來不及做音樂也沒關係，先確保基本順序、修剪、一句字幕與影片匯出完成；下次再補加分操作。',teacher:'不以特效多寡評分。收課觀察：能指出四區、分清選取與播放頭、完成修剪或分割刪除、調字幕時間、找到匯出檔案。記下需要下次補練的操作。'}
  ];
  steps.slice(1).forEach(s=>{s.phase=s.phase.replace(/^(\d+)–(\d+)/,(_,a,b)=>`${String(Number(a)+15).padStart(2,'0')}–${String(Number(b)+15).padStart(2,'0')}`)});
  steps.splice(1,0,...window.Lesson3Specs.steps);
  const zoneInfo = {
    library:'① 素材庫：放原始影片和音樂。材料在這裡，不代表已經出現在作品裡。',
    preview:'② 預覽窗：看播放頭這一刻的畫面，也能檢查字幕位置、畫面有沒有被裁掉。',
    timeline:'③ 時間軸：左右排先後，片段長短決定播多久；文字、影片、聲音各有片段。',
    settings:'④ 設定區：先選時間軸上的物件，再改它的文字、縮放或音量等設定。'
  };
  const questions = [
    {q:'投籃影片已匯入，時間軸還空著。下一步？',options:['再匯入一次','把素材拖到時間軸','直接按匯出'],correct:1,why:'匯入是備好原料；拖到時間軸，才排進作品。',hint:'先想：左邊是材料，哪裡才排得出作品？'},
    {q:'投籃前後都要留，中間等球太久。怎麼拿掉中間？',options:['等待前後各切一刀，選中間刪除','把影片全部設成 2 倍速','只移動播放頭'],correct:0,why:'兩刀隔出中間那段，再選它刪除，才能留下前後。',hint:'要保留前後，只拿掉中間；需要先把中間隔出來。'},
    {q:'「進球了！」字幕出現太久，文字內容與位置都正確。改哪裡？',options:['把預覽窗的字拖高','把整段影片刪掉','選字幕片段，縮短右邊緣'],correct:2,why:'改出現多久，要調時間軸上的字幕長度。',hint:'字的「位置」和「出現多久」在不同地方調整。'},
    {q:'剛降低音量，音樂沒變，人聲卻變小了。先查什麼？',options:['電腦螢幕亮度','是不是選到了影片片段','再匯入一次音樂'],correct:1,why:'先選誰，再改誰。先復原，再選音樂片段。',hint:'右側改的是目前選取的物件，先看誰有選取外框。'}
  ];
  questions.push(
    {q:'手機直式成品要 1080 × 1920 px，第一支素材卻是橫式。怎麼做？',options:['一律照第一支素材，不用看設定','確認畫布與匯出為直式，再調整素材放法','把人拉長填滿就好'],correct:1,why:'素材、工作畫框與匯出規格要分開確認；可留邊或裁切重構，不能把人拉長。',hint:'原料是什麼形狀，不代表交出去的作品一定要同形狀。'},
    {q:'哪一組都是影片檔案格式？',options:['MP4、MOV','fps、px','MB、GB'],correct:0,why:'MP4、MOV 是容器格式；fps 是幀率單位、px 是像素單位，MB／GB 是容量單位。',hint:'這題問檔案是哪一種容器，不是畫面、幀率或儲存空間的單位。'}
  );
  let current = 0, revealed = false, recall = false, teacher = false;
  const completed = new Set(), attempts = new Map();
  function drawChapters() {
    $('chapters').replaceChildren();
    steps.forEach((s,n) => {
      const b = document.createElement('button');
      b.textContent = `${String(n+1).padStart(2,'0')} ${s.tab}`;
      if(n === current) b.setAttribute('aria-current','step');
      if(completed.has(n)) b.classList.add('complete');
      b.onclick = () => go(n);
      $('chapters').append(b);
    });
  }
  function renderQuiz() {
    $('challenge').replaceChildren();
    if(!steps[current].challenge) return;
    const title = document.createElement('h3'); title.textContent = '換題材，試著自己判斷';
    const desc = document.createElement('p'); desc.textContent = '答完還要回剪映動手做；網頁不會操作或檢查你的軟體。';
    $('challenge').append(title,desc);
    questions.forEach((item,n) => {
      const article = document.createElement('article'); article.className='quiz-item';
      const heading = document.createElement('h4'); heading.textContent=`${n+1}. ${item.q}`;
      const options = document.createElement('div'); options.className='quiz-options'; options.setAttribute('role','group');options.setAttribute('aria-label',item.q);
      const feedback = document.createElement('p'); feedback.className='quiz-feedback'; feedback.setAttribute('role','status');
      function showAnswer(index) {
        [...options.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(index===j)));
        feedback.textContent=(index===item.correct?'對，理由是：':'再想一想：')+(index===item.correct?item.why:item.hint);
      }
      item.options.forEach((text,j)=>{
        const b=document.createElement('button');b.textContent=text;b.setAttribute('aria-pressed','false');
        b.onclick=()=>{attempts.set(n,j);showAnswer(j)};options.append(b);
      });
      if(attempts.has(n)) showAnswer(attempts.get(n));
      article.append(heading,options,feedback);$('challenge').append(article);
    });
  }
  function updateReveal() {
    $('cueAnswer').hidden=!revealed;
    $('revealButton').textContent=revealed?'收起解答 ↑':'說完了，看解答 ↓';
    $('revealButton').setAttribute('aria-expanded',String(revealed));
    const hidden=recall&&!revealed;
    $('specPanel').hidden=!steps[current].spec||hidden;
    document.querySelector('.map-panel').hidden=!!steps[current].spec;
    document.querySelector('.workspace').classList.toggle('spec-recall',!!steps[current].spec&&hidden);
    $('actions').hidden=hidden;$('proof').parentElement.hidden=hidden;
    document.querySelector('.rescue').hidden=hidden;
    document.querySelectorAll('.zone').forEach(b=>b.classList.toggle('hot',!hidden&&steps[current].zones.includes(b.dataset.zone)));
    $('mapHelp').textContent=hidden?'CUE 模式：先指位置、說做法。揭曉後才顯示操作步驟與位置提示。':'點區域，練習說出它的工作。亮框是這一步會用到的位置。';
    $('zoneFeedback').textContent='';
    document.querySelectorAll('.zone').forEach(b=>b.disabled=hidden);
    $('challenge').hidden=!steps[current].challenge||hidden;
    const specTitles={formats:'一起比較不同影片格式',capacity:'先看檔案佔多少空間'};
    $('doTitle').textContent=hidden?(steps[current].spec?'先說你的判斷，再揭曉。':'先說要選誰、去哪裡改，再揭曉。'):(specTitles[steps[current].spec]||(steps[current].spec?'一起看圖，把數字讀懂':'一次只做這幾件事'));
  }
  function draw() {
    const s=steps[current];
    $('cuePrompt').textContent=s.spec?'先說你的判斷和理由；不用急著背數字。':'先用手指出位置，再說「我要先＿＿，然後＿＿」。';
    $('doEyebrow').textContent=s.spec?'看圖、比較、用自己的話說':'切回剪映，跟著做';
    $('stepMeta').textContent=s.phase;$('stepCount').textContent=`${current+1} / ${steps.length}`;
    $('specPanel').replaceChildren();
    if(s.spec) window.Lesson3Specs.render($('specPanel'),s.spec);
    $('doneLabel').textContent=s.spec?'我能用自己的話說出規格差別':'我已在剪映完成，並看過結果';
    $('stepTitle').textContent=s.title;$('stepGoal').textContent=s.goal;
    $('cueQuestion').textContent=s.cue;$('cueAnswer').innerHTML=s.answer;
    $('actions').replaceChildren(...s.actions.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
    $('proof').textContent=s.proof;$('rescue').textContent=s.rescue;
    document.querySelector('.rescue').open=false;
    $('teacherNote').replaceChildren();
    const label=document.createElement('strong');label.textContent='老師帶法';
    const note=document.createElement('p');note.textContent=s.teacher;$('teacherNote').append(label,note);$('teacherNote').hidden=!teacher;
    $('doneCheck').checked=completed.has(current);$('doneCount').textContent=`實作自查 ${completed.size} / ${steps.length}`;
    $('prevButton').disabled=current===0;$('nextButton').disabled=current===steps.length-1;
    drawChapters();renderQuiz();updateReveal();
  }
  function go(n) {
    if(n<0||n>=steps.length||n===current)return;
    current=n;revealed=false;draw();
    $('stepTitle').focus({preventScroll:true});
    document.querySelector('.lesson').scrollIntoView({behavior:'instant',block:'start'});
    $('chapters').querySelector('[aria-current]').scrollIntoView({behavior:'instant',block:'nearest',inline:'nearest'});
  }
  $('revealButton').onclick=()=>{revealed=!revealed;updateReveal()};
  $('recallToggle').onclick=()=>{recall=!recall;revealed=false;$('recallToggle').setAttribute('aria-pressed',String(recall));updateReveal()};
  $('teacherToggle').onclick=()=>{teacher=!teacher;$('teacherToggle').setAttribute('aria-pressed',String(teacher));$('teacherNote').hidden=!teacher};
  $('toolboxButton').onclick=()=>{if(window.DirectorToolbox)window.DirectorToolbox.open()};
  $('prevButton').onclick=()=>go(current-1);$('nextButton').onclick=()=>go(current+1);
  $('doneCheck').onchange=e=>{e.target.checked?completed.add(current):completed.delete(current);drawChapters();$('doneCount').textContent=`實作自查 ${completed.size} / ${steps.length}`};
  document.querySelectorAll('.zone').forEach(b=>b.onclick=()=>{$('zoneFeedback').textContent=zoneInfo[b.dataset.zone]});
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,button,a,summary,[contenteditable]'))return;
    if(e.key==='ArrowRight'){e.preventDefault();go(current+1)}
    if(e.key==='ArrowLeft'){e.preventDefault();go(current-1)}
  });
  draw();
  window.addEventListener('load',()=>{if(window.DirectorToolbox)window.DirectorToolbox.mount({fab:false})});
})();
