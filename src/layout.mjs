// Shared layout: CSS, header, footer, CTA form, page shell, JS.
// All URLs are root-relative via the `root` prefix ('' | '../' | '../../').
import { widgetsCss, widgetsHtml, widgetsJs } from './widgets.mjs';

export const SITE = {
  phone: '058-4700706',
  phoneHref: 'tel:0584700706',
  wa: 'https://wa.me/972584700706',
  waText: 'https://wa.me/972584700706?text=' + encodeURIComponent('היי, אני מעוניין בלידים לעסק שלי'),
  email: 'info@balilead.co.il',
  address: 'אצ"ל 34, רמת גן',
  fb: 'https://www.facebook.com/BaliLead',
};

export const NAV_LEADS = [
  ['קניית-לידים/', 'קניית לידים, כל התחומים'],
  ['חברת-לידים/', 'חברת לידים, מודל CPL'],
  ['קניית-לידים/לידים-לביטוח/', 'לידים לביטוח'],
  ['קניית-לידים/לידים-להחזרי-מס/', 'לידים להחזרי מס'],
  ['קניית-לידים/לידים-להלוואות/', 'לידים להלוואות'],
  ['קניית-לידים/לידים-למשכנתאות/', 'לידים למשכנתאות'],
  ['לידים-לרואי-חשבון/', 'לידים לרואי חשבון'],
  ['קניית-לידים/לידים-לבניית-אתרים/', 'לידים לבניית אתרים'],
  ['פתיחת-עוסק-מורשה/', 'פתיחת עוסק מורשה'],
  ['מכירת-תיק-לרואי-חשבון/', 'העברת תיקים לרו"ח'],
  ['מחשבון-roi-ללידים/', 'מחשבון ROI ללידים'],
];

export const NAV_DIGITAL = [
  ['שיווק-דיגיטלי/', 'שיווק דיגיטלי, מעטפת מלאה'],
  ['קידום-בגוגל/', 'קידום ממומן בגוגל'],
  ['קידום-אתרים-seo/', 'קידום אתרים SEO'],
  ['קידום-בפייסבוק/', 'קידום בפייסבוק'],
  ['פרסום-באינסטגרם/', 'פרסום באינסטגרם'],
  ['קידום-בלינקדאין/', 'קידום בלינקדאין'],
  ['פרסום-בטאבולה-ואאוטבריין/', 'טאבולה ואאוטבריין'],
  ['בניית-אתרים/', 'בניית אתרים'],
  ['דפי-נחיתה/', 'דפי נחיתה ממירים'],
  ['פיתוח-אפליקציות/', 'פיתוח אפליקציות'],
  ['מערכת-ניהול-לידים/', 'מערכות CRM וניהול לידים'],
  ['סוכני-ai/', 'סוכני AI חכמים'],
  ['אוטומציות-שיווק/', 'אוטומציות שיווק'],
];

