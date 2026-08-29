import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { shell, pageHero, ctaSection, clientsStrip, sideMenu, siteCss, siteJs, SITE, IC } from './src/layout.mjs';
import { PRICES as PRICE_GROUPS } from './src/prices.mjs';

const SITE_CONTENT = JSON.parse(readFileSync('data/site-content.json', 'utf8'));
const LASTMOD = JSON.parse(readFileSync('data/lastmod.json', 'utf8'));

/* ---------- internal auto-linker (on-page SEO) ---------- */
const LINK_MAP = [
  ['לידים לביטוח', 'קניית-לידים/לידים-לביטוח/'],
  ['לידים למשכנתאות', 'קניית-לידים/לידים-למשכנתאות/'],
  ['לידים להלוואות', 'קניית-לידים/לידים-להלוואות/'],
  ['לידים להחזרי מס', 'קניית-לידים/לידים-להחזרי-מס/'],
  ['לידים לרואי חשבון', 'לידים-לרואי-חשבון/'],
  ['קניית לידים', 'קניית-לידים/'],
  ['חברת לידים', 'חברת-לידים/'],
  ['ספק לידים', 'חברת-לידים/'],
  ['מחירון לידים', 'מחירון-לידים/'],
  ['לידים חמים', 'קניית-לידים/'],
  ['לידים איכותיים', 'קניית-לידים/'],
  ['שיווק דיגיטלי', 'שיווק-דיגיטלי/'],
  ['קידום ממומן בגוגל', 'קידום-בגוגל/'],
  ['קידום אתרים', 'קידום-אתרים-seo/'],
  ['בניית אתרים', 'בניית-אתרים/'],
  ['דפי נחיתה', 'דפי-נחיתה/'],
  ['דף נחיתה', 'דפי-נחיתה/'],
  ['מודל CPL', 'חברת-לידים/'],
  ['החזר על ההשקעה', 'מחשבון-roi-ללידים/'],
  ['ROI', 'מחשבון-roi-ללידים/'],
  ['ניהול לידים', 'מערכת-ניהול-לידים/'],
  ['מערכת CRM', 'מערכת-ניהול-לידים/'],
  ['אוטומציות', 'אוטומציות-שיווק/'],
  /* Added because the crawl found these earning no editorial link at all —
     they were reachable only from the menu, which search engines discount. */
  ['פיתוח אפליקציות', 'פיתוח-אפליקציות/'],
  ['אפליקציה לעסק', 'פיתוח-אפליקציות/'],
  ['סוכני AI', 'סוכני-ai/'],
  ['סוכן AI', 'סוכני-ai/'],
  ['בינה מלאכותית', 'סוכני-ai/'],
];
/* Destinations that the crawl found starved of editorial links. They are tried
   before the rest, because the six-link budget on a page was always being spent
   on the lead pages — which already have more inbound links than they need —
   before these were ever reached. */
const LINK_PRIORITY = new Set([
  'שיווק-דיגיטלי/',
  'פיתוח-אפליקציות/',
  'סוכני-ai/',
]);

function autolink(html, root, selfPath) {
  const used = new Set();
  const order = [
    ...LINK_MAP.filter(([, t]) => LINK_PRIORITY.has(t)),
    ...LINK_MAP.filter(([, t]) => !LINK_PRIORITY.has(t)),
  ];
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (m, inner) => {
    if (inner.includes('<a ')) return m;
    for (const [phrase, target] of order) {
      if (used.has(target) || target === selfPath + '/' || used.size >= 6) continue;
      const i = inner.indexOf(phrase);
      if (i < 0) continue;
      used.add(target);
      inner = inner.slice(0, i) + `<a href="${root}${target}">` + phrase + '</a>' + inner.slice(i + phrase.length);
      return '<p>' + inner + '</p>';
    }
    return m;
  });
}

/* ---------- deep content from the original WP pages ---------- */
function deepSection(root, slug, title, withSidebar = false) {
  const e = SITE_CONTENT[slug];
  if (!e || !e.blocks || e.blocks.length < 6) return '';
  let html = cleanArticleBlocks(e.blocks);
  if (html.replace(/<[^>]+>/g, '').length < 400) return '';
  html = autolink(html, root, slug);
  const content = `
    <div class="sec-head reveal"><h2>${title || 'המדריך המלא: <span class="gw">כל מה שחשוב לדעת</span>'}</h2></div>
    <div class="prose art-body reveal" style="--d:.06s">${html}</div>`;
  if (!withSidebar) {
    return `
<section class="sec" style="padding-top:0">
  <div class="container">${content}</div>
</section>`;
  }
  return `
<section class="sec" style="padding-top:0">
  <div class="container deep-grid">
    <div>${content}</div>
    ${sideMenu(root, slug)}
  </div>
</section>`;
}

const OUT = '.';
const canon = path => 'https://balilead.co.il/' + (path ? encodeURI(path) + '/' : '');
const GH = 'https://balilead.co.il/';

/* ---------- SEO structured data helpers ---------- */
const crumbsLd = crumbs => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem', position: i + 1, name: c.t.replace(/<[^>]+>/g, ''),
    ...(c.href !== undefined ? { item: canon(c.href.replace(/\/$/, '')) } : {}),
  })),
});
const faqLd = items => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({
    '@type': 'Question', name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
const serviceLd = (name, desc, path) => ({
  '@context': 'https://schema.org', '@type': 'Service',
  name, description: desc, url: canon(path),
  provider: { '@type': 'Organization', name: 'BaliLeads', telephone: '+972-58-470-0706' },
  areaServed: 'IL',
});

function write(path, html) {
  const dir = path ? join(OUT, path) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  const depth = path ? path.split('/').length : 0;
  console.log('built', (path || '(home)') + '  depth=' + depth);
}

const BUILT = [];
/* Pages that carry a noindex directive. Listing a noindexed URL in the sitemap
   tells Google two opposite things about the same page, so the sitemap is built
   from BUILT minus this set. */
const NOINDEX = new Set();

/* =================================================================
   אזור נתונים לעמודים המסחריים

   העמודים האלה כתובים ביד: מבנה סקשנים, prose, הדגשות. חילוץ שלהם
   לבלוקים היה הורס את העיצוב. במקום זה כל עמוד כזה מקבל אזור אחד
   שמגיע מ-data/page-extras.json — הכותרת, התיאור, ופרקים שאפשר
   להוסיף לסוף. החלק המעוצב נשאר בקוד ואיש אינו נוגע בו.

   הקובץ נזרע מעצמו בבנייה הראשונה מהערכים שכבר קיימים כאן, כדי
   שלא תהיה העתקה ידנית של עשרים כותרות ותיאורים.
================================================================= */
const EXTRAS_PATH = 'data/page-extras.json';
const PAGE_EXTRAS = existsSync(EXTRAS_PATH)
  ? JSON.parse(readFileSync(EXTRAS_PATH, 'utf8')) : {};
let extrasDirty = false;

function extrasFor(path, o) {
  if (!PAGE_EXTRAS[path]) {
    PAGE_EXTRAS[path] = { url: canon(path), title: o.title, desc: o.desc, blocks: [] };
    extrasDirty = true;
  }
  return PAGE_EXTRAS[path];
}

const attr = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Paragraphs, headings and list items — the plain reading lane. */
function proseHtml(blocks) {
  const out = [];
  let list = [];
  const flush = () => { if (list.length) { out.push('<ul>' + list.join('') + '</ul>'); list = []; } };
  for (const b of blocks || []) {
    if (!Array.isArray(b) || typeof b[1] !== 'string') continue;
    if (b[0] === 'li') { list.push('<li>' + b[1] + '</li>'); continue; }
    flush();
    if (['p', 'h2', 'h3'].includes(b[0])) out.push('<' + b[0] + '>' + b[1] + '</' + b[0] + '>');
  }
  flush();
  return out.join('');
}

/**
 * Gives a generated heading the site's own accent.
 *
 * Every hand-written heading here carries gold on part of itself. A generated
 * heading rendered plain reads as a different page's typography sitting inside
 * this one — the exact seam this whole layer exists to remove.
 *
 * The accent falls on the last two words, or the last one when the heading is
 * short, which is where the site puts it. Nothing is rewritten: the same words
 * come out, wrapped.
 */
function accentHeading(heading) {
  const text = String(heading || '').trim();
  if (!text || /<span/.test(text)) return text;
  const words = text.split(/\s+/);
  if (words.length < 3) return text;

  /* A possessive or preposition on its own carries no meaning to accent —
     "המעטפת <שלנו>" highlights the wrong half, so the word before it joins. */
  const WEAK = /^(שלנו|שלכם|שלך|שלו|שלה|שלהם|לכם|לנו|בו|בה|בהם|זה|זאת|הזה|הזאת)[?!.,]?$/;
  let take = words.length >= 5 ? 2 : 1;
  if (WEAK.test(words.at(-1)) && words.length > take + 1) take += 1;

  const head = words.slice(0, -take).join(' ');
  const tail = words.slice(-take).join(' ');
  return `${head} <span class="gw">${tail}</span>`;
}

/**
 * The heading of a generated section, with the line under it.
 *
 * Every hand-written section on this site introduces itself twice: a title with
 * gold on part of it, and one sentence saying what the reader is about to see.
 * Generated sections had only the title, and the missing sentence is most of
 * why they read as thinner than the rest of the page.
 */
const secHead = (heading, sub) => (heading
  ? `<div class="sec-head reveal"><h2>${accentHeading(heading)}</h2>${sub ? `<p>${sub}</p>` : ''}</div>`
  : '');

const SECTION_RENDERERS = {
  /* A run of text: still the right choice for anything that is explanation. */
  prose: sec => {
    const html = proseHtml(sec.blocks);
    if (!html) return '';
    /* A heading is only added when the text does not already open with one —
       otherwise the section would announce itself twice. */
    const owns = /^<h[23]>/.test(html);
    return `
<section class="sec-tight">
  <div class="container">
    ${owns ? '' : secHead(sec.heading, sec.sub)}
    <div class="prose">${html}</div>
  </div>
</section>`;
  },

  /* Short points that are read by scanning rather than by reading. */
  checks: sec => {
    const items = (sec.items || []).filter(i => i && i.title);
    if (items.length < 2) return '';
    return `
<section class="sec-tight">
  <div class="container">
    ${secHead(sec.heading, sec.sub)}
    <div class="check-grid">${items.map(i => checkCard(IC.check, i.title, i.text || '')).join('')}</div>
  </div>
</section>`;
  },

  /**
   * The card grid the site uses for "what we offer": an icon per card, the
   * first one given more room and a lit background, and an optional figure in
   * its corner. This is the shape the owner points at when asked what a good
   * section looks like, so generated content should be able to reach it.
   */
  bento: sec => {
    const items = (sec.items || []).filter(i => i && i.title).slice(0, 6);
    if (items.length < 3) return '';
    /* Two wide, then thirds — the proportions the hand-written grids use. */
    const span = i => (items.length <= 4 ? 6 : i < 2 ? 6 : 3);
    return `
<section class="sec-tight">
  <div class="container">
    ${secHead(sec.heading, sec.sub)}
    <div class="bento">
      ${items.map((it, i) => `
      <div class="v-card${i === 0 ? ' feature' : ''} col-${span(i)} reveal"${i ? ` style="--d:.${i * 6}s"` : ''}><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.check}</div>${it.note ? `<span class="v-range">${it.note}</span>` : ''}</div>
        <div><h3>${it.title}</h3><p class="v-desc">${it.text || ''}</p></div>
      </div></div>`).join('')}
    </div>
  </div>
</section>`;
  },

  /**
   * A compact list of points, each opening with the phrase it is about. Lighter
   * than the card grid, and the right shape when the points are sentences
   * rather than headings.
   */
  checklist: sec => {
    const items = (sec.items || []).filter(i => i && i.title);
    if (items.length < 3) return '';
    return `
<section class="sec-tight">
  <div class="container">
    <div class="prose">
      ${sec.heading ? `<h2>${accentHeading(sec.heading)}</h2>` : ''}
      ${sec.sub ? `<p>${sec.sub}</p>` : ''}
      <ul>
        ${items.map(i => `<li><b>${i.title}${/[.!?:]$/.test(i.title) ? '' : '.'}</b> ${i.text || ''}</li>`).join('')}
      </ul>
    </div>
  </div>
</section>`;
  },

  /**
   * Numbered steps. The site draws them as a row divided by hairlines with an
   * ordinal above each, which makes a sequence read as a sequence rather than
   * as four cards that happen to be adjacent.
   */
  process: sec => {
    const items = (sec.items || []).filter(i => i && i.title).slice(0, 5);
    if (items.length < 3) return '';
    return `
<section class="sec-tight">
  <div class="container">
    ${secHead(sec.heading, sec.sub)}
    <div class="process-grid">
      ${items.map((it, i) => `
      <div class="step reveal"${i ? ` style="--d:.${i}s"` : ''}><h3>${it.title}</h3><p>${it.text || ''}</p></div>`).join('')}
    </div>
  </div>
</section>`;
  },

  /**
   * Figures, large, with a line saying what each one counts. Only ever built
   * from numbers already in the draft — a statistics band is the one component
   * where an invented number would look most like a fact.
   */
  stats: sec => {
    const items = (sec.items || [])
      .filter(i => i && i.title && /\d/.test(String(i.title)))
      .slice(0, 4);
    if (items.length < 2) return '';
    return `
<section class="sec-tight">
  <div class="container">
    ${secHead(sec.heading, sec.sub)}
    <div class="stats-grid">
      ${items.map(it => `
      <div class="stat reveal"><div class="stat-num">${it.title}</div><div class="stat-label">${it.text || ''}</div></div>`).join('')}
    </div>
  </div>
</section>`;
  },

  /**
   * Cards that open with a one-word label above the title — the shape the site
   * uses for reasons to choose it. The label is what separates this from the
   * plain card grid: it gives each card a category before it is read.
   */
  reasons: sec => {
    const items = (sec.items || []).filter(i => i && i.title && i.note).slice(0, 4);
    if (items.length < 3) return '';
    return `
<section class="sec-tight">
  <div class="container">
    ${secHead(sec.heading, sec.sub)}
    <div class="why-grid">
      ${items.map((it, i) => `
      <div class="why-card reveal"${i ? ` style="--d:.${i}s"` : ''}><div class="why-in">
        <span class="why-num">${it.note}</span><h3>${it.title}</h3>
        <p>${it.text || ''}</p>
      </div></div>`).join('')}
    </div>
  </div>
</section>`;
  },

  /**
   * A row of pills. For a list of names with nothing to say about each — the
   * channels a service covers, the sectors it serves — where a card grid would
   * give five words the weight of a paragraph.
   */
  pills: sec => {
    const items = (sec.items || []).filter(i => i && i.title).slice(0, 8);
    if (items.length < 3) return '';
    return `
<section class="sec-tight">
  <div class="container">
    ${secHead(sec.heading, sec.sub)}
    <div class="dig-row reveal" style="--d:.1s">
      ${items.map(i => (i.href
    ? `<a class="dig-pill" href="${sec.root || ''}${i.href}">${IC.check}${i.title}</a>`
    : `<span class="dig-pill">${IC.check}${i.title}</span>`)).join('')}
    </div>
  </div>
</section>`;
  },

  /* Questions people actually ask, in the accordion the site already uses. */
  faq: sec => {
    const items = (sec.items || []).filter(i => i && i.q && i.a).map(i => [i.q, i.a]);
    return items.length ? faqBlock(items) : '';
  },

  /* One sentence that deserves to stop the eye. */
  callout: sec => sec.text ? `
<section class="sec-tight" style="padding-top:0">
  <div class="container"><p class="price-note reveal">${IC.info} ${sec.text}</p></div>
</section>` : '',

  /* Text beside a picture, where the image carries part of the meaning. */
  media: sec => {
    const html = proseHtml(sec.blocks);
    if (!html || !sec.image) return '';
    const owns = /^<h[23]>/.test(html);
    return `
<section class="sec-tight">
  <div class="container">
    ${owns ? '' : secHead(sec.heading, sec.sub)}
    <div class="gen-grid">
      <div class="prose">${html}</div>
      <figure class="gen-media reveal">
        <img src="${sec.root || ''}assets/${attr(sec.image)}" alt="${attr(sec.alt)}"
             loading="lazy" width="640" height="420">
      </figure>
    </div>
  </div>
</section>`;
  },
};

/**
 * Renders a layout plan, falling back to prose for anything unrecognised —
 * showing a paragraph plainly beats dropping it without a trace.
 */
/**
 * Renders the sections of a plan that belong at one named position.
 *
 * A page is a sequence the reader moves through, and everything generated used
 * to land at the end — after the closing call to action, where nobody reaches
 * it. Sections now carry the slot they were placed in, and each slot in the
 * template renders only its own.
 */
function extraBlocks(plan, root = '', slot = 'end') {
  /* A flat block array is the older shape; read it as one prose run. */
  const raw = Array.isArray(plan) && plan.length && Array.isArray(plan[0])
    ? [{ type: 'prose', blocks: plan }]
    : (Array.isArray(plan) ? plan : []);
  if (!raw.length) return '';

  /* Consecutive prose becomes one section rather than several.
     Each section carries its own vertical padding, so six prose sections in a
     row put up to eight hundred pixels of emptiness between short paragraphs —
     the page read as fragments floating apart instead of as continuous text.
     A section break should mean a change of form, not a change of paragraph. */
  /* Anything without a slot was placed before slots existed; it stays at the
     end, which is where it has been rendering all along. */
  const mine = raw.filter(sec => (sec?.slot || 'end') === slot);
  if (!mine.length) return '';

  const sections = [];
  for (const sec of mine) {
    const isProse = !sec || !sec.type || sec.type === 'prose';
    const last = sections[sections.length - 1];
    /* Only an untitled run is a continuation. A section that announces itself
       is a section, and merging it would silently drop its heading. */
    if (isProse && !sec?.heading && last && last.type === 'prose') {
      last.blocks = [...(last.blocks || []), ...((sec && sec.blocks) || [])];
      continue;
    }
    sections.push(isProse
      ? { type: 'prose', heading: sec?.heading, blocks: (sec && sec.blocks) || [] }
      : sec);
  }

  return sections
    .map(sec => (SECTION_RENDERERS[sec && sec.type] || SECTION_RENDERERS.prose)({ ...sec, root }))
    .filter(Boolean).join('');
}


/**
 * Puts each planned section at the position it was planned for.
 *
 * Every page here is a string of `<section>` elements, whether it came from a
 * template or was written by hand, so the positions are found by anchoring on
 * the markup the page already contains: the hero, the questions, the closing
 * form. That makes one mechanism cover all 140 pages — including the ones
 * written before any of this existed, which is most of them.
 *
 * A slot with nothing planned inserts nothing at all, so a page with no extras
 * is byte-for-byte what it was.
 */
function injectSlots(body, plan, root) {
  if (!Array.isArray(plan) || !plan.length) return body;

  /* Where each position lives in the markup, in the order the reader meets
     them. Each anchor returns the index the HTML is spliced in at. */
  const anchors = {
    after_intro: html => {
      const hero = html.indexOf('<section class="p-hero');
      if (hero === -1) return -1;
      const close = html.indexOf('</section>', hero);
      return close === -1 ? -1 : close + '</section>'.length;
    },
    /* Halfway through, at a real section boundary rather than a character
       count — landing inside a grid would break the page. */
    mid: html => {
      const bounds = [];
      for (let i = html.indexOf('<section'); i !== -1; i = html.indexOf('<section', i + 1)) bounds.push(i);
      const usable = bounds.filter(i => i > (anchors.after_intro(html) || 0));
      return usable.length ? usable[Math.floor(usable.length / 2)] : -1;
    },
    before_faq: html => {
      const faq = html.indexOf('class="faq reveal"');
      if (faq === -1) return -1;
      return html.lastIndexOf('<section', faq);
    },
    end: html => {
      const cta = html.indexOf('<section class="sec contact"');
      return cta === -1 ? html.length : cta;
    },
  };

  /* Applied from the bottom up, so an earlier insertion cannot shift the index
     a later one was measured against. */
  const order = ['after_intro', 'mid', 'before_faq', 'end'];
  const placed = order
    .map(slot => ({ slot, html: extraBlocks(plan, root, slot) }))
    .filter(x => x.html)
    .map(x => ({ ...x, at: anchors[x.slot](body) }))
    .filter(x => x.at >= 0)
    .sort((a, b) => b.at - a.at);

  let out = body;
  for (const { html, at } of placed) out = out.slice(0, at) + html + out.slice(at);

  /* A section whose position could not be found still belongs on the page;
     dropping it silently would leave data that renders nowhere. */
  const missing = order
    .filter(slot => extraBlocks(plan, root, slot) && !placed.some(p => p.slot === slot))
    .map(slot => extraBlocks(plan, root, slot));
  if (missing.length) {
    const cta = out.indexOf('<section class="sec contact"');
    const at = cta === -1 ? out.length : cta;
    out = out.slice(0, at) + missing.join('') + out.slice(at);
  }
  return out;
}

function page(path, opts) {
  const depth = path ? path.split('/').length : 0;
  const root = '../'.repeat(depth);
  BUILT.push(path);
  if (opts.robots && /noindex/i.test(opts.robots)) NOINDEX.add(path);

  const extras = extrasFor(path, opts);
  const body = injectSlots(opts.body(root), extras.blocks, root);

  /* The title and description come from the data file when it holds them.
     
     Service pages already worked this way; article pages did not, and their
     entry in page-extras.json was a field nothing read. Two dozen rewritten
     titles were written there and changed nothing on the site — caught only
     because the publisher refuses an edit the build ignores. One rule for every
     page is the fix: whatever is in the data file is what the page shows. */
  if (extras.title) opts = { ...opts, title: extras.title };
  if (extras.desc) opts = { ...opts, desc: extras.desc };
  // auto og:image from the page's hero image (shared previews per page)
  let ogImage = opts.ogImage;
  if (!ogImage) {
    const m = body.match(/class="p-hero-media">\s*<img src="(?:\.\.\/)*assets\/([^"]+)"/);
    if (m) ogImage = GH + 'assets/' + m[1];
  }
  write(path, shell({ root, canonical: canon(path), ...opts, ogImage, body }));
}

