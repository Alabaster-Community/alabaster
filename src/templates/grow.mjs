import { esc, dotIcon, layout } from '../lib.mjs';
import { quickTextForm } from './parts.mjs';

const hp = '<div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>';

export default function grow({ settings: s }) {
  const c = s.growCohort;
  const body = `
<section class="page-hero dots">
  <div class="wrap inner">
    ${dotIcon('sprout', 'teal', 'icon-lg')}
    <div class="text">
      <p class="mono">Become · Phase 02</p>
      <h1 style="margin-top:18px">grow<span class="c-teal">.</span></h1>
      <p class="lead">You don't have to be in the "perfect" season to grow. Start with a conversation. Go deeper when you're ready.</p>
    </div>
  </div>
</section>

<section class="rule-b" aria-labelledby="coffee-title">
  <div class="wrap cols" style="align-items:center">
    <div class="side" style="flex:1 1 380px">
      <p class="mono" style="display:flex;align-items:center;gap:10px;color:var(--teal)"><span class="status-dot bg-teal"></span>Open now · Always</p>
      <h2 id="coffee-title" style="font-size:clamp(38px,4.6vw,56px);margin:14px 0 16px">Start with coffee.</h2>
      <p class="muted" style="max-width:460px">Sit down with someone who's walked with Jesus a while. Bring your questions, your doubts, your story. We'll buy the coffee.</p>
    </div>
    <div class="main" style="flex:1 1 420px">
      <form class="form" id="f-coffee" data-form="coffee" data-done="#d-coffee" novalidate>
        <div class="field-row">
          <div class="field"><label for="g-name">First name</label><input id="g-name" name="firstName" type="text" autocomplete="given-name" required maxlength="60"></div>
          <div class="field"><label for="g-phone">Phone</label><input id="g-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"></div>
        </div>
        <label class="check"><input type="checkbox" name="isMinor"> I'm under 18 (we'll set it up with a parent)</label>
        <p class="form-note">Someone will text you personally to find a time. This doesn't add you to any list.</p>
        ${hp}
        <p class="form-error" role="alert" hidden></p>
        <div><button class="btn btn-solid" type="submit">Let's get coffee</button></div>
      </form>
      <div class="done" id="d-coffee" hidden>
        <p class="dot-type" tabindex="-1">see you soon<span class="c-teal">.</span></p>
        <p class="muted" style="margin-top:14px">We'll text you within 48 hours to find a time.</p>
      </div>
    </div>
  </div>
</section>

<section class="wrap" aria-labelledby="tracks-title" style="padding-top:88px;padding-bottom:56px">
  <h2 id="tracks-title" class="mono" style="margin-bottom:16px">The tracks</h2>
  <ol class="list-rows">
    <li style="align-items:center"><span class="n c-teal">01</span><span style="flex:2 1 380px"><span class="name" style="display:block">Firm Foundation</span><span class="muted">Identity in Christ, core truths, and following Jesus every day. Six weeks for young adults.</span></span><span class="pill bg-teal" style="color:var(--bg)">${esc(c.label)}</span></li>
    <li style="align-items:center"><span class="n c-violet">02</span><span style="flex:2 1 380px"><span class="name" style="display:block">His Heart</span><span class="muted">Seeing Jesus clearly, gentle and lowly, so trust and worship grow from there.</span></span><span class="pill pill-line">Coming later</span></li>
    <li style="align-items:center"><span class="n c-gold">03</span><span style="flex:2 1 380px"><span class="name" style="display:block">Whole Heart</span><span class="muted">Emotional and spiritual healing, so you can love God and people from a whole heart.</span></span><span class="pill pill-line">Coming later</span></li>
  </ol>
</section>

<section aria-label="Get notified when the cohort opens">
  ${quickTextForm(s, { id: 'grow-notify', list: 'grow-cohort', label: `Text me when ${c.label} opens.`, button: 'Notify me' })}
</section>

<section class="wrap" style="padding-top:56px;padding-bottom:104px">
  <blockquote style="margin:0;font-weight:500;font-size:clamp(28px,3.4vw,40px);line-height:1.2;letter-spacing:-0.03em;max-width:860px">“So then, just as you received Christ Jesus as Lord, continue to live your lives in him, rooted and built up in him.”</blockquote>
  <p class="mono" style="margin-top:14px">Colossians 2:6–7</p>
</section>`;
  return layout({ title: 'Grow', description: 'Start with coffee. Go deeper in a formation track.', current: 'grow', settings: s, body });
}
