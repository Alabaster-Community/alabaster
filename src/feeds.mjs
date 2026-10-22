// Calendar, robots.txt and sitemap, served as static files by src/pages/*.js endpoints.
import { data } from './data.mjs';

// Calendar file with every Light Night (Add to calendar links)
export function ics() {
  const toTime = (t) => {
    const m = /(\d{1,2})(?::(\d{2}))?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i.exec(t || '');
    if (!m) return ['190000', '210000'];
    const pm = m[5].toUpperCase() === 'PM';
    const h = (x) => String((Number(x) % 12) + (pm ? 12 : 0)).padStart(2, '0');
    return [`${h(m[1])}${m[2] || '00'}00`, `${h(m[3])}${m[4] || '00'}00`];
  };
  const s = data.settings;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Alabaster Ministries//Light Night//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Alabaster Light Night',
    'BEGIN:VTIMEZONE', 'TZID:America/New_York',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
    'END:VTIMEZONE'
  ];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  for (const e of data.events.lightNights.filter((x) => x.date >= data.today)) {
    const d = e.date.replace(/-/g, '');
    const [a, b] = toTime(e.time);
    lines.push('BEGIN:VEVENT', `UID:light-night-${e.date}@alabaster.community`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${d}T${a}`, `DTEND;TZID=America/New_York:${d}T${b}`,
      'SUMMARY:Light Night · Alabaster', `LOCATION:${(e.location || s.lightNight.venue || s.lightNight.venueCity || 'TBD').replace(/,/g, '\\,')}`,
      `DESCRIPTION:Worship\\, Scripture and prayer. Free. ${s.siteUrl}`, `URL:${s.siteUrl}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export const robots = () => `User-agent: *\nDisallow: /admin/\nDisallow: /crew-dashboard/\nDisallow: /tonight/\nDisallow: /screen/\nSitemap: ${data.settings.siteUrl}/sitemap.xml\n`;

const publicPaths = ['', 'prayer-room/', 'grow/', 'join/', 'beliefs/', 'give/', 'privacy/', 'notify/'];
export const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map((p) => `  <url><loc>${data.settings.siteUrl}/${p}</loc></url>`).join('\n')}\n</urlset>\n`;