/* ---------- reusable blocks ---------- */
const checkCard = (ic, h, p) => `
  <div class="check-card reveal"><div class="check-in">
    <div class="c-ic">${ic}</div><h3>${h}</h3><p>${p}</p>
  </div></div>`;

const faqBlock = items => `
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>שאלות <span class="gw">ותשובות</span></h2></div>
    <div class="faq reveal" style="--d:.1s">
      ${items.map(([q, a]) => `<details><summary>${q}<span class="pl">${IC.plus}</span></summary><p class="fa">${a}</p></details>`).join('')}
    </div>
  </div>
</section>`;

const FAQ_COMMON = {
  exclusive: ['האם הלידים בלעדיים?', 'כן. כל ליד שאנחנו מייצרים מועבר לעסק אחד בלבד. אתם לא מתחרים עם עוד חמישה עסקים על אותו לקוח.'],
  when: ['מתי הלידים מועברים אלינו?', 'בזמן אמת. ברגע שהליד ממלא את הטופס, הפרטים נוחתים אצלכם במייל, ב-SMS וישירות למערכת ה-CRM, תוך דקות.'],
  invalid: ['מה קורה אם ליד לא רלוונטי?', 'יש לנו מנגנון זיכוי מסודר שנקבע מראש. אחוז הזיכוי עבור לידים פסולים נע בדרך כלל בין 0% ל-15% מהיקף ההזמנה.'],
  stop: ['אפשר לעצור את הזרמת הלידים?', 'כן, בהתראה קצרה. אתם שולטים בקצב ובכמות, בהתאם לקיבולת של צוות המכירות שלכם.'],
  pilot: ['אפשר להתחיל בקטן?', 'בהחלט. אנחנו ממליצים להתחיל בפיילוט ניסיון, לראות את איכות הלידים בפועל, ורק אז להגדיל את ההיקף.'],
};

const relatedBlock = (root, links) => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal" style="margin-bottom:22px"><h2 style="font-size:clamp(22px,2.4vw,30px)">אולי יעניין אתכם גם</h2></div>
    <div class="related reveal" style="--d:.08s">
      ${links.map(([h, t]) => `<a href="${root}${h}">${t}</a>`).join('')}
    </div>
  </div>
</section>`;

/* =================================================================
   Magazine articles: full in-site pages (content migrated from WP)
================================================================= */
const CUSTOM_PAGES = new Set([
  'קניית-לידים', 'קניית-לידים/לידים-לביטוח', 'קניית-לידים/לידים-להחזרי-מס', 'קניית-לידים/לידים-להלוואות',
  'קניית-לידים/לידים-למשכנתאות', 'קניית-לידים/לידים-לבניית-אתרים', 'לידים-לרואי-חשבון', 'פתיחת-עוסק-מורשה',
  'מכירת-תיק-לרואי-חשבון', 'שיווק-דיגיטלי', 'קידום-אתרים-seo', 'קידום-בגוגל', 'קידום-בפייסבוק',
  'פרסום-באינסטגרם', 'קידום-בלינקדאין', 'פרסום-בטאבולה-ואאוטבריין', 'מחירון-לידים', 'עדכונים-חמים',
  'יצירת-קשר', 'הצהרת-נגישות', 'מערכת-ניהול-לידים', 'מחשבון-roi-ללידים',
]);
const HIDDEN_POSTS = new Set(['לא-לחזור-על-נושאים-שכבר-כתבת-עליהם-בעב-2']);
const RAW_ARTICLES = Object.keys(SITE_CONTENT)
  .filter(k => !CUSTOM_PAGES.has(k))
  .map(slug => ({ slug, ...SITE_CONTENT[slug] }))
  .filter(a => (a.blocks || []).length > 5);
const LISTED_ARTICLES = RAW_ARTICLES.filter(a => !HIDDEN_POSTS.has(a.slug));

function inferCat(a) {
  const s = a.slug + ' ' + (a.h1 || '') + ' ' + (a.title || '');
  if (/insurance|ביטוח/i.test(s)) return 'ביטוח';
  if (/mortgage|משכנת/i.test(s)) return 'משכנתאות';
  if (/loan|הלווא/i.test(s)) return 'הלוואות';
  if (/tax|החזר/i.test(s)) return 'החזרי מס';
  if (/account|רואי חשבון|עוסק/i.test(s)) return 'רואי חשבון';
  if (/market|שיווק|digital|דיגיטל|website|אתרים|seo|ppc|ממומן/i.test(s)) return 'שיווק דיגיטלי';
  return 'לידים';
}
const CAT_COVER = { 'ביטוח': 'cover-insurance.webp', 'משכנתאות': 'cover-mortgage.webp', 'הלוואות': 'cover-loans.webp', 'החזרי מס': 'cover-loans.webp', 'רואי חשבון': 'img-office.webp', 'שיווק דיגיטלי': 'cover-marketing.webp', 'לידים': 'cover-leads.webp' };
const CAT_SERVICES = {
  'ביטוח': [['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח']],
  'משכנתאות': [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות']],
  'הלוואות': [['קניית-לידים/לידים-להלוואות/', 'לידים להלוואות']],
  'החזרי מס': [['קניית-לידים/לידים-להחזרי-מס/', 'לידים להחזרי מס']],
  'רואי חשבון': [['לידים-לרואי-חשבון/', 'לידים לרואי חשבון']],
  'שיווק דיגיטלי': [['שיווק-דיגיטלי/', 'שיווק דיגיטלי'], ['קידום-בגוגל/', 'קידום ממומן בגוגל']],
  'לידים': [['קניית-לידים/', 'קניית לידים'], ['חברת-לידים/', 'חברת לידים במודל CPL']],
};
function artTitle(a) { return a.h1 || (a.title || '').split('|')[0].split(' - ')[0].trim() || a.slug; }
function getMeta(slug) {
  if (ART_META[slug]) return ART_META[slug];
  const a = SITE_CONTENT[slug] || {};
  const cat = inferCat({ slug, ...a });
  const firstP = ((a.blocks || []).find(b => b[0] === 'p' && b[1].length > 80) || ['', ''])[1];
  const goodDesc = a.desc && a.desc.length > 20 ? a.desc : '';
  const teaser = (goodDesc || firstP || '').slice(0, 150);
  return { cat, cover: CAT_COVER[cat], teaser, services: CAT_SERVICES[cat] };
}

const ART_META = {
  'מה-זה-שיווק-דיגיטלי': { cat: 'שיווק דיגיטלי', cover: 'cover-marketing.webp', teaser: 'כל מה שבעל עסק צריך לדעת על שיווק דיגיטלי: ערוצים, תקציבים ואיך מתחילים נכון.', services: [['שיווק-דיגיטלי/', 'שיווק דיגיטלי'], ['קידום-בגוגל/', 'קידום ממומן בגוגל']] },
  'מה-זה-לידים': { cat: 'לידים', cover: 'cover-leads.webp', teaser: 'המדריך המלא ללידים: מה זה בכלל ליד, איך מגייסים אותו נכון ומה הופך אותו ללקוח.', services: [['קניית-לידים/', 'קניית לידים'], ['חברת-לידים/', 'חברת לידים במודל CPL']] },
  'what-are-quality-leads': { cat: 'לידים', cover: 'cover-leads.webp', teaser: '82% מבעלי העסקים מתמודדים עם אותה בעיה: המון לידים, מעט מכירות. ככה מזהים ליד איכותי.', services: [['קניית-לידים/', 'קניית לידים'], ['מחירון-לידים/', 'מחירון 2026']] },
  'quality-mortgage-leads': { cat: 'משכנתאות', cover: 'cover-mortgage.webp', teaser: 'הסודות למציאת לידים טובים למשכנתאות: מקורות, סינון ותזמון שסוגר עסקאות.', services: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות']] },
  'hot-mortgage-leads': { cat: 'משכנתאות', cover: 'cover-mortgage.webp', teaser: 'איך לידים חמים ואיכותיים מקפיצים את אחוזי הסגירה בעסקאות משכנתא.', services: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות']] },
  'cold-to-hot-leads': { cat: 'לידים', cover: 'cover-leads.webp', teaser: 'התהליך הפשוט שהופך ליד קר לליד חם שמחכה לשיחה שלכם.', services: [['קניית-לידים/', 'קניית לידים'], ['חברת-לידים/', 'חברת לידים במודל CPL']] },
  'reduce-mortgage-lead-cost': { cat: 'משכנתאות', cover: 'cover-mortgage.webp', teaser: 'איך מוזילים את עלות הליד בתחום המשכנתאות בלי לפגוע באיכות.', services: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות'], ['מחירון-לידים/', 'מחירון 2026']] },
  'mortgage-closing-rates-tech': { cat: 'משכנתאות', cover: 'cover-mortgage.webp', teaser: 'טכנולוגיות חדשות שמשפרות אחוזי סגירה בענף המשכנתאות.', services: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות']] },
  'hot-insurance-leads': { cat: 'ביטוח', cover: 'cover-insurance.webp', teaser: 'הסוד ללידים חמים בביטוח: כך מוצאים את הלקוחות שמחכים לשמוע מכם.', services: [['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח']] },
  'quality-loan-leads': { cat: 'הלוואות', cover: 'cover-loans.webp', teaser: 'ניתוח נתונים חכם שמשפר את איכות הלידים להלוואות ואת התשואה על כל שקל.', services: [['קניית-לידים/לידים-להלוואות/', 'לידים להלוואות']] },
  'insurance-hot-leads-detection': { cat: 'ביטוח', cover: 'cover-insurance.webp', teaser: 'איך מזהים מראש ליד חם לביטוח שמבטיח אחוז סגירה גבוה.', services: [['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח']] },
  'insurance-leads-closing-rates': { cat: 'ביטוח', cover: 'cover-insurance.webp', teaser: 'הקפיצה הגדולה: מהליד הראשון ועד אחוזי סגירה גבוהים מאי פעם בענף הביטוח.', services: [['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח']] },
};

/**
 * Pulls a questions-and-answers run out of an article body.
 *
 * The site has an accordion for questions — rounded cards with a plus that
 * opens — and articles were not using it. Their questions came through as bold
 * text inside a paragraph, which reads as a wall and looks nothing like the
 * same questions on a service page.
 *
 * Two shapes are recognised, because the articles came from two places: a
 * WordPress import that used H3 per question, and generated drafts that put the
 * question in bold at the head of a paragraph.
 *
 * @returns {{blocks: Array, faq: Array<[string,string]>}} the body without the
 *   questions, and the questions themselves.
 */
function splitFaq(blocks) {
  const heads = /^(שאלות|שאלות נפוצות|שאלות ותשובות|שו"ת)/;
  const at = blocks.findIndex(([t, txt]) =>
    (t === 'h2' || t === 'h3') && heads.test(String(txt).replace(/<[^>]+>/g, '').trim()));
  if (at === -1) return { blocks, faq: [] };

  const faq = [];
  let i = at + 1;
  let pending = null;

  for (; i < blocks.length; i++) {
    const [tag, raw] = blocks[i];
    const txt = String(raw);

    /* A new H2 ends the questions; anything else at this level belongs to it. */
    if (tag === 'h2') break;

    const bold = /^<strong>(.+?)<\/strong>\s*(.*)$/s.exec(txt.trim());
    if (tag === 'p' && bold && /\?\s*$/.test(bold[1].trim())) {
      if (pending && pending.a) faq.push([pending.q, pending.a]);
      pending = { q: bold[1].trim(), a: bold[2].trim() };
      continue;
    }
    if (tag === 'h3' && /\?\s*$/.test(txt.replace(/<[^>]+>/g, '').trim())) {
      if (pending && pending.a) faq.push([pending.q, pending.a]);
      pending = { q: txt.replace(/<[^>]+>/g, '').trim(), a: '' };
      continue;
    }
    if (pending && tag === 'p') {
      pending.a = pending.a ? `${pending.a} ${txt}` : txt;
      continue;
    }
    /* Something that is not part of a question-and-answer run: the run is over,
       and whatever follows stays in the body. */
    break;
  }
  if (pending && pending.a) faq.push([pending.q, pending.a]);

  /* Fewer than three is not a section; leaving them in the prose is better than
     an accordion with two rows in it. */
  if (faq.length < 3) return { blocks, faq: [] };

  return { blocks: [...blocks.slice(0, at), ...blocks.slice(i)], faq };
}

function cleanArticleBlocks(blocks) {
  let start = blocks.findIndex(b => b[0] === 'h2' || (b[0] === 'p' && b[1].length > 90));
  if (start < 0) start = 0;
  const bs = blocks.slice(start);
  const out = [];
  let skipToc = false;
  const junk = /השאירו פרטים|ומיד מתקשרים|שיחה ייעוץ והצעת מחיר|^שליחה|^שם מלא$|^טלפון נייד$|אולי יעניין|גלה עוד סודות|סקרנתם אותי|צור קשר עם|למידע נוסף$|קניית לידים למידע|Article created using|Outrank|^קישורים נוספים/;
  for (const [t, txt] of bs) {
    if (/תוכן עניינים/.test(txt)) { skipToc = true; continue; }
    if (skipToc) { if (t === 'li') continue; skipToc = false; }
    if (junk.test(txt)) continue;
    if (t === 'li' && txt.length < 3) continue;
    out.push([t, txt]);
  }
  const cutAt = out.findIndex(([t, txt]) => (t === 'h2' || t === 'h3') && /^(יצירת קשר|לידים חמים$|שיווק דיגיטלי$|ליצירת קשר)/.test(txt));
  if (cutAt > 3) out.length = cutAt;
  // עריכה: תיקון שגיאות כתיב שהגיעו מהוורדפרס
  const TYPOS = [
    ['נכנס למסורבים', 'נכס למסורבים'], ['אפסקה של', 'הפסקה של'], ['לעצור אפסקה', 'לעצור הפסקה'],
    ['הבקנאות', 'הבנקאות'], ['אנסטגרם', 'אינסטגרם'], ['לתקשרות', 'לתקשורת'],
    ['מנתח ההזמנה', 'מהיקף ההזמנה'], ['מנפח ההזמנה', 'מהיקף ההזמנה'],
    ['בתחום הפתיחת עוסק', 'בתחום פתיחת עוסק'], ['ההחזרי מס', 'החזרי המס'],
    ['הלידיםלידים', 'הלידים. לידים'], ['במשחק הזה אין קיצורי', 'במשחק הזה אין קיצורי'],
  ];
  for (const b of out) for (const [f, t] of TYPOS) b[1] = b[1].split(f).join(t);
  while (out.length && out[out.length - 1][0] !== 'p' && out[out.length - 1][1].length < 60) out.pop();
  let html = '', inList = false;
  for (const [t, txt] of out) {
    if (t === 'li') { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${txt}</li>`; continue; }
    if (inList) { html += '</ul>'; inList = false; }
    if (t === 'h2') html += `<h2>${txt}</h2>`;
    else if (t === 'h3') html += `<h3 style="font-size:20px;margin:30px 0 10px">${txt}</h3>`;
    else html += `<p>${txt}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

const readMinutes = blocks => Math.max(2, Math.round(blocks.map(b => b[1]).join(' ').split(/\s+/).length / 180));

const artCard = (root, slug, i = 0) => {
  const a = RAW_ARTICLES.find(x => x.slug === slug); const m = getMeta(slug);
  if (!a) return '';
  return `
  <a class="art-card reveal" style="--d:${(i % 3) * 0.08}s" href="${root}${slug}/" data-cat="${m.cat}">
    <div class="art-in">
      <div class="a-img"><img src="${root}assets/${m.cover}" alt="${artTitle(a)}" loading="lazy"></div>
      <div class="a-txt">
        <span class="a-tag">${m.cat} · ${readMinutes(a.blocks)} דקות קריאה</span>
        <h3>${artTitle(a)}</h3>
        <span class="a-read">לקריאת המאמר ${IC.crumb}</span>
      </div>
    </div>
  </a>`;
};

const articlesStrip = (root, slugs, title) => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal" style="margin-bottom:26px"><h2 style="font-size:clamp(22px,2.6vw,32px)">${title}</h2></div>
    <div class="art-grid">${slugs.map((s, i) => artCard(root, s, i)).join('')}</div>
  </div>
</section>`;

