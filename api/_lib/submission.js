// Turns a raw form post into a database row. Pure function so it can be tested without a server.

const TYPES = ['prayer', 'anonymous', 'connect', 'crew', 'coffee', 'notify'];
const LISTS = ['light-night', 'table', 'grow-cohort', 'first-time', 'grow', 'serve'];
const ROLES = ['Worship', 'Hosting', 'Prayer team', 'Content', 'Dev crew', 'Not sure yet'];

export class FormError extends Error {}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const truthy = (v) => v === true || v === 'yes' || v === 'true' || v === 'on';
const arr = (v) => (Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : []);

/** US numbers to E.164 (+1XXXXXXXXXX). Returns '' for empty, throws for invalid. */
export function normalizePhone(raw, label = 'phone number') {
  const s = str(raw, 30);
  if (!s) return '';
  const digits = s.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  throw new FormError(`Please check the ${label}.`);
}

export function buildRecord(input) {
  if (!input || typeof input !== 'object') throw new FormError('Missing form data.');
  let type = str(input.type, 20);
  if (!TYPES.includes(type)) throw new FormError('Unknown form.');
  if (type === 'prayer' && truthy(input.anonymous)) type = 'anonymous';

  const isMinor = truthy(input.isMinor);
  const lists = arr(input.lists).map((l) => str(l, 30)).filter((l) => LISTS.includes(l));
  const message = str(input.message, 2000);

  // Anonymous requests: keep only the words. No name, number, page or anything identifying.
  if (type === 'anonymous') {
    if (!message) throw new FormError('Please write something to pray for.');
    return { type, message, lists: [], details: {}, is_minor: false, sms_consent: false };
  }

  const firstName = str(input.firstName, 60);
  const record = {
    type,
    first_name: firstName || null,
    last_name: str(input.lastName, 60) || null,
    email: str(input.email, 120) || null,
    contact: str(input.contact, 120) || null,
    message: message || null,
    is_minor: isMinor,
    lists,
    details: {},
    sms_consent: false,
    phone: null,
    parent_phone: null
  };

  const phone = normalizePhone(input.phone);
  const parentPhone = normalizePhone(input.parentPhone, "parent's phone number");
  // Never keep a minor's own number; we contact them through a parent.
  record.phone = isMinor ? null : phone || null;
  record.parent_phone = parentPhone || null;

  const page = str(input.page, 60);
  if (page) record.details.page = page;
  if (truthy(input.prayInPerson)) record.details.prayInPerson = true;
  if (truthy(input.followUp)) record.details.followUp = true;
  const roles = arr(input.roles).map((r) => str(r, 30)).filter((r) => ROLES.includes(r));
  if (roles.length) record.details.roles = roles;
  const nights = arr(input.nights).map((n) => str(n, 10)).filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n));
  if (nights.length) record.details.nights = nights;

  const needName = () => { if (!firstName) throw new FormError('Please add your first name.'); };
  const needReach = () => {
    if (isMinor ? !record.parent_phone : !record.phone) {
      throw new FormError(isMinor ? "Please add a parent or youth leader's phone number." : 'Please add your phone number.');
    }
  };

  switch (type) {
    case 'prayer':
      if (!message) throw new FormError('Please write something to pray for.');
      if (record.details.followUp && !record.phone && !record.parent_phone && !record.contact) {
        throw new FormError('Add a phone number so we can check in, or uncheck "text me".');
      }
      break;
    case 'connect':
      needName(); needReach();
      record.sms_consent = !isMinor && lists.includes('light-night');
      break;
    case 'crew':
      needName();
      if (!record.last_name) throw new FormError('Please add your last name.');
      needReach();
      break;
    case 'coffee':
      needName(); needReach();
      break;
    case 'notify':
      needName();
      if (isMinor || !truthy(input.adultConfirmed)) throw new FormError('Text updates are for 18 and older. Ask a parent to sign up.');
      if (!record.phone) throw new FormError('Please add your phone number.');
      if (!lists.length) throw new FormError('Pick at least one thing to hear about.');
      record.sms_consent = truthy(input.smsConsent);
      break;
  }
  return record;
}
