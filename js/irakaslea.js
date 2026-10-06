// =====================================================================
//  IRAKASLEA (proiektagailuko pantaila): gela sortu eta jokoa gidatu
// ---------------------------------------------------------------------
//  Datu-basearen egitura (rooms/{PIN}):
//    meta    : { host, createdAt, level, state, qIndex, qKey, total, jokalariak }
//              state = lobby | prest | galdera | emaitza | sailkapena | amaiera
//    order   : [{ l: mailaId, i: galderaIndizea }, ...]
//    current : { n, total, mota, m, a[], time, startAt, zuzena?, counts?, az? }
//    players : { uid: { name, avatar, joinedAt } }        (jokalariak idazten du)
//    answers : { qKey: { uid: { c, t } } }                 (jokalariak idazten du)
//    scores  : { uid: { score, streak, zuzenak, rank, prevRank, last } }
// =====================================================================
(async function () {
  'use strict';
  const { $, $$, esc } = K;

  const OINARRI_DENBORA = { aukera: 20, eg: 15, aipua: 20 };   // segundoak
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // Ezarpenak (irakaslearen nabigatzailean gordeta)
  //   prog = true  -> mailak ordenan desblokeatzen dira (mundu-mapa progresiboa)
  //   prog = false -> edozein maila aukera daiteke
  const ezarpenak = Object.assign({ kop: 15, den: 1, prog: false }, LS.get('logos-ezarpenak', {}));
  let eginak = LS.get('logos-eginak', []);

  const G = {
    pin: null, level: null, order: [], qIndex: -1, qKey: null, q: null, current: null, zuzena: null,
    players: {}, scores: {}, answers: {}, startAt: 0, state: null,
    loop: null, unsubPl: null, unsubAns: null, revealing: false, reselect: false
  };
  let selLevel = null;

  // ------------------------------------------------------------------
  //  HASIERAKETA
  // ------------------------------------------------------------------
  let B;
  try { B = await Backend.init(); }
  catch (e) { console.error(e); K.toast('⚠️ Ezin izan da datu-basera konektatu: ' + e.message, 8000); return; }
  if (B.mode === 'demo') {
    const d = document.createElement('div');
    d.className = 'badge-demo';
    d.textContent = 'DEMO modua · nabigatzaile berean soilik';
    d.title = 'Firebase konfiguratu arte, jokalariak nabigatzaile bereko beste fitxetan sartu behar dira (ikus IRAKURRI.md).';
    document.body.appendChild(d);
  }
  let konektatuta = false;
  B.onConnection(c => {
    if (c) { if (konektatuta === null) K.toast('✅ Berriro konektatuta'); konektatuta = true; }
    else if (konektatuta) { konektatuta = null; K.toast('⚠️ Konexioa galdu da. Berriro konektatzen...', 5000); }
  });

  K.soinuaBotoia($('#btn-soinua'), on => { if (on && G.state === 'lobby') K.musika.start(); });
  $('#btn-fs').onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  };

  // ------------------------------------------------------------------
  //  MAILA-MAPA ETA EZARPENAK
  // ------------------------------------------------------------------
  const MAILAK = window.LOGOS_MAILAK;
  function desblokeatuta(m) {
    if (!ezarpenak.prog) return true;
    if (m.nahasia) return MAILAK.filter(x => !x.nahasia).every(x => eginak.includes(x.id));
    const aurrekoa = MAILAK.find(x => x.zenbakia === m.zenbakia - 1);
    return !aurrekoa || eginak.includes(aurrekoa.id);
  }
  function marraztuMapa() {
    $('#map').innerHTML = MAILAK.map(m => {
      const itxita = !desblokeatuta(m), egina = eginak.includes(m.id);
      const n = m.nahasia ? 'Gai guztiak nahasian' : m.galderak.length + ' galdera';
      return `<button class="lvl ${itxita ? 'locked' : ''} ${egina && !itxita ? 'done' : ''} ${selLevel === m.id ? 'sel' : ''}" style="--c:${m.kolorea}" data-id="${m.id}">
        <div class="ico">${m.ikonoa}</div>
        <div class="zbk">${m.zenbakia}. MAILA</div>
        <h3>${esc(m.izena)}</h3>
        <p>${esc(m.gaia)}</p>
        <div class="cnt">${n}</div>
      </button>`;
    }).join('') + '<svg class="map-path" aria-hidden="true"><path/></svg>';
    marraztuBidea();
    $$('#map .lvl').forEach(b => b.onclick = () => {
      const m = K.maila(b.dataset.id);
      if (!desblokeatuta(m)) { K.toast('🔒 Aurreko maila amaitu behar da lehenik'); return; }
      selLevel = m.id; marraztuMapa();
    });
    $('#btn-sortu').disabled = !selLevel || !desblokeatuta(K.maila(selLevel));
  }
  // Mailak lotzen dituen bide marratua (mundu-mapa)
  function marraztuBidea() {
    const map = $('#map'), svg = $('#map .map-path');
    if (!svg || !map.offsetWidth) return;
    const r0 = map.getBoundingClientRect();
    const pts = $$('#map .lvl').map(b => { const r = b.getBoundingClientRect(); return [r.left - r0.left + r.width / 2, r.top - r0.top + r.height / 2]; });
    const zutabeBat = pts.every(p => Math.abs(p[0] - pts[0][0]) < 2);
    let d = 'M' + pts[0].join(' ');
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      d += (y0 === y1 || zutabeBat) ? ` L${x1} ${y1}` : ` C${x0 + 120} ${y0} ${x1 + 120} ${y1} ${x1} ${y1}`;
    }
    svg.setAttribute('viewBox', `0 0 ${r0.width} ${r0.height}`);
    svg.querySelector('path').setAttribute('d', d);
  }
  window.addEventListener('resize', marraztuBidea);

  function marraztuEzarpenak() {
    $$('[data-kop]').forEach(c => c.classList.toggle('on', +c.dataset.kop === ezarpenak.kop));
    $$('[data-den]').forEach(c => c.classList.toggle('on', +c.dataset.den === ezarpenak.den));
    $('#opt-prog').checked = !!ezarpenak.prog;
    $('#btn-reset-prog').hidden = !ezarpenak.prog;
  }
  $$('[data-kop]').forEach(c => c.onclick = () => { ezarpenak.kop = +c.dataset.kop; LS.set('logos-ezarpenak', ezarpenak); marraztuEzarpenak(); });
  $$('[data-den]').forEach(c => c.onclick = () => { ezarpenak.den = +c.dataset.den; LS.set('logos-ezarpenak', ezarpenak); marraztuEzarpenak(); });
  $('#opt-prog').onchange = e => { ezarpenak.prog = e.target.checked; LS.set('logos-ezarpenak', ezarpenak); marraztuEzarpenak(); marraztuMapa(); };
  $('#btn-reset-prog').onclick = () => {
    if (!confirm('Amaitutako mailen aurrerapena ezabatu?')) return;
    eginak = []; LS.set('logos-eginak', eginak); selLevel = null; marraztuMapa();
  };

  function erakutsiMapa() {
    G.state = 'mapa';
    K.musika.stop();
    $('#mapa-kicker').textContent = G.reselect ? `Gela bera (PIN ${G.pin}) · jokalariak mantentzen dira` : 'Irakaslearen panela';
    $('#btn-sortu').textContent = G.reselect ? 'Jarraitu gela berean ▸' : 'Sortu gela ▸';
    $('#btn-itxi-gela').hidden = !G.reselect;
    $('#top-info').hidden = !G.reselect;
    marraztuEzarpenak();
    K.show('s-mapa');
    marraztuMapa();
  }

  // ------------------------------------------------------------------
  //  GALDERA-ZERRENDA
  // ------------------------------------------------------------------
  const galdera = o => K.maila(o.l).galderak[o.i];
  function eraikiOrdena(m) {
    const propioak = K.shuffle(m.galderak.map((_, i) => ({ l: m.id, i })));
    if (!m.nahasia) return ezarpenak.kop ? propioak.slice(0, ezarpenak.kop) : propioak;
    // Olinpo: alderaketa-galdera bereziak + beste mailetako galderak nahasian
    const N = ezarpenak.kop || 30;
    const berezi = propioak.slice(0, Math.min(propioak.length, Math.ceil(N / 2)));
    const besteak = K.shuffle(MAILAK.filter(x => !x.nahasia).flatMap(x => x.galderak.map((_, i) => ({ l: x.id, i }))));
    return K.shuffle(berezi.concat(besteak.slice(0, N - berezi.length)));
  }
  const izenaLuzea = m => `${m.ikonoa} ${m.zenbakia}. maila · ${m.izena}`;
  const denbora = q => Math.round((OINARRI_DENBORA[q.mota] || 20) * ezarpenak.den);

  // ------------------------------------------------------------------
  //  GELA SORTU / BERRERABILI / ITXI
  // ------------------------------------------------------------------
  async function sortuGela() {
    const m = K.maila(selLevel);
    $('#btn-sortu').disabled = true;
    try {
      let pin;
      for (let t = 0; t < 12; t++) {
        pin = String(100000 + Math.floor(Math.random() * 900000));
        if (!(await B.get('rooms/' + pin + '/meta'))) break;
      }
      const zaharra = LS.get('logos-nire-gela', null);
      if (zaharra && zaharra !== pin) B.remove('rooms/' + zaharra).catch(() => {});
      G.order = eraikiOrdena(m);
      await B.set('rooms/' + pin, {
        meta: { host: B.uid, createdAt: B.TS, level: m.id, izena: izenaLuzea(m), state: 'lobby', qIndex: -1, total: G.order.length },
        order: G.order
      });
      Object.assign(G, { pin, level: m.id, qIndex: -1, scores: {}, players: {}, reselect: false });
      sessionStorage.setItem('logos-host-pin', pin);
      LS.set('logos-nire-gela', pin);
      entzunJokalariak();
      erakutsiLobby();
    } catch (e) {
      console.error(e); K.toast('⚠️ Ezin izan da gela sortu: ' + e.message, 6000);
      $('#btn-sortu').disabled = false;
    }
  }

  async function jarraituGelaBerean() {
    const m = K.maila(selLevel);
    G.order = eraikiOrdena(m);
    Object.assign(G, { level: m.id, qIndex: -1, qKey: null, scores: {}, reselect: false });
    await B.update('rooms/' + G.pin, {
      'meta/state': 'lobby', 'meta/level': m.id, 'meta/izena': izenaLuzea(m), 'meta/qIndex': -1, 'meta/qKey': null, 'meta/total': G.order.length,
      order: G.order, answers: null, scores: null, current: null
    });
    erakutsiLobby();
  }

  async function itxiGela() {
    if (!confirm('Gela itxi? Jokalari guztiak kanpoan geratuko dira.')) return;
    clearInterval(G.loop);
    if (G.unsubPl) G.unsubPl();
    if (G.unsubAns) G.unsubAns();
    await B.remove('rooms/' + G.pin).catch(() => {});
    sessionStorage.removeItem('logos-host-pin');
    Object.assign(G, { pin: null, reselect: false, players: {}, scores: {} });
    erakutsiMapa();
  }

  $('#btn-sortu').onclick = () => (G.reselect ? jarraituGelaBerean() : sortuGela());
  $('#btn-itxi-gela').onclick = itxiGela;
  $('#btn-amaitu').onclick = itxiGela;

  // ------------------------------------------------------------------
  //  LOBBY
  // ------------------------------------------------------------------
  function entzunJokalariak() {
    if (G.unsubPl) G.unsubPl();
    G.unsubPl = B.on('rooms/' + G.pin + '/players', v => {
      const aurrekoak = G.players;
      G.players = v || {};
      if (G.state === 'lobby' && Object.keys(G.players).some(k => !aurrekoak[k])) K.sfx.pop();
      marraztuJokalariak();
      eguneratuErantzunKopurua();
    });
  }

  function erakutsiLobby() {
    G.state = 'lobby';
    const m = K.maila(G.level);
    const url = new URL('jokalaria.html?pin=' + G.pin, location.href).href;
    $('#lobby-url').textContent = url.split('?')[0].replace(/^https?:\/\//, '');
    $('#lobby-pin').textContent = G.pin;
    $('#qr').innerHTML = '';
    if (window.QRCode) {
      new QRCode($('#qr'), { text: url, width: 190, height: 190, correctLevel: QRCode.CorrectLevel.M });
      $('#qr').hidden = false;
    } else $('#qr').hidden = true;
    $('#lobby-level').textContent = `${m.ikonoa} ${m.zenbakia}. maila · ${m.izena} — ${m.gaia} · ${G.order.length} galdera`;
    $('#top-info').textContent = 'PIN ' + G.pin;
    $('#top-info').hidden = false;
    marraztuJokalariak();
    K.show('s-lobby');
    K.musika.start();
  }

  function marraztuJokalariak() {
    const ids = Object.keys(G.players).sort((a, b) => (G.players[a].joinedAt || 0) - (G.players[b].joinedAt || 0));
    $('#lobby-count').textContent = ids.length;
    $('#btn-hasi').disabled = !ids.length;
    $('#lobby-players').innerHTML = ids.length
      ? ids.map(id => `<span class="pl kick" data-id="${esc(id)}" title="Sakatu kanporatzeko"><span class="av">${esc(G.players[id].avatar)}</span>${esc(G.players[id].name)}</span>`).join('')
      : '<span class="muted">Jokalarien zain... 🦉</span>';
    $$('#lobby-players .pl').forEach(el => el.onclick = () => {
      const p = G.players[el.dataset.id];
      if (p && confirm('Kanporatu "' + p.name + '"?')) B.remove('rooms/' + G.pin + '/players/' + el.dataset.id);
    });
  }

  $('#btn-hasi').onclick = () => hurrengoGaldera();

  // ------------------------------------------------------------------
  //  GALDERA-ZIKLOA
  // ------------------------------------------------------------------
  async function hurrengoGaldera() {
    K.musika.stop();
    G.qIndex++;
    if (G.qIndex >= G.order.length) return amaiera();
    const q = galdera(G.order[G.qIndex]);
    let idx = q.a.map((_, i) => i);
    if (q.mota !== 'eg') idx = K.shuffle(idx);
    G.q = q;
    G.zuzena = idx.indexOf(q.z);
    G.qKey = 'q' + G.qIndex + '-' + Math.random().toString(36).slice(2, 6);
    G.current = { n: G.qIndex + 1, total: G.order.length, mota: q.mota, m: q.m, a: idx.map(i => q.a[i]), time: denbora(q) };
    sessionStorage.setItem('logos-host-zuzena', JSON.stringify({ qKey: G.qKey, z: G.zuzena }));
    await B.update('rooms/' + G.pin, {
      'meta/state': 'prest', 'meta/qIndex': G.qIndex, 'meta/qKey': G.qKey,
      'meta/jokalariak': Object.keys(G.players).length, current: G.current
    });
    G.state = 'prest';
    $('#prest-num').textContent = `${G.qIndex + 1}. galdera / ${G.order.length}`;
    $('#prest-type').textContent = K.MOTA[q.mota];
    $('#prest-text').textContent = q.mota === 'aipua' ? '«' + q.m.replace(/^"|"$/g, '') + '»' : q.m;
    $('#prest-text').classList.toggle('quote', q.mota === 'aipua');
    K.show('s-prest');
    for (let s = 3; s >= 1; s--) {
      const cd = $('#prest-cd');
      cd.textContent = s; cd.style.animation = 'none'; void cd.offsetWidth; cd.style.animation = '';
      K.sfx.tick();
      await K.sleep(1000);
    }
    await hasiErantzunak(false);
  }

  async function hasiErantzunak(berreskuratzen) {
    if (!berreskuratzen) await B.update('rooms/' + G.pin, { 'meta/state': 'galdera', 'current/startAt': B.TS });
    G.state = 'galdera';
    G.startAt = (await B.get('rooms/' + G.pin + '/current/startAt')) || B.now();
    G.revealing = false;
    G.answers = {};

    const q = G.current;
    $('#q-num').textContent = `${q.n}. galdera / ${q.total}`;
    $('#q-type').textContent = K.MOTA[q.mota];
    $('#q-text').textContent = q.mota === 'aipua' ? '«' + q.m.replace(/^"|"$/g, '') + '»' : q.m;
    $('#q-text').classList.toggle('quote', q.mota === 'aipua');
    $('#q-answers').className = 'answers' + (q.a.length === 2 ? ' two' : '');
    $('#q-answers').innerHTML = q.a.map((t, i) => K.ansHTML(q.mota, i, t)).join('');
    $('#q-answered').textContent = '0';
    K.show('s-galdera');

    if (G.unsubAns) G.unsubAns();
    G.unsubAns = B.on('rooms/' + G.pin + '/answers/' + G.qKey, v => { G.answers = v || {}; eguneratuErantzunKopurua(); });

    clearInterval(G.loop);
    const T = q.time * 1000;
    let azkenSeg = null;
    G.loop = setInterval(() => {
      const geratzen = Math.max(0, T - (B.now() - G.startAt));
      const seg = Math.ceil(geratzen / 1000);
      $('#timer-num').textContent = seg;
      $('#timer-arc').style.strokeDashoffset = 276.5 * (1 - geratzen / T);
      $('#timer-arc').style.stroke = seg <= 5 ? '#e5484d' : '#f5c542';
      $('#timer').classList.toggle('low', seg <= 5);
      if (seg !== azkenSeg && seg <= 5 && seg > 0) K.sfx.tick();
      azkenSeg = seg;
      const nPl = Object.keys(G.players).length;
      const nAns = Object.keys(G.answers).filter(id => G.players[id]).length;
      if (geratzen <= 0 || (nPl > 0 && nAns >= nPl)) erakutsiEmaitza();
    }, 150);
  }

  function eguneratuErantzunKopurua() {
    if (G.state !== 'galdera') return;
    $('#q-answered').textContent = Object.keys(G.answers).filter(id => G.players[id]).length + ' / ' + Object.keys(G.players).length;
  }

  $('#btn-saltatu').onclick = () => erakutsiEmaitza();

  function sailkatu(ids) {
    const s = ids.slice().sort((a, b) => ((G.scores[b] || {}).score || 0) - ((G.scores[a] || {}).score || 0));
    const r = {};
    s.forEach((id, i) => {
      const prev = s[i - 1];
      r[id] = (i > 0 && ((G.scores[prev] || {}).score || 0) === ((G.scores[id] || {}).score || 0)) ? r[prev] : i + 1;
    });
    return { ordena: s, postuak: r };
  }

  async function erakutsiEmaitza() {
    if (G.revealing) return;
    G.revealing = true;
    clearInterval(G.loop);
    if (G.unsubAns) { G.unsubAns(); G.unsubAns = null; }
    const erantzunak = (await B.get('rooms/' + G.pin + '/answers/' + G.qKey)) || {};
    const T = G.current.time * 1000;
    const counts = G.current.a.map(() => 0);
    const ids = Object.keys(G.players);
    const aurrekoPostuak = sailkatu(ids).postuak;

    ids.forEach(id => {
      const prev = G.scores[id] || { score: 0, streak: 0, zuzenak: 0 };
      const an = erantzunak[id];
      const erantzun = !!an && typeof an.c === 'number';
      if (erantzun && counts[an.c] !== undefined) counts[an.c]++;
      const ms = erantzun ? (an.t - G.startAt) : T;
      const ok = erantzun && an.c === G.zuzena && ms <= T + 1500;
      const streak = ok ? (prev.streak || 0) + 1 : 0;
      const pts = K.puntuak(ok, ms, T, streak);
      G.scores[id] = { score: (prev.score || 0) + pts, streak, zuzenak: (prev.zuzenak || 0) + (ok ? 1 : 0), last: { q: G.qKey, ok, pts, erantzun } };
    });
    const postuak = sailkatu(ids).postuak;
    const upd = {
      'meta/state': 'emaitza', 'meta/jokalariak': ids.length,
      'current/zuzena': G.zuzena, 'current/counts': counts, 'current/az': G.q.az || ''
    };
    ids.forEach(id => {
      G.scores[id].rank = postuak[id];
      G.scores[id].prevRank = aurrekoPostuak[id] || null;
      upd['scores/' + id] = G.scores[id];
    });
    await B.update('rooms/' + G.pin, upd);
    G.current.zuzena = G.zuzena; G.current.counts = counts; G.current.az = G.q.az || '';
    G.state = 'emaitza';
    marraztuEmaitza();
    K.sfx.gong();
  }

  function marraztuEmaitza() {
    const q = G.current;
    const counts = q.counts || [];
    $('#e-num').textContent = `${q.n}. galdera / ${q.total} · ${K.MOTA[q.mota]}`;
    $('#e-text').textContent = q.mota === 'aipua' ? '«' + q.m.replace(/^"|"$/g, '') + '»' : q.m;
    $('#e-text').classList.toggle('quote', q.mota === 'aipua');
    $('#e-answers').className = 'answers reveal' + (q.a.length === 2 ? ' two' : '');
    $('#e-answers').innerHTML = q.a.map((t, i) => K.ansHTML(q.mota, i, t, `<span class="bar-n">${counts[i] || 0}</span>`)).join('');
    $$('#e-answers .ans').forEach((b, i) => b.classList.add(i === q.zuzena ? 'right' : 'wrong'));
    $('#e-explain').innerHTML = q.az ? '<b>💡 Azalpena:</b> ' + esc(q.az) : '';
    $('#e-explain').hidden = !q.az;
    K.show('s-emaitza');
  }

  $('#btn-e-next').onclick = () => erakutsiSailkapena();

  function lerroa(id, i) {
    const p = G.players[id] || { name: '?', avatar: '❔' };
    const s = G.scores[id] || {};
    const igo = s.prevRank && s.rank && s.prevRank > s.rank ? `<span class="up">▲${s.prevRank - s.rank}</span>` : '';
    const sua = s.streak >= 3 ? ` <span class="streak">🔥${s.streak}</span>` : '';
    return `<div class="row-b" style="animation-delay:${i * 0.08}s"><span class="pos">${s.rank || i + 1}</span><span class="av">${esc(p.avatar)}</span><span>${esc(p.name)}${igo}${sua}</span><span class="sc">${K.fmt(s.score)}</span></div>`;
  }

  async function erakutsiSailkapena() {
    await B.update('rooms/' + G.pin, { 'meta/state': 'sailkapena' });
    G.state = 'sailkapena';
    const ordena = sailkatu(Object.keys(G.players)).ordena;
    $('#board').innerHTML = ordena.slice(0, 5).map(lerroa).join('') || '<p class="muted">Ez dago jokalaririk.</p>';
    $('#btn-s-next').textContent = G.qIndex + 1 >= G.order.length ? '🏆 Podioa ikusi' : 'Hurrengo galdera ▸';
    K.show('s-sailkapena');
  }

  $('#btn-s-next').onclick = () => hurrengoGaldera();

  // ------------------------------------------------------------------
  //  AMAIERA
  // ------------------------------------------------------------------
  async function amaiera() {
    G.qIndex = G.order.length;
    await B.update('rooms/' + G.pin, { 'meta/state': 'amaiera', 'meta/qIndex': G.qIndex, 'meta/jokalariak': Object.keys(G.players).length });
    G.state = 'amaiera';
    if (!eginak.includes(G.level)) { eginak.push(G.level); LS.set('logos-eginak', eginak); }
    const m = K.maila(G.level);
    $('#end-level').textContent = `${m.ikonoa} ${m.zenbakia}. maila · ${m.izena} — amaituta!`;
    const ordena = sailkatu(Object.keys(G.players)).ordena;
    $('#podium').innerHTML = ordena.slice(0, 3).map((id, i) => {
      const p = G.players[id], s = G.scores[id] || {};
      return `<div class="pod p${i + 1}"><div class="av">${esc(p.avatar)}</div><div class="nm">${esc(p.name)}</div><div class="sc">${K.fmt(s.score)} pt · ${s.zuzenak || 0}/${G.order.length} ✔</div><div class="blk">${i + 1}</div></div>`;
    }).join('');
    $('#end-rest').innerHTML = ordena.slice(3, 12).map((id, i) => lerroa(id, i + 3)).join('');
    K.show('s-amaiera');
    K.sfx.fanfare();
    K.konfetia(5000);
  }

  $('#btn-beste').onclick = () => { G.reselect = true; selLevel = null; erakutsiMapa(); };

  $('#btn-csv').onclick = () => {
    const ordena = sailkatu(Object.keys(G.players)).ordena;
    const m = K.maila(G.level);
    const rows = [['Postua', 'Izena', 'Puntuak', 'Zuzenak', 'Galderak', 'Maila']].concat(ordena.map(id => {
      const s = G.scores[id] || {};
      return [s.rank || '', G.players[id].name, s.score || 0, s.zuzenak || 0, G.order.length, m.izena];
    }));
    const txt = '﻿' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = `logos-arena_${m.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  // ------------------------------------------------------------------
  //  TEKLATUA: Enter / Zuriunea = botoi nagusia (aurkezpenetarako)
  // ------------------------------------------------------------------
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (/INPUT|TEXTAREA|BUTTON/.test((document.activeElement || {}).tagName)) return;
    const nagusia = { mapa: '#btn-sortu', lobby: '#btn-hasi', emaitza: '#btn-e-next', sailkapena: '#btn-s-next' }[G.state];
    const b = nagusia && $(nagusia);
    if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });

  // ------------------------------------------------------------------
  //  FITXA FRESKATZEAN: gela berreskuratu
  // ------------------------------------------------------------------
  async function berreskuratu() {
    const pin = sessionStorage.getItem('logos-host-pin');
    if (!pin) return false;
    const gela = await B.get('rooms/' + pin);
    if (!gela || !gela.meta || gela.meta.host !== B.uid) { sessionStorage.removeItem('logos-host-pin'); return false; }
    Object.assign(G, {
      pin, level: gela.meta.level, order: gela.order || [], qIndex: gela.meta.qIndex, qKey: gela.meta.qKey || null,
      scores: gela.scores || {}, players: gela.players || {}, current: gela.current || null
    });
    entzunJokalariak();
    $('#top-info').textContent = 'PIN ' + pin;
    $('#top-info').hidden = false;
    const st = gela.meta.state;
    if (st === 'lobby') { erakutsiLobby(); return true; }
    if (st === 'amaiera') { await amaiera(); return true; }
    G.q = galdera(G.order[G.qIndex]);
    const zz = JSON.parse(sessionStorage.getItem('logos-host-zuzena') || 'null');
    G.zuzena = (zz && zz.qKey === G.qKey) ? zz.z : (G.current && typeof G.current.zuzena === 'number' ? G.current.zuzena : null);
    if (G.zuzena === null || !G.current) { G.qIndex--; await hurrengoGaldera(); return true; }
    if (st === 'prest') { await hasiErantzunak(false); return true; }
    if (st === 'galdera') { await hasiErantzunak(true); return true; }
    if (st === 'emaitza') { G.state = 'emaitza'; marraztuEmaitza(); return true; }
    if (st === 'sailkapena') { await erakutsiSailkapena(); return true; }
    return false;
  }

  if (!(await berreskuratu())) erakutsiMapa();
})();
