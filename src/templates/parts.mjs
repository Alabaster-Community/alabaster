import { esc, smsConsent } from '../lib.mjs';

/** One-line "get texts" band: first name + phone, with the required consent wording. */
export function quickTextForm(s, { id, list, label, button }) {
  return `<div class="wrap">
  <form class="signup" id="${id}" data-form="notify" data-done="#${id}-done" novalidate>
    <label class="label-big" for="${id}-phone">${esc(label)}</label>
    <div class="fields">
      <label class="sr-only" for="${id}-name">First name</label>
      <input id="${id}-name" name="firstName" type="text" autocomplete="given-name" placeholder="First name" required maxlength="60">
      <input id="${id}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="Phone number" required maxlength="20">
      <button class="btn btn-solid" type="submit">${esc(button)}</button>
    </div>
    <input type="hidden" name="lists" value="${esc(list)}">
    <input type="hidden" name="smsConsent" value="yes">
    <div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div style="flex-basis:100%;display:flex;flex-direction:column;gap:6px">
      <label class="check"><input type="checkbox" name="adultConfirmed" required> I'm 18 or older <span class="faint" style="font-size:14px">(under 18? ask a parent to sign up for the texts)</span></label>
      ${smsConsent(s)}
    </div>
    <p class="form-error" role="alert" hidden></p>
  </form>
  <div class="done signup" id="${id}-done" hidden>
    <p class="label-big" tabindex="-1"><span class="dot-type" style="font-size:32px">you're in<span class="c-gold">.</span></span></p>
    <p class="muted">We'll text you before the next night. Reply STOP any time.</p>
  </div>
</div>`;
}

/** Under-18 note used in several forms. */
export const minorNote = '<p class="form-note">Under 18? We keep in touch through a parent or youth leader. That\'s how we keep everyone safe.</p>';
