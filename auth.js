/**
 * 課程閘門：點課程需驗證；登入後同瀏覽器分頁共用，閒置超過 1 小時需重登。
 * 密碼不以明文出現；比對的是混淆後的摘要片段。
 */
(function (global) {
  'use strict';

  var KEY = 'vshort_gate_v1';
  var IDLE_MS = 60 * 60 * 1000;
  var SALT = 'creator-lab-gate';

  /* 摘要片段經 XOR 打散，原始碼中看不到完整明文密碼 */
  var _k = [0x5a, 0x3c, 0x91, 0x2e, 0xf4, 0x17, 0x88, 0x6b];
  var _p = [
    0xeb, 0x5e, 0x47, 0xb0, 0x8c, 0x40, 0xd0, 0x2c, 0x24, 0x00, 0x50, 0x1e,
    0x6b, 0x05, 0x05, 0x67, 0xe3, 0x14, 0x70, 0xa5, 0x72, 0xa4, 0xa8, 0xf1,
    0x2b, 0x16, 0xf5, 0xb9, 0x17, 0x36, 0x6f, 0xeb
  ];

  function _bytes() {
    var out = new Uint8Array(_p.length);
    for (var i = 0; i < _p.length; i++) out[i] = _p[i] ^ _k[i % _k.length];
    return out;
  }

  function _hex(buf) {
    var a = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
    var s = '';
    for (var i = 0; i < a.length; i++) s += (a[i] < 16 ? '0' : '') + a[i].toString(16);
    return s;
  }

  function _eq(a, b) {
    if (a.length !== b.length) return false;
    var d = 0;
    for (var i = 0; i < a.length; i++) d |= a[i] ^ b[i];
    return d === 0;
  }

  function _digest(text) {
    var enc = new TextEncoder();
    return crypto.subtle.digest('SHA-256', enc.encode(SALT + '|' + text)).then(function (buf) {
      return new Uint8Array(buf);
    });
  }

  function _now() {
    return Date.now();
  }

  function _read() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data.t !== 'number' || data.ok !== 1) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function _write(ts) {
    sessionStorage.setItem(KEY, JSON.stringify({ ok: 1, t: ts }));
  }

  function _clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch (e) {}
  }

  function isAuthed() {
    var data = _read();
    if (!data) return false;
    if (_now() - data.t > IDLE_MS) {
      _clear();
      return false;
    }
    return true;
  }

  function touch() {
    if (!isAuthed()) return;
    _write(_now());
  }

  function logout() {
    _clear();
  }

  function verify(input) {
    return _digest(String(input || '')).then(function (got) {
      return _eq(got, _bytes());
    });
  }

  function ensureStyles() {
    if (document.getElementById('gate-styles')) return;
    var css = document.createElement('style');
    css.id = 'gate-styles';
    css.textContent =
      '#gate-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;' +
      'background:#070d19e6;backdrop-filter:blur(8px);padding:24px}' +
      '#gate-overlay[hidden]{display:none!important}' +
      '#gate-box{width:min(420px,92vw);background:#1a2538;border:1px solid #34435b;border-radius:14px;' +
      'padding:28px 26px;box-shadow:0 24px 80px #000a;color:#f2f5fc;font-family:"Microsoft JhengHei",sans-serif}' +
      '#gate-box h2{margin:0 0 8px;font-size:24px;color:#72efb4}' +
      '#gate-box p{margin:0 0 18px;color:#aab7ca;font-size:16px;line-height:1.55}' +
      '#gate-box label{display:block;font-size:14px;color:#aab7ca;margin-bottom:6px}' +
      '#gate-input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid #34435b;' +
      'background:#101724;color:#f2f5fc;font-size:18px;margin-bottom:10px}' +
      '#gate-input:focus{outline:2px solid #72efb4;outline-offset:2px}' +
      '#gate-err{min-height:1.4em;color:#ffbe72;font-size:14px;margin:0 0 14px}' +
      '#gate-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '#gate-actions button{font:inherit;border-radius:8px;padding:10px 18px;cursor:pointer;font-weight:700}' +
      '#gate-ok{background:#72efb4;border:1px solid #72efb4;color:#101724}' +
      '#gate-cancel{background:transparent;border:1px solid #34435b;color:#f2f5fc}' +
      'body.gate-locked>*:not(#gate-overlay){visibility:hidden!important}' +
      'body.gate-locked{overflow:hidden}';
    document.head.appendChild(css);
  }

  function ensureDialog() {
    ensureStyles();
    var el = document.getElementById('gate-overlay');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'gate-overlay';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'gate-title');
    el.innerHTML =
      '<div id="gate-box">' +
      '<h2 id="gate-title">進入課程</h2>' +
      '<p>請輸入課程密碼後才能觀看內容。登入後約一小時內可直接進入其他課程。</p>' +
      '<label for="gate-input">課程密碼</label>' +
      '<input id="gate-input" type="password" autocomplete="current-password" enterkeyhint="go">' +
      '<p id="gate-err" aria-live="polite"></p>' +
      '<div id="gate-actions">' +
      '<button type="button" id="gate-ok">確認進入</button>' +
      '<button type="button" id="gate-cancel">取消</button>' +
      '</div></div>';
    document.body.appendChild(el);
    return el;
  }

  var pending = null;

  function hideDialog(cancel) {
    var el = document.getElementById('gate-overlay');
    if (el) el.hidden = true;
    document.body.classList.remove('gate-locked');
    var cb = pending;
    pending = null;
    if (cancel && cb && typeof cb.reject === 'function') cb.reject(new Error('cancelled'));
  }

  function showDialog() {
    return new Promise(function (resolve, reject) {
      var el = ensureDialog();
      var input = document.getElementById('gate-input');
      var err = document.getElementById('gate-err');
      var ok = document.getElementById('gate-ok');
      var cancel = document.getElementById('gate-cancel');
      err.textContent = '';
      input.value = '';
      pending = { resolve: resolve, reject: reject };
      el.hidden = false;
      if (document.body.dataset.gatePage === '1') document.body.classList.add('gate-locked');
      setTimeout(function () {
        input.focus();
      }, 30);

      function submit() {
        var value = input.value;
        ok.disabled = true;
        err.textContent = '驗證中…';
        verify(value).then(function (pass) {
          ok.disabled = false;
          if (!pass) {
            err.textContent = '密碼不正確，請再試一次。';
            input.select();
            return;
          }
          _write(_now());
          hideDialog(false);
          resolve(true);
        }).catch(function () {
          ok.disabled = false;
          err.textContent = '此瀏覽器無法完成驗證，請改用較新的瀏覽器。';
        });
      }

      ok.onclick = submit;
      cancel.onclick = function () {
        hideDialog(true);
      };
      input.onkeydown = function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          hideDialog(true);
        }
      };
      el.onclick = function (e) {
        if (e.target === el && document.body.dataset.gatePage !== '1') hideDialog(true);
      };
    });
  }

  function requireAuth() {
    touch();
    if (isAuthed()) {
      touch();
      return Promise.resolve(true);
    }
    return showDialog();
  }

  function bindIdleKeepAlive() {
    var events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    var last = 0;
    function onAct() {
      var t = _now();
      if (t - last < 15000) return;
      last = t;
      touch();
    }
    events.forEach(function (name) {
      document.addEventListener(name, onAct, { passive: true });
    });
    setInterval(function () {
      if (!isAuthed() && document.body.dataset.gatePage === '1') {
        logout();
        document.body.classList.add('gate-locked');
        requireAuth().catch(function () {
          location.href = './index.html';
        });
      }
    }, 60000);
  }

  /** 目錄：攔截所有課程卡片點擊 */
  function guardCatalog(selector) {
    var host = document.querySelector(selector || '#courses');
    if (!host) return;
    host.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.card');
      if (!a) return;
      e.preventDefault();
      var href = a.getAttribute('href');
      requireAuth()
        .then(function () {
          location.href = href;
        })
        .catch(function () {});
    });
  }

  /** 課程頁：未登入先鎖住內容 */
  function guardLesson() {
    function unlockView() {
      document.documentElement.classList.add('gate-ready');
      document.body.classList.remove('gate-locked');
      var boot = document.getElementById('gate-boot');
      if (boot) boot.remove();
    }
    function run() {
      document.body.dataset.gatePage = '1';
      ensureStyles();
      if (isAuthed()) {
        touch();
        unlockView();
        bindIdleKeepAlive();
        return;
      }
      document.body.classList.add('gate-locked');
      requireAuth()
        .then(function () {
          unlockView();
          bindIdleKeepAlive();
        })
        .catch(function () {
          location.href = './index.html';
        });
    }
    if (document.body) run();
    else document.addEventListener('DOMContentLoaded', run);
  }

  global.CourseGate = {
    isAuthed: isAuthed,
    requireAuth: requireAuth,
    touch: touch,
    logout: logout,
    guardCatalog: guardCatalog,
    guardLesson: guardLesson
  };
})(window);
