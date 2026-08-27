// Site widgets: accessibility panel (IS 5568 style), AI chat assistant, conversion popups.
// All vanilla JS. Inner JS uses classic strings only (no backticks) so it can live in a template literal.
import { ALL_PRICES } from './prices.mjs';

const WA_URL = 'https://wa.me/972584700706';
const PHONE_TXT = '058-4700706';

export const widgetsCss = `
/* ===== Skip link ===== */
.skip-link{position:fixed;top:-60px;inset-inline-start:16px;z-index:200;background:var(--grad-gold);color:#1c1206;
  font-weight:800;padding:10px 22px;border-radius:999px;transition:top .3s var(--ease)}
.skip-link:focus{top:14px}

/* ===== Accessibility widget ===== */
.acc-btn{position:fixed;top:44%;inset-inline-end:0;z-index:90;width:46px;height:46px;
  border-radius:12px 0 0 12px;border:none;cursor:pointer;background:#1a56db;color:#fff;
  display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px -8px rgba(0,0,0,.6)}
.acc-btn svg{width:26px;height:26px}
.acc-panel{position:fixed;top:20%;inset-inline-end:14px;z-index:95;width:280px;max-height:64vh;overflow-y:auto;
  border-radius:20px;padding:18px;background:rgba(16,12,8,.97);backdrop-filter:blur(26px);
  border:1px solid var(--line-strong);box-shadow:0 40px 90px -20px rgba(0,0,0,.95);
  opacity:0;visibility:hidden;transform:translateX(-10px);transition:opacity .4s var(--ease),transform .4s var(--ease),visibility .4s}
.acc-panel.open{opacity:1;visibility:visible;transform:translateX(0)}
.acc-panel h3{font-size:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.acc-panel h3 button{background:none;border:none;color:var(--muted);cursor:pointer;font-size:20px;line-height:1}
.acc-panel .acc-row{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;
  border:1px solid var(--line);background:rgba(244,238,227,.04);border-radius:12px;padding:10px 14px;margin-bottom:8px;
  color:var(--ink);font-family:'Assistant';font-size:14.5px;font-weight:600;cursor:pointer;text-align:start}
.acc-row .dot{width:16px;height:16px;border-radius:999px;border:1.5px solid var(--line-strong);flex:0 0 auto}
.acc-row[aria-pressed="true"]{border-color:rgba(217,164,91,.5);background:rgba(217,164,91,.1)}
.acc-row[aria-pressed="true"] .dot{background:var(--gold);border-color:var(--gold)}
.acc-panel .acc-link{display:block;text-align:center;font-size:13.5px;color:var(--gold2);margin-top:8px;text-decoration:underline}
/* modes */
html.acc-f1{font-size:112%}
html.acc-f2{font-size:126%}
html.acc-contrast body{background:#000 !important}
html.acc-contrast body *{color:#ffe700 !important;border-color:#ffe700 !important}
html.acc-contrast .btn-gold,html.acc-contrast .mcta .m-call{background:#ffe700 !important;color:#000 !important}
html.acc-contrast img,html.acc-contrast video{filter:grayscale(1) contrast(1.2)}
html.acc-gray{filter:grayscale(1)}
html.acc-links a{text-decoration:underline !important}
html.acc-font body,html.acc-font h1,html.acc-font h2,html.acc-font h3,html.acc-font .btn{font-family:Arial,Helvetica,sans-serif !important}
html.acc-noanim *,html.acc-noanim *::before,html.acc-noanim *::after{animation:none !important;transition:none !important}
html.acc-noanim .reveal{opacity:1 !important;transform:none !important;filter:none !important}
html.acc-noanim .hero-media video{display:none}

/* ===== Chat widget ===== */
.chat-btn{position:fixed;bottom:92px;inset-inline-start:24px;z-index:50;width:56px;height:56px;border-radius:999px;
  border:none;cursor:pointer;background:var(--grad-gold);color:#1c1206;display:flex;align-items:center;justify-content:center;
  box-shadow:0 16px 40px -12px rgba(217,164,91,.65);transition:transform .5s var(--ease)}
.chat-btn:hover{transform:translateY(-4px) scale(1.05)}
.chat-btn svg{width:26px;height:26px}
.chat-box{position:fixed;bottom:160px;inset-inline-start:24px;z-index:94;width:min(370px,calc(100vw - 32px));
  height:min(520px,70vh);display:flex;flex-direction:column;border-radius:24px;overflow:hidden;
  background:rgba(14,11,7,.98);backdrop-filter:blur(28px);border:1px solid var(--line-strong);
  box-shadow:0 50px 120px -30px rgba(0,0,0,.95);
  opacity:0;visibility:hidden;transform:translateY(16px);transition:opacity .45s var(--ease),transform .45s var(--ease),visibility .45s}
.chat-box.open{opacity:1;visibility:visible;transform:translateY(0)}
.chat-head{display:flex;align-items:center;gap:12px;padding:14px 18px;background:linear-gradient(160deg,#1a1207,#0d0a07);
  border-bottom:1px solid var(--line)}
.chat-head .cav{width:40px;height:40px;border-radius:999px;background:var(--grad-gold);display:flex;align-items:center;justify-content:center;
  font-family:'Secular One';font-size:17px;color:#1c1206}
.chat-head .cname{font-weight:800;font-size:15.5px}
.chat-head .cstat{font-size:12.5px;color:#7ddc9a}
.chat-head button{margin-inline-start:auto;background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;line-height:1}
.chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.cmsg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:14.5px;line-height:1.55;white-space:pre-line}
.cmsg.bot{align-self:flex-start;background:rgba(244,238,227,.07);border:1px solid var(--line);border-start-start-radius:4px}
.cmsg.user{align-self:flex-end;background:rgba(217,164,91,.16);border:1px solid rgba(217,164,91,.3);border-start-end-radius:4px}
.cmsg a{color:var(--gold2);text-decoration:underline}
.chat-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 10px}
.chat-chips button{border-radius:999px;border:1px solid rgba(217,164,91,.35);background:rgba(217,164,91,.07);
  color:var(--gold2);font-family:'Assistant';font-size:13px;font-weight:700;padding:7px 14px;cursor:pointer;
  transition:background .3s var(--ease)}
.chat-chips button:hover{background:rgba(217,164,91,.16)}
.chat-in{display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--line)}
.chat-in input{flex:1;border-radius:999px;border:1px solid var(--line-strong);background:rgba(244,238,227,.05);
  color:var(--ink);font-family:'Assistant';font-size:14.5px;padding:11px 16px;outline:none}
.chat-in input:focus{border-color:var(--gold)}
.chat-in button{width:42px;height:42px;border-radius:999px;border:none;background:var(--grad-gold);color:#1c1206;
  cursor:pointer;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.chat-in button svg{width:17px;height:17px}
.ctyping{display:inline-flex;gap:4px;padding:12px 16px}
.ctyping span{width:7px;height:7px;border-radius:999px;background:var(--gold);opacity:.4;animation:cty 1s infinite}
.ctyping span:nth-child(2){animation-delay:.18s}.ctyping span:nth-child(3){animation-delay:.36s}
@keyframes cty{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}
@media (max-width:860px){
  .chat-btn{bottom:150px}
  .chat-box{bottom:150px;inset-inline-start:16px}
}

/* ===== Popups ===== */
.pop-ov{position:fixed;inset:0;z-index:120;background:rgba(5,4,2,.7);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;padding:20px;
  opacity:0;visibility:hidden;transition:opacity .45s var(--ease),visibility .45s}
.pop-ov.open{opacity:1;visibility:visible}
.pop{position:relative;width:min(520px,94vw);border-radius:2rem;padding:.5rem;background:rgba(244,238,227,.06);
  border:1px solid var(--line-strong);box-shadow:0 60px 140px -40px rgba(0,0,0,.95);
  transform:translateY(20px) scale(.97);transition:transform .5s var(--ease)}
.pop-ov.open .pop{transform:translateY(0) scale(1)}
.pop-in{border-radius:calc(2rem - .5rem);padding:clamp(26px,5vw,40px);overflow:hidden;position:relative;
  background:linear-gradient(160deg,rgba(26,17,8,.98),rgba(10,8,5,.99));box-shadow:inset 0 1px 1px rgba(255,255,255,.1)}
.pop-x{position:absolute;top:14px;inset-inline-start:14px;z-index:2;width:34px;height:34px;border-radius:999px;
  border:1px solid var(--line-strong);background:rgba(244,238,227,.06);color:var(--muted);font-size:17px;cursor:pointer}
.pop-eyebrow{display:inline-block;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:800;letter-spacing:.1em;
  color:var(--gold2);border:1px solid rgba(217,164,91,.35);background:rgba(217,164,91,.08);margin-bottom:14px}
.pop h3{font-family:'Secular One';font-size:clamp(22px,3vw,30px);margin-bottom:10px}
.pop h3 .gw{background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.pop p{color:var(--muted);font-size:15.5px;margin-bottom:18px}
.pop .pop-form{display:flex;gap:10px}
.pop .pop-form input{flex:1;border-radius:999px;border:1px solid var(--line-strong);background:rgba(244,238,227,.05);
  color:var(--ink);font-family:'Assistant';font-size:15px;padding:12px 18px;outline:none;direction:ltr;text-align:right}
.pop .pop-form input:focus{border-color:var(--gold)}
.pop .consent{margin-top:12px}
/* toast */
.toast{position:fixed;bottom:24px;inset-inline-end:24px;z-index:110;width:min(340px,calc(100vw - 32px));
  border-radius:20px;padding:18px 20px;background:rgba(16,12,8,.97);backdrop-filter:blur(24px);
  border:1px solid rgba(217,164,91,.3);box-shadow:0 30px 80px -20px rgba(0,0,0,.9);
  opacity:0;visibility:hidden;transform:translateY(14px);transition:opacity .5s var(--ease),transform .5s var(--ease),visibility .5s}
.toast.open{opacity:1;visibility:visible;transform:translateY(0)}
.toast h4{font-size:16px;margin-bottom:6px}
.toast p{font-size:13.5px;color:var(--muted);margin-bottom:12px}
.toast .t-row{display:flex;gap:8px}
.toast .t-row a,.toast .t-row button{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
  border-radius:999px;padding:9px 10px;font-family:'Assistant';font-size:13.5px;font-weight:800;cursor:pointer;border:none}
.toast .t-gold{background:var(--grad-gold);color:#1c1206}
.toast .t-ghost{background:rgba(244,238,227,.07);color:var(--ink);border:1px solid var(--line-strong)}
.toast .t-x{position:absolute;top:8px;inset-inline-start:10px;background:none;border:none;color:var(--dim);font-size:16px;cursor:pointer}
@media (max-width:860px){.toast{bottom:86px}}

/* Consent checkbox */
.consent{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--muted);line-height:1.4;cursor:pointer}
.consent > span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (max-width:640px){.consent > span{white-space:normal}}
.consent input{appearance:none;width:17px;height:17px;flex:0 0 auto;border-radius:5px;cursor:pointer;
  border:1.5px solid rgba(217,164,91,.5);background:rgba(217,164,91,.08);position:relative}
.consent input:checked{background:var(--grad-gold);border-color:var(--gold)}
.consent input:checked::after{content:"";position:absolute;inset:2px 4.5px;border:solid #1c1206;border-width:0 0 2.2px 2.2px;transform:rotate(-45deg) translateY(-1.5px)}
.consent a{color:var(--gold2);text-decoration:underline}
`;

