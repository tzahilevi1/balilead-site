import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { shell, pageHero, ctaSection, SITE, IC } from './src/layout.mjs';

const OUT = '.';
const canon = path => 'https://balilead.co.il/' + (path ? encodeURI(path) + '/' : '');

function write(path, html) {
  const dir = path ? join(OUT, path) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  const depth = path ? path.split('/').length : 0;
  console.log('built', (path || '(home)') + '  depth=' + depth);
}

function page(path, opts) {
  const depth = path ? path.split('/').length : 0;
  const root = '../'.repeat(depth);
  write(path, shell({ root, canonical: canon(path), ...opts, body: opts.body(root) }));
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
   HOME
================================================================= */
page('', {
  title: 'לידים רותחים שיעזרו לעסק שלך לצמוח - BaliLeads',
  desc: 'BaliLeads חברת לידים, שיווק ופרסום. מתמחה ביצירת לידים חמים ובלעדיים לסקטור הפיננסי: ביטוח, הלוואות, משכנתאות, החזרי מס ועוד. קידום ממומן ואורגני בגוגל ובניית אתרים.',
  active: 'home',
  ldjson: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'BaliLeads', url: 'https://balilead.co.il/', logo: 'https://balilead.co.il/wp-content/uploads/2021/10/cropped-לוגו-שקוף.png', telephone: '+972-58-470-0706', email: SITE.email, address: { '@type': 'PostalAddress', streetAddress: 'אצ״ל 34', addressLocality: 'רמת גן', addressCountry: 'IL' }, sameAs: [SITE.fb] }),
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
      <h1 class="reveal" style="--d:.1s">לידים <span class="hot">רותחים</span>,<br>בלעדיים, בזמן אמת.</h1>
      <p class="hero-sub reveal" style="--d:.2s">מאז 2020 אנחנו מזרימים לעסקים פיננסיים לקוחות שמחכים לשיחה. <b>לא רשימות ממוחזרות</b>, ליד אחד, עסק אחד.</p>
      <div class="hero-ctas reveal" style="--d:.3s">
        <a class="btn btn-gold" href="#contact"><span class="btn-ic">${IC.arrowL}</span>מתחילים לקבל לידים</a>
        <a class="btn btn-ghost" href="${SITE.waText}" target="_blank" rel="noopener"><span class="btn-ic">${IC.wa}</span>דברו איתנו בוואטסאפ</a>
      </div>
    </div>
    <div class="cascade reveal" style="--d:.35s" aria-label="דוגמאות לתחומי לידים ומחירים">
      <a class="lead-card" href="${root}קניית-לידים/לידים-לביטוח/">
        <span class="lc-tag">הכי מבוקש</span>
        <div class="lead-card-in">
          <div class="lc-ic">${IC.shield}</div>
          <div class="lc-body"><div class="lc-title">לידים לביטוח</div><div class="lc-meta">ממוקדים לפי סוג פוליסה</div></div>
          <div class="lc-price">₪10 עד ₪100</div>
        </div>
      </a>
      <a class="lead-card" href="${root}קניית-לידים/לידים-למשכנתאות/">
        <div class="lead-card-in">
          <div class="lc-ic">${IC.house}</div>
          <div class="lc-body"><div class="lc-title">לידים למשכנתאות</div><div class="lc-meta">לקוחות בתהליך החלטה</div></div>
          <div class="lc-price">₪50 עד ₪150</div>
        </div>
      </a>
      <a class="lead-card" href="${root}קניית-לידים/לידים-להחזרי-מס/">
        <div class="lead-card-in">
          <div class="lc-ic">${IC.shekel}</div>
          <div class="lc-body"><div class="lc-title">לידים להחזרי מס</div><div class="lc-meta">שכירים עם זכאות</div></div>
          <div class="lc-price">₪15 עד ₪45</div>
        </div>
      </a>
    </div>
  </div>
</section>

<section class="clients">
  <div class="clients-label">חברות שכבר מוכרות יותר איתנו</div>
  <div class="marquee">
    <div class="marquee-track" id="marqTrack">
      <div class="client-chip"><img src="${root}assets/client-elia.png" alt="Elia" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-getfuel.png" alt="GetFuel" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-tevel.jpg" alt="תבל" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-yehadim.png" alt="יהלומים" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-tsm.jpg" alt="TSM" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-1907.png" alt="לקוח" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-tempweb.jpg" alt="לקוח" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-untitled.png" alt="לקוח" loading="lazy"></div>
    </div>
  </div>
</section>

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
      <div class="contact-in" style="grid-template-columns:1fr auto;align-items:center;padding:clamp(26px,4vw,44px)">
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

${ctaSection(root)}`,
});

/* =================================================================
   קניית לידים (hub)
================================================================= */
page('קניית-לידים', {
  title: 'קניית לידים חמים ובלעדיים לכל תחום - BaliLeads',
  desc: 'קניית לידים חמים ואיכותיים שעברו תהליך סינון מעמיק. לידים בלעדיים במגוון תחומים, תשלום פר ליד בלבד. מחירון שקוף מעודכן 2026.',
  active: 'leads',
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'קניית לידים' }],
    h1: 'קניית לידים חמים, <span class="gw">בלי לשרוף תקציבי פרסום</span>',
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

${ctaSection(root)}`,
});

