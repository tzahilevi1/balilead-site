/* צילום ממוקד של הצ'קבוקס בטופס — דסקטופ + מובייל (מקומי, אחרי gen) */
import puppeteer from 'puppeteer-core';
import http from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const MIME = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'application/javascript', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', mp4: 'video/mp4', xml: 'application/xml', txt: 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let fp = join('C:/Users/zahci/balilead-site', p);
  if (existsSync(fp) && statSync(fp).isDirectory()) fp = join(fp, 'index.html');
  if (!existsSync(fp)) { res.writeHead(404); res.end('404'); return; }
  const ext = fp.split('.').pop().toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(fp));
});
await new Promise(r => server.listen(8933, r));

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
});
for (const [w, h, name] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  await page.goto('http://localhost:8933/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.getElementById('leadForm').scrollIntoView({ block: 'center' }));
  await new Promise(r => setTimeout(r, 1800));
  const form = await page.$('#leadForm');
  await form.screenshot({ path: 'shots/consent-' + name + '.png' });
  const oneLine = await page.$eval('#leadForm .consent > span', el => el.scrollWidth <= el.clientWidth + 2);
  console.log(name, 'consent-fits:', oneLine);
  await page.close();
}
await browser.close();
server.close();
console.log('DONE');
