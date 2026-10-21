// GET /api/callback — finishes GitHub sign-in and hands the token to Decap CMS in the opener window.
export default async function handler(req, res) {
  const url = new URL(req.url, 'https://placeholder');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = /(?:^|;\s*)decap_state=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];

  const reply = (status, payload) => {
    const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Set-Cookie', 'decap_state=; Path=/api; Max-Age=0');
    res.end(`<!doctype html><meta charset="utf-8"><title>Signing in…</title><p>Signing in…</p><script>
(function(){var msg=${JSON.stringify(message)};function onMsg(e){if(e.origin!==location.origin)return;window.opener.postMessage(msg,e.origin);window.removeEventListener('message',onMsg)}
window.addEventListener('message',onMsg);window.opener&&window.opener.postMessage('authorizing:github','*');})();
</script>`);
  };

  if (!code || !state || state !== cookieState) return reply('error', { message: 'Sign-in expired. Please try again.' });

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code })
    });
    const data = await r.json();
    if (!data.access_token) return reply('error', { message: data.error_description || 'GitHub did not return a token.' });
    return reply('success', { token: data.access_token, provider: 'github' });
  } catch (err) {
    console.error(err);
    return reply('error', { message: 'Could not reach GitHub.' });
  }
}
