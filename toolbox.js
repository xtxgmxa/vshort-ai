/**
 * 導演工具箱：純前端小工具，點按鈕呼叫，不連網、不送資料。
 * 掛載：引入 toolbox.js 後呼叫 DirectorToolbox.mount();
 */
(function (global) {
  'use strict';

  var GENRES = ['Roblox／RIVALS', '旅遊', '運動', '美食', '開箱', '校園'];
  var AUDIENCES = ['同學', '不玩遊戲的人', '家人', '全班', '網路上的陌生人'];
  var LIMITS = ['手槍', '一分鐘', '500元', '烤箱', '一次', '一節課', '三次', '最後一棒'];

  var HOOKS = {
    'Roblox／RIVALS': ['這場只能用{L}，失敗就結束！', '我挑戰用{L}打贏一整場，你覺得行嗎？', '剩下最後{L}，我能不能逆轉？'],
    '旅遊': ['只有{L}，在這裡能玩什麼？', '我找不到路，卻發現了{L}。', '這個地方，{L}才知道值不值得。'],
    '運動': ['最後{L}，我能不能追上？', '三次機會，我能命中{L}嗎？', '差一點就{L}，你看我怎麼救回來。'],
    '美食': ['不用{L}，真的做得出來嗎？', '我以為會{L}，結果⋯⋯', '第一次做{L}，你猜成功沒有？'],
    '開箱': ['這東西說能{L}，真的嗎？', '我買了{L}，先測給你看。', '{L}到底好不好用？實測一次。'],
    '校園': ['我們想一起完成{L}，你猜成不成？', '本來以為很簡單，{L}才知道難。', '這件事，{L}之後才看懂。']
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function label(t, c) { var l = el('label', 't-lbl', t); l.appendChild(c); return l; }
  function download(name, text) {
    var u = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
    var a = el('a'); a.href = u; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
  }
  function copy(text, btn) {
    var done = function () { if (btn) { var t = btn.textContent; btn.textContent = '已複製 ✓'; setTimeout(function () { btn.textContent = t; }, 1500); } };
    var fb = function () { var ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fb); else fb();
  }

  function ensureStyles() {
    if (document.getElementById('toolbox-css')) return;
    var css = el('style'); css.id = 'toolbox-css';
    css.textContent = [
      '#tb-fab{position:fixed;right:18px;bottom:18px;z-index:9000;background:#72efb4;color:#101724;border:0;border-radius:30px;padding:12px 20px;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 8px 24px #0008}',
      '#tb-fab:hover{filter:brightness(1.08);transform:translateY(-2px)}',
      '#tb-overlay{position:fixed;inset:0;z-index:9500;background:#070d19e6;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}',
      '#tb-overlay[hidden]{display:none!important}',
      '#tb-box{width:min(860px,96vw);max-height:90dvh;display:flex;flex-direction:column;background:#1a2538;border:1px solid #34435b;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px #000a;color:#f2f5fc;font-family:"Microsoft JhengHei",sans-serif}',
      '#tb-top{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid #34435b}',
      '#tb-top h2{margin:0;font-size:20px;color:#72efb4}',
      '#tb-tabs{display:flex;gap:6px;padding:12px 16px;flex-wrap:wrap;border-bottom:1px solid #34435b}',
      '#tb-tabs button{background:transparent;border:1px solid #34435b;color:#aab7ca;border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit;font-size:14px}',
      '#tb-tabs button.on{background:#72efb4;color:#101724;border-color:#72efb4;font-weight:700}',
      '#tb-body{flex:1;min-height:0;overflow:auto;padding:22px}',
      '#tb-body .t-intro{margin:0 0 14px;color:#aab7ca;font-size:15px;line-height:1.55}',
      '#tb-body .t-row{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}',
      '#tb-body .t-lbl{display:block;font-size:14px;color:#aab7ca;margin-bottom:6px}',
      '#tb-body input,#tb-body select,#tb-body textarea{display:block;width:100%;box-sizing:border-box;background:#101724;border:1px solid #34435b;color:#f2f5fc;border-radius:8px;padding:10px;font:inherit;margin:6px 0 10px}',
      '#tb-body textarea{min-height:70px;resize:vertical}',
      '#tb-body button{font:inherit;background:#72efb4;border:1px solid #72efb4;color:#101724;border-radius:8px;padding:10px 16px;cursor:pointer;font-weight:700}',
      '#tb-body .t-mini{background:transparent;border:1px solid #34435b;color:#f2f5fc;font-weight:400;padding:6px 10px}',
      '#tb-body .t-list{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0}',
      '#tb-body .t-item{background:#101724;border:1px solid #34435b;border-radius:10px;padding:14px}',
      '#tb-body .t-item small{color:#72efb4;font-size:13px}',
      '#tb-body .t-line{margin:6px 0 10px;line-height:1.5}',
      '#tb-body .t-result{margin:10px 0}',
      '#tb-body .t-muted{color:#aab7ca;font-size:14px}',
      '#tb-body .t-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}',
      '#tb-body .t-cell{background:#101724;border:1px solid #34435b;border-radius:10px;padding:14px}',
      '#tb-body .t-cell h4{margin:0 0 8px;color:#b8a2ff}',
      '#tb-body .t-total{color:#72efb4;align-self:center}',
      '#tb-body .t-pace-strip{margin:10px 0}',
      '#tb-body .t-pace-bar{display:flex;gap:6px;min-height:60px;padding:8px;border:1px dashed #34435b;border-radius:8px}',
      '#tb-body .t-pace-frame{flex:1;min-width:46px;display:flex;align-items:center;justify-content:center;border-radius:6px;font-weight:700;cursor:pointer}',
      '#tb-body .pace-快{background:#204137;color:#72efb4;border-bottom:4px solid #72efb4}',
      '#tb-body .pace-慢{background:#2b2445;color:#b8a2ff;border-bottom:4px solid #b8a2ff}',
      '#tb-body .pace-停{background:#1a2538;color:#aab7ca;border-bottom:4px solid #34435b}',
      '#tb-body .t-check{display:flex;gap:10px;align-items:center;padding:8px 10px;border:1px solid #34435b;border-radius:8px;margin:6px 0;cursor:pointer}',
      '#tb-body .t-check input{width:auto;margin:0}',
      '#tb-body .t-prompt-out{min-height:120px;background:#101724}',
      '@media(max-width:680px){#tb-body .t-list,#tb-body .t-grid3{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(css);
  }

  global.DirectorToolbox = { _tools: {} };
  function reg(name, fn) { global.DirectorToolbox._tools[name] = fn; }

  /* Hook 產生器 */
  reg('Hook 產生器', function () {
    var box = el('div');
    box.appendChild(el('p', 't-intro', '選題材和觀眾，給你 3 個開頭句，挑一個改成自己的。'));
    var row = el('div', 't-row');
    var g = el('select'); GENRES.forEach(function (x) { g.appendChild(el('option', null, x)); });
    var a = el('select'); AUDIENCES.forEach(function (x) { a.appendChild(el('option', null, x)); });
    row.appendChild(label('題材', g)); row.appendChild(label('觀眾', a));
    box.appendChild(row);
    var out = el('div', 't-list'); box.appendChild(out);
    var btn = el('button', null, '給我 3 個 Hook'); box.appendChild(btn);
    function gen() {
      var limit = pick(LIMITS), tpls = HOOKS[g.value] || HOOKS['Roblox／RIVALS'];
      out.innerHTML = '';
      tpls.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3).forEach(function (tpl, i) {
        var line = tpl.replace(/\{L\}/g, limit);
        var item = el('div', 't-item');
        item.appendChild(el('small', null, 'Hook ' + (i + 1)));
        item.appendChild(el('div', 't-line', line));
        var u = el('button', 't-mini', '用這句'); u.onclick = function () { copy(line, u); };
        item.appendChild(u); out.appendChild(item);
      });
    }
    btn.onclick = gen; gen();
    return box;
  });

  /* 三格腳本模板 */
  reg('三格腳本', function () {
    var box = el('div');
    box.appendChild(el('p', 't-intro', '填開始／過程／結果，下載成 .txt，上課直接用。'));
    var grid = el('div', 't-grid3'); var fields = [];
    [['開始', 3], ['過程', 20], ['結果', 7]].forEach(function (p) {
      var cell = el('div', 't-cell'); cell.appendChild(el('h4', null, p[0]));
      var shot = el('textarea'); shot.placeholder = '畫面：觀眾看到什麼？';
      var line = el('input'); line.placeholder = '台詞／字幕';
      var sec = el('input'); sec.type = 'number'; sec.min = 0; sec.max = 30; sec.value = p[1];
      cell.appendChild(label('畫面', shot)); cell.appendChild(label('台詞', line)); cell.appendChild(label('秒數', sec));
      grid.appendChild(cell); fields.push({ t: p[0], shot: shot, line: line, sec: sec });
    });
    box.appendChild(grid);
    var act = el('div', 't-row'); var total = el('b', 't-total', '合計 30 秒'); var dl = el('button', null, '下載我的腳本');
    act.appendChild(total); act.appendChild(dl); box.appendChild(act);
    function sum() { var s = fields.reduce(function (a, f) { return a + (Number(f.sec.value) || 0); }, 0); total.textContent = '合計 ' + s + ' 秒'; return s; }
    fields.forEach(function (f) { f.sec.oninput = sum; });
    dl.onclick = function () {
      var text = '30 秒導演腳本\n\n' + fields.map(function (f) {
        return f.t + '（' + (Number(f.sec.value) || 0) + ' 秒）\n畫面：' + f.shot.value + '\n台詞：' + f.line.value;
      }).join('\n\n') + '\n\n合計：' + sum() + ' 秒';
      download('我的30秒腳本.txt', text);
    };
    sum(); return box;
  });

  /* 字幕建議器 */
  reg('字幕建議器', function () {
    var box = el('div');
    box.appendChild(el('p', 't-intro', '貼一句話，建議放哪裡、用什麼樣式。'));
    var input = el('textarea'); input.placeholder = '例如：這場只能用手槍，失敗就結束！';
    box.appendChild(input);
    var out = el('div', 't-result'); box.appendChild(out);
    var btn = el('button', null, '給字幕建議'); box.appendChild(btn);
    btn.onclick = function () {
      var s = (input.value || '').trim(); if (!s) { out.innerHTML = '<p class="t-muted">先寫一句話再給建議。</p>'; return; }
      var len = s.length, place, style, why;
      if (len <= 8) { place = '畫面正中間，大字'; style = '強調色（薄荷綠）'; why = '字少又重要，放中間最搶眼。'; }
      else if (len <= 20) { place = '畫面下方一排'; style = '白字＋深底'; why = '句子中等，放下排不擋主畫面。'; }
      else { place = '分兩行放下方'; style = '白字，重點字放大'; why = '字多要斷行，別一次塞滿。'; }
      out.innerHTML = '<div class="t-item"><small>位置</small><div class="t-line">' + place + '</div><small>樣式</small><div class="t-line">' + style + '</div><small>為什麼</small><div class="t-line">' + why + '</div></div>';
    };
    return box;
  });

  /* 節奏標記器 */
  reg('節奏標記器', function () {
    var box = el('div');
    box.appendChild(el('p', 't-intro', '點「快／慢／停」排節奏，算出建議秒數；點框可刪除。'));
    var bar = el('div', 't-pace-bar'); var out = el('div', 't-result'); var marks = [];
    var btns = el('div', 't-row');
    ['快', '慢', '停'].forEach(function (k) {
      var b = el('button', null, '＋' + k); b.onclick = function () { marks.push(k); render(); }; btns.appendChild(b);
    });
    var clear = el('button', 't-mini', '清空'); clear.onclick = function () { marks = []; render(); }; btns.appendChild(clear);
    box.appendChild(bar); box.appendChild(btns); box.appendChild(out);
    function render() {
      bar.innerHTML = '';
      marks.forEach(function (k, i) {
        var f = el('div', 't-pace-frame pace-' + k, k);
        f.onclick = function () { marks.splice(i, 1); render(); }; bar.appendChild(f);
      });
      if (!marks.length) { out.innerHTML = '<p class="t-muted">點上面的按鈕排節奏。</p>'; return; }
      var sec = { '快': 2, '慢': 5, '停': 3 };
      var total = marks.reduce(function (a, k) { return a + sec[k]; }, 0);
      out.innerHTML = '<div class="t-line">建議總長約 <b>' + total + ' 秒</b>（快2／慢5／停3）。內容為主，秒數只是參考。</div>';
    }
    render(); return box;
  });

  /* AI 指令產生器 */
  reg('AI 指令產生器', function () {
    var box = el('div');
    box.appendChild(el('p', 't-intro', '填幾個欄位，組成一段固定格式指令，複製貼給 AI。AI 給建議，你決定真假與合不合適。'));
    var task = el('select');
    [['拆解', '拆解這支短影音的 Hook、故事、節奏、字幕、音樂'], ['字幕', '幫這段影片想字幕，每句不超過8字'], ['腳本', '幫我寫30秒三格腳本']].forEach(function (x) {
      var o = el('option'); o.value = x[0]; o.textContent = x[1]; task.appendChild(o);
    });
    var topic = el('input'); topic.placeholder = '題材（例：RIVALS 只用手槍）';
    var audience = el('input'); audience.placeholder = '觀眾（例：不玩遊戲的同學）';
    var note = el('textarea'); note.placeholder = '其他補充（可空白）';
    box.appendChild(label('要做什麼', task)); box.appendChild(label('題材', topic)); box.appendChild(label('觀眾', audience)); box.appendChild(label('補充', note));
    var out = el('textarea', 't-prompt-out'); out.readOnly = true; box.appendChild(out);
    var act = el('div', 't-row'); var gen = el('button', null, '產生指令'); var cp = el('button', null, '複製指令');
    act.appendChild(gen); act.appendChild(cp); box.appendChild(act);
    function build() {
      var v = task.value;
      var head = v === '拆解' ? '拆解這支短影音' : (v === '字幕' ? '幫這段影片想字幕' : '幫我寫30秒三格腳本');
      var p = '你是短影音創作助手。請用國小中高年級看得懂的話，' + head + '。\n題材：' + (topic.value || '（請填）') + '\n觀眾：' + (audience.value || '（請填）');
      if (note.value.trim()) p += '\n補充：' + note.value.trim();
      p += '\n\n規則：\n1. 給 3 個建議就好，不要長篇大論。\n2. 每個建議要說「為什麼」。\n3. 不要編造沒發生過的內容。\n4. 我會自己判斷要不要用，你只是助手。';
      out.value = p;
    }
    gen.onclick = build; build();
    cp.onclick = function () { if (out.value) copy(out.value, cp); };
    return box;
  });

  /* 拆片檢核表 */
  reg('拆片檢核表', function () {
    var box = el('div');
    box.appendChild(el('p', 't-intro', '邊看片邊打勾，最後產出觀察筆記。'));
    var items = [
      ['Hook', '開頭3秒讓人想留下'], ['Hook', '開頭有任務或限制'],
      ['故事', '有目標→事件→衝突→高潮→結果'],
      ['節奏', '快慢有變化，不是一直快'], ['節奏', '該停的地方有停'],
      ['字幕', '字幕不擋主畫面'], ['字幕', '重點字有強調'],
      ['音樂', '音樂服務情緒，不是吵'], ['音樂', '該安靜的地方有安靜']
    ];
    var checks = [];
    items.forEach(function (it) {
      var row = el('label', 't-check'); var c = el('input'); c.type = 'checkbox';
      row.appendChild(c); row.appendChild(el('span', null, '<b>' + it[0] + '</b> ' + it[1]));
      box.appendChild(row); checks.push({ cat: it[0], box: c });
    });
    var out = el('div', 't-result'); box.appendChild(out);
    var btn = el('button', null, '產出觀察筆記'); box.appendChild(btn);
    btn.onclick = function () {
      var byCat = {};
      checks.forEach(function (c) { byCat[c.cat] = byCat[c.cat] || { ok: 0, all: 0 }; byCat[c.cat].all++; if (c.box.checked) byCat[c.cat].ok++; });
      var text = '拆片觀察筆記\n\n';
      Object.keys(byCat).forEach(function (k) {
        var v = byCat[k];
        text += k + '：' + v.ok + '/' + v.all + (v.ok === v.all ? ' ✓' : (v.ok === 0 ? ' ✗（這支沒做到）' : '（部分）')) + '\n';
      });
      text += '\n最值得學的一點：\n最想改的一點：';
      out.innerHTML = '<div class="t-line" style="white-space:pre-line">' + text + '</div>';
      var dl = el('button', 't-mini', '下載筆記'); dl.onclick = function () { download('拆片筆記.txt', text); }; out.appendChild(dl);
    };
    return box;
  });

  /* 簡繁轉換 */
  var S2T = { '简':'簡','体':'體','国':'國','产':'產','东':'東','车':'車','马':'馬','长':'長','门':'門','问':'問','时':'時','说':'說','请':'請','谢':'謝','对':'對','错':'錯','关':'關','开':'開','个':'個','们':'們','这':'這','里':'裡','来':'來','过':'過','进':'進','远':'遠','运':'運','还':'還','应':'應','为':'為','会':'會','学':'學','觉':'覺','观':'觀','见':'見','记':'記','论':'論','让':'讓','话':'話','语':'語','读':'讀','写':'寫','买':'買','卖':'賣','钱':'錢','电':'電','网':'網','视':'視','频':'頻','软':'軟','录':'錄','编':'編','动':'動','画':'畫','图':'圖','点':'點','击':'擊','键':'鍵','盘':'盤','类':'類','样':'樣','么':'麼','术':'術','导':'導','创':'創' };
  var T2S = {}; Object.keys(S2T).forEach(function (k) { T2S[S2T[k]] = k; });
  function convert(text, map) { return text.replace(/./g, function (c) { return map[c] || c; }); }
  reg('簡繁轉換', function () {
    var box = el('div');
    box.appendChild(el('p', 't-intro', '貼上文字，轉成繁體或簡體。剪映常是簡體，這裡幫你切換。'));
    var input = el('textarea'); input.placeholder = '貼上要轉換的文字'; box.appendChild(input);
    var out = el('textarea', 't-prompt-out'); out.readOnly = true; box.appendChild(out);
    var act = el('div', 't-row');
    var t = el('button', null, '轉成繁體'); var s = el('button', null, '轉成簡體'); var cp = el('button', null, '複製結果');
    act.appendChild(t); act.appendChild(s); act.appendChild(cp); box.appendChild(act);
    t.onclick = function () { out.value = convert(input.value, S2T); };
    s.onclick = function () { out.value = convert(input.value, T2S); };
    cp.onclick = function () { if (out.value) copy(out.value, cp); };
    return box;
  });

  /* 掛載 */
  var TABS = ['Hook 產生器', '三格腳本', '字幕建議器', '節奏標記器', 'AI 指令產生器', '拆片檢核表', '簡繁轉換'];
  function select(name) {
    current = name;
    var tabs = document.getElementById('tb-tabs');
    [].forEach.call(tabs.children, function (b, i) { b.classList.toggle('on', TABS[i] === name); });
    var body = document.getElementById('tb-body');
    body.innerHTML = '';
    body.appendChild(global.DirectorToolbox._tools[name]());
  }
  function open() {
    var ov = document.getElementById('tb-overlay');
    if (!document.getElementById('tb-tabs').children.length) {
      var tabs = document.getElementById('tb-tabs');
      TABS.forEach(function (name) { var b = el('button', null, name); b.onclick = function () { select(name); }; tabs.appendChild(b); });
    }
    ov.hidden = false;
    if (!current) select(TABS[0]); else select(current);
  }
  global.DirectorToolbox.mount = mount;
  global.DirectorToolbox.open = open;
})(window);