export const css = `
@property --ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
:root{
  --bg:#080606; --bg2:#0d0a07; --ink:#f4eee3; --muted:#a89d8d; --dim:#6f675b;
  --gold:#d9a45b; --gold2:#f0c27a; --gold-deep:#a96d2b;
  --line:rgba(244,238,227,.09); --line-strong:rgba(244,238,227,.16);
  --glass:rgba(20,16,11,.55);
  --ease:cubic-bezier(.16,1,.3,1);
  --r-card:1.6rem; --r-inner:calc(1.6rem - .45rem);
  --grad-gold:linear-gradient(115deg,#a96d2b 0%,#d9a45b 38%,#f6d9a0 52%,#d9a45b 66%,#a96d2b 100%);
  color-scheme:dark;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:110px}
body{
  background:var(--bg); color:var(--ink);
  font-family:'Assistant',system-ui,sans-serif; font-weight:400;
  font-size:17px; line-height:1.7; overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
::selection{background:var(--gold);color:#140f08}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Secular One',sans-serif;font-weight:400;line-height:1.15;letter-spacing:-.01em}
.container{max-width:1220px;margin-inline:auto;padding-inline:clamp(20px,4vw,48px)}
section{position:relative}

/* ===== Page transitions (progressive) ===== */
@view-transition{navigation:auto}
@media (prefers-reduced-motion:no-preference){
  ::view-transition-old(root){animation:vt-out .22s var(--ease) both}
  ::view-transition-new(root){animation:vt-in .3s var(--ease) both}
}
@keyframes vt-out{to{opacity:0;transform:translateY(-6px)}}
@keyframes vt-in{from{opacity:0;transform:translateY(8px)}}

/* ===== Hero line reveal (home) ===== */
.hl-line{display:block;overflow:hidden}
.hl-line > span{display:block;transform:translateY(110%);animation:hl-up 1s var(--ease) forwards}
.hl-line:nth-child(2) > span{animation-delay:.14s}
@keyframes hl-up{to{transform:translateY(0)}}
@media (prefers-reduced-motion:reduce){.hl-line > span{transform:none;animation:none}}

/* ===== Spotlight hover on cards ===== */
.v-card,.art-card,.check-card,.why-card,.t-card{position:relative}
.spot::after{content:"";position:absolute;inset:0;border-radius:var(--r-card);pointer-events:none;
  opacity:0;transition:opacity .5s var(--ease);
  background:radial-gradient(220px circle at var(--mx,50%) var(--my,50%),rgba(217,164,91,.16),transparent 70%)}
.spot:hover::after{opacity:1}

/* Film grain */
.grain{position:fixed;inset:0;z-index:80;pointer-events:none;opacity:.05;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:240px 240px}

/* Reveal */
.reveal{opacity:0;transform:translateY(34px);filter:blur(8px);
  transition:opacity .9s var(--ease),transform .9s var(--ease),filter .9s var(--ease);
  transition-delay:var(--d,0s)}
.reveal.in{opacity:1;transform:translateY(0);filter:blur(0)}

/* ===== Header ===== */
.header{position:fixed;top:0;inset-inline:0;z-index:60;display:flex;justify-content:center;
  padding:18px clamp(14px,3vw,32px) 0;transition:padding .6s var(--ease)}
.header-pill{display:flex;align-items:center;gap:clamp(12px,2vw,28px);
  width:100%;max-width:1220px;padding:12px 14px 12px 20px;border-radius:999px;
  background:var(--glass);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);
  border:1px solid var(--line);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 22px 60px -28px rgba(0,0,0,.85);
  transition:background .6s var(--ease),box-shadow .6s var(--ease)}
.header.scrolled{padding-top:10px}
.header.scrolled .header-pill{background:rgba(14,11,7,.82);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 16px 44px -20px rgba(0,0,0,.9)}
.brand{display:flex;align-items:center;gap:10px;flex:0 0 auto}
.brand img{height:34px;width:auto}
.nav{display:flex;align-items:center;gap:clamp(6px,1.2vw,16px);margin-inline-start:auto}
.nav-item{position:relative}
.nav-item > a{display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:15px;color:var(--muted);
  padding:8px 10px;border-radius:999px;transition:color .45s var(--ease),background .45s var(--ease);white-space:nowrap}
.nav-item > a:hover,.nav-item:focus-within > a{color:var(--ink);background:rgba(244,238,227,.06)}
.nav-item > a.active{color:var(--gold2)}
.nav-item > a .car{width:11px;height:11px;transition:transform .45s var(--ease)}
.nav-item:hover > a .car,.nav-item:focus-within > a .car{transform:rotate(180deg)}
.menu{position:absolute;top:100%;inset-inline-start:-14px;padding-top:14px;min-width:250px;
  opacity:0;visibility:hidden;transform:translateY(10px);
  transition:opacity .45s var(--ease),transform .45s var(--ease),visibility .45s;z-index:70}
.nav-item:hover .menu,.nav-item:focus-within .menu{opacity:1;visibility:visible;transform:translateY(0)}
.menu-in{border-radius:20px;padding:10px;background:rgba(16,12,8,.94);
  backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);
  border:1px solid var(--line-strong);display:grid;grid-template-columns:1fr 1fr;gap:0 6px;min-width:470px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 34px 80px -24px rgba(0,0,0,.95)}
.menu-in a{display:block;padding:10px 14px;border-radius:12px;font-size:15px;font-weight:600;color:var(--muted);
  transition:color .35s var(--ease),background .35s var(--ease)}
.menu-in a:hover{color:var(--gold2);background:rgba(217,164,91,.08)}
.menu-in a:first-child{grid-column:1/-1;color:var(--ink);border-bottom:1px solid var(--line);border-radius:12px 12px 0 0;margin-bottom:4px}
.header-cta{margin-inline-start:auto;flex:0 0 auto}
.nav + .header-cta{margin-inline-start:0}

/* Buttons */
.btn{position:relative;display:inline-flex;align-items:center;gap:12px;border-radius:999px;
  padding:13px 26px;font-family:'Assistant';font-weight:700;font-size:16px;cursor:pointer;border:none;
  transition:transform .5s var(--ease),box-shadow .5s var(--ease);overflow:hidden;white-space:nowrap}
.btn:active{transform:scale(.98)}
.btn .btn-ic{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;
  border-radius:999px;flex:0 0 auto;transition:transform .5s var(--ease)}
.btn:hover .btn-ic{transform:translate(-3px,-1px) scale(1.06)}
.btn svg{width:15px;height:15px}
.btn-gold{background:var(--grad-gold);color:#1c1206;
  box-shadow:0 14px 38px -14px rgba(217,164,91,.55),inset 0 1px 0 rgba(255,255,255,.45)}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 22px 48px -14px rgba(217,164,91,.6),inset 0 1px 0 rgba(255,255,255,.45)}
.btn-gold .btn-ic{background:rgba(20,12,4,.16)}
.btn-gold::before{content:"";position:absolute;top:0;bottom:0;width:55%;inset-inline-start:-70%;
  background:linear-gradient(100deg,transparent 20%,rgba(255,255,255,.5) 50%,transparent 80%);
  transform:skewX(-18deg);transition:inset-inline-start 1s var(--ease)}
.btn-gold:hover::before{inset-inline-start:130%}
.btn-ghost{background:rgba(244,238,227,.05);color:var(--ink);border:1px solid var(--line-strong);
  backdrop-filter:blur(8px)}
.btn-ghost:hover{transform:translateY(-2px);background:rgba(244,238,227,.09)}
.btn-ghost .btn-ic{background:rgba(244,238,227,.08)}

/* Burger + mobile nav */
.burger{display:none;position:relative;width:44px;height:44px;border-radius:999px;border:1px solid var(--line-strong);
  background:rgba(244,238,227,.05);cursor:pointer;flex:0 0 auto;margin-inline-start:auto}
.burger span{position:absolute;inset-inline-start:12px;width:20px;height:2px;background:var(--ink);border-radius:2px;
  transition:transform .55s var(--ease),opacity .4s var(--ease)}
.burger span:nth-child(1){top:17px}
.burger span:nth-child(2){top:25px}
.burger.open span:nth-child(1){transform:translateY(4px) rotate(45deg)}
.burger.open span:nth-child(2){transform:translateY(-4px) rotate(-45deg)}
.mnav{position:fixed;inset:0;z-index:55;background:rgba(8,6,4,.9);
  backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);
  display:flex;flex-direction:column;padding:110px clamp(28px,8vw,60px) 40px;overflow-y:auto;
  opacity:0;visibility:hidden;transition:opacity .6s var(--ease),visibility .6s}
.mnav.open{opacity:1;visibility:visible}
.mnav .m-main{font-family:'Secular One';font-size:clamp(24px,6vw,34px);color:var(--ink);padding:10px 0;display:block}
.mnav .m-main:hover{color:var(--gold2)}
.mnav .m-group{font-size:12.5px;font-weight:800;letter-spacing:.16em;color:var(--gold);margin:18px 0 4px}
.mnav .m-sub{display:block;font-size:17px;font-weight:600;color:var(--muted);padding:7px 0}
.mnav .m-sub:hover{color:var(--ink)}
.mnav > *{opacity:0;transform:translateY(22px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
.mnav.open > *{opacity:1;transform:translateY(0)}
.mnav.open > *:nth-child(1){transition-delay:.06s}.mnav.open > *:nth-child(2){transition-delay:.1s}
.mnav.open > *:nth-child(3){transition-delay:.14s}.mnav.open > *:nth-child(4){transition-delay:.18s}
.mnav.open > *:nth-child(5){transition-delay:.22s}.mnav.open > *:nth-child(6){transition-delay:.26s}
.mnav.open > *:nth-child(7){transition-delay:.3s}.mnav.open > *:nth-child(8){transition-delay:.34s}
.mnav.open > *:nth-child(n+9){transition-delay:.38s}
.mnav .mnav-contact{margin-top:26px;font-size:16px;color:var(--muted)}

/* ===== Home hero + video ===== */
.hero{min-height:100dvh;display:flex;align-items:center;padding:clamp(120px,15vh,170px) 0 70px;overflow:hidden}
.hero-media{position:absolute;inset:0;pointer-events:none}
.hero-media video{width:100%;height:100%;object-fit:cover;transform:scale(1.04)}
@keyframes kenburns{from{transform:scale(1.04)}to{transform:scale(1.13)}}
.hero-media video{animation:kenburns 38s ease-in-out infinite alternate}
.hero-scrim{position:absolute;inset:0;
  background:linear-gradient(105deg,rgba(8,6,6,.42) 0%,rgba(8,6,6,.72) 55%,rgba(8,6,6,.9) 100%),
  linear-gradient(180deg,rgba(8,6,6,.55) 0%,rgba(8,6,6,.25) 45%,var(--bg) 97%)}
.hero-halo{position:absolute;top:-28%;inset-inline-end:-16%;width:62vw;height:62vw;max-width:920px;max-height:920px;
  border-radius:50%;pointer-events:none;filter:blur(70px);opacity:.4;
  background:conic-gradient(from var(--ang),transparent 0deg,rgba(217,164,91,.5) 70deg,rgba(169,109,43,.16) 140deg,transparent 210deg,rgba(240,194,122,.35) 300deg,transparent 360deg);
  animation:spin 26s linear infinite}
@keyframes spin{to{--ang:360deg}}
.hero-ghost{position:absolute;bottom:-4%;inset-inline-start:-2%;font-family:'Secular One';
  font-size:clamp(150px,26vw,380px);line-height:1;color:transparent;
  -webkit-text-stroke:1px rgba(217,164,91,.14);pointer-events:none;user-select:none;white-space:nowrap}
.hero-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);gap:clamp(36px,5vw,80px);align-items:center}
.hero-eyebrow{display:inline-flex;align-items:center;gap:9px;border-radius:999px;padding:7px 16px;
  font-size:12.5px;font-weight:700;letter-spacing:.14em;color:var(--gold2);
  border:1px solid rgba(217,164,91,.3);background:rgba(20,14,8,.5);backdrop-filter:blur(6px)}
.hero h1{font-size:clamp(36px,4.3vw,58px);margin:22px 0 20px;text-shadow:0 4px 30px rgba(0,0,0,.55)}
.hero h1 .hot{background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 26px rgba(217,164,91,.45))}
.hero-sub{font-size:clamp(17px,1.5vw,20px);font-weight:400;color:#cec4b4;max-width:52ch;margin-bottom:34px;
  text-shadow:0 2px 18px rgba(0,0,0,.6)}
.hero-sub b{color:var(--ink);font-weight:600}
.hero-ctas{display:flex;align-items:center;gap:16px;flex-wrap:wrap}

/* Lead cards cascade */
.cascade{position:relative;display:flex;flex-direction:column;gap:18px;padding:10px 6px}
.lead-card{position:relative;border-radius:var(--r-card);padding:.45rem;
  background:rgba(20,15,9,.5);border:1px solid var(--line);backdrop-filter:blur(10px);
  box-shadow:0 30px 70px -30px rgba(0,0,0,.8);
  transition:transform .7s var(--ease),border-color .5s var(--ease)}
.lead-card:hover{transform:translateY(-6px) rotate(0deg) !important;border-color:rgba(217,164,91,.35)}
.lead-card-in{border-radius:var(--r-inner);padding:20px 22px;background:linear-gradient(160deg,rgba(26,18,10,.92) 0%,rgba(13,10,7,.95) 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.09);display:flex;align-items:center;gap:18px}
.lead-card:nth-child(1){transform:rotate(-1.4deg)}
.lead-card:nth-child(2){transform:rotate(1deg) translateX(-14px);z-index:2}
.lead-card:nth-child(3){transform:rotate(-.6deg) translateX(10px)}
.lc-ic{width:52px;height:52px;border-radius:16px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;
  background:rgba(217,164,91,.1);border:1px solid rgba(217,164,91,.25);color:var(--gold2)}
.lc-ic svg{width:24px;height:24px}
.lc-body{flex:1;min-width:0}
.lc-title{font-weight:800;font-size:17px}
.lc-meta{font-size:14px;color:var(--muted)}
.lc-price{font-family:'Secular One';font-size:19px;color:var(--gold2);white-space:nowrap}
.lc-tag{position:absolute;top:-10px;inset-inline-end:20px;border-radius:999px;padding:3px 12px;
  font-size:11.5px;font-weight:800;letter-spacing:.08em;background:var(--grad-gold);color:#1c1206;
  box-shadow:0 8px 20px -8px rgba(217,164,91,.7)}

/* ===== Inner page hero ===== */
.p-hero{padding:clamp(150px,19vh,200px) 0 clamp(40px,6vw,70px);overflow:hidden}
.p-hero .hero-halo{opacity:.32}
.p-hero.has-media{padding:clamp(160px,22vh,230px) 0 clamp(70px,9vw,110px)}
.p-hero-media{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.p-hero-media img{width:100%;height:100%;object-fit:cover;object-position:center;
  transform:scale(1.04);animation:kenburns 34s ease-in-out infinite alternate}
.p-hero-scrim{position:absolute;inset:0;
  background:linear-gradient(105deg,rgba(8,6,6,.38) 0%,rgba(8,6,6,.68) 52%,rgba(8,6,6,.88) 100%),
  linear-gradient(180deg,rgba(8,6,6,.62) 0%,rgba(8,6,6,.28) 45%,var(--bg) 97%)}
.p-hero.has-media h1{text-shadow:0 4px 30px rgba(0,0,0,.6)}
.p-hero.has-media .p-sub{color:#d3c9b9;text-shadow:0 2px 18px rgba(0,0,0,.65)}
.p-hero.has-media .price-chip{background:rgba(20,14,8,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.p-hero.has-media .crumbs a,.p-hero.has-media .crumbs span{text-shadow:0 1px 10px rgba(0,0,0,.7)}
@media (prefers-reduced-motion:reduce){.p-hero-media img{animation:none}}
.crumbs{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--dim);margin-bottom:18px;flex-wrap:wrap}
.crumbs a{color:var(--muted);transition:color .4s var(--ease)}
.crumbs a:hover{color:var(--gold2)}
.crumbs svg{width:12px;height:12px;transform:scaleX(-1)}
.p-hero h1{font-size:clamp(34px,4.4vw,56px);margin-bottom:16px;max-width:20ch}
.p-hero h1 .gw{background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.p-hero .p-sub{font-size:clamp(17px,1.5vw,20px);color:var(--muted);max-width:62ch;margin-bottom:30px}
.p-hero .p-sub b{color:var(--ink)}
.price-chip{display:inline-flex;align-items:center;gap:14px;border-radius:999px;padding:10px 12px 10px 22px;
  border:1px solid rgba(217,164,91,.3);background:rgba(217,164,91,.07);font-weight:700;font-size:15.5px;flex-wrap:wrap}
.price-chip .pc-num{font-family:'Secular One';color:var(--gold2);font-size:18px}
.price-chip a{border-radius:999px;padding:6px 16px;background:rgba(217,164,91,.14);color:var(--gold2);
  font-size:14px;transition:background .4s var(--ease)}
.price-chip a:hover{background:rgba(217,164,91,.24)}

/* ===== Sections ===== */
.sec{padding:clamp(70px,9vw,120px) 0}
.sec-tight{padding:clamp(40px,6vw,70px) 0}
.sec-head{max-width:680px;margin-bottom:clamp(32px,4vw,54px)}
.sec-head.center{margin-inline:auto;text-align:center}
.sec-head h2{font-size:clamp(28px,3.4vw,44px);margin-bottom:14px}
.sec-head h2 .gw{background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.sec-head p{color:var(--muted);font-size:17.5px}

/* Prose */
.prose{max-width:780px}
.prose h2{font-size:clamp(24px,2.6vw,34px);margin:44px 0 16px}
.prose h2:first-child{margin-top:0}
.prose h2 .gw{background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.prose p{color:var(--muted);margin-bottom:16px;font-size:17px}
.prose p b,.prose li b{color:var(--ink);font-weight:700}
.prose ul{list-style:none;margin:6px 0 20px}
.prose li{position:relative;padding-inline-start:32px;margin-bottom:10px;color:var(--muted)}
.prose li::before{content:"";position:absolute;inset-inline-start:0;top:7px;width:17px;height:17px;border-radius:999px;
  background:rgba(217,164,91,.14) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f0c27a' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E") center/9px no-repeat;
  border:1px solid rgba(217,164,91,.3)}

/* Check grid */
.check-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.check-card{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.04);border:1px solid var(--line);
  transition:transform .6s var(--ease),border-color .5s var(--ease)}
.check-card:hover{transform:translateY(-4px);border-color:rgba(217,164,91,.35)}
.check-in{border-radius:var(--r-inner);padding:24px;height:100%;
  background:linear-gradient(160deg,#130e08 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.07)}
.check-in .c-ic{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;
  background:rgba(217,164,91,.1);border:1px solid rgba(217,164,91,.22);color:var(--gold2);margin-bottom:16px}
.check-in .c-ic svg{width:21px;height:21px}
.check-in h3{font-size:19px;margin-bottom:8px}
.check-in p{color:var(--muted);font-size:15.5px}

/* Process */
.process{counter-reset:step}
.process-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--line)}
.process-grid.p3{grid-template-columns:repeat(3,1fr)}
.step{counter-increment:step;padding:34px clamp(16px,2vw,30px) 10px;position:relative}
.step + .step{border-inline-start:1px solid var(--line)}
.step::before{content:counter(step,decimal-leading-zero);font-family:'Secular One';
  font-size:15px;color:var(--gold);letter-spacing:.1em}
.step h3{font-size:21px;margin:12px 0 10px}
.step p{color:var(--muted);font-size:15.5px}

/* Bento verticals */
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:18px}
.v-card{position:relative;border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.04);
  border:1px solid var(--line);transition:transform .6s var(--ease),border-color .5s var(--ease);overflow:hidden;display:block}
.v-card:hover{transform:translateY(-5px);border-color:rgba(217,164,91,.4)}
.v-in{border-radius:var(--r-inner);height:100%;padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:26px;
  background:linear-gradient(160deg,#130e08 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.07)}
.v-card.feature .v-in{background:
  radial-gradient(120% 120% at 85% -10%,rgba(217,164,91,.28) 0%,transparent 55%),
  linear-gradient(160deg,#1a1207 0%,#0b0906 100%)}
.v-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.v-ic{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;
  background:rgba(217,164,91,.1);border:1px solid rgba(217,164,91,.22);color:var(--gold2)}
.v-ic svg{width:22px;height:22px}
.v-range{font-family:'Secular One';font-size:17px;color:var(--gold2)}
.v-card h3{font-size:20px;margin-bottom:6px}
.v-card .v-desc{color:var(--muted);font-size:15px}
.col-5{grid-column:span 5}.col-4{grid-column:span 4}.col-3{grid-column:span 3}
.col-6{grid-column:span 6}.col-7{grid-column:span 7}

/* FAQ */
.faq{max-width:820px;display:flex;flex-direction:column;gap:14px}
.faq details{border-radius:20px;border:1px solid var(--line);background:rgba(244,238,227,.03);overflow:hidden;
  transition:border-color .4s var(--ease)}
.faq details[open]{border-color:rgba(217,164,91,.3)}
.faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:18px 22px;font-weight:700;font-size:16.5px}
.faq summary::-webkit-details-marker{display:none}
.faq summary .pl{width:30px;height:30px;border-radius:999px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;
  background:rgba(217,164,91,.1);border:1px solid rgba(217,164,91,.25);color:var(--gold2);
  transition:transform .5s var(--ease)}
.faq details[open] summary .pl{transform:rotate(45deg)}
.faq .fa{padding:0 22px 20px;color:var(--muted);font-size:15.5px;max-width:70ch}

/* Testimonials */
.t-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.t-card{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.045);border:1px solid var(--line)}
.t-in{border-radius:var(--r-inner);padding:26px;height:100%;
  background:linear-gradient(165deg,#151008 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.08)}
.t-in p{font-size:17px;font-weight:600;line-height:1.6;margin-bottom:16px}
.t-in .t-who{font-size:14.5px;color:var(--muted)}
.t-in .t-who b{color:var(--gold2)}

/* Magazine */
.art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.art-card{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.04);border:1px solid var(--line);
  transition:transform .6s var(--ease),border-color .5s var(--ease);display:block}
.art-card:hover{transform:translateY(-5px);border-color:rgba(217,164,91,.4)}
.art-in{border-radius:var(--r-inner);padding:24px;height:100%;display:flex;flex-direction:column;gap:14px;
  background:linear-gradient(160deg,#130e08 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.07)}
.art-in .a-tag{font-size:12px;font-weight:800;letter-spacing:.12em;color:var(--gold)}
.art-in h3{font-size:18.5px;line-height:1.4;flex:1}
.a-read{display:inline-flex;align-items:center;gap:8px;font-size:14.5px;font-weight:700;color:var(--gold2)}
.a-read svg{width:14px;height:14px;flex:0 0 auto;transform:scaleX(-1);transition:transform .4s var(--ease)}
.art-card:hover .a-read svg,.art-featured:hover .a-read svg{transform:scaleX(-1) translateX(3px)}

/* Pricing groups */
.price-groups{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.pg{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.04);border:1px solid var(--line)}
.pg-in{border-radius:var(--r-inner);padding:26px 24px;height:100%;
  background:linear-gradient(160deg,#130e08 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.07)}
.pg h4{font-family:'Secular One';font-size:17px;color:var(--gold2);margin-bottom:16px;padding-bottom:12px;
  border-bottom:1px solid rgba(217,164,91,.22)}
.pg-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:8px 0;font-size:15px}
.pg-row .n{color:var(--muted)}
.pg-row .p{font-weight:700;color:var(--ink);white-space:nowrap;font-variant-numeric:tabular-nums}
.price-note{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:15px;margin-top:26px}

/* Digital pills */
.dig-row{display:flex;flex-wrap:wrap;gap:14px}
.dig-pill{display:inline-flex;align-items:center;gap:12px;border-radius:999px;padding:14px 24px;
  border:1px solid var(--line-strong);background:rgba(244,238,227,.04);font-weight:700;font-size:16px;
  transition:transform .5s var(--ease),border-color .5s var(--ease),background .5s var(--ease)}
.dig-pill:hover{transform:translateY(-3px);border-color:rgba(217,164,91,.45);background:rgba(217,164,91,.08)}
.dig-pill svg{width:19px;height:19px;color:var(--gold2)}

/* Why cards */
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.why-card{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.045);border:1px solid var(--line);
  transition:transform .6s var(--ease)}
.why-card:hover{transform:translateY(-5px)}
.why-in{border-radius:var(--r-inner);padding:30px 26px;height:100%;
  background:linear-gradient(165deg,#141008 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.08)}
.why-in h3{font-size:22px;margin:16px 0 10px}
.why-in p{color:var(--muted);font-size:15.5px}
.why-num{font-family:'Secular One';font-size:15px;color:var(--gold);letter-spacing:.08em}

/* Stats */
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(20px,3vw,44px)}
.stat{text-align:center;padding:6px 10px}
.stat + .stat{border-inline-start:1px solid var(--line)}
.stat-num{font-family:'Secular One';font-size:clamp(38px,4.6vw,60px);
  background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.stat-label{color:var(--muted);font-weight:600;font-size:15.5px;margin-top:4px}

/* Clients marquee */
.clients{padding:34px 0 30px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);
  background:rgba(244,238,227,.015)}
.clients-label{text-align:center;font-size:13px;font-weight:700;letter-spacing:.18em;color:var(--dim);margin-bottom:22px}
.marquee{direction:ltr;overflow:hidden;position:relative;
  mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.marquee-track{display:flex;gap:22px;width:max-content;animation:marq 34s linear infinite}
.marquee:hover .marquee-track{animation-play-state:paused}
@keyframes marq{to{transform:translateX(-50%)}}
.client-chip{direction:rtl;unicode-bidi:isolate;flex:0 0 auto;display:flex;align-items:center;justify-content:center;
  width:168px;height:74px;border-radius:18px;background:rgba(250,248,244,.94);
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}
.client-chip img{max-height:48px;max-width:128px;width:auto;object-fit:contain;
  filter:grayscale(1) contrast(.92);opacity:.8;transition:filter .5s var(--ease),opacity .5s var(--ease)}
.client-chip:hover img{filter:grayscale(0);opacity:1}

/* Deep content + sidebar */
.deep-grid{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:clamp(28px,4vw,56px);align-items:start}
.side-menu{position:sticky;top:110px;display:flex;flex-direction:column;gap:16px}
.sm-card{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.04);border:1px solid var(--line)}
.sm-in{border-radius:var(--r-inner);padding:20px 18px;background:linear-gradient(160deg,#130e08 0%,#0b0906 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.07)}
.sm-in h4{font-family:'Secular One';font-size:15.5px;color:var(--gold2);margin-bottom:10px;padding-bottom:9px;
  border-bottom:1px solid rgba(217,164,91,.22)}
.sm-in a{display:block;padding:7px 10px;border-radius:10px;font-size:14.5px;font-weight:600;color:var(--muted);
  transition:color .35s var(--ease),background .35s var(--ease)}
.sm-in a:hover{color:var(--gold2);background:rgba(217,164,91,.07)}
.sm-in a.on{color:var(--gold2);background:rgba(217,164,91,.13)}
.sm-cta .sm-in{text-align:center;background:
  radial-gradient(120% 120% at 50% -10%,rgba(217,164,91,.25) 0%,transparent 55%),
  linear-gradient(160deg,#1a1207 0%,#0b0906 100%)}
.sm-cta p{font-weight:800;font-size:16px;margin-bottom:12px}
.sm-cta .btn{width:100%;justify-content:center;padding:11px 18px;font-size:15px;margin-bottom:8px}
@media (max-width:1024px){
  .deep-grid{grid-template-columns:1fr}
  .side-menu{position:static}
}

/* Related */
.related{display:flex;flex-wrap:wrap;gap:12px}
.related a{display:inline-flex;align-items:center;gap:9px;border-radius:999px;padding:10px 20px;font-size:15px;font-weight:600;
  border:1px solid var(--line-strong);color:var(--muted);transition:color .4s var(--ease),border-color .4s var(--ease)}
.related a:hover{color:var(--gold2);border-color:rgba(217,164,91,.4)}

/* Contact cards */
.contact-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.cc{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.04);border:1px solid var(--line)}
.cc-in{border-radius:var(--r-inner);padding:24px;height:100%;text-align:center;
  background:linear-gradient(160deg,#130e08 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.07)}
.cc-in .c-ic{width:46px;height:46px;border-radius:999px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;
  background:rgba(217,164,91,.1);border:1px solid rgba(217,164,91,.25);color:var(--gold2)}
.cc-in .c-ic svg{width:21px;height:21px}
.cc-in h3{font-size:17px;margin-bottom:6px}
.cc-in p,.cc-in a{color:var(--muted);font-size:15px;display:block}
.cc-in a:hover{color:var(--gold2)}

/* CTA / contact shell */
.contact{padding-bottom:clamp(90px,12vw,150px)}
.contact-shell{position:relative;border-radius:2rem;padding:.5rem;background:rgba(244,238,227,.05);
  border:1px solid var(--line-strong);box-shadow:0 60px 140px -50px rgba(0,0,0,.9);overflow:hidden}
.contact-halo{position:absolute;inset:-40%;pointer-events:none;filter:blur(80px);opacity:.35;
  background:conic-gradient(from var(--ang),transparent,rgba(217,164,91,.55) 90deg,transparent 200deg,rgba(240,194,122,.3) 300deg,transparent);
  animation:spin 30s linear infinite}
.contact-in{position:relative;border-radius:calc(2rem - .5rem);padding:clamp(30px,5vw,60px);
  background:linear-gradient(160deg,rgba(24,16,8,.96) 0%,rgba(10,8,5,.98) 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.1);
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(30px,5vw,70px);align-items:center}
.contact-copy h2{font-size:clamp(28px,3.4vw,42px);margin-bottom:14px}
.contact-copy h2 .gw{background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.contact-copy p{color:var(--muted);margin-bottom:22px}
.contact-lines{display:flex;flex-direction:column;gap:12px;font-weight:600}
.contact-lines a,.contact-lines span{display:inline-flex;align-items:center;gap:12px;color:var(--muted);transition:color .4s var(--ease)}
.contact-lines a:hover{color:var(--gold2)}
.contact-lines svg{width:18px;height:18px;color:var(--gold);flex:0 0 auto}
.form{display:flex;flex-direction:column;gap:16px}
.field label{display:block;font-weight:700;font-size:14.5px;margin-bottom:7px;color:var(--ink)}
.field input,.field select{width:100%;border-radius:14px;border:1px solid var(--line-strong);
  background:rgba(244,238,227,.05);color:var(--ink);font-family:'Assistant';font-size:16px;font-weight:500;
  padding:14px 16px;outline:none;transition:border-color .4s var(--ease),box-shadow .4s var(--ease);appearance:none}
.field input[type="tel"]{direction:ltr;text-align:right}
.field input[type="tel"]::placeholder{direction:ltr;text-align:right}
.field select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23d9a45b' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:left 16px center}
.field select option{background:#141008;color:#f4eee3;font-size:16px}
.field select option:disabled{color:#8a8071}
.field input::placeholder{color:var(--dim)}
.field input:focus,.field select:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(217,164,91,.18)}
.form .btn{justify-content:center;margin-top:6px}
.form-hint{font-size:13.5px;color:var(--dim);text-align:center}
.form-err{display:none;font-size:14px;font-weight:700;color:#e8a08a;margin-top:4px}
.form-err.show{display:block}

/* Footer */
footer{border-top:1px solid var(--line);background:#060504;padding:clamp(50px,7vw,80px) 0 34px}
.f-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.1fr;gap:clamp(28px,4vw,60px);margin-bottom:46px}
.f-brand img{height:40px;margin-bottom:16px}
.f-brand p{color:var(--muted);font-size:15px;max-width:34ch}
.f-col h4{font-family:'Secular One';font-size:15.5px;color:var(--gold2);margin-bottom:16px;letter-spacing:.04em}
.f-col a{display:block;color:var(--muted);font-size:15px;padding:5px 0;transition:color .4s var(--ease)}
.f-col a:hover{color:var(--ink)}
.f-bottom{border-top:1px solid var(--line);padding-top:24px;display:flex;align-items:center;justify-content:space-between;
  gap:14px;flex-wrap:wrap;color:var(--dim);font-size:14px}
.f-social{display:flex;gap:10px}
.f-social a{width:40px;height:40px;border-radius:999px;border:1px solid var(--line-strong);
  display:flex;align-items:center;justify-content:center;color:var(--muted);
  transition:color .4s var(--ease),border-color .4s var(--ease),transform .4s var(--ease)}
.f-social a:hover{color:var(--gold2);border-color:rgba(217,164,91,.45);transform:translateY(-2px)}
.f-social svg{width:17px;height:17px}

/* WhatsApp float */
.wa-float{position:fixed;bottom:24px;inset-inline-start:24px;z-index:50;width:56px;height:56px;border-radius:999px;
  background:#1ebe5d;display:flex;align-items:center;justify-content:center;color:#fff;
  box-shadow:0 16px 40px -12px rgba(30,190,93,.6);transition:transform .5s var(--ease)}
.wa-float:hover{transform:translateY(-4px) scale(1.05)}
.wa-float svg{width:27px;height:27px}

/* Responsive */
@media (max-width:1080px){
  .nav{display:none}
}
@media (max-width:1024px){
  .process-grid,.process-grid.p3{grid-template-columns:repeat(2,1fr)}
  .step:nth-child(odd){border-inline-start:none}
  .step{border-bottom:1px solid var(--line)}
  .col-5,.col-4,.col-3,.col-6,.col-7{grid-column:span 6}
  .art-grid{grid-template-columns:repeat(2,1fr)}
  .price-groups{grid-template-columns:1fr 1fr}
  .contact-cards{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:1080px){
  .header-cta{display:none}
  .burger{display:block}
}
@media (max-width:860px){
  .hero{padding-top:110px}
  .hero-grid,.about-grid,.contact-in{grid-template-columns:1fr}
  .cascade{max-width:480px;margin-top:8px}
  .lead-card:nth-child(1),.lead-card:nth-child(2),.lead-card:nth-child(3){transform:rotate(0) translateX(0)}
  .stats-grid{grid-template-columns:1fr;gap:0}
  .stat{padding:20px 0}
  .stat + .stat{border-inline-start:none;border-top:1px solid var(--line)}
  .f-grid{grid-template-columns:1fr 1fr}
  .check-grid,.t-grid{grid-template-columns:1fr}
}
@media (max-width:640px){
  body{font-size:16px}
  .col-5,.col-4,.col-3,.col-6,.col-7{grid-column:span 12}
  .process-grid,.process-grid.p3{grid-template-columns:1fr}
  .step{border-inline-start:none}
  .price-groups,.art-grid,.contact-cards{grid-template-columns:1fr}
  .why-grid{grid-template-columns:1fr}
  .f-grid{grid-template-columns:1fr}
  .hero-ctas .btn{width:100%;justify-content:center}
}
/* About (home) */
.about-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(36px,6vw,90px);align-items:center}
.about-copy p{color:var(--muted);margin-bottom:18px;font-size:17.5px}
.about-copy p b{color:var(--ink);font-weight:700}
.quote-shell{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.045);
  border:1px solid var(--line);box-shadow:0 40px 90px -40px rgba(0,0,0,.85)}
.quote-in{border-radius:var(--r-inner);padding:clamp(26px,3vw,40px);
  background:linear-gradient(165deg,#181109 0%,#0c0906 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.09);position:relative;overflow:hidden}
.quote-in::before{content:"\\201D";position:absolute;top:-30px;inset-inline-end:14px;font-family:'Secular One';
  font-size:170px;color:rgba(217,164,91,.12);line-height:1}
.quote-txt{font-size:clamp(19px,1.8vw,23px);font-weight:600;line-height:1.55;margin-bottom:22px}
.quote-who{display:flex;align-items:center;gap:14px}
.quote-avatar{width:52px;height:52px;border-radius:999px;background:var(--grad-gold);
  display:flex;align-items:center;justify-content:center;font-family:'Secular One';font-size:20px;color:#1c1206}
.quote-name{font-weight:800}
.quote-role{font-size:14.5px;color:var(--muted)}
.dig{background:linear-gradient(180deg,transparent,rgba(217,164,91,.04) 40%,transparent)}

/* ===== Article pages ===== */
.art-meta{display:flex;align-items:center;gap:14px;font-size:14px;color:var(--dim);font-weight:600;margin-bottom:14px}
.art-meta .am-cat{color:var(--gold2);border:1px solid rgba(217,164,91,.3);border-radius:999px;padding:3px 12px;font-size:12.5px;letter-spacing:.06em}
.art-cover{border-radius:var(--r-card);overflow:hidden;border:1px solid var(--line);
  box-shadow:0 40px 100px -40px rgba(0,0,0,.9);margin-bottom:clamp(32px,5vw,54px)}
.art-cover img{width:100%;height:auto;aspect-ratio:21/9;object-fit:cover}
.art-body{max-width:780px}
.art-body h2{scroll-margin-top:120px}

/* Magazine cards with covers */
.art-in{padding:0;overflow:hidden}
.art-in .a-img{aspect-ratio:16/9;overflow:hidden;background:#0b0906}
.art-in .a-img img{width:100%;height:100%;object-fit:cover;transition:transform .9s var(--ease);opacity:.9}
.art-card:hover .a-img img{transform:scale(1.06);opacity:1}
.art-in .a-txt{display:flex;flex-direction:column;gap:12px;padding:20px 22px 22px;flex:1}
.art-featured{border-radius:var(--r-card);padding:.45rem;background:rgba(244,238,227,.05);border:1px solid var(--line-strong);
  margin-bottom:26px;transition:transform .6s var(--ease),border-color .5s var(--ease);display:block}
.art-featured:hover{transform:translateY(-4px);border-color:rgba(217,164,91,.4)}
.art-featured .af-in{border-radius:var(--r-inner);overflow:hidden;display:grid;grid-template-columns:1.2fr 1fr;
  background:linear-gradient(160deg,#150f08 0%,#0b0906 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.07)}
.art-featured .af-img{min-height:280px}
.art-featured .af-img img{width:100%;height:100%;object-fit:cover}
.art-featured .af-txt{padding:clamp(24px,3vw,40px);display:flex;flex-direction:column;gap:14px;justify-content:center}
.art-featured h3{font-size:clamp(21px,2.2vw,28px);line-height:1.35}
.art-featured p{color:var(--muted);font-size:15.5px}

/* Side image */
.side-img{border-radius:var(--r-card);overflow:hidden;border:1px solid var(--line);
  box-shadow:0 40px 90px -40px rgba(0,0,0,.85);margin-bottom:18px}
.side-img img{width:100%;display:block}

/* Sticky mobile CTA bar */
.mcta{display:none}
@media (max-width:860px){
  .mcta{display:grid;grid-template-columns:1fr 1fr;gap:10px;position:fixed;bottom:0;inset-inline:0;z-index:52;
    padding:10px 14px calc(10px + env(safe-area-inset-bottom));
    background:rgba(10,8,5,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border-top:1px solid var(--line-strong)}
  .mcta a{display:flex;align-items:center;justify-content:center;gap:9px;border-radius:999px;padding:13px 10px;
    font-weight:800;font-size:15px}
  .mcta a svg{width:17px;height:17px}
  .mcta .m-call{background:var(--grad-gold);color:#1c1206;box-shadow:0 10px 26px -10px rgba(217,164,91,.5)}
  .mcta .m-wa{background:#1ebe5d;color:#fff}
  .wa-float{display:none}
  footer{padding-bottom:110px}
  .art-featured .af-in{grid-template-columns:1fr}
  .art-featured .af-img{min-height:190px}
}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
  .reveal{opacity:1;transform:none;filter:none}
  html{scroll-behavior:auto}
  .hero-media video{display:none}
  .hero-media{background:url('assets/hero-poster.jpg') center/cover}
}
`;

