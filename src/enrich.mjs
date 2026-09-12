/**
 * What a long page gets that plain prose does not: something to look at, and
 * somewhere to go.
 *
 * The site's articles run from six hundred to sixteen thousand words, and every
 * one of them was an unbroken column of text with a single form at the bottom.
 * A reader who decided halfway down that they wanted a quote had nothing to act
 * on until they scrolled past everything they had already read.
 *
 * This runs at build time, over the finished HTML, and touches no content file.
 * That matters twice over: the data files stay byte-identical (a reformatted
 * site-content.json once produced a forty-thousand-line diff nobody could
 * review), and everything the engine writes from here on gets the same
 * treatment without knowing this file exists.
 *
 * Nothing is inserted past `furnitureStart` — the questions, the related links
 * and the contact form are where a page finishes, and a call to action after
 * them is a call to action nobody reads.
 */
import { IC, SITE } from './layout.mjs';
import { furnitureStart, articleColumn, heroEnd } from './regions.mjs';

/* ------------------------------------------------------------------
   Topics
   ------------------------------------------------------------------
   Each entry names one image from the site's own library and says what is in
   it. The alt text describes the picture and then ties it to the subject,
   because a reader using a screen reader is owed the first part and a search
   engine reads the second — and because "תמונה" as alt text is the same as no
   alt text at all.

   Order matters: the first match wins, so the narrow tests come before the
   broad ones (a page about מכירת תיק is not a page about מס). */
