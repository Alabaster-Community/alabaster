// Shared building blocks for the static pages. Plain template strings, no dependencies.

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}
export const dotDate = (iso) => { const { m, d } = parseDate(iso); return `${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`; };
export const longDate = (iso) => { const { m, d } = parseDate(iso); return `${MONTHS[m - 1]} ${d}`; };

/** Upcoming Light Nights from a build-time "today" (the browser re-checks at runtime). */
export function upcoming(events, todayIso) {
  return [...events].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => e.date >= todayIso);
}

// 9×9 dot-matrix icons
const ICONS = {
  flame: ['....#....', '...##....', '...###...', '..####...', '..#####..', '.###.###.', '.##...##.', '.##...##.', '..#####..'],
  sprout: ['.##...##.', '####.####', '.###.###.', '..##.##..', '....#....', '....#....', '....#....', '..#####..', '.#######.'],
  plus: ['...###...', '...###...', '...###...', '#########', '#########', '#########', '...###...', '...###...', '...###...']
};
export function dotIcon(name, color, cls = 'dot-icon') {
  const grid = [];
  const on = [];
  ICONS[name].forEach((row, y) => [...row].forEach((ch, x) => {
    const cx = x * 10 + 5, cy = y * 10 + 5;
    grid.push(`<circle class="grid-dot" cx="${cx}" cy="${cy}" r="1.3"/>`);
    if (ch === '#') on.push(`<circle cx="${cx}" cy="${cy}" r="4"/>`);
  }));
  return `<svg class="${cls}" viewBox="0 0 90 90" aria-hidden="true" focusable="false">${grid.join('')}<g fill="var(--${color})">${on.join('')}</g></svg>`;
}

export const NAV = [
  { href: '/#next', label: 'Light Night', key: 'light-night' },
  { href: '/prayer-room/', label: 'Prayer Room', key: 'prayer' },
  { href: '/grow/', label: 'Grow', key: 'grow' },
  { href: '/join/', label: 'Crew', key: 'join' },
  { href: '/#table', label: 'The Table', key: 'table' }
];

export function header(current) {
  const links = NAV.map((n) => `<a href="${n.href}"${n.key === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="wrap site-header">
  <a class="brand" href="/"><img src="/img/logo-mark.png" alt="" width="28" height="28"><span>alabaster</span><span class="sr-only">home</span></a>
  <nav class="nav" aria-label="Main">${links}<a class="strong" href="/give/"${current === 'give' ? ' aria-current="page"' : ''}>Give</a>
    <button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false" aria-label="Switch to light mode"><span class="moon" aria-hidden="true"></span><span data-theme-label>Dark</span></button>
  </nav>
</header>`;
}

export function footer(s) {
  return `<footer class="wrap site-footer">
  <span>© ${new Date().getFullYear()} ${esc(s.orgName)} · ${esc(s.city)}</span>
  <nav aria-label="Footer">
    <a href="${esc(s.instagram)}">Instagram</a>
    <a href="mailto:${esc(s.email)}">Email</a>
    <a href="/beliefs/">What we believe</a>
    <a href="/privacy/">Privacy &amp; texts</a>
    <a href="/give/" class="c-gold">Give</a>
  </nav>
</footer>`;
}

/** Required texting disclosure (A2P 10DLC). Shown next to every phone field that opts into texts. */
export function smsConsent(s) {
  return `<p class="consent">By entering your number, you agree to get texts from ${esc(s.orgName)} about Light Night and the things you chose, about 6–8 a year. Message and data rates may apply. Reply STOP to opt out or HELP for help. We never sell or share your number. <a href="/privacy/">Privacy &amp; text terms</a>.</p>`;
}

/**
 * Page templates return their parts; src/components/Page.astro turns them into the full HTML page
 * (head, header, footer). Convert a template into a real .astro page whenever you like.
 */
export function layout({ title, description, current, settings, body, noindex = false, extraHead = '' }) {
  return { title, description, current, settings, body, noindex, extraHead };
}
