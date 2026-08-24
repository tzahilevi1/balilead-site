import puppeteer from 'puppeteer-core';

const target = process.argv[2] || 'file:///C:/Users/zahci/balilead-site/index.html';
const tag = process.argv[3] || 'local';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
});

async function shoot(width, height, name, fullPage) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(target, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1200));

  // checks
  const checks = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth > window.innerWidth;
    const bg = getComputedStyle(document.body).backgroundColor;
    const h1 = document.querySelector('h1');
    const h1Font = h1 ? getComputedStyle(h1).fontFamily : 'MISSING';
    const cta = document.querySelector('.hero-ctas .btn-gold');
    const ctaVisible = cta ? cta.getBoundingClientRect().top < window.innerHeight : false;
    const hooks = {
      header: !!document.getElementById('header'),
      burger: !!document.getElementById('burger'),
      form: !!document.getElementById('leadForm'),
      marquee: !!document.getElementById('marqTrack'),
      waFloat: !!document.querySelector('.wa-float'),
      footerLinks: document.querySelectorAll('footer .f-col a').length,
    };
    // reveal all for full-page shot
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return { overflow, scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, bg, h1Font, ctaVisible, hooks };
  });
  console.log(`[${name}]`, JSON.stringify(checks, null, 1));
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: `shots/${tag}-${name}${fullPage ? '-full' : ''}.png`, fullPage });
  await page.close();
}

import { mkdirSync } from 'fs';
mkdirSync('shots', { recursive: true });

await shoot(1440, 900, 'desktop', false);
await shoot(1440, 900, 'desktop', true);
await shoot(390, 844, 'mobile', false);
await shoot(390, 844, 'mobile', true);

await browser.close();
console.log('DONE');
