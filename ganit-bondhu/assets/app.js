/* গণিত বন্ধু — সব পেজের সাধারণ কাজ: ক্লাস সংরক্ষণ, Dark/Light, টোস্ট, ক্লাস-বাছাই পপআপ
   ব্যবহার: <script src="assets/app.js"></script>  →  window.GB */
(function () {
  'use strict';

  var KEY_CLASS = 'ganitBondhuClass';
  var OLD_KEY = 'ganitBondhuSelectedClass';   // পুরোনো পেজগুলোর জন্য একই মান রাখা হয়
  var KEY_THEME = 'ganitBondhuTheme';
  var CLASSES = [8, 9, 10, 11, 12];
  var BN = '০১২৩৪৫৬৭৮৯';

  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN.charAt(d); }); }
  function label(n) { return bn(n) + (n >= 11 ? 'শ' : 'ম') + ' শ্রেণী'; }

  /* ---------- ক্লাস ---------- */
  function getClass() {
    try {
      var n = parseInt(localStorage.getItem(KEY_CLASS) || localStorage.getItem(OLD_KEY), 10);
      return CLASSES.indexOf(n) !== -1 ? n : null;
    } catch (e) { return null; }
  }
  function setClass(n) {
    try {
      localStorage.setItem(KEY_CLASS, String(n));
      localStorage.setItem(OLD_KEY, String(n));
      return true;
    } catch (e) { return false; }
  }

  /* ---------- Dark / Light ---------- */
  function getTheme() {
    try { return localStorage.getItem(KEY_THEME) === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; }
  }
  function applyTheme(mode, save) {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#0e1726' : '#ffffff');
    if (save) { try { localStorage.setItem(KEY_THEME, mode); } catch (e) {} }
  }

  function clearAll() {
    try {
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf('ganitBondhu') === 0) localStorage.removeItem(k); });
      sessionStorage.removeItem('gbSkipClass');
    } catch (e) {}
    applyTheme('light', false);
  }

  /* ---------- টোস্ট ---------- */
  var toastEl, toastT;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      toastEl.className = 'fixed left-1/2 z-[100] max-w-[86vw] -translate-x-1/2 rounded-full bg-[#123d7d] px-5 py-3 text-center text-[15px] text-white shadow-lg';
      toastEl.style.cssText = 'bottom:max(28px,env(safe-area-inset-bottom));opacity:0;transition:opacity .2s;pointer-events:none';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.style.opacity = '0'; }, 2300);
  }

  /* ---------- ক্লাস ড্রপডাউন ---------- */
  function classPicker(container, initial, onChange) {
    var value = initial || null;
    container.innerHTML =
      '<button type="button" class="gb-dd-btn flex w-full items-center justify-between rounded-[16px] border-2 border-[#d7e8ff] bg-[#f4f9ff] px-4 py-3 text-left text-[18px] text-[#123d7d]" aria-haspopup="listbox" aria-expanded="false">' +
        '<span class="gb-dd-val"></span><i class="gb-dd-chev fa-solid fa-chevron-down text-[14px] text-[#2877d7]" style="transition:transform .2s"></i></button>' +
      '<ul class="gb-dd-list mt-2 hidden overflow-hidden rounded-[16px] border-2 border-[#d7e8ff] bg-white" role="listbox"></ul>';

    var btn = container.querySelector('.gb-dd-btn');
    var val = container.querySelector('.gb-dd-val');
    var chev = container.querySelector('.gb-dd-chev');
    var list = container.querySelector('.gb-dd-list');

    list.innerHTML = CLASSES.map(function (c) {
      return '<li role="option" tabindex="0" data-v="' + c + '" class="flex cursor-pointer items-center justify-between border-b border-[#eaf1fb] px-4 py-3 text-[18px] text-[#123d7d]">' +
        '<span>' + label(c) + '</span><i class="fa-solid fa-check hidden text-[#2fb36d]"></i></li>';
    }).join('');

    function paint() {
      val.textContent = value ? label(value) : 'ক্লাস বেছে নিন';
      Array.prototype.forEach.call(list.children, function (li) {
        var on = String(li.getAttribute('data-v')) === String(value);
        li.setAttribute('aria-selected', on ? 'true' : 'false');
        li.style.fontWeight = on ? '700' : '400';
        li.lastChild.classList.toggle('hidden', !on);
      });
    }
    function setOpen(open) {
      list.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      chev.style.transform = open ? 'rotate(180deg)' : 'none';
    }
    function choose(v) {
      value = v; paint(); setOpen(false);
      if (onChange) onChange(v);
    }

    btn.addEventListener('click', function () { setOpen(list.classList.contains('hidden')); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest ? e.target.closest('li[data-v]') : null;
      if (li) choose(parseInt(li.getAttribute('data-v'), 10));
    });
    list.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var li = e.target.closest ? e.target.closest('li[data-v]') : null;
      if (li) { e.preventDefault(); choose(parseInt(li.getAttribute('data-v'), 10)); }
    });

    paint();
    return {
      get: function () { return value; },
      set: function (v) { value = v; paint(); },
      close: function () { setOpen(false); }
    };
  }

  /* ---------- নিচ থেকে ওঠা পপআপ ---------- */
  function sheet(innerHtml) {
    var wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 z-[90] flex items-end justify-center sm:items-center';
    wrap.style.cssText = 'background:rgba(8,24,52,.5);opacity:0;transition:opacity .28s';
    wrap.innerHTML =
      '<div class="gb-sheet w-full max-w-[520px] rounded-t-[28px] bg-white px-6 pt-6 shadow-[0_-10px_40px_rgba(0,0,0,.2)] sm:rounded-[28px]" ' +
      'style="padding-bottom:max(24px,env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .3s ease">' + innerHtml + '</div>';
    document.body.appendChild(wrap);
    var box = wrap.firstElementChild;
    (window.requestAnimationFrame || setTimeout)(function () {
      wrap.style.opacity = '1';
      box.style.transform = 'none';
    });
    return {
      el: wrap, box: box,
      close: function (done) {
        wrap.style.opacity = '0';
        box.style.transform = 'translateY(100%)';
        setTimeout(function () { wrap.remove(); if (done) done(); }, 290);
      }
    };
  }

  function promptClass(opts) {
    opts = opts || {};
    if (document.getElementById('gb-class-sheet')) return;
    var s = sheet(
      '<div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#eaf3ff] text-[#2877d7]"><i class="fa-solid fa-graduation-cap text-[28px]"></i></div>' +
      '<h2 class="text-center text-[24px] font-bold text-[#123d7d]">আপনার ক্লাস নির্বাচন করুন</h2>' +
      '<p class="mt-2 text-center text-[16px] leading-snug text-[#637895]">ক্লাস বেছে নিলে সেই ক্লাসের অধ্যায় ও সমাধান সরাসরি খুলবে। পরে সেটিংস থেকে বদলানো যাবে।</p>' +
      '<div class="gb-pick mt-5"></div>' +
      '<button type="button" class="gb-apply mt-5 w-full rounded-[16px] bg-[#1565c9] py-3 text-[18px] font-semibold text-white">Apply</button>' +
      '<button type="button" class="gb-later mt-3 w-full py-2 text-[15px] text-[#637895]">পরে করব</button>'
    );
    s.el.id = 'gb-class-sheet';

    var chosen = null;
    var apply = s.box.querySelector('.gb-apply');
    function paintApply() { apply.disabled = !chosen; apply.style.opacity = chosen ? '1' : '.5'; }
    classPicker(s.box.querySelector('.gb-pick'), null, function (v) { chosen = v; paintApply(); });
    paintApply();

    apply.addEventListener('click', function () {
      if (!chosen) return;
      setClass(chosen);
      s.close(function () {
        toast(label(chosen) + ' সেভ হয়েছে');
        if (opts.onApply) opts.onApply(chosen);
      });
    });
    s.box.querySelector('.gb-later').addEventListener('click', function () {
      try { sessionStorage.setItem('gbSkipClass', '1'); } catch (e) {}
      s.close(function () { if (opts.onSkip) opts.onSkip(); });
    });
  }

  function confirmBox(message, okText, onOk) {
    var s = sheet(
      '<p class="text-center text-[18px] leading-snug text-[#123d7d]"></p>' +
      '<div class="mt-6 grid grid-cols-2 gap-3">' +
        '<button type="button" class="gb-no rounded-[16px] bg-[#eaf3ff] py-3 text-[17px] font-semibold text-[#123d7d]">বাতিল</button>' +
        '<button type="button" class="gb-yes rounded-[16px] bg-[#d6455d] py-3 text-[17px] font-semibold text-white"></button>' +
      '</div>'
    );
    s.box.querySelector('p').textContent = message;
    s.box.querySelector('.gb-yes').textContent = okText || 'ঠিক আছে';
    s.box.querySelector('.gb-no').addEventListener('click', function () { s.close(); });
    s.box.querySelector('.gb-yes').addEventListener('click', function () { s.close(function () { if (onOk) onOk(); }); });
  }

  /* ---------- "পাঠ্যবই সমাধান" ---------- */
  function openTextbook() {
    var c = getClass();
    if (!c) {
      promptClass({ onApply: function () { openTextbook(); } });
      return;
    }
    var target = c + '/chapter.html';
    if (typeof fetch !== 'function') { window.location.href = target; return; }
    fetch(target, { method: 'HEAD', cache: 'no-cache' })
      .then(function (res) {
        if (res.status === 404) toast(label(c) + 'র সমাধান শীঘ্রই আসছে।');
        else window.location.href = target;
      })
      .catch(function () { window.location.href = target; });   // যাচাই করা না গেলেও খুলে দেয়
  }

  window.GB = {
    CLASSES: CLASSES, bn: bn, label: label,
    getClass: getClass, setClass: setClass, clearAll: clearAll,
    getTheme: getTheme, applyTheme: applyTheme,
    toast: toast, classPicker: classPicker, promptClass: promptClass, confirmBox: confirmBox,
    openTextbook: openTextbook
  };
})();
