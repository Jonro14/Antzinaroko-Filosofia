// =====================================================================
//  HASIERA-ORRIA: ibilbidea, filosofoen txartelak, sartzeko formularioa
// =====================================================================
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Ibilbidea (apunteetako 5 gaiak) ----------
  const IBILBIDEA = [
    { c: '#22d3ee', ico: '🌊', izena: 'Mitotik logosera', data: 'K.a. VI.–V. mendeak · Mileto',
      gakoak: ['Polisak: askatasuna, eztabaida eta arrazoiketa publikoa', 'Mitoa (tradizioa, jainkoak) → logosa (diskurtso arrazionala)', 'Presokratikoak: physis eta arkhea', 'Tales (ura), Anaximandro (apeirona), Anaximenes (airea)', 'Pitagoras (zenbakiak), Heraklito (mugimendua) vs Parmenides (egonkortasuna)', 'Pluralistak: Enpedokles (4 elementu) eta Demokrito (atomoak)'] },
    { c: '#ff4d8d', ico: '🗣️', izena: 'Sofistak eta Sokrates', data: 'K.a. V. mendea · Periklesen Atenas',
      gakoak: ['Sofistak: erretorika-irakasleak; Gorgias eta Aspasia', 'Eszeptizismo epistemologikoa, erlatibismo morala, legeen konbentzionaltasuna', 'Sokrates: antierlatibismo morala eta definizio unibertsalak', 'Intelektualismo morala: "dakienak ongi jokatzen du"', 'Metodoa: ironia + maieutika'] },
    { c: '#f5c542', ico: '🏛️', izena: 'Ideia eta izaera', data: 'K.a. V.–IV. mendeak · Akademia eta Lizeoa',
      gakoak: ['Platon: dualismo ontologikoa (ideien mundua / mundu sentikorra)', 'Dualismo epistemologikoa: doxa vs episteme', 'Haitzuloaren alegoria eta dialektika; oroitzapenaren teoria', 'Aristoteles: hilemorfismoa (materia + forma)', 'Potentzia eta egintza, akzidenteak, lau kausak'] },
    { c: '#7c5cff', ico: '⚖️', izena: 'Etika eta politika', data: 'K.a. IV. mendea · Polisa',
      gakoak: ['Platon: Ongiaren ideia eta espirituzko aristokrazia', 'Dualismo antropologikoa; arimaren hiru zatiak eta bertuteak', 'Hiri ideala: gobernariak, zaintzaileak, produktugileak', 'Aristoteles: arima gorputzaren forma; 3 arima mota', 'Eudaimonia, erdibide justua; "gizakia animalia politikoa da"'] },
    { c: '#30a46c', ico: '📜', izena: 'Helenismoa', data: 'K.a. IV. mendea – K.o. 400 · Alejandria',
      gakoak: ['Alejandro Magno, sinkretismoa eta Alejandriako liburutegia', 'Zinismoa: Antistenes eta Diogenes (parresia)', 'Estoizismoa: Zenon, Seneka, Marko Aurelio (amor fati)', 'Epikureismoa: ataraxia eta aponia', 'Eszeptizismoa: Pirron (afasia eta epokhē)'] }
  ];
  $('#timeline').innerHTML = IBILBIDEA.map((t, i) => `
    <div class="tl-item" style="--c:${t.c}" tabindex="0">
      <div class="tl-dot">${t.ico}</div>
      <div class="tl-card">
        <div class="zbk">${i + 1}. GAIA</div>
        <h3>${esc(t.izena)}</h3>
        <div class="data">${esc(t.data)}</div>
        <ul>${t.gakoak.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
        <div class="more">Gakoak ▾</div>
      </div>
    </div>`).join('');
  document.querySelectorAll('.tl-item').forEach(el => {
    const t = () => { el.classList.toggle('open'); el.querySelector('.more').textContent = el.classList.contains('open') ? 'Itxi ▴' : 'Gakoak ▾'; };
    el.addEventListener('click', t);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
  });

  // ---------- Filosofoak ----------
  const ALDIAK = {
    pre: { izena: 'Presokratikoak', c: '#22d3ee' },
    ate: { izena: 'Sofistak eta Sokrates', c: '#ff4d8d' },
    kla: { izena: 'Platon eta Aristoteles', c: '#f5c542' },
    hel: { izena: 'Helenismoa', c: '#30a46c' }
  };
  const FILOSOFOAK = [
    { a: 'pre', e: '💧', n: 'Tales', y: 'K.a. 639-547 · Mileto', i: 'Arkhea ura da: naturako elementu guztietan errepikatzen den sustantzia. Jainkoek ez dute parte hartzen; arrazoiaz deszifra daitezke naturaren arauak.' },
    { a: 'pre', e: '🌀', n: 'Anaximandro', y: 'K.a. 610-545 · Mileto', i: 'Talesen dizipulua eta kritikoa. Arkhea apeirona da: zehaztugabea, betierekoa eta amaigabea. Hortik bereizten dira hotza eta beroa, bustia eta lehorra.' },
    { a: 'pre', e: '🌬️', n: 'Anaximenes', y: 'K.a. 585-524 · Mileto', i: 'Arkhea airea da, "munduaren arnasa". Rarefakzio eta kondentsazioaren bidez sortzen dira izate guztiak.' },
    { a: 'pre', e: '🔺', n: 'Pitagoras', y: 'K.a. 570-495 · Krotona', i: 'Gauza guztien oinarria zenbakiak dira. Natura hizkuntza matematikoaz ulertzen da, arrazoiaren bidez.' },
    { a: 'pre', e: '🔥', n: 'Heraklito', y: 'K.a. 536-470', i: 'Unibertsoa mugimendu konstantean dago, "jario amaigabe" batean. Dena dago transformazioan.', q: 'Ezin izango zara sekula bi aldiz ibai berean bainatu.' },
    { a: 'pre', e: '🗿', n: 'Parmenides', y: 'K.a. 515-450', i: 'Izatearen egonkortasuna: zentzumenek erakusten duten aldaketa itxurazkoa da; esentzia beti bera da.', q: 'Badena bada eta ez dena ez da.' },
    { a: 'pre', e: '🌍', n: 'Enpedokles', y: 'K.a. 490-430', i: 'Pluralista: lau elementu (ura, sua, airea, lurra) elkartu eta banatzen dira, maitasunaren indarrak bultzatuta.' },
    { a: 'pre', e: '⚛️', n: 'Demokrito', y: 'K.a. 460-370', i: 'Atomismoa: dena partikula ikusezin eta zatiezinez (atomoz) osatuta dago, hutsean mugitzen direnak.', q: 'Egiaz, atomoak eta hutsa baino ez da existitzen.' },
    { a: 'ate', e: '🎭', n: 'Gorgias', y: 'Sofista · K.a. V. mendea', i: 'Eszeptizismo epistemologikoa muturrera: dena aldatzen denez, ezer ezin da ezagutu eta ezagutza absolutua ezinezkoa da.' },
    { a: 'ate', e: '🎓', n: 'Aspasia', y: 'Miletokoa · K.a. V. mendea', i: 'Emakumeen eskola bat gidatu zuen Atenasen. Hitz egiteko eta argudiatzeko gaitasunagatik miretsia, Periklesen aholkulari izan zen.' },
    { a: 'ate', e: '🦉', n: 'Sokrates', y: 'Atenas · K.a. V. mendea', i: 'Ez zuen ezer idatzi. Definizio unibertsalak, intelektualismo morala eta metodoa: ironia + maieutika.', q: 'Ezer ez dakidala soilik dakit.' },
    { a: 'kla', e: '☀️', n: 'Platon', y: 'Atenas · Akademia', i: 'Ideien teoria: ideien mundua da benetako errealitatea, eta Ongiaren ideia da gorena. Haitzuloaren alegoria. Filosofoek gobernatu behar dute.' },
    { a: 'kla', e: '🥚', n: 'Aristoteles', y: 'Platonen ikaslea · Lizeoa', i: 'Hilemorfismoa (materia + forma), potentzia eta egintza, lau kausak. Zoriontasuna (eudaimonia) bertutetsu jokatuz.', q: 'Gizakia animalia politikoa da.' },
    { a: 'hel', e: '🎒', n: 'Antistenes', y: 'Zinismoaren sortzailea', i: 'Sokratesen dizipulua. Zoriona ez dago kanpoko faktoreen mende: bizimodu apala, naturaren arabera.', q: 'Zoriontasuna beharrak murriztean datza, jabetzak handitzean baino gehiago.' },
    { a: 'hel', e: '🛢️', n: 'Diogenes', y: 'Sinopekoa · K.a. 412-323', i: 'Upel batean bizi zen, behar-beharrezkoarekin. Parresia: zintzotasun erradikala, baita Alejandro Handiaren aurrean ere.', q: 'Egin zaitez albo batera, eguzkia estaltzen didazu.' },
    { a: 'hel', e: '🏛️', n: 'Zenon Zitiokoa', y: 'Estoizismoaren sortzailea', i: 'Stoa (ataripea) azpian irakatsi zuen. Logosak gidatzen du natura; arrazoiak pasioak menderatu behar ditu.' },
    { a: 'hel', e: '📖', n: 'Seneka', y: 'Estoikoa', i: 'Amor fati: gure eskuetan ez dagoena onartu. Estoikoek ez zuten politika baztertu.', q: 'Gehien kezkatzen gaituen hori edo aspaldi jazo zen, edo oraindik ez da jazo, edo ez da sekula jazoko.' },
    { a: 'hel', e: '👑', n: 'Marko Aurelio', y: 'Enperadore estoikoa', i: 'Destinoaren onarpena eta humanismo unibertsala: denok partekatzen dugu arrazoitzeko gaitasun bera.', q: 'Alda ezazu alda dezakezuna eta onartu ezazu alda ezin dezakezuna.' },
    { a: 'hel', e: '🌿', n: 'Epikuro', y: 'K.a. 341-270 · Lorategia', i: 'Plazer arrazionala eta neurritsua. Zoriontasunaren bi ardatzak: ataraxia (arimaren lasaitasuna) eta aponia (minik eza).' },
    { a: 'hel', e: '❔', n: 'Pirron', y: 'K.a. 360-270 · Eszeptikoa', i: 'Ezer ezin da benetan ezagutu. Hobe isilik egotea (afasia) eta judizioa etetea (epokhē), ataraxia lortzeko.' }
  ];
  let filtroa = 'denak';
  function marraztuFiltroak() {
    const f = [['denak', 'Denak']].concat(Object.keys(ALDIAK).map(k => [k, ALDIAK[k].izena]));
    $('#filters').innerHTML = f.map(([k, n]) => `<span class="chip ${k === filtroa ? 'on' : ''}" data-f="${k}">${esc(n)}</span>`).join('');
    document.querySelectorAll('#filters .chip').forEach(ch => ch.addEventListener('click', () => { filtroa = ch.dataset.f; marraztuFiltroak(); marraztuFilosofoak(); }));
  }
  function marraztuFilosofoak() {
    $('#phil-grid').innerHTML = FILOSOFOAK.filter(p => filtroa === 'denak' || p.a === filtroa).map(p => {
      const al = ALDIAK[p.a];
      return `<div class="phil" style="--c:${al.c}" tabindex="0">
        <div class="phil-in">
          <div class="phil-face">
            <div class="medal">${p.e}</div>
            <h3>${esc(p.n)}</h3>
            <div class="years">${esc(p.y)}</div>
            <span class="tag">${esc(al.izena)}</span>
          </div>
          <div class="phil-face phil-back">
            <h3>${esc(p.n)}</h3>
            <p class="idea">${esc(p.i)}</p>
            ${p.q ? `<blockquote>"${esc(p.q)}"</blockquote>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
    document.querySelectorAll('.phil').forEach(el => {
      el.addEventListener('click', () => el.classList.toggle('flip'));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('flip'); } });
    });
  }
  marraztuFiltroak();
  marraztuFilosofoak();

  // ---------- Mailak ----------
  $('#levels-strip').innerHTML = (window.LOGOS_MAILAK || []).map(m =>
    `<div class="lv" style="--c:${m.kolorea}"><span>${m.ikonoa}</span><b>${m.zenbakia}. ${esc(m.izena)}</b><span class="muted">${esc(m.gaia)}</span></div>`).join('');

  // ---------- Atzealdeko hitz greziarrak ----------
  const HITZAK = ['λόγος', 'ἀρχή', 'φύσις', 'ἀλήθεια', 'ἀρετή', 'εὐδαιμονία', 'ἄπειρον', 'δόξα', 'ἐπιστήμη', 'ἀταραξία', 'ἐποχή', 'τέλος', 'πόλις', 'κόσμος'];
  $('#floating').innerHTML = HITZAK.map((w, i) => {
    const x = (i * 37) % 100, y = (i * 53) % 90, s = 1.4 + (i % 4) * 0.9, d = 9 + (i % 5) * 3;
    return `<span style="left:${x}%;top:${y}%;font-size:${s}rem;animation-duration:${d}s;animation-delay:-${i}s">${w}</span>`;
  }).join('');

  // ---------- Sartu jokora ----------
  $('#pin').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });
  $('#join-form').addEventListener('submit', e => {
    e.preventDefault();
    const pin = $('#pin').value.trim();
    location.href = 'jokalaria.html' + (pin ? '?pin=' + encodeURIComponent(pin) : '');
  });
})();