export const widgetsHtml = root => `
<button class="acc-btn" id="accBtn" aria-label="פתיחת תפריט נגישות" aria-expanded="false" title="נגישות">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>
</button>
<div class="acc-panel" id="accPanel" role="dialog" aria-label="הגדרות נגישות">
  <h3>הגדרות נגישות <button id="accClose" aria-label="סגירה">✕</button></h3>
  <button class="acc-row" data-acc="f1">הגדלת טקסט<span class="dot"></span></button>
  <button class="acc-row" data-acc="f2">טקסט גדול מאוד<span class="dot"></span></button>
  <button class="acc-row" data-acc="contrast">ניגודיות גבוהה<span class="dot"></span></button>
  <button class="acc-row" data-acc="gray">גווני אפור<span class="dot"></span></button>
  <button class="acc-row" data-acc="links">הדגשת קישורים<span class="dot"></span></button>
  <button class="acc-row" data-acc="font">פונט קריא<span class="dot"></span></button>
  <button class="acc-row" data-acc="noanim">עצירת אנימציות<span class="dot"></span></button>
  <button class="acc-row" id="accReset">איפוס הגדרות<span class="dot"></span></button>
  <a class="acc-link" href="${root}הצהרת-נגישות/">להצהרת הנגישות המלאה</a>
</div>

<button class="chat-btn" id="chatBtn" aria-label="פתיחת צ'אט עם העוזר הדיגיטלי" aria-expanded="false">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
</button>
<div class="chat-box" id="chatBox" data-root="${root}" role="dialog" aria-label="צ'אט עם העוזר הדיגיטלי של באלי ליד">
  <div class="chat-head">
    <div class="cav">ב</div>
    <div><div class="cname">בַּאלִי · העוזר הדיגיטלי</div><div class="cstat">● זמין עכשיו</div></div>
    <button id="chatClose" aria-label="סגירת הצ'אט">✕</button>
  </div>
  <div class="chat-msgs" id="chatMsgs"></div>
  <div class="chat-chips" id="chatChips"></div>
  <div class="chat-in">
    <input id="chatInput" type="text" placeholder="כתבו כאן שאלה..." aria-label="הודעה לצ'אט">
    <button id="chatSend" aria-label="שליחה"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 3 9-3 9 19-9Z"/></svg></button>
  </div>
</div>

<div class="pop-ov" id="popOv" role="dialog" aria-modal="true" aria-label="הצעה מיוחדת">
  <div class="pop"><div class="pop-in">
    <button class="pop-x" id="popX" aria-label="סגירה">✕</button>
    <span class="pop-eyebrow" id="popEyebrow"></span>
    <h3 id="popTitle"></h3>
    <p id="popText"></p>
    <form class="pop-form" id="popForm">
      <input id="popPhone" type="tel" inputmode="tel" placeholder="הטלפון שלכם" aria-label="טלפון">
      <button class="btn btn-gold" type="submit" style="padding:12px 22px">שלחו לי פרטים</button>
    </form>
    <label class="consent"><input type="checkbox" checked><span>הנני מאשר/ת את <a href="${root}מדיניות-פרטיות/" target="_blank">מדיניות הפרטיות</a> ותקנון האתר</span></label>
  </div></div>
</div>
<div class="toast" id="toast">
  <button class="t-x" id="toastX" aria-label="סגירה">✕</button>
  <h4 id="toastTitle"></h4>
  <p id="toastText"></p>
  <div class="t-row" id="toastRow"></div>
</div>`;

