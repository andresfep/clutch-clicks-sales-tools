/* =====================================================================
   Clutch Clicks — Growth Plan Call script  |  app logic
   ---------------------------------------------------------------------
   Vanilla JS, no build step. State is saved to localStorage after every
   change so a refresh mid-call loses nothing. Content lives in
   js/script-content.js.
   ===================================================================== */
(function () {
  'use strict';

  const LS_KEY = 'cc_growth_call_v1';
  const P = window.CC_PRICING;
  const STAGES = window.CC_STAGES;
  const SECTIONS = window.CC_SECTIONS;
  const LINE = window.CC_STRAIGHT_LINE;
  const ORDER = SECTIONS.flatMap(p => p.steps);
  const REQUIRED = window.CC_CHECKOUT_REQUIRES;
  const METRICS = window.CC_METRICS;
  const LINES = window.CC_LINES;

  /* ------------------------------------------------------------------
     State
     ------------------------------------------------------------------ */
  const DEFAULT = () => ({
    v: 1,
    callType: 'initial',
    section: 'discovery',
    done: {},
    na: {},
    prospect: { name: '', shop: '', email: '', phone: '', city: '', trade: 'auto repair' },
    numbers: {
      multiShop: '', watched: '', decisionMaker: '', otherDM: '', followupContext: '',
      hasWebsite: '', leadsNow: '', missedCalls: '', aov: '', conservative: '',
      missedCallsMatter: '', reviewProcess: '', software: '', runningAds: '',
      otherQuestions: '', onboardingSlot: '',
    },
    asked: {},
    openQ: null,
    earlyYes: false,
    gmb: {},
    fourThings: {},
    payment: {},
    offer: '',
    outcome: '',
    post: { sendRecap: '', followupAt: '', reason: '', ghlStage: '', grandfathered: '' },
    notes: '',
    returnTo: null,
    timer: { running: false, startedAt: null, acc: 0 },
    sectionTimes: {},
    sectionEnteredAt: null,
    drawer: null,
    drawerTab: 'numbers',
    openAcc: {},
    startedAtISO: null,
  });

  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return DEFAULT();
      const saved = JSON.parse(raw);
      const d = DEFAULT();
      // shallow-merge nested objects so new fields get defaults
      if (saved.stage && !saved.section) saved.section = (SECTIONS.find(x => x.steps.includes(saved.stage)) || SECTIONS[0]).id;
      return Object.assign(d, saved, {
        prospect: Object.assign(d.prospect, saved.prospect || {}),
        numbers: Object.assign(d.numbers, saved.numbers || {}),
        post: Object.assign(d.post, saved.post || {}),
        timer: Object.assign(d.timer, saved.timer || {}),
      });
    } catch (e) { return DEFAULT(); }
  }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const toNum = v => { const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g, '')); return isFinite(n) ? n : 0; };
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const mult = n => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, '') + 'x';
  const pad = n => String(n).padStart(2, '0');
  const fmtTime = s => { s = Math.max(0, Math.floor(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
  const isNA = id => !!S.na[id] || (id === 'watch' && S.callType === 'followup');
  const isDone = id => !!S.done[id];
  const sectionById = id => SECTIONS.find(p => p.id === id);
  const sectionOf = stepId => SECTIONS.find(p => p.steps.includes(stepId));
  const curSection = () => sectionById(S.section) || SECTIONS[0];
  const sectionSteps = sec => sec.steps.filter(id => !isNA(id));
  const sectionDone = sec => sec.id !== 'post' && sectionSteps(sec).every(isDone);
  const nextLineSection = () => LINE.find(id => !sectionDone(sectionById(id))) || 'post';
  const owed = () => REQUIRED.filter(id => !isDone(id));
  const metricsLeft = () => METRICS.filter(m => !isDone(m.id));

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* Field values used by {{templates}} */
  function fieldValue(key) {
    const r = roi();
    switch (key) {
      case 'name': return S.prospect.name;
      case 'shop': return S.prospect.shop;
      case 'city': return S.prospect.city;
      case 'trade': return S.prospect.trade;
      case 'software': return S.numbers.software;
      case 'aov': return S.numbers.aov ? money(toNum(S.numbers.aov)) : '';
      case 'conservative': return r.cons ? money(r.cons) : '';
      case 'monthly': return r.cons ? money(r.monthly) : '';
      case 'multiple': return r.cons ? mult(r.multiple) : '';
      case 'low': return r.cons ? money(r.cons) : '';
      case 'high': return r.cons ? money(r.cons * 2) : '';
      case 'multLow': return r.cons ? mult(r.cons / P.monthly) : '';
      case 'multHigh': return r.cons ? mult(r.cons * 2 / P.monthly) : '';
      case 'otherDM': return S.numbers.otherDM;
      case 'onboardingSlot': return S.numbers.onboardingSlot;
      default: return '';
    }
  }
  const FIELD_PLACEHOLDER = {
    name: 'name', shop: 'shop name', city: 'city', trade: 'trade', software: 'software',
    aov: '$___', conservative: '$___', monthly: '$___', multiple: '__x', low: '$___', high: '$___',
    multLow: '__x', multHigh: '__x', otherDM: 'partner', onboardingSlot: 'tomorrow, morning or evening',
  };
  function tpl(text) {
    return esc(text).replace(/\{\{(\w+)\}\}/g, (_, k) => {
      const v = fieldValue(k);
      return v
        ? `<span class="field filled" data-key="${k}">${esc(v)}</span>`
        : `<span class="field" data-key="${k}">${esc(FIELD_PLACEHOLDER[k] || '___')}</span>`;
    });
  }

  /* ROI math — the Halving Rule, with the low-ticket exception. */
  function roi() {
    const aov = toNum(S.numbers.aov);
    const low = aov > 0 && aov < 150;
    const defaultCons = aov ? (low ? 300 : Math.max(50, Math.round(aov / 2 / 10) * 10)) : 0;
    const cons = S.numbers.conservative !== '' ? toNum(S.numbers.conservative) : defaultCons;
    const monthly = cons * 2; // one missed call every 2 weeks
    return { aov, low, cons, defaultCons, monthly, multiple: monthly / P.monthly, annual: monthly * 12, annualCost: P.monthly * 12 };
  }

  /* ------------------------------------------------------------------
     Timer
     ------------------------------------------------------------------ */
  function totalElapsed() {
    return S.timer.acc + (S.timer.running && S.timer.startedAt ? (Date.now() - S.timer.startedAt) / 1000 : 0);
  }
  function sectionElapsed(id) {
    let t = S.sectionTimes[id] || 0;
    if (id === S.section && S.timer.running && S.sectionEnteredAt) t += (Date.now() - S.sectionEnteredAt) / 1000;
    return t;
  }
  function commitSectionTime() {
    if (S.timer.running && S.sectionEnteredAt) {
      S.sectionTimes[S.section] = (S.sectionTimes[S.section] || 0) + (Date.now() - S.sectionEnteredAt) / 1000;
      S.sectionEnteredAt = Date.now();
    }
  }
  function timerStart() {
    if (S.timer.running) return;
    S.timer.running = true; S.timer.startedAt = Date.now(); S.sectionEnteredAt = Date.now();
    if (!S.startedAtISO) S.startedAtISO = new Date().toISOString();
    save(); renderTimer(); $('#timerToggle').textContent = 'Pause';
  }
  function timerPause() {
    if (!S.timer.running) return;
    commitSectionTime();
    S.timer.acc = totalElapsed(); S.timer.running = false; S.timer.startedAt = null; S.sectionEnteredAt = null;
    save(); renderTimer(); $('#timerToggle').textContent = 'Resume';
  }
  function timerReset() {
    S.timer = { running: false, startedAt: null, acc: 0 }; S.sectionTimes = {}; S.sectionEnteredAt = null;
    save(); renderTimer(); renderSidebar(); $('#timerToggle').textContent = 'Start';
  }
  function renderTimer() {
    $('#timerTotal').textContent = fmtTime(totalElapsed());
    const sec = curSection();
    const el = $('#timerStage');
    if (sec.target) {
      const e = sectionElapsed(sec.id);
      el.textContent = 'section ' + fmtTime(e) + ' / ' + fmtTime(sec.target);
      el.classList.toggle('over', e > sec.target);
    } else { el.textContent = ''; el.classList.remove('over'); }
  }
  setInterval(() => {
    if (!S.timer.running) return;
    renderTimer();
    // keep sidebar stage time fresh without a full re-render
    const row = $(`.step[data-section="${S.section}"] .step-time`);
    if (row) {
      const e = sectionElapsed(S.section);
      row.textContent = fmtTime(e);
      row.classList.toggle('over', curSection().target && e > curSection().target);
    }
  }, 1000);

  /* ------------------------------------------------------------------
     Navigation + checklist
     ------------------------------------------------------------------ */
  /* goto(sectionId | stepId). A step id lands on its section and scrolls
     to that part. opts.returnTo = { section, anchor } for detours. */
  let pendingAnchor = null;
  function goto(id, opts) {
    const sec = sectionById(id) || sectionOf(id);
    if (!sec) return;
    commitSectionTime();
    S.section = sec.id;
    if (S.timer.running) S.sectionEnteredAt = Date.now();
    if (opts && 'returnTo' in opts) S.returnTo = opts.returnTo;
    pendingAnchor = sectionById(id) ? (opts && opts.anchor) || null : id;
    save(); render();
    scrollToAnchor();
  }
  function scrollToAnchor() {
    if (pendingAnchor) {
      const el = document.getElementById('step-' + pendingAnchor);
      pendingAnchor = null;
      if (el && sectionSteps(curSection()).length > 1) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function nextSection(fromId) {
    const i = SECTIONS.findIndex(p => p.id === fromId);
    for (let j = i + 1; j < SECTIONS.length; j++) if (!sectionDone(SECTIONS[j])) return SECTIONS[j].id;
    return 'post';
  }
  function markDone(id, val) {
    S.done[id] = val === undefined ? !S.done[id] : !!val;
    if (S.done[id]) delete S.na[id];
    save();
  }
  function markSectionDone(sec, val) {
    sec.steps.forEach(id => { if (!isNA(id)) S.done[id] = val; });
    save();
  }
  /* A metric was just covered: go back to the detour origin, or move on. */
  function metricCovered(id) {
    markDone(id, true);
    if (metricsLeft().length === 0) S.done.bridge = true;
    if (S.returnTo) {
      const back = S.returnTo; S.returnTo = null;
      toast(`${METRICS.find(m => m.id === id).short} covered — back to the straight line`);
      return goto(back.section, { anchor: back.anchor });
    }
    save(); render();
    const left = metricsLeft();
    if (left.length) { pendingAnchor = left[0].id; scrollToAnchor(); }
    else toast('All three metrics covered — on to the money');
  }
  function completeAndAdvance() {
    const sec = curSection();
    markSectionDone(sec, true);
    goto(nextSection(sec.id));
  }

  /* ------------------------------------------------------------------
     Render — top bar + phases
     ------------------------------------------------------------------ */
  function renderTop() {
    document.querySelectorAll('.calltype-btn').forEach(b => b.classList.toggle('active', b.dataset.value === S.callType));
    $('#phases').innerHTML = SECTIONS.map(p => {
      return `<button class="phase-tab ${p.id === S.section ? 'active' : ''} ${sectionDone(p) ? 'done' : ''}" data-action="goto" data-value="${p.id}">
        <span class="pt-label">${p.id === 'post' ? '' : p.num + ' · '}${p.label}</span><span class="pt-time">${p.time}</span></button>`;
    }).join('');
    $('#timerToggle').textContent = S.timer.running ? 'Pause' : (S.timer.acc > 0 ? 'Resume' : 'Start');
    $('.layout').classList.toggle('drawer-open', !!S.drawer);
    document.querySelectorAll('.drawer-btn').forEach(b => b.classList.toggle('active', S.drawer && b.dataset.value === S.drawerTab));
  }

  /* ------------------------------------------------------------------
     Render — sidebar checklist
     ------------------------------------------------------------------ */
  function renderSidebar() {
    const line = SECTIONS.filter(p => p.id !== 'post');
    const doneCount = line.filter(sectionDone).length;
    const pct = Math.round(doneCount / line.length * 100);
    const o = owed();
    let html = `<div class="side-title"><span>The straight line</span><span>${doneCount}/${line.length}</span></div>
      <div class="side-progress"><span style="width:${pct}%"></span></div>`;
    html += SECTIONS.map(sec => {
      const done = sectionDone(sec);
      const e = sectionElapsed(sec.id);
      const over = sec.target && e > sec.target;
      let row = `<div class="step ${sec.id === S.section ? 'current' : ''} ${done ? 'done' : ''}" data-section="${sec.id}">
        <button class="step-check" data-action="toggleSection" data-value="${sec.id}" title="${done ? 'Mark not done' : 'Mark done'}">✓</button>
        <button class="step-title" style="all:unset;cursor:pointer" data-action="goto" data-value="${sec.id}">${sec.id === 'post' ? '' : sec.num + '. '}${esc(sec.title)}<small>${esc(sec.time)}</small></button>
        <span class="step-time ${over ? 'over' : ''}">${e > 0 ? fmtTime(e) : ''}</span>
      </div>`;
      if (sec.id === 'bridge') {
        row += `<div class="substeps">${METRICS.map(m => `
          <div class="substep ${isDone(m.id) ? 'done' : ''}">
            <button class="sub-check" data-action="toggleDone" data-value="${m.id}" title="Toggle covered">✓</button>
            <button class="sub-title" data-action="goto" data-value="${m.id}"><span class="k">${m.short}</span> ${esc(m.label)}</button>
          </div>`).join('')}</div>`;
      }
      return row;
    }).join('');
    html += `<div class="side-owed ${o.length ? '' : 'clear'}"><h4>Owed before the close</h4>`;
    html += o.length
      ? `<ul>${o.map(id => `<li><button data-action="goto" data-value="${id}">${esc(shortTitle(id))}</button></li>`).join('')}</ul>`
      : `<div class="ok">✓ Everything taught. Clear to close.</div>`;
    html += `</div>
      <div class="side-line"><h4>Objection came up?</h4>Answer it, then fall back to the straight line — the first section that isn't done yet.
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-action="drawer" data-value="objections">Open objections</button>
        <button class="btn sm ghost" data-action="backToLine">Back to the line →</button></div></div>`;
    $('#sidebar').innerHTML = html;
  }
  function shortTitle(id) {
    const m = METRICS.find(x => x.id === id);
    if (m) return m.short + ' · ' + m.label;
    return { money: 'The money', gmb: 'GMB diagnosis' }[id] || STAGES[id].title;
  }

  /* ------------------------------------------------------------------
     Render — blocks
     ------------------------------------------------------------------ */
  function renderBlocks(blocks) {
    return blocks.map(renderBlock).join('');
  }
  function renderBlock(b) {
    switch (b.type) {
      case 'say':
        return `<div class="block"><div class="say-box"><div class="say-label">${esc(b.label || 'Say this')}</div><div class="say-text">${tpl(b.text)}</div></div></div>`;
      case 'ask':
        return `<div class="block"><div class="say-box ask"><div class="say-label">${esc(b.label || 'Ask')}</div><div class="say-text">${tpl(b.text)}</div></div></div>`;
      case 'stop':
        return `<div class="block"><div class="stop-line">${tpl(b.text)}</div></div>`;
      case 'tip':
        return `<div class="block"><div class="tip-line">${tpl(b.text)}</div></div>`;
      case 'warn':
        return `<div class="block"><div class="warn-box"><strong>Watch for</strong>${tpl(b.text)}</div></div>`;
      case 'rule':
        return `<div class="block"><div class="rule-box">${b.title ? `<h4>${esc(b.title)}</h4>` : ''}${b.text ? tpl(b.text) : ''}${b.items ? `<ol>${b.items.map(i => `<li>${tpl(i)}</li>`).join('')}</ol>` : ''}</div></div>`;
      case 'capture':
        return `<div class="block">${renderCapture(b)}</div>`;
      case 'cond':
        return b.when(S) ? renderBlocks(b.blocks) : '';
      case 'widget':
        return `<div class="block">${(WIDGETS[b.id] || (() => ''))()}</div>`;
      default: return '';
    }
  }
  function renderCapture(b) {
    const val = S.numbers[b.field] != null ? S.numbers[b.field] : '';
    let input;
    if (b.kind === 'choice' || b.kind === 'yesno') {
      const opts = b.options || [['yes', 'Yes'], ['no', 'No']];
      input = `<div class="choices">${opts.map(([v, l]) => `<button class="choice ${val === v ? 'active' : ''}" data-action="setNum" data-field="${b.field}" data-value="${v}">${esc(l)}</button>`).join('')}</div>`;
    } else if (b.kind === 'money') {
      input = `<div class="money"><span>$</span><input type="text" inputmode="decimal" data-num="${b.field}" value="${esc(val)}" placeholder="500" /></div>`;
    } else if (b.kind === 'textarea') {
      input = `<textarea data-num="${b.field}" placeholder="…">${esc(val)}</textarea>`;
    } else {
      input = `<input type="text" data-num="${b.field}" value="${esc(val)}" placeholder="…" />`;
    }
    return `<div class="capture"><label>${tpl(b.label)}</label>${input}</div>`;
  }
  function acc(id, title, bodyHtml) {
    const open = !!S.openAcc[id];
    return `<div class="acc ${open ? 'open' : ''}"><button class="acc-head" data-action="acc" data-value="${id}">${esc(title)}</button>${open ? `<div class="acc-body">${bodyHtml}</div>` : ''}</div>`;
  }
  const sayBox = (label, text, cls) => `<div class="say-box ${cls || ''}"><div class="say-label">${esc(label)}</div><div class="say-text">${tpl(text)}</div></div>`;

  /* ------------------------------------------------------------------
     Widgets — the interactive parts of each stage
     ------------------------------------------------------------------ */
  const WIDGETS = {

    videoRule() {
      const w = S.numbers.watched;
      return `<div class="rule-box"><h4>Video rule</h4>
        <div class="choices" style="margin-top:6px">
          <button class="choice ${w === 'yes' ? 'active' : ''}" data-action="watched" data-value="yes">They watched it → skip the video</button>
          <button class="choice ${w === 'no' ? 'active' : ''}" data-action="watched" data-value="no">They didn't → play it now (4–6 min)</button>
        </div>
        ${w === 'yes' ? `<p style="margin-top:10px;color:var(--green);font-size:13px">✓ Video skipped. Go straight to "What questions came up?"</p>` : ''}
        ${w === 'no' ? `<p style="margin-top:10px;color:var(--text-2);font-size:13px">Play the file — never perform the video live as a screen-share.</p>` : ''}
      </div>`;
    },

    decisionMaker() {
      const dm = S.numbers.decisionMaker;
      return `<div class="cards two">
        <button class="card clickable ${dm === 'primary' ? 'active' : ''}" data-action="setNum" data-field="decisionMaker" data-value="primary">
          <div class="card-title">They decide</div><div class="card-sub">Primary decision maker — standard close track</div></button>
        <button class="card clickable ${dm === 'others' ? 'active' : ''}" data-action="setNum" data-field="decisionMaker" data-value="others">
          <div class="card-title">Others involved</div><div class="card-sub">Champion — get the partner on, or plan the recap</div></button>
      </div>
      ${dm === 'others' ? `<div class="capture" style="margin-top:10px"><label>Who else needs to be comfortable with this?</label><input type="text" data-num="otherDM" value="${esc(S.numbers.otherDM)}" placeholder="Business partner, spouse, co-owner…" /></div>
        <p class="tip-line" style="margin-top:8px">Ask: "Can they join now?" If not, keep running the demo. Closing will remind you to loop them in before the price.</p>` : ''}
      ${dm === 'primary' ? `<p class="tip-line" style="margin-top:8px">Set to Primary DM — Closing shows the standard track.</p>` : ''}`;
    },

    watchTogether() {
      if (S.numbers.watched === 'yes' || isNA('watch')) {
        return `<div class="gate clear"><h4>Skipped</h4>${S.callType === 'followup' ? 'Follow-up calls skip the video.' : 'They already watched the video.'} Nothing to do here.
          <div style="margin-top:10px"><button class="btn primary" data-action="scrollTo" data-value="questions">Go to "What questions came up?" →</button></div></div>`;
      }
      return `<div class="check-list">
        <button class="check-row ${S.numbers.videoPlayed === 'yes' ? 'done' : ''}" data-action="setNum" data-field="videoPlayed" data-value="${S.numbers.videoPlayed === 'yes' ? '' : 'yes'}">
          <span class="box">✓</span><span><span class="t">Play the video file (4–6 minutes)</span><span class="d">Mute yourself. Let it run. Don't narrate over it.</span></span></button>
      </div>
      ${S.numbers.watched !== 'no' ? `<p class="tip-line" style="margin-top:10px">If they did watch it, mark "They watched it" above and this part disappears.</p>` : ''}`;
    },

    questionsList() {
      const items = window.CC_QUESTIONS.map(q => {
        const asked = !!S.asked[q.id];
        const open = S.openQ === q.id;
        const m = METRICS.find(x => x.id === q.leadsTo);
        const mDone = isDone(q.leadsTo);
        return `<div class="q-item ${asked ? 'asked' : ''} ${open ? 'open' : ''}">
          <button class="q-head" data-action="openQ" data-value="${q.id}">
            <span class="q-check" data-action="toggleAsked" data-value="${q.id}" title="Mark as asked">✓</span>
            <span class="q-title">${esc(q.q)}</span>
            <span class="q-leads">→ ${m.short}${mDone ? ' ✓' : ''}</span>
          </button>
          ${open ? `<div class="q-body">
            ${renderBlocks(q.answer)}
            <div class="q-actions">
              <button class="btn sm ${asked ? 'active' : ''}" data-action="toggleAsked" data-value="${q.id}">${asked ? '✓ Asked' : 'Mark asked'}</button>
              ${mDone
                ? `<span class="pill say">${m.short} already covered</span>`
                : `<button class="btn sm primary" data-action="teachMetric" data-value="${q.leadsTo}">Teach ${m.short} now → ${esc(m.label)}</button>`}
              <span class="hint">Teaching it now checks ${m.short} off the ROI Bridge, then brings you back here.</span>
            </div>
          </div>` : ''}
        </div>`;
      }).join('');
      return `<div class="block-label"><span class="pill neutral">The most common questions</span></div>${items}
        <div class="capture" style="margin-top:12px"><label>Other questions they asked (log them for the recap)</label><textarea data-num="otherQuestions" placeholder="e.g. 'Can I see a shop you've done in Texas?'">${esc(S.numbers.otherQuestions)}</textarea></div>`;
    },

    earlyYes() {
      const o = owed();
      return `<div class="warn-box"><strong>⚠ Watch for — the early yes</strong>
        Roughly one in ten prospects will say "sounds good, let's go" right here with no objections. Do not take it and run to checkout. A yes at minute 8 is a $297 deal. The same yes at minute 28, after the ROI math and the listing diagnosis, is the full 3-month special.
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="btn sm ${S.earlyYes ? 'active' : ''}" data-action="earlyYes">${S.earlyYes ? '✓ Flagged: they said yes early' : 'They just said "let\'s go" early'}</button>
        </div>
        ${S.earlyYes ? `<div style="margin-top:12px">${sayBox('Say this', LINES.earlyYes)}
          <p style="margin-top:10px;font-size:13px">Then run these compressed before any price: ${o.length ? o.map(id => `<button class="choice" data-action="goto" data-value="${id}" style="margin:2px 4px 2px 0">${esc(shortTitle(id))}</button>`).join('') : '<span style="color:var(--green)">all covered ✓</span>'}</p></div>` : ''}
      </div>`;
    },

    questionsDone() {
      return `<div class="say-box ask"><div class="say-label">After every answer</div><div class="say-text">"Does that make sense? … Any other questions?"</div></div>
        <div class="stage-actions"><button class="btn primary" data-action="questionsDone">No more questions → ROI Bridge</button></div>`;
    },

    metricStatus() {
      const left = metricsLeft();
      const doneList = METRICS.filter(m => isDone(m.id));
      let html = `<div class="chips">${METRICS.map(m => `<button class="chip ${isDone(m.id) ? 'done' : ''}" data-action="scrollTo" data-value="${m.id}"><span class="k">${m.short}</span>${esc(m.label)}${isDone(m.id) ? ' ✓' : ''}</button>`).join('')}</div>`;
      if (doneList.length && left.length) {
        html += `<div style="margin-top:14px">${sayBox('You already covered ' + doneList.map(m => m.short).join(' & ') + ' during their questions — bridge like this',
          `"We actually touched on ${doneList.map(m => m.label.toLowerCase()).join(' and ')} already when you asked about it. Let me tie it together with the one we haven't covered — ${left[0].label.toLowerCase()}."`)}</div>`;
      }
      html += `<div class="stage-actions">`;
      if (left.length) {
        html += `<button class="btn primary" data-action="scrollTo" data-value="${left[0].id}">${doneList.length ? 'Continue with ' : 'Start with '}${left[0].short} → ${esc(left[0].label)} ↓</button>`;
      } else {
        html += `<span class="pill say">All three metrics covered</span><button class="btn primary" data-action="bridgeDone">Show them the money →</button>`;
      }
      html += `</div>`;
      return html;
    },

    miniMath() {
      const r = roi();
      return `<div class="math"><div class="block-label"><span class="pill ask">If missed calls matter to them — run it right here</span></div>
        ${sayBox('Say this', `"You mentioned earlier your average order value is {{aov}} — let's call it {{conservative}} to be conservative. We just talked about one of our features, the Missed Call Text-Back. Now if all we did was save you one missed call every 2 weeks, that's {{monthly}} a month — you would still be {{multiple}} on a $297 investment. That doesn't include the smart website we build for you, the leads we capture, or the reviews we help you get. Can you see how easy it is to understand ROI?"`)}
        <p class="tip-line" style="margin-top:10px">The Money repeats this math with the full sequence. ${r.low ? 'Ticket is under $150 — The Money swaps in the category range.' : ''}</p></div>`;
    },

    dismissChannel() {
      return acc('dismiss', 'Conditional — they dismiss phone calls OR form fills',
        `<p class="tip-line">Use only if they push back on one of the two channels — "form fills have never been money to me" or "I'm good at capturing people on the phone."</p>
         <div style="margin-top:10px">${sayBox('Say this', LINES.dismissChannel)}</div>
         <p class="tip-line" style="margin-top:10px">Why it works: it never tells the owner he's wrong about his own business. It just shows him he's covering half the market.</p>`);
    },

    moneyMath() {
      const r = roi();
      const matter = S.numbers.missedCallsMatter;
      let html = `<div class="math" id="moneyWidget">`;
      if (!r.aov) {
        html += `<div class="warn-box" style="margin-bottom:14px"><strong>No ticket size captured</strong>You need their average ticket before the money math. Ask it now:
          <div style="margin-top:8px">${sayBox('Say this', '"If I were to ask you, for anyone that walks through your doors today, what would you say your average ticket size is?"')}</div></div>`;
      }
      html += `<div class="cards two" style="margin-bottom:4px">
        <div class="capture"><label>Their average ticket</label><div class="money"><span>$</span><input type="text" inputmode="decimal" data-num="aov" value="${esc(S.numbers.aov)}" placeholder="500" /></div></div>
        <div class="capture"><label>Conservative number (halving rule${r.low ? ' — low-ticket override' : ''})</label><div class="money"><span>$</span><input type="text" inputmode="decimal" data-num="conservative" value="${esc(S.numbers.conservative)}" placeholder="${r.defaultCons || 250}" /></div></div>
      </div>
      <div class="math-toggle"><span class="lbl">Missed calls important to them?</span>
        <button class="choice ${matter === 'yes' ? 'active' : ''}" data-action="setNum" data-field="missedCallsMatter" data-value="yes">Yes</button>
        <button class="choice ${matter === 'no' ? 'active' : ''}" data-action="setNum" data-field="missedCallsMatter" data-value="no">Not really</button>
      </div>
      <div id="mathStats">${mathStats(r, matter)}</div>`;
      if (r.low) {
        html += `<div style="margin-top:14px"><div class="warn-box"><strong>Ticket too low to halve</strong>Replace it with the category range instead. Get the verbal agreement before you run the math.
          <div style="margin-top:8px">${sayBox('Say this', LINES.lowTicket)}</div></div></div>`;
      }
      if (matter === 'no') {
        html += `<div style="margin-top:14px">${sayBox('Word-for-word — missed calls are NOT important to them',
          `"You mentioned earlier your average order value is around {{aov}}. Okay. Most shops range from $500 to $5,000+ depending on the job. Now, if all we did was help you land one to two extra customers a month — call it {{conservative}} each to be conservative, so {{low}} to {{high}} a month — just from the Missed Call Text-Back, the leads we capture from the smart website, or the reviews, you're still {{multLow}} to {{multHigh}} on a $297 investment. Does that make sense?"`)}</div>`;
      } else {
        html += `<div style="margin-top:14px">${sayBox('Word-for-word — missed calls ARE important to them',
          `"You mentioned earlier your average order value is {{aov}} — let's be conservative and call it {{conservative}}. Let's say we just talked about one of our features, the Missed Call Text-Back. Now if all we did was save you one missed call every 2 weeks — that's {{monthly}} a month — you would still be {{multiple}} on a $297 investment. That doesn't include the smart website we build for you, the leads we capture, or the reviews we help you get. Can you see how easy it is to understand ROI? Does that make sense?"`)}</div>`;
      }
      html += `</div>`;
      return html;
    },

    gmbFindings() {
      return `<div class="block-label"><span class="pill neutral">The three findings — always these three, always this order</span></div>` +
        window.CC_GMB_FINDINGS.map(f => {
          const done = !!S.gmb[f.id];
          return `<div class="finding ${done ? 'done' : ''}">
            <button class="finding-head" data-action="gmb" data-value="${f.id}"><span class="box">✓</span><span class="t">${esc(f.title)}</span></button>
            ${done ? '' : `<div class="finding-body">${renderBlocks(f.blocks)}</div>`}
          </div>`;
        }).join('');
    },

    checkoutGate() {
      const o = owed();
      let html;
      if (o.length) {
        html = `<div class="gate blocked"><h4>Hold on — you still owe them</h4>
          Every early close in the dataset landed at the floor price. Before a single number goes on the table, go back and cover:
          <div class="owed-list">${o.map(id => `<button class="choice" data-action="goto" data-value="${id}">${esc(shortTitle(id))} →</button>`).join('')}</div>
          <p style="margin-top:10px;font-size:12px;color:var(--text-3)">You can still run the close if you have to — the checklist is a guardrail, not a lock.</p></div>`;
      } else {
        html = `<div class="gate clear"><h4>Clear to close</h4>All three metrics, the money math and the listing diagnosis are done. Recap, binary ask, card.</div>`;
      }
      if (S.numbers.decisionMaker === 'others') {
        html += `<div class="rule-box" style="margin-bottom:18px"><h4>Champion track — {{otherDM}} isn't on the call</h4>`.replace('{{otherDM}}', esc(S.numbers.otherDM || 'the other decision maker')) +
          `Before the price, ask: "Can we get ${esc(S.numbers.otherDM || 'them')} on for the last ten minutes so I can walk you both through the numbers together?" If not, run the close as written, book the onboarding tentatively, and lock the special on the account so it doesn't expire while they talk it over. <span style="color:var(--text-3)">(Draft line — not in the SOP yet.)</span></div>`;
      }
      return html;
    },

    fourThings() {
      const done = window.CC_FOUR_THINGS.filter(t => S.fourThings[t.id]).length;
      return `<div class="block-label"><span class="pill say">1. Timeline and the four things</span><span style="color:var(--text-3);font-weight:400;letter-spacing:0">${done}/4</span></div>
        ${sayBox('Say this', '"So it takes around 7 to 10 days to get everything set up. What it looks like working with us: we schedule an onboarding call. On that onboarding call we need four things from you."')}
        <div class="check-list" style="margin-top:12px">${window.CC_FOUR_THINGS.map(t => `
          <button class="check-row ${S.fourThings[t.id] ? 'done' : ''}" data-action="fourThing" data-value="${t.id}"><span class="box">✓</span>
            <span><span class="t">${esc(t.label)}</span><span class="d">${tpl(t.script)}</span></span></button>`).join('')}</div>
        <p class="tip-line" style="margin-top:10px">The four things come first so he's already picturing onboarding before he hears a price.</p>`;
    },

    offerPicker() {
      const three = P.monthly * P.threeMonthMonths + P.listingSpecial;
      const offers = [
        { id: 'three', title: '3-Month Special', price: money(three) + ' today', sub: `${P.threeMonthMonths} × ${money(P.monthly)} + listing at ${money(P.listingSpecial)} (half off) · AI receptionist included (${money(P.receptionist)}/mo value)`, tag: 'Lead with this' },
        { id: 'monthly_listing', title: 'Monthly + Listing', price: money(P.monthly + P.listing) + ' today', sub: `${money(P.monthly)}/mo smart website + ${money(P.listing)} one-time winning formula` },
        { id: 'monthly', title: 'Monthly only', price: money(P.monthly) + '/mo', sub: 'Smart website system. No contract.' },
        { id: 'downsell', title: 'Downsell — $297 + grandfathered special', price: money(P.monthly) + ' today', sub: 'Start with the foundation, mark the account so the special never expires' },
      ];
      return `<div class="block-label"><span class="pill ask">What did they pick?</span></div>
        <div class="cards two">${offers.map(o => `
          <button class="card clickable ${S.offer === o.id ? 'active' : ''}" data-action="offer" data-value="${o.id}">
            ${o.tag ? `<span class="pill say" style="float:right">${o.tag}</span>` : ''}
            <div class="card-title">${esc(o.title)}</div><div class="card-price">${esc(o.price)}</div><div class="card-sub">${esc(o.sub)}</div></button>`).join('')}</div>
        <p class="tip-line" style="margin-top:10px">Both options are given, the second in more detail, and it ends with "which one" — he's choosing between two yeses.</p>`;
    },

    pushbacks() {
      return `<div class="block-label" style="margin-top:8px"><span class="pill warn">The pushbacks</span></div>
        ${acc('pb1', 'He wants the receptionist but not the 3-month', sayBox('Say this', LINES.pushbackReceptionistOnly))}
        ${acc('pb2', 'THE DOWNSELL — he won\'t do the 3-month', `
          <p class="tip-line">Never lose the deal over the billing cycle. If he's not doing ${money(P.monthly * 3 + P.listingSpecial)} today, get him started at $297 and lock the special for later. He's a customer either way, and the receptionist is what brings him back to the 3-month.</p>
          <div class="rule-box" style="margin:10px 0"><h4>When you hear</h4>${LINES.downsellTriggers.map(esc).join(' · ')}</div>
          ${sayBox('What you say', LINES.downsell)}
          <div style="margin-top:10px"><button class="btn sm primary" data-action="offer" data-value="downsell">Use the downsell → set offer to $297 + grandfathered</button></div>`)}
        ${acc('pb3', '"So I can add it later at the same price?"', sayBox('Say this', LINES.addLater))}
        ${acc('pb4', '"Why three months?"', sayBox('Say this', LINES.whyThreeMonths))}`;
    },

    paymentChecklist() {
      const offerLabel = { three: '3-Month Special — ' + money(P.monthly * 3 + P.listingSpecial) + ' today', monthly_listing: 'Monthly + Listing — ' + money(P.monthly + P.listing) + ' today', monthly: 'Monthly — ' + money(P.monthly) + '/mo', downsell: 'Downsell — ' + money(P.monthly) + ' today, special grandfathered' }[S.offer] || 'No offer selected yet — pick one above';
      const rows = [
        { id: 'plan', t: 'Plan confirmed out loud', d: offerLabel },
        { id: 'card', t: 'Card collected and payment run', d: 'Stay on the line until it goes through. Silence is fine.' },
        { id: 'onboarding', t: 'Onboarding call booked', d: 'Tomorrow — morning or evening. Put it on the calendar while they\'re on the call.' },
        { id: 'fourThings', t: 'Reminded them of the four things', d: 'Photos · customer database · list of services · service areas' },
        { id: 'expectations', t: 'Set the 7–10 day + weekly-contact expectation', d: 'Month one build, month two running, month three the numbers.' },
      ];
      if (S.offer === 'downsell') rows.push({ id: 'grandfather', t: 'Marked the account: special grandfathered', d: 'Listing at $250 + AI receptionist on the 3-month cycle, whenever they\'re ready.' });
      return `<div class="check-list">${rows.map(r => `
        <button class="check-row ${S.payment[r.id] ? 'done' : ''}" data-action="payment" data-value="${r.id}"><span class="box">✓</span>
          <span><span class="t">${esc(r.t)}</span><span class="d">${esc(r.d)}</span></span></button>`).join('')}</div>
        <div class="cards two" style="margin-top:12px">
          <div class="capture"><label>Onboarding call slot</label><div class="choices">
            ${[['tomorrow morning', 'Tomorrow · morning'], ['tomorrow evening', 'Tomorrow · evening']].map(([v, l]) => `<button class="choice ${S.numbers.onboardingSlot === v ? 'active' : ''}" data-action="setNum" data-field="onboardingSlot" data-value="${v}">${l}</button>`).join('')}
          </div><input type="text" data-num="onboardingSlot" value="${esc(S.numbers.onboardingSlot)}" placeholder="or type a date/time" style="margin-top:8px" /></div>
          <div class="capture"><label>Plan</label><div style="font-size:15px;padding-top:6px">${esc(offerLabel)}</div></div>
        </div>`;
    },

    postCall() {
      const p = S.prospect;
      const outcome = window.CC_OUTCOMES.find(o => o.id === S.outcome);
      const ghlStage = S.post.ghlStage || (outcome ? outcome.ghlStage : '');
      let html = `<div class="rule-box"><h4>Prospect info</h4>
        <div class="prospect-grid" style="margin-top:8px">
          ${[['name', 'Name'], ['email', 'Email'], ['phone', 'Phone']].map(([k, l]) => `
            <div class="capture"><label>${l}</label><input type="text" data-prospect="${k}" value="${esc(p[k])}" placeholder="—" />
              <button class="btn sm ghost" style="margin-top:8px" data-action="copy" data-value="${k}">Copy</button></div>`).join('')}
        </div></div>`;

      html += `<h3 class="section-title">What happened at the end of the call?</h3>
        <div class="cards two">${window.CC_OUTCOMES.map(o => `
          <button class="card clickable ${S.outcome === o.id ? 'active' : ''}" data-action="outcome" data-value="${o.id}">
            <div class="card-title">${esc(o.label)}</div><div class="card-sub">${esc(o.sub)}</div></button>`).join('')}</div>`;

      if (S.outcome === 'followup') {
        html += `<div class="rule-box" style="margin-top:14px"><h4>Follow-up details</h4>
          <div class="cards two" style="margin-top:8px">
            <div class="capture"><label>Send them the offer recap email?</label><div class="choices">
              <button class="choice ${S.post.sendRecap === 'yes' ? 'active' : ''}" data-action="setPost" data-field="sendRecap" data-value="yes">Yes — trigger recap</button>
              <button class="choice ${S.post.sendRecap === 'no' ? 'active' : ''}" data-action="setPost" data-field="sendRecap" data-value="no">No — just mark showed</button></div></div>
            <div class="capture"><label>Follow-up call booked for</label><input type="text" data-post="followupAt" value="${esc(S.post.followupAt)}" placeholder="e.g. Thu 10:30am" /></div>
            <div class="capture"><label>Lock the special on their account?</label><div class="choices">
              <button class="choice ${S.post.grandfathered === 'yes' ? 'active' : ''}" data-action="setPost" data-field="grandfathered" data-value="yes">Yes — grandfathered</button>
              <button class="choice ${S.post.grandfathered === 'no' ? 'active' : ''}" data-action="setPost" data-field="grandfathered" data-value="no">No</button></div></div>
            <div class="capture"><label>What's holding them back? (their words)</label><input type="text" data-post="reason" value="${esc(S.post.reason)}" placeholder="…" /></div>
          </div>
          <p class="ghl-note">The recap yes/no becomes the GoHighLevel automation trigger: "send recap" vs "showed, no email".</p></div>`;
      }
      if (S.outcome === 'notint') {
        html += `<div class="rule-box" style="margin-top:14px"><h4>Why not?</h4>
          <div class="capture" style="margin-top:8px"><label>Objection that killed it (their words)</label><input type="text" data-post="reason" value="${esc(S.post.reason)}" placeholder="…" /></div></div>`;
      }
      if (S.outcome === 'closed') {
        const offerLabel = { three: '3-Month Special', monthly_listing: 'Monthly + Listing', monthly: 'Monthly', downsell: 'Monthly (downsell, special grandfathered)' }[S.offer] || 'not set';
        html += `<div class="rule-box" style="margin-top:14px"><h4>Closed</h4>Plan: <strong style="color:var(--green)">${esc(offerLabel)}</strong> · Onboarding: <strong style="color:var(--green)">${esc(S.numbers.onboardingSlot || 'not booked')}</strong>
          ${!S.offer || !S.numbers.onboardingSlot ? '<p class="ghl-note">Go back to Closing to set the plan and the onboarding slot before you submit.</p>' : ''}</div>`;
      }

      html += `<h3 class="section-title"><span class="step-badge">STEP 1</span> Update opportunity stage in GHL</h3>
        <p style="color:var(--text-2);margin-bottom:10px">Move the opportunity to the right stage in the sales pipeline.</p>
        <div class="ghl-row">
          <select data-post="ghlStage">${window.CC_GHL_STAGES.map(s => `<option ${s === ghlStage ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
          <button class="btn success" disabled title="GoHighLevel integration is the next build">Update stage</button>
          <span class="ghl-note">Not wired yet — will match the contact by name + email and update the opportunity, notes and automation tags.</span>
        </div>`;

      html += `<h3 class="section-title"><span class="step-badge">STEP 2</span> Submit call notes</h3>
        <div class="stage-actions" style="margin:0 0 10px"><button class="btn primary" data-action="copySummary">Copy call summary</button>
          <button class="btn ghost" data-action="acc" data-value="payload">${S.openAcc.payload ? 'Hide' : 'Show'} GHL payload (JSON)</button></div>
        <div class="summary-box" id="summaryBox">${esc(buildSummary())}</div>
        ${S.openAcc.payload ? `<div class="summary-box" style="margin-top:10px">${esc(JSON.stringify(buildPayload(), null, 2))}</div>` : ''}`;
      return html;
    },
  };

  function mathStats(r, matter) {
    if (!r.cons) return '';
    if (matter === 'no') {
      return `<div class="math-grid">
        <div class="stat"><div class="k">Their ticket</div><div class="v">${money(r.aov)}</div></div>
        <div class="stat"><div class="k">Conservative</div><div class="v gold">${money(r.cons)}</div><div class="s">${r.low ? 'category floor' : 'roughly half'}</div></div>
        <div class="stat"><div class="k">1–2 extra customers / mo</div><div class="v">${money(r.cons)}–${money(r.cons * 2)}</div></div>
        <div class="stat"><div class="k">vs $${P.monthly}</div><div class="v green">${mult(r.cons / P.monthly)}–${mult(r.cons * 2 / P.monthly)}</div><div class="s">return on the month</div></div>
      </div>`;
    }
    return `<div class="math-grid">
      <div class="stat"><div class="k">Their ticket</div><div class="v">${money(r.aov)}</div></div>
      <div class="stat"><div class="k">Conservative</div><div class="v gold">${money(r.cons)}</div><div class="s">${r.low ? 'category floor' : 'roughly half'}</div></div>
      <div class="stat"><div class="k">1 missed call / 2 wks</div><div class="v">${money(r.monthly)}<span style="font-size:14px;color:var(--text-3)">/mo</span></div><div class="s">2 saved calls a month</div></div>
      <div class="stat"><div class="k">vs $${P.monthly}</div><div class="v green">${mult(r.multiple)}</div><div class="s">${money(r.annual)} vs ${money(r.annualCost)} a year</div></div>
    </div>`;
  }

  /* ------------------------------------------------------------------
     Summary + payload (what will go to GoHighLevel later)
     ------------------------------------------------------------------ */
  function buildPayload() {
    const outcome = window.CC_OUTCOMES.find(o => o.id === S.outcome);
    return {
      contact: { name: S.prospect.name, email: S.prospect.email, phone: S.prospect.phone, shop: S.prospect.shop, city: S.prospect.city, trade: S.prospect.trade },
      call: {
        type: S.callType, startedAt: S.startedAtISO, durationSec: Math.round(totalElapsed()),
        sectionTimesSec: Object.fromEntries(Object.entries(S.sectionTimes).map(([k, v]) => [k, Math.round(v)])),
        sectionsDone: SECTIONS.filter(p => p.id !== 'post' && sectionDone(p)).map(p => p.id), stepsDone: ORDER.filter(isDone), earlyYes: S.earlyYes, decisionMaker: S.numbers.decisionMaker, otherDM: S.numbers.otherDM,
      },
      discovery: {
        multiShop: S.numbers.multiShop, watchedVideo: S.numbers.watched, hasWebsite: S.numbers.hasWebsite, leadsNow: S.numbers.leadsNow,
        missedCalls: S.numbers.missedCalls, missedCallsMatter: S.numbers.missedCallsMatter, aov: toNum(S.numbers.aov) || null, conservative: roi().cons || null,
        reviewProcess: S.numbers.reviewProcess, software: S.numbers.software, runningAds: S.numbers.runningAds,
        questionsAsked: window.CC_QUESTIONS.filter(q => S.asked[q.id]).map(q => q.id), otherQuestions: S.numbers.otherQuestions,
        gmbFindings: Object.keys(S.gmb).filter(k => S.gmb[k]),
      },
      close: { offer: S.offer, onboardingSlot: S.numbers.onboardingSlot, fourThings: Object.keys(S.fourThings).filter(k => S.fourThings[k]), payment: Object.keys(S.payment).filter(k => S.payment[k]) },
      outcome: { id: S.outcome, ghlStage: S.post.ghlStage || (outcome ? outcome.ghlStage : ''), sendRecap: S.post.sendRecap, followupAt: S.post.followupAt, grandfathered: S.post.grandfathered, reason: S.post.reason },
      notes: S.notes,
    };
  }
  function buildSummary() {
    const r = roi();
    const outcome = window.CC_OUTCOMES.find(o => o.id === S.outcome);
    const yn = v => v === 'yes' ? 'yes' : v === 'no' ? 'no' : '—';
    const lines = [];
    lines.push(`CLUTCH CLICKS — GROWTH PLAN CALL (${S.callType === 'followup' ? 'follow-up' : 'initial'})`);
    lines.push(`Prospect: ${S.prospect.name || '—'} · ${S.prospect.shop || '—'} · ${S.prospect.city || '—'}`);
    lines.push(`Contact: ${S.prospect.email || '—'} · ${S.prospect.phone || '—'}`);
    lines.push(`Duration: ${fmtTime(totalElapsed())}${S.earlyYes ? ' · said yes early' : ''}`);
    lines.push(`Decision maker: ${S.numbers.decisionMaker === 'others' ? 'others involved (' + (S.numbers.otherDM || '?') + ')' : S.numbers.decisionMaker === 'primary' ? 'primary' : '—'}`);
    lines.push('');
    lines.push('NUMBERS');
    lines.push(`  Avg ticket: ${r.aov ? money(r.aov) : '—'} · conservative: ${r.cons ? money(r.cons) : '—'} · ROI pitch: ${r.cons ? mult(r.multiple) + ' on $' + P.monthly : '—'}`);
    lines.push(`  Website: ${yn(S.numbers.hasWebsite)} · leads/mo (their guess): ${S.numbers.leadsNow || '—'} · missed calls: ${yn(S.numbers.missedCalls)} (matter: ${yn(S.numbers.missedCallsMatter)})`);
    lines.push(`  Reviews today: ${S.numbers.reviewProcess || '—'} · software: ${S.numbers.software || '—'} · running ads: ${yn(S.numbers.runningAds)}`);
    lines.push('');
    lines.push('COVERED');
    lines.push('  ' + SECTIONS.filter(p => p.id !== 'post').map(p => `${sectionDone(p) ? '[x]' : '[ ]'} ${p.title}` + (p.id === 'bridge' ? ' (' + METRICS.map(m => `${m.short}${isDone(m.id) ? ' ✓' : ' ✗'}`).join(', ') + ')' : '')).join('\n  '));
    const asked = window.CC_QUESTIONS.filter(q => S.asked[q.id]).map(q => q.q);
    lines.push('');
    lines.push('QUESTIONS ASKED');
    lines.push('  ' + (asked.length ? asked.join('\n  ') : '—') + (S.numbers.otherQuestions ? '\n  Other: ' + S.numbers.otherQuestions : ''));
    lines.push('');
    lines.push('GMB FINDINGS SHOWN: ' + (Object.keys(S.gmb).filter(k => S.gmb[k]).join(', ') || '—'));
    lines.push('');
    lines.push(`OFFER: ${S.offer || '—'} · onboarding: ${S.numbers.onboardingSlot || '—'}`);
    lines.push(`OUTCOME: ${outcome ? outcome.label : '—'} → GHL stage: ${S.post.ghlStage || (outcome ? outcome.ghlStage : '—')}`);
    if (S.outcome === 'followup') lines.push(`  Send recap: ${yn(S.post.sendRecap)} · follow-up: ${S.post.followupAt || '—'} · special locked: ${yn(S.post.grandfathered)} · holding back: ${S.post.reason || '—'}`);
    if (S.outcome === 'notint') lines.push(`  Reason: ${S.post.reason || '—'}`);
    lines.push('');
    lines.push('NOTES');
    lines.push(S.notes ? S.notes : '—');
    return lines.join('\n');
  }

  /* ------------------------------------------------------------------
     Render — main stage
     ------------------------------------------------------------------ */
  function renderStage() {
    const sec = curSection();
    const steps = sectionSteps(sec);
    const done = sectionDone(sec);
    const idx = SECTIONS.findIndex(p => p.id === sec.id);
    const prev = idx > 0 ? SECTIONS[idx - 1] : null;
    const multi = steps.length > 1;

    let head = `<div class="stage-head">
      <div class="stage-kicker"><span>${sec.id === 'post' ? 'After the call' : 'Section ' + sec.num + ' of 5'}</span><span class="dot"></span><span>${esc(sec.time)}</span>
        ${done ? '<span class="pill say" style="margin-left:6px">Done</span>' : ''}</div>
      <h1 class="stage-title">${esc(sec.title)}</h1>
      <p class="stage-goal"><strong style="color:var(--text)">Goal:</strong> ${esc(sec.goal)}</p>
      ${S.returnTo && sec.id === 'bridge' ? `<div class="stage-actions"><span class="pill tip">Detour</span><span style="font-size:13px;color:var(--text-3)">Cover the metric they asked about, mark it covered, and you'll land back where you were.</span></div>` : ''}
    </div>`;

    let body = steps.map(id => {
      const st = STAGES[id];
      let partHead = '';
      if (multi) {
        const isMetric = !!st.metric;
        partHead = `<div class="part-head">
          <div class="part-kicker">${esc(st.part || '')}${st.time ? ` <span class="dot"></span> ${esc(st.time)}` : ''}</div>
          <h2 class="part-title">${esc(st.title)}${isMetric && isDone(id) ? ' <span class="pill say">Covered</span>' : ''}</h2>
          ${st.goal ? `<p class="part-goal">${esc(st.goal)}</p>` : ''}
        </div>`;
      }
      let partFoot = '';
      if (st.metric) {
        partFoot = `<div class="part-foot">
          ${isDone(id)
            ? `<button class="btn ghost sm" data-action="toggleDone" data-value="${id}">Un-mark ${esc(st.part)}</button>`
            : `<button class="btn success" data-action="metricCovered" data-value="${id}">✓ ${esc(st.part)} covered${S.returnTo ? ' → back to ' + esc(sectionById(S.returnTo.section).title) : ''}</button>`}
        </div>`;
      }
      return `<section class="part ${st.metric && isDone(id) ? 'covered' : ''}" id="step-${id}">${partHead}${renderBlocks(st.blocks)}${partFoot}</section>`;
    }).join('');

    let nav = `<div class="stage-nav">
      ${prev ? `<button class="btn ghost" data-action="goto" data-value="${prev.id}">← ${esc(prev.title)}</button>` : '<span></span>'}
      <span class="spacer"></span>`;
    const nxt = nextSection(sec.id);
    if (sec.id === 'post') {
      nav += `<button class="btn ghost" data-action="newCall">Start a new call</button>`;
    } else if (sec.id === 'bridge' && metricsLeft().length) {
      const left = metricsLeft();
      nav += `<button class="btn ghost" data-action="goto" data-value="money">Skip to the money anyway</button>
        <button class="btn primary" data-action="scrollTo" data-value="${left[0].id}">Still owed: ${left.map(m => m.short).join(', ')} ↑</button>`;
    } else {
      nav += `${done ? '' : `<button class="btn ghost" data-action="toggleSection" data-value="${sec.id}">Mark done only</button>`}
        <button class="btn primary" data-action="complete">${done ? 'Next' : '✓ Done'} → ${esc(sectionById(nxt).title)}</button>`;
    }
    nav += `</div>`;

    $('#stage').innerHTML = head + body + nav;
  }

  /* ------------------------------------------------------------------
     Render — drawer (numbers + notes)
     ------------------------------------------------------------------ */
  function renderDrawer() {
    const d = $('#drawer');
    if (!S.drawer) { d.innerHTML = ''; return; }
    const tab = S.drawerTab;
    let inner = `<div class="drawer-inner">
      <div class="drawer-head"><h3>${tab === 'notes' ? '📝 Call notes' : tab === 'objections' ? 'Objection came up' : 'Prospect + numbers'}</h3><button class="btn sm ghost" data-action="drawerClose">✕</button></div>
      <div class="drawer-tabs"><button class="btn sm ${tab === 'numbers' ? 'active' : ''}" data-action="drawer" data-value="numbers">Numbers</button><button class="btn sm ${tab === 'notes' ? 'active' : ''}" data-action="drawer" data-value="notes">Notes</button><button class="btn sm ${tab === 'objections' ? 'active' : ''}" data-action="drawer" data-value="objections">Objections</button></div>`;
    if (tab === 'objections') {
      const back = nextLineSection();
      inner += `<div class="rule-box" style="margin-bottom:12px"><h4>The rule</h4>Answer one level deeper than asked. Then fall back to the straight line: <strong style="color:var(--accent)">${esc(sectionById(back).title)}</strong> is the next thing that isn't done.
        <div style="margin-top:10px"><button class="btn sm primary" data-action="backToLine">Back to the line → ${esc(sectionById(back).title)}</button></div></div>`;
      inner += window.CC_QUESTIONS.map(q => {
        const m = METRICS.find(x => x.id === q.leadsTo);
        return acc('obj-' + q.id, q.q, renderBlocks(q.answer) +
          `<div class="q-actions" style="margin-top:10px">${isDone(q.leadsTo) ? `<span class="pill say">${m.short} covered</span>` : `<button class="btn sm primary" data-action="teachMetricFromHere" data-value="${q.leadsTo}">Teach ${m.short} now →</button>`}
           <button class="btn sm ${S.asked[q.id] ? 'active' : ''}" data-action="toggleAskedQuiet" data-value="${q.id}">${S.asked[q.id] ? '✓ Logged' : 'Log it'}</button></div>`);
      }).join('');
      inner += `<p class="ghl-note" style="margin-top:10px">Money objections ("cash is tight", "why three months") live under The pushbacks in Closing.</p>`;
    } else if (tab === 'notes') {
      inner += `<textarea class="notes" data-notes placeholder="Anything you're noticing — objections, energy, specific things they said, red flags, next steps…">${esc(S.notes)}</textarea>
        <p class="ghl-note">Notes go into the call summary in Post-Call.</p>`;
    } else {
      const r = roi();
      inner += `<div class="drawer-sub">Prospect</div>
        ${[['name', 'First name', 'Mike'], ['shop', 'Shop name', 'Mike\'s Auto Body'], ['city', 'City / area', 'Los Angeles'], ['trade', 'Trade (for the GMB search)', 'auto repair'], ['email', 'Email', ''], ['phone', 'Phone', '']].map(([k, l, ph]) =>
          `<div class="capture"><label>${l}</label><input type="text" data-prospect="${k}" value="${esc(S.prospect[k])}" placeholder="${esc(ph)}" /></div>`).join('')}
        <div class="drawer-sub">Numbers — auto-populate the script</div>
        <div class="capture"><label>Average ticket ($)</label><div class="money"><span>$</span><input type="text" inputmode="decimal" data-num="aov" value="${esc(S.numbers.aov)}" placeholder="500" /></div></div>
        <div class="capture"><label>Conservative number (default: half)</label><div class="money"><span>$</span><input type="text" inputmode="decimal" data-num="conservative" value="${esc(S.numbers.conservative)}" placeholder="${r.defaultCons || ''}" /></div></div>
        <div class="capture"><label>Leads / month (their guess)</label><input type="text" data-num="leadsNow" value="${esc(S.numbers.leadsNow)}" placeholder="—" /></div>
        <div class="capture"><label>Has a website?</label><div class="choices">${[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => `<button class="choice ${S.numbers.hasWebsite === v ? 'active' : ''}" data-action="setNum" data-field="hasWebsite" data-value="${v}">${l}</button>`).join('')}</div></div>
        <div class="capture"><label>Missed calls matter?</label><div class="choices">${[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => `<button class="choice ${S.numbers.missedCallsMatter === v ? 'active' : ''}" data-action="setNum" data-field="missedCallsMatter" data-value="${v}">${l}</button>`).join('')}</div></div>
        <div class="capture"><label>How they get reviews today</label><input type="text" data-num="reviewProcess" value="${esc(S.numbers.reviewProcess)}" placeholder="—" /></div>
        <div class="capture"><label>Shop software / customer list</label><input type="text" data-num="software" value="${esc(S.numbers.software)}" placeholder="Tekmetric, Shopmonkey…" /></div>
        ${r.cons ? `<div class="rule-box" style="margin-top:8px"><h4>ROI pitch</h4>1 missed call / 2 wks at ${money(r.cons)} = ${money(r.monthly)}/mo → <strong style="color:var(--green)">${mult(r.multiple)}</strong> on $${P.monthly}</div>` : ''}`;
    }
    inner += `</div>`;
    d.innerHTML = inner;
  }

  let pendingRender = null;
  function scheduleRender() { clearTimeout(pendingRender); pendingRender = setTimeout(render, 0); }

  /* Full re-render. Keeps focus + caret in whichever input the rep is
     typing in, and keeps the drawer's scroll position. */
  function render() {
    const ae = document.activeElement;
    let focusSel = null, selStart = null, selEnd = null;
    const attrs = ['data-num', 'data-prospect', 'data-post', 'data-notes'];
    if (ae && ae.matches && attrs.some(a => ae.hasAttribute(a))) {
      const attr = attrs.find(a => ae.hasAttribute(a));
      focusSel = `${ae.closest('.drawer') ? '.drawer' : '#stage'} [${attr}="${ae.getAttribute(attr)}"]`;
      try { selStart = ae.selectionStart; selEnd = ae.selectionEnd; } catch (e) { /* not a text control */ }
    }
    const drawerScroll = $('#drawer').scrollTop;
    renderTop(); renderSidebar(); renderStage(); renderDrawer(); renderTimer();
    $('#drawer').scrollTop = drawerScroll;
    if (focusSel) {
      const el = $(focusSel);
      if (el) { el.focus({ preventScroll: true }); if (selStart != null) { try { el.setSelectionRange(selStart, selEnd); } catch (e) { /* ignore */ } } }
    }
  }

  /* Update only the {{field}} spans + math so typing doesn't lose focus. */
  function refreshFields() {
    document.querySelectorAll('.field[data-key]').forEach(el => {
      const k = el.dataset.key; const v = fieldValue(k);
      el.textContent = v || (FIELD_PLACEHOLDER[k] || '___');
      el.classList.toggle('filled', !!v);
    });
    const ms = $('#mathStats'); if (ms) ms.innerHTML = mathStats(roi(), S.numbers.missedCallsMatter);
    const sb = $('#summaryBox'); if (sb) sb.textContent = buildSummary();
    // conservative placeholder follows the AOV
    document.querySelectorAll('input[data-num="conservative"]').forEach(i => { i.placeholder = roi().defaultCons || ''; });
  }

  /* ------------------------------------------------------------------
     Events
     ------------------------------------------------------------------ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action, v = btn.dataset.value;
    switch (a) {
      case 'callType':
        S.callType = v; if (v === 'followup') { S.numbers.watched = ''; } save(); render(); break;
      case 'goto': goto(v, { returnTo: (STAGES[v] && STAGES[v].metric) ? S.returnTo : null }); break;
      case 'scrollTo': pendingAnchor = v; scrollToAnchor(); break;
      case 'backToLine': S.returnTo = null; S.drawer = null; goto(nextLineSection()); break;
      case 'toggleDone':
        e.stopPropagation(); markDone(v);
        if (STAGES[v].metric && S.done[v] && metricsLeft().length === 0) S.done.bridge = true;
        save(); render(); break;
      case 'toggleSection': {
        e.stopPropagation(); const sec = sectionById(v); markSectionDone(sec, !sectionDone(sec)); render(); break;
      }
      case 'metricCovered': metricCovered(v); break;
      case 'complete': completeAndAdvance(); break;
      case 'watched':
        S.numbers.watched = v;
        if (v === 'yes') { S.na.watch = true; delete S.done.watch; } else { delete S.na.watch; }
        save(); render(); break;
      case 'setNum':
        S.numbers[btn.dataset.field] = (S.numbers[btn.dataset.field] === v && btn.classList.contains('choice')) ? '' : v;
        save(); render(); break;
      case 'setPost': S.post[btn.dataset.field] = v; save(); render(); break;
      case 'openQ':
        if (e.target.closest('[data-action="toggleAsked"]')) return; // inner check handled below
        S.openQ = S.openQ === v ? null : v; save(); render(); break;
      case 'toggleAsked': e.stopPropagation(); S.asked[v] = !S.asked[v]; if (S.asked[v] && S.openQ !== v) S.openQ = v; save(); render(); break;
      case 'teachMetric': S.asked[S.openQ] = true; goto(v, { returnTo: { section: 'discovery', anchor: 'questions' } }); break;
      case 'teachMetricFromHere': {
        const from = S.section === 'bridge' ? null : { section: S.section, anchor: null };
        S.drawer = null; goto(v, { returnTo: from }); break;
      }
      case 'toggleAskedQuiet': S.asked[v] = !S.asked[v]; save(); render(); break;
      case 'earlyYes': S.earlyYes = !S.earlyYes; save(); render(); break;
      case 'questionsDone':
        markSectionDone(sectionById('discovery'), true);
        goto(metricsLeft().length ? 'bridge' : 'money'); break;
      case 'bridgeDone': markDone('bridge', true); goto('money'); break;
      case 'gmb': S.gmb[v] = !S.gmb[v]; save(); render(); break;
      case 'fourThing': S.fourThings[v] = !S.fourThings[v]; save(); render(); break;
      case 'offer': S.offer = S.offer === v ? '' : v; save(); render(); break;
      case 'payment': S.payment[v] = !S.payment[v]; save(); render(); break;
      case 'outcome':
        S.outcome = v; const oc = window.CC_OUTCOMES.find(o => o.id === v); S.post.ghlStage = oc ? oc.ghlStage : '';
        if (v === 'closed') { markSectionDone(sectionById('closing'), true); }
        save(); render(); break;
      case 'acc': S.openAcc[v] = !S.openAcc[v]; save(); render(); break;
      case 'copy': copyText(S.prospect[v] || '', v + ' copied'); break;
      case 'copySummary': copyText(buildSummary(), 'Call summary copied'); break;
      case 'timerToggle': S.timer.running ? timerPause() : timerStart(); break;
      case 'timerReset': if (confirm('Reset the clock and stage times? Your notes and checklist stay.')) timerReset(); break;
      case 'drawer':
        if (S.drawer && S.drawerTab === v) { S.drawer = null; } else { S.drawer = true; S.drawerTab = v; }
        save(); render(); break;
      case 'drawerClose': S.drawer = null; save(); render(); break;
      case 'newCall':
        if (confirm('Start a new call? This clears the checklist, numbers, notes and timer.')) {
          const keepType = S.callType; S = DEFAULT(); S.callType = keepType; save(); render();
        }
        break;
    }
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.matches('[data-num]')) { S.numbers[t.dataset.num] = t.value; save(); refreshFields(); syncTwins(t); }
    else if (t.matches('[data-prospect]')) { S.prospect[t.dataset.prospect] = t.value; save(); refreshFields(); syncTwins(t); }
    else if (t.matches('[data-post]')) { S.post[t.dataset.post] = t.value; save(); refreshFields(); }
    else if (t.matches('[data-notes]')) { S.notes = t.value; save(); }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('select[data-post]')) { S.post[t.dataset.post] = t.value; save(); refreshFields(); }
    else if (t.matches('[data-num], [data-prospect]')) { scheduleRender(); }
  });
  /* The same field can appear in the drawer and the stage at once. */
  function syncTwins(src) {
    const attr = src.hasAttribute('data-num') ? 'data-num' : 'data-prospect';
    const key = src.getAttribute(attr);
    document.querySelectorAll(`[${attr}="${key}"]`).forEach(el => { if (el !== src) el.value = src.value; });
  }

  function copyText(text, msg) {
    const done = () => toast(msg || 'Copied');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed'); }
    document.body.removeChild(ta);
  }

  // Keyboard: N = notes, M = numbers, O = objections, Space (outside inputs) = timer
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'n' || e.key === 'N') { S.drawer = S.drawer && S.drawerTab === 'notes' ? null : true; S.drawerTab = 'notes'; save(); render(); }
    if (e.key === 'm' || e.key === 'M') { S.drawer = S.drawer && S.drawerTab === 'numbers' ? null : true; S.drawerTab = 'numbers'; save(); render(); }
    if (e.key === 'o' || e.key === 'O') { S.drawer = S.drawer && S.drawerTab === 'objections' ? null : true; S.drawerTab = 'objections'; save(); render(); }
    if (e.key === ' ') { e.preventDefault(); S.timer.running ? timerPause() : timerStart(); }
  });

  render();
})();
