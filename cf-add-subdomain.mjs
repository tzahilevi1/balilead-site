/**
 * Points a subdomain at a server, once there is a server to point it at.
 *
 * Adding the record is the small half. The half that decides whether HTTPS
 * works is the proxy flag: with Cloudflare's orange cloud on, Cloudflare
 * terminates TLS itself and Let's Encrypt's HTTP challenge never reaches the
 * origin, so Caddy cannot obtain a certificate and the site answers with a
 * warning. Grey cloud for setup; the proxy can be switched on afterwards with
 * SSL/TLS set to Full (strict).
 *
 *   node cf-add-subdomain.mjs seo 1.2.3.4
 *   node cf-add-subdomain.mjs seo 1.2.3.4 --apply
 */
import { readFileSync } from 'fs';

const [name, ip] = process.argv.slice(2);
const APPLY = process.argv.includes('--apply');

if (!name || !/^\d+\.\d+\.\d+\.\d+$/.test(ip || '')) {
  console.error('שימוש: node cf-add-subdomain.mjs <שם> <IPv4> [--apply]');
  process.exit(1);
}

const token = (readFileSync('.env', 'utf8').match(/CLOUDFLARE_API_TOKEN=(\S+)/) || [])[1];
if (!token) { console.error('אין CLOUDFLARE_API_TOKEN ב-.env'); process.exit(1); }

const api = async (path, opts = {}) => {
  const r = await fetch('https://api.cloudflare.com/client/v4' + path, {
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    ...opts,
  });
  return r.json();
};

const zones = await api('/zones?name=balilead.co.il');
if (!zones.success || !zones.result.length) {
  console.error('האזור לא נמצא:', JSON.stringify(zones.errors));
  process.exit(1);
}
const zone = zones.result[0];
const fqdn = `${name}.${zone.name}`;

/* Let's Encrypt has to be permitted by CAA or the certificate is refused no
   matter how the record is set. This zone already lists it — checked rather
   than assumed, because the failure surfaces as an unexplained TLS error hours
   into a migration. */
const caa = await api(`/zones/${zone.id}/dns_records?type=CAA`);
const issuers = (caa.result || []).map(r => r.data?.value).filter(Boolean);
const leOk = !issuers.length || issuers.some(v => /letsencrypt\.org/.test(v));
console.log(`CAA: ${issuers.length ? issuers.join(', ') : '(אין — כל רשות מורשית)'}`);
console.log(`  Let's Encrypt ${leOk ? '✓ מורשית' : '✗ חסומה — Caddy לא יקבל תעודה'}`);
if (!leOk) { console.error('\nעצירה: להוסיף CAA עבור letsencrypt.org לפני ההקמה.'); process.exit(1); }

const existing = await api(`/zones/${zone.id}/dns_records?name=${fqdn}`);
const found = (existing.result || [])[0];

console.log(`\n${fqdn}  →  ${ip}  · DNS only (ענן אפור)`);
if (found) console.log(`  קיימת כבר: ${found.type} ${found.content} · proxied=${found.proxied}`);

if (!APPLY) {
  console.log('\nהרצה יבשה. להחיל: הוסף --apply');
  process.exit(0);
}

const body = JSON.stringify({
  type: 'A', name, content: ip, ttl: 1, proxied: false,
  comment: 'SEO Engine — grey cloud so Caddy can issue its own certificate',
});

const res = found
  ? await api(`/zones/${zone.id}/dns_records/${found.id}`, { method: 'PUT', body })
  : await api(`/zones/${zone.id}/dns_records`, { method: 'POST', body });

if (!res.success) { console.error('נכשל:', JSON.stringify(res.errors)); process.exit(1); }
console.log(`✓ ${found ? 'עודכנה' : 'נוצרה'} · ${res.result.name} → ${res.result.content}`);
console.log('\nעכשיו על השרת:');
console.log(`  sudo bash setup.sh ${fqdn}`);
