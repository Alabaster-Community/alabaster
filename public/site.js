// Alabaster site behavior. No dependencies.
(function () {
  'use strict';

  // ---- Theme switch (dark by default, remembered per browser) ----
  var root = document.documentElement;
  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('alabaster-theme', mode); } catch (e) { /* storage blocked */ }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
      b.setAttribute('aria-label', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      var t = b.querySelector('[data-theme-label]');
      if (t) t.textContent = mode === 'light' ? 'Light' : 'Dark';
    });
  }
  setTheme(root.getAttribute('data-theme') || 'dark');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-toggle]');
    if (b) setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  // ---- Keep "next Light Night" correct between rebuilds ----
  var evEl = document.getElementById('events-data');
  if (evEl) {
    try {
      var evs = JSON.parse(evEl.textContent).map(function (e) { return e.date; }).sort();
      var d = new Date();
      var today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var next = evs.filter(function (x) { return x >= today; })[0];
      if (next) {
        var p = next.split('-');
        document.querySelectorAll('[data-next-date]').forEach(function (el) { el.textContent = p[1] + '.' + p[2]; });
        document.querySelectorAll('[data-event-date]').forEach(function (li) {
          var on = li.getAttribute('data-event-date') === next;
          li.classList.toggle('is-next', on);
          var pill = li.querySelector('[data-next-pill]'); if (pill) pill.hidden = !on;
        });
      }
    } catch (e) { /* keep build-time values */ }
  }

  // ---- Hero video: pause for people who prefer reduced motion ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('video[data-autoplay]').forEach(function (v) {
    v.muted = true;
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  });

  // ---- Show/hide fields driven by checkboxes ----
  function syncReveal(cb) {
    var showWhenChecked = cb.getAttribute('data-reveal-when') !== 'unchecked';
    var on = showWhenChecked ? cb.checked : !cb.checked;
    (cb.getAttribute('data-reveal') || '').split(',').forEach(function (sel) {
      sel = sel.trim(); if (!sel) return;
      document.querySelectorAll(sel).forEach(function (el) { el.hidden = !on; });
    });
    (cb.getAttribute('data-conceal') || '').split(',').forEach(function (sel) {
      sel = sel.trim(); if (!sel) return;
      document.querySelectorAll(sel).forEach(function (el) { el.hidden = cb.checked; });
    });
  }
  document.querySelectorAll('input[data-reveal], input[data-conceal]').forEach(function (cb) {
    syncReveal(cb);
    cb.addEventListener('change', function () { syncReveal(cb); });
  });

  // ---- Tabs (tonight page) ----
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (j === null) return;
        e.preventDefault();
        var next = tabs[(j + tabs.length) % tabs.length];
        select(next); next.focus();
      });
    });
    var start = (location.hash || '').replace('#', '');
    var initial = tabs.filter(function (t) { return t.getAttribute('data-tab') === start; })[0] || tabs[0];
    select(initial);
  });

  // ---- Forms → /api/submit ----
  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.closest('[hidden]')) return; // ignore hidden sections
      if (el.type === 'checkbox') {
        if (el.hasAttribute('data-multi')) {
          data[el.name] = data[el.name] || [];
          if (el.checked) data[el.name].push(el.value);
        } else {
          data[el.name] = el.checked;
        }
      } else if (el.type !== 'submit' && el.type !== 'button') {
        data[el.name] = el.value.trim();
      }
    });
    return data;
  }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var errorBox = form.querySelector('.form-error');
    var done = form.getAttribute('data-done') ? document.querySelector(form.getAttribute('data-done')) : null;
    var button = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorBox) { errorBox.hidden = true; errorBox.textContent = ''; }
      if (!form.reportValidity()) return;
      var payload = collect(form);
      payload.type = form.getAttribute('data-form');
      payload.page = location.pathname;
      var label = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || !body.ok) throw new Error(body.error || 'Something went wrong.');
        });
      }).then(function () {
        form.hidden = true;
        if (done) { done.hidden = false; var h = done.querySelector('[tabindex="-1"]'); if (h) h.focus(); }
      }).catch(function (err) {
        if (errorBox) {
          errorBox.textContent = (err && err.message ? err.message : 'Something went wrong.') + ' Please try again, or tell someone on the crew.';
          errorBox.hidden = false;
        }
      }).finally(function () {
        if (button) { button.disabled = false; button.textContent = label; }
      });
    });
  });

  document.addEventListener('click', function (e) {
    var again = e.target.closest('[data-again]');
    if (!again) return;
    var form = document.querySelector(again.getAttribute('data-again'));
    var done = again.closest('.done');
    if (form) { form.reset(); form.hidden = false; form.querySelectorAll('input[data-reveal], input[data-conceal]').forEach(syncReveal); }
    if (done) done.hidden = true;
  });
})();
