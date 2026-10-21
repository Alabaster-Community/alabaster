// GET /api/auth — starts GitHub sign-in for the content editor at /admin (Decap CMS).
import { randomBytes } from 'node:crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(503).send('GitHub sign-in is not configured (GITHUB_CLIENT_ID).');
  const state = randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `decap_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `https://${host}/api/callback`,
    scope: 'repo,user',
    state
  });
  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
}