const TOPICS = [
  {
    key: 'mortgage',
    test: /משכנת|נדל.ן|דירה|רכישת בית/,
    img: 'cover-mortgage.webp',
    also: ['hero-loans.webp', 'cover-loans.webp'],
    alt: 'צרור מפתחות זהב ובית זהב קטן על משטח שיש כהה — ליד למשכנתה מגיע כשהלקוח כבר מחפש דירה',
    cap: 'הליד למשכנתה נוצר הרבה לפני החתימה: ברגע שהלקוח מתחיל לבדוק כמה הוא יכול לקחת.',
    h: 'מחפשים לידים למשכנתאות?',
    p: 'לקוחות שכבר בתהליך רכישה, מסוננים לפי גובה ההון העצמי ואזור המגורים, ומועברים אליכם בזמן אמת.',
    nudge: 'רוצים לראות איך נראה ליד למשכנתה שמגיע אליכם בפועל?',
  },
  {
    key: 'insurance',
    test: /ביטוח|סוכן ביטוח|פנסי/,
    img: 'cover-insurance.webp',
    also: ['cover-leads.webp'],
    alt: 'מטרייה עשויה נקודות אור זהובות פרושה מעל משפחת דמויות זכוכית — המחשה לכיסוי ביטוחי שמגן על המשפחה',
    cap: 'בביטוח הליד נמדד לא בכמות אלא בהתאמה: גיל, מצב משפחתי וסוג הפוליסה שמעניינת אותו.',
    h: 'מחפשים לידים לביטוח?',
    p: 'פניות מסוננות לפי סוג הפוליסה והפרופיל שמתאים לכם, בלעדיות לסוכנות אחת, בלי להתחרות על אותו לקוח.',
    nudge: 'רוצים לידים לביטוח שכבר סוננו לפי סוג הפוליסה שאתם מוכרים?',
  },
  {
    key: 'tax',
    test: /החזר.? מס|מס הכנסה|תיאום מס/,
    img: 'hero-tax.webp',
    also: ['hero-account.webp', 'cover-loans.webp'],
    alt: 'מעטפת זהב פתוחה שממנה נשפכים מטבעות זהב על שולחן שיש — כסף שחוזר ללקוח בהחזר מס',
    cap: 'הפנייה להחזר מס מגיעה מלקוח שכבר יודע שמגיע לו כסף — נשאר רק להוכיח כמה.',
    h: 'מחפשים לידים להחזרי מס?',
    p: 'פניות מאנשים שכבר בדקו שמגיע להם, מסוננות לפי שנות עבודה ומצב תעסוקתי, ומועברות תוך דקות.',
    nudge: 'רוצים לקבל פניות להחזרי מס בזמן אמת, לא בסוף החודש?',
  },
  {
    key: 'portfolio',
    test: /מכירת תיק|רכישת תיק|העברת תיק/,
    img: 'hero-tik.webp',
    also: ['hero-account.webp'],
    alt: 'שתי ידיים בכפפות מעבירות תיקייה זהובה מעל מזוודת עור פתוחה — העברת תיק לקוחות בין משרדים',
    cap: 'העברת תיק היא עסקה של אמון: מי שמוכר רוצה לדעת שהלקוחות שלו בידיים טובות.',
    h: 'רוצים להגדיל את משרד רואי החשבון?',
    p: 'אנחנו מביאים בעלי עסקים שמחפשים משרד חדש — לא רשימת טלפונים, אלא פניות שנוצרו מהעניין שלהם.',
    nudge: 'רוצים זרם קבוע של בעלי עסקים שמחפשים רואה חשבון?',
  },
  {
    key: 'account',
    test: /רו.?אי? חשבון|הנהלת חשבונות|יועץ מס|ייעוץ מס/,
    img: 'hero-account.webp',
    also: ['hero-tax.webp', 'hero-osek.webp'],
    alt: 'מחשבון עתיק וספר חשבונות פתוח על שולחן עץ, ומעליהם מספרים זוהרים באוויר — עבודת הנהלת החשבונות שמאחורי כל תיק לקוח',
    cap: 'מאחורי כל לקוח חדש במשרד עומדת שיחה אחת שהתחילה מפנייה אחת באינטרנט.',
    h: 'מחפשים לקוחות חדשים למשרד?',
    p: 'בעלי עסקים שמחפשים רואה חשבון או מנהל חשבונות, מסוננים לפי סוג העסק וההיקף שמתאים לכם.',
    nudge: 'רוצים לידים של בעלי עסקים שמחפשים משרד חדש?',
  },
  {
    key: 'osek',
    test: /עוסק מורשה|עוסק פטור|פתיחת עסק|עסק חדש/,
    img: 'hero-osek.webp',
    also: ['hero-account.webp'],
    alt: 'חבילת מסמכים חתומה בחותם שעווה שממנה צומח נבט זהב — עסק חדש שנפתח',
    cap: 'עסק שנפתח היום הוא לקוח שמחפש היום ספק לכל דבר: רואה חשבון, ביטוח, אתר.',
    h: 'מחפשים עסקים חדשים שרק נפתחו?',
    p: 'פניות מבעלי עסקים בתחילת הדרך — בדיוק הרגע שבו הם בוחרים את הספקים שילוו אותם.',
    nudge: 'רוצים להגיע לבעלי עסקים חדשים ברגע שהם פותחים תיק?',
  },
  {
    key: 'loans',
    test: /הלווא|מימון|אשראי|חוב|איחוד הלוואות/,
    img: 'hero-loans.webp',
    also: ['cover-loans.webp', 'cover-mortgage.webp'],
    alt: 'גשר בנוי ממגדלי מטבעות זהב חוצה תהום כהה — אשראי שמגשר בין הצורך של הלקוח ליכולת של הגוף המממן',
    cap: 'ליד להלוואה שווה משהו רק אם הוא עומד בתנאי הסף שלכם — אחרת זו שיחה שנגמרת בשלוש שניות.',
    h: 'מחפשים לידים להלוואות?',
    p: 'פניות מסוננות לפי תנאי הסף שלכם — סכום, הכנסה ומצב אשראי — בלעדיות לגוף אחד, בזמן אמת.',
    nudge: 'רוצים לידים להלוואות שכבר עברו סינון לפי תנאי הסף שלכם?',
  },
  {
    key: 'search',
    test: /גוגל|seo|קידום אתרים|מנוע.? חיפוש|אורגני/i,
    img: 'hero-google.webp',
    also: ['hero-web.webp', 'cover-marketing.webp'],
    alt: 'זכוכית מגדלת זהובה מעל גרף עמודות עולה וכוכב דירוג — מיקום בתוצאות החיפוש של גוגל',
    cap: 'מי שמחפש בגוגל כבר יודע מה הוא רוצה. כל מה שנשאר זה להיות שם כשהוא מחפש.',
    h: 'רוצים שהעסק שלכם יופיע בדיוק שם?',
    p: 'אנחנו מייצרים את הפניות מהחיפוש הזה ומעבירים אותן אליכם — בלי שתצטרכו לבנות מערך שיווק.',
    nudge: 'אפשר גם לדלג על ההמתנה לאורגני ולקבל את הפניות ישירות.',
  },
  {
    key: 'social',
    test: /פייסבוק|אינסטגרם|לינקדאין|טיקטוק|רשתות חברתיות|סושיאל|מטא/,
    img: 'hero-social.webp',
    also: ['cover-marketing.webp', 'hero-app.webp'],
    alt: 'רשת כדורי זכוכית זוהרים ובהם סמלי לייק, לב ותגובה, מחוברים בחוטי זהב — פרסום ממומן ברשתות חברתיות',
    cap: 'ברשתות הלקוח לא חיפש אתכם. התפקיד של המודעה הוא לעצור אותו באמצע הגלילה.',
    h: 'רוצים את הפניות בלי לנהל את הקמפיין?',
    p: 'אנחנו מריצים את המודעות, מסננים את הפניות ומעבירים אליכם רק את מי שבאמת רלוונטי.',
    nudge: 'רוצים לקבל את התוצאה של הקמפיין בלי לנהל אותו בעצמכם?',
  },
  {
    key: 'native',
    test: /טאבולה|אאוטבריין|נייטיב|עדכונים|חדשות/,
    img: 'hero-news.webp',
    also: ['cover-marketing.webp', 'hero-google.webp'],
    alt: 'עיתון מקופל מונח על שולחן שיש בספרייה כהה, ומעליו ניצוצות זהב — פרסום נייטיב שמופיע בתוך אתרי תוכן וחדשות',
    cap: 'פרסום נייטיב נראה כמו כתבה ולכן נקרא כמו כתבה — וזו בדיוק הסיבה שהוא עובד.',
    h: 'רוצים פניות מהערוצים האלה, מוכנות לשיחה?',
    p: 'אנחנו מפעילים את הערוצים, מסננים את מי שנרשם ומעבירים אליכם רק פניות רלוונטיות.',
    nudge: 'רוצים לדלג על ניהול הערוצים ולקבל רק את הפניות?',
  },
  {
    key: 'web',
    test: /בניית אתר|עיצוב אתר|דף נחיתה|חנות אונליין|וורדפרס/,
    img: 'hero-web.webp',
    also: ['hero-app.webp', 'hero-google.webp'],
    alt: 'שלד אתר משורטט בקווי זהב מרחף על רקע כהה — מבנה של אתר לפני שנוצק לתוכן',
    cap: 'אתר יפה שלא מייצר פניות הוא כרטיס ביקור יקר. המבנה קובע יותר מהצבע.',
    h: 'מחפשים לקוחות שרוצים אתר חדש?',
    p: 'פניות מעסקים שכבר החליטו לבנות או לשדרג אתר, מסוננות לפי היקף הפרויקט.',
    nudge: 'רוצים פניות מעסקים שמחפשים מי יבנה להם אתר?',
  },
  {
    key: 'crm',
    test: /crm|מערכת ניהול|אוטומציה|ממשק|api|אינטגרצי/i,
    img: 'hero-auto.webp',
    also: ['hero-ai.webp', 'hero-app.webp'],
    alt: 'גלגלי שיניים מזהב שמזרימים חוטי אור אל לוח מעגלים — אוטומציה שמעבירה ליד מהטופס למערכת',
    cap: 'הליד המהיר ביותר מפסיד ללא-מהיר אם הוא נוחת בתיבת מייל שאף אחד לא פותח.',
    h: 'רוצים שהלידים ייכנסו ישירות למערכת שלכם?',
    p: 'חיבור למערכת שאתם כבר עובדים איתה, העברה בזמן אמת, בלי העתקה ידנית ובלי לידים שנופלים.',
    nudge: 'רוצים שהפניות יגיעו ישירות למערכת שלכם, בלי הדבקות ידניות?',
  },
  {
    key: 'ai',
    test: /בינה מלאכותית|\bai\b|צ.אט|chatgpt|אלגוריתם/i,
    img: 'hero-ai.webp',
    also: ['hero-auto.webp', 'hero-app.webp'],
    alt: 'ראש אדם משורטט בנקודות אור זהובות מחוברות בקווים — מודל בינה מלאכותית שמנתח נתוני לידים',
    cap: 'מודל טוב לא ממציא לקוחות. הוא רק מסמן מהר יותר מי מהם באמת מתכוון לקנות.',
    h: 'רוצים את הלידים, לא את הטכנולוגיה?',
    p: 'הסינון, הניקוד וההעברה הם הצד שלנו. אצלכם נוחתת רק הפנייה שראויה לשיחה.',
    nudge: 'בסוף כל מודל נמדד בדבר אחד: כמה מהפניות הפכו ללקוחות.',
  },
  {
    key: 'app',
    test: /אפליקצי|מובייל|סמארטפון/,
    img: 'hero-app.webp',
    also: ['hero-web.webp', 'hero-auto.webp'],
    alt: 'מכשיר סמארטפון כהה שממנו מרחפים כרטיסי ממשק זהובים — חוויית המשתמש שדרכה מגיעה רוב הפנייה',
    cap: 'רוב הפניות נכתבות באגודל אחד, בדרך למקום אחר. טופס ארוך הוא פנייה שלא תישלח.',
    h: 'רוצים פניות שנשלחות באמת?',
    p: 'הטפסים שלנו בנויים למובייל, והפנייה מגיעה אליכם תוך דקות מהרגע שנשלחה.',
    nudge: 'רוצים לראות כמה פניות נוספות מגיעות כשהטופס בנוי נכון?',
  },
  {
    key: 'price',
    test: /מחיר|מחירון|עלות|תקציב|roi|כמה עולה/i,
    img: 'cover-loans.webp',
    also: ['hero-tax.webp', 'cover-marketing.webp'],
    alt: 'ערימות מטבעות זהב בגובה עולה וחץ זהוב מעליהן — העלות לליד מול התשואה שהיא מחזירה',
    cap: 'המחיר לליד הוא חצי מהסיפור. החצי השני הוא כמה מהם הפכו ללקוחות.',
    h: 'רוצים הצעת מחיר לפי התחום שלכם?',
    p: 'המחיר לליד נגזר מהתחום, מרמת הסינון ומהכמות החודשית. נשמח לתת מספר מדויק.',
    nudge: 'רוצים לדעת כמה ליד בתחום שלכם עולה בפועל?',
  },
  {
    key: 'quality',
    test: /מה זה ליד|איכות|סינון|משפך|חם|קר|המרה/,
    img: 'cover-leads.webp',
    also: ['img-magnet.webp', 'cover-marketing.webp'],
    alt: 'משפך זהב שמסנן ניצוצות אור אל טיפה אחת בתחתיתו — מסלול הסינון שליד עובר עד שהוא מגיע לעסק',
    cap: 'בין הפנייה הראשונה לליד שנמסר לעסק יש סינון. מה שנשאר בסוף הוא מה ששווה שיחה.',
    h: 'רוצים לקבל רק את מי שנשאר בסוף המשפך?',
    p: 'סינון לפי תנאי הסף שלכם, בלעדיות מלאה לעסק אחד, ומנגנון זיכוי מסודר על מה שלא רלוונטי.',
    nudge: 'רוצים לראות איך נראה ליד שעבר את כל הסינון?',
  },
  {
    key: 'marketing',
    test: /שיווק|פרסום|קמפיין|ממומן|צמיחה/,
    img: 'cover-marketing.webp',
    also: ['cover-leads.webp', 'hero-google.webp'],
    alt: 'טלפון מונח על שיש כהה ומעליו גרף עמודות זוהר בעלייה עם חצים — צמיחה שנמדדת בקמפיין דיגיטלי',
    cap: 'כל מה שלא נמדד בקמפיין ממשיך לרוץ על חשבון מה שכן עובד.',
    h: 'רוצים את התוצאה בלי לנהל את המערך?',
    p: 'אנחנו מייצרים את הפניות ומעבירים אותן אליכם. שיחת המכירה עליכם, האיכות עלינו.',
    nudge: 'רוצים לדלג על בניית המערך ולקבל ישר את הפניות?',
  },
];