/* ---------- SVG icons ---------- */
export const IC = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  house: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M10 21v-4h4v4"/></svg>',
  shekel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 8l7-5 7 5"/><path d="M3 21h18"/><path d="M7 21v-6"/><path d="M17 21v-6"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 13 4-4 4 4 5-5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  fbf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>',
  li: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d9a45b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>',
  fbFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  caret: '<svg class="car" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
  crumb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
};

const logoImg = root => `<img src="${root}assets/logo.png" alt="BaliLead באלי ליד" width="103" height="34">`;

export function header(root, active = '') {
  const mark = href => (href === active ? ' class="active"' : '');
  const leadsMenu = NAV_LEADS.map(([h, t]) => `<a href="${root}${h}">${t}</a>`).join('');
  const digMenu = NAV_DIGITAL.map(([h, t]) => `<a href="${root}${h}">${t}</a>`).join('');
  return `
<header class="header" id="header">
  <div class="header-pill">
    <a class="brand" href="${root}" aria-label="באלי ליד, דף הבית">${logoImg(root)}</a>
    <nav class="nav" aria-label="ניווט ראשי">
      <div class="nav-item"><a href="${root}"${mark('home')}>ראשי</a></div>
      <div class="nav-item">
        <a href="${root}קניית-לידים/"${mark('leads')}>לידים חמים ${IC.caret}</a>
        <div class="menu"><div class="menu-in">${leadsMenu}</div></div>
      </div>
      <div class="nav-item">
        <a href="${root}שיווק-דיגיטלי/"${mark('digital')}>שיווק דיגיטלי ${IC.caret}</a>
        <div class="menu"><div class="menu-in">${digMenu}</div></div>
      </div>
      <div class="nav-item"><a href="${root}מחירון-לידים/"${mark('pricing')}>מחירון 2026</a></div>
      <div class="nav-item"><a href="${root}עדכונים-חמים/"${mark('magazine')}>מגזין</a></div>
      <div class="nav-item"><a href="${root}יצירת-קשר/"${mark('contact')}>צור קשר</a></div>
    </nav>
    <div class="header-cta">
      <a class="btn btn-gold" href="${SITE.phoneHref}">
        <span class="btn-ic">${IC.phone}</span>
        ${SITE.phone}
      </a>
    </div>
    <button class="burger" id="burger" aria-label="פתיחת תפריט" aria-expanded="false" aria-controls="mnav">
      <span></span><span></span>
    </button>
  </div>
</header>

<div class="mnav" id="mnav">
  <a class="m-main" href="${root}">ראשי</a>
  <a class="m-main" href="${root}מחירון-לידים/">מחירון 2026</a>
  <a class="m-main" href="${root}עדכונים-חמים/">מגזין</a>
  <a class="m-main" href="${root}יצירת-קשר/">צור קשר</a>
  <div class="m-group">לידים חמים</div>
  <div>${NAV_LEADS.map(([h, t]) => `<a class="m-sub" href="${root}${h}">${t}</a>`).join('')}</div>
  <div class="m-group">שיווק דיגיטלי</div>
  <div>${NAV_DIGITAL.map(([h, t]) => `<a class="m-sub" href="${root}${h}">${t}</a>`).join('')}</div>
  <div class="mnav-contact">${SITE.phone} · ${SITE.email}</div>
</div>`;
}

