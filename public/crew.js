// Crew follow-up dashboard. Talks to Supabase's REST and Auth APIs directly (no library).
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var statusEl = $('cd-status'), signin = $('cd-signin'), app = $('cd-app'), list = $('cd-list'), who = $('cd-who');
  var cfg = null, session = null, rows = [], filter = 'needs';
  var KEY = 'alabaster-crew-session';

  var TYPES = {
    prayer: ['Prayer', 'gold'], anonymous: ['Anonymous prayer', 'gold'], connect: ['Connect card', 'amber'],
    crew: ['Crew sign-up', 'violet'], coffee: ['Coffee (Grow)', 'teal'], notify: ['Text list', 'faint']
  };
  var LIST_LABELS = { 'light-night': 'Light Night texts', table: 'The Table launch', 'grow-cohort': 'Grow cohort', 'first-time': 'First time', grow: 'Wants to grow', serve: 'Wants to serve' };
  var FILTERS = [['needs', 'Needs follow-up'], ['overdue', 'Over 48 hours'], ['prayer', 'Prayer'], ['people', 'Connect · crew · coffee'], ['notify', 'Text list'], ['all', 'Everything']];

  function show(el, on) { el.hidden = !on; }
  function say(t) { statusEl.textContent = t; show(statusEl, !!t); }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch (e) {} }
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function clear() { session = null; try { sessionStorage.removeItem(KEY); } catch (e) {} }
  function email() { try { return JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).email; } catch (e) { return ''; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function needsFollowUp(r) {
    if (r.status !== 'new') return false;
    if (r.type === 'notify') return false;
    if (r.type === 'prayer') return !!(r.details && (r.details.followUp || r.details.prayInPerson));
    return true;
  }
  function isOverdue(r) { return needsFollowUp(r) && Date.now() - new Date(r.created_at).getTime() > 48 * 3600 * 1000; }
  function ago(iso) {
    var h = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
    if (h < 1) return 'just now'; if (h < 48) return h + 'h ago'; return Math.round(h / 24) + 'd ago';
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = Object.assign({ apikey: cfg.supabaseAnonKey, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(cfg.supabaseUrl + path, Object.assign({}, opts, { headers: headers })).then(function (res) {
      if (res.status === 401 && !opts._retried) {
        return refresh().then(function () { return api(path, Object.assign({}, opts, { _retried: true })); });
      }
      if (!res.ok) return res.text().then(function (t) { throw new Error(t || res.statusText); });
      return res.status === 204 ? null : res.json();
    });
  }

  function refresh() {
    if (!session || !session.refresh_token) return Promise.reject(new Error('signed out'));
    return fetch(cfg.supabaseUrl + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: { apikey: cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    }).then(function (r) { if (!r.ok) throw new Error('refresh failed'); return r.json(); })
      .then(function (d) { session = { access_token: d.access_token, refresh_token: d.refresh_token }; save(); });
  }

  function renderFilters() {
    $('cd-filters').innerHTML = FILTERS.map(function (f) {
      var count = rows.filter(match(f[0])).length;
      return '<label class="chip"><input type="radio" name="cd-filter" value="' + f[0] + '"' + (f[0] === filter ? ' checked' : '') + '><span>' + f[1] + ' · ' + count + '</span></label>';
    }).join('');
  }
  function match(f) {
    return function (r) {
      if (f === 'needs') return needsFollowUp(r);
      if (f === 'overdue') return isOverdue(r);
      if (f === 'prayer') return r.type === 'prayer' || r.type === 'anonymous';
      if (f === 'people') return r.type === 'connect' || r.type === 'crew' || r.type === 'coffee';
      if (f === 'notify') return r.type === 'notify' || (r.sms_consent && r.lists && r.lists.length);
      return true;
    };
  }

  function render() {
    renderFilters();
    var items = rows.filter(match(filter));
    if (!items.length) { list.innerHTML = '<li class="muted">Nothing here. ' + (filter === 'needs' ? 'Everyone has been followed up with.' : '') + '</li>'; return; }
    list.innerHTML = items.map(function (r) {
      var t = TYPES[r.type] || [r.type, 'faint'];
      var d = r.details || {};
      var name = [r.first_name, r.last_name].filter(Boolean).join(' ') || (r.type === 'anonymous' ? 'Anonymous' : 'No name');
      var phone = r.phone ? '<a href="sms:' + esc(r.phone) + '">Text ' + esc(r.phone) + '</a>' : '';
      var parent = r.parent_phone ? '<a href="sms:' + esc(r.parent_phone) + '">Text parent ' + esc(r.parent_phone) + '</a>' : '';
      var tags = []
        .concat(r.is_minor ? ['Under 18'] : [])
        .concat(d.prayInPerson ? ['Wants prayer in person'] : [])
        .concat(d.followUp ? ['Wants a check-in'] : [])
        .concat((r.lists || []).map(function (l) { return LIST_LABELS[l] || l; }))
        .concat(d.roles || [])
        .concat((d.nights || []).map(function (n) { return 'Can serve ' + n.slice(5).replace('-', '.'); }));
      var done = r.status !== 'new';
      var action = r.type === 'anonymous' || (r.type === 'prayer' && !needsFollowUp(r)) ? ['prayed', 'Mark prayed'] : ['followed_up', 'Mark followed up'];
      return '<li style="display:block">' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-bottom:8px">' +
          '<span class="mono small" style="color:var(--' + t[1] + ')">' + esc(t[0]) + '</span>' +
          '<span class="faint" style="font-size:14px">' + ago(r.created_at) + '</span>' +
          (isOverdue(r) ? '<span class="pill pill-amber">Over 48 hours</span>' : '') +
          (done ? '<span class="pill pill-line">' + esc(r.status.replace('_', ' ')) + (r.followed_up_by ? ' · ' + esc(r.followed_up_by) : '') + '</span>' : '') +
        '</div>' +
        '<div style="font-weight:600;font-size:22px;letter-spacing:-0.02em">' + esc(name) + '</div>' +
        (r.message ? '<p class="soft" style="margin-top:6px;white-space:pre-wrap">' + esc(r.message) + '</p>' : '') +
        (r.contact ? '<p class="muted" style="margin-top:6px">Contact: ' + esc(r.contact) + '</p>' : '') +
        (tags.length ? '<p class="muted" style="margin-top:6px;font-size:15px">' + tags.map(esc).join(' · ') + '</p>' : '') +
        '<div class="btn-row" style="margin-top:12px;align-items:center;gap:8px 20px">' + phone + parent +
          (done ? '' : '<button class="btn btn-line" type="button" data-mark="' + r.id + '" data-status="' + action[0] + '" style="min-height:44px">' + action[1] + '</button>') +
        '</div></li>';
    }).join('');
  }

  function loadRows() {
    say('Loading…');
    return api('/rest/v1/submissions?select=*&order=created_at.desc&limit=400').then(function (data) {
      rows = data || []; say(''); show(app, true); render();
    });
  }

  document.addEventListener('change', function (e) { if (e.target.name === 'cd-filter') { filter = e.target.value; render(); } });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mark]'); if (!b) return;
    b.disabled = true;
    var id = b.getAttribute('data-mark');
    var patch = { status: b.getAttribute('data-status'), followed_up_at: new Date().toISOString(), followed_up_by: email() };
    api('/rest/v1/submissions?id=eq.' + encodeURIComponent(id), { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) })
      .then(function () { rows.forEach(function (r) { if (String(r.id) === id) Object.assign(r, patch); }); render(); })
      .catch(function (err) { b.disabled = false; alert('Could not save: ' + err.message); });
  });

  signin.addEventListener('submit', function (e) {
    e.preventDefault();
    var addr = $('cd-email').value.trim();
    var redirect = location.origin + location.pathname;
    fetch(cfg.supabaseUrl + '/auth/v1/otp?redirect_to=' + encodeURIComponent(redirect), {
      method: 'POST', headers: { apikey: cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addr, create_user: false })
    }).then(function (r) {
      show(signin, false);
      say(r.ok ? 'Check your email for a sign-in link.' : 'That email is not on the crew list yet. Ask a leader to add you.');
    });
  });

  $('cd-signout').addEventListener('click', function () { clear(); show(app, false); show(signin, true); show(who, false); say(''); });

  fetch('/api/config').then(function (r) { return r.json(); }).then(function (c) {
    cfg = c;
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) { say('The crew dashboard is not connected yet (missing SUPABASE_URL or SUPABASE_ANON_KEY).'); return; }
    var h = new URLSearchParams(location.hash.slice(1));
    if (h.get('access_token')) {
      session = { access_token: h.get('access_token'), refresh_token: h.get('refresh_token') }; save();
      history.replaceState(null, '', location.pathname);
    } else if (h.get('error_description')) {
      say(h.get('error_description'));
    } else {
      session = load();
    }
    if (!session) { say(''); show(signin, true); return; }
    who.textContent = email(); show(who, true);
    loadRows().catch(function () { clear(); say('Please sign in again.'); show(signin, true); });
  }).catch(function () { say('Could not load the dashboard settings.'); });
})();
