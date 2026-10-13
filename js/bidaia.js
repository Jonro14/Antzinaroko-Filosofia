// =====================================================================
//  FILOSOFOAREN BIDAIA · plataforma-jokoa (jolas autonomoa, "Mario" estiloan)
// ---------------------------------------------------------------------
//  - Maila bakoitza (gai bakoitza) alde batetik besterako ibilbide bat da.
//  - Oztopo bakoitzaren aurrean galdera bat agertzen da (Kahoot estiloan):
//      zuzena  -> oztopoa lehertu eta aurrera
//      okerra  -> bizitza bat galdu (3 dituzu), oztopoak eutsi egiten du
//  - 3 bizitzak galduz gero hutsetik hasi behar da. Erronka: sei mailak gainditzea.
//  Galderak js/galderak.js-etik hartzen dira (ikasgelako jokoaren banku bera).
// =====================================================================
(function () {
  'use strict';
  const { $, $$, esc } = K;

  // ------------------------------------------------------------------
  //  EZARPENAK
  // ------------------------------------------------------------------
  const W = 960, H = 540, GROUND = 450;
  const OZT_KOP = 6;            // oztopoak maila bakoitzeko
  const BIZITZAK = 3;
  const LUZERA = 3900;          // mailaren luzera (px)
  const ABIADURA = 270, GRAVITATEA = 1900, SALTOA = 700;
  const SKY = {
    mileto: ['#6ec6ef', '#d8f3ff'], agora: ['#f39a82', '#ffe3bd'], akademia: ['#efc04e', '#fff0c4'],
    polis: ['#7567d6', '#ddd4ff'], alejandria: ['#35a57d', '#cbf1de'], olinpo: ['#ff7f3a', '#ffd9a8']
  };
  const OZTOPOA = { mileto: '🍄', agora: '🏺', akademia: '🗿', polis: '⚖️', alejandria: '📜', olinpo: '⚡' };
  const MAILAK = window.LOGOS_MAILAK;

  const cv = $('#cv'), ctx = cv.getContext('2d');
  let onena = 0;
  try { onena = +localStorage.getItem('bidaia-onena') || 0; } catch (e) {}

  // ------------------------------------------------------------------
  //  EGOERA
  // ------------------------------------------------------------------
  const G = {
    mode: 'hasiera',            // hasiera | joko | galdera | amaituta | bukatuta
    lvl: 0, bizitzak: BIZITZAK, txanponak: 0, okerrak: 0, zuzenak: 0,
    p: null, oz: [], tx: [], parts: [], pool: [], kam: 0, t: 0, hurt: 0, flag: LUZERA - 260,
    gaindituak: 0
  };
  const keys = { left: false, right: false, jump: false };

  // ------------------------------------------------------------------
  //  MAILA ERAIKI
  // ------------------------------------------------------------------
  function galderaPoola(m) {
    let idx = m.galderak.map((_, i) => ({ l: m.id, i }));
    if (m.nahasia) {   // Olinpo: berezkoak + beste mailetako batzuk
      const besteak = MAILAK.filter(x => !x.nahasia).flatMap(x => x.galderak.map((_, i) => ({ l: x.id, i })));
      idx = idx.concat(K.shuffle(besteak).slice(0, 16));
    }
    return K.shuffle(idx);
  }

  function hasiMaila(n) {
    const m = MAILAK[n];
    G.lvl = n;
    G.pool = galderaPoola(m);
    const lehena = 640, azkena = LUZERA - 760;
    G.oz = Array.from({ length: OZT_KOP }, (_, i) => ({
      x: Math.round(lehena + i * (azkena - lehena) / (OZT_KOP - 1)), cleared: false, pop: 0, bob: Math.random() * 6
    }));
    G.tx = [];
    G.oz.forEach((o, i) => {
      const hasiera = i === 0 ? 220 : G.oz[i - 1].x + 120;
      for (let k = 0; k < 4; k++) {
        const x = hasiera + k * ((o.x - 120 - hasiera) / 4) + 60;
        G.tx.push({ x, y: GROUND - 62 - Math.sin(k / 3 * Math.PI) * 60, got: false });
      }
    });
    G.p = { x: 90, y: GROUND, vy: 0, vx: 0, face: 1, ground: true, anim: 0 };
    G.parts = [];
    G.kam = 0; G.hurt = 0; G.gaindituak = 0;
    G.mode = 'joko';
    pantailaZaharrak();
    eguneratuHUD();
    banner(m);
    saveOnena();
  }

  function saveOnena() {
    if (G.lvl + 1 > onena) { onena = G.lvl + 1; try { localStorage.setItem('bidaia-onena', onena); } catch (e) {} }
  }

  function berrasi() {
    G.bizitzak = BIZITZAK; G.txanponak = 0; G.okerrak = 0; G.zuzenak = 0;
    hasiMaila(0);
  }

  // ------------------------------------------------------------------
  //  HUD ETA PANTAILAK
  // ------------------------------------------------------------------
  function bizitzaTestua() { return '❤️'.repeat(G.bizitzak) + '🖤'.repeat(BIZITZAK - G.bizitzak); }
  function eguneratuHUD() {
    const m = MAILAK[G.lvl];
    $('#h-level').textContent = `${m.ikonoa} ${G.lvl + 1}/${MAILAK.length} · ${m.izena}`;
    $('#h-lives').textContent = bizitzaTestua();
    $('#h-obst').textContent = `${OZTOPOA[m.id]} ${G.gaindituak}/${OZT_KOP}`;
    $('#h-coins').textContent = `🪙 ${G.txanponak}`;
  }
  function pantailaZaharrak() { $$('.bd-ov').forEach(o => { o.hidden = true; }); }
  function banner(m) {
    const b = $('#banner');
    b.hidden = true; void b.offsetWidth;
    b.innerHTML = `${m.ikonoa} ${m.zenbakia}. maila · ${esc(m.izena)}<small>${esc(m.gaia || '')}</small>`;
    b.hidden = false;
    clearTimeout(banner.h); banner.h = setTimeout(() => { b.hidden = true; }, 2700);
  }
  function jarri(id) { pantailaZaharrak(); $('#' + id).hidden = false; }

  // Hasierako pantailako ibilbidea
  $('#route').innerHTML = MAILAK.map(m => {
    const argia = ['#f5c542', '#ffde7a'].includes((m.kolorea || '').toLowerCase());
    return `<span class="st ${argia ? 'dark' : ''}" style="background:${m.kolorea}">${m.ikonoa} ${esc(m.izena)}</span>`;
  }).join('');
  if (onena > 1) $('#best').textContent = `Zure marka: ${Math.min(onena, MAILAK.length)}. geldialdira iritsi zara.`;

  // ------------------------------------------------------------------
  //  GALDERA (Kahoot estiloan)
  // ------------------------------------------------------------------
  let galderaUnekoa = null;
  function hurrengoGaldera() {
    if (!G.pool.length) G.pool = galderaPoola(MAILAK[G.lvl]);
    const ref = G.pool.pop();
    return { ref, q: K.maila(ref.l).galderak[ref.i] };
  }

  function irekiGaldera(oz) {
    G.mode = 'galdera';
    keys.left = keys.right = keys.jump = false; $$('.bd-touch button').forEach(b => b.classList.remove('on'));
    const { q } = hurrengoGaldera();
    let idx = q.a.map((_, i) => i);
    if (q.mota !== 'eg') idx = K.shuffle(idx);
    const zuzena = idx.indexOf(q.z);
    galderaUnekoa = { oz, q, zuzena, erantzunda: false };
    $('#qz-type').textContent = K.MOTA[q.mota] || '';
    $('#qz-lives').textContent = bizitzaTestua();
    $('#qz-text').textContent = q.mota === 'aipua' ? '«' + q.m.replace(/^"|"$/g, '') + '»' : q.m;
    $('#qz-text').classList.toggle('quote', q.mota === 'aipua');
    const A = $('#qz-answers');
    A.className = 'answers bd-answers' + (q.a.length === 2 ? ' two' : '');
    A.innerHTML = idx.map((i, pos) => K.ansHTML(q.mota, pos, q.a[i])).join('');
    $$('.ans', A).forEach(b => b.onclick = () => erantzun(+b.dataset.i));
    $('#qz-fb').hidden = true;
    jarri('ov-quiz');
    K.sfx.pop();
  }

  function erantzun(pos) {
    const g = galderaUnekoa;
    if (!g || g.erantzunda) return;
    g.erantzunda = true;
    const ok = pos === g.zuzena;
    const A = $('#qz-answers');
    A.classList.add('reveal');
    $$('.ans', A).forEach(b => {
      const i = +b.dataset.i;
      b.disabled = true;
      b.classList.add(i === g.zuzena ? 'right' : 'wrong');
      if (!ok && i === pos) b.classList.add('picked-bad');
    });
    const head = $('#qz-fbhead');
    if (ok) {
      head.className = 'bd-fbhead ok'; head.textContent = '✔ Zuzena! Bidea libre dago.';
      G.zuzenak++; K.sfx.ok();
    } else {
      G.bizitzak--; G.okerrak++;
      head.className = 'bd-fbhead bad';
      head.textContent = G.bizitzak > 0 ? `✖ Okerra. Bizitza bat galdu duzu (${G.bizitzak} geratzen zaizkizu).` : '✖ Okerra. Azken bizitza galdu duzu...';
      K.sfx.bad(); if (navigator.vibrate) navigator.vibrate(150);
      $('#qz-lives').textContent = bizitzaTestua();
      const h = $('#h-lives'); h.classList.remove('hit'); void h.offsetWidth; h.classList.add('hit');
    }
    $('#qz-az').innerHTML = (ok ? '' : `<b>Erantzun zuzena:</b> ${esc(g.q.a[g.q.z])}<br>`) + esc(g.q.az || '');
    $('#qz-next').textContent = (!ok && G.bizitzak <= 0) ? 'Jarraitu ▸' : (ok ? 'Aurrera! ▸' : 'Berriro saiatu ▸');
    $('#qz-fb').hidden = false;
    eguneratuHUD();
    $('#qz-next').focus({ preventScroll: true });
    g.ok = ok;
  }

  $('#qz-next').onclick = () => {
    const g = galderaUnekoa;
    if (!g || !g.erantzunda) return;
    galderaUnekoa = null;
    pantailaZaharrak();
    if (g.ok) {
      g.oz.cleared = true; g.oz.pop = 1; G.gaindituak++;
      fx(g.oz.x, GROUND - 28, 26, ['#f5c542', '#ffde7a', '#ff4d8d', '#22d3ee', '#fff']);
      G.p.vy = -SALTOA * 0.9; G.p.ground = false;
      G.mode = 'joko';
      eguneratuHUD();
    } else if (G.bizitzak <= 0) {
      gameOver();
    } else {
      G.p.x = Math.max(60, g.oz.x - 280); G.p.vy = -420; G.p.ground = false; G.hurt = 1;
      G.mode = 'joko';
    }
  };

  // ------------------------------------------------------------------
  //  AMAIERAK
  // ------------------------------------------------------------------
  function gameOver() {
    G.mode = 'bukatuta';
    $('#go-msg').textContent = `${G.lvl + 1}. geldialdian (${MAILAK[G.lvl].izena}) gelditu zara, ${G.gaindituak} oztopo gaindituta. Ez da ezer gertatzen: errepasatu apunteak eta hasi berriro!`;
    jarri('ov-over');
  }
  function mailaGaindituta() {
    G.mode = 'amaituta';
    keys.left = keys.right = keys.jump = false;
    K.sfx.fanfare(); K.konfetia(2500);
    if (G.lvl >= MAILAK.length - 1) {
      $('#win-msg').textContent = `Sei geldialdiak zeharkatu dituzu: ${G.zuzenak} erantzun zuzen, ${G.okerrak} oker eta ${G.txanponak} txanpon. Filosofo ona zara!`;
      saveOnena();
      jarri('ov-win'); K.konfetia(6000);
      return;
    }
    const hurrengoa = MAILAK[G.lvl + 1];
    $('#lv-ico').textContent = MAILAK[G.lvl].ikonoa;
    $('#lv-title').textContent = `${MAILAK[G.lvl].izena} gaindituta!`;
    $('#lv-msg').textContent = `Hurrengo geldialdia: ${hurrengoa.ikonoa} ${hurrengoa.izena} · ${hurrengoa.gaia || ''}. Bizitzak: ${bizitzaTestua()}`;
    jarri('ov-level');
  }
  $('#lv-next').onclick = () => hasiMaila(G.lvl + 1);
  $('#go-again').onclick = () => berrasi();
  $('#win-again').onclick = () => berrasi();
  $('#btn-hasi').onclick = () => { K.sfx.pop(); berrasi(); };
  K.soinuaBotoia($('#btn-soinua'));

  // ------------------------------------------------------------------
  //  KONTROLAK
  // ------------------------------------------------------------------
  const MAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump' };
  addEventListener('keydown', e => {
    const k = MAP[e.key];
    if (!k || G.mode !== 'joko') return;
    if (/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName)) return;
    e.preventDefault(); keys[k] = true;
  });
  addEventListener('keyup', e => { const k = MAP[e.key]; if (k) keys[k] = false; });
  addEventListener('blur', () => { keys.left = keys.right = keys.jump = false; });
  $$('.bd-touch button').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); keys[k] = true; b.classList.add('on'); };
    const off = e => { e.preventDefault(); keys[k] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
  });
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) $('#touch').hidden = false;

  // ------------------------------------------------------------------
  //  FISIKA
  // ------------------------------------------------------------------
  function fx(x, y, n, cols) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 280;
      G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 180, life: 0.7 + Math.random() * 0.5, c: cols[i % cols.length], r: 3 + Math.random() * 4 });
    }
  }

  function eguneratu(dt) {
    G.t += dt;
    G.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 900 * dt; q.life -= dt; });
    G.parts = G.parts.filter(q => q.life > 0);
    G.oz.forEach(o => { if (o.pop > 0) o.pop = Math.max(0, o.pop - dt * 2.2); });
    if (G.hurt > 0) G.hurt = Math.max(0, G.hurt - dt);
    if (G.mode !== 'joko' && G.mode !== 'amaituta') return;

    const p = G.p;
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (G.mode === 'joko') {
      p.vx = dir * ABIADURA;
      if (dir) p.face = dir;
      if (keys.jump && p.ground) { p.vy = -SALTOA; p.ground = false; K.sfx.tick(); }
    } else p.vx = 0;
    p.x = Math.max(30, Math.min(LUZERA - 40, p.x + p.vx * dt));
    p.vy += GRAVITATEA * dt; p.y += p.vy * dt;
    if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.ground = true; }
    p.anim += dt * (Math.abs(p.vx) > 0 && p.ground ? 1 : 0.2);

    if (G.mode !== 'joko') return;

    // txanponak
    G.tx.forEach(c => {
      if (!c.got && Math.abs(c.x - p.x) < 34 && Math.abs(c.y - (p.y - 40)) < 60) {
        c.got = true; G.txanponak++; K.sfx.tick(); eguneratuHUD();
        fx(c.x, c.y, 6, ['#ffde7a', '#fff']);
      }
    });
    // oztopoak: hurbiltzean galdera
    for (const o of G.oz) {
      if (!o.cleared && p.x + 20 >= o.x - 46) { p.x = Math.min(p.x, o.x - 66); irekiGaldera(o); return; }
    }
    // helmuga
    if (p.x >= G.flag && G.gaindituak >= OZT_KOP) mailaGaindituta();
  }

  // ------------------------------------------------------------------
  //  MARRAZKETA
  // ------------------------------------------------------------------
  function zerua(m) {
    const c = SKY[m.id] || SKY.mileto;
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // eguzkia
    ctx.fillStyle = 'rgba(255,250,220,.85)';
    ctx.beginPath(); ctx.arc(780 - G.kam * 0.03, 90, 38, 0, 7); ctx.fill();
    // hodeiak
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 6; i++) {
      const x = ((i * 330 - G.kam * 0.12 + G.t * 8) % (W + 300) + W + 300) % (W + 300) - 150, y = 60 + (i % 3) * 52;
      ctx.beginPath(); ctx.ellipse(x, y, 54, 16, 0, 0, 7); ctx.ellipse(x + 30, y - 10, 36, 16, 0, 0, 7); ctx.ellipse(x - 30, y - 6, 30, 12, 0, 0, 7); ctx.fill();
    }
    // urrutiko mendiak
    ctx.fillStyle = 'rgba(40,60,110,.22)';
    ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= W; x += 40) { const wx = x + G.kam * 0.2; ctx.lineTo(x, GROUND - 90 - Math.sin(wx * 0.006) * 50 - Math.sin(wx * 0.017) * 22); }
    ctx.lineTo(W, GROUND); ctx.fill();
    // erdiko planoa: tenplu eta zutabeak
    for (let i = -1; i < 7; i++) {
      const bx = ((i * 380 - G.kam * 0.5) % 2660 + 2660) % 2660 - 200;
      ctx.fillStyle = 'rgba(255,245,225,.38)';
      if (i % 2 === 0) {
        ctx.fillRect(bx, GROUND - 120, 150, 14);
        for (let k = 0; k < 5; k++) ctx.fillRect(bx + 10 + k * 28, GROUND - 106, 14, 106);
        ctx.beginPath(); ctx.moveTo(bx - 8, GROUND - 120); ctx.lineTo(bx + 75, GROUND - 168); ctx.lineTo(bx + 158, GROUND - 120); ctx.fill();
      } else {
        ctx.fillRect(bx + 20, GROUND - 78, 12, 78); ctx.fillRect(bx + 90, GROUND - 56, 12, 56); ctx.fillRect(bx + 14, GROUND - 88, 24, 10);
      }
    }
  }

  function lurra(m) {
    const k = m.kolorea || '#f5c542';
    ctx.fillStyle = '#8b6a3f'; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#6fbf6a'; ctx.fillRect(0, GROUND, W, 12);
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    const off = -(G.kam % 60);
    for (let x = off; x < W; x += 60) { ctx.fillRect(x, GROUND + 12, 2, H); }
    for (let y = GROUND + 42; y < H; y += 30) ctx.fillRect(0, y, W, 2);
    ctx.fillStyle = k; ctx.globalAlpha = .55; ctx.fillRect(0, GROUND + 12, W, 5); ctx.globalAlpha = 1;
  }

  function marraztuOztopoa(o, m) {
    const sx = o.x - G.kam;
    if (sx < -80 || sx > W + 80) return;
    if (o.cleared) { return; }
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(sx, GROUND + 6, 34, 8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#000';   // emojiaren opakotasuna
    ctx.font = '64px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(OZTOPOA[m.id] || '🍄', sx, GROUND + 4);
    // "?" blokea
    const by = GROUND - 110 + Math.sin(G.t * 3 + o.bob) * 5;
    ctx.fillStyle = '#f5c542'; ctx.strokeStyle = '#8a5a1c'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(sx - 20, by - 20, 40, 40, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a5a1c'; ctx.font = '900 28px Outfit, sans-serif'; ctx.fillText('?', sx, by + 10);
    ctx.restore();
  }

  function marraztuTxanpona(c) {
    const sx = c.x - G.kam;
    if (sx < -20 || sx > W + 20) return;
    const w = Math.abs(Math.cos(G.t * 4 + c.x * 0.02)) * 9 + 2;
    ctx.fillStyle = '#ffd24a'; ctx.strokeStyle = '#b57d12'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, c.y + Math.sin(G.t * 3 + c.x) * 3, w, 11, 0, 0, 7); ctx.fill(); ctx.stroke();
  }

  function marraztuHelmuga() {
    const sx = G.flag - G.kam;
    if (sx < -300 || sx > W + 100) return;
    // tenpluaren atea
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(sx + 120, GROUND - 150, 190, 14);
    for (let k = 0; k < 4; k++) { ctx.fillStyle = '#f7f0df'; ctx.fillRect(sx + 128 + k * 46, GROUND - 136, 22, 136); }
    ctx.fillStyle = '#e1d6b8'; ctx.beginPath(); ctx.moveTo(sx + 112, GROUND - 150); ctx.lineTo(sx + 215, GROUND - 205); ctx.lineTo(sx + 318, GROUND - 150); ctx.fill();
    // bandera
    ctx.fillStyle = '#ddd'; ctx.fillRect(sx, GROUND - 190, 6, 190);
    const bat = G.gaindituak >= OZT_KOP;
    ctx.fillStyle = bat ? '#2fbf71' : '#e5484d';
    ctx.beginPath(); ctx.moveTo(sx + 6, GROUND - 188); ctx.lineTo(sx + 70 + Math.sin(G.t * 5) * 4, GROUND - 168); ctx.lineTo(sx + 6, GROUND - 148); ctx.fill();
    ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.arc(sx + 3, GROUND - 194, 7, 0, 7); ctx.fill();
  }

  function marraztuPertsonaia() {
    const p = G.p;
    const sx = p.x - G.kam;
    if (G.hurt > 0 && Math.floor(G.t * 14) % 2) return;   // keinuka kolpea hartzean
    ctx.save();
    ctx.translate(sx, p.y);
    ctx.scale(p.face, 1);
    const mov = Math.abs(p.vx) > 1 && p.ground;
    const sw = mov ? Math.sin(p.anim * 14) * 9 : 0;
    const air = p.ground ? 0 : -4;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 6 - p.y + GROUND, 22, 6, 0, 0, 7); ctx.fill();
    ctx.lineCap = 'round'; ctx.strokeStyle = '#d9a066'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(-6 + sw, air); ctx.moveTo(8, -22); ctx.lineTo(8 - sw, air); ctx.stroke();
    ctx.fillStyle = '#7a4b22'; ctx.fillRect(-6 + sw - 8, air - 3, 16, 7); ctx.fillRect(8 - sw - 8, air - 3, 16, 7);
    // toga
    ctx.fillStyle = '#fbf6ea'; ctx.beginPath(); ctx.moveTo(-17, -22); ctx.lineTo(-12, -62); ctx.lineTo(14, -62); ctx.lineTo(19, -22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#cdbf98'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#d9a43a'; ctx.fillRect(-15, -40, 32, 6);
    // besoa
    ctx.strokeStyle = '#e8b684'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(10, -56); ctx.lineTo(24 + sw * 0.4, -42 + (p.ground ? 0 : -14)); ctx.stroke();
    // burua
    ctx.fillStyle = '#e8b684'; ctx.beginPath(); ctx.arc(1, -74, 14, 0, 7); ctx.fill();
    ctx.fillStyle = '#4a2f1b'; ctx.beginPath(); ctx.arc(-1, -78, 14, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();   // ilea
    // lorez egindako koroa
    ctx.fillStyle = '#3fae5a';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-12 + i * 5, -87 + Math.abs(i - 2.5) * 1.3, 4, 2.4, -0.4, 0, 7); ctx.fill(); }
    // begia
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(8, -74, 2.2, 0, 7); ctx.fill();
    ctx.restore();
  }

  function marraztu() {
    const m = MAILAK[G.lvl] || MAILAK[0];
    zerua(m); lurra(m);
    if (G.mode === 'hasiera' || !G.p) {
      ctx.fillStyle = 'rgba(0,0,0,.0)';
      return;
    }
    // kamera
    G.kam += (Math.max(0, Math.min(LUZERA - W, G.p.x - 340)) - G.kam) * 0.18;
    marraztuHelmuga();
    G.tx.forEach(marraztuTxanpona);
    G.oz.forEach(o => marraztuOztopoa(o, m));
    marraztuPertsonaia();
    G.parts.forEach(q => { ctx.globalAlpha = Math.max(0, Math.min(1, q.life * 1.6)); ctx.fillStyle = q.c; ctx.fillRect(q.x - G.kam, q.y, q.r, q.r); });
    ctx.globalAlpha = 1;
    // aurrerapen-barra
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(20, 18, 220, 8);
    ctx.fillStyle = m.kolorea || '#f5c542'; ctx.fillRect(20, 18, 220 * Math.min(1, G.p.x / G.flag), 8);
  }

  // ------------------------------------------------------------------
  //  BIZIKLETA
  // ------------------------------------------------------------------
  function dimentsioak() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', dimentsioak);
  dimentsioak();

  let azkena = performance.now();
  function begizta(now) {
    const dt = Math.min(0.05, (now - azkena) / 1000); azkena = now;
    try { eguneratu(dt); marraztu(); } catch (e) { console.error(e); }
    requestAnimationFrame(begizta);
  }
  eguneratuHUD();
  requestAnimationFrame(begizta);

  // Probetarako: kanpotik egoera aztertzeko
  window.BIDAIA = { G, keys };
})();
