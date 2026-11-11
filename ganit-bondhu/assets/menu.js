/* গণিত বন্ধু — থ্রি-ডটস ফ্লোটিং মেনু (Mode: Dark | Light)
   সব পেজে একই ফাইল। পেজে শুধু #menu-root ও #menu-btn থাকলেই চলবে। */
(function () {
  'use strict';

  var KEY = 'ganitBondhuTheme';
  var root = document.documentElement;

  function applyMode(mode) {
    root.classList.toggle('dark', mode === 'dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#0e1726' : '#ffffff');
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }

  function init() {
    var holder = document.getElementById('menu-root');
    var btn = document.getElementById('menu-btn');
    if (!holder || !btn) return;

    var panel = document.createElement('div');
    panel.className = 'gb-menu';
    panel.id = 'gb-menu';
    panel.setAttribute('role', 'menu');
    panel.hidden = true;
    panel.innerHTML =
      '<button type="button" class="gb-item" id="gb-mode-row" role="menuitem" aria-expanded="false" aria-controls="gb-mode-box">' +
        '<i class="gb-ico fa-solid" aria-hidden="true"></i>' +
        '<span>Mode</span>' +
        '<i class="gb-chev fa-solid fa-chevron-down" aria-hidden="true"></i>' +
      '</button>' +
      '<div class="gb-mode" id="gb-mode-box" hidden>' +
        '<div class="gb-switch" role="group" aria-label="Mode">' +
          '<span class="gb-thumb" aria-hidden="true"></span>' +
          '<button type="button" data-mode="dark"><i class="fa-solid fa-moon" aria-hidden="true"></i><span>Dark</span></button>' +
          '<button type="button" data-mode="light"><i class="fa-solid fa-sun" aria-hidden="true"></i><span>Light</span></button>' +
        '</div>' +
      '</div>';
    holder.appendChild(panel);

    var row = panel.querySelector('#gb-mode-row');
    var box = panel.querySelector('#gb-mode-box');
    var ico = panel.querySelector('.gb-ico');
    var sw = panel.querySelector('.gb-switch');
    var darkBtn = sw.querySelector('[data-mode="dark"]');
    var lightBtn = sw.querySelector('[data-mode="light"]');

    function paint() {
      var dark = root.classList.contains('dark');
      sw.setAttribute('data-active', dark ? 'dark' : 'light');
      darkBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      lightBtn.setAttribute('aria-pressed', dark ? 'false' : 'true');
      ico.className = 'gb-ico fa-solid ' + (dark ? 'fa-moon' : 'fa-sun');
    }

    function openMenu() {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      box.hidden = true;
      row.setAttribute('aria-expanded', 'false');
    }

    // পেজ চাইলে Mode-এর ওপরে নিজের আইটেম যোগ করতে পারে: window.GB_MENU_ITEMS = [{icon, label, onClick}]
    (window.GB_MENU_ITEMS || []).forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gb-item';
      b.setAttribute('role', 'menuitem');
      b.innerHTML = '<i class="gb-ico fa-solid ' + it.icon + '" aria-hidden="true"></i><span></span>';
      b.querySelector('span').textContent = it.label;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        closeMenu();
        it.onClick();
      });
      panel.insertBefore(b, row);
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.hidden) openMenu(); else closeMenu();
    });

    row.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = box.hidden;
      box.hidden = !open;
      row.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    sw.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('[data-mode]');
      if (!b) return;
      applyMode(b.getAttribute('data-mode'));
      paint();
    });

    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { closeMenu(); btn.focus(); }
    });

    paint();
  }

  init();
})();
