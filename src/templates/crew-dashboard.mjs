import { layout } from '../lib.mjs';

export default function crewDashboard({ settings: s }) {
  const body = `
<section class="wrap" style="padding-top:48px;padding-bottom:96px">
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:32px">
    <div><p class="mono">Crew only</p><h1 class="dot-type" style="font-size:clamp(44px,6vw,72px);letter-spacing:0;margin-top:10px">follow up<span class="c-violet">.</span></h1></div>
    <div id="cd-who" class="mono small" hidden></div>
  </div>

  <div id="cd-status" class="muted" role="status">Loading…</div>

  <form id="cd-signin" class="form" hidden style="max-width:460px">
    <p class="soft">Sign in with the email address the leaders added to the crew list. We'll send you a link.</p>
    <div class="field"><label for="cd-email">Email</label><input id="cd-email" type="email" autocomplete="email" required></div>
    <div><button class="btn btn-solid" type="submit">Email me a sign-in link</button></div>
  </form>

  <div id="cd-app" hidden>
    <div role="toolbar" aria-label="Filter" class="chips" id="cd-filters" style="margin-bottom:24px"></div>
    <ol id="cd-list" class="list-rows" style="list-style:none"></ol>
    <p class="form-note" style="margin-top:24px">Prayer requests are deleted automatically after 60 days. Text people from your own phone; tap a number to start.</p>
    <div style="margin-top:24px"><button class="btn btn-line" type="button" id="cd-signout">Sign out</button></div>
  </div>
</section>
<script src="/crew.js" defer></script>`;
  return layout({ title: 'Crew follow-up', current: 'bare', settings: s, body, noindex: true });
}