const PRICE_KB = JSON.stringify(ALL_PRICES);

export const widgetsJs = `
(function(){
  "use strict";
  var ROOT = (document.getElementById('chatBox')||{dataset:{}}).dataset.root || '';
  var WA = '${WA_URL}';
  var PHONE = '${PHONE_TXT}';

  /* ============ Accessibility widget ============ */
  var accBtn = document.getElementById('accBtn'), accPanel = document.getElementById('accPanel');
  var ACC_KEYS = ['f1','f2','contrast','gray','links','font','noanim'];
  function accLoad(){ try { return JSON.parse(localStorage.getItem('bl_acc')||'{}'); } catch(e){ return {}; } }
  function accApply(){
    var st = accLoad();
    ACC_KEYS.forEach(function(k){
      document.documentElement.classList.toggle('acc-'+k, !!st[k]);
      var row = accPanel.querySelector('[data-acc="'+k+'"]');
      if(row) row.setAttribute('aria-pressed', String(!!st[k]));
    });
  }
  accApply();
  accBtn.addEventListener('click', function(){
    var open = !accPanel.classList.contains('open');
    accPanel.classList.toggle('open', open);
    accBtn.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('accClose').addEventListener('click', function(){ accPanel.classList.remove('open'); });
  accPanel.querySelectorAll('[data-acc]').forEach(function(row){
    row.addEventListener('click', function(){
      var st = accLoad(); var k = row.getAttribute('data-acc');
      if(k==='f1' && !st.f1) st.f2 = false;
      if(k==='f2' && !st.f2) st.f1 = false;
      st[k] = !st[k];
      localStorage.setItem('bl_acc', JSON.stringify(st)); accApply();
    });
  });
  document.getElementById('accReset').addEventListener('click', function(){
    localStorage.removeItem('bl_acc'); accApply();
  });

  /* ============ Chat assistant ============ */
  var PRICES = ${PRICE_KB};
  var chatBtn = document.getElementById('chatBtn'), chatBox = document.getElementById('chatBox');
  var msgs = document.getElementById('chatMsgs'), chips = document.getElementById('chatChips');
  var input = document.getElementById('chatInput');
  var started = false;

  function addMsg(txt, who, isHtml){
    var el = document.createElement('div');
    el.className = 'cmsg ' + who;
    if(isHtml) el.innerHTML = txt; else el.textContent = txt;
    msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight;
  }
  function typing(cb, delay){
    var t = document.createElement('div'); t.className = 'ctyping';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function(){ t.remove(); cb(); }, delay || 700);
  }
  function setChips(list){
    chips.innerHTML = '';
    list.forEach(function(c){
      var b = document.createElement('button'); b.textContent = c;
      b.addEventListener('click', function(){ send(c); });
      chips.appendChild(b);
    });
  }
  function link(href, txt){ return '<a href="' + ROOT + href + '">' + txt + '</a>'; }

  var VERT = [
    [/רכב/, 'ביטוח רכב'], [/ביטוח/, 'ביטוח'], [/משכנת/, 'משכנתאות'], [/פיננס/, 'פיננסים'],
    [/השקע/, 'השקעות'], [/(החזר|מס הכנסה|\\bמס\\b)/, 'החזרי מס'],
    [/(עסק).*(הלווא)|(הלווא).*(עסק)/, 'הלוואות לעסקים'], [/(קופה|פנסיה)/, 'הלוואות כנגד קופה או פנסיה'],
    [/(נכס|מסורב)/, 'הלוואות כנגד נכס למסורבים'], [/הלווא/, 'הלוואה לכל מטרה'],
    [/bdi/i, 'מחיקת BDI'], [/(כספים אבודים|איתור כספ)/, 'איתור כספים אבודים'], [/פורקס/, 'פורקס'],
    [/(עורכי דין|עו"ד|עורך דין)/, 'עורכי דין'], [/השתל/, 'השתלות שיניים'], [/שיניים/, 'רופאי שיניים'],
    [/אסתטיק/, 'אסתטיקה רפואית'], [/לייזר/, 'הסרת שיער בלייזר'], [/(רפואה משלימה|אלטרנטיב)/, 'רפואה משלימה'],
    [/nlp/i, 'NLP'], [/רופא/, 'רופאים ובעיות רפואיות'],
    [/(אתר|אתרים)/, 'בניית אתרים'], [/שיפוצ/, 'שיפוצים'], [/הובל/, 'הובלות'], [/אדריכל/, 'אדריכלים'],
    [/אירוע/, 'הפקות אירועים'], [/(קורס|מכלל)/, 'קורסים ומכללות'], [/תקשורת/, 'תקשורת'], [/שיווק עסק/, 'שיווק עסקים']
  ];
  function findPrice(t){
    for (var i = 0; i < VERT.length; i++) {
      if (VERT[i][0].test(t)) {
        var name = VERT[i][1];
        for (var j = 0; j < PRICES.length; j++) if (PRICES[j][0] === name) return [name, PRICES[j][1]];
      }
    }
    return null;
  }

  function answer(t){
    t = t.trim();
    var low = t.toLowerCase();
    var pr = findPrice(low);
    var phoneMatch = t.replace(/[^0-9]/g, '');
    if (phoneMatch.length >= 9 && phoneMatch.length <= 13) {
      if(window.blSendLead) window.blSendLead({ type: 'צ׳אט באלי', phone: t.trim(), consent: 'כן (מסר טלפון בצ׳אט)' });
      var wamsg = 'היי, השארתי את המספר שלי בצ׳אט באתר: ' + t + '. אשמח שתחזרו אליי לגבי לידים.';
      return { html: 'מעולה! לוחצים על הקישור ואנחנו כבר מדברים 👇<br><a href="' + WA + '?text=' + encodeURIComponent(wamsg) + '" target="_blank" rel="noopener"><b>שליחת הפרטים בוואטסאפ ←</b></a>', chips: ['איך זה עובד?', 'כמה עולה ליד?'] };
    }
    if (/(מחיר|עולה|עלות|כמה)/.test(low) && pr) {
      return { html: 'ליד בתחום <b>' + pr[0] + '</b> עולה אצלנו <b>' + pr[1] + '</b>, בלעדי לכם בלבד ומשלמים פר ליד.<br>' + link('מחירון-לידים/', 'למחירון המלא 2026 ←'), chips: ['רוצה פיילוט ניסיון', 'איך זה עובד?', 'דברו איתי'] };
    }
    if (pr && /(ליד|לקוח)/.test(low)) {
      return { html: 'יש לנו לידים חמים בתחום <b>' + pr[0] + '</b> בטווח <b>' + pr[1] + '</b> לליד, מסוננים ובלעדיים.<br>' + link('מחירון-לידים/', 'למחירון המלא ←'), chips: ['רוצה פיילוט ניסיון', 'איך זה עובד?'] };
    }
    if (/(מחיר|מחירון|עולה|עלות|כמה)/.test(low)) {
      return { html: 'המחיר תלוי בתחום: מ-10 ₪ ועד 250 ₪ לליד. באיזה תחום אתם? (ביטוח, משכנתאות, הלוואות, החזרי מס...)<br>' + link('מחירון-לידים/', 'או צפו במחירון המלא ←'), chips: ['ביטוח', 'משכנתאות', 'הלוואות', 'החזרי מס'] };
    }
    if (/(איך|תהליך|עובד)/.test(low)) {
      return { html: 'פשוט: 1️⃣ מגדירים יחד את הלקוח המדויק. 2️⃣ אנחנו מריצים קמפיינים בפלטפורמות המובילות. 3️⃣ כל פנייה מסוננת ומאומתת. 4️⃣ הליד מגיע אליכם בזמן אמת, בלעדי לכם.<br>' + link('חברת-לידים/', 'עוד על המודל שלנו ←'), chips: ['כמה עולה ליד?', 'רוצה פיילוט ניסיון'] };
    }
    if (/בלעדי/.test(low)) {
      return { text: 'כן! כל ליד נמכר לעסק אחד בלבד. אין "ידיים שניות" ואין תחרות עם עסקים אחרים על אותו לקוח.', chips: ['כמה עולה ליד?', 'רוצה פיילוט ניסיון'] };
    }
    if (/(פסול|זיכוי|לא רלוונטי)/.test(low)) {
      return { text: 'ליד לא רלוונטי? יש מנגנון זיכוי מסודר שנקבע מראש, בדרך כלל 0%-15% מהיקף ההזמנה. אתם משלמים רק על לידים אמיתיים.', chips: ['איך זה עובד?', 'דברו איתי'] };
    }
    if (/(פיילוט|ניסיון|להתחיל|מתחיל)/.test(low)) {
      return { html: 'מעולה! אפשר להתחיל בפיילוט קטן, לראות את איכות הלידים בפועל ורק אז להגדיל. השאירו כאן מספר טלפון ונחזור אליכם, או ' + '<a href="' + WA + '" target="_blank" rel="noopener"><b>דברו איתנו עכשיו בוואטסאפ ←</b></a>', chips: ['איך זה עובד?'] };
    }
    if (/(וואטסאפ|ואטסאפ|טלפון|נציג|אנושי|בן אדם|לדבר|חייג)/.test(low)) {
      return { html: 'בשמחה! 📞 <b>' + PHONE + '</b> (צחי) או <a href="' + WA + '" target="_blank" rel="noopener"><b>וואטסאפ ←</b></a>. אפשר גם להשאיר כאן מספר ונחזור אליכם.', chips: ['כמה עולה ליד?'] };
    }
    if (/(כתובת|איפה|משרד)/.test(low)) {
      return { text: 'המשרד שלנו: אצ"ל 34, רמת גן. אבל את רוב העבודה אנחנו עושים בדיגיטל 😉', chips: ['שעות פעילות', 'דברו איתי'] };
    }
    if (/שעות/.test(low)) {
      return { text: 'שעות המשרד: ימים א׳-ה׳, 09:00-16:00. פניות דחופות מטופלות גם מחוץ לשעות, אנחנו זמינים 24/7.', chips: ['דברו איתי'] };
    }
    if (/(שיווק|קידום|גוגל|פייסבוק|אינסטגרם|סאו|seo|קמפיין|אתר חדש|אפליקצי|crm|סוכן)/.test(low)) {
      return { html: 'מעבר ללידים אנחנו נותנים מעטפת דיגיטל מלאה: קידום ממומן, SEO, בניית אתרים ודפי נחיתה, מערכות CRM, אוטומציות וסוכני AI.<br>' + link('שיווק-דיגיטלי/', 'לכל השירותים ←'), chips: ['כמה עולה ליד?', 'דברו איתי'] };
    }
    if (/(מאמר|מגזין|מדריך|ללמוד)/.test(low)) {
      return { html: 'יש לנו מגזין עם עשרות מדריכים על לידים, המרות ושיווק: ' + link('עדכונים-חמים/', 'למגזין ←'), chips: ['כמה עולה ליד?'] };
    }
    if (/cpl/i.test(low)) {
      return { html: 'CPL = Cost Per Lead. משלמים רק על ליד מאומת שהתעניין בכם, לא על חשיפות ולא על קליקים. ' + link('חברת-לידים/', 'ככה זה עובד ←'), chips: ['כמה עולה ליד?'] };
    }
    if (/(היי|שלום|הי\\b|בוקר|ערב|מה נשמע|מה קורה)/.test(low)) {
      return { text: 'היי! 👋 אני באלי, העוזר הדיגיטלי של באלי ליד. אני יודע הכל על לידים, מחירים ותהליך העבודה. מה מעניין אתכם?', chips: ['כמה עולה ליד?', 'איך זה עובד?', 'רוצה פיילוט ניסיון'] };
    }
    if (/(תודה|מעולה|סבבה|אחלה)/.test(low)) {
      return { text: 'בכיף! 🙌 אם תרצו, השאירו כאן מספר טלפון ונחזור אליכם עם הצעה מסודרת.', chips: ['דברו איתי', 'כמה עולה ליד?'] };
    }
    return { html: 'שאלה טובה! הכי מהר יהיה לשאול את צחי ישירות: <a href="' + WA + '" target="_blank" rel="noopener"><b>וואטסאפ ←</b></a> או השאירו כאן מספר טלפון ונחזור אליכם.<br>אפשר גם לשאול אותי על מחירים, התהליך, פיילוט או השירותים שלנו.', chips: ['כמה עולה ליד?', 'איך זה עובד?', 'רוצה פיילוט ניסיון'] };
  }

  function send(t){
    if(!t) return;
    addMsg(t, 'user'); input.value = '';
    setChips([]);
    typing(function(){
      var a = answer(t);
      if(a.html) addMsg(a.html, 'bot', true); else addMsg(a.text, 'bot');
      setChips(a.chips || []);
    }, 550 + Math.random() * 500);
  }
  function openChat(greeting){
    chatBox.classList.add('open'); chatBtn.setAttribute('aria-expanded', 'true');
    if(!started){
      started = true;
      typing(function(){
        addMsg(greeting || 'היי! 👋 אני באלי, העוזר הדיגיטלי. אשמח לעזור עם מחירים, תהליך העבודה או כל שאלה. במה מדובר?', 'bot');
        setChips(['כמה עולה ליד?', 'איך זה עובד?', 'רוצה פיילוט ניסיון', 'דברו איתי']);
      }, 600);
    }
  }
  chatBtn.addEventListener('click', function(){
    if(chatBox.classList.contains('open')){ chatBox.classList.remove('open'); chatBtn.setAttribute('aria-expanded','false'); }
    else openChat();
  });
  document.getElementById('chatClose').addEventListener('click', function(){ chatBox.classList.remove('open'); chatBtn.setAttribute('aria-expanded','false'); });
  document.getElementById('chatSend').addEventListener('click', function(){ send(input.value.trim()); });
  input.addEventListener('keydown', function(e){ if(e.key === 'Enter') send(input.value.trim()); });

  /* ============ Conversion popups ============ */
  var popOv = document.getElementById('popOv'), toast = document.getElementById('toast');
  var isMobile = window.matchMedia('(max-width: 860px)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function seen(k){ try { return sessionStorage.getItem('bl_pop_' + k); } catch(e){ return '1'; } }
  function mark(k){ try { sessionStorage.setItem('bl_pop_' + k, '1'); } catch(e){} }
  function modalShown(){ return seen('modal'); }

  function showModal(kind){
    if(modalShown() || document.querySelector('.mnav.open') || chatBox.classList.contains('open')) return;
    mark('modal'); mark(kind);
    var ey = document.getElementById('popEyebrow'), ti = document.getElementById('popTitle'), tx = document.getElementById('popText');
    if(kind === 'exit'){
      ey.textContent = 'רגע לפני שיוצאים';
      ti.innerHTML = 'הלידים הבאים שלכם <span class="gw">כבר מחכים</span>';
      tx.textContent = 'התחילו בפיילוט ניסיון קטן, תראו את איכות הלידים בעצמכם, ורק אז תחליטו. השאירו טלפון ונחזור אליכם עוד היום.';
    } else {
      ey.textContent = 'מתלבטים?';
      ti.innerHTML = 'שווה לדבר איתנו <span class="gw">לפני שסוגרים עם מישהו אחר</span>';
      tx.textContent = 'תוך שיחה אחת תדעו בדיוק כמה עולה ליד בתחום שלכם ומתי מתחילים. בלי התחייבות.';
    }
    popOv.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){ popOv.classList.remove('open'); document.body.style.overflow = ''; }
  document.getElementById('popX').addEventListener('click', closeModal);
  popOv.addEventListener('click', function(e){ if(e.target === popOv) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeModal(); toast.classList.remove('open'); } });
  document.getElementById('popForm').addEventListener('submit', function(e){
    e.preventDefault();
    var consent = document.querySelector('#popOv .consent input');
    if(consent && !consent.checked){ consent.focus(); return; }
    var ph = document.getElementById('popPhone').value.replace(/[^0-9+]/g, '');
    if(ph.length < 9) return;
    if(window.blSendLead) window.blSendLead({ type: 'פופאפ יציאה', phone: document.getElementById('popPhone').value.trim(), consent: 'כן' });
    var msg = 'היי, השארתי טלפון באתר (' + document.getElementById('popPhone').value.trim() + '). אשמח לשמוע על פיילוט לידים לעסק שלי.';
    window.open(WA + '?text=' + encodeURIComponent(msg), '_blank');
    closeModal();
  });

  function showToast(title, text, withChat){
    if(seen('toast') || modalShown() || chatBox.classList.contains('open')) return;
    mark('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastText').textContent = text;
    var row = document.getElementById('toastRow');
    row.innerHTML = '';
    if(withChat){
      var b = document.createElement('button'); b.className = 't-gold'; b.textContent = '💬 דברו עם באלי';
      b.addEventListener('click', function(){ toast.classList.remove('open'); openChat('היי! ראיתי שאתם מסתובבים פה כבר כמה דקות 😊 אשמח לעזור, מה מעניין אתכם?'); });
      row.appendChild(b);
    }
    var a = document.createElement('a'); a.className = withChat ? 't-ghost' : 't-gold'; a.textContent = 'וואטסאפ';
    a.href = WA; a.target = '_blank'; a.rel = 'noopener';
    row.appendChild(a);
    if(!withChat){
      var c = document.createElement('a'); c.className = 't-ghost'; c.textContent = '${PHONE_TXT}';
      c.href = 'tel:0584700706';
      row.appendChild(c);
    }
    toast.classList.add('open');
    setTimeout(function(){ toast.classList.remove('open'); }, 16000);
  }
  document.getElementById('toastX').addEventListener('click', function(){ toast.classList.remove('open'); });

  if(!reduce){
    /* exit intent: desktop only, armed after 12s */
    if(!isMobile){
      setTimeout(function(){
        document.addEventListener('mouseout', function(e){
          if(!e.relatedTarget && e.clientY <= 0 && !seen('exit')) showModal('exit');
        });
      }, 12000);
    }
    /* time on page: 50s -> gentle toast */
    setTimeout(function(){ showToast('עדיין מתלבטים?', 'קבלו הצעת מחיר לתחום שלכם תוך דקות, בלי התחייבות.', false); }, 50000);
    /* idle 40s -> chat invitation toast */
    var idleTimer = null;
    function resetIdle(){
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function(){
        if(!seen('idle') && !modalShown()){ mark('idle'); showToast('צריכים עזרה?', 'באלי, העוזר הדיגיטלי שלנו, עונה על הכל תוך שניות.', true); }
      }, 40000);
    }
    ['scroll','mousemove','keydown','touchstart'].forEach(function(ev){
      window.addEventListener(ev, resetIdle, { passive: true });
    });
    resetIdle();
  }
})();`;
