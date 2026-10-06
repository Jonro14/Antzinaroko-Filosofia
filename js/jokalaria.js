// =====================================================================
//  JOKALARIA (ikaslearen mugikorra)
// =====================================================================
(async function () {
  'use strict';
  const { $, $$, esc } = K;

  const P = {
    pin: null, joined: false, me: null, meta: undefined, current: null, score: null,
    renderedKey: null, erantzunak: {}, unsubs: [], timeLoop: null
  };
  try { P.erantzunak = JSON.parse(sessionStorage.getItem('logos-erantzunak') || '{}'); } catch (e) {}

  let B;
  try { B = await Backend.init(); }
  catch (e) { console.error(e); K.toast('⚠️ Ezin izan da konektatu: ' + e.message, 8000); return; }
  if (B.mode === 'demo') {
    const d = document.createElement('div');
    d.className = 'badge-demo'; d.textContent = 'DEMO';
    document.body.appendChild(d);
  }
  K.soinuaBotoia($('#btn-soinua'));

  // ------------------------------------------------------------------
  //  SARTZEKO FORMULARIOA
  // ------------------------------------------------------------------
  let abatarra = K.ABATARRAK[Math.floor(Math.random() * K.ABATARRAK.length)].e;
  function marraztuAbatarrak() {
    $('#av-grid').innerHTML = K.ABATARRAK.map(a =>
      `<button type="button" class="${a.e === abatarra ? 'on' : ''}" data-e="${a.e}" title="${esc(a.i)}" aria-label="${esc(a.i)}">${a.e}</button>`).join('');
    $$('#av-grid button').forEach(b => b.onclick = () => { abatarra = b.dataset.e; marraztuAbatarrak(); });
  }
  marraztuAbatarrak();

  const urlPin = new URLSearchParams(location.search).get('pin');
  $('#in-pin').value = (urlPin || sessionStorage.getItem('logos-jok-pin') || '').replace(/\D/g, '').slice(0, 6);
  $('#in-name').value = sessionStorage.getItem('logos-jok-izena') || '';
  $('#in-pin').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });

  $('#join-form').addEventListener('submit', async e => {
    e.preventDefault();
    K.sfx.pop();   // soinua desblokeatu (mugikorretan erabiltzailearen keinua behar da)
    const pin = $('#in-pin').value.trim();
    const izena = $('#in-name').value.trim().replace(/\s+/g, ' ');
    if (pin.length !== 6) return K.toast('PINak 6 zenbaki ditu');
    if (!izena) return K.toast('Idatzi ezizen bat');
    $('#btn-join').disabled = true;
    try {
      const meta = await B.get('rooms/' + pin + '/meta');
      if (!meta) { K.toast('❌ Ez dago PIN horrekin gelarik'); return; }
      const jokalariak = (await B.get('rooms/' + pin + '/players')) || {};
      const hartuta = Object.keys(jokalariak).some(id => id !== B.uid && (jokalariak[id].name || '').toLowerCase() === izena.toLowerCase());
      if (hartuta) { K.toast('Izen hori hartuta dago. Aukeratu beste bat!'); return; }
      await B.set('rooms/' + pin + '/players/' + B.uid, { name: izena, avatar: abatarra, joinedAt: B.TS });
      sessionStorage.setItem('logos-jok-pin', pin);
      sessionStorage.setItem('logos-jok-izena', izena);
      sartu(pin, { name: izena, avatar: abatarra });
    } catch (err) {
      console.error(err); K.toast('⚠️ Ezin izan da sartu: ' + err.message, 5000);
    } finally { $('#btn-join').disabled = false; }
  });

  $('#btn-berriro').onclick = () => { irten(); K.show('p-sartu'); };

  // ------------------------------------------------------------------
  //  GELAN SARTU ETA ENTZUN
  // ------------------------------------------------------------------
  function irten() {
    P.unsubs.forEach(u => u()); P.unsubs = [];
    clearInterval(P.timeLoop);
    Object.assign(P, { joined: false, meta: undefined, current: null, score: null, renderedKey: null });
    $('#me').hidden = true; $('#me-score').hidden = true; $('#top-logo').hidden = false;
    $('#p-timebar').style.width = '0';
  }

  function sartu(pin, me) {
    irten();
    P.pin = pin; P.me = me; P.joined = true;
    $('#me-av').textContent = me.avatar; $('#me-name').textContent = me.name;
    $('#me').hidden = false; $('#me-score').hidden = false; $('#me-score').textContent = '0';
    $('#top-logo').hidden = window.innerWidth < 420;
    const base = 'rooms/' + pin + '/';
    P.unsubs.push(B.on(base + 'meta', v => { P.meta = v; marraztu(); }));
    P.unsubs.push(B.on(base + 'current', v => { P.current = v; marraztu(); }));
    P.unsubs.push(B.on(base + 'scores/' + B.uid, v => {
      P.score = v;
      $('#me-score').textContent = K.fmt((v || {}).score || 0);
      marraztu();
    }));
    let ikusia = false;
    P.unsubs.push(B.on(base + 'players/' + B.uid, v => {
      if (v) { ikusia = true; P.me = v; return; }
      if (!ikusia || !P.joined) return;
      B.get(base + 'meta').then(meta => {
        if (!P.joined) return;
        if (meta) kanpoan('Kanporatu egin zaituzte', 'Irakasleak gelatik atera zaitu. Berriro sar zaitezke beste izen batekin.');
        else kanpoan('Gela itxi egin da', 'Eskerrik asko jokatzeagatik! 🦉');
      });
    }));
  }

  function kanpoan(titulua, mezua) {
    irten();
    $('#k-title').textContent = titulua;
    $('#k-msg').textContent = mezua || '';
    K.show('p-kanpoan');
  }

  // ------------------------------------------------------------------
  //  EGOERAREN ARABERA MARRAZTU
  // ------------------------------------------------------------------
  function marraztu() {
    if (!P.joined) return;
    const m = P.meta;
    if (m === null) return kanpoan('Gela itxi egin da', 'Eskerrik asko jokatzeagatik! 🦉');
    if (!m) return;
    const c = P.current || {};
    const st = m.state;
    if (st !== 'galdera') { clearInterval(P.timeLoop); $('#p-timebar').style.width = '0'; }

    if (st === 'lobby') {
      if (P.renderedKey === 'lobby') return;
      P.renderedKey = 'lobby';
      $('#w-av').textContent = P.me.avatar;
      $('#w-name').textContent = P.me.name;
      $('#w-level').textContent = m.izena || '';
      return K.show('p-itxaron');
    }
    if (st === 'prest') {
      if (P.renderedKey === 'prest' + m.qKey) return;
      P.renderedKey = 'prest' + m.qKey;
      $('#r-num').textContent = c.n ? `${c.n}. galdera / ${c.total}` : '';
      $('#r-type').textContent = K.MOTA[c.mota] || '';
      return K.show('p-prest');
    }
    if (st === 'galdera') {
      if (P.erantzunak[m.qKey] !== undefined) {
        if (P.renderedKey === 'bidalita' + m.qKey) return;
        P.renderedKey = 'bidalita' + m.qKey;
        return K.show('p-bidalita');
      }
      if (P.renderedKey === 'galdera' + m.qKey || !c.a) return;
      P.renderedKey = 'galdera' + m.qKey;
      return marraztuGaldera(m.qKey, c);
    }
    if (st === 'emaitza') {
      const s = P.score || {};
      const last = s.last || {};
      if (last.q !== m.qKey) {   // puntuazioa oraindik ez da iritsi
        if (P.renderedKey !== 'bidalita' + m.qKey && P.renderedKey !== 'emaitza-zain') { P.renderedKey = 'emaitza-zain'; K.show('p-bidalita'); }
        return;
      }
      if (P.renderedKey === 'emaitza' + m.qKey) return;
      P.renderedKey = 'emaitza' + m.qKey;
      return marraztuEmaitza(s, c);
    }
    if (st === 'sailkapena') {
      if (P.renderedKey === 'sailk' + m.qKey) return;
      P.renderedKey = 'sailk' + m.qKey;
      const s = P.score || {};
      $('#s-rank').textContent = s.rank ? s.rank + '.' : '–';
      $('#s-of').textContent = m.jokalariak ? `${m.jokalariak} jokalaritik` : '';
      $('#s-score').textContent = K.fmt(s.score) + ' puntu';
      $('#s-msg').textContent = mezuaPostua(s);
      return K.show('p-sailkapena');
    }
    if (st === 'amaiera') {
      if (P.renderedKey === 'amaiera') return;
      P.renderedKey = 'amaiera';
      const s = P.score || {};
      const r = s.rank || 0;
      $('#f-medal').textContent = r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : (P.me.avatar || '🦉');
      $('#f-rank').textContent = r ? r + '.' : '–';
      $('#f-of').textContent = m.jokalariak ? `${m.jokalariak} jokalaritik` : '';
      $('#f-score').textContent = K.fmt(s.score) + ' puntu';
      $('#f-msg').textContent = (s.zuzenak || 0) + ' / ' + (m.total || '?') + ' erantzun zuzen. ' +
        (r && r <= 3 ? 'Podioan zaude! 🏆' : 'Lan ona! Errepasatu apunteak eta hurrengoan podioa! 💪');
      K.show('p-amaiera');
      if (r && r <= 3) { K.konfetia(4000); K.sfx.fanfare(); }
      return;
    }
  }

  function mezuaPostua(s) {
    if (!s.rank) return '';
    if (s.rank === 1) return 'Lehenengo zaude! Sokratesek ere ez luke hobeto egingo 🦉';
    if (s.prevRank && s.prevRank > s.rank) return `${s.prevRank - s.rank} postu igo zara! 🚀`;
    if (s.rank <= 3) return 'Podioan zaude! Eutsi! 🔥';
    return 'Aurrera! Hurrengo galderan gora egin dezakezu 💪';
  }

  function marraztuGaldera(qKey, c) {
    $('#g-num').textContent = `${c.n}. galdera / ${c.total} · ${K.MOTA[c.mota] || ''}`;
    $('#g-text').textContent = c.mota === 'aipua' ? '«' + String(c.m).replace(/^"|"$/g, '') + '»' : c.m;
    $('#g-answers').className = 'p-answers' + (c.a.length === 2 ? ' two' : '');
    $('#g-answers').innerHTML = c.a.map((t, i) => K.ansHTML(c.mota, i, t)).join('');
    $$('#g-answers .ans').forEach(b => b.onclick = () => erantzun(qKey, +b.dataset.i));
    K.show('p-galdera');
    // denbora-barra
    clearInterval(P.timeLoop);
    const T = (c.time || 20) * 1000;
    P.timeLoop = setInterval(() => {
      const hasi = (P.current && P.current.startAt) || B.now();
      const f = Math.max(0, 1 - (B.now() - hasi) / T);
      $('#p-timebar').style.width = (f * 100) + '%';
      $('#p-timebar').style.background = f < 0.25 ? 'var(--bad)' : 'var(--gold)';
    }, 200);
  }

  async function erantzun(qKey, i) {
    if (P.erantzunak[qKey] !== undefined) return;
    P.erantzunak[qKey] = i;
    try { sessionStorage.setItem('logos-erantzunak', JSON.stringify(P.erantzunak)); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(30);
    K.sfx.pop();
    const mezuak = ['Ikus dezagun besteek zer diote...', 'Logosak gidatu zaitu? 🤔', 'Ataraxia... lasai itxaron 🧘', 'Zure erantzuna Ideien Mundura bidean ✨'];
    $('#b-msg').textContent = mezuak[Math.floor(Math.random() * mezuak.length)];
    P.renderedKey = 'bidalita' + qKey;
    K.show('p-bidalita');
    try {
      await B.set('rooms/' + P.pin + '/answers/' + qKey + '/' + B.uid, { c: i, t: B.TS });
    } catch (e) {
      console.warn(e);
      K.toast('⏰ Berandu! Denbora amaitu da.');
    }
  }

  function marraztuEmaitza(s, c) {
    const last = s.last || {};
    const res = $('#res');
    if (last.ok) {
      res.className = 'result ok';
      $('#res-ico').textContent = '✔️'; $('#res-title').textContent = 'Zuzena!';
      $('#res-pts').textContent = '+' + K.fmt(last.pts);
      $('#res-pts').hidden = false;
      K.sfx.ok(); if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    } else if (last.erantzun) {
      res.className = 'result bad';
      $('#res-ico').textContent = '✖️'; $('#res-title').textContent = 'Okerra';
      $('#res-pts').hidden = true;
      K.sfx.bad(); if (navigator.vibrate) navigator.vibrate(200);
    } else {
      res.className = 'result none';
      $('#res-ico').textContent = '⏰'; $('#res-title').textContent = 'Denbora amaitu da';
      $('#res-pts').hidden = true;
    }
    $('#res-streak').textContent = s.streak >= 2 ? `🔥 ${s.streak} zuzen jarraian!` : '';
    $('#res-rank').textContent = s.rank ? `${s.rank}. postuan zaude · ${K.fmt(s.score)} puntu` : '';
    const zuzena = (c.a && typeof c.zuzena === 'number') ? c.a[c.zuzena] : '';
    $('#res-az').textContent = !last.ok && zuzena ? 'Erantzun zuzena: ' + zuzena : '';
    K.show('p-emaitza');
  }

  // ------------------------------------------------------------------
  //  FITXA FRESKATZEAN: berriro sartu automatikoki
  // ------------------------------------------------------------------
  const gordetakoPin = sessionStorage.getItem('logos-jok-pin');
  if (gordetakoPin && (!urlPin || urlPin === gordetakoPin)) {
    const ni = await B.get('rooms/' + gordetakoPin + '/players/' + B.uid);
    if (ni) { sartu(gordetakoPin, ni); return; }
  }
  K.show('p-sartu');
  if ($('#in-pin').value.length === 6) $('#in-name').focus();
})();
