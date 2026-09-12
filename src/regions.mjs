/**
 * Where a page's own words begin and end.
 *
 * Two places need this answer and they must agree: `injectSlots` in gen.mjs,
 * which decides where a planned section lands, and `enrich` , which decides
 * where a call to action or an image lands. When the same rule lived in two
 * functions the answers drifted — a generated section landed after the "אולי
 * יעניין אתכם גם" strip because one copy measured against every <section> on
 * the page and the other did not. One definition, imported twice.
 */

/**
 * Where the article ends and the page's closing furniture begins.
 *
 * A page finishes with blocks that are not part of what it says: the magazine
 * strip, "אולי יעניין אתכם גם", the questions, the contact form. They belong
 * last, always, and nothing may be inserted past this line.
 */
export function furnitureStart(html) {
  const marks = [
    html.indexOf('class="art-grid"'),
    html.indexOf('class="faq reveal"'),
    html.indexOf('<section class="sec contact"'),
  ].filter(i => i !== -1);
  if (!marks.length) return html.length;
  /* Back up to the section that opens the furniture, so nothing is spliced
     into the middle of a grid. */
  const first = Math.min(...marks);
  const open = html.lastIndexOf('<section', first);
  return open === -1 ? first : open;
}

/**
 * The article's own column, when the page has one.
 *
 * An article page is a two-column grid: the prose on the left, the sticky menu
 * on the right. Anything placed outside that column loses the menu beside it.
 *
 * Returns the span inside .art-body, or null on a page built differently —
 * commercial pages have no such column and keep the section-level anchors.
 */
export function articleColumn(html) {
  const openTag = /<div class="prose art-body[^"]*"[^>]*>/.exec(html);
  if (!openTag) return null;
  const from = openTag.index + openTag[0].length;
  /* Matching close, by depth: .art-body holds nested divs, so the first
     </div> after it is almost never the right one. */
  let depth = 1;
  const tag = /<\/?div\b[^>]*>/g;
  tag.lastIndex = from;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return { from, to: m.index };
  }
  return null;
}

/** Where the page's first hero ends, or 0 on a page without one. */
export function heroEnd(html) {
  const hero = html.indexOf('<section class="p-hero');
  if (hero === -1) return 0;
  const close = html.indexOf('</section>', hero);
  return close === -1 ? 0 : close + '</section>'.length;
}
