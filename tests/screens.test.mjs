import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { qrMatrix, qrSvg } from '../src/qr.mjs';

const json = (f) => JSON.parse(readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8'));

test('QR picks the smallest size that fits', () => {
  assert.equal(qrMatrix('HELLO').length, 21); // version 1
  assert.equal(qrMatrix('https://alabasterchurch.org/give/').length, 29); // version 3
  assert.equal(qrMatrix('https://example.com/' + 'x'.repeat(300)).length, 69); // version 13, 16-bit length
});

test('QR has its corner markers and timing lines', () => {
  const m = qrMatrix('https://alabasterchurch.org/tonight/');
  const n = m.length;
  for (const [x0, y0] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    for (let i = 0; i < 7; i++) {
      assert.ok(m[y0][x0 + i] && m[y0 + 6][x0 + i] && m[y0 + i][x0] && m[y0 + i][x0 + 6], 'finder ring');
    }
    assert.ok(m[y0 + 3][x0 + 3], 'finder center');
    assert.ok(!m[y0 + 1][x0 + 1], 'finder gap');
  }
  for (let i = 8; i < n - 8; i++) assert.equal(m[6][i], i % 2 === 0, 'timing line');
  assert.ok(m[n - 8][8], 'dark module');
});

test('QR SVG escapes its label', () => {
  assert.match(qrSvg('x', { label: 'a "b"' }), /aria-label="a &quot;b&quot;"/);
});

test('projector slides in content/screens.json are complete', () => {
  const { slides, dates } = json('screens.json');
  const slugs = slides.map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'each slide needs its own web name');
  assert.ok(slugs.includes('tonight'), '/screen/ shows the slide named tonight');
  for (const s of slides) {
    assert.match(s.slug, /^[a-z0-9][a-z0-9-]*$/, `web name "${s.slug}"`);
    assert.notEqual(s.slug, 'dates', '"dates" is the dates slide');
    assert.ok(s.headline && s.headline.trim(), `${s.slug}: headline`);
    assert.match(s.link || '', /^(\/|https?:\/\/)/, `${s.slug}: link should start with / or https://`);
    assert.ok(['gold', 'teal', 'violet', 'amber'].includes(s.color), `${s.slug}: color`);
  }
  assert.ok(dates && dates.headline, 'dates slide headline');
  if (dates.link) assert.match(dates.link, /^(\/|https?:\/\/)/);
});

test('Light Night dates are real dates', () => {
  for (const e of json('events.json').lightNights) {
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/);
    const [y, m, d] = e.date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    assert.equal(dt.getUTCDate(), d, `${e.date} is not a calendar date`);
  }
});
