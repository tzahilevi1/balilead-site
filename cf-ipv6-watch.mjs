/**
 * Waits until the IPv6 fix is visible through ordinary DNS, not just at the
 * authoritative nameserver.
 *
 * The records went in and resolve correctly at Cloudflare and at the public
 * resolvers, but every resolver that asked before the change cached the
 * absence of an answer, and this zone's SOA sets that negative cache to 1800
 * seconds. Clicking "I have fixed the issues" while a checker still holds the
 * old negative answer spends a review cycle on a fix that is already in place.
 *
 * curl is spawned without a shell, so its arguments are not translated:
 * '/dev/null' is a Unix path that Windows curl tries to create a file at, and
 * the failure surfaces as a connection that never happened. os.devNull is the
 * per-platform name and is what makes the check measure the network.
 *
 * So the all-clear is the plain path: the system resolver, then a real HTTPS
 * request over IPv6 with no --resolve override.
 */
import { promises as dns } from 'node:dns';
import { execFileSync } from 'node:child_process';
import { devNull } from 'node:os';

const HOST = 'balilead.co.il';
const deadline = Date.now() + 45 * 60_000;

while (Date.now() < deadline) {
  const stamp = new Date().toLocaleTimeString('he-IL');
  let addrs = null;
  try { addrs = await dns.resolve6(HOST); } catch { /* still negative-cached */ }
  if (addrs) {
    let code = '000';
    try {
      code = execFileSync('curl', ['-6', '-s', '-o', devNull, '--max-time', '25',
        '-w', '%{http_code}', `https://${HOST}/`], { encoding: 'utf8' }).trim();
    } catch { /* curl exits non-zero on a failed connection */ }
    if (code === '200') {
      console.log(`${stamp} · נקי. ${HOST} עונה 200 ב-IPv6 דרך DNS רגיל (${addrs.length} כתובות).`);
      process.exit(0);
    }
    console.log(`${stamp} · DNS כבר מחזיר AAAA, אבל HTTP החזיר ${code}`);
  } else {
    console.log(`${stamp} · המטמון השלילי עוד לא פג`);
  }
  await new Promise(r => setTimeout(r, 120_000));
}
console.log('45 דקות עברו והמטמון עדיין לא התעדכן — שווה בדיקה ידנית.');
process.exit(1);