/* =================================================================
   HOME
================================================================= */
page('', {
  title: 'לידים רותחים שיעזרו לעסק שלך לצמוח - BaliLeads',
  desc: 'BaliLeads חברת לידים, שיווק ופרסום. מתמחה ביצירת לידים חמים ובלעדיים לסקטור הפיננסי: ביטוח, הלוואות, משכנתאות, החזרי מס ועוד. קידום ממומן ואורגני בגוגל ובניית אתרים.',
  active: 'home',
  ldjson: JSON.stringify({ '@context': 'https://schema.org', '@type': ['Organization', 'ProfessionalService'], name: 'BaliLeads', alternateName: 'באלי ליד', description: 'חברת לידים ושיווק דיגיטלי המתמחה בסקטור הפיננסי: לידים בלעדיים ומאומתים במודל CPL', url: 'https://balilead.co.il/', logo: 'https://balilead.co.il/wp-content/uploads/2021/10/cropped-לוגו-שקוף.png', image: GH + 'assets/hero-poster.jpg', telephone: '+972-58-470-0706', email: SITE.email, priceRange: '₪10-₪250 לליד', address: { '@type': 'PostalAddress', streetAddress: 'אצ״ל 34', addressLocality: 'רמת גן', addressCountry: 'IL' }, areaServed: { '@type': 'Country', name: 'Israel' }, openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '09:00', closes: '16:00' }], sameAs: [SITE.fb] }),
  body: root => `
<section class="hero">
  <div class="hero-media" aria-hidden="true">
    <video autoplay muted loop playsinline preload="metadata" poster="${root}assets/hero-poster.jpg">
      <source src="${root}assets/hero.mp4" type="video/mp4">
    </video>
    <div class="hero-scrim"></div>
  </div>
  <div class="hero-halo" aria-hidden="true"></div>
  <div class="hero-ghost" aria-hidden="true">לידים</div>
  <div class="container hero-grid">
    <div>
      <span class="hero-eyebrow reveal">חברת הלידים של הסקטור הפיננסי</span>
      <h1><span class="hl-line"><span>לידים <span class="hot">רותחים</span>,</span></span><span class="hl-line"><span>בלעדיים, בזמן אמת.</span></span></h1>
      <p class="hero-sub reveal" style="--d:.2s">מאז 2020 אנחנו מזרימים לעסקים פיננסיים לקוחות שמחכים לשיחה. <b>לא רשימות ממוחזרות</b>, ליד אחד, עסק אחד.</p>
      <div class="hero-ctas reveal" style="--d:.3s">
        <a class="btn btn-gold" href="#contact"><span class="btn-ic">${IC.arrowL}</span>מתחילים לקבל לידים</a>
        <a class="btn btn-ghost" href="${SITE.waText}" target="_blank" rel="noopener"><span class="btn-ic">${IC.wa}</span>דברו איתנו בוואטסאפ</a>
      </div>
    </div>
    <div class="cascade reveal" style="--d:.35s" aria-label="דוגמאות לתחומי לידים ומחירים">
      <a class="lead-card" href="${root}קניית-לידים/לידים-להלוואות/">
        <span class="lc-tag">הכי מבוקש</span>
        <div class="lead-card-in">
          <div class="lc-ic">${IC.bank}</div>
          <div class="lc-body"><div class="lc-title">לידים להלוואות</div><div class="lc-meta">מי שצריך מימון עכשיו</div></div>
          <div class="lc-price">₪10 עד ₪100</div>
        </div>
      </a>
      <a class="lead-card" href="${root}קניית-לידים/לידים-להחזרי-מס/">
        <div class="lead-card-in">
          <div class="lc-ic">${IC.shekel}</div>
          <div class="lc-body"><div class="lc-title">לידים להחזרי מס</div><div class="lc-meta">שכירים עם זכאות</div></div>
          <div class="lc-price">₪15 עד ₪45</div>
        </div>
      </a>
      <a class="lead-card" href="${root}קניית-לידים/לידים-לביטוח/">
        <div class="lead-card-in">
          <div class="lc-ic">${IC.shield}</div>
          <div class="lc-body"><div class="lc-title">לידים לביטוח</div><div class="lc-meta">ממוקדים לפי סוג פוליסה</div></div>
          <div class="lc-price">₪10 עד ₪100</div>
        </div>
      </a>
    </div>
  </div>
</section>

${clientsStrip(root)}

<section style="padding:clamp(70px,9vw,110px) 0 0">
  <div class="container stats-grid">
    <div class="stat reveal"><div class="stat-num" data-count="2020">2020</div><div class="stat-label">פועלים בסקטור הפיננסי מאז</div></div>
    <div class="stat reveal" style="--d:.12s"><div class="stat-num" data-count="29">29</div><div class="stat-label">תחומי התמחות במחירון</div></div>
    <div class="stat reveal" style="--d:.24s"><div class="stat-num" data-count="24">24</div><div class="stat-label">שעות עד שהלידים מתחילים לזרום</div></div>
  </div>
</section>

<section class="sec" id="about">
  <div class="container about-grid">
    <div class="about-copy">
      <div class="sec-head reveal"><h2>מי אנחנו, <span class="gw">ולמה זה משנה לכם</span></h2></div>
      <p class="reveal" style="--d:.1s">באלי ליד היא חברת לידים ותיקה הפועלת מאז 2020 בזירה הכי תחרותית שיש, הסקטור הפיננסי: <b>ביטוח, הלוואות, משכנתאות, החזרי מס והטבות מס</b>.</p>
      <p class="reveal" style="--d:.18s">ליד אצלנו הוא לא מספר טלפון אקראי. זה לקוח שהתעניין בשירות שלכם, עבר סינון לפי דרישות התחום, ומגיע לאנשי המכירות שלכם <b>כשהוא עדיין חם</b>.</p>
      <p class="reveal" style="--d:.26s">הצוות שלנו מורכב מאנשי שיווק, כותבי תוכן ומומחי פרסום שחיים את עולם ההמרות. שיחת המכירה עליכם, האיכות עלינו.</p>
    </div>
    <div>
      <div class="side-img reveal" style="--d:.14s"><img src="${root}assets/img-office.webp" alt="המשרד של באלי ליד, חברת לידים לסקטור הפיננסי" loading="lazy"></div>
      <div class="quote-shell reveal" style="--d:.2s">
        <div class="quote-in">
          <p class="quote-txt">"העסק שלכם הוא לא משחק. המטרה שלנו אחת: להביא לכם לקוחות משלמים ולהגדיל את אחוזי הסגירה."</p>
          <div class="quote-who">
            <div class="quote-avatar">צ</div>
            <div><div class="quote-name">צחי לוי</div><div class="quote-role">מנכ"ל ומייסד, באלי ליד</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec process" id="process">
  <div class="container">
    <div class="sec-head reveal">
      <h2>איך בתכלס <span class="gw">זה עובד?</span></h2>
      <p>ארבעה שלבים בין החתימה לבין הליד הראשון שמצלצל אליכם.</p>
    </div>
    <div class="process-grid">
      <div class="step reveal"><h3>אפיון מדויק</h3><p>מגדירים יחד את הלקוח האידיאלי: תחום, אזור, פרופיל פיננסי ותנאי סף.</p></div>
      <div class="step reveal" style="--d:.1s"><h3>קמפיינים חכמים</h3><p>משיקים קמפיינים ממומנים בגוגל, פייסבוק, אינסטגרם וטאבולה, בדיוק איפה שהלקוחות שלכם נמצאים.</p></div>
      <div class="step reveal" style="--d:.2s"><h3>סינון קפדני</h3><p>כל פנייה נבדקת מול הדרישות שלכם. ליד שלא רלוונטי לתחום, פשוט לא מגיע אליכם.</p></div>
      <div class="step reveal" style="--d:.3s"><h3>העברה בזמן אמת</h3><p>הליד נוחת אצל אנשי המכירות שלכם תוך דקות, בלעדי לכם בלבד, כשהוא הכי חם.</p></div>
    </div>
  </div>
</section>

<section class="sec" id="verticals">
  <div class="container">
    <div class="sec-head reveal">
      <h2>תחומי הלידים <span class="gw">שלנו</span></h2>
      <p>מיקוד לפי דרישות המקצוע והעסק שלכם. אין סיכוי שתקבלו ליד שלא קשור לתחום המומחיות שלכם.</p>
    </div>
    <div class="bento">
      <a class="v-card feature col-5 reveal" href="${root}קניית-לידים/לידים-לביטוח/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.shield}</div><span class="v-range">₪10 עד ₪100</span></div>
        <div><h3>לידים לביטוח</h3><p class="v-desc">התחום המבוקש ביותר שלנו. לקוחות שמחפשים פוליסה חדשה או משדרגים קיימת, כולל ביטוח רכב.</p></div>
      </div></a>
      <a class="v-card col-4 reveal" style="--d:.08s" href="${root}קניית-לידים/לידים-למשכנתאות/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.house}</div><span class="v-range">₪50 עד ₪150</span></div>
        <div><h3>לידים למשכנתאות</h3><p class="v-desc">רוכשי דירות וממחזרי משכנתא בתהליך החלטה פעיל.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.16s" href="${root}קניית-לידים/לידים-להחזרי-מס/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.shekel}</div><span class="v-range">₪15 עד ₪45</span></div>
        <div><h3>לידים להחזרי מס</h3><p class="v-desc">שכירים עם זכאות להחזר.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.1s" href="${root}קניית-לידים/לידים-להלוואות/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.card}</div><span class="v-range">₪10 עד ₪45</span></div>
        <div><h3>הלוואה לכל מטרה</h3><p class="v-desc">כולל הלוואות כנגד קופה ופנסיה.</p></div>
      </div></a>
      <a class="v-card col-4 reveal" style="--d:.18s" href="${root}קניית-לידים/לידים-להלוואות/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.bank}</div><span class="v-range">₪50 עד ₪90</span></div>
        <div><h3>הלוואות לעסקים</h3><p class="v-desc">בעלי עסקים שמחפשים מימון לצמיחה, כולל מסלולים למסורבי בנקים.</p></div>
      </div></a>
      <a class="v-card col-5 reveal" style="--d:.26s" href="${root}לידים-לרואי-חשבון/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.users}</div><span class="v-range">₪50 עד ₪110</span></div>
        <div><h3>לידים לעורכי דין ורואי חשבון</h3><p class="v-desc">תיקים חדשים, פתיחת עוסק מורשה והעברת תיקים, ישירות למשרד שלכם.</p></div>
      </div></a>
    </div>
  </div>
</section>

<section class="sec" id="pricing" style="padding-top:0">
  <div class="container">
    <div class="contact-shell reveal" style="border-radius:var(--r-card)">
      <div class="contact-in contact-in--split">
        <div>
          <h2 style="font-size:clamp(24px,2.8vw,36px);margin-bottom:10px">מחירון שקוף. <span class="gw" style="background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent">בלי הפתעות.</span></h2>
          <p style="color:var(--muted)">אנחנו מהיחידים בענף שמפרסמים מחירון מלא. כל 29 התחומים, מעודכן לשנת 2026.</p>
        </div>
        <a class="btn btn-gold" href="${root}מחירון-לידים/"><span class="btn-ic">${IC.arrowL}</span>למחירון המלא 2026</a>
      </div>
    </div>
  </div>
</section>

<section class="sec dig" id="digital" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal">
      <h2>שיווק דיגיטלי, <span class="gw">מעטפת מלאה</span></h2>
      <p>מעבר ללידים, אנחנו מנהלים עבורכם את כל הנוכחות הדיגיטלית: מהקמפיין הראשון ועד האתר.</p>
    </div>
    <div class="dig-row reveal" style="--d:.1s">
      <a class="dig-pill" href="${root}קידום-בגוגל/">${IC.search}קידום ממומן בגוגל</a>
      <a class="dig-pill" href="${root}קידום-אתרים-seo/">${IC.chart}קידום אתרים SEO</a>
      <a class="dig-pill" href="${root}קידום-בפייסבוק/">${IC.fbf}קידום בפייסבוק</a>
      <a class="dig-pill" href="${root}פרסום-באינסטגרם/">${IC.ig}פרסום באינסטגרם</a>
      <a class="dig-pill" href="${root}קידום-בלינקדאין/">${IC.li}קידום בלינקדאין</a>
      <a class="dig-pill" href="${root}פרסום-בטאבולה-ואאוטבריין/">${IC.rss}טאבולה ואאוטבריין</a>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>למה דווקא <span class="gw">באלי ליד?</span></h2></div>
    <div class="why-grid">
      <div class="why-card reveal"><div class="why-in">
        <span class="why-num">ניסיון</span><h3>שנים בנישה הכי תחרותית</h3>
        <p>מאז 2020 אנחנו חיים ונושמים את הסקטור הפיננסי. אנחנו יודעים בדיוק איזה ליד סוגר ואיזה מבזבז לכם זמן.</p>
      </div></div>
      <div class="why-card reveal" style="--d:.12s"><div class="why-in">
        <span class="why-num">איכות</span><h3>סינון לפני העברה</h3>
        <p>כל ליד עובר מיקוד לפי דרישות המקצוע שלכם. שיחת המכירה עליכם, האיכות עלינו.</p>
      </div></div>
      <div class="why-card reveal" style="--d:.24s"><div class="why-in">
        <span class="why-num">מקצועיות</span><h3>זמינים 24/7, באמת</h3>
        <p>ליווי אישי לאורך כל הדרך, כולל קו ישיר למנכ"ל. צריכים אותנו? אנחנו כאן.</p>
      </div></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal">
      <h2>המגזין: <span class="gw">ידע שסוגר עסקאות</span></h2>
      <p>מדריכים מהשטח על לידים, המרות ושיווק. בלי סיסמאות ריקות.</p>
    </div>
    <div class="art-grid">
      ${artCard(root, 'מה-זה-לידים', 0)}
      ${artCard(root, 'hot-insurance-leads', 1)}
      ${artCard(root, 'quality-mortgage-leads', 2)}
    </div>
    <p class="price-note reveal" style="--d:.1s">${IC.info} <a href="${root}עדכונים-חמים/" style="color:var(--gold2);font-weight:700">לכל המאמרים במגזין</a></p>
  </div>
</section>

${ctaSection(root)}`,
});

/* =================================================================
   קניית לידים (hub)
================================================================= */
page('קניית-לידים', {
  title: 'קניית לידים חמים ובלעדיים לכל תחום - BaliLeads',
  desc: 'קניית לידים חמים ואיכותיים שעברו תהליך סינון מעמיק. לידים בלעדיים במגוון תחומים, תשלום פר ליד בלבד. מחירון שקוף מעודכן 2026.',
  active: 'leads',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'קניית לידים' }])],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'קניית לידים' }],
    h1: 'קניית לידים חמים, <span class="gw">בלי לשרוף תקציבי פרסום</span>',
    img: 'cover-leads.webp', alt: 'קניית לידים חמים - משפך זהב שאוסף לקוחות, באלי ליד',
    sub: 'במקום לנהל קמפיינים, לבנות דפי נחיתה ולסנן פניות, אתם מקבלים לקוחות שכבר הרימו יד. <b>משלמים פר ליד, ורק פר ליד.</b>',
  })}

<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>איך אנחנו מייצרים <span class="gw">לידים חמים?</span></h2></div>
    <div class="process-grid">
      <div class="step reveal"><h3>שיווק מולטי-ערוצי</h3><p>קמפיינים ממומנים בגוגל, פייסבוק, אינסטגרם, לינקדאין וכתבות ממירות בטאבולה ואאוטבריין.</p></div>
      <div class="step reveal" style="--d:.1s"><h3>דפי נחיתה ממירים</h3><p>כל קמפיין מוביל לדף נחיתה ממוקד עם טפסים חכמים ושאלות מסננות.</p></div>
      <div class="step reveal" style="--d:.2s"><h3>סינון ואימות</h3><p>כל פנייה נבדקת מול תנאי הסף של התחום שלכם לפני שהיא נספרת כליד.</p></div>
      <div class="step reveal" style="--d:.3s"><h3>העברה מיידית</h3><p>הליד מגיע אליכם בשלושה ערוצים במקביל: מייל עם הפרטים המלאים, התראת SMS וישירות ל-CRM.</p></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container">
    <div class="prose">
      <h2>מה הופך ליד <span class="gw">ל"חם"?</span></h2>
      <p>ליד חם הוא לקוח שביצע פעולה אקטיבית ממש עכשיו: חיפש את השירות, קרא תוכן רלוונטי, מילא טופס והשאיר פרטים מרצונו. הוא מצפה לשיחה שלכם.</p>
      <p><b>הבעיה עם לידים קרים ורשימות ממוחזרות:</b> הלקוח לא זוכר שהשאיר פרטים, כבר סגר עם מתחרה, או שהפרטים פשוט לא נכונים. אתם משלמים על שיחות מתות.</p>
      <ul>
        <li><b>בלעדיות מלאה.</b> כל ליד נמכר לעסק אחד בלבד.</li>
        <li><b>פילוח לפי דרישות.</b> תחום, אזור, פרופיל פיננסי ותנאי סף שאתם מגדירים.</li>
        <li><b>העברה בזמן אמת.</b> ככל שהשיחה קרובה יותר לרגע ההתעניינות, אחוז הסגירה גבוה יותר.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>באיזה תחום <span class="gw">אתם צריכים לידים?</span></h2></div>
    <div class="bento">
      <a class="v-card feature col-4 reveal" href="${root}קניית-לידים/לידים-לביטוח/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.shield}</div><span class="v-range">₪10 עד ₪100</span></div>
        <div><h3>לידים לביטוח</h3><p class="v-desc">כולל ביטוח רכב ופוליסות פרט.</p></div>
      </div></a>
      <a class="v-card col-4 reveal" style="--d:.06s" href="${root}קניית-לידים/לידים-למשכנתאות/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.house}</div><span class="v-range">₪50 עד ₪150</span></div>
        <div><h3>לידים למשכנתאות</h3><p class="v-desc">משכנתא חדשה ומיחזור.</p></div>
      </div></a>
      <a class="v-card col-4 reveal" style="--d:.12s" href="${root}קניית-לידים/לידים-להלוואות/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.card}</div><span class="v-range">₪10 עד ₪100</span></div>
        <div><h3>לידים להלוואות</h3><p class="v-desc">לכל מטרה, לעסקים וכנגד נכס.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" href="${root}קניית-לידים/לידים-להחזרי-מס/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.shekel}</div><span class="v-range">₪15 עד ₪45</span></div>
        <div><h3>לידים להחזרי מס</h3><p class="v-desc">שכירים עם זכאות.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.06s" href="${root}לידים-לרואי-חשבון/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.users}</div><span class="v-range">₪50 עד ₪110</span></div>
        <div><h3>לידים לרואי חשבון</h3><p class="v-desc">תיקים ולקוחות חדשים.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.12s" href="${root}פתיחת-עוסק-מורשה/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.doc}</div><span class="v-range">לפי היקף</span></div>
        <div><h3>פתיחת עוסק מורשה</h3><p class="v-desc">מתאים לרו"ח ויועצי מס.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.18s" href="${root}מכירת-תיק-לרואי-חשבון/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.doc}</div><span class="v-range">פיילוט</span></div>
        <div><h3>העברת תיקים לרו"ח</h3><p class="v-desc">תיקים סגורים עם הסכם חתום.</p></div>
      </div></a>
    </div>
    <p class="price-note reveal" style="--d:.1s">${IC.info} לא מצאתם את התחום שלכם? יש לנו 29 תחומים במחירון. <a href="${root}מחירון-לידים/" style="color:var(--gold2);font-weight:700">למחירון המלא 2026</a></p>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="container about-grid">
    <div class="about-copy">
      <div class="sec-head reveal"><h2>מודל CPL: <span class="gw">משלמים על תוצאה, לא על חשיפה</span></h2></div>
      <p class="reveal" style="--d:.08s">בניגוד לקמפיינים שבהם משלמים על צפיות או קליקים, אצלנו משלמים <b>רק על ליד מאומת שהתעניין בשירות שלכם</b>. זה כל ההבדל בין הוצאה שיווקית להשקעה שמחזירה את עצמה.</p>
      <p class="reveal" style="--d:.16s">כל ליד עובר מסע מלא: נחשף לתוכן שלנו בפלטפורמות המובילות, מילא שאלון, אומת, והועבר אליכם בבלעדיות. <b>אין ידיים שניות.</b></p>
      <div class="hero-ctas reveal" style="--d:.24s">
        <a class="btn btn-ghost" href="${root}חברת-לידים/"><span class="btn-ic">${IC.arrowL}</span>איך עובד מודל CPL</a>
      </div>
    </div>
    <div class="side-img reveal" style="--d:.18s"><img src="${root}assets/img-magnet.webp" alt="מודל CPL, מגנט לקוחות של חברת לידים" loading="lazy"></div>
  </div>
</section>

${ctaSection(root)}`,
});

/* =================================================================
   Lead vertical pages
================================================================= */

/* ── how a generated section is presented ─────────────────────────────────────
   A closed set. The design agent picks from these and nothing else, because
   each is built from classes the site already styles — a component it invented
   would land on the page unstyled. An empty plan renders nothing at all, so a
   page without generated content builds byte for byte as it did before.
   ------------------------------------------------------------------------- */

/* gen.mjs does not import the layout escapers, and alt text is the only
   attribute built from generated content, so one local escape covers it. */
function leadPage(path, o) {
  const crumbs = [{ href: '', t: 'ראשי' }, { href: 'קניית-לידים/', t: 'קניית לידים' }, { t: o.crumb }];
  const x = extrasFor(path, o);
  page(path, {
    title: x.title || o.title, desc: x.desc || o.desc, active: 'leads',
    extraLd: [crumbsLd(crumbs), serviceLd(o.crumb, o.desc, path), ...(o.faq ? [faqLd(o.faq)] : [])],
    body: root => `
