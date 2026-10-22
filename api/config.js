// GET /api/config — public values the crew dashboard needs. The anon key is safe to expose;
// row-level security in supabase/schema.sql decides what a signed-in crew member can see.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null
  });
}