/* Where a page that matches nothing lands. It is deliberately about the one
   thing every page here is about. */
const FALLBACK = {
  key: 'general',
  img: 'img-magnet.webp',
  alt: 'מגנט זהב שמושך אליו חוטי אור וחלקיקים זוהרים — עסק שמושך אליו פניות במקום לרדוף אחריהן',
  cap: 'עסק שמקבל פניות מוכנות לא רודף אחרי לקוחות. הוא רק מחליט עם מי לדבר קודם.',
  h: 'רוצים לידים שמגיעים אליכם מוכנים לשיחה?',
  p: 'מסוננים לפי תנאי הסף שלכם, בלעדיים לעסק אחד, ומועברים בזמן אמת.',
  nudge: 'רוצים לראות איך זה עובד בתחום שלכם?',
};

/* The second image on a page must not repeat the first. These are ordered by
   how well they stand on their own next to any subject. */
const SECONDS = [
  { img: 'img-office.webp', alt: 'שולחן עבודה מסודר במשרד גבוה בלילה מול אורות העיר — הצוות שממשיך לטפל בפניות גם אחרי שעות העבודה', cap: 'ליד שנשלח בעשר בערב שווה הכי הרבה בעשר וחצי, לא למחרת בבוקר.' },
  { img: 'cover-leads.webp', alt: 'משפך זהב שמסנן ניצוצות אור אל טיפה אחת בתחתיתו — הסינון שכל פנייה עוברת לפני שהיא נמסרת', cap: 'מה שמגיע אליכם הוא מה שנשאר אחרי הסינון, לא כל מי שלחץ.' },
  { img: 'img-magnet.webp', alt: 'מגנט זהב שמושך אליו חוטי אור וחלקיקים זוהרים — פניות שנמשכות לעסק במקום שירדפו אחריהן', cap: 'ההבדל בין רשימת טלפונים לבין ליד הוא מי פנה למי.' },
  { img: 'img-sparks.webp', alt: 'ניצוצות זהב מתפזרים על רקע שחור — תנועת הפניות שנכנסת לאורך היום', cap: 'הפניות לא מגיעות במנה אחת ביום. הן מגיעות כל היום.' },
];

