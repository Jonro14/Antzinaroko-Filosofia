// =====================================================================
//  KOMUNA: laguntzaileak, soinuak, konfetia (irakasle eta jokalarientzat)
// =====================================================================
(function () {
  'use strict';
  const K = {};

  K.$ = (s, r) => (r || document).querySelector(s);
  K.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  K.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  K.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  K.fmt = n => Math.round(n || 0).toLocaleString('eu-ES').replace(/,/g, '.');
  K.sleep = ms => new Promise(r => setTimeout(r, ms));

  // Pantaila bakarra erakutsi (data-screen atributua dutenen artean)
  K.show = id => {
    K.$$('[data-screen]').forEach(el => el.classList.toggle('active', el.id === id));
    window.scrollTo(0, 0);
  };

  K.toast = (msg, ms) => {
    let t = K.$('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms || 2600);
  };

  // Erantzun-aukeren kolore eta formak (Kahoot estiloan)
  K.FORMAK = [
    { izena: 'gorria', svg: '<svg viewBox="0 0 32 32"><path d="M16 4 L29 27 H3 Z"/></svg>' },
    { izena: 'urdina', svg: '<svg viewBox="0 0 32 32"><path d="M16 2 L30 16 L16 30 L2 16 Z"/></svg>' },
    { izena: 'horia', svg: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13"/></svg>' },
    { izena: 'berdea', svg: '<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="3"/></svg>' }
  ];

  // Aukeraren kolorea posizioaren arabera (egia = urdina, gezurra = gorria)
  K.kolorea = (mota, pos) => (mota === 'eg' ? [1, 0][pos] : pos);
  K.MOTA = { aukera: 'Aukera anitza', eg: 'Egia ala gezurra?', aipua: 'Nork esan zuen?' };

  // Erantzun-botoi baten HTMLa
  K.ansHTML = (mota, pos, testua, extra) =>
    `<button class="ans c${K.kolorea(mota, pos)}" data-i="${pos}"><span class="shape">${K.FORMAK[K.kolorea(mota, pos)].svg}</span><span class="txt">${K.esc(testua)}</span>${extra || ''}</button>`;

  // Jokalarien abatarrak (gaiarekin lotuak)
  K.ABATARRAK = [
    { e: '🦉', i: 'Atenearen hontza' }, { e: '💧', i: 'Talesen ura' }, { e: '🌬️', i: 'Anaximenesen airea' },
    { e: '🔥', i: 'Heraklitoren sua' }, { e: '🔺', i: 'Pitagorasen triangelua' }, { e: '⚛️', i: 'Demokritoren atomoa' },
    { e: '🐴', i: 'Platonen zaldiaren ideia' }, { e: '🥚', i: 'Aristotelesen arraultza' }, { e: '☀️', i: 'Ongiaren eguzkia' },
    { e: '🛢️', i: 'Diogenesen upela' }, { e: '🌿', i: 'Epikuroren lorategia' }, { e: '🏛️', i: 'Stoa' },
    { e: '🏺', i: 'Anfora' }, { e: '🌊', i: 'Heraklitoren ibaia' }, { e: '🦁', i: 'Ausardia' }, { e: '🌀', i: 'Apeirona' }
  ];

  K.maila = id => (window.LOGOS_MAILAK || []).find(m => m.id === id);

  // ------------------------------------------------------------------
  //  SOINUAK (WebAudio, fitxategirik gabe)
  // ------------------------------------------------------------------
  const S = { on: true, ctx: null, music: null };
  try { S.on = localStorage.getItem('logos-soinua') !== '0'; } catch (e) {}
  function ctx() {
    if (!S.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; S.ctx = new C(); }
    if (S.ctx.state === 'suspended') S.ctx.resume();
    return S.ctx;
  }
  function tone(f, t0, dur, type, vol) {
    const c = ctx(); if (!c || !S.on) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = f;
    const t = c.currentTime + (t0 || 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  K.sfx = {
    tick: () => tone(880, 0, 0.06, 'square', 0.05),
    pop: () => { tone(520, 0, 0.09, 'triangle', 0.15); tone(780, 0.06, 0.12, 'triangle', 0.12); },
    ok: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle', 0.16)),
    bad: () => { tone(220, 0, 0.3, 'sawtooth', 0.08); tone(160, 0.15, 0.4, 'sawtooth', 0.08); },
    gong: () => { tone(196, 0, 1.4, 'sine', 0.25); tone(392, 0, 0.9, 'sine', 0.08); },
    fanfare: () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.32, 'triangle', 0.17))
  };
  // Itxaron-musika: lira itxurako arpegio pentatoniko sinplea
  K.musika = {
    start() {
      if (S.music || !S.on) return;
      const notes = [293.7, 329.6, 392, 440, 523.3, 440, 392, 329.6];
      let i = 0;
      S.music = setInterval(() => {
        const f = notes[i % notes.length] * (Math.floor(i / 16) % 2 ? 1.122 : 1);
        tone(f, 0, 0.5, 'triangle', 0.06);
        if (i % 4 === 0) tone(f / 2, 0, 0.9, 'sine', 0.07);
        i++;
      }, 260);
    },
    stop() { clearInterval(S.music); S.music = null; }
  };
  K.soinuaBotoia = (btn, onChange) => {
    const paint = () => { btn.textContent = S.on ? '🔊' : '🔇'; btn.title = S.on ? 'Soinua: piztuta' : 'Soinua: itzalita'; };
    paint();
    btn.addEventListener('click', () => {
      S.on = !S.on;
      try { localStorage.setItem('logos-soinua', S.on ? '1' : '0'); } catch (e) {}
      if (!S.on) K.musika.stop();
      paint(); if (onChange) onChange(S.on);
    });
  };
  K.soinuaPiztuta = () => S.on;

  // ------------------------------------------------------------------
  //  KONFETIA
  // ------------------------------------------------------------------
  K.konfetia = (ms) => {
    const cv = document.createElement('canvas');
    cv.className = 'konfetia';
    document.body.appendChild(cv);
    const c = cv.getContext('2d');
    const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const cols = ['#f5c542', '#ff4d8d', '#22d3ee', '#7c5cff', '#30a46c', '#ffffff'];
    const ps = Array.from({ length: 160 }, () => ({
      x: Math.random() * W, y: -20 - Math.random() * H * 0.5, r: 4 + Math.random() * 6,
      vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4, a: Math.random() * 6, va: -0.2 + Math.random() * 0.4,
      col: cols[Math.floor(Math.random() * cols.length)]
    }));
    const end = performance.now() + (ms || 4000);
    (function frame(now) {
      c.clearRect(0, 0, W, H);
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a += p.va; p.vy += 0.03;
        if (p.y > H + 20 && now < end) { p.y = -20; p.vy = 2 + Math.random() * 3; }
        c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.col;
        c.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); c.restore();
      });
      if (now < end + 2500) requestAnimationFrame(frame); else cv.remove();
    })(performance.now());
  };

  // Puntuazioa: Kahoot-en antzera, azkarrago = puntu gehiago
  K.puntuak = (zuzena, ms, denboraMs, bolada) => {
    if (!zuzena) return 0;
    const f = Math.min(Math.max(ms / denboraMs, 0), 1);
    const oinarria = Math.round(1000 * (1 - f / 2));           // 500 - 1000
    const bonus = Math.min(Math.max(bolada - 1, 0), 5) * 100;  // bolada: +100 .. +500
    return oinarria + bonus;
  };

  window.K = K;
})();