export function footer(root) {
  return `
<footer>
  <div class="container">
    <div class="f-grid">
      <div class="f-brand">
        ${logoImg(root)}
        <p>חברת לידים, שיווק ופרסום המתמחה בסקטור הפיננסי. לידים חמים, בלעדיים ומסוננים, ישירות לאנשי המכירות שלכם.</p>
      </div>
      <div class="f-col">
        <h4>לידים חמים</h4>
        <a href="${root}קניית-לידים/לידים-לביטוח/">לידים לביטוח</a>
        <a href="${root}קניית-לידים/לידים-להחזרי-מס/">לידים להחזרי מס</a>
        <a href="${root}קניית-לידים/לידים-להלוואות/">לידים להלוואות</a>
        <a href="${root}קניית-לידים/לידים-למשכנתאות/">לידים למשכנתאות</a>
        <a href="${root}לידים-לרואי-חשבון/">לידים לרואי חשבון</a>
        <a href="${root}חברת-לידים/">חברת לידים, מודל CPL</a>
        <a href="${root}מחירון-לידים/">מחירון לידים 2026</a>
      </div>
      <div class="f-col">
        <h4>פתרונות דיגיטל</h4>
        <a href="${root}קידום-בגוגל/">קידום ממומן בגוגל</a>
        <a href="${root}קידום-אתרים-seo/">קידום אתרים SEO</a>
        <a href="${root}בניית-אתרים/">בניית אתרים</a>
        <a href="${root}דפי-נחיתה/">דפי נחיתה ממירים</a>
        <a href="${root}מערכת-ניהול-לידים/">מערכות CRM וניהול לידים</a>
        <a href="${root}סוכני-ai/">סוכני AI חכמים</a>
        <a href="${root}אוטומציות-שיווק/">אוטומציות שיווק</a>
        <a href="${root}עדכונים-חמים/">המגזין שלנו</a>
      </div>
      <div class="f-col">
        <h4>יצירת קשר</h4>
        <a href="${SITE.phoneHref}">${SITE.phone}</a>
        <a href="mailto:${SITE.email}">${SITE.email}</a>
        <a href="https://maps.google.com/?q=אצל 34 רמת גן" target="_blank" rel="noopener">${SITE.address}</a>
        <a href="${root}מחשבון-roi-ללידים/">מחשבון ROI ללידים</a>
        <a href="${root}מדיניות-פרטיות/">מדיניות פרטיות ותנאי שימוש</a>
        <a href="${root}הצהרת-נגישות/">הצהרת נגישות</a>
      </div>
    </div>
    <div class="f-bottom">
      <span>© 2026 BaliLeads. כל הזכויות שמורות.</span>
      <div class="f-social">
        <a href="${SITE.fb}" target="_blank" rel="noopener" aria-label="פייסבוק">${IC.fbFill}</a>
        <a href="${SITE.wa}" target="_blank" rel="noopener" aria-label="וואטסאפ">${IC.wa}</a>
      </div>
    </div>
  </div>
</footer>

<a class="wa-float" href="${SITE.waText}" target="_blank" rel="noopener" aria-label="שיחת וואטסאפ">${IC.wa}</a>

<div class="mcta">
  <a class="m-call" href="${SITE.phoneHref}">${IC.phone}חייגו עכשיו</a>
  <a class="m-wa" href="${SITE.waText}" target="_blank" rel="noopener">${IC.wa}וואטסאפ</a>
</div>`;
}

