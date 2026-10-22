import { esc, layout, smsConsent } from '../lib.mjs';

const hp = '<div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>';

export default function tonight({ settings: s }) {
  const body = `
<div class="narrow">
  <header style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 24px">
    <a class="brand" href="/"><img src="/img/logo-mark.png" alt="" width="24" height="24"><span style="font-size:19px">alabaster</span><span class="sr-only">home</span></a>
    <span class="mono small" style="display:flex;align-items:center;gap:6px"><span class="status-dot bg-gold"></span>Light Night</span>
  </header>

  <h1 class="dot-type" style="font-size:44px;line-height:1;margin:8px 0">tonight<span class="c-gold">.</span></h1>
  <p class="soft" style="margin-bottom:24px">How can we be with you? Pick one. It takes less than a minute.</p>

  <div role="tablist" aria-label="What would you like to do?" class="tabs">
    <button type="button" role="tab" id="tab-pray" data-tab="pray" aria-controls="panel-pray" aria-selected="true">Pray for me</button>
    <button type="button" role="tab" id="tab-anon" data-tab="anon" aria-controls="panel-anon" aria-selected="false">Anonymous</button>
    <button type="button" role="tab" id="tab-connect" data-tab="connect" aria-controls="panel-connect" aria-selected="false">Connect</button>
  </div>

  <section id="panel-pray" role="tabpanel" aria-labelledby="tab-pray">
    <form class="form" id="f-pray" data-form="prayer" data-done="#d-pray" novalidate>
      <div class="field"><label for="p-name">First name</label><input id="p-name" name="firstName" type="text" autocomplete="given-name" required maxlength="60"></div>
      <div class="field"><label for="p-msg">How can we pray?</label><textarea id="p-msg" name="message" rows="5" required maxlength="2000" placeholder="As much or as little as you want to share."></textarea></div>
      <fieldset class="plain">
        <legend>Tonight</legend>
        <label class="check"><input type="checkbox" name="prayInPerson"> I'd like someone to pray with me in person</label>
        <label class="check"><input type="checkbox" name="followUp" data-reveal="#p-follow"> Text me this week to check in</label>
      </fieldset>
      <div class="reveal" id="p-follow" hidden>
        <label class="check"><input type="checkbox" name="isMinor" data-reveal="#p-parent" data-conceal="#p-phone-wrap"> I'm under 18</label>
        <div class="field" id="p-phone-wrap"><label for="p-phone">Your phone</label><input id="p-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20"></div>
        <div class="field" id="p-parent" hidden><label for="p-parent-phone">Parent or youth leader's phone</label><input id="p-parent-phone" name="parentPhone" type="tel" inputmode="tel" maxlength="20"><p class="form-note" style="margin-top:8px">We'll check in through them. That's how we keep everyone safe.</p></div>
        <p class="form-note">Someone from the prayer team will text you personally. This doesn't add you to any list.</p>
      </div>
      <p class="form-note">Only the Light Night prayer team sees this. It's never posted or shared.</p>
      ${hp}
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-solid" type="submit">Send to the prayer team</button>
    </form>
    <div class="done" id="d-pray" hidden>
      <p class="dot-type" tabindex="-1" style="margin-top:40px">got it<span class="c-gold">.</span></p>
      <p style="margin:20px 0 8px;font-size:22px;font-weight:500">Someone is praying for you right now.</p>
      <p class="muted" style="margin-bottom:32px">If you asked for prayer in person, look for someone with a prayer team lanyard near the front.</p>
      <p class="mono small" style="margin-bottom:20px">Now put your phone away. Jesus is here.</p>
      <button class="btn btn-line" type="button" data-again="#f-pray">Send another</button>
    </div>
  </section>

  <section id="panel-anon" role="tabpanel" aria-labelledby="tab-anon" hidden>
    <form class="form" id="f-anon" data-form="anonymous" data-done="#d-anon" novalidate>
      <p style="border:1px dashed var(--line2);border-radius:14px;padding:16px;font-size:15px" class="soft">No name. No number. Nothing that identifies you. The prayer team will pray over it tonight.</p>
      <div class="field"><label for="a-msg">What's on your heart?</label><textarea id="a-msg" name="message" rows="7" required maxlength="2000" placeholder="Write it out. Nobody will know it's you."></textarea></div>
      <p class="form-note">If you or someone else is in danger, please tell a prayer team member tonight, or call or text 988 any time.</p>
      ${hp}
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-solid" type="submit">Send anonymously</button>
    </form>
    <div class="done" id="d-anon" hidden>
      <p class="dot-type" tabindex="-1" style="margin-top:40px">got it<span class="c-gold">.</span></p>
      <p style="margin:20px 0 8px;font-size:22px;font-weight:500">It's with the prayer team, and nobody knows it's you.</p>
      <p class="muted" style="margin-bottom:32px">You're not alone in this. God sees you, and so do we.</p>
      <p class="mono small" style="margin-bottom:20px">Now put your phone away. Jesus is here.</p>
      <button class="btn btn-line" type="button" data-again="#f-anon">Send another</button>
    </div>
  </section>

  <section id="panel-connect" role="tabpanel" aria-labelledby="tab-connect" hidden>
    <form class="form" id="f-connect" data-form="connect" data-done="#d-connect" novalidate>
      <div class="field"><label for="c-name">First name</label><input id="c-name" name="firstName" type="text" autocomplete="given-name" required maxlength="60"></div>
      <label class="check boxed"><input type="checkbox" name="isMinor" data-reveal="#c-parent" data-conceal="#c-adult"> I'm under 18</label>
      <div id="c-adult" class="form" style="gap:18px">
        <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20"></div>
        <div class="field"><label for="c-email">Email (optional)</label><input id="c-email" name="email" type="email" autocomplete="email" maxlength="120"></div>
      </div>
      <div class="field" id="c-parent" hidden><label for="c-parent-phone">Parent or youth leader's phone</label><input id="c-parent-phone" name="parentPhone" type="tel" inputmode="tel" maxlength="20"><p class="form-note" style="margin-top:8px">We'll stay in touch through them. That's how we keep everyone safe.</p></div>
      <fieldset class="plain">
        <legend>Tap any</legend>
        <label class="check"><input type="checkbox" name="lists" value="first-time" data-multi> First time here</label>
        <label class="check"><input type="checkbox" name="lists" value="grow" data-multi> I want to grow</label>
        <label class="check"><input type="checkbox" name="lists" value="serve" data-multi> I want to serve</label>
        <label class="check"><input type="checkbox" name="lists" value="light-night" data-multi> Text me before the next night</label>
      </fieldset>
      ${smsConsent(s)}
      ${hp}
      <p class="form-error" role="alert" hidden></p>
      <button class="btn btn-solid" type="submit">Stay connected</button>
    </form>
    <div class="done" id="d-connect" hidden>
      <p class="dot-type" tabindex="-1" style="margin-top:40px">welcome<span class="c-amber">.</span></p>
      <p style="margin:20px 0 8px;font-size:22px;font-weight:500">Welcome to the family.</p>
      <p class="muted" style="margin-bottom:32px">Someone your age will text you back within 48 hours.</p>
      <p class="mono small" style="margin-bottom:20px">Now put your phone away. Jesus is here.</p>
      <button class="btn btn-line" type="button" data-again="#f-connect">Done</button>
    </div>
  </section>
</div>`;
  return layout({ title: 'Tonight', description: 'Ask for prayer, share anonymously, or stay connected.', current: 'bare', settings: s, body, noindex: true });
}
