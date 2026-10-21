// POST /api/submit — saves a form submission to Supabase.
import { buildRecord, FormError } from './_lib/submission.js';

export async function insertSubmission(record, env = process.env, fetchImpl = fetch) {
  const res = await fetchImpl(`${env.SUPABASE_URL}/rest/v1/submissions`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text().catch(() => '')}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }
  let input = req.body;
  if (typeof input === 'string') { try { input = JSON.parse(input); } catch { input = null; } }

  // Bots fill the hidden "website" field; pretend success and drop it.
  if (input && typeof input.website === 'string' && input.website.trim()) return res.status(200).json({ ok: true });

  let record;
  try {
    record = buildRecord(input);
  } catch (err) {
    if (err instanceof FormError) return res.status(400).json({ ok: false, error: err.message });
    throw err;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('submit: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    return res.status(503).json({ ok: false, error: 'Our forms are not connected yet.' });
  }

  try {
    await insertSubmission(record);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ ok: false, error: 'We could not save that.' });
  }
}
