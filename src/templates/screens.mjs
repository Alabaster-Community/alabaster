// Projector slides at /screen/… Everything they show comes from content files the /admin editor saves:
//   QR slides  → content/screens.json  (slides[])
//   Dates slide → content/events.json (the same Light Night dates the rest of the site uses)
//                 plus the "dates" section of content/screens.json for its wording and QR link.
import { esc, layout, parseDate } from '../lib.mjs';
import { qrSvg } from '../qr.mjs';

const COLORS = ['gold', 'teal', 'violet', 'amber'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DARK = '<script>document.documentElement.setAttribute("data-theme","dark")</script>';

const colorOf = (c) => (COLORS.includes(c) ? c : 'gold');
/** "/give/" → full URL for the QR, plus the short form printed under it. */
function resolveLink(link, s) {
  const full = /^https?:\/\//i.test(link || '') ? link : s.siteUrl.replace(/\/$/, '') + '/' + String(link || '').replace(/^\//, '');
  // The printed address skips https:// and anything after ?, so it stays short enough to read from the back.
  return { full, short: full.replace(/^https?:\/\//i, '').replace(/[?#].*$/, '').replace(/\/$/, '') };
}
/** Headline lines (newline-separated) in dot type, ending with a colored period unless it ends in punctuation. */
function headline(text, color) {
  const t = String(text || '').trim();
  const lines = t.split(/\n/).map(esc).join('<br>');
  return /[.!?…]$/.test(t) ? lines : `${lines}<span class="c-${color}">.</span>`;
}
function qrBox(link, s, { width = '27vw', caption = '' } = {}) {
  // Room around the code: about four dots of empty space, which phone cameras need to lock on.
  const pad = `calc(${width} * 0.115)`;
  const small = parseFloat(width) < 20;
  const { full, short } = resolveLink(link, s);
  return `<div style="flex:0 0 ${width};width:${width};min-width:0;text-align:center">
      <div style="padding:${pad};border:2px solid var(--line2);border-radius:2vw;background:#0E0E0E">${qrSvg(full, { label: `QR code linking to ${short}` })}</div>
      <div style="font-family:'Geist Mono',monospace;font-size:${small ? '1.15vw' : '1.55vw'};margin-top:1.2vw;overflow-wrap:anywhere">${esc(short)}</div>
      ${caption ? `<div class="soft" style="font-size:1.25vw;margin-top:.4vw">${esc(caption)}</div>` : ''}
    </div>`;
}
/** A smaller QR with its address and caption beside it, for slides where the QR isn't the main thing. */
function qrSide(link, s, caption) {
  const { full, short } = resolveLink(link, s);
  return `<div style="display:flex;align-items:center;gap:1.6vw;flex:0 0 auto">
      <div style="text-align:right;max-width:24vw">
        ${caption ? `<div style="font-size:1.6vw;font-weight:500;line-height:1.2">${esc(caption)}</div>` : ''}
        <div style="font-family:'Geist Mono',monospace;font-size:1.05vw;margin-top:.6vw" class="soft">${esc(short)}</div>
      </div>
      <div style="width:12.5vw;padding:1.45vw;border:2px solid var(--line2);border-radius:1.4vw;background:#0E0E0E;box-sizing:content-box">${qrSvg(full, { label: `QR code linking to ${short}` })}</div>
    </div>`;
}
const topBar = (label, color) =>
  `<div class="mono" style="display:flex;justify-content:space-between;font-size:1.25vw"><span style="display:flex;align-items:center;gap:.7vw"><span class="status-dot bg-${color}" style="width:.75vw;height:.75vw"></span>${esc(label)}</span><span>alabaster</span></div>`;
const footerBar = (left, right) =>
  `<div style="display:flex;justify-content:space-between;gap:3vw;border-top:1px solid var(--line2);padding-top:1.7vw;font-size:1.55vw" class="soft"><span>${esc(left || '')}</span><span class="mono" style="font-size:1.15vw;text-align:right">${esc(right || '')}</span></div>`;
const frame = (inner) =>
  `<div class="dots" style="min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:6vh 6.5vw;box-sizing:border-box;font-size:1.6vw">${inner}</div>`;

/** Every QR slide in content/screens.json, by slug. */
export const qrSlides = (data) => (data.screens.slides || []).filter((sl) => sl.slug && sl.slug !== 'dates');

/** A full-screen QR slide: headline, up to a few numbered lines, and a QR code made from its link. */
export function qrSlide(data, slide) {
  const s = data.settings;
  const color = colorOf(slide.color);
  const steps = (slide.steps || []).filter(Boolean);
  const body = frame(`
  ${topBar(slide.label || 'Light Night', color)}
  <div style="display:flex;align-items:center;justify-content:space-between;gap:5vw">
    <div>
      <div class="dot-type" style="font-size:7.8vw;line-height:.92">${headline(slide.headline, color)}</div>
      ${steps.length ? `<ol style="list-style:none;margin:3.3vw 0 0;padding:0;display:flex;flex-direction:column;gap:1.1vw;font-size:2.1vw;font-weight:500">
        ${steps.map((t, i) => `<li><span class="dot-type c-${color}" style="display:inline-block;width:3.4vw">${String(i + 1).padStart(2, '0')}</span> ${esc(t)}</li>`).join('\n        ')}
      </ol>` : ''}
    </div>
    ${qrBox(slide.link, s)}
  </div>
  ${footerBar(slide.footerLeft, slide.footerRight)}`);
  const title = `${slide.label || slide.slug} screen`;
  return layout({ title, current: 'bare', settings: s, body, noindex: true, extraHead: DARK });
}

/** The year's Light Night dates, with the next one lit up. The browser re-checks "next" so it stays right between rebuilds. */
export function datesSlide(data) {
  const s = data.settings;
  const cfg = data.screens.dates || {};
  const all = [...data.events.lightNights].sort((a, b) => a.date.localeCompare(b.date));
  const next = all.find((e) => e.date >= data.today);
  const year = next ? next.date.slice(0, 4) : (all.length ? all[all.length - 1].date.slice(0, 4) : data.today.slice(0, 4));

  const cards = all.map((e) => {
    const { y, m, d } = parseDate(e.date);
    const wd = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
    const state = e.date === next?.date ? ' is-next' : e.date < data.today ? ' is-past' : '';
    const hidden = String(y) !== year ? ' hidden' : '';
    return `<li class="ln-card${state}" data-date="${esc(e.date)}" data-year="${y}"${hidden}>
        <div class="ln-chip mono"><span class="ln-blink"></span>Next</div>
        <div class="ln-month mono">${MONTHS[m - 1]} · ${wd}</div>
        <div class="ln-day dot-type">${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}</div>
        <div class="ln-meta">${esc(e.time || s.lightNight.time)}</div>
        ${e.note ? `<div class="ln-note mono">${esc(e.note)}</div>` : ''}
        <div class="ln-count dot-type" data-countdown></div>
      </li>`;
  }).join('\n      ');

  const body = frame(`
  ${topBar(cfg.label || 'Light Night · Dates', 'gold')}
  <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:5vw">
    <div>
      <div class="dot-type" style="font-size:6vw;line-height:.95">${esc(cfg.headline || 'light nights')} <span class="c-gold" data-ln-year>${esc(year)}</span></div>
      <p class="soft" style="font-size:1.9vw;margin:1.6vw 0 0">${esc(s.lightNight.venue)}, ${esc(s.lightNight.venueCity)} · <span data-ln-next-text>${next ? `Next: ${MONTHS[parseDate(next.date).m - 1]} ${parseDate(next.date).d}` : 'More dates soon'}</span></p>
    </div>
    ${cfg.link ? qrSide(cfg.link, s, cfg.linkCaption) : ''}
  </div>
  <ol class="ln-row">
      ${cards}
  </ol>
  ${footerBar(cfg.footerLeft, cfg.footerRight)}
<script type="application/json" id="ln-dates">${JSON.stringify(all.map((e) => e.date)).replace(/</g, '\\u003c')}</script>
<script>
(function () {
  var MONTHS = ${JSON.stringify(MONTHS)};
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function days(a, b) { var p = a.split('-'), q = b.split('-'); return Math.round((Date.UTC(q[0], q[1] - 1, q[2]) - Date.UTC(p[0], p[1] - 1, p[2])) / 864e5); }
  function update() {
    try {
      var dates = JSON.parse(document.getElementById('ln-dates').textContent).sort();
      var today = iso(new Date());
      var next = dates.filter(function (x) { return x >= today; })[0];
      var year = next ? next.slice(0, 4) : (dates.length ? dates[dates.length - 1].slice(0, 4) : today.slice(0, 4));
      document.querySelector('[data-ln-year]').textContent = year;
      var t = document.querySelector('[data-ln-next-text]');
      if (t) t.textContent = next ? 'Next: ' + MONTHS[+next.slice(5, 7) - 1] + ' ' + (+next.slice(8, 10)) : 'More dates soon';
      document.querySelectorAll('.ln-card').forEach(function (c) {
        var d = c.getAttribute('data-date');
        c.hidden = c.getAttribute('data-year') !== year;
        c.classList.toggle('is-next', d === next);
        c.classList.toggle('is-past', d < today);
        var cd = c.querySelector('[data-countdown]');
        if (d === next) { var n = days(today, d); cd.textContent = n === 0 ? 'tonight' : n === 1 ? 'tomorrow' : 'in ' + n + ' days'; }
        else cd.textContent = '';
      });
    } catch (e) { /* keep the build-time version */ }
  }
  update();
  setInterval(update, 10 * 60 * 1000); // a projector left on overnight still rolls over to the next date
})();
</script>`);

  const style = `<style>
.ln-row { list-style: none; margin: 1.6vw 0 0; padding: 0; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 1.5vw; align-items: center; }
.ln-card { position: relative; padding: 2vw 1.5vw 1.7vw; border: 1px solid var(--line2); border-radius: 1.4vw; background: #121211; transition: transform .6s cubic-bezier(.2,.8,.2,1), opacity .6s; }
.ln-card[hidden] { display: none; }
.ln-month { font-size: 1.15vw; color: var(--muted); }
.ln-day { font-size: 3.7vw; line-height: 1; margin: 1vw 0 .9vw; letter-spacing: -.02em; white-space: nowrap; }
.ln-meta { font-size: 1.45vw; color: var(--soft); }
.ln-note { display: inline-block; margin-top: .9vw; padding: .3vw .8vw; border: 1px solid var(--line2); border-radius: 99px; font-size: .95vw; }
.ln-chip, .ln-count { display: none; }
.ln-card.is-past { opacity: .32; }
.ln-card.is-past .ln-day { text-decoration: line-through; text-decoration-thickness: .2vw; text-decoration-color: var(--faint); }

/* The next Light Night: lifted, lit dots, a light running round the edge, a live countdown. */
@property --ln-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.ln-card.is-next { transform: translateY(-1.4vw) scale(1.07); border-color: transparent; z-index: 1;
  background:
    radial-gradient(rgba(237,178,70,.55) 1.1px, transparent 1.5px) 0 0 / 14px 14px,
    radial-gradient(120% 90% at 50% 0%, rgba(237,178,70,.22), rgba(18,18,17,0) 70%),
    #16130C;
  box-shadow: 0 0 0 1px rgba(237,178,70,.35), 0 1.8vw 5vw -1vw rgba(237,178,70,.45);
  animation: ln-glow 3.2s ease-in-out infinite; }
.ln-card.is-next::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; padding: 2px; pointer-events: none;
  background: conic-gradient(from var(--ln-angle), transparent 0 62%, rgba(237,178,70,.25) 70%, #EDB246 86%, #FFF3D6 90%, transparent 94%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
  animation: ln-spin 4s linear infinite; }
.ln-card.is-next::after { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(100deg, transparent 30%, rgba(255,236,190,.16) 50%, transparent 70%) -150% 0 / 60% 100% no-repeat;
  animation: ln-sweep 5s ease-in-out infinite; }
.ln-card.is-next .ln-day { color: var(--gold); text-shadow: 0 0 1.2vw rgba(237,178,70,.65), 0 0 3vw rgba(237,178,70,.35); }
.ln-card.is-next .ln-month { color: var(--gold); }
.ln-card.is-next .ln-chip { display: inline-flex; align-items: center; gap: .55vw; position: absolute; top: -1.15vw; left: 1.5vw; padding: .35vw .9vw; border-radius: 99px; background: var(--gold); color: #0E0E0E; font-size: 1vw; font-weight: 600; }
.ln-blink { width: .55vw; height: .55vw; border-radius: 50%; background: #0E0E0E; animation: ln-blink 1.2s steps(2, start) infinite; }
.ln-card.is-next .ln-count { display: block; margin-top: 1.2vw; font-size: 1.75vw; color: var(--fg); white-space: nowrap; }
@keyframes ln-spin { to { --ln-angle: 360deg; } }
@keyframes ln-sweep { 0%, 35% { background-position: -150% 0; } 75%, 100% { background-position: 250% 0; } }
@keyframes ln-glow { 50% { box-shadow: 0 0 0 1px rgba(237,178,70,.6), 0 1.8vw 6.5vw -.6vw rgba(237,178,70,.7); } }
@keyframes ln-blink { to { visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .ln-card.is-next, .ln-card.is-next::before, .ln-card.is-next::after, .ln-blink { animation: none; } }
</style>`;
  return layout({ title: 'Light Night dates screen', current: 'bare', settings: s, body, noindex: true, extraHead: DARK + style });
}