/* =================================================================
   Lead vertical pages
================================================================= */
function leadPage(path, o) {
  page(path, {
    title: o.title, desc: o.desc, active: 'leads',
    body: root => `
${pageHero(root, {
      crumbs: [{ href: '', t: 'ראשי' }, { href: 'קניית-לידים/', t: 'קניית לידים' }, { t: o.crumb }],
      h1: o.h1, sub: o.sub, price: o.price,
    })}
${o.sections(root)}
${o.faq ? faqBlock(o.faq) : ''}
${relatedBlock(root, o.related)}
${ctaSection(root, { title: o.ctaTitle })}`,
  });
}

leadPage('קניית-לידים/לידים-לביטוח', {
  title: 'קבלו לידים חמים לביטוח מספק הלידים הגדול בישראל - BaliLead',
  desc: 'מכירת לידים לביטוח עם באלי ליד. לידים בלעדיים ומסוננים לסוכני ביטוח, תשלום פר ליד בלבד. חסכו זמן וכסף והגדילו את המכירות.',
  crumb: 'לידים לביטוח',
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
  related: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות'], ['קניית-לידים/לידים-להלוואות/', 'לידים להלוואות'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('קניית-לידים/לידים-להחזרי-מס', {
  title: 'קבלו לידים חמים להחזרי מס מספק הלידים הגדול בישראל - BaliLead',
  desc: 'לידים להחזרי מס: שכירים עם זכאות אמיתית להחזר, כולל פרטים פיננסיים מלאים בטופס. לידים בלעדיים בכמויות יומיות גדולות.',
  crumb: 'לידים להחזרי מס',
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
  crumb: 'לידים להלוואות',
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
  related: [['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות'], ['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('קניית-לידים/לידים-למשכנתאות', {
  title: 'לידים למשכנתאות - לקוחות רציניים מוכנים לעסקה | BaliLead',
  desc: 'לידים איכותיים למשכנתאות ליועצי משכנתאות: רוכשי דירה ראשונה, משפרי דיור, משקיעים ומיחזור. אימות טלפוני ובלעדיות מלאה.',
  crumb: 'לידים למשכנתאות',
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
  related: [['קניית-לידים/לידים-להלוואות/', 'לידים להלוואות'], ['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח'], ['מחירון-לידים/', 'מחירון 2026']],
});

leadPage('לידים-לרואי-חשבון', {
  title: 'לידים לרואי חשבון - הגדלת תיק הלקוחות | BaliLead',
  desc: 'לידים איכותיים ומסוננים לרואי חשבון: פתיחת תיקים חדשים, העברת תיקים ולקוחות שמחפשים רו"ח. העברה תוך 24 שעות.',
  crumb: 'לידים לרואי חשבון',
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
  crumb: 'פתיחת עוסק מורשה',
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
  crumb: 'העברת תיקים לרו"ח',
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
page('שיווק-דיגיטלי', {
  title: 'שיווק דיגיטלי - פתרונות מתקדמים להגדלת מכירות | BaliLead',
  desc: 'שירותי שיווק דיגיטלי מקצועיים לעסקים: קידום ממומן, SEO, רשתות חברתיות וכתבות ממירות. אסטרטגיה מותאמת ותוצאות מדידות.',
  active: 'digital',
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'שיווק דיגיטלי' }],
    h1: 'שיווק דיגיטלי <span class="gw">שנמדד בלקוחות, לא בלייקים</span>',
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
  page(path, {
    title: o.title, desc: o.desc, active: 'digital',
    body: root => `
${pageHero(root, {
      crumbs: [{ href: '', t: 'ראשי' }, { href: 'שיווק-דיגיטלי/', t: 'שיווק דיגיטלי' }, { t: o.crumb }],
      h1: o.h1, sub: o.sub,
    })}
${o.sections(root)}
${relatedBlock(root, o.related)}
${ctaSection(root, { title: o.ctaTitle, sub: 'השאירו פרטים ונחזור אליכם עם תוכנית פעולה מותאמת לעסק שלכם.' })}`,
  });
}

digitalPage('קידום-בגוגל', {
  title: 'קידום ממומן בגוגל - קמפיינים שמביאים לידים | BaliLead',
  desc: 'ניהול קמפיינים ממומנים בגוגל: טרגוט מדויק לפי כוונת רכישה, הגנה מקליקים ריקים ומעל 50 עקרונות ליבה למקסום התקציב.',
  crumb: 'קידום ממומן בגוגל',
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
  crumb: 'קידום אתרים SEO',
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
  crumb: 'קידום בפייסבוק',
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
  crumb: 'פרסום באינסטגרם',
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
  crumb: 'קידום בלינקדאין',
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
  crumb: 'טאבולה ואאוטבריין',
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
const PRICES = {
  fin: [
    ['ביטוח', '₪10 עד ₪100'], ['ביטוח רכב', '₪40 עד ₪80'], ['משכנתאות', '₪50 עד ₪150'],
    ['פיננסים', '₪60 עד ₪180'], ['השקעות', '₪60 עד ₪140'], ['החזרי מס', '₪15 עד ₪45'],
    ['הלוואה לכל מטרה', '₪10 עד ₪45'], ['הלוואות לעסקים', '₪50 עד ₪90'],
    ['הלוואות כנגד קופה או פנסיה', '₪40 עד ₪90'], ['הלוואות כנגד נכס למסורבים', '₪15 עד ₪100'],
    ['מחיקת BDI', '₪20 עד ₪55'], ['איתור כספים אבודים', '₪15 עד ₪55'], ['פורקס', '₪75 עד ₪200'],
  ],
  med: [
    ['עורכי דין', '₪50 עד ₪110'], ['רופאי שיניים', '₪80 עד ₪150'], ['השתלות שיניים', '₪45 עד ₪100'],
    ['רופאים ובעיות רפואיות', '₪50 עד ₪130'], ['אסתטיקה רפואית', '₪60 עד ₪120'],
    ['הסרת שיער בלייזר', '₪40 עד ₪90'], ['רפואה משלימה', '₪40 עד ₪70'], ['NLP', '₪50 עד ₪150'],
  ],
  biz: [
    ['בניית אתרים', '₪70 עד ₪175'], ['שיווק עסקים', '₪30 עד ₪90'], ['שיפוצים', '₪100 עד ₪250'],
    ['הובלות', '₪60 עד ₪100'], ['אדריכלים', '₪40 עד ₪90'], ['הפקות אירועים', '₪40 עד ₪100'],
    ['קורסים ומכללות', '₪50 עד ₪150'], ['תקשורת', '₪40 עד ₪70'],
  ],
};
const priceRows = arr => arr.map(([n, p]) => `<div class="pg-row"><span class="n">${n}</span><span class="p">${p}</span></div>`).join('');

page('מחירון-לידים', {
  title: 'מחירון לידים מעודכן 2026 - שקיפות מלאה | BaliLead',
  desc: 'מחירון לידים מעודכן לשנת 2026: כל 29 התחומים עם טווחי מחיר לליד. מהיחידים בענף שמפרסמים מחירון מלא ושקוף.',
  active: 'pricing',
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'מחירון לידים 2026' }],
    h1: 'מחירון לידים <span class="gw">מעודכן לשנת 2026</span>',
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
   מגזין
================================================================= */
const ARTICLES = [
  ['https://balilead.co.il/%d7%9e%d7%94-%d7%96%d7%94-%d7%a9%d7%99%d7%95%d7%95%d7%a7-%d7%93%d7%99%d7%92%d7%99%d7%98%d7%9c%d7%99/', 'מה זה שיווק דיגיטלי? מדריך מקיף למתחילים', 'שיווק'],
  ['https://balilead.co.il/%d7%9e%d7%94-%d7%96%d7%94-%d7%9c%d7%99%d7%93%d7%99%d7%9d/', 'מה זה לידים ואיך מגייסים אותם נכון', 'לידים'],
  ['https://balilead.co.il/what-are-quality-leads/', 'מה זה לידים איכותיים', 'לידים'],
  ['https://balilead.co.il/quality-mortgage-leads/', 'הסודות מאחורי מציאת לידים טובים למשכנתאות שכל מתווך חייב לדעת', 'משכנתאות'],
  ['https://balilead.co.il/hot-mortgage-leads/', 'שיפור אחוזי סגירה בעסקאות משכנתא בעזרת לידים חמים ואיכותיים', 'משכנתאות'],
  ['https://balilead.co.il/cold-to-hot-leads/', 'כיצד להפוך לידים קרים ללידים חמים בהליך פשוט וממוקד', 'לידים'],
  ['https://balilead.co.il/reduce-mortgage-lead-cost/', 'כיצד להוזיל את עלות הלידים בתחום המשכנתאות בלי לפגוע באיכותם', 'משכנתאות'],
  ['https://balilead.co.il/mortgage-closing-rates-tech/', 'איך לשפר אחוזי סגירה בענף המשכנתאות בעזרת טכנולוגיות חדשות', 'משכנתאות'],
  ['https://balilead.co.il/hot-insurance-leads/', 'הסוד ללידים חמים בביטוח: כך תמצאו את הלקוחות שמחכים לכם', 'ביטוח'],
  ['https://balilead.co.il/quality-loan-leads/', 'לידים להלוואות: איך לשפר את איכות הלידים עם ניתוח נתונים חכם', 'הלוואות'],
  ['https://balilead.co.il/insurance-hot-leads-detection/', 'איך לזהות לידים חמים לביטוח שמבטיחים אחוזי סגירה גבוהים', 'ביטוח'],
  ['https://balilead.co.il/insurance-leads-closing-rates/', 'הקפיצה הגדולה: איך להפוך לידים לביטוח לאחוזי סגירה גבוהים מאי פעם', 'ביטוח'],
];

page('עדכונים-חמים', {
  title: 'עדכונים חמים - המגזין של עולם הלידים | BaliLead',
  desc: 'המגזין של BaliLead: מדריכים, מגמות שוק וטיפים מעולם הלידים והשיווק הדיגיטלי. ידע שהופך קמפיינים ללקוחות.',
  active: 'magazine',
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'המגזין' }],
    h1: 'המגזין: <span class="gw">ידע זה כוח</span>',
    sub: '"ידע הוא הכוח המרכזי היחיד בעולם שאף אחד לא יכול לקחת ממך." מדריכים, מגמות וטיפים מהשטח, <b>בלי סיסמאות ריקות</b>.',
    ctas: false,
  })}

<section class="sec-tight" style="padding-bottom:clamp(70px,9vw,120px)">
  <div class="container">
    <div class="art-grid">
      ${ARTICLES.map(([url, t, tag], i) => `
      <a class="art-card reveal" style="--d:${(i % 3) * 0.08}s" href="${url}" target="_blank" rel="noopener">
        <div class="art-in">
          <span class="a-tag">${tag}</span>
          <h3>${t}</h3>
          <span class="a-read">לקריאת המאמר ${IC.crumb}</span>
        </div>
      </a>`).join('')}
    </div>
  </div>
</section>

${ctaSection(root, { title: 'מעדיפים שנעשה את זה <span class="gw">בשבילכם?</span>' })}`,
});

/* =================================================================
   יצירת קשר
================================================================= */
page('יצירת-קשר', {
  title: 'יצירת קשר - קבל לידים איכותיים לעסק שלך | BaliLead',
  desc: 'צרו קשר עם BaliLead: טלפון 058-4700706, מייל info@balilead.co.il. שירות הלקוחות פעיל א-ה 09:00-16:00, מענה מובטח תוך 24 שעות.',
  active: 'contact',
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'יצירת קשר' }],
    h1: 'דברו איתנו, <span class="gw">אנחנו כאן בשבילכם</span>',
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
  body: root => `
${pageHero(root, {
    crumbs: [{ href: '', t: 'ראשי' }, { t: 'הצהרת נגישות' }],
    h1: 'הצהרת <span class="gw">נגישות</span>',
    sub: 'BALILEAD מעוניינת לספק שירות שוויוני לכל לקוחותיה באשר הם.',
    ctas: false,
  })}

<section class="sec-tight" style="padding-bottom:clamp(80px,10vw,140px)">
  <div class="container">
    <div class="prose">
      <p>אתר זה עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג 2013. התאמות הנגישות בוצעו על פי המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA ומסמך WCAG 2.0 הבינלאומי.</p>
      <h2>דרכי הנגשה</h2>
      <ul>
        <li>האתר מותאם לתצוגה בכל דפדפן מודרני ובמכשירי טלפון סלולריים, ונבדק בדפדפנים הנפוצים.</li>
        <li>האתר תומך בטכנולוגיות מסייעות ובהפעלה באמצעות מקלדת: מקשי החיצים, Enter ו-Esc ליציאה מתפריטים וחלונות.</li>
        <li>ההתאמות כוללות היררכיית כותרות תקינה, טקסט חלופי לתמונות, ניגודיות צבעים גבוהה והתאמה למצב הפחתת תנועה.</li>
      </ul>
      <h2>אחראי נגישות</h2>
      <p>למרות מאמצינו להנגיש את האתר באופן מלא, ייתכן שיתגלו חלקים שאינם נגישים. אם נתקלתם בבעיה, אנא פנו לאחראי הנגישות:</p>
      <ul>
        <li><b>שם:</b> יוסי לוי</li>
        <li><b>טלפון:</b> 050-2277087</li>
        <li><b>דוא"ל:</b> Yositaxes@gmail.com</li>
      </ul>
      <p>הצהרת הנגישות עודכנה לאחרונה בתאריך 01.12.24.</p>
    </div>
  </div>
</section>`,
});

console.log('ALL PAGES BUILT');
