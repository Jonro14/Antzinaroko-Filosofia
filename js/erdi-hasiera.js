// =====================================================================
//  HASIERA-ORRIA (2. blokea): ibilbidea, pentsalarien txartelak, sartzeko formularioa
// =====================================================================
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Ibilbidea (apunteetako 7 gaiak) ----------
  const IBILBIDEA = [
    { c: '#c7353a', ico: '⛪', izena: 'Agustin eta Tomas', data: 'Erdi Aroa · Hipona eta Akino',
      gakoak: ['Agustin: Jainkoa (izaki absolutua) eta izaki kontingenteak; ideia eredugarriak', 'Liberum Arbitrium, gaitza = ongiaren ausentzia, Jainkoaren grazia', 'Historiaren filosofia: Lurreko Hiria eta Jainkoaren Hiria; Platonen eragina', 'Tomas: Jainkoaren existentziarako bost ibilbideak eta Jainkoaren izaera', 'Etika eta politika: lau legeak eta lege naturala; Aristotelesen eragina'] },
    { c: '#4a82cc', ico: '🕯️', izena: 'Fedea eta arrazoia', data: 'Erdi Aroa · ezagutzaren arazoa',
      gakoak: ['Agustin: Egiaren bilaketa; "Credo ut intelligam, intelligo ut credam"', 'Hiru ezagutza-maila: sentikorra, arrazoizkoa eta kontenplazioa', 'Tomas: fedea eta arrazoimena, Egiara iristeko bi modu', 'Hiru egia-mota: arrazoimenarenak, fedearenak eta biak', 'Arrazoia ezagutza fidagarria da, baina fedearen mende'] },
    { c: '#d9a930', ico: '🎨', izena: 'Berpizkundea eta Ilustrazioa', data: 'XV.–XVIII. mendeak · Italia eta Europa',
      gakoak: ['Berpizkundea (1453-1600): antropozentrismoa eta humanismoa', 'Eraldaketa politiko-ekonomikoa: Estatu modernoa eta burgesia', 'Iraultza zientifikoa: Galileo, Kepler, Newton; inprenta', 'Ilustrazioa, Argien Mendea: "Sapere aude"', 'Pentsamendu askea, arrazoia, hezkuntza, humanismoa, eraldaketa politikoa'] },
    { c: '#3f9660', ico: '🌊', izena: 'Arrazionalismoa eta enpirismoa', data: 'XVII.–XVIII. mendeak · Kontinentea eta uhartea',
      gakoak: ['Arrazionalismoa: konfiantza arrazoian, jatorrizko ideiak, metodo deduktibo-matematikoa', 'Descartes eta Spinoza', 'Enpirismoa: esperientzia da ezagutzaren oinarria; metodo induktiboa', 'Locke: tabula rasa, ideia bakunak eta konplexuak', 'Berkeley (esse est percipi) eta Hume (inpresioak eta ideiak)'] },
    { c: '#8d55b3', ico: '🔭', izena: 'Descartes eta substantziak', data: 'XVII. mendea · Aro Modernoko metafisika',
      gakoak: ['Metodoa: nabaritasuna, analisia, sintesia eta berrikusketa', 'Zalantza metodikoa eta lehen ziurtasuna: cogitoa', 'Hiru ideia-mota: adbentiziak, faktiziak eta jatorrizkoak', 'Jainkoaren hiru frogak eta munduaren existentzia', 'Res cogitans, res extensa, res infinita; grinak eta askatasuna'] },
    { c: '#d27a2a', ico: '🐉', izena: 'Gizartea eta boterea', data: 'Berpizkundea eta Aro Modernoa · politika',
      gakoak: ['Gizakia animalia soziala; Aristotelesen eta Tomasen ikuspegia', 'Maquiavelo: errealismo politikoa; lehoia eta azeria', 'Kontratualismoa: Hobbes (Leviatan), Locke eta Rousseau', 'Egoera naturala, eskubide naturalak, borondate orokorra', 'Marx: Estatua klase dominatzailearen tresna'] },
    { c: '#1fa5a0', ico: '⚖️', izena: 'Liberalismoa eta kapitalismoa', data: 'XVIII. mendea · merkatu askea',
      gakoak: ['Liberalismoa: Lockerenak, indibiduoaren askatasuna erdigunean', 'Jabetza eta merkatu askea: Adam Smith (1776)', 'Esku ikusezina, lan-banaketa eta laissez faire', 'Lehia eta lankidetza; burgesia eta iraultza liberalak', 'Berdintasun formala vs materiala: liberalismoaren ifrentzua'] }
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

  // ---------- Pentsalariak ----------
  const ALDIAK = {
    erd: { izena: 'Erdi Aroa', c: '#c7353a' },
    ber: { izena: 'Berpizkundea eta Ilustrazioa', c: '#d9a930' },
    arr: { izena: 'Arrazionalismoa eta enpirismoa', c: '#3f9660' },
    pol: { izena: 'Politika eta ekonomia', c: '#d27a2a' }
  };
  const FILOSOFOAK = [
    { a: 'erd', e: '⛪', n: 'Agustin Hiponakoa', y: 'K.o. 354-430* · Hipona', i: 'Fedea eta arrazoia uztartu zituen. Jainkoaren existentzia ideia eredugarrien bidez frogatu zuen; gaitza ongiaren ausentzia da eta bekatuaren erantzulea gizakia da (Liberum Arbitrium). Historia: Lurreko Hiria eta Jainkoaren Hiria.', q: 'Credo ut intelligam, intelligo ut credam.' },
    { a: 'erd', e: '📜', n: 'Tomas Akinokoa', y: 'K.o. 1225-1274* · Akino', i: 'Jainkoaren existentziarako bost ibilbide arrazoizkoak. Hiru egia-mota: arrazoimenarenak, fedearenak eta biak. Lau lege: betiereko legea, lege naturala, gizakiarena eta jainkotiarra. Aristotelesen eragina handia.', q: 'Hala dio Filosofoak (Aristoteles).' },
    { a: 'ber', e: '🦊', n: 'Nikolas Maquiavelo', y: '1469-1527* · Florentzia', i: '"Printzipea" tratatuan errealismo politikoa aldarrikatu zuen: etika eta boterea bereizita. Lehoiaren indarra eta azeriaren maltzurkeria batu behar ditu agintariak.', q: 'Printzeak on ez izaten ikasi behar du.' },
    { a: 'ber', e: '🔭', n: 'Galileo, Kepler eta Newton', y: 'XVI.–XVIII. mendeak', i: 'Iraultza zientifikoa: Galileoren heliozentrismoa, Keplerren planeten mugimenduaren teoriak eta Newtonen grabitatearen legea. Natura arautzen duten lege objektiboak bilatu zituzten.' },
    { a: 'ber', e: '💡', n: 'Immanuel Kant', y: '1724-1804* · Ilustrazioa', i: 'Ilustrazioaren leloa: ausartu zaitez zure kabuz pentsatzera. Pentsamendu askea eta kritikoa, arrazoiarekiko konfiantza.', q: 'Sapere aude: ausartu zaitez zure kabuz pentsatzera.' },
    { a: 'ber', e: '⚖️', n: 'Montesquieu', y: '1689-1755* · Ilustrazioa', i: 'Botere-banaketaren aldeko ideiak Antzinako Erregimenaren errealitate politikoa balantzan jarri zuten.' },
    { a: 'ber', e: '🖋️', n: 'Voltaire', y: '1694-1778* · Ilustrazioa', i: 'Erlijio-askatasunaren eta iritzi-askatasunaren aldarrikatzailea, Ilustrazioko humanismoaren bozeramailea.' },
    { a: 'arr', e: '🔬', n: 'Francis Bacon', y: '1561-1626*', i: 'Ezagutza zientifiko ziurrak eskuratzeko metodo bat sortu zuen lehena, enpirismoan oinarrituta: mundua behatu eta kasu partikularretatik ondorio orokorrak atera.' },
    { a: 'arr', e: '🧠', n: 'René Descartes', y: '1596-1650* · arrazionalismoa', i: 'Metodoa (4 arau), zalantza metodikoa eta cogitoa. Hiru substantzia: res cogitans (arima), res extensa (materia) eta res infinita (Jainkoa). Grinen aurrean, neurritasuna.', q: 'Cogito, ergo sum.' },
    { a: 'arr', e: '🔷', n: 'Baruch Spinoza', y: '1632-1677* · arrazionalismoa', i: 'Descartesekin batera, matematikaren antzeko metodo logiko-deduktiboa erabiliz egia ziurrak eskuratzen saiatu zen.' },
    { a: 'arr', e: '🍎', n: 'John Locke', y: '1632-1704 · enpirismoa', i: 'Enpirismoaren ikurra: adimena tabula rasa da eta esperientziaz betetzen da. Ideia bakunak eta konplexuak. Politikan, eskubide naturalak (bizitza, askatasuna, jabetza) eta liberalismoaren sorrera.', q: 'Ez dago ezer giza adimenean zentzumenetatik pasa ez dena.' },
    { a: 'arr', e: '🌳', n: 'George Berkeley', y: '1685-1753 · enpirismoa', i: 'Idealismo inmaterialista: objektu materialak existitzen dira soilik substantzia pentsatzaile batek pertzibitzen baditu. Espiritua da bere horretan existitzen den gauza bakarra.', q: 'Esse est percipi: izatea pertzibitua izatea da.' },
    { a: 'arr', e: '🐴', n: 'David Hume', y: '1711-1776 · enpirismoa', i: 'Pertzepzioak bi sailetan banatzen ditu: inpresioak (zentzumenen bidezko informazio zuzena) eta ideiak (inpresioen kopia gutxituak).' },
    { a: 'pol', e: '🐉', n: 'Thomas Hobbes', y: '1588-1679* · kontratualismoa', i: '"Leviatan" obran, egoera naturala kaotikoa eta arriskutsua da. Segurtasuna bermatuko duen botere politikoa behar da; gizartea instrumentu zibilizatzailea da.', q: 'Homo homini lupus.' },
    { a: 'pol', e: '🗳️', n: 'Jean-Jacques Rousseau', y: '1712-1778* · kontratualismoa', i: 'Botere legitimoa borondate orokorrean oinarritzen da: herritar guztien parte-hartze aktiboan. Sufragio unibertsalaren aldeko borrokaren iturria.' },
    { a: 'pol', e: '⚒️', n: 'Karl Marx', y: '1818-1883* · XIX. mendea', i: 'Historia osoa klaseen arteko borroka izan da. Estatua klase dominatzailearen interesak bermatzen dituen instrumentu hutsa da; ordena kapitalista ez da naturala, etapa historiko bat gehiago baizik.' },
    { a: 'pol', e: '🪙', n: 'Adam Smith', y: '1723-1790 · liberalismo ekonomikoa', i: '"Nazioen aberastasuna" (1776): esku ikusezina, lan-banaketa eta laissez faire. Lehia eta lankidetza elkarri lotuta daude merkatu askean.', q: 'Ez dugu gure afaria harakinaren, garagardogilearen eta okinaren onberatasunetik espero.' }
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
  $('#phil-grid').insertAdjacentHTML('afterend', '<p class="hint" style="margin-top:14px;color:var(--muted);font-size:.85rem">* Datak ez daude apunteetan; data ohikoak dira.</p>');

  // ---------- Mailak ----------
  $('#levels-strip').innerHTML = (window.LOGOS_MAILAK_ERDIA || []).map(m =>
    `<div class="lv" style="--c:${m.kolorea}"><span>${m.ikonoa}</span><b>${m.zenbakia}. ${esc(m.izena)}</b><span class="muted">${esc(m.gaia)}</span></div>`).join('');

  // ---------- Atzealdeko hitz latindarrak ----------
  const HITZAK = ['credo', 'fides', 'ratio', 'civitas Dei', 'cogito', 'tabula rasa', 'res cogitans', 'lex naturalis', 'liberum arbitrium', 'sapere aude', 'homo homini lupus', 'laissez faire', 'esse est percipi', 'Leviathan'];
  $('#floating').innerHTML = HITZAK.map((w, i) => {
    const x = (i * 37) % 100, y = (i * 53) % 90, s = 1.4 + (i % 4) * 0.9, d = 9 + (i % 5) * 3;
    return `<span style="left:${x}%;top:${y}%;font-size:${s}rem;animation-duration:${d}s;animation-delay:-${i}s">${w}</span>`;
  }).join('');

  // ---------- Sartu jokora ----------
  $('#pin').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });
  $('#join-form').addEventListener('submit', e => {
    e.preventDefault();
    const pin = $('#pin').value.trim();
    location.href = 'jokalaria.html?b=erdi' + (pin ? '&pin=' + encodeURIComponent(pin) : '');
  });
})();
