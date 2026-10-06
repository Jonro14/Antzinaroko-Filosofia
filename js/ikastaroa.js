// =====================================================================
//  IKASTAROA: gai-orrien motor interaktiboa
// ---------------------------------------------------------------------
//  Gai-orri bakoitzak window.GAIA definitzen du, eta HTMLan elementu
//  hauek erabiltzen ditu (datuak GAIA objektuan):
//    <section class="atal" id="g1-1" data-n="1.1" data-title="...">
//    <div class="quiz"   data-quiz="g1-1">     GAIA.quiz[id]   = [{m, a[], z, az}]
//    <div class="match"  data-match="id">      GAIA.match[id]  = {l[], r[]}  (bikoteak ordena berean)
//    <div class="sort"   data-sort="id">       GAIA.sort[id]   = {bins[], items:[[testua, bin]]}
//    <div class="order"  data-order="id">      GAIA.order[id]  = [ordena zuzena]
//    <div class="stages" data-stages="id">     GAIA.stages[id] = [{e, t, d, l}]
//    <div data-hs="id"> ... [data-k] ... .hs-panel   GAIA.hs[id] = {k: {t, d}}
//    <div class="chat"   data-chat="id">       GAIA.chat[id]   = [{w:'s'|'o'|'f', t}]
//    <div data-tabs> .tabs-b button[data-tab] + [data-pane]
//    <span class="gl" data-def="...">          glosarioa
//    <div class="flip"> .fi > .ff + .fb
//  Aurrerapena (amaitutako atalak) nabigatzailean gordetzen da.
// =====================================================================
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sfx = n => { try { if (window.K && K.sfx[n]) K.sfx[n](); } catch (e) {} };

  const KEY = 'ikastaroa-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const save = p => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
  let prog = load();

  const IK = {};
  IK.progress = load;

  // ------------------------------------------------------------------
  //  Urrats-zerrenda eta aurrerapen-barra
  // ------------------------------------------------------------------
  function atalak() { return $$('section.atal'); }
  function marraztuAurrerapena() {
    const as = atalak();
    const eginak = as.filter(a => prog[a.id]).length;
    const bar = $('#g-bar'); if (bar) bar.style.width = (as.length ? eginak / as.length * 100 : 0) + '%';
    const txt = $('#g-prog'); if (txt) txt.textContent = `${eginak} / ${as.length} atal`;
    as.forEach(a => {
      const l = $(`#stepper a[href="#${a.id}"]`); if (l) l.classList.toggle('done', !!prog[a.id]);
      const ok = $('.atal-h .ok', a); if (ok) ok.textContent = prog[a.id] ? '✓ Ikasita' : '';
    });
  }
  function eraikiUrratsak() {
    const st = $('#stepper'); if (!st) return;
    const g = window.GAIA || {};
    st.innerHTML = `<div class="st-title">${esc(g.izena || '')}</div>` + atalak().map(a =>
      `<a href="#${a.id}"><span class="dot"><span>${esc(a.dataset.n || '')}</span></span><span class="lbl">${esc(a.dataset.title || '')}</span></a>`).join('') +
      `<a class="st-back" href="ikastaroa.html">← Gai guztiak</a>`;
    // atalen goiburuak
    atalak().forEach(a => {
      if ($('.atal-h', a)) return;
      const h = document.createElement('div'); h.className = 'atal-h';
      h.innerHTML = `<span class="n">${esc(a.dataset.n || '')}</span><h2>${esc(a.dataset.title || '')}</h2><span class="ok"></span>`;
      a.prepend(h);
    });
    // uneko atala nabarmendu
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        $$('#stepper a').forEach(x => x.classList.toggle('cur', x.getAttribute('href') === '#' + e.target.id));
        const cur = $('#stepper a.cur'); if (cur && window.innerWidth <= 980) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
      }), { rootMargin: '-30% 0px -60% 0px' });
      atalak().forEach(a => io.observe(a));
    }
  }
  function atalaEginda(el) {
    const a = el.closest('section.atal'); if (!a || prog[a.id]) return;
    prog[a.id] = true; save(prog); marraztuAurrerapena();
  }

  // ------------------------------------------------------------------
  //  Galdetegiak
  // ------------------------------------------------------------------
  function quiz(el, qs) {
    let zuzenak = 0, lehenean = 0;
    el.innerHTML = `<div class="quiz-h">✍️ Egiaztatu <span class="stars"></span></div>` + qs.map((q, i) => `
      <div class="qq" data-i="${i}"><div class="qm">${i + 1}. ${esc(q.m)}</div>
      <div class="qa">${shuffle(q.a.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" data-j="${j}">${esc(t)}</button>`).join('')}</div>
      <div class="qx" hidden></div></div>`).join('') + `<div class="quiz-done" hidden></div>`;
    $$('.qq', el).forEach(qq => {
      const q = qs[+qq.dataset.i]; let saiakerak = 0, eginda = false;
      $$('.qa button', qq).forEach(b => b.onclick = () => {
        if (eginda) return;
        saiakerak++;
        if (+b.dataset.j === q.z) {
          eginda = true; b.classList.add('ok'); $$('.qa button', qq).forEach(x => x.disabled = true);
          zuzenak++; if (saiakerak === 1) lehenean++;
          const x = $('.qx', qq); x.hidden = false; x.innerHTML = '✔ ' + esc(q.az || 'Zuzena!');
          sfx('ok');
          if (zuzenak === qs.length) {
            const d = $('.quiz-done', el); d.hidden = false;
            d.textContent = lehenean === qs.length ? '🏆 Bikain! Dena lehen saiakeran. Atala ikasita.' : '✓ Atala ikasita. Errepasatu kostatu zaizkizun puntuak.';
            $('.stars', el).textContent = '⭐'.repeat(lehenean) + '☆'.repeat(qs.length - lehenean);
            atalaEginda(el);
          }
        } else {
          b.classList.add('bad'); b.disabled = true; sfx('bad');
          const x = $('.qx', qq); x.hidden = false; x.textContent = '✖ Ez da hori. Saiatu berriro!';
        }
      });
    });
  }

  // ------------------------------------------------------------------
  //  Lotu (bikoteak)
  // ------------------------------------------------------------------
  function match(el, d) {
    const st = document.createElement('div'); st.className = 'game-st';
    const L = d.l.map((t, i) => ({ t, i })), R = shuffle(d.r.map((t, i) => ({ t, i })));
    el.innerHTML = `<div class="col">${L.map(x => `<button type="button" class="chipb" data-s="l" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
      <div class="col">${R.map(x => `<button type="button" class="chipb" data-s="r" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>`;
    el.after(st);
    let sel = null, eginak = 0;
    st.textContent = 'Sakatu ezkerreko bat, eta gero eskuineko bikotea.';
    $$('.chipb', el).forEach(b => b.onclick = () => {
      if (b.classList.contains('done')) return;
      if (!sel || sel.dataset.s === b.dataset.s) { $$('.chipb.sel', el).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
      const a = sel; sel = null; a.classList.remove('sel');
      if (a.dataset.i === b.dataset.i) {
        eginak++;
        [a, b].forEach(x => { x.classList.add('done'); x.insertAdjacentHTML('afterbegin', `<span class="pr">${eginak}·</span> `); });
        sfx('pop');
        if (eginak === d.l.length) { st.textContent = '🎉 Bikote guztiak lotuta!'; st.classList.add('win'); sfx('ok'); }
        else st.textContent = `${eginak} / ${d.l.length} lotuta`;
      } else {
        [a, b].forEach(x => { x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 450); });
        sfx('bad'); st.textContent = 'Ez dira bikote. Pentsatu berriro!';
      }
    });
  }

  // ------------------------------------------------------------------
  //  Sailkatu (taldeetan)
  // ------------------------------------------------------------------
  function sort(el, d) {
    const items = shuffle(d.items.map((x, i) => ({ t: x[0], b: x[1], i })));
    el.innerHTML = `<div class="pool">${items.map(x => `<button type="button" class="chipb" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
      <div class="bins">${d.bins.map((b, i) => `<div class="bin" data-b="${i}" role="button" tabindex="0"><h4>${esc(b)}</h4></div>`).join('')}</div>
      <div class="game-st">Sakatu esaldi bat, eta gero dagokion taldea.</div>`;
    const st = $('.game-st', el);
    let sel = null, eginak = 0;
    $$('.pool .chipb', el).forEach(b => b.onclick = () => { $$('.pool .chipb', el).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); $$('.bin', el).forEach(x => x.classList.add('pick')); });
    $$('.bin', el).forEach(bin => {
      const go = () => {
        if (!sel) { st.textContent = 'Lehenik, aukeratu goiko esaldi bat.'; return; }
        const it = d.items[+sel.dataset.i];
        $$('.bin', el).forEach(x => x.classList.remove('pick'));
        if (it[1] === +bin.dataset.b) {
          const s = document.createElement('div'); s.className = 'in'; s.textContent = it[0]; bin.appendChild(s);
          sel.remove(); sel = null; eginak++; sfx('pop');
          if (eginak === d.items.length) { st.textContent = '🎉 Dena ondo sailkatuta!'; st.classList.add('win'); sfx('ok'); }
          else st.textContent = `${eginak} / ${d.items.length} ondo`;
        } else {
          sel.classList.add('bad'); const s0 = sel; setTimeout(() => s0.classList.remove('bad'), 450);
          sfx('bad'); st.textContent = (it[2] || 'Ez dago talde horretan. Saiatu berriro!');
        }
      };
      bin.onclick = go; bin.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });
  }

  // ------------------------------------------------------------------
  //  Ordenatu
  // ------------------------------------------------------------------
  function order(el, ordena) {
    el.innerHTML = `<div class="ord-pool">${shuffle(ordena.map((t, i) => ({ t, i }))).map(x => `<button type="button" class="chipb" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
      <div class="ord-list">${ordena.map((_, i) => `<div class="ord-slot">${i + 1}. ...</div>`).join('')}</div>
      <div class="game-st">Sakatu elementuak ordena zuzenean.</div>`;
    const st = $('.game-st', el); let n = 0;
    $$('.ord-pool .chipb', el).forEach(b => b.onclick = () => {
      if (+b.dataset.i === n) {
        const s = $$('.ord-slot', el)[n]; s.textContent = `${n + 1}. ${ordena[n]}`; s.classList.add('fill');
        b.remove(); n++; sfx('pop');
        if (n === ordena.length) { st.textContent = '🎉 Ordena zuzena!'; st.classList.add('win'); sfx('ok'); }
      } else { b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 450); sfx('bad'); st.textContent = `Ez da ${n + 1}. urratsa. Pentsatu zer doan lehenago.`; }
    });
  }

  // ------------------------------------------------------------------
  //  Urratsen graduatzailea
  // ------------------------------------------------------------------
  function stages(el, ss) {
    el.innerHTML = `<div class="stg-view"><div class="stg-ico"></div><div><div class="stg-t"></div><div class="stg-d"></div></div></div>
      <input type="range" min="0" max="${ss.length - 1}" step="1" value="0" aria-label="Urratsa">
      <div class="stg-lbls">${ss.map((s, i) => `<span data-i="${i}">${esc(s.l || s.t)}</span>`).join('')}</div>`;
    const r = $('input', el);
    const show = i => {
      const s = ss[i];
      $('.stg-ico', el).textContent = s.e || ''; $('.stg-t', el).textContent = s.t; $('.stg-d', el).innerHTML = s.d || '';
      $('.stg-ico', el).style.transform = 'scale(1.12)'; setTimeout(() => { $('.stg-ico', el).style.transform = ''; }, 200);
      $$('.stg-lbls span', el).forEach((x, j) => x.classList.toggle('on', j === i));
    };
    r.oninput = () => show(+r.value);
    $$('.stg-lbls span', el).forEach(x => x.onclick = () => { r.value = x.dataset.i; show(+x.dataset.i); });
    show(0);
  }

  // ------------------------------------------------------------------
  //  Irudi interaktiboak
  // ------------------------------------------------------------------
  function hotspots(el, d) {
    const panel = $('.hs-panel', el);
    const intro = panel ? panel.innerHTML : '';
    const ks = $$('[data-k]', el), seen = new Set();
    ks.forEach(k => {
      k.setAttribute('tabindex', '0'); k.setAttribute('role', 'button');
      const go = () => {
        const info = d[k.dataset.k]; if (!info || !panel) return;
        ks.forEach(x => x.classList.remove('on')); k.classList.add('on', 'seen'); seen.add(k.dataset.k);
        panel.innerHTML = `<h4>${esc(info.t)}</h4>${info.d}<div class="hs-count">${seen.size} / ${ks.length} ikusita${seen.size === ks.length ? ' · 🎉 dena arakatuta!' : ''}</div>`;
        sfx('pop');
      };
      k.addEventListener('click', go);
      k.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    if (panel && !intro.trim()) panel.innerHTML = '<p>Sakatu irudiko puntu distiratsuak.</p>';
  }

  // ------------------------------------------------------------------
  //  Elkarrizketa (urratsez urrats)
  // ------------------------------------------------------------------
  function chat(el, msgs) {
    el.innerHTML = '<div class="chat-l chat"></div><div style="margin-top:12px;display:flex;gap:8px"><button type="button" class="btn btn-gold btn-s">Jarraitu ▸</button><button type="button" class="btn btn-ghost btn-s" hidden>↺ Berriro</button></div>';
    const list = $('.chat-l', el), [next, again] = $$('button', el);
    let i = 0;
    const step = () => {
      const m = msgs[i++]; if (!m) return;
      const d = document.createElement('div');
      if (m.w === 'f') { d.className = 'phase'; d.textContent = m.t; }
      else { d.className = 'msg ' + m.w; d.innerHTML = `<div class="who">${m.w === 's' ? 'SOKRATES' : (m.who || 'SOLASKIDEA')}</div>${esc(m.t)}`; }
      list.appendChild(d);
      if (i >= msgs.length) { next.hidden = true; again.hidden = false; }
    };
    // fase-etiketa bat agertzean, hurrengo mezua ere erakutsi
    const adv = () => { step(); while (i < msgs.length && msgs[i - 1] && msgs[i - 1].w === 'f') step(); };
    next.onclick = adv;
    again.onclick = () => { list.innerHTML = ''; i = 0; next.hidden = false; again.hidden = true; adv(); };
    adv();
  }

  // ------------------------------------------------------------------
  //  Txikiak: fitxak, txartelak, glosarioa, soinua
  // ------------------------------------------------------------------
  function tabs(el) {
    const bs = $$('.tabs-b button', el), ps = $$('[data-pane]', el);
    const on = t => { bs.forEach(b => b.classList.toggle('on', b.dataset.tab === t)); ps.forEach(p => p.classList.toggle('on', p.dataset.pane === t)); };
    bs.forEach(b => b.onclick = () => { on(b.dataset.tab); sfx('pop'); });
    if (bs[0]) on(bs[0].dataset.tab);
  }
  let pop = null;
  function glosarioa() {
    document.addEventListener('click', e => {
      const g = e.target.closest('.gl');
      if (pop) { pop.remove(); pop = null; }
      if (!g) return;
      pop = document.createElement('div'); pop.className = 'gl-pop';
      pop.innerHTML = `<b>${esc(g.dataset.term || g.textContent)}</b>${esc(g.dataset.def)}`;
      document.body.appendChild(pop);
      const r = g.getBoundingClientRect();
      const left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 8);
      pop.style.left = left + 'px'; pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
    });
  }
  let actx = null;
  IK.tone = (f, dur) => {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 1.2));
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + (dur || 1.2) + 0.05);
    } catch (e) {}
  };

  // ------------------------------------------------------------------
  IK.init = function () {
    const G = window.GAIA || {};
    eraikiUrratsak();
    $$('[data-quiz]').forEach(el => G.quiz && G.quiz[el.dataset.quiz] && quiz(el, G.quiz[el.dataset.quiz]));
    $$('[data-match]').forEach(el => G.match && G.match[el.dataset.match] && match(el, G.match[el.dataset.match]));
    $$('[data-sort]').forEach(el => G.sort && G.sort[el.dataset.sort] && sort(el, G.sort[el.dataset.sort]));
    $$('[data-order]').forEach(el => G.order && G.order[el.dataset.order] && order(el, G.order[el.dataset.order]));
    $$('[data-stages]').forEach(el => G.stages && G.stages[el.dataset.stages] && stages(el, G.stages[el.dataset.stages]));
    $$('[data-hs]').forEach(el => G.hs && G.hs[el.dataset.hs] && hotspots(el, G.hs[el.dataset.hs]));
    $$('[data-chat]').forEach(el => G.chat && G.chat[el.dataset.chat] && chat(el, G.chat[el.dataset.chat]));
    $$('[data-tabs]').forEach(tabs);
    $$('.flip').forEach(f => { f.setAttribute('tabindex', '0'); f.onclick = () => { f.classList.toggle('on'); sfx('pop'); }; f.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.click(); } }; });
    glosarioa();
    marraztuAurrerapena();
    const sb = $('#btn-soinua'); if (sb && window.K) K.soinuaBotoia(sb);
    if (typeof G.after === 'function') G.after(IK);
  };

  window.IK = IK;
  document.addEventListener('DOMContentLoaded', () => { if (window.GAIA) IK.init(); });
})();