${pageHero(root, { crumbs, h1: o.h1, sub: o.sub, price: o.price, img: o.img, alt: o.alt })}
${o.sections(root)}
${clientsStrip(root)}
${deepSection(root, path, null, true)}
${o.faq ? faqBlock(o.faq) : ''}
${o.articles ? articlesStrip(root, o.articles, 'מאמרים שיעשו לכם סדר') : ''}
${relatedBlock(root, o.related)}
${ctaSection(root, { title: o.ctaTitle, topic: o.topic })}`,
  });
}

leadPage('קניית-לידים/לידים-לביטוח', {
  title: 'קבלו לידים חמים לביטוח מספק הלידים הגדול בישראל - BaliLead',
  desc: 'מכירת לידים לביטוח עם באלי ליד. לידים בלעדיים ומסוננים לסוכני ביטוח, תשלום פר ליד בלבד. חסכו זמן וכסף והגדילו את המכירות.',
  crumb: 'לידים לביטוח', img: 'cover-insurance.webp', alt: 'לידים לביטוח - מטריית זהב מגנה על לקוחות, באלי ליד', topic: 'ביטוח',
  h1: 'לידים לביטוח <span class="gw">שסוגרים פוליסות</span>',
  sub: 'התחרות בענף הביטוח עלתה מדרגה. במקום לשרוף תקציב על קמפיינים, אתם מקבלים לקוחות שכבר מחפשים פוליסה, <b>ורק סוגרים</b>.',
  price: '₪10 עד ₪100',
  ctaTitle: 'רוצים לידים לביטוח <span class="gw">כבר השבוע?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="prose">
      <h2>המודל שלנו: <span class="gw">משלמים פר ליד, ורק פר ליד</span></h2>
      <p>אנחנו מפעילים מערך שיווק עצמאי באמצעות כתבות ממירות ומשפכי שיווק משומנים, שמאתר ורושם לקוחות פוטנציאליים בתחומי הביטוח.</p>
      <p>אתם לא משלמים שכר טרחה חודשי, לא רוכשים כתבות ממומנות, לא מעסיקים משרד פרסום. <b>משלמים פר ליד בלבד</b>, ובוחרים את הכמות לפי הקיבולת של צוות המכירות שלכם.</p>
      <ul>
        <li>מערך שיווק עצמאי עם כתבות ממירות באתרי התוכן המובילים</li>
        <li>תהליך סינון מעמיק לפני שכל ליד נספר</li>
        <li>פרטי קשר מלאים ועדכניים, מפולחים לפי סוג הפוליסה</li>
        <li>מתאים לסוכנויות ביטוח, חברות ביטוח, יועצים ומוקדי מכירות</li>
      </ul>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>מה לבדוק לפני שקונים <span class="gw">לידים לביטוח?</span></h2><p>ארבע שאלות ששווה לשאול כל ספק לידים. אצלנו התשובות ברורות.</p></div>
    <div class="check-grid">
      ${checkCard(IC.shield, 'האם הלידים בלעדיים?', 'אצלנו כן. כל ליד נמכר לסוכן אחד בלבד, אתם לא מתחרים על הלקוח עם עוד חמישה סוכנים.')}
      ${checkCard(IC.target, 'מאיפה הלידים מגיעים?', 'מקמפיינים וכתבות באתרי החדשות והתוכן המובילים בישראל, לא מרשימות קנויות.')}
      ${checkCard(IC.filter, 'האם יש סינון אמיתי?', 'כל פנייה עוברת מיקוד לפי סוג הפוליסה והדרישות שלכם לפני שהיא נספרת כליד.')}
      ${checkCard(IC.bolt, 'מה עם לידים פסולים?', 'מנגנון זיכוי מסודר שנקבע מראש, כך שאתם משלמים רק על לידים אמיתיים.')}
    </div>
  </div>
</section>`,
  faq: [FAQ_COMMON.exclusive, FAQ_COMMON.when, FAQ_COMMON.invalid, FAQ_COMMON.pilot],
  articles: ['hot-insurance-leads', 'insurance-hot-leads-detection', 'insurance-leads-closing-rates'],
  related: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות'], ['קניית-לידים/לידים-להלוואות/', 'לידים להלוואות'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('קניית-לידים/לידים-להחזרי-מס', {
  title: 'קבלו לידים חמים להחזרי מס מספק הלידים הגדול בישראל - BaliLead',
  desc: 'לידים להחזרי מס: שכירים עם זכאות אמיתית להחזר, כולל פרטים פיננסיים מלאים בטופס. לידים בלעדיים בכמויות יומיות גדולות.',
  crumb: 'לידים להחזרי מס', img: 'hero-tax.webp', alt: 'לידים להחזרי מס - מעטפת זהב עם החזר כספי', topic: 'החזרי מס',
  h1: 'לידים להחזרי מס <span class="gw">עם זכאות אמיתית</span>',
  sub: 'אנחנו מאתרים שכירים שמגיע להם כסף מהמדינה, בודקים את הזכאות בטופס חכם, ומעבירים אליכם ליד שרק מחכה שתתקשרו. <b>100% בלעדי, 100% מתעניין.</b>',
  price: '₪15 עד ₪45',
  ctaTitle: 'צריכים זרם יומי של <span class="gw">לידים להחזרי מס?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="prose">
      <h2>איך אנחנו מייצרים <span class="gw">לידים להחזרי מס?</span></h2>
      <p>אנחנו מפרסמים תוכן ומודעות בפלטפורמות המובילות, ומזמינים גולשים לבדוק אם מגיע להם החזר מס. הליד ממלא שאלון עם פרטים פיננסיים אמיתיים, ומבקש שיחה חוזרת מגורם שמתמחה בהחזרי מס. זה הרגע שבו אתם נכנסים לתמונה.</p>
      <p>אנחנו מייצרים <b>לידים יומיים בכמויות גדולות</b>, כך שתוכלו לבנות מוקד שעובד ברצף, בלי ימים מתים.</p>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>מה מגיע <span class="gw">עם כל ליד?</span></h2><p>הטופס שלנו שואל את השאלות שחשובות באמת לבדיקת זכאות.</p></div>
    <div class="check-grid">
      ${checkCard(IC.shekel, 'נתוני שכר', 'מהי המשכורת של הליד ושל בן או בת הזוג, בסיס לחישוב הזכאות.')}
      ${checkCard(IC.bank, 'משיכות מקרנות', 'האם נמשכו כספים מקרן פנסיה, גמל או השתלמות ושולם עליהם מס.')}
      ${checkCard(IC.doc, 'החלפות עבודה', 'האם הליד החליף מקומות עבודה בשש השנים האחרונות, טריגר מרכזי להחזר.')}
      ${checkCard(IC.shield, 'ביטוחים פרטיים', 'תשלומים על ביטוחי בריאות וחיים פרטיים שמזכים בהחזר.')}
    </div>
  </div>
</section>`,
  faq: [FAQ_COMMON.exclusive, ['כמה לידים אתם מייצרים ביום?', 'כמויות יומיות גדולות, בהתאם לביקוש. אתם קובעים כמה לידים ביום אתם רוצים לקבל, ואנחנו מתאימים את הקצב.'], FAQ_COMMON.invalid, FAQ_COMMON.when],
  related: [['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח'], ['לידים-לרואי-חשבון/', 'לידים לרואי חשבון'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('קניית-לידים/לידים-להלוואות', {
  title: 'לידים להלוואות - לקוחות איכותיים עם צורך מיידי | BaliLead',
  desc: 'לידים איכותיים להלוואות עם כוונת סגירה גבוהה: לכל מטרה, לעסקים, כנגד נכס וכנגד קופה. משלמים רק על לידים זכאים.',
  crumb: 'לידים להלוואות', img: 'hero-loans.webp', alt: 'לידים להלוואות - גשר מטבעות זהב למימון', topic: 'הלוואות',
  h1: 'לידים להלוואות <span class="gw">עם צורך מיידי</span>',
  sub: 'לקוחות שממלאים שאלון הלוואה לא סתם גולשים, הם צריכים כסף עכשיו. אנחנו מסננים ומעבירים אליכם רק את מי שרלוונטי, <b>ואתם משלמים רק על זכאים</b>.',
  price: '₪10 עד ₪100',
  ctaTitle: 'רוצים לידים להלוואות <span class="gw">ישירות ל-CRM?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>סוגי הלידים <span class="gw">שאנחנו מספקים</span></h2><p>לכל סוג הלוואה קהל אחר, תנאי סף אחרים ומחיר אחר.</p></div>
    <div class="check-grid">
      ${checkCard(IC.card, 'הלוואה לכל מטרה', 'הקהל הרחב ביותר: לקוחות פרטיים שצריכים מימון מהיר. ₪10 עד ₪45 לליד.')}
      ${checkCard(IC.bank, 'הלוואות לעסקים', 'בעלי עסקים עם דירוג אשראי תקין ומחזור שנתי של 200,000 ₪ ומעלה. ₪50 עד ₪90 לליד.')}
      ${checkCard(IC.house, 'הלוואות כנגד נכס', 'בעלי נכסים, כולל מסורבי משכנתא שמחפשים פתרון מימון. ₪15 עד ₪100 לליד.')}
      ${checkCard(IC.shield, 'כנגד קופה או פנסיה', 'לקוחות עם קרן פנסיה או קופת גמל שרוצים ללוות בתנאים טובים. ₪40 עד ₪90 לליד.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>מהשאלון <span class="gw">ועד ה-CRM שלכם</span></h2>
      <p>כשלווה מתעניין בהלוואה, הוא עונה על שאלון ייחודי שמתפרסם באתרים המובילים שלנו: סכום מבוקש, מטרה, הכנסות, האם חזרו צ'קים והאם יש כרטיס אשראי.</p>
      <p>מרגע מילוי הטופס, הפרטים מתקבלים אצלכם <b>אוטומטית תוך שניות</b>, במייל, ב-SMS ובמערכת ה-CRM. אתם מתקשרים כשהלקוח עוד מול המסך.</p>
    </div>
  </div>
</section>`,
  faq: [FAQ_COMMON.exclusive, ['על מה בדיוק אני משלם?', 'רק על לידים שעומדים בתנאי הזכאות שהגדרנו יחד. ליד שלא זכאי להלוואה לא נספר, וכך עלות הליד שלכם נשארת רווחית.'], FAQ_COMMON.when, FAQ_COMMON.stop],
  articles: ['quality-loan-leads', 'cold-to-hot-leads', 'what-are-quality-leads'],
  related: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות'], ['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('קניית-לידים/לידים-למשכנתאות', {
  title: 'לידים למשכנתאות - לקוחות רציניים מוכנים לעסקה | BaliLead',
  desc: 'לידים איכותיים למשכנתאות ליועצי משכנתאות: רוכשי דירה ראשונה, משפרי דיור, משקיעים ומיחזור. אימות טלפוני ובלעדיות מלאה.',
  crumb: 'לידים למשכנתאות', img: 'cover-mortgage.webp', alt: 'לידים למשכנתאות - מפתחות ובית זהב על שיש', topic: 'משכנתאות',
  h1: 'לידים למשכנתאות <span class="gw">שמגיעים לחתימה</span>',
  sub: 'יועצי משכנתאות מרוויחים איתנו כי הלידים עוברים אימות לפני מסירה, מגיעים תוך דקות, <b>ושייכים רק לכם</b>.',
  price: '₪50 עד ₪150',
  ctaTitle: 'יועצי משכנתאות, <span class="gw">הלקוח הבא כבר ממתין</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>למה לבחור <span class="gw">בלידים שלנו?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.target, 'לידים ממוקדים', 'אנשים שחיפשו באופן אקטיבי ייעוץ משכנתאות, לא קהל אקראי.')}
      ${checkCard(IC.filter, 'אימות מלא', 'כל ליד עובר תהליך אימות לפני מסירה, כך שהפרטים נכונים והכוונה אמיתית.')}
      ${checkCard(IC.bolt, 'מסירה מיידית', 'הליד אצלכם תוך דקות מרגע יצירתו, כשהלקוח עוד בעניינים.')}
      ${checkCard(IC.shield, 'בלעדיות מלאה', 'כל ליד נמסר ליועץ אחד בלבד. סוף סוף לא מתחרים עם חמישה יועצים על אותו לקוח.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>סוגי הלידים <span class="gw">למשכנתאות</span></h2>
      <ul>
        <li><b>רוכשי דירה ראשונה.</b> זקוקים לליווי מלא בתהליך, הלקוח הנאמן ביותר.</li>
        <li><b>משפרי דיור.</b> מוכרים וקונים במקביל, צריכים תכנון מימון מדויק.</li>
        <li><b>משקיעים.</b> מחפשים מינוף חכם לנכס נוסף.</li>
        <li><b>מיחזור משכנתא.</b> רוצים לחסוך בהחזר החודשי, עסקה מהירה לסגירה.</li>
      </ul>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>יועצים <span class="gw">שכבר עובדים איתנו</span></h2></div>
    <div class="t-grid">
      <div class="t-card reveal"><div class="t-in">
        <p>"עובד עם BaliLead כבר שנה. הלידים איכותיים, מגיעים מהר והכי חשוב, ממירים. ממליץ בחום."</p>
        <div class="t-who"><b>יוסי כהן</b> · יועץ משכנתאות, תל אביב</div>
      </div></div>
      <div class="t-card reveal" style="--d:.12s"><div class="t-in">
        <p>"השירות מעולה, תמיד זמינים ודואגים שהלידים יהיו רלוונטיים. עליתי פי 3 בהכנסות."</p>
        <div class="t-who"><b>מיכל לוי</b> · יועצת משכנתאות, חיפה</div>
      </div></div>
    </div>
  </div>
</section>`,
  faq: [FAQ_COMMON.exclusive, FAQ_COMMON.when, FAQ_COMMON.invalid, FAQ_COMMON.pilot],
  articles: ['quality-mortgage-leads', 'hot-mortgage-leads', 'reduce-mortgage-lead-cost'],
  related: [['קניית-לידים/לידים-להלוואות/', 'לידים להלוואות'], ['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('לידים-לרואי-חשבון', {
  title: 'לידים לרואי חשבון - הגדלת תיק הלקוחות | BaliLead',
  desc: 'לידים איכותיים ומסוננים לרואי חשבון: פתיחת תיקים חדשים, העברת תיקים ולקוחות שמחפשים רו"ח. העברה תוך 24 שעות.',
  crumb: 'לידים לרואי חשבון', img: 'img-office.webp', alt: 'לידים לרואי חשבון - משרד יוקרתי של רואה חשבון', topic: 'רואי חשבון',
  h1: 'לידים לרואי חשבון, <span class="gw">תיק הלקוחות גדל מעצמו</span>',
  sub: 'אתם מצוינים במספרים, אנחנו מצוינים בלהביא לכם את מי שצריך אתכם. לקוחות שמחפשים רואה חשבון באופן אקטיבי, <b>ישירות למשרד שלכם</b>.',
  price: '₪50 עד ₪110',
  ctaTitle: 'רואי חשבון, <span class="gw">בואו נגדיל את התיק</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>איך התהליך <span class="gw">עובד בפועל?</span></h2></div>
    <div class="process-grid">
      <div class="step reveal"><h3>מיקוד וזיהוי</h3><p>מזהים עסקים ויחידים שמחפשים באופן אקטיבי שירותי ראיית חשבון.</p></div>
      <div class="step reveal" style="--d:.1s"><h3>סינון ראשוני</h3><p>בודקים שמדובר בלקוחות רלוונטיים לפי הקריטריונים שהגדרתם.</p></div>
      <div class="step reveal" style="--d:.2s"><h3>אימות פרטים</h3><p>מוודאים שהפרטים נכונים ושיש כוונה אמיתית לשכור שירות.</p></div>
      <div class="step reveal" style="--d:.3s"><h3>העברה אליכם</h3><p>הליד החם מגיע ישירות אליכם תוך 24 שעות לכל היותר.</p></div>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>אילו לידים <span class="gw">תקבלו?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.doc, 'העברת תיקים', 'עסקים שרוצים להחליף רואה חשבון: לא מרוצים מהשירות, מחפשים התמחות ספציפית או מחיר הוגן.')}
      ${checkCard(IC.users, 'פתיחת תיקים חדשים', 'עסקים חדשים ופרילנסרים שעוברים מעוסק פטור לעוסק מורשה וזקוקים לרו"ח.')}
      ${checkCard(IC.shekel, 'החזרי מס ושירותים', 'שכירים עם זכאות להחזר, הצהרות הון ושירותים נלווים שמכניסים עבודה שוטפת.')}
      ${checkCard(IC.chart, 'החזר השקעה מהיר', 'לקוח חדש אחד מכסה את עלות עשרות לידים. הגמישות מלאה, בלי מינימום ובלי התחייבות.')}
    </div>
  </div>
</section>`,
  faq: [FAQ_COMMON.exclusive, FAQ_COMMON.when, FAQ_COMMON.stop, FAQ_COMMON.pilot],
  related: [['פתיחת-עוסק-מורשה/', 'לידים לפתיחת עוסק מורשה'], ['מכירת-תיק-לרואי-חשבון/', 'העברת תיקים לרו"ח'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('פתיחת-עוסק-מורשה', {
  title: 'לידים חמים לפתיחת עוסק מורשה - לרואי חשבון ויועצים | BaliLead',
  desc: 'קבלו לידים איכותיים של אנשים שרוצים לפתוח עוסק מורשה. לידים מאומתים עם צורך מיידי, מושלם לרואי חשבון ויועצי מס.',
  crumb: 'פתיחת עוסק מורשה', img: 'hero-osek.webp', alt: 'לידים לפתיחת עוסק מורשה - נבט זהב צומח ממסמכים', topic: 'רואי חשבון',
  h1: 'לידים לפתיחת <span class="gw">עוסק מורשה</span>',
  sub: 'כל יום קמים בישראל עסקים חדשים, וכל אחד מהם צריך רואה חשבון. אנחנו תופסים אותם <b>ברגע ההחלטה</b> ומעבירים אליכם.',
  ctaTitle: 'רוצים את העסקים החדשים <span class="gw">לפני כולם?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="prose">
      <h2>הרגע המושלם <span class="gw">לתפוס לקוח</span></h2>
      <p>מי שפותח עוסק מורשה נמצא ברגע הכי פתוח שלו לשירותים מקצועיים: הוא צריך ליווי בפתיחת התיק, הנהלת חשבונות שוטפת ודוחות שנתיים. מי שיהיה שם ראשון, יישאר איתו שנים.</p>
      <p>אנחנו מפרסמים תוכן ומדריכים על פתיחת עוסק מורשה בפלטפורמות המובילות. הליד משאיר פרטים ומבקש שיחה חוזרת מרואה חשבון או יועץ מס. <b>100% בלעדי, 100% מתעניין.</b></p>
      <ul>
        <li>לידים יומיים בכמויות שאתם קובעים</li>
        <li>פרטי קשר מלאים ותיאור הצורך של הליד</li>
        <li>אפשר לעצור ולחדש את הזרימה בהתראה קצרה</li>
        <li>מנגנון זיכוי מסודר על לידים לא רלוונטיים</li>
      </ul>
    </div>
  </div>
</section>`,
  faq: [FAQ_COMMON.exclusive, ['אילו פרטים מגיעים עם הליד?', 'שם מלא, טלפון, תחום הפעילות של העסק החדש והצורך המיידי שלו. הכל מאומת לפני ההעברה.'], FAQ_COMMON.when, FAQ_COMMON.stop],
  related: [['לידים-לרואי-חשבון/', 'לידים לרואי חשבון'], ['מכירת-תיק-לרואי-חשבון/', 'העברת תיקים לרו"ח'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('מכירת-תיק-לרואי-חשבון', {
  title: 'העברת תיקים לרואי חשבון - לקוחות סגורים עם הסכם חתום | BaliLead',
  desc: 'העברת תיקים חשבונאיים סגורים למשרדי הנהלת חשבונות: הסכם חתום, הוראת קבע ופרטי לקוח מלאים. כ-50 תיקים חדשים בכל חודש.',
  crumb: 'העברת תיקים לרו"ח', img: 'hero-tik.webp', alt: 'העברת תיקים לרואי חשבון - תיק עסקים עם מסמכים זהובים', topic: 'רואי חשבון',
  h1: 'העברת תיקים לרואי חשבון, <span class="gw">לקוחות סגורים. לא לידים.</span>',
  sub: 'אנחנו לא מעבירים טלפונים, אנחנו מעבירים תיקים חתומים: הסכם עבודה, הוראת קבע ופרטי לקוח מלאים. <b>אתם רק מתחילים לעבוד.</b>',
  ctaTitle: 'משרדי הנהלת חשבונות, <span class="gw">מתחילים בפיילוט</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container stats-grid">
    <div class="stat reveal"><div class="stat-num" data-count="1500">1,500</div><div class="stat-label">עסקים שגייסנו למשרדי הנהלת חשבונות</div></div>
    <div class="stat reveal" style="--d:.12s"><div class="stat-num" data-count="50">50</div><div class="stat-label">תיקים חדשים מועברים בכל חודש</div></div>
    <div class="stat reveal" style="--d:.24s"><div class="stat-num" data-count="10">10</div><div class="stat-label">תיקים בחודשיים הראשונים, שלב הפיילוט</div></div>
  </div>
</section>
<section class="sec">
  <div class="container">
    <div class="sec-head reveal"><h2>מה מקבלים <span class="gw">עם כל תיק?</span></h2><p>הכל מסודר ומועבר בקבוצת WhatsApp ייעודית למשרד שלכם.</p></div>
    <div class="check-grid">
      ${checkCard(IC.doc, 'הסכם עבודה חתום', 'הלקוח כבר חתם על הסכם התקשרות עם המשרד שלכם. אין שיחות מכירה.')}
      ${checkCard(IC.card, 'הוראת קבע ואשראי', 'אמצעי תשלום חתום ומאומת, הגבייה מסודרת מהיום הראשון.')}
      ${checkCard(IC.users, 'פרטי לקוח מלאים', 'שם מלא, טלפון, מייל, תעודת זהות, רישיון וכל מסמך שנדרש לפתיחת התיק.')}
      ${checkCard(IC.shield, 'הגנת ביטולים', 'לקוח שביטל את ההסכם בשנה הראשונה? לא תחויבו בתשלום נוסף.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>איך מתחילים? <span class="gw">בזהירות, ובכוונה</span></h2>
      <p>אנחנו בוחנים כל משרד לפי שירות מקצועי, זמינות ותמיכה בלקוחות, כי הלקוחות שאנחנו מעבירים הם המוניטין שלנו.</p>
      <p>בחודשיים הראשונים נעביר כעשרה תיקים, נוודא שהשירות מצוין ושהלקוחות מרוצים, <b>ואז נפתח את הברז</b>.</p>
    </div>
  </div>
</section>`,
  faq: [['האם הפניות בלעדיות?', 'כן. כל תיק מועבר למשרד אחד בלבד, עם הסכם חתום על שם המשרד שלכם.'], ['אפשר לקבל המלצות ממשרדים שעובדים איתכם?', 'בשמחה. נחבר אתכם למשרדי הנהלת חשבונות שכבר מקבלים מאיתנו תיקים באופן שוטף.'], ['אפשר לעצור את הזרמת התיקים?', 'כן, בהתראה קצרה ובלי קנסות. הקצב נקבע לפי הקיבולת של המשרד שלכם.']],
  related: [['לידים-לרואי-חשבון/', 'לידים לרואי חשבון'], ['פתיחת-עוסק-מורשה/', 'לידים לפתיחת עוסק מורשה'], ['יצירת-קשר/', 'דברו איתנו']],
});

/* =================================================================
   Digital hub + service pages
================================================================= */
const digitalHubExtras = extrasFor('שיווק-דיגיטלי', {
  title: 'שיווק דיגיטלי - פתרונות מתקדמים להגדלת מכירות | BaliLead',
  desc: 'שירותי שיווק דיגיטלי מקצועיים לעסקים: קידום ממומן, SEO, רשתות חברתיות וכתבות ממירות. אסטרטגיה מותאמת ותוצאות מדידות.',
});

page('שיווק-דיגיטלי', {
  title: digitalHubExtras.title,
  desc: digitalHubExtras.desc,
  active: 'digital',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'שיווק דיגיטלי' }])],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'שיווק דיגיטלי' }],
    h1: 'שיווק דיגיטלי <span class="gw">שנמדד בלקוחות, לא בלייקים</span>',
    img: 'hero-social.webp', alt: 'שיווק דיגיטלי - רשת ערוצים דיגיטליים זוהרת בזהב',
    sub: 'אנחנו לא מוכרים "חשיפה". אנחנו בוחנים דבר אחד בלבד: <b>כמה לקוחות חדשים העסק שלכם הרוויח</b>. כל מודעה, דף נחיתה וכתבה נועדו למכור.',
  })}

