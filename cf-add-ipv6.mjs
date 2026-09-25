/**
 * Adds the apex AAAA records, so the site answers over IPv6.
 *
 * GitHub Pages serves both stacks, but this zone carried only the four A
 * records. Every browser on a dual-stack network falls back to IPv4 and the
 * gap stays invisible — until something that reaches the internet over IPv6
 * only tries to fetch the page. Google's OAuth brand verification is one of
 * those, and it reported the home page as unresponsive while every ordinary
 * visit was answering 200.
 *
 * Additive and idempotent: it never touches the A records, the mail records or
 * anything else in the zone, and an address that is already present is left
 * alone. cf-apply.mjs in this folder deletes the whole zone before rewriting
 * it — that is the wrong tool for a one-record change.
 *
 * Usage:
 *   node cf-add-ipv6.mjs            (בדיקה בלבד)
 *   node cf-add-ipv6.mjs --commit
 */
import { readFileSync } from 'fs';

const COMMIT = process.argv.includes('--commit');
const ZONE = 'balilead.co.il';
/* GitHub Pages' published IPv6 addresses, the pair of the four A records
   already in this zone. */
const AAAA = [
  '2606:50c0:8000::153',
  '2606:50c0:8001::153',
  '2606:50c0:8002::153',
  '2606:50c0:8003::153',
];

const token = (readFileSync('.env', 'utf8').match(/CLOUDFLARE_API_TOKEN=(\S+)/) || [])[1];
if (!token) throw new Error('אין CLOUDFLARE_API_TOKEN ב-.env');
const H = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
const api = async (path, opts = {}) =>
  (await fetch('https://api.cloudflare.com/client/v4' + path, { headers: H, ...opts })).json();

const zones = await api(`/zones?name=${ZONE}`);
if (!zones.success || !zones.result.length) throw new Error(`לא נמצא zone ל-${ZONE}`);
const zid = zones.result[0].id;
console.log(`zone ${zid.slice(0, 8)}… · ${zones.result[0].status}\n`);

const existing = (await api(`/zones/${zid}/dns_records?type=AAAA&per_page=100`)).result || [];
const have = new Set(existing.filter(r => r.name === ZONE).map(r => r.content));

for (const ip of AAAA) {
  if (have.has(ip)) { console.log(`  קיים   ${ip}`); continue; }
  if (!COMMIT) { console.log(`  ייווסף ${ip}`); continue; }
  /* DNS only, matching the A records. Proxying the apex would put Cloudflare
     in front of a certificate GitHub issues, which is a different change than
     the one being made here. */
  const res = await api(`/zones/${zid}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({ type: 'AAAA', name: '@', content: ip, ttl: 1, proxied: false }),
  });
  console.log(`  ${res.success ? 'נוסף ' : 'נכשל '} ${ip}${res.success ? '' : ' — ' + JSON.stringify(res.errors).slice(0, 160)}`);
}

if (!COMMIT) { console.log('\nבדיקה בלבד. הרץ עם --commit.'); process.exit(0); }

/* Read back from Cloudflare, then from public DNS — the second is what Google
   resolves against, and the first can be right while the second is not yet. */
const after = (await api(`/zones/${zid}/dns_records?type=AAAA&per_page=100`)).result || [];
console.log(`\nב-Cloudflare: ${after.filter(r => r.name === ZONE).length} רשומות AAAA`);
const dns = await import('node:dns').then(m => m.promises);
try { console.log(`ב-DNS ציבורי: ${(await dns.resolve6(ZONE)).join(', ')}`); }
catch (e) { console.log(`ב-DNS ציבורי: עוד לא (${e.code})`); }
