// =====================================================================
//  BLOKEA: zein galdera-banku eta zein itxura erabili (jokoa eta Bidaia)
// ---------------------------------------------------------------------
//  Helbidean ?b=erdi badago, 2. blokea (Erdi Aroa eta Aro Modernoa)
//  kargatzen da; bestela, 1. blokea (Antzinaroa).
//  Orrietako <head>-ean script txiki batek <html class="erdi"> ezartzen
//  du lehenago (itxura-keinurik gabe); hemen bankua aukeratzen da.
//  Fitxategi hau galderak.js eta erdi-galderak.js ondoren kargatu behar da.
// =====================================================================
(function () {
  'use strict';
  const erdi = document.documentElement.classList.contains('erdi');
  window.LOGOS_MAILAK_ANTZ = window.LOGOS_MAILAK;
  window.BLOKEA = erdi ? 'erdi' : 'antzinaroa';
  if (erdi && window.LOGOS_MAILAK_ERDIA) window.LOGOS_MAILAK = window.LOGOS_MAILAK_ERDIA;

  // Orriko izenburua, logoa eta estekak blokearen arabera
  window.BLOKEA_EGUNERATU = function (erd) {
    document.documentElement.classList.toggle('erdi', erd);
    document.title = document.title.replace(erd ? 'Antzinako Filosofia' : 'Erdi Aroko Filosofia', erd ? 'Erdi Aroko Filosofia' : 'Antzinako Filosofia');
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.setAttribute('href', erd ? 'erdiaroa.html' : 'antzinaroa.html');
      const mark = logo.querySelector('.logo-mark'); if (mark) mark.textContent = erd ? '✠' : 'Λ';
      const txt = logo.querySelector('#top-logo') || logo.querySelector('.logo-text');
      if (txt) txt.textContent = erd ? 'Erdi Aroko Filosofia' : 'ANTZINAKO FILOSOFIA';
    }
  };
  if (document.readyState !== 'loading') window.BLOKEA_EGUNERATU(erdi);
  else document.addEventListener('DOMContentLoaded', () => window.BLOKEA_EGUNERATU(erdi));
})();
