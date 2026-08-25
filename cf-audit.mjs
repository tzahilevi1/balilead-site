import { readFileSync } from 'fs';

const token = (readFileSync('.env', 'utf8').match(/CLOUDFLARE_API_TOKEN=(\S+)/) || [])[1];
if (!token) { console.log('NO TOKEN IN .env'); process.exit(1); }
const H = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
const api = async (path, opts = {}) => {
  const r = await fetch('https://api.cloudflare.com/client/v4' + path, { headers: H, ...opts });
  return r.json();
};

const ver = await api('/user/tokens/verify');
console.log('TOKEN:', ver.success ? 'valid, status=' + ver.result.status : JSON.stringify(ver.errors));
if (!ver.success) process.exit(1);

const zones = await api('/zones?name=balilead.co.il');
if (!zones.success || !zones.result.length) { console.log('ZONE LOOKUP:', JSON.stringify(zones.errors || 'not found')); process.exit(1); }
const z = zones.result[0];
console.log('ZONE:', z.name, '| id:', z.id.slice(0, 8) + '…', '| status:', z.status);
console.log('ASSIGNED NS:', (z.name_servers || []).join('  |  '));
console.log('ORIGINAL NS:', (z.original_name_servers || []).join('  |  '));

const recs = await api(`/zones/${z.id}/dns_records?per_page=200`);
console.log('\nRECORDS (' + recs.result.length + '):');
for (const r of recs.result) {
  console.log(
    r.type.padEnd(6),
    r.name.replace('.balilead.co.il', '').replace('balilead.co.il', '@').padEnd(34),
    (r.proxied ? '[PROXIED] ' : '') + String(r.content).slice(0, 80),
    r.type === 'MX' ? 'prio=' + r.priority : ''
  );
}
