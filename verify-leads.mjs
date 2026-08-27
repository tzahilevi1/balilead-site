/* בדיקת קצה-לקצה של כל מסלולי הלידים באתר החי:
   טופס ראשי (בית) / טופס ראשי (עמוד לידים, כולל מילוי-אוטומטי) / פופאפ יציאה / צ'אט באלי.
   מדמה משתמש אמיתי, חוסם פתיחת וואטסאפ, מיירט את הקריאה ל-webhook ומדפיס את הפיילוד.
   שימוש: node verify-leads.mjs */
import puppeteer from 'puppeteer-core';

const BASE = 'https://balilead.co.il/';
const HOOK = 'hook.us1.make.com';

/* 1. המתנה לדיפלוי: site.js החי חייב לכלול את גרסת ה-consent/keepalive */
process.stdout.write('waiting for deploy');
for (let i = 0; i < 40; i++) {
  const txt = await fetch(BASE + 'site.js?v=' + Date.now()).then(r => r.text()).catch(() => '');
  if (txt.includes('keepalive') && txt.includes('consent')) { console.log(' ✓ live'); break; }
  if (i === 39) { console.log(' ✗ TIMEOUT — site.js הישן עדיין בפרודקשן'); process.exit(1); }
  process.stdout.write('.');
  await new Promise(r => setTimeout(r, 6000));
}

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
});

const results = [];

async function freshPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  /* חסימת ניווט לוואטסאפ + תיעוד שהוא כן נקרא (ה-UX נשמר) */
  await page.evaluateOnNewDocument(() => {
    window.__opened = [];
    window.open = u => { window.__opened.push(u); return null; };
  });
  const hooks = [];
  page.on('request', req => {
    if (req.url().includes('hook.us1.make.com') && req.method() === 'POST') {
      const p = Object.fromEntries(new URLSearchParams(req.postData() || ''));
      hooks.push(p);
    }
  });
  page.hooks = hooks;
  return page;
}

async function waitHook(page, ms = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (page.hooks.length) return page.hooks[page.hooks.length - 1];
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}

function report(name, payload, waCalled, extra = {}) {
  const ok = !!payload && payload.secret === 'bl2026';
  results.push({ name, ok, waCalled, payload, ...extra });
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (payload ? '  → type=' + payload.type + ' | consent=' + payload.consent + ' | phone=' + payload.phone + ' | topic=' + (payload.topic || '-') + ' | ip=' + (payload.ip || 'ריק') : '  (לא נתפסה קריאת webhook!)'));
}

/* ===== A. טופס ראשי — דף הבית ===== */
{
  const page = await freshPage();
  await page.goto(BASE + '?utm_source=verify&utm_campaign=forms-test', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500)); /* זמן ל-IP prefetch */
  await page.evaluate(() => document.getElementById('leadForm').scrollIntoView());
  await page.type('#leadForm input[name="name"]', 'בדיקה טופס בית');
  await page.type('#leadForm input[name="phone"]', '0500000001');
  await page.select('#f-topic', 'הלוואות');
  await page.click('#leadForm button[type="submit"]');
  const p = await waitHook(page);
  const wa = await page.evaluate(() => window.__opened.length);
  report('טופס ראשי — דף הבית', p, wa > 0, { utmOk: p && /utm_source=verify/.test(p.utm || '') });
  await page.close();
}

/* ===== B. טופס ראשי — עמוד לידים-לביטוח (מילוי-אוטומטי של התחום) ===== */
{
  const page = await freshPage();
  await page.goto(BASE + encodeURIComponent('קניית-לידים') + '/' + encodeURIComponent('לידים-לביטוח') + '/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  const preselect = await page.$eval('#f-topic', el => el.value);
  await page.evaluate(() => document.getElementById('leadForm').scrollIntoView());
  await page.type('#leadForm input[name="name"]', 'בדיקה טופס ביטוח');
  await page.type('#leadForm input[name="phone"]', '0500000002');
  await page.click('#leadForm button[type="submit"]');
  const p = await waitHook(page);
  const wa = await page.evaluate(() => window.__opened.length);
  report('טופס ראשי — לידים-לביטוח', p, wa > 0, { preselect });
  await page.close();
}

/* ===== C. פופאפ יציאה (exit intent, חמוש אחרי 12ש) ===== */
{
  const page = await freshPage();
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 13000));
  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { clientY: 0, bubbles: true })));
  await page.waitForSelector('#popOv.open', { timeout: 5000 }).catch(() => {});
  const popOpen = await page.$eval('#popOv', el => el.classList.contains('open')).catch(() => false);
  if (popOpen) {
    await page.type('#popPhone', '0500000003');
    await page.click('#popForm button[type="submit"]');
  }
  const p = await waitHook(page);
  const wa = await page.evaluate(() => window.__opened.length);
  report('פופאפ יציאה', p, wa > 0, { popOpen });
  await page.close();
}

/* ===== D. צ'אט באלי — השארת טלפון ===== */
{
  const page = await freshPage();
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.click('#chatBtn');
  await new Promise(r => setTimeout(r, 800));
  await page.type('#chatInput', '0500000004');
  await page.click('#chatSend');
  const p = await waitHook(page);
  report('צ׳אט באלי — טלפון', p, false);
  await page.close();
}

await browser.close();
const fails = results.filter(r => !r.ok).length;
console.log('\n===== ' + (fails ? fails + ' FAILURES' : 'ALL ' + results.length + ' LEAD PATHS PASS') + ' =====');
console.log(JSON.stringify(results, null, 1));
process.exit(fails ? 1 : 0);