/* The arrow lives inside its own circle at the edge of the button, so pressing
   the button moves something inside it. */
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';

/**
 * The address decides before the title does.
 *
 * A price list names every vertical it prices, so /מחירון-לידים/ matched
 * "משכנתאות" from its own title and offered mortgage leads on a page about
 * pricing. The path is what the page is; the title is only what it mentions.
 */
function topicFor(path, title) {
  const slug = decodeURIComponent(path || '').toLowerCase();
  const byPath = TOPICS.find(t => t.test.test(slug));
  if (byPath) return byPath;
  return TOPICS.find(t => t.test.test(`${slug} ${(title || '').toLowerCase()}`)) || FALLBACK;
}

/**
 * Which pictures this page may use, in order of preference.
 *
 * A page whose hero already shows the coin bridge does not want the coin bridge
 * again four screens down — that reads as a template running out of material,
 * not as an illustration. Anything the page already displays is out, and if
 * that empties the shelf the page gets fewer images rather than a repeat.
 */
function picturesFor(html, topic) {
  const used = new Set(
    [...html.matchAll(/assets\/([a-z0-9-]+\.(?:webp|jpg|jpeg|png))/gi)].map(m => m[1].toLowerCase()));
  const order = [topic.img, ...(topic.also || []), ...SECONDS.map(s => s.img)];
  const out = [];
  for (const name of order) {
    const pic = BY_IMG.get(name);
    if (!pic || used.has(name.toLowerCase())) continue;
    if (out.some(p => p.img === pic.img)) continue;
    out.push(pic);
    if (out.length === 2) break;
  }
  return out;
}