<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>מה כוללת <span class="gw">המעטפת?</span></h2></div>
    <div class="bento">
      <a class="v-card feature col-6 reveal" href="${root}קידום-בגוגל/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.search}</div></div>
        <div><h3>קידום ממומן בגוגל</h3><p class="v-desc">להיות בדיוק מול מי שמחפש אתכם עכשיו, עם כוונת רכישה אמיתית.</p></div>
      </div></a>
      <a class="v-card col-6 reveal" style="--d:.08s" href="${root}קידום-אתרים-seo/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.chart}</div></div>
        <div><h3>קידום אתרים SEO</h3><p class="v-desc">נוכחות אורגנית שמביאה תנועה חינמית לאורך שנים.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" href="${root}קידום-בפייסבוק/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.fbf}</div></div>
        <div><h3>קידום בפייסבוק</h3><p class="v-desc">טרגוט מדויק בעלות נמוכה.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.06s" href="${root}פרסום-באינסטגרם/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.ig}</div></div>
        <div><h3>פרסום באינסטגרם</h3><p class="v-desc">הקהל הישראלי הכי פעיל.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.12s" href="${root}קידום-בלינקדאין/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.li}</div></div>
        <div><h3>קידום בלינקדאין</h3><p class="v-desc">B2B ומקבלי החלטות.</p></div>
      </div></a>
      <a class="v-card col-3 reveal" style="--d:.18s" href="${root}פרסום-בטאבולה-ואאוטבריין/"><div class="v-in">
        <div class="v-top"><div class="v-ic">${IC.rss}</div></div>
        <div><h3>טאבולה ואאוטבריין</h3><p class="v-desc">כתבות ממירות באתרי החדשות.</p></div>
      </div></a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container">
    <div class="prose">
      <h2>הדור הבא <span class="gw">של השיווק</span></h2>
      <p>פעם קהל היעד חיכה באתרי החדשות. היום הוא מפוזר בין גוגל, פייסבוק, אינסטגרם, לינקדאין וטיקטוק, וכל פלטפורמה דורשת שפה אחרת.</p>
      <p>הצוות שלנו מתמחה בכתיבת תוכן שיווקי אפקטיבי, ניהול קמפיינים ממומנים, פיצוח קהלי יעד ובניית נוכחות דיגיטלית <b>שממירה גולשים ללקוחות משלמים</b>.</p>
      <ul>
        <li>קמפיינים ממומנים מטורגטים בגוגל, פייסבוק, אינסטגרם ולינקדאין</li>
        <li>קידום אורגני שמחזק את הנוכחות הטבעית של המותג</li>
        <li>כתבות ממירות בטאבולה, אאוטבריין וכלי התקשורת המובילים</li>
      </ul>
    </div>
  </div>
</section>

${ctaSection(root, { title: 'מוכנים לשיווק <span class="gw">שמביא לקוחות?</span>' })}`,
});

function digitalPage(path, o) {
  const crumbs = [{ href: '', t: 'ראשי' }, { href: 'שיווק-דיגיטלי/', t: 'שיווק דיגיטלי' }, { t: o.crumb }];
  const x = extrasFor(path, o);
  page(path, {
    title: x.title || o.title, desc: x.desc || o.desc, active: 'digital',
    extraLd: [crumbsLd(crumbs), serviceLd(o.crumb, o.desc, path)],
    body: root => `
${pageHero(root, { crumbs, h1: o.h1, sub: o.sub, img: o.img, alt: o.alt })}
${o.sections(root)}
${deepSection(root, path)}
${o.faq ? faqBlock(o.faq) : ''}
${relatedBlock(root, o.related)}
${ctaSection(root, { title: o.ctaTitle, sub: 'השאירו פרטים ונחזור אליכם עם תוכנית פעולה מותאמת לעסק שלכם.', topic: o.topic || 'שיווק דיגיטלי לעסק שלי' })}`,
  });
}

digitalPage('קידום-בגוגל', {
  title: 'קידום ממומן בגוגל - קמפיינים שמביאים לידים | BaliLead',
  desc: 'ניהול קמפיינים ממומנים בגוגל: טרגוט מדויק לפי כוונת רכישה, הגנה מקליקים ריקים ומעל 50 עקרונות ליבה למקסום התקציב.',
  crumb: 'קידום ממומן בגוגל', img: 'hero-google.webp', alt: 'קידום ממומן בגוגל - זכוכית מגדלת זהב מעל תוצאות חיפוש',
  h1: 'קידום ממומן בגוגל, <span class="gw">בדיוק כשמחפשים אתכם</span>',
  sub: 'הקסם של גוגל פשוט: הלקוח כבר מחפש את השירות שלכם. התפקיד שלנו הוא שהוא ימצא <b>אתכם</b>, ולא את המתחרה.',
  ctaTitle: 'רוצים קמפיין גוגל <span class="gw">שמחזיר את ההשקעה?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>4 סיבות לפרסם <span class="gw">בגוגל</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.target, 'כוונת רכישה אמיתית', 'לידים ופניות רק מגולשים שמחפשים לקנות את השירות שלכם באופן מיידי.')}
      ${checkCard(IC.shekel, 'תקציב מנוצל נכון', 'התקציב נצרך רק כשגולשים רלוונטיים מגיעים לעמוד שלכם, לא על חשיפה עיוורת.')}
      ${checkCard(IC.shield, 'הגנה מקליקים ריקים', 'מנגנון חכם נגד הונאות קליקים וגולשים פיקטיביים. התקציב שלכם מוגן.')}
      ${checkCard(IC.chart, 'מעל 50 עקרונות ליבה', 'אנחנו מיישמים עשרות עקרונות אופטימיזציה כדי להוציא יותר לידים מאותו תקציב.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>למי זה <span class="gw">מתאים?</span></h2>
      <p>כמעט לכל עסק שנותן שירות או מוכר מוצר: טרגוט לפי מילות חיפוש, מיקום גיאוגרפי ואפילו סוג המכשיר. אפשר להוסיף גם פרסום גרפי (באנרים) לקהל שכבר נחשף אליכם.</p>
      <p><b>חוששים מקידום ממומן?</b> החשש כמעט תמיד נובע מקמפיינים שנוהלו בלי ידע. עם ניהול נכון ובדיקות שוטפות, גוגל היא מכונת הלידים היציבה ביותר שיש.</p>
    </div>
  </div>
</section>`,
  related: [['קידום-אתרים-seo/', 'קידום אתרים SEO'], ['קידום-בפייסבוק/', 'קידום בפייסבוק'], ['קניית-לידים/', 'קניית לידים מוכנים']],
});

digitalPage('קידום-אתרים-seo', {
  title: 'קידום אתרים SEO - תוצאות מוכחות במיקום ראשון | BaliLead',
  desc: 'שירותי קידום אתרים SEO מקצועיים: העלאת דירוגים בגוגל, הגדלת תנועה אורגנית ולידים איכותיים בלי לשלם על כל קליק.',
  crumb: 'קידום אתרים SEO', img: 'cover-marketing.webp', alt: 'קידום אתרים SEO - גרף צמיחה זהוב מעל סמארטפון',
  h1: 'קידום אתרים SEO, <span class="gw">תנועה שלא עולה כסף לקליק</span>',
  sub: 'קידום אורגני הוא סדרת פעולות שממקסמת את חשיפת האתר שלכם בגוגל, <b>בלי מימון על כל קליק</b>. נכס שעובד בשבילכם שנים.',
  ctaTitle: 'רוצים להיות <span class="gw">בעמוד הראשון בגוגל?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="prose">
      <h2>איך זה <span class="gw">עובד?</span></h2>
      <p>בכל חיפוש בגוגל מופיעות קודם התוצאות הממומנות, ומיד אחריהן התוצאות האורגניות. גולשים סומכים על התוצאות האורגניות יותר, והקליק עליהן לא עולה לכם שקל.</p>
      <p>כדי שהאתר שלכם יטפס לראש הרשימה, אנחנו משלבים <b>כתיבת תוכן מקדם ושיווקי</b>, אופטימיזציה טכנית ובניית סמכות לאורך זמן.</p>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>מה חשוב באמת <span class="gw">בקידום אתרים?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.doc, 'תוכן שעובד', 'מאמרים ועמודים שכתובים גם לגולש וגם למנוע החיפוש, עם מילות מפתח בעלות כוונת רכישה.')}
      ${checkCard(IC.bolt, 'תשתית טכנית', 'מהירות טעינה, מובייל תקין ומבנה אתר שגוגל אוהב לסרוק.')}
      ${checkCard(IC.chart, 'שקיפות בתוצאות', 'משווק טוב מראה לכם דירוגים, תנועה ולידים. אצלנו תראו את הנתונים בכל שלב.')}
      ${checkCard(IC.target, 'סבלנות אסטרטגית', 'SEO הוא מרתון שמנצח בענק: כל חודש הנכס שלכם שווה יותר.')}
    </div>
  </div>
</section>`,
  related: [['קידום-בגוגל/', 'קידום ממומן בגוגל'], ['פרסום-בטאבולה-ואאוטבריין/', 'טאבולה ואאוטבריין'], ['קניית-לידים/', 'קניית לידים מוכנים']],
});

digitalPage('קידום-בפייסבוק', {
  title: 'קידום בפייסבוק - לידים חמים ממוקדים במחיר משתלם | BaliLead',
  desc: 'קידום עסקים בפייסבוק עם תוצאות מוכחות: פרסום ממוקד לפי קהל, גיל, אזור ותחומי עניין. לידים איכותיים בעלות נמוכה.',
  crumb: 'קידום בפייסבוק', img: 'hero-social.webp', alt: 'קידום בפייסבוק - כדורי זהב של לייקים ושיתופים',
  h1: 'קידום בפייסבוק, <span class="gw">הקהל המדויק בעלות הנמוכה</span>',
  sub: 'בפייסבוק אפשר לטרגט קהל לפי אזור, גיל, מין, תחומי עניין ואפילו סוג מכשיר. <b>חשיפה לאלפי גולשים רלוונטיים בכל יום</b>, בעלות מהנמוכות בשוק.',
  ctaTitle: 'רוצים קמפיין פייסבוק <span class="gw">שמייצר לידים?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>5 סיבות לפרסום ממומן <span class="gw">בפייסבוק</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.target, 'טרגוט כירורגי', 'קהל יעד לפי גאוגרפיה, דמוגרפיה, תחומי עניין והתנהגות. המודעה מגיעה בדיוק למי שצריך.')}
      ${checkCard(IC.shekel, 'עלות נמוכה', 'עלות קמפיינים נמוכה יחסית לכל פלטפורמה אחרת, מתאים גם לעסקים קטנים.')}
      ${checkCard(IC.users, 'חשיפה יומית ענקית', 'אלפי גולשים רלוונטיים רואים אתכם בכל יום, והמותג נבנה תוך כדי.')}
      ${checkCard(IC.bolt, 'לידים ישירות מהמודעה', 'טפסי לידים מובנים בפייסבוק, הלקוח משאיר פרטים בלי לצאת מהפיד.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>מה אנחנו <span class="gw">עושים בשבילכם?</span></h2>
      <p>בונים עמוד עסקי מקצועי, כותבים קופי שמוכר, מעצבים קריאייטיב שעוצר את הגלילה, ומנהלים את הקמפיינים עם בדיקות יסודיות שוטפות. <b>כשקמפיין מנוהל נכון, השמיים הם הגבול.</b></p>
    </div>
  </div>
</section>`,
  related: [['פרסום-באינסטגרם/', 'פרסום באינסטגרם'], ['קידום-בגוגל/', 'קידום ממומן בגוגל'], ['קניית-לידים/', 'קניית לידים מוכנים']],
});

digitalPage('פרסום-באינסטגרם', {
  title: 'פרסום באינסטגרם - לידים איכותיים מהפלטפורמה הכי חמה | BaliLeads',
  desc: 'פרסום ממוקד באינסטגרם: מיליוני משתמשים ישראליים פעילים, תקציב נמוך יחסית וטרגוט מדויק. לידים חמים כבר היום.',
  crumb: 'פרסום באינסטגרם', img: 'hero-social.webp', alt: 'פרסום באינסטגרם - רשת חברתית זוהרת בזהב',
  h1: 'פרסום באינסטגרם, <span class="gw">איפה שכולם נמצאים</span>',
  sub: 'מיליוני ישראלים פעילים באינסטגרם מדי יום. סטוריז, רילס ופיד, <b>המותג שלכם צריך להיות שם</b>, והתקציב נמוך משחושבים.',
  ctaTitle: 'רוצים שהעסק שלכם <span class="gw">יככב באינסטגרם?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>למה דווקא <span class="gw">אינסטגרם?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.users, 'קהל ישראלי ענק', 'מיליוני משתמשים ישראליים רשומים ופעילים מאוד, מהאפליקציות המובילות בארץ.')}
      ${checkCard(IC.shekel, 'תקציב נגיש', 'תקציב הפרסום הנדרש נמוך יחסית לרשתות אחרות, נהדר להתחלה ולסקייל.')}
      ${checkCard(IC.target, 'טרגוט מדויק', 'קמפיין ממומן קל להקמה עם קהלי יעד ספציפיים ורלוונטיים לעסק שלכם.')}
      ${checkCard(IC.bolt, 'פורמטים ממירים', 'סטוריז, רילס ושיתופי פעולה, הפורמטים שהקהל באמת צורך היום.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>אינסטגרם ופייסבוק, <span class="gw">ביחד חזק יותר</span></h2>
      <p>אינסטגרם שייכת למטא, אותו מערך פרסום של פייסבוק. אנחנו בונים קמפיין אחד חכם שרץ בשתי הפלטפורמות, לומד איפה הקהל שלכם ממיר טוב יותר, ומסיט לשם את התקציב אוטומטית.</p>
    </div>
  </div>
</section>`,
  related: [['קידום-בפייסבוק/', 'קידום בפייסבוק'], ['קידום-בלינקדאין/', 'קידום בלינקדאין'], ['קניית-לידים/', 'קניית לידים מוכנים']],
});

digitalPage('קידום-בלינקדאין', {
  title: 'קידום בלינקדאין - לידים איכותיים B2B ממקבלי החלטות | BaliLead',
  desc: 'קידום ממוקד בלינקדאין: גישה ישירה למקבלי החלטות, פרסום B2B מדויק ותוצאות מדידות לעסק שלך.',
  crumb: 'קידום בלינקדאין', img: 'hero-social.webp', alt: 'קידום בלינקדאין - רשת קשרים עסקית מוזהבת',
  h1: 'קידום בלינקדאין, <span class="gw">ישר למקבלי ההחלטות</span>',
  sub: 'לינקדאין היא הרשת העסקית הגדולה בעולם, ומזמן לא רק למחפשי עבודה. אם הלקוח שלכם הוא <b>עסק או בעל תפקיד</b>, הוא שם.',
  ctaTitle: 'רוצים לידים עסקיים <span class="gw">מלינקדאין?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="prose">
      <h2>למי הפרסום בלינקדאין <span class="gw">מתאים?</span></h2>
      <p>בראש ובראשונה לשיווק בין עסקים (B2B), אבל גם לפרסום לקרייריסטים ובעלי מקצוע: פיננסים, בנקאות, נדל"ן, גיוס והשמה, ייעוץ עסקי ושירותים מקצועיים.</p>
      <p>הכוח של לינקדאין הוא בטרגוט לפי <b>תפקיד, חברה, ותק וענף</b>. אין עוד פלטפורמה שמאפשרת לדבר ישירות עם סמנכ"ל כספים או בעלים של חברה.</p>
      <ul>
        <li>קמפיינים ממומנים בממשק ניהול מתקדם, כמו בפייסבוק</li>
        <li>בניית פרופיל חברה ונוכחות תוכן מקצועית</li>
        <li>מודעות לידים ייעודיות עם טפסים מובנים</li>
      </ul>
    </div>
  </div>
</section>`,
  related: [['קידום-בפייסבוק/', 'קידום בפייסבוק'], ['קידום-בגוגל/', 'קידום ממומן בגוגל'], ['קניית-לידים/', 'קניית לידים מוכנים']],
});

digitalPage('פרסום-בטאבולה-ואאוטבריין', {
  title: 'פרסום בטאבולה ואאוטבריין - לידים מכתבות ממירות | BaliLead',
  desc: 'פרסום נייטיב בטאבולה ואאוטבריין: כתבות ממירות באתרי החדשות הגדולים בישראל עם טפסי לידים. לקוחות עם כוונת רכישה גבוהה.',
  crumb: 'טאבולה ואאוטבריין', img: 'hero-news.webp', alt: 'פרסום בטאבולה ואאוטבריין - כתבה זוהרת בעיתון',
  h1: 'טאבולה ואאוטבריין, <span class="gw">הלידים שמגיעים מהחדשות</span>',
  sub: 'הכתבות הממומנות שאתם רואים ב-ynet ובכלכליסט? זה המגרש שלנו. כתבה ממירה עם טופס לידים בסופה, <b>והלקוח מגיע אליכם למייל</b>.',
  ctaTitle: 'רוצים כתבה ממירה <span class="gw">באתרי החדשות?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="prose">
      <h2>איך זה <span class="gw">עובד?</span></h2>
      <p>טאבולה ואאוטבריין הן פלטפורמות הפרסום הנייטיב הגדולות בעולם. המודעות מופיעות בסוף כתבות באתרי חדשות ותוכן מובילים, בדיוק כשהגולש פנוי לתוכן חדש.</p>
      <p>הגולש לוחץ, מגיע לכתבה ממירה שכתבנו עבורכם, משתכנע, וממלא <b>טופס לידים בסוף הכתבה</b>. הפרטים מגיעים ישירות אליכם.</p>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><h2>למה נייטיב <span class="gw">ממיר כל כך טוב?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.doc, 'תוכן, לא באנר', 'כתבה בונה אמון ומסבירה ערך. הגולש מגיע לטופס אחרי שהשתכנע, לא לפני.')}
      ${checkCard(IC.users, 'קהל עצום', 'אתרי החדשות הגדולים בישראל, מיליוני חשיפות לקהל איכותי וקורא.')}
      ${checkCard(IC.target, 'כוונה גבוהה', 'מי שקרא כתבה שלמה והשאיר פרטים הוא ליד חם באמת.')}
      ${checkCard(IC.shekel, 'חיסכון בעלויות', 'עלות ליד נמוכה משמעותית מקמפיינים ישירים ברוב התחומים הפיננסיים.')}
    </div>
  </div>
</section>`,
  related: [['קידום-בגוגל/', 'קידום ממומן בגוגל'], ['קידום-אתרים-seo/', 'קידום אתרים SEO'], ['קניית-לידים/', 'קניית לידים מוכנים']],
});

/* =================================================================
   מחירון 2026
================================================================= */
const PRICES = PRICE_GROUPS;
const priceRows = arr => arr.map(([n, p]) => `<div class="pg-row"><span class="n">${n}</span><span class="p">${p}</span></div>`).join('');

page('מחירון-לידים', {
  title: 'מחירון לידים מעודכן 2026 - שקיפות מלאה | BaliLead',
  desc: 'מחירון לידים מעודכן לשנת 2026: כל 29 התחומים עם טווחי מחיר לליד. מהיחידים בענף שמפרסמים מחירון מלא ושקוף.',
  active: 'pricing',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'מחירון לידים 2026' }])],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'מחירון לידים 2026' }],
    h1: 'מחירון לידים <span class="gw">מעודכן לשנת 2026</span>',
    img: 'cover-loans.webp', alt: 'מחירון לידים 2026 - ערימות מטבעות זהב',
    sub: 'אנחנו מהיחידים בענף שמפרסמים מחירון מלא. המחיר נקבע לפי תחום, רמת תחרות ואיכות הסינון, <b>ואין הפתעות בהמשך</b>.',
    ctas: false,
  })}

<section class="sec-tight">
  <div class="container">
    <div class="price-groups">
      <div class="pg reveal"><div class="pg-in"><h4>פיננסים וביטוח</h4>${priceRows(PRICES.fin)}</div></div>
      <div class="pg reveal" style="--d:.1s"><div class="pg-in"><h4>משפט ורפואה</h4>${priceRows(PRICES.med)}</div></div>
      <div class="pg reveal" style="--d:.2s"><div class="pg-in"><h4>עסקים ושירותים</h4>${priceRows(PRICES.biz)}</div></div>
    </div>
    <p class="price-note reveal" style="--d:.1s">${IC.info} המחיר הסופי תלוי בפילוח, באזור ובכמות. מתלבטים? מתחילים בפיילוט ניסיון ורואים תוצאות לפני שמתחייבים.</p>
  </div>
</section>

<section class="sec" style="padding-top:clamp(40px,5vw,60px)">
  <div class="container">
    <div class="prose">
      <h2>מה קובע את <span class="gw">מחיר הליד?</span></h2>
      <ul>
        <li><b>רמת התחרות בתחום.</b> ככל שיותר מפרסמים נלחמים על אותו לקוח, עלות ייצור הליד עולה.</li>
        <li><b>עומק הסינון.</b> ליד עם שאלון זכאות מפורט שווה יותר מהשארת פרטים בסיסית.</li>
        <li><b>הפילוח שביקשתם.</b> מיקוד גיאוגרפי או פרופיל ספציפי מצמצם את הקהל ומעלה את המחיר.</li>
        <li><b>כמות ההזמנה.</b> בהזמנות גדולות ושוטפות ניתן לרדת בעלות פר ליד.</li>
      </ul>
    </div>
  </div>
</section>

${ctaSection(root, { title: 'רוצים הצעת מחיר <span class="gw">מדויקת לתחום שלכם?</span>' })}`,
});

