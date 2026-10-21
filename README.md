# alabasterchurch.org

The Alabaster website: dot-matrix design, dark/light mode, forms that feed a contact list, a crew follow-up screen, and an editing screen at `/admin`. Built with Astro (one dependency). It runs free on Vercel Hobby (donations are allowed there) plus Supabase's free tier.

## How it fits together

| Piece | Where | What it does |
| --- | --- | --- |
| Pages | `src/pages/*.astro` → `astro build` → `dist/` | Each page wraps a template in `src/templates/`; `src/components/Page.astro` adds the head, header and footer |
| Content | `content/*.json` | Light Night dates, prayer hour, playlist, FAQ, beliefs, giving links, projector slides |
| Editor | `/admin` (Decap CMS, loaded from unpkg) | Edits the content files; every Publish is a GitHub commit, and Vercel rebuilds in about a minute |
| Forms | `public/site.js` → `api/submit.js` → Supabase | Prayer, anonymous, connect, crew, coffee and "notify me" |
| Crew screen | `/crew-dashboard` + `public/crew.js` | Magic-link sign-in; shows new cards, flags anything older than 48 hours, marks followed up |
| Keep-alive | `api/keepalive.js` + cron in `vercel.json` | One tiny read a day so the free Supabase project never pauses |
| Projector slides | `/screen/…` | Full-screen QR slides and the Light Night dates slide (see below) |

### Pages
`/` · `/tonight` (what the QR opens) · `/prayer-room` · `/grow` · `/join` · `/beliefs` · `/give` · `/privacy` (includes the text-message terms carriers require) · `/notify?list=table|grow|light-night` · `/screen` · `/screen/give` · `/screen/grow` · `/screen/join` · `/screen/dates` · `/crew-dashboard` · `/admin` · `/calendar.ics`

### Projector slides
Open one full screen on the projector laptop (F11 in Chrome).

- **QR slides** (`/screen/` = tonight, `/screen/give/`, `/screen/grow/`, `/screen/join/`): wording, color and link live in `content/screens.json`, under **Projector slides** in `/admin`. The QR code is generated from the link at build time (`src/qr.mjs`), so changing the link changes the code. Add a slide there and `/screen/<web name>/` appears on the next build.
- **Dates slide** (`/screen/dates/`): shows the Light Night dates from `content/events.json`, the same list the home page uses (**Light Night dates** in `/admin`). The next one is lifted, glowing, with a countdown; past ones are struck through. The page re-checks the date in the browser every 10 minutes, so it stays right between rebuilds and on a projector left on overnight. Its QR link and wording are in the **Dates slide** section of Projector slides.

## One-time setup

### 1. Vercel
Add New Project → import `Andradom-Software-Solutions/alabaster`. Vercel detects Astro; leave Root Directory empty. `vercel.json` adds the daily cron and headers. Move the domain over from the old project when you're ready. Add these environment variables (Production and Preview):

| Variable | From |
| --- | --- |
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | Same page, "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, "service_role" key. Server only, never in the browser. |
| `CRON_SECRET` | Any long random string; Vercel sends it to the keep-alive cron |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Step 3 below |

### 2. Supabase (free)
1. Create a project and run `supabase/schema.sql` in the SQL Editor.
2. Database → Extensions → enable **pg_cron**, then run the `cron.schedule(...)` line at the bottom of the schema so prayer requests are deleted after 60 days.
3. Add yourself to the crew list: `insert into crew_members (email, name) values ('you@…', 'Michael');`
4. Authentication → URL Configuration: set Site URL to `https://alabasterchurch.org` and add `https://alabasterchurch.org/crew-dashboard/` as a redirect URL.
5. Authentication → Providers → Email: turn off "Allow new users to sign up". The dashboard only signs in existing users. Create crew users under Authentication → Users → Invite, and add their emails to `crew_members`.

### 3. The editor at /admin (Decap CMS)
1. GitHub → Settings → Developer settings → OAuth Apps → New.
   - Homepage URL: `https://alabasterchurch.org`
   - Authorization callback URL: `https://alabasterchurch.org/api/callback`
2. Put the Client ID and a new Client Secret into Vercel as `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.
3. Anyone who edits needs a GitHub account with write access to this repo (Settings → Collaborators).

Sign-in works on the production domain. On preview deploys, edit `content/*.json` directly.

## Local preview

```bash
npm install
npm run dev                       # http://localhost:4321 (pages only)
npm test                          # form validation + API tests
npm run build && MOCK=1 node scripts/serve.mjs   # built site + forms, with a fake Supabase in memory
```

## Changing pages
Each page's markup lives in `src/templates/*.mjs` as a template string. To move a page to a normal Astro component, rewrite its template as `src/pages/<name>.astro` using `<Page>` from `src/components/Page.astro`. The rest of the site keeps working while you do it one page at a time.

## Texting (step 5, after Twilio approval)
Forms already collect numbers with the consent wording carriers check for, and `sms_audience` (a view in the schema) is the list to send to: adults who opted in, minus anyone who replied STOP. Still to add once the Twilio sole-proprietor registration is approved: a Twilio STOP/HELP webhook that writes to `sms_opt_outs`, and a scheduled reminder sender.

## Privacy and safety rules built into the code
- Anonymous requests store only the words: no name, number or page.
- If someone says they're under 18, their own number is discarded. Follow-up goes through a parent, and minors are never added to a text list.
- Text-list sign-ups require "I'm 18 or older" plus the disclosure (rates, STOP/HELP, link to the terms).
- Prayer requests are visible only to crew with `can_see_prayer`, and are deleted after 60 days.
- The browser can never read or write the database directly. Only signed-in crew can read, and they can change follow-up fields only.