/* One description per picture, wherever it is first written down. A topic's own
   wording wins over the neutral wording in SECONDS, so an image used as the
   subject of one page keeps its subject's caption when another page borrows
   it as a second. */
const BY_IMG = new Map();
for (const src of [...TOPICS, FALLBACK, ...SECONDS]) {
  if (!BY_IMG.has(src.img)) BY_IMG.set(src.img, { img: src.img, alt: src.alt, cap: src.cap });
}

/* ---------------- the blocks ---------------- */

/* A block between two sections carries its own container. Not `.prose`, which
   caps at 780px and left two thirds of a commercial page empty beside a card
   pinned to one edge — a measure of its own, centred, wide enough to hold a
   picture and narrow enough to stay readable. */
const wrapped = (inner, wrap) => (wrap
  ? `\n<section class="sec-tight"><div class="container"><div class="enrich-wrap">${inner}</div></div></section>\n`
  : `\n${inner}\n`);

function pitchHtml({ topic, href, wrap, delay }) {
  const inner = `<aside class="pitch reveal"${delay ? ` style="--d:${delay}"` : ''}>
  <div class="pitch-in">
    <div class="pitch-copy">
      <span class="pitch-eyebrow">לידים בלעדיים</span>
      <h3 class="pitch-h">${topic.h}</h3>
      <p class="pitch-p">${topic.p}</p>
    </div>
    <div class="pitch-act">
      <a class="pitch-go" href="${href}">לקבלת הצעה<span class="pitch-ic">${ARROW}</span></a>
      <a class="pitch-tel" href="${SITE.phoneHref}"><span class="pitch-tic">${IC.phone}</span>${SITE.phone}</a>
    </div>
  </div>
</aside>`;
  return wrapped(inner, wrap);
}

function nudgeHtml({ topic, href, wrap }) {
  const inner = `<div class="nudge reveal">
  <span class="nudge-rule" aria-hidden="true"></span>
  <p class="nudge-p">${topic.nudge} <a class="nudge-go" href="${href}">דברו איתנו<span class="nudge-ic">${ARROW}</span></a></p>
</div>`;
  return wrapped(inner, wrap);
}

function figureHtml({ pic, root, wrap }) {
  const inner = `<figure class="cfig reveal">
  <div class="cfig-in"><img src="${root}assets/${pic.img}" alt="${pic.alt}" loading="lazy" decoding="async"></div>
  <figcaption class="cfig-cap">${pic.cap}</figcaption>
</figure>`;
  return wrapped(inner, wrap);
}

/* ---------------- table of contents ---------------- */

/**
 * An id for a heading, made from the heading.
 *
 * Hebrew is kept: a fragment of Hebrew text is valid in HTML5 and in a URL,
 * and "#איך-מתבצע-הסינון" tells a person who copies the link what it points
 * at, which "#s7" does not. Only the characters that would break a fragment
 * or an attribute are removed.
 */
function slugify(text, taken) {
  const base = String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/["'<>#?%&/\\|{}[\]()]/g, '')
    .replace(/[.,:;!]+/g, '')
    .trim().replace(/\s+/g, '-')
    .slice(0, 60) || 'פרק';
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}

const headingText = tag => tag.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/**
 * Gives every heading in the region an id, and reports what they are.
 *
 * Ids are written from the last heading backwards so that an insertion cannot
 * move the position of one not yet reached.
 */
function anchorHeadings(html, from, to) {
  const found = [...html.slice(from, to).matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)]
    .map(m => ({ at: m.index + from, attrs: m[1], inner: m[2], whole: m[0] }));
  const taken = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  const entries = [];
  let out = html;
  for (let i = found.length - 1; i >= 0; i--) {
    const h = found[i];
    const text = headingText(h.inner);
    if (!text) continue;
    const existing = /\sid="([^"]+)"/.exec(h.attrs);
    const id = existing ? existing[1] : slugify(text, taken);
    entries.unshift({ id, text });
    if (existing) continue;
    out = out.slice(0, h.at) + `<h2 id="${id}"${h.attrs}>` + out.slice(h.at + `<h2${h.attrs}>`.length);
  }
  return { html: out, entries };
}

function tocHtml(entries, wrap) {
  const many = entries.length > 14;
  const inner = `<nav class="toc reveal" aria-label="תוכן העמוד">
  <div class="toc-in">
    <div class="toc-head">
      <span class="toc-eyebrow">בעמוד הזה</span>
      <span class="toc-count">${entries.length} פרקים</span>
    </div>
    <ol class="toc-list${many ? ' toc-scroll' : ''}">
      ${entries.map((e, i) => `<li><a href="#${e.id}"><span class="toc-n">${String(i + 1).padStart(2, '0')}</span><span class="toc-t">${e.text}</span></a></li>`).join('\n      ')}
    </ol>
  </div>
</nav>`;
  return wrapped(inner, wrap);
}

/* ---------------- placement ---------------- */

/**
 * What a page of this length earns.
 *
 * Images are capped at two whatever the length, because a page is not an album
 * and the request was for at most two. Calls to action scale with the scroll —
 * a sixteen-thousand-word page is four ordinary articles end to end, and one
 * offer at the top of it is one offer nobody reaches.
 */
