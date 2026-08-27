/**
 * Builds the site icon.
 *
 * The old one was a photograph of the logo: a fine gold-glitter ring and a thin
 * serif B. At the size a favicon is actually shown — 16px in a search result —
 * texture becomes noise and thin strokes disappear, which is why it rendered as
 * a grey smudge. This draws the same mark as flat vector shapes instead:
 *
 *   - a dark tile, so the mark has contrast against Google's white background
 *   - the open gold ring with its tapering tail, thickened enough to survive
 *   - a heavy B, because a light serif at 16px is a blur
 *
 * Everything is geometry, so it stays sharp at every size.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const S = 512;                    // design canvas
const C = S / 2;

/* ── the ring ─────────────────────────────────────────────────────────────── */
/* Sized for the smallest use, not the largest. At 16px a 3px tail disappears
   and a delicate letter turns to mush, so the mark is drawn heavier than it
   would be if it only ever appeared large. */
const RO = 202;                   // outer radius
const HEAD = 60;                  // thickness where the stroke begins
const TIP = 9;                    // thickness where the tail ends

/* Screen coordinates put y downwards, so the sine is negated to keep angles
   reading the usual way: 90° is up, 180° is left. */
const pt = (angle, r) => {
  const t = (angle * Math.PI) / 180;
  return [C + r * Math.cos(t), C - r * Math.sin(t)];
};
const f = n => Math.round(n * 100) / 100;

/**
 * The ring as one filled outline rather than a stroke: a stroke has a single
 * width, and the whole character of this mark is that it thins into a tail.
 */
function ringPath({ from = 78, to = 342, steps = 96 } = {}) {
  /* Counter-clockwise from the head, past the left side and the bottom.
     Angles increase counter-clockwise here, so the sweep is measured forwards. */
  const sweep = (to - from + 360) % 360;
  const at = i => from + (i / steps) * sweep;

  const outer = [];
  const inner = [];
  for (let i = 0; i <= steps; i++) {
    const angle = at(i);
    const k = i / steps;
    /* Eased so the thickness holds through the body and falls away late,
       the way a brush stroke lifts off. */
    const thickness = HEAD + (TIP - HEAD) * (k * k * (3 - 2 * k));
    outer.push(pt(angle, RO));
    inner.push(pt(angle, RO - thickness));
  }

  const line = points => points.map(([x, y]) => `${f(x)},${f(y)}`).join(' L');
  return `M${line(outer)} L${line(inner.reverse())} Z`;
}

/* ── the letter ───────────────────────────────────────────────────────────── */
/* Drawn as outlines rather than text so it renders identically everywhere,
   with no font to load and nothing to substitute. */
const LETTER = `
  M190,150 L272,150
  C321,150 348,175 348,210
  C348,235 335,253 314,261
  C340,269 358,290 358,320
  C358,359 327,385 277,385
  L190,385 Z
  M236,191 L268,191 C292,191 305,199 305,214 C305,229 292,237 268,237 L236,237 Z
  M236,300 L274,300 C300,300 314,309 314,326 C314,343 300,352 274,352 L236,352 Z
`.replace(/\s+/g, ' ').trim();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="באלי ליד">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#17110b"/>
      <stop offset="1" stop-color="#080606"/>
    </linearGradient>
    <!-- The brand gold, read across the mark the way light crosses the logo. -->
    <linearGradient id="gold" x1="0.08" y1="0.1" x2="0.92" y2="0.9">
      <stop offset="0" stop-color="#a96d2b"/>
      <stop offset="0.38" stop-color="#d9a45b"/>
      <stop offset="0.54" stop-color="#f6d9a0"/>
      <stop offset="0.72" stop-color="#d9a45b"/>
      <stop offset="1" stop-color="#a96d2b"/>
    </linearGradient>
    <linearGradient id="cream" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#efe4d2"/>
    </linearGradient>
  </defs>

  <rect width="${S}" height="${S}" rx="112" fill="url(#tile)"/>
  <!-- A hairline lip, so the tile still has an edge on a white background. -->
  <rect x="3" y="3" width="${S - 6}" height="${S - 6}" rx="109"
        fill="none" stroke="#3a2a17" stroke-width="6"/>

  <path d="${ringPath()}" fill="url(#gold)"/>
  <path d="${LETTER}" fill="url(#cream)" fill-rule="evenodd"/>
</svg>
`;

mkdirSync('assets', { recursive: true });
writeFileSync('assets/favicon.svg', svg, 'utf8');
console.log('assets/favicon.svg written');