const FORM_TOPICS = ['ביטוח', 'משכנתאות', 'הלוואות', 'החזרי מס', 'פיננסים והשקעות', 'עורכי דין', 'רואי חשבון', 'רפואה ואסתטיקה', 'בניית אתרים', 'שיווק דיגיטלי לעסק שלי', 'תחום אחר'];

export function sideMenu(root, activePath) {
  const link = ([h, t]) => `<a href="${root}${h}"${h === activePath + '/' ? ' class="on"' : ''}>${t}</a>`;
  return `
    <aside class="side-menu" aria-label="ניווט שירותים">
      <div class="sm-card"><div class="sm-in">
        <h4>לידים חמים</h4>
        ${NAV_LEADS.map(link).join('')}
      </div></div>
      <div class="sm-card"><div class="sm-in">
        <h4>שיווק דיגיטלי</h4>
        ${NAV_DIGITAL.map(link).join('')}
      </div></div>
      <div class="sm-card sm-cta"><div class="sm-in">
        <p>צריכים לידים עכשיו?</p>
        <a class="btn btn-gold" href="${SITE.phoneHref}"><span class="btn-ic">${IC.phone}</span>${SITE.phone}</a>
        <a class="btn btn-ghost" href="${SITE.waText}" target="_blank" rel="noopener"><span class="btn-ic">${IC.wa}</span>וואטסאפ</a>
      </div></div>
    </aside>`;
}

