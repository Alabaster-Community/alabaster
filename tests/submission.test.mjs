import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRecord, normalizePhone, FormError } from '../api/_lib/submission.js';
import handler from '../api/submit.js';

test('normalizes US phone numbers', () => {
  assert.equal(normalizePhone('(804) 555-0123'), '+18045550123');
  assert.equal(normalizePhone('1-804-555-0123'), '+18045550123');
  assert.equal(normalizePhone(''), '');
  assert.throws(() => normalizePhone('555-0123'), FormError);
});

test('anonymous prayer keeps only the message', () => {
  const r = buildRecord({ type: 'anonymous', message: ' help ', firstName: 'Sam', phone: '8045550123', page: '/tonight/' });
  assert.deepEqual(r, { type: 'anonymous', message: 'help', lists: [], details: {}, is_minor: false, sms_consent: false });
});

test('prayer page with "keep it anonymous" checked becomes anonymous', () => {
  const r = buildRecord({ type: 'prayer', anonymous: true, message: 'x', firstName: 'Sam' });
  assert.equal(r.type, 'anonymous');
  assert.equal(r.first_name, undefined);
});

test('connect card: text consent only when the Light Night box is ticked and adult', () => {
  const a = buildRecord({ type: 'connect', firstName: 'Ana', phone: '804 555 0123', lists: ['light-night', 'grow', 'bogus'] });
  assert.equal(a.sms_consent, true);
  assert.deepEqual(a.lists, ['light-night', 'grow']);
  const b = buildRecord({ type: 'connect', firstName: 'Ana', phone: '8045550123', lists: ['grow'] });
  assert.equal(b.sms_consent, false);
});

test("minors: a prayer request keeps the parent's number and drops the child's own contact", () => {
  const r = buildRecord({
    type: 'prayer', firstName: 'Kid', message: 'pray for my mum',
    contact: '8045550123', isMinor: true, parentPhone: '8045550199', followUp: 'on'
  });
  assert.equal(r.contact, null);
  assert.equal(r.phone, null);
  assert.equal(r.parent_phone, '+18045550199');
  assert.equal(r.is_minor, true);
  assert.equal(r.sms_consent, false);
});

test('minors: own number dropped, parent number required, never on the text list', () => {
  const r = buildRecord({ type: 'connect', firstName: 'Kid', isMinor: true, phone: '8045550123', parentPhone: '8045550199', lists: ['light-night'] });
  assert.equal(r.phone, null);
  assert.equal(r.parent_phone, '+18045550199');
  assert.equal(r.sms_consent, false);
  assert.throws(() => buildRecord({ type: 'connect', firstName: 'Kid', isMinor: true }), /parent/);
});

test('notify requires adult confirmation, a number and a list', () => {
  assert.throws(() => buildRecord({ type: 'notify', firstName: 'A', phone: '8045550123', lists: ['table'] }), /18 and older/);
  const r = buildRecord({ type: 'notify', firstName: 'A', phone: '8045550123', lists: 'table', adultConfirmed: true, smsConsent: 'yes' });
  assert.deepEqual(r.lists, ['table']);
  assert.equal(r.sms_consent, true);
});

test('crew sign-up keeps roles and nights', () => {
  const r = buildRecord({ type: 'crew', firstName: 'Jo', lastName: 'Lee', phone: '8045550123', roles: ['Worship', 'Hack'], nights: ['2027-02-13', 'x'] });
  assert.deepEqual(r.details.roles, ['Worship']);
  assert.deepEqual(r.details.nights, ['2027-02-13']);
});

function fakeRes() {
  const res = { statusCode: 0, body: null, headers: {} };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  return res;
}

test('handler: validation errors are 400 with a friendly message', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', body: { type: 'coffee', firstName: '' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /first name/);
});

test('handler: honeypot is silently accepted and not stored', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', body: { type: 'anonymous', message: 'spam', website: 'http://x' } }, res);
  assert.equal(res.statusCode, 200);
});

test('handler: 503 when Supabase is not configured', async () => {
  delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = fakeRes();
  await handler({ method: 'POST', body: { type: 'anonymous', message: 'hi' } }, res);
  assert.equal(res.statusCode, 503);
});

test('handler: inserts into Supabase with the service key', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => { calls.push({ url, opts }); return new Response(null, { status: 201 }); };
  try {
    const res = fakeRes();
    await handler({ method: 'POST', body: JSON.stringify({ type: 'coffee', firstName: 'Mia', phone: '8045550123' }) }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(calls[0].url, 'https://example.supabase.co/rest/v1/submissions');
    assert.equal(calls[0].opts.headers.apikey, 'service-key');
    assert.equal(JSON.parse(calls[0].opts.body).phone, '+18045550123');
  } finally {
    globalThis.fetch = realFetch;
  }
});
