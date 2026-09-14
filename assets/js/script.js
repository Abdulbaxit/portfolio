'use strict';

/**
 * Abdul Basit — portfolio
 * Theme, mobile drawer, boot spinner. Motion is CSS.
 */

var year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();


/*-----------------------------------*\
  #BOOT
\*-----------------------------------*/

var boot = document.getElementById('boot');
var booted = false;

function dismissBoot() {
  if (booted) return;
  booted = true;
  document.body.classList.add('is-ready');
  if (boot) {
    boot.style.opacity = '0';
    boot.style.transition = 'opacity .4s ease';
    setTimeout(function () {
      if (boot.parentNode) boot.parentNode.removeChild(boot);
    }, 400);
  }
}

setTimeout(dismissBoot, 4000);

if (document.readyState === 'complete') setTimeout(dismissBoot, 400);
else window.addEventListener('load', function () { setTimeout(dismissBoot, 400); });


/*-----------------------------------*\
  #THEME
\*-----------------------------------*/

function syncThemeIcons() {
  var dark = document.documentElement.classList.contains('dark-mode');
  ['icon-sun', 'icon-sun-m'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.hidden = dark;
  });
  ['icon-moon', 'icon-moon-m'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.hidden = !dark;
  });
  document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(function (btn) {
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('aria-pressed', String(dark));
  });
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark-mode');
  var dark = document.documentElement.classList.contains('dark-mode');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  syncThemeIcons();
}

document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(function (btn) {
  btn.addEventListener('click', toggleTheme);
});

syncThemeIcons();


/*-----------------------------------*\
  #DRAWER
\*-----------------------------------*/

var burger = document.getElementById('burger');
var drawer = document.getElementById('drawer');
var backdrop = document.getElementById('drawer-backdrop');

function openDrawer() {
  if (!drawer) return;
  drawer.hidden = false;
  if (backdrop) backdrop.hidden = false;
  requestAnimationFrame(function () { drawer.classList.add('is-open'); });
  if (burger) burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove('is-open');
  if (burger) burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  setTimeout(function () {
    drawer.hidden = true;
    if (backdrop) backdrop.hidden = true;
  }, 200);
}

if (burger) burger.addEventListener('click', function () {
  if (drawer && !drawer.hidden && drawer.classList.contains('is-open')) closeDrawer();
  else openDrawer();
});

if (backdrop) backdrop.addEventListener('click', closeDrawer);

document.querySelectorAll('[data-close-drawer]').forEach(function (a) {
  a.addEventListener('click', closeDrawer);
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeDrawer();
});


/*-----------------------------------*\
  #SKILLS SCROLL SCENE
  Pin the section and assemble the desk layers, same beats as kenjimmy.xyz.
\*-----------------------------------*/

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function mix(from, to, t) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    scale: from.scale + (to.scale - from.scale) * t,
    opacity: from.opacity + (to.opacity - from.opacity) * t
  };
}

function paint(el, st) {
  el.style.transform = 'translate3d(' + st.x.toFixed(1) + 'px,' + st.y.toFixed(1) + 'px,0) scale(' + st.scale.toFixed(3) + ')';
  el.style.opacity = String(st.opacity);
}

function initSkillsScene() {
  var pin = document.querySelector('.skills-pin');
  var section = document.getElementById('skills');
  if (!pin || !section) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 1024px)');
  var queued = false;
  var steps = [];

  function collect() {
    var q = function (sel) { return Array.prototype.slice.call(section.querySelectorAll(sel)); };
    var vis = { scale: 1, opacity: 1, x: 0, y: 0 };
    steps = [
      { els: q('.illustration__img--1'), from: { scale: 0.5, opacity: 1, x: 0, y: 0 }, to: vis, a: 0, b: 0.12 },
      { els: q('.illustration__img--2'), from: { scale: 1, opacity: 0, x: 0, y: -50 }, to: vis, a: 0.05, b: 0.16 },
      { els: q('.illustration__img--3'), from: { scale: 1, opacity: 0, x: 0, y: -50 }, to: vis, a: 0.11, b: 0.22 },
      { els: q('.data-1'), from: { scale: 1, opacity: 0, x: 0, y: 0 }, to: vis, a: 0.16, b: 0.36 },
      { els: q('.illustration__img--5'), from: { scale: 1, opacity: 0, x: 100, y: 0 }, to: vis, a: 0.31, b: 0.42 },
      { els: q('.illustration__img--6'), from: { scale: 1, opacity: 0, x: -100, y: 0 }, to: vis, a: 0.38, b: 0.49 },
      { els: q('.data-2'), from: { scale: 1, opacity: 0, x: 0, y: 0 }, to: vis, a: 0.42, b: 0.62 },
      { els: q('.illustration__img--4'), from: { scale: 1, opacity: 0, x: -100, y: 0 }, to: vis, a: 0.58, b: 0.69 },
      { els: q('.illustration__img--7'), from: { scale: 1, opacity: 0, x: 100, y: 0 }, to: vis, a: 0.64, b: 0.76 },
      { els: q('.see-project-btn'), from: { scale: 1, opacity: 0, x: 0, y: 0 }, to: vis, a: 0.78, b: 1 }
    ];
  }

  function tick() {
    if (!document.documentElement.classList.contains('js-skills-pin')) return;
    var total = pin.offsetHeight - window.innerHeight;
    var p = total <= 0 ? 1 : clamp(-pin.getBoundingClientRect().top / total, 0, 1);
    steps.forEach(function (s) {
      var t = s.b === s.a ? 1 : clamp((p - s.a) / (s.b - s.a), 0, 1);
      s.els.forEach(function (el) { paint(el, mix(s.from, s.to, t)); });
    });
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      tick();
    });
  }

  function reset() {
    document.documentElement.classList.remove('js-skills-pin');
    section.querySelectorAll('.illustration__img, .data-1, .data-2, .see-project-btn').forEach(function (el) {
      el.style.transform = '';
      el.style.opacity = '';
    });
  }

  function sync() {
    if (reduced || !wide.matches) {
      reset();
      return;
    }
    collect();
    document.documentElement.classList.add('js-skills-pin');
    tick();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', sync, { passive: true });
  sync();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkillsScene);
} else {
  initSkillsScene();
}
