// Site content, read from content/*.json (the files the /admin editor saves).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (f) => JSON.parse(readFileSync(join(process.cwd(), 'content', f), 'utf8'));

// "Today" in Richmond, so past Light Nights drop off after each rebuild.
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export const data = {
  today,
  settings: read('settings.json'),
  events: read('events.json'),
  playlist: read('playlist.json'),
  faq: read('faq.json'),
  beliefs: read('beliefs.json'),
  courses: read('courses.json')
};
