// =====================================================================
//  BACKEND: datu-base partekatua.
//   - FIREBASE modua: Realtime Database + saio anonimoa (ikasgelarako).
//   - DEMO modua: localStorage, nabigatzaile bereko fitxen artean.
//  Bi moduek API bera dute: set, update, remove, get, on, now.
// =====================================================================
(function () {
  'use strict';

  const FB_VER = '10.12.2';
  const TS = { '.sv': 'timestamp' };           // zerbitzariaren ordua
  const B = { mode: null, uid: null, TS: TS };

  function loadScript(src) {
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = () => ko(new Error('Ezin izan da kargatu: ' + src));
      document.head.appendChild(s);
    });
  }

  // ------------------------------------------------------------------
  //  FIREBASE
  // ------------------------------------------------------------------
  async function initFirebase(cfg) {
    const base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    await loadScript(base + 'firebase-app-compat.js');
    await loadScript(base + 'firebase-auth-compat.js');
    await loadScript(base + 'firebase-database-compat.js');
    firebase.initializeApp(cfg);
    const auth = firebase.auth();
    // Fitxa bakoitza jokalari bat da; fitxa freskatuta ere identitatea mantentzen da.
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    if (!auth.currentUser) await auth.signInAnonymously();
    B.uid = auth.currentUser.uid;
    const db = firebase.database();
    let offset = 0;
    db.ref('.info/serverTimeOffset').on('value', s => { offset = s.val() || 0; });

    B.set = (p, v) => db.ref(p).set(v);
    B.update = (p, o) => db.ref(p).update(o);
    B.remove = p => db.ref(p).remove();
    B.get = p => db.ref(p).get().then(s => s.val());
    B.on = (p, cb) => {
      const r = db.ref(p);
      const h = s => cb(s.val());
      r.on('value', h);
      return () => r.off('value', h);
    };
    B.now = () => Date.now() + offset;
    B.onConnection = cb => db.ref('.info/connected').on('value', s => cb(!!s.val()));
    B.mode = 'firebase';
  }

  // ------------------------------------------------------------------
  //  DEMO (localStorage). Datuak hosto-gakoetan gordetzen dira
  //  ("logosdb:/rooms/123456/players/abc/name"), fitxa bakoitzak bide
  //  ezberdinetan idaztean elkar zapaldu ez dezaten.
  // ------------------------------------------------------------------
  function initDemo() {
    const PFX = 'logosdb:';
    const norm = p => '/' + String(p).split('/').filter(Boolean).join('/');
    const isTS = v => v && typeof v === 'object' && v['.sv'] === 'timestamp';

    function flatten(path, val, out) {
      if (val === null || val === undefined) return;
      if (isTS(val)) { out[path] = Date.now(); return; }
      if (typeof val === 'object') {
        const keys = Array.isArray(val) ? val.map((_, i) => i) : Object.keys(val);
        keys.forEach(k => flatten(path + '/' + k, val[k], out));
        return;
      }
      out[path] = val;
    }
    function allKeys() {
      const ks = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PFX)) ks.push(k.slice(PFX.length));
      }
      return ks;
    }
    function clearPath(p) {
      allKeys().forEach(k => { if (k === p || k.startsWith(p + '/')) localStorage.removeItem(PFX + k); });
      // aitzindari bat hosto primitiboa bazen, ezabatu
      const parts = p.split('/').filter(Boolean);
      for (let i = 1; i < parts.length; i++) localStorage.removeItem(PFX + '/' + parts.slice(0, i).join('/'));
    }
    function writePath(p, v) {
      clearPath(p);
      const out = {};
      flatten(p, v, out);
      Object.keys(out).forEach(k => localStorage.setItem(PFX + k, JSON.stringify(out[k])));
    }
    function read(p) {
      const leaf = localStorage.getItem(PFX + p);
      if (leaf !== null) return JSON.parse(leaf);
      let obj = null;
      allKeys().forEach(k => {
        if (!k.startsWith(p + '/')) return;
        const rest = k.slice(p.length + 1).split('/');
        obj = obj || {};
        let o = obj;
        for (let i = 0; i < rest.length - 1; i++) o = (o[rest[i]] = o[rest[i]] || {});
        o[rest[rest.length - 1]] = JSON.parse(localStorage.getItem(PFX + k));
      });
      return toArrays(obj);
    }
    // {0:..,1:..} objektuak array bihurtu (Firebase-k bezala)
    function toArrays(o) {
      if (!o || typeof o !== 'object') return o;
      Object.keys(o).forEach(k => { o[k] = toArrays(o[k]); });
      const ks = Object.keys(o);
      if (ks.length && ks.every((k, i) => String(i) === k)) return ks.map(k => o[k]);
      return o;
    }

    const listeners = new Set();
    let pending = false;
    function notify() {
      if (pending) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        listeners.forEach(l => {
          const v = read(l.p);
          const j = JSON.stringify(v);
          if (j !== l.last) { l.last = j; l.cb(v); }
        });
      }, 0);
    }
    window.addEventListener('storage', e => { if (!e.key || e.key.startsWith(PFX)) notify(); });
    // Segurtasun-sarea: storage gertaerak galtzen badira ere
    setInterval(notify, 700);

    let uid = sessionStorage.getItem('logos-demo-uid');
    if (!uid) { uid = 'd' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('logos-demo-uid', uid); }
    B.uid = uid;

    const ok = x => Promise.resolve(x);
    B.set = (p, v) => { writePath(norm(p), v); notify(); return ok(); };
    B.update = (p, o) => {
      const base = norm(p);
      Object.keys(o).forEach(k => {
        const full = norm(base + '/' + k);
        if (o[k] === null) clearPath(full); else writePath(full, o[k]);
      });
      notify(); return ok();
    };
    B.remove = p => { clearPath(norm(p)); notify(); return ok(); };
    B.get = p => ok(read(norm(p)));
    B.on = (p, cb) => {
      const l = { p: norm(p), cb: cb, last: undefined };
      listeners.add(l);
      const v = read(l.p); l.last = JSON.stringify(v); setTimeout(() => cb(v), 0);
      return () => listeners.delete(l);
    };
    B.now = () => Date.now();
    B.onConnection = cb => cb(true);
    B.mode = 'demo';
  }

  B.init = async function () {
    if (B.mode) return B;
    const cfg = window.LOGOS_FIREBASE_CONFIG;
    if (cfg && cfg.apiKey && cfg.databaseURL) await initFirebase(cfg);
    else initDemo();
    return B;
  };

  window.Backend = B;
})();