export function clientsStrip(root) {
  return `
<section class="clients">
  <div class="clients-label">חברות שכבר מוכרות יותר איתנו</div>
  <div class="marquee">
    <div class="marquee-track" id="marqTrack">
      <div class="client-chip"><img src="${root}assets/client-elia.png" alt="אליה סוכנות ביטוח, לקוחה של באלי ליד" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-getfuel.png" alt="GetFuel, לקוחה של באלי ליד" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-tevel.jpg" alt="תבל, לקוחה של באלי ליד" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-yehadim.png" alt="יהלומים, לקוחה של באלי ליד" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-tsm.jpg" alt="TSM, לקוחה של באלי ליד" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-1907.png" alt="לקוח של באלי ליד" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-tempweb.jpg" alt="לקוח של באלי ליד" loading="lazy"></div>
      <div class="client-chip"><img src="${root}assets/client-untitled.png" alt="לקוח של באלי ליד" loading="lazy"></div>
    </div>
  </div>
</section>`;
}

export function ctaSection(root, { title, sub, topic } = {}) {
  const topics = FORM_TOPICS.includes(topic) || !topic ? FORM_TOPICS : [topic, ...FORM_TOPICS];
  return `
<section class="sec contact" id="contact" style="padding-top:0">
  <div class="container">
    <div class="contact-shell reveal">
      <div class="contact-halo" aria-hidden="true"></div>
      <div class="contact-in">
        <div class="contact-copy">
          <h2>${title || 'הלקוח הבא שלכם <span class="gw">כבר מחפש אתכם</span>'}</h2>
          <p>${sub || 'השאירו פרטים ותוך 24 שעות נתחיל להגדיל את כמות הלקוחות שלכם. בלי התחייבות, אפשר להתחיל בפיילוט.'}</p>
          <div class="contact-lines">
            <a href="${SITE.phoneHref}">${IC.phone}${SITE.phone}</a>
            <a href="mailto:${SITE.email}">${IC.mail}${SITE.email}</a>
            <span>${IC.pin}${SITE.address}</span>
          </div>
        </div>
        <form class="form" id="leadForm" novalidate>
          <div class="field">
            <label for="f-name">שם מלא</label>
            <input id="f-name" name="name" type="text" placeholder="ישראל ישראלי" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="f-phone">טלפון נייד</label>
            <input id="f-phone" name="phone" type="tel" inputmode="tel" placeholder="050-0000000" autocomplete="tel" required>
          </div>
          <div class="field">
            <label for="f-topic">איזה לידים אתם צריכים?</label>
            <select id="f-topic" name="topic" required>
              <option value=""${topic ? '' : ' selected'} disabled>בחרו תחום</option>
              ${topics.map(t => `<option${t === topic ? ' selected' : ''}>${t}</option>`).join('\n              ')}
            </select>
          </div>
          <label class="consent"><input type="checkbox" name="consent" checked required><span>אני מאשר/ת את <a href="${root}מדיניות-פרטיות/" target="_blank">מדיניות הפרטיות</a> והעברת פרטיי לצד ג׳ רלוונטי</span></label>
          <button class="btn btn-gold" type="submit">
            <span class="btn-ic">${IC.send}</span>
            שולחים ומתחילים
          </button>
          <div class="form-err" id="formErr">כמעט שם, רק צריך שם, טלפון תקין ותחום.</div>
          <div class="form-hint">לחיצה על שליחה פותחת שיחת וואטסאפ עם הפרטים שמילאתם.</div>
        </form>
      </div>
    </div>
  </div>
</section>`;
}