/* =================================================================
   חברת לידים (מודל CPL) - עמוד SEO חדש
================================================================= */
const CPL_FAQ = [
  ['מה זה מודל CPL?', 'Cost Per Lead: תשלום עבור ליד מאומת שהתעניין בשירות שלכם, במקום תשלום על חשיפות (CPM), על זמן פרסום (CPT) או על קליקים (CPC). משלמים על תוצאה בלבד.'],
  ['במה CPL עדיף על קמפיין ממומן רגיל?', 'בקמפיין רגיל אתם משלמים גם על גולשים שלא השאירו פרטים. במודל CPL כל שקל קונה ליד אמיתי עם פרטי קשר, כך שקל מאוד למדוד את ההחזר על ההשקעה: כמות סגירות מול הוצאה על לידים.'],
  ['איך אני יודע שהליד אמיתי?', 'כל ליד עובר סינון ואימות לפני ההעברה, כולל בדיקת תקינות מספר הטלפון והתאמה לתנאי הסף שהגדרתם. ליד פסול מזוכה לפי מנגנון שנקבע מראש.'],
  ['האם הלידים בלעדיים לי?', 'כן. כל ליד נמכר לעסק אחד בלבד. אין "ידיים שניות" ואין תחרות עם עסקים נוספים על אותו לקוח.'],
  ['כמה עולה ליד?', 'תלוי בתחום וברמת התחרות: מ-10 ₪ לליד בתחומים רחבים ועד 250 ₪ בתחומים תחרותיים במיוחד. המחירון המלא לשנת 2026 מפורסם באתר, שקוף לגמרי.'],
];

page('חברת-לידים', {
  title: 'חברת לידים במודל CPL - משלמים רק על לקוחות מתעניינים | BaliLead',
  desc: 'מחפשים חברת לידים? באלי ליד עובדת במודל CPL: לידים בלעדיים ומאומתים מהפלטפורמות המובילות בישראל, תשלום פר ליד בלבד. כך זה עובד.',
  active: 'leads',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'חברת לידים' }]), faqLd(CPL_FAQ), serviceLd('חברת לידים במודל CPL', 'אספקת לידים בלעדיים ומאומתים במודל תשלום פר ליד', 'חברת-לידים')],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'חברת לידים' }],
    h1: 'חברת לידים במודל CPL: <span class="gw">משלמים רק על תוצאה</span>',
    img: 'img-magnet.webp', alt: 'חברת לידים במודל CPL - מגנט זהב מושך לקוחות',
    sub: 'מבול של לידים זה נחמד. אבל האם הם איכותיים? אנחנו עובדים במודל אחד בלבד: <b>תשלום עבור ליד מאומת שהתעניין בכם</b>. לא חשיפות, לא קליקים, לא הבטחות.',
  })}

<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>ארבעה מודלים בשוק, <span class="gw">רק אחד עובד בשבילכם</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.users, 'CPM: תשלום על חשיפות', 'משלמים על כמות הצגות של המודעה, בלי שום קשר לשאלה אם מישהו התעניין. טוב למיתוג, רע ללידים.')}
      ${checkCard(IC.clock, 'CPT: תשלום על זמן', 'משלמים על משך חשיפת הפרסום, גם אם אף אחד לא הרים טלפון. הסיכון כולו עליכם.')}
      ${checkCard(IC.target, 'CPC: תשלום על קליקים', 'משלמים על כל לחיצה, כולל סקרנים ומתחרים. מצוין לקמפיינים בגוגל, אבל קליק הוא עדיין לא לקוח.')}
      ${checkCard(IC.bolt, 'CPL: תשלום על ליד מאומת', 'המודל שלנו. משלמים אך ורק על לקוח פוטנציאלי שהשאיר פרטים, עבר אימות ורוצה לשמוע מכם. תוצאה, לא הבטחה.')}
    </div>
  </div>
</section>

<section class="sec">
  <div class="container">
    <div class="sec-head reveal">
      <h2>מסע הליד: <span class="gw">מהכתבה ועד השיחה שלכם</span></h2>
      <p>כל ליד שמגיע אליכם עבר את המסלול המלא הזה.</p>
    </div>
    <div class="process-grid">
      <div class="step reveal"><h3>חשיפה לתוכן</h3><p>הליד נחשף לכתבה או קמפיין שלנו בפלטפורמות המובילות: אתרי החדשות הגדולים, גוגל, פייסבוק ואינסטגרם.</p></div>
      <div class="step reveal" style="--d:.1s"><h3>בדיקת התאמה</h3><p>הוא מוזמן לבדוק זכאות או התאמה לשירות, ועונה על שאלון עם שאלות מסננות אמיתיות.</p></div>
      <div class="step reveal" style="--d:.2s"><h3>אימות פרטים</h3><p>המספר והפרטים מאומתים, כך שאתם יודעים שמדובר באדם אמיתי עם כוונה אמיתית.</p></div>
      <div class="step reveal" style="--d:.3s"><h3>העברה בלעדית</h3><p>הליד נוחת אצלכם בזמן אמת: מייל, SMS ו-CRM. בלעדי לכם בלבד, בלי ידיים שניות.</p></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>איך בוחרים <span class="gw">ספק לידים?</span></h2>
      <p>שוק הלידים בישראל מלא בהבטחות. לפני שסוגרים עם חברת לידים, ודאו שאתם מקבלים תשובות ברורות לשאלות האלה:</p>
      <ul>
        <li><b>האם המודל הוא CPL אמיתי?</b> תשלום פר ליד מאומת, לא פר חשיפה ולא פר קליק.</li>
        <li><b>האם הלידים בלעדיים?</b> ליד שנמכר לחמישה עסקים שווה קרוב לאפס.</li>
        <li><b>האם המחירון שקוף?</b> אנחנו מהיחידים בענף שמפרסמים מחירון מלא לכל 29 התחומים.</li>
        <li><b>מה קורה עם ליד פסול?</b> מנגנון זיכוי מסודר שנקבע מראש, לא ויכוחים בדיעבד.</li>
        <li><b>האם אפשר להתחיל בקטן?</b> פיילוט ניסיון לפני התחייבות הוא הדרך הנכונה לבדוק ספק.</li>
      </ul>
    </div>
  </div>
</section>

${faqBlock(CPL_FAQ)}
${articlesStrip(root, ['מה-זה-לידים', 'what-are-quality-leads', 'cold-to-hot-leads'], 'מאמרים שיעשו לכם סדר')}
${relatedBlock(root, [['קניית-לידים/', 'קניית לידים, כל התחומים'], ['מחירון-לידים/', 'מחירון 2026'], ['יצירת-קשר/', 'דברו איתנו']])}
${ctaSection(root, { title: 'רוצים לראות את המודל <span class="gw">עובד בשבילכם?</span>' })}`,
});

/* =================================================================
   מגזין + עמודי מאמרים מלאים
================================================================= */
page('עדכונים-חמים', {
  title: 'עדכונים חמים - המגזין של עולם הלידים | BaliLead',
  desc: 'המגזין של BaliLead: מדריכים, מגמות שוק וטיפים מעולם הלידים והשיווק הדיגיטלי. ידע שהופך קמפיינים ללקוחות.',
  active: 'magazine',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'המגזין' }])],
  body: root => {
    const featured = 'מה-זה-לידים';
    const fa = RAW_ARTICLES.find(x => x.slug === featured); const fm = getMeta(featured);
    const rest = LISTED_ARTICLES.map(a => a.slug).filter(s => s !== featured);
    const cats = ['הכל', ...new Set(rest.map(s => getMeta(s).cat))];
    return `
${pageHero(root, {
      crumbs: [{ href: '', t: 'ראשי' }, { t: 'המגזין' }],
      h1: 'המגזין: <span class="gw">ידע זה כוח</span>',
      sub: `${LISTED_ARTICLES.length} מדריכים ומאמרים מהשטח על לידים, המרות ושיווק דיגיטלי, <b>בלי סיסמאות ריקות</b>.`,
      ctas: false,
    })}

<section class="sec-tight" style="padding-bottom:clamp(70px,9vw,120px)">
  <div class="container">
    <a class="art-featured reveal" href="${root}${featured}/">
      <div class="af-in">
        <div class="af-txt">
          <span class="a-tag">המדריך המרכזי · ${fm.cat} · ${readMinutes(fa.blocks)} דקות קריאה</span>
          <h3>${artTitle(fa)}</h3>
          <p>${fm.teaser}</p>
          <span class="a-read">לקריאת המאמר ${IC.crumb}</span>
        </div>
        <div class="af-img"><img src="${root}assets/${fm.cover}" alt="${artTitle(fa)}" loading="lazy"></div>
      </div>
    </a>
    <div class="dig-row reveal" id="magFilter" style="margin-bottom:26px">
      ${cats.map((c, i) => `<button class="dig-pill" data-fcat="${c}" style="cursor:pointer;border:none;font-family:'Assistant';${i === 0 ? 'background:rgba(217,164,91,.16);color:var(--gold2)' : ''}">${c}</button>`).join('')}
    </div>
    <div class="art-grid" id="magGrid">
      ${rest.map((s, i) => artCard(root, s, i)).join('')}
    </div>
  </div>
</section>
<script>
(function(){
  var pills = document.querySelectorAll('#magFilter [data-fcat]');
  var cards = document.querySelectorAll('#magGrid .art-card');
  pills.forEach(function(p){
    p.addEventListener('click', function(){
      var cat = p.getAttribute('data-fcat');
      pills.forEach(function(x){ x.style.background=''; x.style.color=''; });
      p.style.background = 'rgba(217,164,91,.16)'; p.style.color = 'var(--gold2)';
      cards.forEach(function(c){
        c.style.display = (cat === 'הכל' || c.getAttribute('data-cat') === cat) ? '' : 'none';
      });
    });
  });
})();
</script>

${ctaSection(root, { title: 'מעדיפים שנעשה את זה <span class="gw">בשבילכם?</span>' })}`;
  },
});

/* Article pages */
const HOME_TITLE = 'לידים רותחים שיעזרו לעסק שלך לצמוח - BaliLeads';
for (const art of RAW_ARTICLES) {
  const m = getMeta(art.slug);
  const artBody = splitFaq(art.blocks);
  const crumbs = [{ href: '', t: 'ראשי' }, { href: 'עדכונים-חמים/', t: 'המגזין' }, { t: m.cat }];
  const mins = readMinutes(art.blocks);
  const artDate = LASTMOD[art.slug] || '2025-04-27';
  const artPageTitle = (!art.title || art.title === HOME_TITLE) ? artTitle(art) + ' | BaliLead' : art.title;
  page(art.slug, {
    title: artPageTitle,
    desc: (art.desc && art.desc.length > 20) ? art.desc : m.teaser,
    active: 'magazine',
    ogImage: GH + 'assets/' + m.cover,
    extraLd: [
      crumbsLd(crumbs),
      ...(artBody.faq.length ? [faqLd(artBody.faq)] : []),
      {
        '@context': 'https://schema.org', '@type': 'Article',
        headline: artTitle(art), description: (art.desc && art.desc.length > 20) ? art.desc : m.teaser,
        datePublished: artDate, dateModified: artDate,
        image: GH + 'assets/' + m.cover,
        author: { '@type': 'Organization', name: 'BaliLeads' },
        publisher: { '@type': 'Organization', name: 'BaliLeads', logo: { '@type': 'ImageObject', url: 'https://balilead.co.il/wp-content/uploads/2021/10/cropped-לוגו-שקוף.png' } },
        mainEntityOfPage: canon(art.slug),
      },
    ],
    body: root => `
${pageHero(root, {
      crumbs,
      metaLine: `<span class="am-cat">${m.cat}</span><span>${mins} דקות קריאה</span>`,
      h1: artTitle(art),
      sub: m.teaser,
      ctas: false,
      img: m.cover, alt: artTitle(art) + ' - מאמר במגזין באלי ליד',
    })}

<section class="sec-tight">
  <div class="container deep-grid">
    <div class="prose art-body reveal" style="--d:.08s">
      ${autolink(cleanArticleBlocks(artBody.blocks), root, art.slug)}
    </div>
    ${sideMenu(root, art.slug)}
  </div>
</section>
${artBody.faq.length ? faqBlock(artBody.faq) : ''}

${articlesStrip(root, LISTED_ARTICLES.map(a => a.slug).filter(s => s !== art.slug && getMeta(s).cat === m.cat).slice(0, 3).concat(LISTED_ARTICLES.map(a => a.slug).filter(s => s !== art.slug && getMeta(s).cat !== m.cat)).slice(0, 3), 'עוד מהמגזין')}
${relatedBlock(root, m.services.concat([['מחירון-לידים/', 'מחירון 2026']]))}
${ctaSection(root, { title: 'רוצים שהלידים יגיעו <span class="gw">אליכם מעכשיו?</span>', topic: ({'ביטוח':'ביטוח','משכנתאות':'משכנתאות','הלוואות':'הלוואות','החזרי מס':'החזרי מס','רואי חשבון':'רואי חשבון','שיווק דיגיטלי':'שיווק דיגיטלי לעסק שלי'})[m.cat] })}`,
  });
}

/* =================================================================
   יצירת קשר
================================================================= */
page('יצירת-קשר', {
  title: 'יצירת קשר - קבל לידים איכותיים לעסק שלך | BaliLead',
  desc: 'צרו קשר עם BaliLead: טלפון 058-4700706, מייל info@balilead.co.il. שירות הלקוחות פעיל א-ה 09:00-16:00, מענה מובטח תוך 24 שעות.',
  active: 'contact',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'יצירת קשר' }])],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'יצירת קשר' }],
    h1: 'דברו איתנו, <span class="gw">אנחנו כאן בשבילכם</span>',
    img: 'img-office.webp', alt: 'יצירת קשר עם באלי ליד - המשרד שלנו',
    sub: 'שיחת ייעוץ, הצעת מחיר או סתם שאלה. עונים מהר, <b>ופניות דחופות מטופלות גם מחוץ לשעות הפעילות</b>.',
    ctas: false,
  })}

<section class="sec-tight">
  <div class="container">
    <div class="contact-cards">
      <div class="cc reveal"><div class="cc-in">
        <div class="c-ic">${IC.phone}</div><h3>טלפון ישיר</h3>
        <a href="${SITE.phoneHref}">${SITE.phone}</a>
      </div></div>
      <div class="cc reveal" style="--d:.08s"><div class="cc-in">
        <div class="c-ic">${IC.mail}</div><h3>דוא"ל עסקי</h3>
        <a href="mailto:${SITE.email}">${SITE.email}</a>
      </div></div>
      <div class="cc reveal" style="--d:.16s"><div class="cc-in">
        <div class="c-ic">${IC.pin}</div><h3>המשרד הראשי</h3>
        <p>${SITE.address}</p>
      </div></div>
      <div class="cc reveal" style="--d:.24s"><div class="cc-in">
        <div class="c-ic">${IC.clock}</div><h3>שעות פעילות</h3>
        <p>ימים א' עד ה', 09:00 עד 16:00</p>
      </div></div>
    </div>
  </div>
</section>

${ctaSection(root, { title: 'השאירו פרטים וקבלו <span class="gw">הצעת מחיר מותאמת</span>', sub: 'מענה מובטח תוך 24 שעות. הפרטים שלכם נשארים אצלנו בלבד.' })}`,
});

/* =================================================================
   הצהרת נגישות
================================================================= */
page('הצהרת-נגישות', {
  title: 'הצהרת נגישות - balilead.co.il',
  desc: 'הצהרת הנגישות של אתר BaliLead: התאמות נגישות לפי ת"י 5568 ברמת AA ומסמך WCAG 2.0, פרטי אחראי הנגישות ודרכי פנייה.',
  active: '',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'הצהרת נגישות' }])],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'הצהרת נגישות' }],
    h1: 'הצהרת <span class="gw">נגישות</span>',
    img: 'img-office.webp', alt: 'הצהרת הנגישות של אתר באלי ליד',
    sub: 'BALILEAD מעוניינת לספק שירות שוויוני לכל לקוחותיה באשר הם.',
    ctas: false,
  })}

<section class="sec-tight" style="padding-bottom:clamp(80px,10vw,140px)">
  <div class="container">
    <div class="prose">
      <p>אתר זה עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג 2013. התאמות הנגישות בוצעו על פי המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA ומסמך WCAG 2.0 הבינלאומי.</p>
      <h2>רכיב הנגישות באתר</h2>
      <p>בצד האתר מוצב כפתור נגישות צף (סמל נגישות על רקע כחול) הפותח תפריט התאמות, הנשמרות בין ביקורים:</p>
      <ul>
        <li>הגדלת טקסט בשתי רמות</li>
        <li>מצב ניגודיות גבוהה (צהוב על שחור)</li>
        <li>תצוגת גווני אפור</li>
        <li>הדגשת קישורים בקו תחתון</li>
        <li>החלפה לפונט קריא</li>
        <li>עצירת אנימציות, תנועה ווידאו</li>
        <li>איפוס כל ההגדרות בלחיצה אחת</li>
      </ul>
      <h2>דרכי הנגשה נוספות</h2>
      <ul>
        <li>האתר מותאם לתצוגה בכל דפדפן מודרני ובמכשירי טלפון סלולריים, ונבדק בדפדפנים הנפוצים.</li>
        <li>האתר תומך בטכנולוגיות מסייעות ובהפעלה באמצעות מקלדת, כולל קישור "דילוג לתוכן המרכזי" ומקש Esc לסגירת חלונות.</li>
        <li>ההתאמות כוללות היררכיית כותרות תקינה, טקסט חלופי לתמונות, ניגודיות צבעים גבוהה והתאמה אוטומטית למצב הפחתת תנועה (prefers-reduced-motion).</li>
      </ul>
      <h2>אחראי נגישות</h2>
      <p>למרות מאמצינו להנגיש את האתר באופן מלא, ייתכן שיתגלו חלקים שאינם נגישים. אם נתקלתם בבעיה, אנא פנו לאחראי הנגישות:</p>
      <ul>
        <li><b>שם:</b> צחי לוי</li>
        <li><b>טלפון:</b> 058-4700706</li>
        <li><b>דוא"ל:</b> info@balilead.co.il</li>
      </ul>
      <p>הצהרת הנגישות עודכנה לאחרונה בתאריך 24.08.2026.</p>
    </div>
  </div>
