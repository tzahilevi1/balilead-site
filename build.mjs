import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const SRC = 'index.html';
const OUT = 'dist/index.html';

// hotlink client logos from the original WordPress uploads
const HOTLINKS = {
  'assets/client-elia.png':     'https://balilead.co.il/wp-content/uploads/2022/06/elia-300x120.png',
  'assets/client-getfuel.png':  'https://balilead.co.il/wp-content/uploads/2022/06/getfuel-300x120.png',
  'assets/client-tevel.jpg':    'https://balilead.co.il/wp-content/uploads/2022/06/tevel-300x120.jpg',
  'assets/client-yehadim.png':  'https://balilead.co.il/wp-content/uploads/2022/06/yehadim.png',
  'assets/client-tsm.jpg':      'https://balilead.co.il/wp-content/uploads/2022/06/tsm.jpg',
  'assets/client-1907.png':     'https://balilead.co.il/wp-content/uploads/2022/06/1907201709533879.png',
  'assets/client-tempweb.jpg':  'https://balilead.co.il/wp-content/uploads/2022/06/tempweblogo.jpg',
  'assets/client-untitled.png': 'https://balilead.co.il/wp-content/uploads/2022/06/Untitled-300x300.png',
};

let html = readFileSync(SRC, 'utf8');

html = html.replaceAll('assets/logo.png',
  'https://balilead.co.il/wp-content/uploads/2021/10/cropped-%D7%9C%D7%95%D7%92%D7%95-%D7%A9%D7%A7%D7%95%D7%A3.png');

for (const [local, url] of Object.entries(HOTLINKS)) html = html.replaceAll(local, url);

mkdirSync('dist', { recursive: true });
writeFileSync(OUT, html);
console.log('built dist/index.html', (html.length / 1024).toFixed(1) + 'KB');
