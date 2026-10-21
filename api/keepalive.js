// Daily cron (see vercel.json). Supabase pauses free projects after a week with no activity;
// one tiny read a day keeps the database awake.
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ ok: false });
  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (!url || !key) return res.status(200).json({ ok: false, skipped: 'not configured' });
  const r = await fetch(`${url}/rest/v1/crew_members?select=email&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
}
