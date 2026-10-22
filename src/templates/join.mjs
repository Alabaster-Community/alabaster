import { esc, dotDate, dotIcon, layout, smsConsent } from '../lib.mjs';

const hp = '<div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>';

const ROLES = [
  ['Worship', 'Vocals, keys, guitar, bass, drums. Lead the room toward Jesus, not toward a show.', 'Rehearsal + night', 'teal'],
  ['Hosting', 'Welcome people by name, set up, run the snacks and the hangout. Nobody sits alone on your watch.', '~4 hrs per night', 'violet'],
  ['Prayer team', 'Pray with people during response time and over the requests that come in. Training provided.', 'Night + training', 'gold'],
  ['Content', 'Photos, Reels, stories and design. Capture what God is doing without getting in the way of it.', '~2 hrs a week', 'amber'],
  ['Dev crew', 'Code? Help build this website and the tools behind it, alongside an experienced engineer.', 'Flexible', 'teal']
];

export default function join({ settings: s, events, today }) {
  const nights = [...events.lightNights].filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const body = `
<section class="page-hero dots">
  <div class="wrap inner">
    ${dotIcon('plus', 'violet', 'icon-lg')}
    <div class="text">
      <p class="mono">Be sent · Phase 04</p>
      <h1 style="margin-top:18px">join the crew<span class="c-violet">.</span></h1>
      <p class="lead">Help build what you belong to. Light Night runs on people who show up, pray, and make room for others.</p>
    </div>
    <dl class="facts">
      <dt>Season</dt><dd>One season at a time</dd>
      <dt>Time</dt><dd>About 4 hrs per night</dd>
      <dt>Plus</dt><dd>One crew dinner a month</dd>
      <dt>Experience</dt><dd>Not required</dd>
    </dl>
  </div>
</section>

<section class="wrap" aria-labelledby="roles-title" style="padding-top:88px;padding-bottom:40px">
  <h2 id="roles-title" class="mono" style="margin-bottom:16px">The roles</h2>
  <ol class="list-rows">
    ${ROLES.map(([n, w, t, c], i) => `<li><span class="n c-${c}">${String(i + 1).padStart(2, '0')}</span><span class="name">${n}</span><span class="what">${w}</span><span class="time">${t}</span></li>`).join('')}
  </ol>
</section>

<section class="wrap" aria-labelledby="how-title" style="padding-top:56px;padding-bottom:88px">
  <h2 id="how-title" class="mono" style="margin-bottom:24px">How it works</h2>
  <ol class="steps" style="gap:32px">
    <li><div class="dot-type" style="font-size:28px">→ 01</div><h3 style="font-size:21px">Sign up below</h3><p>Two minutes. Pick what interests you.</p></li>
    <li><div class="dot-type" style="font-size:28px">→ 02</div><h3 style="font-size:21px">We text you</h3><p>Within 48 hours, to grab coffee or a call.</p></li>
    <li><div class="dot-type" style="font-size:28px">→ 03</div><h3 style="font-size:21px">Shadow a night</h3><p>Serve alongside someone first. No pressure.</p></li>
    <li><div class="dot-type c-violet" style="font-size:28px">→ 04</div><h3 style="font-size:21px">You're crew</h3><p>For the season. Then we check in together.</p></li>
  </ol>
  <p class="faint" style="margin-top:40px;padding-top:20px;border-top:1px solid var(--line);font-size:15px;max-width:760px">Anyone serving where minors are present completes a background check and our child and youth safety training first. It keeps everyone safe, you included.</p>
</section>

<section id="apply" class="rule-t" aria-labelledby="apply-title">
  <div class="wrap cols">
    <div class="side"><p class="mono">Sign up</p><h2 id="apply-title" class="dot-title">i'm in.</h2><p class="muted">Not sure where you fit? Pick "not sure yet" and we'll figure it out over coffee.</p></div>
    <div class="main">
      <form class="form" id="f-crew" data-form="crew" data-done="#d-crew" novalidate>
        <div class="field-row">
          <div class="field"><label for="cr-first">First name</label><input id="cr-first" name="firstName" type="text" autocomplete="given-name" required maxlength="60"></div>
          <div class="field"><label for="cr-last">Last name</label><input id="cr-last" name="lastName" type="text" autocomplete="family-name" required maxlength="60"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="cr-phone">Phone</label><input id="cr-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"></div>
          <div class="field"><label for="cr-email">Email (optional)</label><input id="cr-email" name="email" type="email" autocomplete="email" maxlength="120"></div>
        </div>
        <label class="check boxed"><input type="checkbox" name="isMinor" data-reveal="#cr-parent"> I'm under 18</label>
        <div class="field" id="cr-parent" hidden><label for="cr-parent-phone">Parent or guardian phone</label><input id="cr-parent-phone" name="parentPhone" type="tel" inputmode="tel" maxlength="20"><p class="form-note" style="margin-top:8px">Under 18s serve on worship or hosting alongside a parent or youth leader. We'll reach out to them first.</p></div>
        <fieldset class="plain"><legend>I'm interested in</legend>
          <div class="chips">${['Worship', 'Hosting', 'Prayer team', 'Content', 'Dev crew', 'Not sure yet'].map((r) => `<label class="chip"><input type="checkbox" name="roles" value="${esc(r)}" data-multi><span>${esc(r)}</span></label>`).join('')}</div>
        </fieldset>
        ${nights.length ? `<fieldset class="plain"><legend>Nights I can serve</legend>
          <div style="display:flex;flex-wrap:wrap;gap:6px 22px">${nights.map((e) => `<label class="check"><input type="checkbox" name="nights" value="${e.date}" data-multi><span class="dot-type" style="font-size:22px">${dotDate(e.date)}</span></label>`).join('')}</div>
        </fieldset>` : ''}
        <div class="field"><label for="cr-about">Anything we should know? (optional)</label><textarea id="cr-about" name="message" rows="4" maxlength="2000" placeholder="What you play, what you're good at, what you're nervous about..."></textarea></div>
        <p class="form-note">We'll text you personally within 48 hours. Signing up doesn't add you to any text list.</p>
        ${hp}
        <p class="form-error" role="alert" hidden></p>
        <div><button class="btn btn-solid" type="submit">Join the crew</button></div>
      </form>
      <div class="done" id="d-crew" hidden>
        <p class="dot-type" tabindex="-1" style="font-size:64px">welcome<span class="c-violet">.</span></p>
        <p style="margin:20px 0 8px;font-size:24px;font-weight:500">You're on the list.</p>
        <p class="muted" style="max-width:480px">Someone from the crew will text you within 48 hours to set up coffee and talk about where you fit.</p>
      </div>
    </div>
  </div>
</section>`;
  return layout({ title: 'Join the crew', description: 'Worship, hosting, prayer team, content and dev crew. Help build what you belong to.', current: 'join', settings: s, body });
}
