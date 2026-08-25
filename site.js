
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

  /* sidebar: like + share */
  var likeBtn = document.getElementById('smLike');
  if(likeBtn){
    var likeCnt = document.getElementById('smLikeCnt');
    function renderLike(){
      var liked = null;
      try { liked = localStorage.getItem('bl_liked'); } catch(e){}
      likeCnt.textContent = (4832 + (liked ? 1 : 0)).toLocaleString('he-IL');
      likeBtn.classList.toggle('liked', !!liked);
    }
    renderLike();
    likeBtn.addEventListener('click', function(){
      try {
        if(localStorage.getItem('bl_liked')) localStorage.removeItem('bl_liked');
        else localStorage.setItem('bl_liked','1');
      } catch(e){}
      renderLike();
    });
  }
  var shareBtn = document.getElementById('smShare');
  if(shareBtn){
    shareBtn.addEventListener('click', function(){
      var u = location.href;
      if(navigator.share){ navigator.share({ title: document.title, url: u }).catch(function(){}); }
      else window.open('https://wa.me/?text=' + encodeURIComponent('שווה הצצה: ' + document.title + ' ' + u), '_blank');
    });
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
})();

(function(){
  "use strict";
  var ROOT = (document.getElementById('chatBox')||{dataset:{}}).dataset.root || '';
  var WA = 'https://wa.me/972584700706';
  var PHONE = '058-4700706';

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
  var PRICES = [["ביטוח","₪10 עד ₪100"],["ביטוח רכב","₪40 עד ₪80"],["משכנתאות","₪50 עד ₪150"],["פיננסים","₪60 עד ₪180"],["השקעות","₪60 עד ₪140"],["החזרי מס","₪15 עד ₪45"],["הלוואה לכל מטרה","₪10 עד ₪45"],["הלוואות לעסקים","₪50 עד ₪90"],["הלוואות כנגד קופה או פנסיה","₪40 עד ₪90"],["הלוואות כנגד נכס למסורבים","₪15 עד ₪100"],["מחיקת BDI","₪20 עד ₪55"],["איתור כספים אבודים","₪15 עד ₪55"],["פורקס","₪75 עד ₪200"],["עורכי דין","₪50 עד ₪110"],["רופאי שיניים","₪80 עד ₪150"],["השתלות שיניים","₪45 עד ₪100"],["רופאים ובעיות רפואיות","₪50 עד ₪130"],["אסתטיקה רפואית","₪60 עד ₪120"],["הסרת שיער בלייזר","₪40 עד ₪90"],["רפואה משלימה","₪40 עד ₪70"],["NLP","₪50 עד ₪150"],["בניית אתרים","₪70 עד ₪175"],["שיווק עסקים","₪30 עד ₪90"],["שיפוצים","₪100 עד ₪250"],["הובלות","₪60 עד ₪100"],["אדריכלים","₪40 עד ₪90"],["הפקות אירועים","₪40 עד ₪100"],["קורסים ומכללות","₪50 עד ₪150"],["תקשורת","₪40 עד ₪70"]];
  var chatBtn = document.getElementById('chatBtn'), chatBox = document.getElementById('chatBox');
  var msgs = document.getElementById('chatMsgs'), chips = document.getElementById('chatChips');
  var input = document.getElementById('chatInput');
  var started = false;

  function esc(s){ var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
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
    [/השקע/, 'השקעות'], [/(החזר|מס הכנסה|\bמס\b)/, 'החזרי מס'],
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
    if (/(היי|שלום|הי\b|בוקר|ערב|מה נשמע|מה קורה)/.test(low)) {
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
    var ph = document.getElementById('popPhone').value.replace(/[^0-9+]/g, '');
    if(ph.length < 9) return;
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
      var c = document.createElement('a'); c.className = 't-ghost'; c.textContent = '058-4700706';
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
})();