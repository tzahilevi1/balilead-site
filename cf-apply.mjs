import { readFileSync } from 'fs';

const token = (readFileSync('.env', 'utf8').match(/CLOUDFLARE_API_TOKEN=(\S+)/) || [])[1];
const H = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
const api = async (path, opts = {}) => (await fetch('https://api.cloudflare.com/client/v4' + path, { headers: H, ...opts })).json();

const zones = await api('/zones?name=balilead.co.il');
const zid = zones.result[0].id;

// 1. remove the stale partial-setup CNAMEs (@ and www -> 3bydb2...)
const existing = (await api(`/zones/${zid}/dns_records?per_page=200`)).result;
for (const r of existing) {
  const del = await api(`/zones/${zid}/dns_records/${r.id}`, { method: 'DELETE' });
  console.log('DELETE', r.type, r.name, del.success ? 'ok' : JSON.stringify(del.errors));
}

// 2. the full record set
const records = [
  // web -> GitHub Pages (DNS only for cert issuance; proxy later if wanted)
  { type: 'A', name: '@', content: '185.199.108.153', proxied: false },
  { type: 'A', name: '@', content: '185.199.109.153', proxied: false },
  { type: 'A', name: '@', content: '185.199.110.153', proxied: false },
  { type: 'A', name: '@', content: '185.199.111.153', proxied: false },
  { type: 'CNAME', name: 'www', content: 'tzahilevi1.github.io', proxied: false },
  // mail (Hostinger email) - exact copy of live zone
  { type: 'MX', name: '@', content: 'mx1.hostinger.co.il', priority: 5 },
  { type: 'MX', name: '@', content: 'mx2.hostinger.co.il', priority: 10 },
  { type: 'TXT', name: '@', content: '"v=spf1 include:_spf.mail.hostinger.com ~all"' },
  { type: 'TXT', name: '_dmarc', content: '"v=DMARC1; p=none"' },
  { type: 'CNAME', name: 'hostingermail-a._domainkey', content: 'hostingermail-a.dkim.mail.hostinger.com', proxied: false },
  { type: 'CNAME', name: 'hostingermail-b._domainkey', content: 'hostingermail-b.dkim.mail.hostinger.com', proxied: false },
  { type: 'CNAME', name: 'hostingermail-c._domainkey', content: 'hostingermail-c.dkim.mail.hostinger.com', proxied: false },
  { type: 'CNAME', name: 'autodiscover', content: 'autodiscover.mail.hostinger.com', proxied: false },
  { type: 'CNAME', name: 'autoconfig', content: 'autoconfig.mail.hostinger.com', proxied: false },
  // misc
  { type: 'A', name: 'ftp', content: '45.84.207.247', proxied: false },
];

for (const rec of records) {
  const res = await api(`/zones/${zid}/dns_records`, { method: 'POST', body: JSON.stringify({ ttl: 1, ...rec }) });
  console.log('CREATE', rec.type.padEnd(5), rec.name.padEnd(28), res.success ? 'ok' : JSON.stringify(res.errors).slice(0, 120));
}

// 3. final state
const after = (await api(`/zones/${zid}/dns_records?per_page=200`)).result;
console.log('\nFINAL RECORDS (' + after.length + '):');
for (const r of after) {
  console.log(r.type.padEnd(6), r.name.replace('.balilead.co.il', '').replace('balilead.co.il', '@').padEnd(30),
    String(r.content).slice(0, 70), r.type === 'MX' ? 'prio=' + r.priority : '', r.proxied ? '[PROXIED]' : '');
}