function planFor(words) {
  /* Below this a page is a listing or a stub, and an offer inside it would be
     most of the page. */
  if (words < 260) return [];
  const plan = [];
  const short = words < 450;
  if (!short) plan.push({ kind: 'figure', at: .20, n: 0 });
  plan.push({ kind: 'pitch', at: short ? .55 : .45 });
  if (words >= 1400) plan.push({ kind: 'figure', at: .66, n: 1 });
  if (words >= 1800) plan.push({ kind: 'nudge', at: .80 });
  if (words >= 4000) plan.push({ kind: 'pitch', at: .93 });
  return plan;
}

/**
 * Turns a heading's position into a position it is safe to insert at.
 *
 * A heading inside a generated section sits in `<div class="sec-head">`, and
 * putting a figure there would drop it inside the section's own header. When
 * the heading is enclosed by a section that opened after the region began, the
 * insert goes before that whole section and carries its own container.
 */
function anchorAt(html, index, from) {
  const open = html.lastIndexOf('<section', index);
  const close = html.lastIndexOf('</section>', index);
  if (open > close && open >= from) return { at: open, wrap: true };
  return { at: index, wrap: false };
}

const hebrewWords = s => (s.replace(/<[^>]+>/g, ' ').match(/[א-ת]{2,}/g) || []).length;

/**
 * Adds the blocks to one finished page.
 *
 * `path` and `title` decide the subject; everything else is read off the HTML,
 * so a page nobody wrote a rule for still gets the right treatment.
 */
