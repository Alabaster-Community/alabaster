import { esc, dotDate, dotIcon, layout, upcoming, venueLine, tbd } from '../lib.mjs';
import { quickTextForm } from './parts.mjs';

export default function home({ settings: s, events, playlist, faq, today, courses }) {
  const nights = upcoming(events.lightNights, today);
  const all = [...events.lightNights].sort((a, b) => a.date.localeCompare(b.date));
  const next = nights[0] || all[all.length - 1];
  const year = next ? next.date.slice(0, 4) : '';
  const hasPlaylist = playlist.songs.length || s.playlist.spotify || s.playlist.appleMusic || s.playlist.youtube;

  const body = `
<section class="dots" aria-labelledby="hero-title">
  <div class="wrap hero">
    <div class="hero-text">
      <div class="mono eyebrow"><span class="status-dot bg-gold"></span>A worship + prayer family · ${esc(s.city)}</div>
      <h1 id="hero-title">love jesus well<span class="c-gold">.</span></h1>
      <p class="lead">${esc(s.tagline)}</p>
      <div class="btn-row">
        <a class="btn btn-solid" href="#next">Come to Light Night</a>
        <a class="btn btn-line" href="#first-time">First time? Start here</a>
      </div>
    </div>
    <figure class="phone-frame">
      <div class="screen">
        <video class="bw" data-autoplay autoplay muted loop playsinline preload="metadata" poster="/media/light-night-poster.jpg" aria-label="A 40-second clip from a Light Night: worship, a prayer team, people kneeling and praying for each other">
          <source src="/media/light-night.mp4" type="video/mp4">
        </video>
      </div>
      <figcaption class="mono small faint">▶ What a Light Night looks like</figcaption>
    </figure>
  </div>
</section>

<section id="next" class="rule-t rule-b" aria-labelledby="next-title">
  <div class="wrap next">
    <div>
      <h2 id="next-title" class="mono">Next Light Night</h2>
      <div class="big-date" data-next-date>${next ? dotDate(next.date) : 'soon'}</div>
    </div>
    <dl class="facts">
      <dt>When</dt><dd>Saturday, ${esc(next ? next.time : s.lightNight.time)}</dd>
      <dt>Where</dt><dd>${venueLine(s.lightNight, next)}</dd>
      <dt>Cost</dt><dd>Free, always</dd>
      <dt>Bring</dt><dd>A friend</dd>
      <dt></dt><dd><a href="/calendar.ics" style="font-weight:600">Add to calendar →</a></dd>
    </dl>
  </div>
</section>

<section class="wrap split" aria-labelledby="about-title">
  <img class="bw tall-photo" src="/img/p04.jpg" alt="A young man crouched low in prayer, microphone in hand, his Bible and handwritten notes open on the floor" width="935" height="1400" loading="lazy">
  <div>
    <p class="mono">What we're about</p>
    <h2 id="about-title">Presence over performance<span class="c-gold">.</span></h2>
    <p class="soft" style="margin-bottom:16px">Nobody's putting on a show. We come to minister to Jesus first: worship, Scripture, prayer, and making room for the Holy Spirit.</p>
    <p class="muted">You can sing, kneel, sit, cry, or just be still. It's all welcome here.</p>
  </div>
</section>

<section class="wrap" aria-labelledby="photos-title" style="padding-bottom:96px">
  <div class="section-head"><h2 id="photos-title">From the last night</h2>${s.lastNight.caption ? `<span class="mono small faint">${esc(s.lastNight.caption)}</span>` : ''}</div>
  <div class="photo-row">
    <figure style="flex:1.2 1 320px"><img class="bw" src="/img/p09.jpg" alt="A young woman with her hands open and eyes down during worship" loading="lazy"><figcaption>01 · Worship</figcaption></figure>
    <figure style="flex:1.6 1 380px"><img class="bw" src="/img/p07.jpg" alt="Hands raised across the room during worship, seen from behind" loading="lazy"><figcaption>02 · Every church, one room</figcaption></figure>
    <figure style="flex:.9 1 260px"><img class="bw" src="/img/p11.jpg" alt="A man in a flannel shirt and cap with both arms raised under string lights" loading="lazy"><figcaption>03 · Response time</figcaption></figure>
  </div>
</section>

<section class="rule-t" aria-labelledby="path-title">
  <div class="wrap" style="padding-top:88px;padding-bottom:72px">
    <h2 id="path-title" class="sr-only">The path</h2>
    <ol class="steps">
      <li><div class="num" aria-hidden="true">01</div><h3>Belong</h3><p>Show up. Get known by name. Nobody sits alone.</p></li>
      <li><div class="num" aria-hidden="true">02</div><h3>Become</h3><p>Heal and grow in a formation track.</p></li>
      <li><div class="num" aria-hidden="true">03</div><h3>Behold</h3><p>Worship and pray when no one's watching.</p></li>
      <li><div class="num" aria-hidden="true">04</div><h3>Be sent</h3><p>Carry His heart to your school, job and city.</p></li>
    </ol>
  </div>
</section>

<section class="wrap" aria-label="Ways to come close" style="padding-top:24px;padding-bottom:96px">
  <div class="rows">
    <a class="row-link" href="/prayer-room/">${dotIcon('flame', 'gold')}<span class="title">Prayer Room</span><span class="desc">One hour a month. Phones off. Worship, Scripture, and praying for Richmond.</span><span class="arrow" aria-hidden="true">→</span></a>
    <a class="row-link" href="/grow/">${dotIcon('sprout', 'teal')}<span class="title">Grow</span><span class="desc">Start with coffee. Go deeper in a formation track.</span><span class="arrow" aria-hidden="true">→</span></a>
    <a class="row-link" href="/join/">${dotIcon('plus', 'violet')}<span class="title">Join the crew</span><span class="desc">Worship, hosting, content and prayer team. Bring your gift.</span><span class="arrow" aria-hidden="true">→</span></a>
  </div>
</section>

<section id="table" class="table-section" aria-labelledby="table-title">
  <div class="wrap inner">
    <div class="art"><img src="/img/table-artwork.jpg" alt="The Alabaster Table: a painted still life of a tipped vessel spilling golden oil across a table, beside torn bread and a glass of wine" loading="lazy"></div>
    <div class="copy">
      <div class="label"><span class="status-dot" style="background:#C9A04A"></span>A podcast from Alabaster · ${esc(s.table.status)}</div>
      <h2 id="table-title">The Alabaster Table</h2>
      <p class="tagline">Come hungry. Bring your questions. Leave closer to God.</p>
      <p class="body">Honest conversations about who God is and how to walk with Him. One question, one guest who's lived it, and an open Bible.</p>
      <div class="btn-row">
        <a class="btn btn-gold" href="/notify/?list=table">Get notified at launch</a>
        ${s.table.url ? `<a class="btn btn-line btn-cream" href="${esc(s.table.url)}">Visit The Table →</a>` : ''}
      </div>
    </div>
  </div>
  ${courses && courses.courses.length ? `<div class="wrap menu" aria-labelledby="menu-title">
    <div class="menu-head">
      <h3 id="menu-title"><span class="mono">On the menu</span><span class="menu-table">${esc(courses.table)}</span></h3>
      ${courses.opener ? `<p class="opener"><span class="n">${esc(courses.opener.number)}</span>${esc(courses.opener.title)}<span class="mono small">The opener</span></p>` : ''}
    </div>
    <ol class="courses">
      ${courses.courses.map((c, i) => `<li>
        <div class="course-n mono">Course ${i + 1}</div>
        <h4>${esc(c.name)}</h4>
        <div class="course-topic">${esc(c.topic)}${c.verse ? ` <span>· ${esc(c.verse)}</span>` : ''}</div>
        <ol class="eps">${c.episodes.map((e) => `<li><span class="n">${esc(e.number)}</span><span class="t">${esc(e.title)}<small class="${e.kind === 'Marrow' ? 'k-marrow' : 'k-bread'}">${esc(e.kind)}</small></span></li>`).join('')}</ol>
      </li>`).join('')}
    </ol>
  </div>` : ''}
</section>

<section id="year" class="dots rule-b" aria-labelledby="year-title">
  <div class="wrap" style="padding-top:96px;padding-bottom:96px">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:40px">
      <div><p class="mono">Light Night · every other month</p><h2 id="year-title" class="dot-type" style="font-size:clamp(48px,6vw,76px);letter-spacing:0;margin-top:10px">${esc(year)}<span class="c-amber">.</span></h2></div>
      <div style="display:flex;flex-wrap:wrap;gap:10px 24px;font-weight:600"><a href="/calendar.ics">Add all to calendar →</a>${hasPlaylist ? '<a class="muted" href="#playlist">Light Night playlist ↓</a>' : ''}</div>
    </div>
    <ol class="year-list">
      ${all.filter((e) => e.date.slice(0, 4) === year).map((e) => `<li data-event-date="${e.date}"${next && e.date === next.date ? ' class="is-next"' : ''}>
        <div class="d">${dotDate(e.date)}</div>
        <div style="font-weight:600;margin-top:12px">Light Night</div>
        <div class="muted" style="font-size:15px">Saturday · ${esc(e.time)}${e.note ? ` · ${esc(e.note)}` : ''}</div>
        <span class="pill pill-amber" data-next-pill style="margin-top:12px"${next && e.date === next.date ? '' : ' hidden'}>Next</span>
      </li>`).join('')}
    </ol>
  </div>
</section>

${hasPlaylist ? `<section id="playlist" class="rule-b" aria-labelledby="playlist-title">
  <div class="wrap cols">
    <div class="side">
      <p class="mono">The Light Night playlist</p>
      <h2 id="playlist-title" class="dot-type" style="font-size:clamp(48px,6vw,72px);letter-spacing:0;margin:10px 0 16px">on repeat<span class="c-amber">.</span></h2>
      <p class="muted" style="margin-bottom:28px;max-width:360px">The songs we sing together, so the night keeps going all week.</p>
      <div class="btn-row">
        ${s.playlist.spotify ? `<a class="btn btn-line" href="${esc(s.playlist.spotify)}">Spotify</a>` : ''}
        ${s.playlist.appleMusic ? `<a class="btn btn-line" href="${esc(s.playlist.appleMusic)}">Apple Music</a>` : ''}
        ${s.playlist.youtube ? `<a class="btn btn-line" href="${esc(s.playlist.youtube)}">YouTube</a>` : ''}
      </div>
    </div>
    <div class="main">${playlist.songs.length ? `<ol class="tracks">${playlist.songs.map((t, i) => `<li><span class="n${i === 0 ? ' c-amber' : ''}">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(t.title)}</span><span class="muted" style="font-size:16px">${esc(t.artist)}</span></li>`).join('')}</ol>` : ''}</div>
  </div>
</section>` : ''}

<section id="first-time" aria-labelledby="ft-title">
  <div class="wrap cols">
    <div class="side"><p class="mono">First time?</p><h2 id="ft-title" class="dot-title">no pressure.</h2></div>
    <div class="main faq">
      ${[...faq.items, { q: 'Where do I park?', a: s.lightNight.parking, fromSettings: true }]
        .map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${f.fromSettings ? tbd(f.a, 'Parking details TBD') : esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>

<section id="stay-close" class="rule-t" aria-label="Get text reminders">
  ${quickTextForm(s, { id: 'home-text', list: 'light-night', label: 'Get a text before every night.', button: 'Subscribe' })}
</section>

<script type="application/json" id="events-data">${JSON.stringify(all.map((e) => ({ date: e.date })))}</script>
`;
  return layout({ current: 'home', settings: s, body });
}