</section>`,
});

/* =================================================================
   לידים לבניית אתרים (עמוד שהיה חסר מול הוורדפרס)
================================================================= */
leadPage('קניית-לידים/לידים-לבניית-אתרים', {
  title: 'לידים לבניית אתרים - לקוחות שרוצים לבנות אתר | BaliLead',
  desc: 'לידים איכותיים לחברות ובוני אתרים: עסקים שמחפשים אתר חדש או שדרוג. לידים בלעדיים ומסוננים עם תקציב אמיתי.',
  crumb: 'לידים לבניית אתרים', img: 'hero-web.webp', alt: 'לידים לבניית אתרים - חלון דפדפן מקווי זהב', topic: 'בניית אתרים',
  h1: 'לידים לבניית אתרים, <span class="gw">לקוחות עם פרויקט ביד</span>',
  sub: 'בוני אתרים ומשרדי דיגיטל מקבלים מאיתנו עסקים שכבר החליטו שהם צריכים אתר, <b>ורק מחפשים למי לתת את הפרויקט</b>.',
  price: '₪70 עד ₪175',
  ctaTitle: 'בונים אתרים? <span class="gw">הפרויקט הבא מחכה</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="check-grid">
      ${checkCard(IC.doc, 'צורך מוגדר', 'הליד ציין מה הוא צריך: אתר תדמית, חנות, דף נחיתה או שדרוג לאתר קיים.')}
      ${checkCard(IC.shekel, 'תקציב אמיתי', 'שאלות סינון על טווח התקציב מוודאות שאתם מדברים עם לקוח רציני.')}
      ${checkCard(IC.bolt, 'העברה בזמן אמת', 'הליד מגיע אליכם תוך דקות, לפני שהוא ממשיך לחפש בגוגל.')}
      ${checkCard(IC.shield, 'בלעדיות מלאה', 'כל פרויקט מוצע לספק אחד בלבד. לא מתחרים על אותו לקוח.')}
    </div>
  </div>
</section>`,
  faq: [FAQ_COMMON.exclusive, FAQ_COMMON.when, FAQ_COMMON.invalid, FAQ_COMMON.pilot],
  related: [['בניית-אתרים/', 'שירות בניית אתרים שלנו'], ['קניית-לידים/', 'קניית לידים, כל התחומים'], ['מחירון-לידים/', 'מחירון 2026']],
});