export function enrich(html, { path = '', title = '', root = '' } = {}) {
  /* Pages that are not articles: the contact page is already one long call to
     action, and the accessibility statement is a legal text. */
  if (/^(יצירת-קשר|הצהרת-נגישות|מדיניות-פרטיות|תקנון|תנאי-שימוש|404)/.test(path)) return html;

  /* Headings are given their ids first, because writing them moves every
     position after them — so the region is measured again afterwards, not
     patched up. */
  {
    const col = articleColumn(html);
    const f = col ? col.from : heroEnd(html);
    const t = col ? col.to : furnitureStart(html);
    if (t > f) html = anchorHeadings(html, f, t).html;
  }

  const column = articleColumn(html);
  const from = column ? column.from : heroEnd(html);
  const to = column ? column.to : furnitureStart(html);
  if (to <= from) return html;

  const region = html.slice(from, to);
  const words = hebrewWords(region);
  const plan = planFor(words);
  const entries = [...region.matchAll(/<h2\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
    .map(m => ({ id: m[1], text: headingText(m[2]) }))
    .filter(e => e.text);
  /* Six is where a page stops being read straight through and starts being
     searched. Below that a list of contents is furniture. */
  const wantsToc = entries.length >= 6;
  if (!plan.length && !wantsToc) return html;

  /* Every <h2> in the region, in reading order. They are the only places a
     block may land: between two headings is between two thoughts. */
  let heads = [...region.matchAll(/<h2\b/g)].map(m => m.index + from);
  /* Sub-headings count too on a page that carries only one main heading.
     Without this a four-hundred-word article with a single h2 gets nothing at
     all, and that describes most of the older posts. */
  if (heads.length < 2) heads = [...region.matchAll(/<h[23]\b/g)].map(m => m.index + from);
  if (heads.length < 2) return html;

  const topic = topicFor(path, title);
  const pics = picturesFor(html, topic);
  const href = html.includes('id="contact"') ? '#contact' : `${root}יצירת-קשר/`;

  /* The first heading is left alone — a reader who has read one paragraph has
     not yet earned an interruption. */
  const taken = new Set();
  const picks = [];
  for (const step of plan) {
    /* A picture the page cannot supply is dropped, not substituted. */
    if (step.kind === 'figure' && !pics[step.n]) continue;
    let i = Math.min(heads.length - 1, Math.max(1, Math.round(step.at * (heads.length - 1))));
    /* Two blocks at the same heading, or at neighbouring ones, read as a wall.
       Walk forward to the next free slot and give up rather than crowd. */
    let guard = 0;
    while (guard++ < heads.length && [...taken].some(t => Math.abs(t - i) < 1.5)) i++;
    if (i >= heads.length) continue;
    taken.add(i);
    picks.push({ ...step, index: heads[i] });
  }

  /* The list of contents goes above everything, which is also why it is added
     last: the loop below works from the bottom up, and this is the bottom of
     that order. In a column it sits at the top of the column; on a page built
     from sections it goes before the section the first heading is in. */
  if (wantsToc) picks.push({ kind: 'toc', index: column ? from : heads[0], top: !column });
  if (!picks.length) return html;

  /* Bottom up, so an earlier insertion cannot shift the index a later one was
     measured against. */
  let out = html;
  for (const pick of picks.sort((a, b) => b.index - a.index)) {
    /* A list of contents at the top of a column needs no anchoring — it is
       already at the start of the text it lists. */
    const { at, wrap } = pick.kind === 'toc' && !pick.top
      ? { at: pick.index, wrap: false }
      : anchorAt(out, pick.index, from);
    const block = pick.kind === 'figure'
      ? figureHtml({ pic: pics[pick.n], root, wrap })
      : pick.kind === 'pitch'
        ? pitchHtml({ topic, href, wrap, delay: '.06s' })
        : pick.kind === 'toc'
          ? tocHtml(entries, wrap)
          : nudgeHtml({ topic, href, wrap });
    out = out.slice(0, at) + block + out.slice(at);
  }
  return out;
}

/* ---------------- the look ---------------- */

/**
 * Appended after the site's own stylesheet, which is also why the selectors
 * here can be as simple as they are: `.prose p` and `.prose a` would otherwise
 * win on specificity and hand the card a paragraph margin and the button an
 * underline. Compound selectors where it matters, order where it does not.
 */
export function enrichCss() {
  return `
/* ===== in-content blocks (enrich.mjs) ===== */
.enrich-wrap{max-width:1000px;margin-inline:auto}
/* A picture between two sections reads as an illustration, not as a banner:
   narrower than the card beside it. */
.enrich-wrap .cfig{max-width:880px;margin-inline:auto}
.enrich-wrap>:first-child{margin-top:0}
.enrich-wrap>:last-child{margin-bottom:0}
.pitch{position:relative;display:block;margin:44px 0;padding:.45rem;border-radius:1.9rem;
  background:linear-gradient(148deg,rgba(217,164,91,.17) 0%,rgba(20,15,9,.55) 52%,rgba(12,9,6,.5) 100%);
  border:1px solid rgba(217,164,91,.22);
  box-shadow:0 44px 90px -54px rgba(0,0,0,.95);
  isolation:isolate}
.pitch-in{position:relative;border-radius:calc(1.9rem - .45rem);padding:26px 26px 28px;
  background:linear-gradient(162deg,rgba(31,22,13,.97) 0%,rgba(12,9,6,.98) 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.1);
  display:grid;gap:22px;overflow:hidden;isolation:isolate}
/* The glow belongs inside the panel: behind it, the panel's own fill hides it. */
.pitch-in::before{content:"";position:absolute;inset-block:-70% auto;inset-inline-end:-14%;width:58%;aspect-ratio:1;
  z-index:-1;pointer-events:none;
  background:radial-gradient(circle,rgba(217,164,91,.26) 0%,rgba(217,164,91,.07) 42%,transparent 70%)}
.pitch-in::after{content:"";position:absolute;inset-block:20px;inset-inline-start:0;width:2px;border-radius:999px;
  background:var(--grad-gold);opacity:.8}
@media(min-width:760px){
  .pitch-in{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:34px;padding:32px 36px}
}
.pitch .pitch-eyebrow{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:4px 11px 5px;
  font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--gold2);
  background:rgba(217,164,91,.1);border:1px solid rgba(217,164,91,.25)}
.pitch .pitch-eyebrow::before{content:"";width:5px;height:5px;border-radius:999px;background:var(--gold2);
  box-shadow:0 0 9px rgba(240,194,122,.9)}
.pitch .pitch-h{font-size:clamp(21px,2.4vw,28px);line-height:1.2;color:var(--ink);margin:14px 0 9px}
.pitch .pitch-p{color:var(--muted);font-size:16px;line-height:1.62;margin:0;max-width:48ch}
.pitch .pitch-act{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.pitch .pitch-go{display:inline-flex;align-items:center;gap:12px;border-radius:999px;
  padding:11px 12px 11px 22px;background:var(--grad-gold);color:#1c1206;
  font-weight:800;font-size:15px;text-decoration:none;white-space:nowrap;
  box-shadow:0 18px 40px -18px rgba(217,164,91,.6);
  transition:transform .5s var(--ease),box-shadow .5s var(--ease)}
.pitch .pitch-go:hover{transform:translateY(-2px);box-shadow:0 24px 50px -18px rgba(217,164,91,.75)}
.pitch .pitch-go:active{transform:scale(.98)}
.pitch .pitch-ic{width:30px;height:30px;border-radius:999px;flex:0 0 auto;
  display:flex;align-items:center;justify-content:center;background:rgba(28,18,6,.14);
  transition:transform .5s var(--ease)}
.pitch .pitch-ic svg{width:16px;height:16px}
.pitch .pitch-go:hover .pitch-ic{transform:translateX(-3px) scale(1.06)}
.pitch .pitch-tel{display:inline-flex;align-items:center;gap:9px;border-radius:999px;
  padding:10px 18px;color:var(--ink);font-weight:700;font-size:14.5px;text-decoration:none;
  background:rgba(244,238,227,.04);border:1px solid var(--line-strong);
  transition:border-color .4s var(--ease),background .4s var(--ease)}
.pitch .pitch-tel:hover{border-color:rgba(217,164,91,.4);background:rgba(217,164,91,.08)}
.pitch .pitch-tic{display:flex;color:var(--gold2)}
.pitch .pitch-tic svg{width:16px;height:16px}

.nudge{position:relative;margin:44px 0;padding:24px 0 0}
.nudge .nudge-rule{position:absolute;top:0;inset-inline:0;height:1px;
  background:linear-gradient(to left,rgba(217,164,91,.55),rgba(217,164,91,.12) 42%,transparent 78%)}
.nudge .nudge-rule::before{content:"";position:absolute;top:-2.5px;inset-inline-start:0;width:6px;height:6px;
  border-radius:999px;background:var(--gold2);box-shadow:0 0 12px rgba(240,194,122,.85)}
.nudge .nudge-p{color:var(--ink);font-size:17px;line-height:1.62;margin:0;font-weight:600}
.nudge .nudge-go{display:inline-flex;align-items:center;gap:8px;color:var(--gold2);font-weight:800;
  text-decoration:none;border-bottom:1px solid rgba(217,164,91,.35);padding-bottom:1px;
  transition:border-color .4s var(--ease),color .4s var(--ease)}
.nudge .nudge-go:hover{color:#f6d9a0;border-color:var(--gold2);background:none}
.nudge .nudge-ic{display:flex;transition:transform .5s var(--ease)}
.nudge .nudge-ic svg{width:15px;height:15px}
.nudge .nudge-go:hover .nudge-ic{transform:translateX(-3px)}

/* Table of contents. The sticky header is a floating pill about ninety pixels
   tall, so a heading jumped to lands under it without this. */
[id]:target,h2[id]{scroll-margin-top:118px}
.toc{display:block;margin:34px 0 42px;padding:.4rem;border-radius:1.7rem;
  background:linear-gradient(150deg,rgba(217,164,91,.12),rgba(20,15,9,.5) 58%);
  border:1px solid rgba(217,164,91,.18)}
.toc-in{border-radius:calc(1.7rem - .4rem);padding:20px 22px 14px;
  background:linear-gradient(160deg,rgba(24,17,10,.96),rgba(11,9,6,.97));
  box-shadow:inset 0 1px 1px rgba(255,255,255,.08)}
.toc .toc-head{display:flex;align-items:center;justify-content:space-between;gap:14px;
  padding-bottom:12px;margin-bottom:6px;border-bottom:1px solid var(--line)}
.toc .toc-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;
  letter-spacing:.16em;color:var(--gold2)}
.toc .toc-eyebrow::before{content:"";width:16px;height:2px;border-radius:999px;background:var(--grad-gold)}
.toc .toc-count{font-size:12.5px;color:var(--dim);white-space:nowrap}
.toc .toc-list{list-style:none;margin:0;padding:0;display:grid;gap:1px 26px}
@media (min-width:700px){.toc .toc-list{grid-template-columns:1fr 1fr}}
@media (min-width:1180px){.enrich-wrap .toc .toc-list{grid-template-columns:1fr 1fr 1fr}}
/* Every chapter stays listed on a page with forty of them; the panel scrolls
   rather than the list being cut, because a list of contents that hides half
   the contents is worse than none. */
/* Padding on both sides, not only the far one: a scrolling box clips on its
   inline-start edge too, and the ordinal sat exactly on it. */
.toc .toc-scroll{max-height:min(46vh,360px);overflow-y:auto;padding-inline:5px 8px;
  mask-image:linear-gradient(to bottom,#000 calc(100% - 34px),transparent);
  -webkit-mask-image:linear-gradient(to bottom,#000 calc(100% - 34px),transparent)}
/* A grid item's min-width is auto, so without this the row refuses to shrink
   below its longest title, the columns overflow the panel, and the ordinal at
   the far edge is sliced in half by the border. */
.toc .toc-list li{margin:0;padding:0;min-width:0}
.toc .toc-list li::before{display:none}
.toc .toc-list a{display:flex;align-items:baseline;gap:10px;padding:8px 0;min-width:0;
  color:var(--muted);font-size:15px;font-weight:600;text-decoration:none;line-height:1.45;
  border-bottom:1px solid transparent;transition:color .35s var(--ease)}
.toc .toc-list a:hover{color:var(--gold2);background:none}
.toc .toc-n{flex:0 0 auto;font-family:'Secular One';font-size:11.5px;color:var(--gold);opacity:.75;
  letter-spacing:.06em;transition:opacity .35s var(--ease)}
.toc .toc-list a:hover .toc-n{opacity:1}
.toc .toc-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width:600px){.toc .toc-t{white-space:normal}}

.cfig{margin:40px 0;padding:0}
.cfig-in{padding:.34rem;border-radius:1.7rem;background:rgba(244,238,227,.045);
  border:1px solid var(--line);box-shadow:0 40px 80px -50px rgba(0,0,0,.95)}
.cfig-in img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;
  border-radius:calc(1.7rem - .34rem);box-shadow:inset 0 1px 1px rgba(255,255,255,.08)}
.cfig .cfig-cap{margin:15px 2px 0;color:var(--muted);font-size:14px;line-height:1.62;
  padding-inline-start:15px;border-inline-start:2px solid rgba(217,164,91,.42)}
@media(max-width:600px){
  .cfig-in img{aspect-ratio:4/3}
  .pitch .pitch-go,.pitch .pitch-tel{flex:1 1 auto;justify-content:center}
}
`;
}
