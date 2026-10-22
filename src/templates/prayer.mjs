import { esc, dotDate, dotIcon, layout, tbd } from '../lib.mjs';

const hp = '<div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>';

export default function prayer({ settings: s }) {
  const ph = s.prayerHour;
  const body = `
<section class="page-hero dots">
  <div class="wrap inner">
    ${dotIcon('flame', 'gold', 'icon-lg')}
    <div class="text">
      <p class="mono">Behold · Phase 03</p>
      <h1 style="margin-top:18px">the prayer room<span class="c-gold">.</span></h1>
      <p class="lead">A resting place for His presence. One day we want to minister to the Lord day and night. Right now, we're starting with one faithful hour a month.</p>
    </div>
  </div>
</section>

<section class="rule-b" aria-labelledby="ph-next">
  <div class="wrap next">
    <div><h2 id="ph-next" class="mono">Next prayer hour</h2><div class="big-date">${ph.date ? dotDate(ph.date) : 'soon'}</div></div>
    <dl class="facts">
      <dt>When</dt><dd>${tbd(ph.time)}</dd>
      <dt>Where</dt><dd>${tbd(ph.location, 'Location TBD')}</dd>
      <dt>Who</dt><dd>Anyone. Come late, leave early.</dd>
    </dl>
  </div>
</section>

<section class="wrap cols" aria-labelledby="hour-title">
  <div class="side">
    <p class="mono">The hour</p>
    <h2 id="hour-title" style="font-size:44px;margin-top:12px">Simple on purpose.</h2>
    <img class="bw" src="/img/p15.jpg" alt="Three people praying at microphones, eyes closed, hands on their hearts" loading="lazy" style="margin-top:32px;width:100%;aspect-ratio:3/2;object-fit:cover">
  </div>
  <ol class="main list-rows">
    <li><span class="n c-teal">:00</span><span style="flex:1 1 360px"><b>Worship.</b> <span class="muted">Simple, unhurried songs. Minister to the Lord first.</span></span></li>
    <li><span class="n c-violet">:15</span><span style="flex:1 1 360px"><b>A Psalm, read slowly.</b> <span class="muted">We pray the words back to God.</span></span></li>
    <li><span class="n c-gold">:25</span><span style="flex:1 1 360px"><b>Silence.</b> <span class="muted">Ten minutes to be still and listen. It gets easier.</span></span></li>
    <li><span class="n c-amber">:35</span><span style="flex:1 1 360px"><b>Intercession.</b> <span class="muted">We pray for Richmond, our campuses, and every request that came in.</span></span></li>
    <li><span class="n">:55</span><span style="flex:1 1 360px"><b>Blessing.</b> <span class="muted">We send each other out.</span></span></li>
  </ol>
</section>

<section class="rule-t rule-b" aria-label="How the room works">
  <div class="wrap guidelines">
    <div><p class="mono small faint" style="margin-bottom:8px">Phones</p><p>Silenced and away. The room stays reverent.</p></div>
    <div><p class="mono small faint" style="margin-bottom:8px">The mic</p><p>By invitation. You never have to pray out loud.</p></div>
    <div><p class="mono small faint" style="margin-bottom:8px">Praying for others</p><p>Only with permission, always gently.</p></div>
    <div><p class="mono small faint" style="margin-bottom:8px">The point</p><p>We come to worship Jesus, not to perform.</p></div>
  </div>
</section>

<section id="request" aria-labelledby="req-title">
  <div class="wrap cols">
    <div class="side"><p class="mono">Any day</p><h2 id="req-title" class="dot-title">send a request.</h2><p class="muted">We'll pray over it at the next prayer hour. You can stay anonymous.</p></div>
    <div class="main">
      <form class="form" id="f-request" data-form="prayer" data-done="#d-request" novalidate>
        <div class="field"><label for="r-msg">What can we pray for?</label><textarea id="r-msg" name="message" rows="5" required maxlength="2000" placeholder="As much or as little as you want."></textarea></div>
        <label class="check"><input type="checkbox" name="anonymous" checked data-reveal="#r-named" data-reveal-when="unchecked"> Keep it anonymous</label>
        <div class="reveal" id="r-named" hidden>
          <div class="field-row">
            <div class="field"><label for="r-name">First name</label><input id="r-name" name="firstName" type="text" autocomplete="given-name" maxlength="60"></div>
            <div class="field" id="r-contact-wrap"><label for="r-contact">Phone or email</label><input id="r-contact" name="contact" type="text" autocomplete="tel" maxlength="120"></div>
          </div>
          <label class="check"><input type="checkbox" name="followUp"> I'd like someone to follow up with me</label>
          <label class="check"><input type="checkbox" name="isMinor" data-reveal="#r-parent" data-conceal="#r-contact-wrap"> I'm under 18 (we'll follow up through a parent)</label>
          <div class="field" id="r-parent" hidden><label for="r-parent-phone">Parent or guardian's phone</label><input id="r-parent-phone" name="parentPhone" type="tel" inputmode="tel" maxlength="20"><p class="form-note" style="margin-top:8px">We'll check in through them, not with you directly. That's how we keep everyone safe.</p></div>
          <p class="form-note">Only the prayer team sees your name. It's never posted or shared.</p>
        </div>
        ${hp}
        <p class="form-error" role="alert" hidden></p>
        <div class="btn-row" style="align-items:center"><button class="btn btn-solid" type="submit">Send to the prayer team</button><span class="form-note">In crisis? Call or text 988 any time.</span></div>
      </form>
      <div class="done" id="d-request" hidden>
        <p class="dot-type" tabindex="-1">received<span class="c-gold">.</span></p>
        <p class="soft" style="margin:16px 0 24px">It's with the prayer team. You're not carrying this alone.</p>
        <button class="btn btn-line" type="button" data-again="#f-request">Send another</button>
      </div>
    </div>
  </div>
</section>

<section class="rule-t">
  <a class="wrap row-link" href="/join/" style="border:0;padding-top:48px;padding-bottom:48px">
    <span class="title">Want to lead part of the hour?</span>
    <span class="desc">We train young prayer leaders, one section at a time. <span class="c-gold" style="font-weight:600">Join the prayer team →</span></span>
  </a>
</section>`;
  return layout({ title: 'The Prayer Room', description: 'One faithful hour of worship, Scripture and prayer a month. Send a prayer request any day.', current: 'prayer', settings: s, body });
}
