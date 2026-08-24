import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, existsSync, statSync } from 'fs';
import http from 'http';
import { join } from 'path';

let base = process.argv[2];
const tag = process.argv[3] || 'gen';
let server = null;

if (!base) {
  const MIME = { html: 'text/html; charset=utf-8', png: 'image/png', jpg: 'image/jpeg', mp4: 'video/mp4', ico: 'image/png' };
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let fp = join('C:/Users/zahci/balilead-site', p);
    if (existsSync(fp) && statSync(fp).isDirectory()) fp = join(fp, 'index.html');
    if (!existsSync(fp)) { res.writeHead(404); res.end('404'); return; }
    const ext = fp.split('.').pop().toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(readFileSync(fp));
  });
  await new Promise(r => server.listen(8931, r));
  base = 'http://localhost:8931/';
}

const PAGES = [
  ['', 'home'],
  ['קניית-לידים/', 'hub-leads'],
  ['קניית-לידים/לידים-לביטוח/', 'bituach'],
  ['קניית-לידים/לידים-למשכנתאות/', 'mashkanta'],
  ['מכירת-תיק-לרואי-חשבון/', 'tik'],
  ['שיווק-דיגיטלי/', 'hub-digital'],
  ['קידום-בגוגל/', 'google'],
  ['מחירון-לידים/', 'pricing'],
  ['עדכונים-חמים/', 'magazine'],
  ['יצירת-קשר/', 'contact'],
  ['הצהרת-נגישות/', 'a11y'],
  ['חברת-לידים/', 'cpl'],
  ['מה-זה-לידים/', 'art-leads'],
  ['hot-insurance-leads/', 'art-insurance'],
  ['quality-mortgage-leads/', 'art-mortgage'],
];

mkdirSync('shots', { recursive: true });
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});

let fails = 0;
for (const [path, name] of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const url = base + encodeURI(path);
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  } catch (e) {
    console.log('LOAD-FAIL', name, String(e).slice(0, 120)); fails++; await page.close(); continue;
  }
  await new Promise(r => setTimeout(r, 900));
  const c = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    h1: (document.querySelector('h1') || {}).textContent?.trim().slice(0, 40) || 'MISSING',
    form: !!document.getElementById('leadForm'),
    nav: !!document.querySelector('.nav'),
    video: !!document.querySelector('.hero-media video'),
    brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
  }));
  const bad = c.overflow || c.h1 === 'MISSING' || c.brokenImgs > 0;
  if (bad) fails++;
  console.log(bad ? 'FAIL' : 'OK  ', name, JSON.stringify(c));
  // mobile overflow check
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 500));
  const mo = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (mo) { console.log('FAIL', name, 'MOBILE-OVERFLOW'); fails++; }
  await page.close();
}

// visual shots for key pages
async function shot(path, name, w, h, full = false) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  await page.goto(base + encodeURI(path), { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')));
  if (full) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 900));
  }
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: `shots/${tag}-${name}.png`, fullPage: full });
  await page.close();
}
await shot('', 'home-desktop', 1440, 900);
await shot('', 'home-mobile', 390, 844);
await shot('', 'home-full', 1440, 900, true);
await shot('עדכונים-חמים/', 'magazine-full', 1440, 900, true);
await shot('חברת-לידים/', 'cpl-full', 1440, 900, true);
await shot('מה-זה-לידים/', 'article-full', 1440, 900, true);
await shot('קניית-לידים/', 'hub-full', 1440, 900, true);

// dropdown menu open shot
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 800));
await page.hover('.nav .nav-item:nth-child(2) > a');
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: `shots/${tag}-dropdown.png` });
await page.close();

// select open colors check
const p2 = await browser.newPage();
await p2.setViewport({ width: 1440, height: 900 });
await p2.goto(base, { waitUntil: 'networkidle0', timeout: 60000 });
const optStyle = await p2.evaluate(() => {
  const opt = document.querySelector('#f-topic option:nth-child(2)');
  const cs = getComputedStyle(opt);
  return { bg: cs.backgroundColor, color: cs.color, scheme: getComputedStyle(document.documentElement).colorScheme };
});
console.log('SELECT-OPTION', JSON.stringify(optStyle));
await p2.close();

await browser.close();
if (server) server.close();
console.log(fails === 0 ? 'ALL CHECKS PASSED' : 'FAILURES: ' + fails);
