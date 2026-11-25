// =====================================================================
//  IKASI (2. blokea): pentsalarien denbora-lerroa (SVG, eskala bakarra)
// =====================================================================
(function () {
  'use strict';
  const TALDEAK = {
    erd: { izena: 'Erdi Aroa', c: '#c7353a' },
    ber: { izena: 'Berpizkundea eta Ilustrazioa', c: '#d9a930' },
    arr: { izena: 'Arrazionalismoa eta enpirismoa', c: '#3f9660' },
    pol: { izena: 'Politika eta ekonomia', c: '#d27a2a' }
  };
  // Urteak K.o. * = apunteetan ez dagoen data ohikoa
  const FIL = [
    ['Agustin Hiponakoa*', 354, 430, 'erd'], ['Tomas Akinokoa*', 1225, 1274, 'erd'],
    ['Maquiavelo*', 1469, 1527, 'ber'], ['Francis Bacon*', 1561, 1626, 'arr'], ['Galileo*', 1564, 1642, 'ber'],
    ['Hobbes*', 1588, 1679, 'pol'], ['Descartes*', 1596, 1650, 'arr'], ['Locke', 1632, 1704, 'arr'], ['Spinoza*', 1632, 1677, 'arr'],
    ['Berkeley', 1685, 1753, 'arr'], ['Montesquieu*', 1689, 1755, 'ber'], ['Voltaire*', 1694, 1778, 'ber'], ['Hume', 1711, 1776, 'arr'],
    ['Rousseau*', 1712, 1778, 'pol'], ['Adam Smith', 1723, 1790, 'pol'], ['Kant*', 1724, 1804, 'ber'], ['Marx*', 1818, 1883, 'pol']
  ];
  const X0 = 300, X1 = 1900, W = 1000, L = 160, R = 70, ROW = 24, TOP = 34;
  const H = TOP + FIL.length * ROW + 34;
  const x = y => L + (y - X0) / (X1 - X0) * (W - L - R);
  let s = '';
  // Mendeen bandak eta ardatza
  for (let y = 400; y <= 1900; y += 100) {
    const xx = x(y);
    s += `<line x1="${xx}" y1="${TOP - 8}" x2="${xx}" y2="${H - 30}" stroke="rgba(255,255,255,${y % 500 === 0 ? .16 : .06})"/>`;
    if (y % 200 === 0) s += `<text x="${xx}" y="${H - 12}" text-anchor="middle" fill="#cdb994" font-size="13">${y}</text>`;
  }
  const mendeak = [[450, 'V.'], [750, 'VIII.'], [1050, 'XI.'], [1350, 'XIV.'], [1550, 'XVI.'], [1650, 'XVII.'], [1750, 'XVIII.'], [1850, 'XIX.']];
  mendeak.forEach(([y, t]) => { s += `<text x="${x(y)}" y="${TOP - 14}" text-anchor="middle" fill="#f1d070" font-size="12" font-weight="800">${t}</text>`; });
  // Aldiak: Erdi Aroa eta Berpizkundea
  s += `<rect x="${x(1453)}" y="${TOP - 8}" width="${x(1600) - x(1453)}" height="${H - TOP - 22}" fill="rgba(217,169,48,.12)"/>`;
  s += `<text x="${(x(1453) + x(1600)) / 2}" y="${H - 34}" text-anchor="middle" fill="#f1d070" font-size="11" font-weight="800">BERPIZKUNDEA</text>`;
  FIL.forEach(([n, a, b, g], i) => {
    const yy = TOP + i * ROW, c = TALDEAK[g].c;
    s += `<text x="${L - 10}" y="${yy + 15}" text-anchor="end" fill="#f7ebd0" font-size="13" font-weight="700">${n}</text>`;
    s += `<rect x="${x(a)}" y="${yy + 4}" width="${Math.max(6, x(b) - x(a))}" height="14" rx="7" fill="${c}"><title>${n.replace('*', '')}: ${a}–${b}</title></rect>`;
    s += `<text x="${x(b) + 6}" y="${yy + 15}" fill="#cdb994" font-size="11">${a}–${b}</text>`;
  });
  const svg = document.getElementById('tl-svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('font-family', 'Outfit, system-ui, sans-serif');
  svg.innerHTML = s;
  document.getElementById('tl-legend').innerHTML = Object.values(TALDEAK).map(t => `<span style="--c:${t.c}">${t.izena}</span>`).join('') + '<span style="--c:transparent">* data ohikoa</span>';
})();