export const js = `
(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.getElementById('header');
  var sentinel = document.querySelector('.hero-eyebrow') || document.querySelector('.crumbs') || document.body;
  var lastState = false;
  new IntersectionObserver(function(entries){
    var past = !entries[0].isIntersecting;
    if(past !== lastState){ lastState = past; header.classList.toggle('scrolled', past); }
  }, {rootMargin:'40px 0px 0px 0px'}).observe(sentinel);

  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  function closeNav(){ burger.classList.remove('open'); mnav.classList.remove('open');
    burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  burger.addEventListener('click', function(){
    var open = !mnav.classList.contains('open');
    burger.classList.toggle('open', open); mnav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mnav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });

  var track = document.getElementById('marqTrack');
  if(track){
    var original = track.innerHTML;
    var copies = 1;
    while(track.scrollWidth < window.innerWidth * 2.2 && copies < 8){
      track.innerHTML += original; copies++;
    }
    track.innerHTML += track.innerHTML;
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0, rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  /* safety: never leave content hidden if the observer misses */
  setTimeout(function(){
    document.querySelectorAll('.reveal:not(.in)').forEach(function(el){
      if(el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  }, 1500);

  var counted = false;
  var statsEl = document.querySelector('.stats-grid');
  if(statsEl){
    new IntersectionObserver(function(entries){
      if(!entries[0].isIntersecting || counted) return;
      counted = true;
      document.querySelectorAll('.stat-num[data-count]').forEach(function(el){
        var target = parseInt(el.getAttribute('data-count'),10);
        if(isNaN(target)) return;
        if(reduce || target > 999){ el.textContent = target; return; }
        el.textContent = '0';
        var start = null;
        function tick(ts){
          if(!start) start = ts;
          var p = Math.min((ts-start)/1400, 1);
          var eased = 1 - Math.pow(1-p, 4);
          el.textContent = Math.round(target*eased);
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, {threshold:.4}).observe(statsEl);
  }

  /* spotlight hover: track pointer on cards */
  if(window.matchMedia('(hover: hover)').matches && !reduce){
    document.querySelectorAll('.v-card,.art-card,.check-card,.why-card,.t-card').forEach(function(c){ c.classList.add('spot'); });
    document.addEventListener('pointermove', function(e){
      var card = e.target.closest ? e.target.closest('.spot') : null;
      if(!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  var form = document.getElementById('leadForm');
  if(form){
    var err = document.getElementById('formErr');
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.replace(/[^0-9+]/g,'');
      var topic = form.topic.value;
      if(!name || phone.length < 9 || !topic || (form.consent && !form.consent.checked)){ err.classList.add('show'); return; }
      err.classList.remove('show');
      var msg = 'היי, אני ' + name + ' (' + form.phone.value.trim() + '). אשמח לקבל פרטים על לידים בתחום ' + topic + '.';
      window.open('https://wa.me/972584700706?text=' + encodeURIComponent(msg), '_blank');
    });
  }
})();`;

