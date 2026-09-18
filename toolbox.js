(function (global) {
  'use strict';

  var TABS = ['Hook 產生器', '三格腳本', '字幕建議', '節奏標記', 'AI 指令', '拆片檢核', '簡繁轉換'];
  var state = { mounted: false, current: TABS[0], marks: [] };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function html(tag, cls, value) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    n.innerHTML = value;
    return n;
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text || '');
    return Promise.resolve();
  }
  function download(name, text) {
    var blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function ensureStyle() {
    if (document.getElementById('toolbox-style')) return;
    var s = el('style');
    s.id = 'toolbox-style';
    s.textContent =
      '#tb-fab{position:fixed;left:16px;bottom:78px;z-index:40;background:#72efb4;color:#101724;border:2px solid #101724;border-radius:12px;padding:10px 14px;font:inherit;font-weight:700;cursor:pointer;box-shadow:4px 4px 0 #0006}' +
      '#tb-fab:hover{filter:brightness(1.06)}' +
      '#tb{position:fixed;inset:0;z-index:9050;background:#0008;display:flex;align-items:center;justify-content:center;padding:16px}' +
      '#tb[hidden]{display:none!important}' +
      '#tb .panel{width:min(920px,96vw);max-height:90vh;overflow:hidden;background:#1a2538;border:1px solid #34435b;border-radius:14px;color:#f2f5fc;font-family:"Microsoft JhengHei","Noto Sans TC",sans-serif;display:flex;flex-direction:column}' +
      '#tb .top{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #34435b}' +
      '#tb .top strong{color:#72efb4}' +
      '#tb .tabs{display:flex;gap:8px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid #34435b}' +
      '#tb .tabs button{background:transparent;color:#aab7ca;border:1px solid #34435b;border-radius:8px;padding:6px 10px;cursor:pointer}' +
      '#tb .tabs button.on{background:#72efb4;color:#101724;border-color:#72efb4}' +
      '#tb .body{padding:16px;overflow:auto;min-height:0}' +
      '#tb .body input,#tb .body select,#tb .body textarea{width:100%;box-sizing:border-box;background:#101724;color:#f2f5fc;border:1px solid #34435b;border-radius:8px;padding:8px;margin:6px 0 10px;font:inherit}' +
      '#tb .body textarea{min-height:76px}' +
      '#tb .body .row{display:flex;gap:10px;flex-wrap:wrap}' +
      '#tb .body button{background:#72efb4;color:#101724;border:1px solid #72efb4;border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit;font-weight:700}' +
      '#tb .body .ghost{background:transparent;color:#f2f5fc;border-color:#34435b;font-weight:400}' +
      '#tb .card{background:#101724;border:1px solid #34435b;border-radius:10px;padding:12px;margin:8px 0}' +
      '#tb .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}' +
      '#tb .pace{display:flex;gap:6px;min-height:52px;padding:8px;border:1px dashed #34435b;border-radius:8px;margin:10px 0}' +
      '#tb .pace span{flex:1;min-width:46px;text-align:center;padding:8px;border-radius:6px;cursor:pointer;font-weight:700}' +
      '#tb .p-fast{background:#204137;color:#72efb4}#tb .p-mid{background:#2b2445;color:#b8a2ff}#tb .p-stop{background:#1a2538;color:#aab7ca}' +
      '#tb .check{display:flex;gap:8px;align-items:center;padding:8px;border:1px solid #34435b;border-radius:8px;margin:6px 0}' +
      '@media(max-width:700px){#tb .grid{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }

  function basePanel() {
    return html('div', '', '<div class="panel"><div class="top"><strong>導演工具箱</strong><button id="tb-close" class="ghost">關閉</button></div><div class="tabs" id="tb-tabs"></div><div class="body" id="tb-body"></div></div>');
  }

  function render(tab) {
    state.current = tab;
    var body = document.getElementById('tb-body');
    var tabs = document.getElementById('tb-tabs').children;
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('on', tabs[i].dataset.tab === tab);
    body.innerHTML = '';
    if (tab === 'Hook 產生器') return renderHook(body);
    if (tab === '三格腳本') return renderScript(body);
    if (tab === '字幕建議') return renderCaption(body);
    if (tab === '節奏標記') return renderPace(body);
    if (tab === 'AI 指令') return renderPrompt(body);
    if (tab === '拆片檢核') return renderChecklist(body);
    return renderConvert(body);
  }

  function renderHook(body) {
    body.appendChild(html('p', '', '先選題材，再挑一個開頭句改成自己的。'));
    var genre = html('select', '', '<option>Roblox／RIVALS</option><option>旅遊</option><option>運動</option><option>美食</option><option>開箱</option><option>校園</option>');
    var out = el('div');
    var btn = el('button', '', '給我 3 個開頭');
    var map = {
      'Roblox／RIVALS': ['這場只能用手槍，失敗就結束！', '剩最後一回合，我能逆轉嗎？', '我只給自己三次機會。'],
      '旅遊': ['只有500元，在這裡能玩什麼？', '我迷路了，卻找到更酷的地方。', '這個景點值得排隊嗎？'],
      '運動': ['最後一球，我能不能進？', '三次機會，這次一定要中。', '差一點就輸了，我怎麼救回來？'],
      '美食': ['不用烤箱，真的做得出來嗎？', '我以為會失敗，結果超意外。', '第一次做這道，能成功嗎？'],
      '開箱': ['它真的像廣告說的那麼厲害？', '我只測一件事：到底值不值得買。', '這功能我直接實測給你看。'],
      '校園': ['我們只有10分鐘，能完成嗎？', '本來很簡單，做了才知道難。', '你猜我們最後有沒有成功？']
    };
    btn.onclick = function () {
      out.innerHTML = '';
      (map[genre.value] || map['Roblox／RIVALS']).forEach(function (line) {
        var card = html('div', 'card', '<div>' + line + '</div>');
        var use = el('button', 'ghost', '複製這句');
        use.onclick = function () { copyText(line); };
        card.appendChild(use);
        out.appendChild(card);
      });
    };
    body.appendChild(genre); body.appendChild(btn); body.appendChild(out); btn.click();
  }

  function renderScript(body) {
    body.appendChild(html('p', '', '把想法先變成三格腳本，再進剪輯。'));
    var wrap = el('div', 'grid');
    var fields = [];
    ['開始', '過程', '結果'].forEach(function (t, idx) {
      var d = el('div', 'card');
      var shot = el('textarea'); shot.placeholder = '畫面';
      var line = el('input'); line.placeholder = '台詞';
      var sec = el('input'); sec.type = 'number'; sec.value = idx === 1 ? 20 : (idx === 0 ? 3 : 7);
      d.appendChild(html('strong', '', t)); d.appendChild(shot); d.appendChild(line); d.appendChild(sec);
      fields.push({ t: t, shot: shot, line: line, sec: sec }); wrap.appendChild(d);
    });
    var actions = el('div', 'row');
    var total = html('strong', '', '合計 30 秒');
    var dl = el('button', '', '下載腳本');
    function sum() {
      var s = fields.reduce(function (a, f) { return a + (Number(f.sec.value) || 0); }, 0);
      total.textContent = '合計 ' + s + ' 秒';
      return s;
    }
    fields.forEach(function (f) { f.sec.oninput = sum; });
    dl.onclick = function () {
      var txt = fields.map(function (f) {
        return f.t + '（' + (Number(f.sec.value) || 0) + '秒）\n畫面：' + f.shot.value + '\n台詞：' + f.line.value;
      }).join('\n\n') + '\n\n合計：' + sum() + '秒';
      download('我的三格腳本.txt', txt);
    };
    actions.appendChild(total); actions.appendChild(dl);
    body.appendChild(wrap); body.appendChild(actions); sum();
  }

  function renderCaption(body) {
    body.appendChild(html('p', '', '貼一句話，判斷字幕位置和樣式。'));
    var input = el('textarea');
    var out = el('div');
    var btn = el('button', '', '給建議');
    btn.onclick = function () {
      var s = (input.value || '').trim();
      if (!s) { out.innerHTML = '<div class="card">先輸入一句話。</div>'; return; }
      var len = s.length;
      var place = len <= 8 ? '中間大字' : (len <= 20 ? '下排一行' : '下排兩行');
      var reason = len <= 8 ? '字短而重點強，適合抓注意。' : (len <= 20 ? '不擋主畫面，閱讀負擔剛好。' : '分行可讀性高，避免塞字。');
      out.innerHTML = '<div class="card"><strong>位置：</strong>' + place + '<br><strong>建議：</strong>白字+深底，重點字可放大。<br><strong>原因：</strong>' + reason + '</div>';
    };
    body.appendChild(input); body.appendChild(btn); body.appendChild(out);
  }

  function renderPace(body) {
    body.appendChild(html('p', '', '點「快/慢/停」做節奏條，點方塊可移除。'));
    var bar = el('div', 'pace');
    var out = el('div');
    var row = el('div', 'row');
    [['快', 'p-fast', 2], ['慢', 'p-mid', 5], ['停', 'p-stop', 3]].forEach(function (x) {
      var b = el('button', '', '＋' + x[0]);
      b.onclick = function () { state.marks.push(x[0]); paint(); };
      row.appendChild(b);
    });
    var clear = el('button', 'ghost', '清空');
    clear.onclick = function () { state.marks = []; paint(); };
    row.appendChild(clear);
    function paint() {
      bar.innerHTML = '';
      var secMap = { '快': 2, '慢': 5, '停': 3 };
      var classMap = { '快': 'p-fast', '慢': 'p-mid', '停': 'p-stop' };
      state.marks.forEach(function (m, i) {
        var t = el('span', classMap[m], m);
        t.onclick = function () { state.marks.splice(i, 1); paint(); };
        bar.appendChild(t);
      });
      var total = state.marks.reduce(function (a, m) { return a + secMap[m]; }, 0);
      out.innerHTML = '<div class="card">建議總長約 ' + total + ' 秒（快2/慢5/停3），秒數只是參考。</div>';
    }
    body.appendChild(row); body.appendChild(bar); body.appendChild(out); paint();
  }

  function renderPrompt(body) {
    body.appendChild(html('p', '', '快速產生 AI 指令，格式固定，避免講太散。'));
    var task = html('select', '', '<option value="拆片">拆解短影音</option><option value="字幕">想字幕</option><option value="腳本">寫三格腳本</option>');
    var topic = el('input'); topic.placeholder = '題材';
    var audience = el('input'); audience.placeholder = '觀眾';
    var out = el('textarea'); out.readOnly = true;
    var make = el('button', '', '產生');
    var cp = el('button', 'ghost', '複製');
    function build() {
      var goal = task.value === '拆片' ? '拆解這支短影音的Hook、故事、節奏、字幕、音樂' : (task.value === '字幕' ? '給我3種字幕版本（提示/強調/補資訊）' : '寫30秒三格腳本');
      out.value = '你是短影音創作助手。\n任務：' + goal + '\n題材：' + (topic.value || '（請填）') + '\n觀眾：' + (audience.value || '（請填）') + '\n\n規則：\n1. 用國小可懂的話。\n2. 只給3點，每點附原因。\n3. 不要編造沒出現的內容。\n4. AI給建議，我自己決定。';
    }
    make.onclick = build;
    cp.onclick = function () { copyText(out.value); };
    body.appendChild(task); body.appendChild(topic); body.appendChild(audience); body.appendChild(make); body.appendChild(cp); body.appendChild(out);
    build();
  }

  function renderChecklist(body) {
    body.appendChild(html('p', '', '邊看片邊勾，最後整理出觀察筆記。'));
    var items = ['開頭3秒有任務/限制', '看得出主題→事件→衝突→高潮→結果', '節奏有快慢停變化', '字幕不擋重點', '音樂有服務情緒'];
    var checks = [];
    items.forEach(function (t) {
      var row = el('label', 'check');
      var c = el('input'); c.type = 'checkbox';
      row.appendChild(c); row.appendChild(el('span', '', t));
      checks.push(c); body.appendChild(row);
    });
    var out = el('div');
    var btn = el('button', '', '產出筆記');
    btn.onclick = function () {
      var ok = checks.filter(function (c) { return c.checked; }).length;
      var txt = '拆片筆記\n完成 ' + ok + '/5\n\n最值得學的一點：\n最想改的一點：';
      out.innerHTML = '<div class="card" style="white-space:pre-line">' + txt + '</div>';
      var dl = el('button', 'ghost', '下載筆記');
      dl.onclick = function () { download('拆片筆記.txt', txt); };
      out.appendChild(dl);
    };
    body.appendChild(btn); body.appendChild(out);
  }

  function renderConvert(body) {
    body.appendChild(html('p', '', '簡繁互轉（常用字）。'));
    var s2t = { '简': '簡', '体': '體', '国': '國', '说': '說', '学': '學', '这': '這', '里': '裡', '点': '點', '图': '圖', '录': '錄', '视': '視', '频': '頻', '软': '軟', '导': '導' };
    var t2s = {};
    Object.keys(s2t).forEach(function (k) { t2s[s2t[k]] = k; });
    function convert(text, map) { return (text || '').replace(/./g, function (c) { return map[c] || c; }); }
    var input = el('textarea');
    var out = el('textarea'); out.readOnly = true;
    var t = el('button', '', '轉繁體');
    var s = el('button', 'ghost', '轉簡體');
    var cp = el('button', 'ghost', '複製');
    t.onclick = function () { out.value = convert(input.value, s2t); };
    s.onclick = function () { out.value = convert(input.value, t2s); };
    cp.onclick = function () { copyText(out.value); };
    body.appendChild(input); body.appendChild(t); body.appendChild(s); body.appendChild(cp); body.appendChild(out);
  }

  function mount(opts) {
    opts = opts || {};
    if (state.mounted) return;
    ensureStyle();
    var fab = el('button', '', '🧰 工具箱');
    fab.id = 'tb-fab';
    if (opts.fab === false) fab.hidden = true;
    var overlay = el('div');
    overlay.id = 'tb';
    overlay.hidden = true;
    overlay.appendChild(basePanel());
    document.body.appendChild(fab);
    document.body.appendChild(overlay);

    var tabsHost = document.getElementById('tb-tabs');
    TABS.forEach(function (t) {
      var b = el('button', '', t);
      b.dataset.tab = t;
      b.onclick = function () { render(t); };
      tabsHost.appendChild(b);
    });

    document.getElementById('tb-close').onclick = function () { overlay.hidden = true; };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.hidden = true; };
    fab.onclick = function () { overlay.hidden = false; render(state.current); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') overlay.hidden = true; });
    state.mounted = true;
  }

  function open() {
    mount();
    var overlay = document.getElementById('tb');
    if (overlay) {
      overlay.hidden = false;
      render(state.current);
    }
  }

  global.DirectorToolbox = { mount: mount, open: open };
})(window);
