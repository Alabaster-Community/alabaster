import { esc, layout, smsConsent } from '../lib.mjs';

const hp = '<div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>';

export function beliefs({ settings: s, beliefs: b }) {
  const body = `
<section class="wrap" style="padding-top:88px;padding-bottom:96px">
  <p class="mono">What we believe</p>
  <h1 class="dot-type" style="font-size:clamp(48px,7vw,96px);letter-spacing:0;margin:18px 0 28px">jesus is worthy<span class="c-gold">.</span></h1>
  <p class="lead" style="max-width:720px;margin-bottom:56px">${esc(b.intro)}</p>
  <div class="beliefs rule-t">
    ${b.items.map((i) => `<article id="${esc(i.id)}"><h2>${esc(i.title)}</h2><div class="body">${i.body.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join('')}</div></article>`).join('')}
  </div>
</section>`;
  return layout({ title: 'What we believe', current: 'beliefs', settings: s, body });
}

export function give({ settings: s }) {
  const g = s.giving;
  const venmo = g.venmo ? g.venmo.replace(/^@/, '') : '';
  const body = `
<section class="page-hero dots">
  <div class="wrap inner">
    <div class="text">
      <p class="mono">Give</p>
      <h1 style="margin-top:18px">pour it out<span class="c-gold">.</span></h1>
      <p class="lead">${esc(g.note)}</p>
    </div>
  </div>
</section>
<section class="wrap" style="padding-top:72px;padding-bottom:104px">
  ${g.onlineUrl || venmo ? `<div class="rows">
    ${g.onlineUrl ? `<a class="row-link" href="${esc(g.onlineUrl)}"><span class="title">Give online</span><span class="desc">Card or bank, one-time or monthly.</span><span class="arrow" aria-hidden="true">↗</span></a>` : ''}
    ${venmo ? `<a class="row-link" href="https://venmo.com/${esc(venmo)}"><span class="title">Venmo</span><span class="desc">@${esc(venmo)}</span><span class="arrow" aria-hidden="true">↗</span></a>` : ''}
  </div>` : `<p class="muted">Online giving is being set up. In the meantime, email <a href="mailto:${esc(s.email)}">${esc(s.email)}</a> and we'll help.</p>`}
  <p class="faint" style="margin-top:32px;font-size:15px;max-width:640px">${esc(s.orgName)} is not a registered 501(c)(3), so gifts are not tax-deductible.</p>
</section>`;
  return layout({ title: 'Give', current: 'give', settings: s, body });
}

export function privacy({ settings: s }) {
  const body = `
<article class="wrap prose">
  <h1>privacy &amp; texts<span class="c-gold">.</span></h1>
  <p>${esc(s.orgName)} collects only what you choose to give us through the forms on this site, so we can pray for you, follow up with you, and tell you when we gather.</p>

  <h2>What we collect</h2>
  <p>Your first name, and if you give them, your last name, phone number, email, a parent's phone number, the things you tap (like "I want to grow"), and anything you write to us. Anonymous prayer requests are stored without any name, number or other identifying details.</p>

  <h2>Who sees it</h2>
  <p>Only Alabaster leaders and trained crew members who follow up with people. Prayer requests are seen only by the prayer team. We never sell, rent or share your information with anyone else.</p>

  <h2>How long we keep it</h2>
  <p>Prayer requests, including anonymous ones, are deleted automatically after 60 days. Contact details are kept until you ask us to remove them. Email <a href="mailto:${esc(s.email)}">${esc(s.email)}</a> any time to see, change or delete what we have.</p>

  <h2>Under 18</h2>
  <p>We don't text people under 18 directly. If you tell us you're under 18, we follow up through a parent, guardian or youth leader. We don't knowingly collect information from children under 13.</p>

  <h2 id="sms">Text message terms</h2>
  <p><b>Program:</b> ${esc(s.orgName)} Light Night reminders and updates.</p>
  <p><b>How you join:</b> by entering your number on a form on this site and choosing to get texts. Consent is not a condition of anything.</p>
  <p><b>What you'll get:</b> reminders before Light Night and occasional updates you asked for (like when The Alabaster Table or a Grow cohort opens). About 6–8 messages a year.</p>
  <p><b>Costs:</b> message and data rates may apply.</p>
  <p><b>Stop any time:</b> reply STOP to any message to unsubscribe. Reply HELP for help, or email <a href="mailto:${esc(s.email)}">${esc(s.email)}</a>.</p>
  <p><b>Your number:</b> we never sell or share mobile numbers or text-message consent with third parties for their marketing.</p>
  <p class="faint" style="margin-top:28px">Last updated ${new Date().toISOString().slice(0, 10)}.</p>
</article>`;
  return layout({ title: 'Privacy & text terms', current: 'privacy', settings: s, body });
}

export function notify({ settings: s }) {
  const body = `
<section class="wrap cols">
  <div class="side"><p class="mono">Stay in the loop</p><h1 class="dot-title" style="font-family:'Doto',monospace;font-weight:900;font-size:clamp(44px,6vw,64px);line-height:1;margin:10px 0 16px">notify me<span class="c-gold">.</span></h1><p class="muted">Pick what you want to hear about. One text when it happens. Nothing else.</p></div>
  <div class="main">
    <form class="form" id="f-notify" data-form="notify" data-done="#d-notify" novalidate>
      <fieldset class="plain"><legend>Text me when</legend>
        <label class="check"><input type="checkbox" name="lists" value="light-night" data-multi data-preselect="light-night"> Light Night is coming up</label>
        <label class="check"><input type="checkbox" name="lists" value="table" data-multi data-preselect="table"> The Alabaster Table launches</label>
        <label class="check"><input type="checkbox" name="lists" value="grow-cohort" data-multi data-preselect="grow"> The next Grow cohort opens</label>
      </fieldset>
      <div class="field-row">
        <div class="field"><label for="n-name">First name</label><input id="n-name" name="firstName" type="text" autocomplete="given-name" required maxlength="60"></div>
        <div class="field"><label for="n-phone">Phone</label><input id="n-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"></div>
      </div>
      <label class="check"><input type="checkbox" name="adultConfirmed" required> I'm 18 or older <span class="faint" style="font-size:14px">(under 18? ask a parent to sign up)</span></label>
      <input type="hidden" name="smsConsent" value="yes">
      ${smsConsent(s)}
      ${hp}
      <p class="form-error" role="alert" hidden></p>
      <div><button class="btn btn-solid" type="submit">Notify me</button></div>
    </form>
    <div class="done" id="d-notify" hidden>
      <p class="dot-type" tabindex="-1">you're in<span class="c-gold">.</span></p>
      <p class="muted" style="margin-top:14px">We'll text you when it happens. Reply STOP any time.</p>
    </div>
  </div>
</section>
<script>
  (function(){var l=new URLSearchParams(location.search).get('list')||'light-night';document.querySelectorAll('[data-preselect]').forEach(function(c){if(c.getAttribute('data-preselect')===l)c.checked=true});})();
</script>`;
  return layout({ title: 'Notify me', current: 'notify', settings: s, body });
}

/** Full-screen slide for the projector at Light Night. */
export function screen({ settings: s }) {
  const body = `
<div class="dots" style="min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:6vh 6.5vw;box-sizing:border-box;font-size:1.6vw">
  <div class="mono" style="display:flex;justify-content:space-between;font-size:1.25vw"><span style="display:flex;align-items:center;gap:.7vw"><span class="status-dot bg-gold" style="width:.75vw;height:.75vw"></span>Light Night · Live</span><span>alabaster</span></div>
  <div style="display:flex;align-items:center;justify-content:space-between;gap:5vw">
    <div>
      <div class="dot-type" style="font-size:7.8vw;line-height:.92">let us pray<br>with you<span class="c-gold">.</span></div>
      <ol style="list-style:none;margin:3.3vw 0 0;padding:0;display:flex;flex-direction:column;gap:1.1vw;font-size:2.1vw;font-weight:500">
        <li><span class="dot-type c-gold" style="display:inline-block;width:3.4vw">01</span> Ask for prayer</li>
        <li><span class="dot-type c-gold" style="display:inline-block;width:3.4vw">02</span> Share something anonymously</li>
        <li><span class="dot-type c-amber" style="display:inline-block;width:3.4vw">03</span> Stay connected</li>
      </ol>
    </div>
    <div style="flex:0 0 27vw;text-align:center">
      <div style="padding:2vw;border:2px solid var(--line2);border-radius:2vw;background:#0E0E0E"><img src="/img/qr-tonight.png" alt="QR code linking to alabasterchurch.org/tonight" style="width:100%"></div>
      <div style="font-family:'Geist Mono',monospace;font-size:1.55vw;margin-top:1.4vw">alabasterchurch.org/tonight</div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;border-top:1px solid var(--line2);padding-top:1.7vw;font-size:1.55vw" class="soft"><span>Phones out for this one. Then back to Jesus.</span><span class="mono" style="font-size:1.15vw">Only the prayer team sees your requests</span></div>
</div>`;
  return layout({ title: 'Light Night screen', current: 'bare', settings: s, body, noindex: true, extraHead: '<script>document.documentElement.setAttribute("data-theme","dark")</script>' });
}

export function notFound({ settings: s }) {
  const body = `<section class="wrap" style="padding-top:120px;padding-bottom:160px"><p class="mono">404</p><h1 class="dot-type" style="font-size:clamp(56px,9vw,120px);letter-spacing:0;margin:18px 0 24px">lost<span class="c-gold">.</span></h1><p class="lead">That page isn't here. <a href="/">Head home</a>.</p></section>`;
  return layout({ title: 'Not found', current: '', settings: s, body, noindex: true });
}