/* מזהי מדידה: מלאו כאן GA4 (G-XXXXXXX) ו/או פיקסל מטא (מספר), הריצו node gen.mjs, וזה יוזרק לכל העמודים */
export const ANALYTICS = { ga4: '', metaPixel: '' };

const escAttr = s => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

function analyticsHtml() {
  let out = '';
  if (ANALYTICS.ga4) out += `
<script async src="https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ANALYTICS.ga4}');</script>`;
  if (ANALYTICS.metaPixel) out += `
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ANALYTICS.metaPixel}');fbq('track','PageView');</script>`;
  return out;
}

export const siteCss = () => css + widgetsCss;
export const siteJs = () => js + '\n' + widgetsJs;

export function shell({ root, title, desc, canonical, active, body, ldjson, extraLd = [], ogImage }) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escText(title)}</title>
<meta name="description" content="${escAttr(desc)}">
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
<meta property="og:locale" content="he_IL">
<meta property="og:type" content="website">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:image" content="${ogImage || 'https://tzahilevi1.github.io/balilead-site/assets/hero-poster.jpg'}">
<meta name="theme-color" content="#080606">
<link rel="icon" type="image/png" sizes="64x64" href="${root}assets/favicon-64.png">
<link rel="apple-touch-icon" href="${root}assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Secular+One&family=Assistant:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}style.css">
${ldjson ? `<script type="application/ld+json">${ldjson}</script>` : ''}
${extraLd.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}${analyticsHtml()}
</head>
<body>
<a class="skip-link" href="#top">דילוג לתוכן המרכזי</a>
<div class="grain" aria-hidden="true"></div>
${header(root, active)}
<main id="top">
${body}
</main>
${footer(root)}
${widgetsHtml(root)}
<script defer src="${root}site.js"></script>
</body>
</html>`;
}

export function pageHero(root, { crumbs, h1, sub, price, ctas = true, metaLine, img, alt }) {
  const crumbHtml = crumbs
    ? `<nav class="crumbs reveal" aria-label="פירורי לחם">${crumbs.map((c, i) =>
        (i ? IC.crumb : '') + (c.href !== undefined ? `<a href="${root}${c.href}">${c.t}</a>` : `<span>${c.t}</span>`)
      ).join('')}</nav>`
    : '';
  const priceHtml = price
    ? `<div class="price-chip reveal" style="--d:.25s">טווח מחיר לליד: <span class="pc-num">${price}</span> <a href="${root}מחירון-לידים/">למחירון המלא 2026</a></div>`
    : '';
  const ctasHtml = ctas
    ? `<div class="hero-ctas reveal" style="--d:.3s;margin-top:28px">
        <a class="btn btn-gold" href="#contact"><span class="btn-ic">${IC.arrowL}</span>מתחילים לקבל לידים</a>
        <a class="btn btn-ghost" href="${SITE.waText}" target="_blank" rel="noopener"><span class="btn-ic">${IC.wa}</span>דברו איתנו בוואטסאפ</a>
      </div>`
    : '';
  const inner = `
    ${crumbHtml}
    ${metaLine ? `<div class="art-meta reveal">${metaLine}</div>` : ''}
    <h1 class="reveal" style="--d:.08s">${h1}</h1>
    <p class="p-sub reveal" style="--d:.16s">${sub}</p>
    ${priceHtml}
    ${ctasHtml}`;
  if (img) {
    return `
<section class="p-hero has-media">
  <div class="p-hero-media">
    <img src="${root}assets/${img}" alt="${alt || ''}" fetchpriority="high">
    <div class="p-hero-scrim" aria-hidden="true"></div>
  </div>
  <div class="hero-halo" aria-hidden="true"></div>
  <div class="container">
    ${inner}
  </div>
</section>`;
  }
  return `
<section class="p-hero">
  <div class="hero-halo" aria-hidden="true"></div>
  <div class="container">
    ${inner}
  </div>
</section>`;
}
