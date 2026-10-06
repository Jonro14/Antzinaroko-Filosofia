// =====================================================================
//  FIREBASE KONFIGURAZIOA
// ---------------------------------------------------------------------
//  Firebase kontsolan web-aplikazioa erregistratzean ematen dizun
//  "firebaseConfig" objektua (ikus IRAKURRI.md, 4. pausua).
//
//  Oharra: apiKey hau EZ da sekretua. Firebase web-aplikazio guztietan
//  publikoa da (nabigatzaileak irakurri behar du). Datuak
//  database.rules.json arauek babesten dituzte, eta gakoa Google Cloud
//  kontsolan webgunearen domeinura mugatuta dago.
//
//  DEMO modura itzultzeko (konfiguraziorik gabe), jarri:
//  window.LOGOS_FIREBASE_CONFIG = null;
// =====================================================================

window.LOGOS_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBfkqwKbw3iKMRi_Vltnfp7NgYaOiuR0nQ",
  authDomain: "lander-jakintza.firebaseapp.com",
  databaseURL: "https://lander-jakintza-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lander-jakintza",
  storageBucket: "lander-jakintza.firebasestorage.app",
  messagingSenderId: "862280183055",
  appId: "1:862280183055:web:c4d622d4368b5c8a14a27a"
};
