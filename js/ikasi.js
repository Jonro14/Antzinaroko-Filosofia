// =====================================================================
//  IKASI: filosofoen denbora-lerroa (SVG, eskala bakarra)
// =====================================================================
(function () {
  'use strict';
  const TALDEAK = {
    pre: { izena: 'Presokratikoak', c: '#22d3ee' },
    ate: { izena: 'Sokrates', c: '#ff4d8d' },
    kla: { izena: 'Platon eta Aristoteles', c: '#f5c542' },
    hel: { izena: 'Helenismoa', c: '#30a46c' }
  };
  // Urteak K.a. (negatiboak). * = apunteetan ez dagoen data ohikoa
  const FIL = [
    ['Tales', -639, -547, 'pre'], ['Anaximandro', -610, -545, 'pre'], ['Anaximenes', -585, -524, 'pre'],
    ['Pitagoras', -570, -495, 'pre'], ['Heraklito', -536, -470, 'pre'], ['Parmenides', -515, -450, 'pre'],
    ['Enpedokles', -490, -430, 'pre'], ['Sokrates*', -470, -399, 'ate'], ['Demokrito', -460, -370, 'pre'],
    ['Platon*', -427, -347, 'kla'], ['Diogenes', -412, -323, 'hel'], ['Aristoteles*', -384, -322, 'kla'],
    ['Pirron', -360, -270, 'hel'], ['Alejandro Magno', -356, -323, 'hel'], ['Epikuro', -341, -270, 'hel'],
    ['Zenon Zitiokoa*', -334, -262, 'hel']
  ];
  const X0 = -650, X1 = -250, W = 1000, L = 150, R = 70, ROW = 24, TOP = 30;
  const H = TOP + FIL.length * ROW + 34;
  const x = y => L + (y - X0) / (X1 - X0) * (W - L - R);
  let s = '';
  // Mendeen bandak eta ardatza
  for (let y = X0; y <= X1; y += 50) {
    const xx = x(y);
    s += `<line x1="${xx}" y1="${TOP - 8}" x2="${xx}" y2="${H - 30}" stroke="rgba(255,255,255,${y % 100 === 0 ? .14 : .06})"/>`;
    if (y % 100 === 0) s += `<text x="${xx}" y="${H - 12}" text-anchor="middle" fill="#a9acd6" font-size="13">K.a. ${-y}</text>`;
  }
  const mendeak = [[-550, 'VI. mendea'], [-450, 'V. mendea'], [-350, 'IV. mendea'], [-275, 'III. m.']];
  mendeak.forEach(([y, t]) => { s += `<text x="${x(y)}" y="${TOP - 12}" text-anchor="middle" fill="#f5c542" font-size="12" font-weight="800">${t}</text>`; });
  FIL.forEach(([n, a, b, g], i) => {
    const yy = TOP + i * ROW, c = TALDEAK[g].c;
    s += `<text x="${L - 10}" y="${yy + 15}" text-anchor="end" fill="#f4f2ff" font-size="13" font-weight="700">${n}</text>`;
    s += `<rect x="${x(a)}" y="${yy + 4}" width="${x(b) - x(a)}" height="14" rx="7" fill="${c}"><title>${n.replace('*', '')}: K.a. ${-a}–${-b}</title></rect>`;
    s += `<text x="${x(b) + 6}" y="${yy + 15}" fill="#a9acd6" font-size="11">${-a}–${-b}</text>`;
  });
  const svg = document.getElementById('tl-svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('font-family', 'Outfit, system-ui, sans-serif');
  svg.innerHTML = s;
  document.getElementById('tl-legend').innerHTML = Object.values(TALDEAK).map(t => `<span style="--c:${t.c}">${t.izena}</span>`).join('') + '<span style="--c:transparent">* data ohikoa</span>';
})();