/* =================================================================
   פתרונות דיגיטל חדשים (סמכות מלאה בתחום)
================================================================= */
digitalPage('בניית-אתרים', {
  title: 'בניית אתרים לעסקים - אתרים שמייצרים לידים | BaliLead',
  desc: 'בניית אתרי תדמית, חנויות ואתרי לידים לעסקים: עיצוב פרימיום, מהירות טעינה, SEO מובנה וחיבור ל-CRM. אתר שהוא מכונת מכירות.',
  crumb: 'בניית אתרים', img: 'hero-web.webp', alt: 'בניית אתרים לעסקים - חלון דפדפן מקווי זהב',
  h1: 'בניית אתרים <span class="gw">שמייצרים לקוחות</span>',
  sub: 'אתר יפה זה נחמד. אתר שממיר גולשים ללידים זה עסק. אנחנו בונים אתרים על אותם עקרונות שמכניסים לנו אלפי לידים בחודש, <b>ומחברים אותם ישר ל-CRM שלכם</b>.',
  ctaTitle: 'רוצים אתר <span class="gw">שעובד בשבילכם?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>מה מקבלים <span class="gw">בכל אתר שלנו?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.target, 'ארכיטקטורת המרה', 'כל עמוד בנוי סביב פעולה אחת: טופס, שיחה או וואטסאפ. בלי קישוטים שמסיחים את הדעת.')}
      ${checkCard(IC.bolt, 'מהירות טעינה', 'אתר סטטי מהיר או וורדפרס מוקשח. ציוני Core Web Vitals ירוקים, כי גוגל מדרג מהירות.')}
      ${checkCard(IC.chart, 'SEO מובנה מהיסוד', 'מבנה כותרות תקין, סכמות, sitemap וקישור פנימי. האתר נולד מוכן לקידום אורגני.')}
      ${checkCard(IC.users, 'חיבור ללידים', 'כל טופס מתחבר ל-CRM, למייל ולוואטסאפ שלכם. אף פנייה לא הולכת לאיבוד.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>מה אנחנו <span class="gw">בונים?</span></h2>
      <ul>
        <li><b>אתרי תדמית לעסקים.</b> נוכחות מקצועית שממצבת אתכם כסמכות בתחום.</li>
        <li><b>אתרי לידים.</b> אתרים שכל מטרתם ייצור פניות, בדיוק כמו שאנחנו עושים לעצמנו.</li>
        <li><b>חנויות אונליין.</b> מכירה ישירה עם סליקה, מלאי וניהול הזמנות.</li>
        <li><b>מיני-סייטים לקמפיינים.</b> אתר ממוקד לקמפיין ספציפי, באוויר תוך ימים.</li>
      </ul>
      <p>ההבדל בינינו לבין סטודיו רגיל: אנחנו חברת לידים. אנחנו יודעים מה גורם לגולש להשאיר פרטים, כי אנחנו חיים מזה כל יום.</p>
    </div>
  </div>
</section>`,
  faq: [
    ['כמה זמן לוקח לבנות אתר?', 'דף נחיתה: ימים בודדים. אתר תדמית מלא: שבועיים עד חודש. חנות: לפי היקף. מגדירים לוח זמנים מדויק לפני שמתחילים.'],
    ['האם האתר יהיה שלי?', 'לחלוטין. הדומיין, התכנים והקוד רשומים על שמכם. אתם לא כלואים אצלנו.'],
    ['האתר יופיע בגוגל?', 'האתר נבנה מוכן לקידום: מבנה תקין, מהירות, סכמות ותוכן. קידום אורגני שוטף הוא שירות משלים שאנחנו מציעים.'],
  ],
  related: [['דפי-נחיתה/', 'דפי נחיתה ממירים'], ['קידום-אתרים-seo/', 'קידום אתרים SEO'], ['קניית-לידים/לידים-לבניית-אתרים/', 'לידים לבוני אתרים']],
});

digitalPage('דפי-נחיתה', {
  title: 'בניית דפי נחיתה ממירים - עמוד אחד שמוכר | BaliLead',
  desc: 'דפי נחיתה ממירים לקמפיינים: קופי מכירתי, עיצוב ממוקד פעולה, טעינה מהירה וחיבור ישיר ללידים. הדפים שמאחורי אלפי הלידים שלנו.',
  crumb: 'דפי נחיתה', img: 'hero-web.webp', alt: 'דפי נחיתה ממירים - שלד עמוד אינטרנט זהוב',
  h1: 'דפי נחיתה <span class="gw">שהופכים קליקים ללידים</span>',
  sub: 'כל שקל שאתם שמים על קמפיין עובר דרך דף הנחיתה. דף חלש שורף תקציב, דף חזק מכפיל תוצאות. <b>אנחנו בונים את הדפים שמאחורי הלידים שלנו עצמנו.</b>',
  ctaTitle: 'הקמפיין הבא שלכם <span class="gw">ראוי לדף טוב יותר</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>האנטומיה של <span class="gw">דף שממיר</span></h2></div>
    <div class="process-grid">
      <div class="step reveal"><h3>הבטחה חדה</h3><p>כותרת שעונה בשנייה אחת על השאלה "מה יוצא לי מזה?", בלי מלל ריק.</p></div>
      <div class="step reveal" style="--d:.1s"><h3>אמון מיידי</h3><p>הוכחות חברתיות, מספרים אמיתיים ותשובות להתנגדויות, בדיוק בסדר הנכון.</p></div>
      <div class="step reveal" style="--d:.2s"><h3>טופס חכם</h3><p>מינימום שדות, שאלות מסננות כשצריך, וכפתור שאי אפשר לפספס.</p></div>
      <div class="step reveal" style="--d:.3s"><h3>מדידה ושיפור</h3><p>פיקסלים, אנליטיקס ובדיקות A/B. הדף משתפר מקמפיין לקמפיין.</p></div>
    </div>
  </div>
</section>`,
  faq: [
    ['במה דף נחיתה שונה מאתר?', 'אתר מספר את כל הסיפור שלכם. דף נחיתה עושה דבר אחד: הופך גולש מקמפיין ספציפי לליד. בלי תפריטים, בלי הסחות, רק מסר אחד ופעולה אחת.'],
    ['כמה מהר אפשר לעלות לאוויר?', 'דף נחיתה ממוקד עולה לאוויר תוך ימים בודדים, כולל חיבור לקמפיין ולמערכת הלידים שלכם.'],
    ['אתם גם מריצים את הקמפיין?', 'כן. החבילה המשתלמת ביותר היא דף + קמפיין + אופטימיזציה שוטפת אצל צוות אחד, כי אז כל הנתונים מתחברים.'],
  ],
  related: [['בניית-אתרים/', 'בניית אתרים'], ['קידום-בגוגל/', 'קידום ממומן בגוגל'], ['קידום-בפייסבוק/', 'קידום בפייסבוק']],
});

digitalPage('פיתוח-אפליקציות', {
  title: 'פיתוח אפליקציות לעסקים - מהרעיון לחנויות האפליקציות | BaliLead',
  desc: 'פיתוח אפליקציות מובייל ווב לעסקים: אפיון, עיצוב UX, פיתוח והשקה. אפליקציות שמייצרות ערך עסקי אמיתי, לא רק אייקון על המסך.',
  crumb: 'פיתוח אפליקציות', img: 'hero-app.webp', alt: 'פיתוח אפליקציות - סמארטפון עם אייקונים זהובים',
  h1: 'פיתוח אפליקציות <span class="gw">שעושות כסף, לא רק רושם</span>',
  sub: 'אפליקציה טובה היא לא אוסף פיצ׳רים, היא תוצאה עסקית: הזמנות, נאמנות לקוחות או תפעול חכם. אנחנו מפתחים <b>רק אחרי שמגדירים מה היא צריכה להחזיר לכם</b>.',
  ctaTitle: 'יש לכם רעיון לאפליקציה? <span class="gw">בואו נבדוק אותו</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>מה אנחנו <span class="gw">מפתחים?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.users, 'אפליקציות ללקוחות', 'הזמנות, תורים, מועדוני לקוחות והטבות. הלקוח שלכם בכיס של הלקוחות שלו.')}
      ${checkCard(IC.chart, 'אפליקציות תפעול', 'ניהול עובדים בשטח, דוחות, מלאי ומשימות. פחות אקסלים, יותר שליטה.')}
      ${checkCard(IC.bolt, 'Web Apps', 'מערכות דפדפן מהירות בלי חנויות אפליקציות, מושלם לכלים פנים-ארגוניים.')}
      ${checkCard(IC.target, 'MVP לסטארטאפים', 'גרסה ראשונה רזה שבודקת את הרעיון מול משתמשים אמיתיים, לפני השקעה גדולה.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>איך זה <span class="gw">עובד אצלנו?</span></h2>
      <p><b>אפיון קודם לקוד.</b> אנחנו מתחילים משאלה אחת: מה האפליקציה צריכה להשיג לעסק? מזה נגזרים המסכים, הפיצ'רים וסדרי העדיפויות. אחר כך עיצוב UX/UI, פיתוח בשלבים עם גרסאות ביניים שאתם רואים, והשקה מסודרת כולל העלאה לחנויות.</p>
      <p>ומה שהכי חשוב: אנחנו אנשי שיווק. אפליקציה בלי משתמשים היא קובץ יקר, ולכן ההשקה אצלנו מגיעה עם תוכנית שיווק אמיתית.</p>
    </div>
  </div>
</section>`,
  faq: [
    ['כמה עולה לפתח אפליקציה?', 'תלוי בהיקף: Web App ממוקד יתחיל בעשרות אלפי שקלים, אפליקציית מובייל מלאה יותר. אחרי שיחת אפיון קצרה תקבלו הצעה מסודרת עם טווח מדויק.'],
    ['iOS, אנדרואיד או שניהם?', 'ברוב המקרים אנחנו מפתחים בטכנולוגיה היברידית אחת שרצה על שתי המערכות, מה שחוסך זמן וכסף.'],
    ['מי מתחזק את האפליקציה אחרי ההשקה?', 'אנחנו מציעים חבילת תחזוקה חודשית: עדכונים, תיקונים ושדרוגים. אפשר גם להעביר את הקוד לצוות שלכם.'],
  ],
  related: [['מערכת-ניהול-לידים/', 'מערכות CRM וניהול לידים'], ['סוכני-ai/', 'סוכני AI חכמים'], ['בניית-אתרים/', 'בניית אתרים']],
});

digitalPage('סוכני-ai', {
  title: 'סוכני AI חכמים לעסקים - אוטומציה שמדברת עם לקוחות | BaliLead',
  desc: 'פיתוח סוכני AI לעסקים: מענה ללקוחות 24/7, סינון וטיפול בלידים, תיאום פגישות ואוטומציית תהליכים. הטכנולוגיה שמאחורי העסק שלנו.',
  crumb: 'סוכני AI חכמים', img: 'hero-ai.webp', alt: 'סוכני AI חכמים - רשת נוירונים זהובה',
  h1: 'סוכני AI <span class="gw">שעובדים בשבילכם 24/7</span>',
  sub: 'עובד שלא ישן, לא שוכח ועונה תוך שניות. אנחנו בונים סוכני AI שעונים ללקוחות, מסננים לידים ומתאמים פגישות, <b>ומשתמשים בהם בעצמנו כל יום</b>.',
  ctaTitle: 'רוצים עובד AI <span class="gw">בצוות שלכם?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>מה סוכן AI <span class="gw">יכול לעשות לעסק שלכם?</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.bolt, 'מענה מיידי ללידים', 'הסוכן עונה לכל פנייה תוך שניות, גם בשתיים בלילה. מהירות תגובה היא ההבדל בין ליד חם לליד אבוד.')}
      ${checkCard(IC.filter, 'סינון וכימות', 'שאלות חכמות שמבדילות בין סקרן ללקוח רציני, כך שאנשי המכירות מדברים רק עם מי ששווה את זמנם.')}
      ${checkCard(IC.clock, 'תיאום פגישות', 'הסוכן סוגר פגישה ביומן, שולח תזכורות ומצמצם אי-הגעות.')}
      ${checkCard(IC.chart, 'תובנות מהשיחות', 'כל שיחה מתועדת ומנותחת: מה שואלים, מה עוצר עסקאות ואיפה אפשר לשפר.')}
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="container">
    <div class="prose">
      <h2>איפה הסוכן <span class="gw">פוגש את הלקוחות?</span></h2>
      <ul>
        <li><b>וואטסאפ.</b> הערוץ החזק בישראל: מענה, סינון והעברה לנציג אנושי ברגע הנכון.</li>
        <li><b>האתר שלכם.</b> צ'אט חכם שמכיר את המחירים והשירותים שלכם, בדיוק כמו זה שרץ באתר הזה עכשיו.</li>
        <li><b>טפסים ולידים נכנסים.</b> חיוג או הודעה אוטומטית לכל ליד חדש, עם הפרטים שכבר נאספו.</li>
        <li><b>מערכות פנימיות.</b> סוכנים שמסכמים שיחות, מעדכנים CRM וכותבים דוחות.</li>
      </ul>
      <p>אנחנו לא מוכרים "בינה מלאכותית" כקסם. אנחנו בונים תהליך עבודה מדויק, מגדירים מה הסוכן יודע ומה אסור לו להגיד, ומודדים את התוצאות במספרים.</p>
    </div>
  </div>
</section>`,
  faq: [
    ['הסוכן לא יגיד שטויות ללקוחות שלי?', 'הסוכן עובד על בסיס ידע סגור שאתם מאשרים: המחירים, השירותים והנהלים שלכם. מה שהוא לא יודע, הוא מעביר לנציג אנושי, לא ממציא.'],
    ['כמה זמן לוקח להקים סוכן?', 'סוכן ראשון ממוקד (למשל מענה וסינון לידים בוואטסאפ) עולה לאוויר תוך שבועות ספורים, כולל תקופת הרצה מלווה.'],
    ['זה מחליף את אנשי המכירות שלי?', 'לא, זה משחרר אותם. הסוכן מטפל ב-80% הפניות החוזרות, והצוות שלכם מתמקד בסגירות.'],
  ],
  related: [['אוטומציות-שיווק/', 'אוטומציות שיווק'], ['מערכת-ניהול-לידים/', 'מערכות CRM'], ['פיתוח-אפליקציות/', 'פיתוח אפליקציות']],
});

digitalPage('אוטומציות-שיווק', {
  title: 'אוטומציות שיווק לעסקים - השיווק עובד גם כשאתם ישנים | BaliLead',
  desc: 'בניית אוטומציות שיווק ומכירות: מסעות לקוח, פולו-אפ אוטומטי ללידים, חיבורי מערכות ודוחות. פחות עבודה ידנית, יותר סגירות.',
  crumb: 'אוטומציות שיווק', img: 'hero-auto.webp', alt: 'אוטומציות שיווק - גלגלי שיניים זהובים עם זרמי מידע',
  h1: 'אוטומציות שיווק: <span class="gw">אף ליד לא נופל בין הכיסאות</span>',
  sub: '44% מהלידים לא מקבלים אפילו פולו-אפ אחד. אוטומציה טובה מוודאת שכל ליד מקבל מענה, תזכורת והצעה, <b>בלי שאף אחד אצלכם צריך לזכור</b>.',
  ctaTitle: 'רוצים שיווק <span class="gw">שרץ מעצמו?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="sec-head reveal"><h2>אוטומציות <span class="gw">שאנחנו בונים</span></h2></div>
    <div class="check-grid">
      ${checkCard(IC.bolt, 'פולו-אפ ללידים', 'ליד חדש מקבל וואטסאפ תוך דקה, תזכורת אחרי יום ושיחה מתוזמנת. הכל אוטומטי.')}
      ${checkCard(IC.users, 'מסעות לקוח', 'סדרות הודעות חכמות לפי התנהגות: מי שפתח, מי שלחץ ומי שנעלם מקבלים מסר אחר.')}
      ${checkCard(IC.doc, 'חיבורי מערכות', 'טפסים, CRM, יומן, סליקה ודוחות מדברים ביניהם. בלי העתקות ידניות ובלי טעויות.')}
      ${checkCard(IC.chart, 'דוחות אוטומטיים', 'כל בוקר מחכה לכם סיכום: כמה לידים, מאיפה, כמה עלו ומה נסגר.')}
    </div>
  </div>
</section>`,
  faq: [
    ['על אילו מערכות אתם עובדים?', 'וואטסאפ עסקי, מערכות CRM מובילות, גוגל ומטא, מערכות דיוור וכלי אוטומציה כמו Make ו-n8n. אם יש למערכת חיבור, נחבר אותה.'],
    ['זה לא ירגיש רובוטי ללקוחות?', 'אוטומציה טובה מרגישה כמו שירות מעולה: מענה מהיר, מסר אישי ותזמון נכון. את הניסוחים כותבים אנשי שיווק, לא רובוטים.'],
    ['כמה זה חוסך בפועל?', 'עסק ממוצע חוסך שעות עבודה יומיות ומעלה משמעותית את אחוז הלידים שמקבלים טיפול. את המספרים המדויקים תראו בדוח החודשי הראשון.'],
  ],
  related: [['סוכני-ai/', 'סוכני AI חכמים'], ['מערכת-ניהול-לידים/', 'מערכות CRM'], ['שיווק-דיגיטלי/', 'שיווק דיגיטלי']],
});

/* מערכת ניהול לידים (תוכן מלא מהוורדפרס) */
digitalPage('מערכת-ניהול-לידים', {
  title: 'מערכת לניהול לידים - פיתוח מותאם אישית לכל עסק | BaliLead',
  desc: 'מערכת CRM לניהול לידים בהתאמה אישית: קליטת לידים מכל הערוצים, חלוקה לאנשי מכירות, אוטומציות ודוחות. פיתוח על בסיס ניסיון אמיתי בלידים.',
  crumb: 'מערכות CRM וניהול לידים', img: 'hero-auto.webp', alt: 'מערכת לניהול לידים - מנגנון אוטומציה זהוב',
  h1: 'מערכת לניהול לידים <span class="gw">שנבנתה על ידי אנשי לידים</span>',
  sub: 'אנחנו מזרימים אלפי לידים בחודש, אז בנינו מערכות שיודעות לנהל אותם: קליטה מכל ערוץ, חלוקה חכמה לאנשי מכירות, <b>ומעקב עד הסגירה</b>.',
  ctaTitle: 'רוצים שליטה מלאה <span class="gw">על הלידים שלכם?</span>',
  sections: root => `
<section class="sec-tight">
  <div class="container">
    <div class="check-grid">
      ${checkCard(IC.bolt, 'קליטה מכל הערוצים', 'פייסבוק, גוגל, אתר, וואטסאפ וטלפון נכנסים למקום אחד, בזמן אמת.')}
      ${checkCard(IC.users, 'חלוקה אוטומטית', 'כל ליד מנותב לאיש המכירות הנכון לפי תחום, אזור או עומס.')}
      ${checkCard(IC.clock, 'תזכורות ומעקב', 'המערכת דואגת שאף ליד לא יישכח: סטטוסים, משימות והתראות.')}
      ${checkCard(IC.chart, 'דוחות אמת', 'עלות לליד, אחוזי סגירה והחזר השקעה לכל ערוץ, בלחיצה אחת.')}
    </div>
  </div>
</section>`,
  faq: [
    ['יש לי כבר CRM, זה רלוונטי?', 'כן. אנחנו גם משדרגים ומחברים מערכות קיימות: אוטומציות, חיבורי ערוצים ודוחות מעל מה שכבר יש לכם.'],
    ['כמה זמן לוקחת הקמה?', 'מערכת בסיסית עם קליטת לידים וחלוקה עולה תוך שבועות בודדים. יכולות מתקדמות מתווספות בשלבים.'],
    ['המידע שלי מאובטח?', 'המערכות מוקמות עם הרשאות לפי תפקיד, גיבויים ותיעוד גישה. הנתונים שלכם נשארים שלכם.'],
  ],
  related: [['סוכני-ai/', 'סוכני AI חכמים'], ['אוטומציות-שיווק/', 'אוטומציות שיווק'], ['קניית-לידים/', 'קניית לידים']],
});

/* =================================================================
   מחשבון ROI ללידים
================================================================= */
page('מחשבון-roi-ללידים', {
  title: 'מחשבון ROI ללידים | חישוב החזר השקעה מדויק - BaliLead',
  desc: 'מחשבון ROI ללידים: הזינו עלות לליד, כמות, אחוז סגירה ורווח מעסקה, וקבלו מיד את ההחזר על ההשקעה ועלות רכישת לקוח.',
  active: 'leads',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'מחשבון ROI ללידים' }])],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'מחשבון ROI' }],
    h1: 'מחשבון ROI ללידים: <span class="gw">כמה באמת מחזירה ההשקעה?</span>',
    img: 'hero-account.webp', alt: 'מחשבון ROI ללידים - מחשבון פליז וזהב',
    sub: 'הזינו ארבעה מספרים וקבלו תשובה מיידית: כמה עסקאות, כמה הכנסה, ומה ההחזר על כל שקל שהשקעתם בלידים.',
    ctas: false,
  })}

<section class="sec-tight">
  <div class="container">
    <div class="contact-shell reveal">
      <div class="contact-halo" aria-hidden="true"></div>
      <div class="contact-in" style="align-items:start">
        <div class="form" style="gap:14px">
          <div class="field"><label for="r-cost">עלות ממוצעת לליד (₪)</label><input id="r-cost" type="number" inputmode="numeric" value="60" min="1"></div>
          <div class="field"><label for="r-count">כמות לידים בחודש</label><input id="r-count" type="number" inputmode="numeric" value="100" min="1"></div>
          <div class="field"><label for="r-close">אחוז סגירה (%)</label><input id="r-close" type="number" inputmode="numeric" value="10" min="0" max="100"></div>
          <div class="field"><label for="r-value">רווח ממוצע מעסקה (₪)</label><input id="r-value" type="number" inputmode="numeric" value="1500" min="0"></div>
        </div>
        <div>
          <div class="stats-grid" style="grid-template-columns:1fr 1fr;gap:18px;text-align:center">
            <div class="stat" style="border:none"><div class="stat-num" id="r-deals" style="font-size:clamp(30px,3vw,44px)">10</div><div class="stat-label">עסקאות בחודש</div></div>
            <div class="stat" style="border:none"><div class="stat-num" id="r-rev" style="font-size:clamp(30px,3vw,44px)">₪15,000</div><div class="stat-label">רווח גולמי</div></div>
            <div class="stat" style="border:none"><div class="stat-num" id="r-cac" style="font-size:clamp(30px,3vw,44px)">₪600</div><div class="stat-label">עלות רכישת לקוח</div></div>
            <div class="stat" style="border:none"><div class="stat-num" id="r-roi" style="font-size:clamp(30px,3vw,44px)">150%</div><div class="stat-label">ROI על ההשקעה</div></div>
          </div>
          <p class="form-hint" id="r-note" style="margin-top:16px"></p>
        </div>
      </div>
    </div>
    <p class="price-note reveal" style="--d:.1s">${IC.info} רוצים לדעת כמה עולה ליד בתחום שלכם? <a href="${root}מחירון-לידים/" style="color:var(--gold2);font-weight:700">למחירון המלא 2026</a></p>
  </div>
</section>
<script>
(function(){
  var ids = ['r-cost','r-count','r-close','r-value'];
  function fmt(n){ return '₪' + Math.round(n).toLocaleString('he-IL'); }
  var anims = {};
  function setNum(id, target, format){
    var el = document.getElementById(id);
    var from = anims[id] != null ? anims[id] : target;
    anims[id] = target;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || from === target) { el.textContent = format(target); return; }
    var t0 = performance.now();
    function tick(t){
      var p = Math.min((t - t0) / 300, 1);
      var v = from + (target - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = format(v);
      if (p < 1 && anims[id] === target) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function calc(){
    var cost = +document.getElementById('r-cost').value || 0;
    var count = +document.getElementById('r-count').value || 0;
    var close = (+document.getElementById('r-close').value || 0) / 100;
    var val = +document.getElementById('r-value').value || 0;
    var invest = cost * count;
    var deals = count * close;
    var revenue = deals * val;
    var profit = revenue - invest;
    var roi = invest > 0 ? (profit / invest) * 100 : 0;
    var cac = deals > 0 ? invest / deals : 0;
    setNum('r-deals', deals, function(v){ return (Math.round(v * 10) / 10).toLocaleString('he-IL'); });
    setNum('r-rev', revenue, fmt);
    if (deals > 0) setNum('r-cac', cac, fmt); else document.getElementById('r-cac').textContent = '-';
    setNum('r-roi', roi, function(v){ return Math.round(v) + '%'; });
    var note = document.getElementById('r-note');
    if (roi >= 100) note.textContent = 'מצוין: על כל שקל שהשקעתם חזרו ' + (1 + roi / 100).toFixed(1) + ' ₪. השקעה של ' + fmt(invest) + ' החזירה ' + fmt(revenue) + '.';
    else if (roi > 0) note.textContent = 'רווחי, ויש לאן לצמוח: שיפור קטן באחוז הסגירה יקפיץ את התמונה. השקעה: ' + fmt(invest) + '.';
    else note.textContent = 'במספרים האלה ההשקעה לא מחזירה את עצמה. שווה לדבר איתנו על איכות הלידים או על תסריט המכירה.';
  }
  ids.forEach(function(id){ document.getElementById(id).addEventListener('input', calc); });
  calc();
})();
</script>

${ctaSection(root, { title: 'רוצים לידים שמצדיקים <span class="gw">את המספרים האלה?</span>' })}`,
});

/* =================================================================
   מדיניות פרטיות ותנאי שימוש
================================================================= */
page('מדיניות-פרטיות', {
  title: 'מדיניות פרטיות ותנאי שימוש - BaliLead',
  desc: 'מדיניות הפרטיות ותנאי השימוש של אתר BaliLead: איסוף פרטים, העברתם לצדדים שלישיים, אבטחת מידע, הסרה מרשימות והגבלת אחריות.',
  active: '',
  extraLd: [crumbsLd([{ href: '', t: 'ראשי' }, { t: 'מדיניות פרטיות' }])],
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'מדיניות פרטיות' }],
    h1: 'מדיניות פרטיות <span class="gw">ותנאי שימוש</span>',
    img: 'img-office.webp', alt: 'מדיניות הפרטיות של באלי ליד',
    sub: 'שקיפות מלאה: מה אנחנו אוספים, מה אנחנו עושים עם זה, ומה הזכויות שלכם. עודכן לאחרונה: אוגוסט 2026.',
    ctas: false,
  })}

<section class="sec-tight" style="padding-bottom:clamp(80px,10vw,140px)">
  <div class="container">
    <div class="prose">
      <p><b>כללי.</b> אתר balilead.co.il (להלן: "האתר") מופעל על ידי BaliLeads (להלן: "החברה", "אנחנו"). השימוש באתר, לרבות השארת פרטים בטפסים, בצ'אט או בכל אמצעי אחר, מהווה הסכמה מלאה למדיניות זו ולתנאי השימוש שלהלן. אם אינכם מסכימים לתנאים, אנא הימנעו משימוש באתר ומהשארת פרטים.</p>

      <h2>איזה מידע אנחנו אוספים?</h2>
      <ul>
        <li><b>מידע שאתם מוסרים מרצונכם:</b> שם, טלפון, כתובת דוא"ל, תחום עניין וכל פרט אחר שתבחרו למסור בטפסים, בצ'אט, בוואטסאפ או בטלפון.</li>
        <li><b>מידע טכני:</b> נתוני גלישה, סוג דפדפן ומכשיר, עמודים שנצפו ונתוני שימוש, לרבות באמצעות עוגיות (Cookies) וכלי מדידה ואנליטיקה.</li>
      </ul>

      <h2>העברת מידע לצדדים שלישיים, שימו לב</h2>
      <p><b>ליבת השירות של החברה היא תיווך והפניית פניות (לידים) לבתי עסק ונותני שירותים רלוונטיים.</b> בעצם השארת פרטיכם באתר אתם מאשרים באופן מפורש כי:</p>
      <ul>
        <li>הפרטים שמסרתם <b>יועברו לצדדים שלישיים</b>, בהם בתי עסק, סוכנים, יועצים ונותני שירותים בתחום שלגביו פניתם, לצורך יצירת קשר עמכם ומתן הצעות ושירותים.</li>
        <li>אותם צדדים שלישיים עשויים ליצור עמכם קשר בטלפון, בהודעות, בדוא"ל או בכל אמצעי תקשורת אחר, ואתם מסכימים לקבלת פניות כאמור.</li>
        <li>החברה רשאית לעשות שימוש בפרטים גם לצורך דיוור, עדכונים והצעות מטעמה, בכפוף לזכותכם לבקש הסרה בכל עת.</li>
      </ul>

      <h2>הגבלת אחריות</h2>
      <p>החברה פועלת כגורם מקשר בלבד בין משאירי הפרטים לבין צדדים שלישיים. בהתאם, ומבלי לגרוע מכל דין:</p>
      <ul>
        <li>החברה <b>אינה צד</b> לכל התקשרות, עסקה או מגע בינכם לבין צד שלישי כלשהו שאליו הועברו פרטיכם, ואינה אחראית לטיב השירותים, למחיריהם, לזמינותם, למצגיהם או לכל מעשה או מחדל של אותם צדדים שלישיים.</li>
        <li>המידע באתר, לרבות מחירים, מדריכים, מחשבונים ותכני המגזין, נמסר כמידע כללי בלבד, אינו מהווה ייעוץ מקצועי, פיננסי, ביטוחי, משפטי או אחר, ואין להסתמך עליו ככזה. כל הסתמכות על המידע היא באחריות המשתמש בלבד.</li>
        <li>השימוש באתר ובשירותים הוא "כפי שהם" (AS IS). החברה, מנהליה ועובדיה לא יישאו בכל אחריות לנזק ישיר או עקיף, כספי או אחר, שייגרם למשתמש או לצד שלישי בקשר עם השימוש באתר, הסתמכות על תכניו או התקשרות עם צד שלישי כלשהו.</li>
        <li>בכל מקרה, ומבלי לגרוע מהאמור, אחריותה הכוללת של החברה, ככל שתוטל, לא תעלה על הסכום ששולם לה בפועל על ידי המשתמש, ככל ששולם, בשלושת החודשים שקדמו לאירוע.</li>
      </ul>

      <h2>אבטחת מידע ושמירתו</h2>
      <p>אנחנו מיישמים אמצעי אבטחה מקובלים לשמירה על המידע, אולם אין באפשרותנו להבטיח חסינות מוחלטת מפני חדירות או שימוש לרעה. המידע נשמר כל עוד הוא נדרש למטרות שלשמן נאסף או בהתאם לדרישות הדין.</p>

      <h2>הזכויות שלכם</h2>
      <ul>
        <li>לבקש לעיין במידע שנאסף עליכם, לתקנו או למחוק אותו.</li>
        <li>לבקש הסרה מרשימות הדיוור והפניות בכל עת, בפנייה לכתובת ${SITE.email} או בטלפון ${SITE.phone}.</li>
      </ul>

      <h2>שונות</h2>
      <p>החברה רשאית לעדכן מדיניות זו מעת לעת, והנוסח המעודכן שיפורסם באתר הוא המחייב. על מדיניות זו יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים במחוז תל אביב.</p>
      <p><b>יצירת קשר בנושאי פרטיות:</b> צחי לוי, טלפון ${SITE.phone}, דוא"ל ${SITE.email}.</p>
    </div>
  </div>
</section>`,
});

/* =================================================================
   ארכיוני תגיות וקטגוריות (שימור כתובות מהוורדפרס)
================================================================= */
const keyOf = a => (a.slug + ' ' + (a.h1 || '') + ' ' + (a.title || ''));
const TAG_DEFS = [
  ['tag/גיוס-לידים', 'גיוס לידים', a => /גיוס|recruit/i.test(keyOf(a))],
  ['tag/לידים-איכותיים', 'לידים איכותיים', a => /איכות|quality/i.test(keyOf(a))],
  ['tag/לידים-חמים', 'לידים חמים', a => /חמים|\bhot\b/i.test(keyOf(a))],
  ['tag/מה-זה-לידים', 'מה זה לידים', a => /מה-זה-לידים|מה זה ליד/i.test(keyOf(a))],
  ['tag/מה-זה-שיווק-דיגיטלי', 'מה זה שיווק דיגיטלי', a => /מה-זה-שיווק|מה זה שיווק/i.test(keyOf(a))],
  ['tag/ניהול-לידים', 'ניהול לידים', a => /ניהול|management/i.test(keyOf(a))],
  ['tag/פרסום-ממומן-ppc', 'פרסום ממומן PPC', a => /ממומן|ppc|גוגל/i.test(keyOf(a))],
  ['tag/קידום-אתרים-seo', 'קידום אתרים SEO', a => /seo|קידום אתרים/i.test(keyOf(a))],
  ['tag/שיווק-באינטרנט', 'שיווק באינטרנט', a => getMeta(a.slug).cat === 'שיווק דיגיטלי'],
  ['tag/שיווק-ברשתות-חברתיות', 'שיווק ברשתות חברתיות', a => /פייסבוק|אינסטגרם|רשתות|social/i.test(keyOf(a))],
  ['tag/שיווק-דיגיטלי', 'שיווק דיגיטלי', a => getMeta(a.slug).cat === 'שיווק דיגיטלי'],
  ['category/לידים', 'קטגוריה: לידים', () => true],
  ['category/uncategorized', 'כל המאמרים', () => true],
  ['category/uncategorized/לידים-חמים', 'קטגוריית לידים חמים', a => /חמים|\bhot\b/i.test(keyOf(a))],
];
for (const [path, label, match] of TAG_DEFS) {
  const items = LISTED_ARTICLES.filter(match).slice(0, 12).map(a => a.slug);
  if (!items.length) continue;
  const archCrumbs = [{ href: '', t: 'ראשי' }, { href: 'עדכונים-חמים/', t: 'המגזין' }, { t: label }];
  page(path, {
    /* Archive pages exist to preserve the old WordPress URLs, not to rank:
       each is a list of teasers that already appear on the articles themselves.
       `follow` keeps their links working; `noindex` stops them competing with
       the pages they point to. */
    robots: 'noindex, follow',
    title: label + ' - מאמרים ומדריכים | BaliLead',
    desc: 'כל המאמרים והמדריכים של BaliLead בנושא ' + label + ': ידע מהשטח על לידים, המרות ושיווק דיגיטלי.',
    active: 'magazine',
    extraLd: [crumbsLd(archCrumbs), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: label, url: canon(path), isPartOf: { '@type': 'WebSite', name: 'BaliLeads', url: 'https://balilead.co.il/' } }],
    body: root => `
${pageHero(root, {
      crumbs: [{ href: '', t: 'ראשי' }, { href: 'עדכונים-חמים/', t: 'המגזין' }, { t: label }],
      h1: label.includes(':') ? label : `${label}: <span class="gw">מאמרים ומדריכים</span>`,
      sub: 'אוסף התכנים שלנו בנושא, מתוך המגזין של באלי ליד.',
      ctas: false,
      img: CAT_COVER[inferCat({ slug: path, h1: label, title: '' })] || 'cover-leads.webp',
      alt: label + ' - מאמרים ומדריכים במגזין באלי ליד',
    })}
<section class="sec-tight" style="padding-bottom:clamp(60px,8vw,100px)">
  <div class="container">
    <div class="art-grid">${items.map((s, i) => artCard(root, s, i)).join('')}</div>
    <p class="price-note reveal" style="--d:.08s">${IC.info} <a href="${root}עדכונים-חמים/" style="color:var(--gold2);font-weight:700">לכל ${LISTED_ARTICLES.length} המאמרים במגזין</a></p>
  </div>
</section>
${ctaSection(root)}`,
  });
}

/* =================================================================
   sitemap.xml + robots.txt (canonical domain, ready for the move)
================================================================= */
const today = '2026-08-25';
writeFileSync(join(OUT, 'style.css'), siteCss());
writeFileSync(join(OUT, 'site.js'), siteJs());
console.log('style.css + site.js written');
writeFileSync(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  BUILT.filter(p => !NOINDEX.has(p)).map(p => `  <url><loc>${canon(p)}</loc><lastmod>${LASTMOD[p] || today}</lastmod><changefreq>${p === '' || p === 'מחירון-לידים' ? 'weekly' : 'monthly'}</changefreq></url>`).join('\n') +
  `\n</urlset>`);
writeFileSync(join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: https://balilead.co.il/sitemap.xml\n`);

/* branded 404 with base-aware links */
writeFileSync(join(OUT, '404.html'), `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>העמוד לא נמצא - BaliLead</title><meta name="robots" content="noindex">
<link href="https://fonts.googleapis.com/css2?family=Secular+One&family=Assistant:wght@400;600;700&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#080606;color:#f4eee3;font-family:'Assistant',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
h1{font-family:'Secular One';font-size:clamp(60px,12vw,120px);margin:0;background:linear-gradient(115deg,#a96d2b,#f6d9a0,#a96d2b);-webkit-background-clip:text;background-clip:text;color:transparent}
h2{font-family:'Secular One';font-weight:400;font-size:clamp(20px,3vw,28px);margin:8px 0 12px}
p{color:#a89d8d;max-width:46ch;margin:0 auto 26px}
.row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
a{display:inline-block;border-radius:999px;padding:13px 26px;font-weight:700;text-decoration:none;color:#f4eee3;border:1px solid rgba(244,238,227,.2)}
a.g{background:linear-gradient(115deg,#a96d2b,#d9a45b,#f6d9a0,#d9a45b,#a96d2b);color:#1c1206;border:none}
</style></head><body><div>
<h1>404</h1><h2>הליד הזה התקרר...</h2>
<p>העמוד שחיפשתם עבר, הוחלף או שלא היה קיים. הכל עדיין כאן, רק כתובת אחת אחורה.</p>
<div class="row"><a class="g" id="l-home" href="/">לעמוד הבית</a><a id="l-mag" href="/">למגזין</a><a id="l-price" href="/">למחירון 2026</a></div>
</div><script>
var base = location.pathname.indexOf('/balilead-site/') === 0 ? '/balilead-site/' : '/';
document.getElementById('l-home').href = base;
document.getElementById('l-mag').href = base + encodeURIComponent('עדכונים-חמים') + '/';
document.getElementById('l-price').href = base + encodeURIComponent('מחירון-לידים') + '/';
</script></body></html>`);
if (extrasDirty) {
  writeFileSync(EXTRAS_PATH, JSON.stringify(PAGE_EXTRAS, null, 1) + String.fromCharCode(10));
  console.log('data/page-extras.json seeded for', Object.keys(PAGE_EXTRAS).length, 'commercial pages');
}
console.log('sitemap.xml + robots.txt + 404.html written,', BUILT.length, 'pages');
console.log('ALL PAGES BUILT');
