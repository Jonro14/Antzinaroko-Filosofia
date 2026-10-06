# Logos Arena · Filosofiaren Historia (1. blokea)

Ikasgelarako galdera-erantzun jokoa (Kahoot estiloa), USaP prestatzeko.
Irakasleak gela bat sortu eta proiektagailuan erakusten du; ikasleak
mugikorretik sartzen dira PINarekin edo QR kodearekin, eta bakoitzak bere
kabuz lehiatzen du.

## Fitxategiak

| Fitxategia | Zertarako |
|---|---|
| `index.html` | Webgunea: ibilbidea (5 gaiak), filosofoen txartelak, jokora sartzeko atea |
| `irakaslea.html` | Irakaslearen pantaila (proiektagailua): mundu-mapa, lobbya, galderak, sailkapena, podioa |
| `jokalaria.html` | Ikaslearen pantaila (mugikorra) |
| `js/galderak.js` | **Galdera-bankua** (6 maila, ~100 galdera, azalpenekin) |
| `js/firebase-config.js` | Firebase konfigurazioa (zuk bete behar duzu) |
| `database.rules.json` | Datu-basearen segurtasun-arauak (Firebase kontsolan itsatsi) |
| `js/backend.js`, `js/komuna.js`, `js/irakaslea.js`, `js/jokalaria.js`, `js/hasiera.js` | Jokoaren kodea |

## Mailak (mundu-mapa)

1. 🌊 **Mileto**: mitotik logosera eta presokratikoak
2. 🗣️ **Agora**: sofistak eta Sokrates
3. 🏛️ **Akademia**: ideia eta izaera (Platon eta Aristoteles)
4. ⚖️ **Polis**: etika eta politika (Platon eta Aristoteles)
5. 📜 **Alejandria**: Helenismoa
6. ⚡ **Olinpo**: azken froga (gai guztiak nahasian, eta filosofoak alderatzeko galderak)

Mailak mapa batean agertzen dira, ibilbide moduan, baina irakasleak **edozein
mailatara salto egin dezake zuzenean**. Nahi izanez gero, "Mailak ordenan
desblokeatu" etengailuak ibilbide progresiboa aktibatzen du: maila bat
amaitu arte hurrengoa itxita geratzen da (aurrerapena irakaslearen
nabigatzailean gordetzen da).

Gela sortu aurretik, irakasleak aukeratzen du:
- **Galdera kopurua**: 10, 15 edo guztiak.
- **Denbora**: lasai (×1,5), normala (20 s; egia/gezurra 15 s) edo azkarra (×0,7).

Puntuazioa: erantzun zuzenak 500-1000 puntu ematen ditu (zenbat eta azkarrago, orduan eta gehiago),
eta jarraian asmatzeak bonusa dakar (+100 eta +500 artean).

Joko bat amaitzean, **"Beste maila bat (gela berean)"** sakatuta, ikasleek ez dute
berriro sartu beharrik: PIN bera eta jokalari berak, puntuak zerotik hasita.
Emaitzak CSV fitxategi batean deskargatu daitezke (Excel-en irekitzeko).

Teklatua: proiektagailuan, `Enter` edo zuriunea sakatuta, botoi nagusia aktibatzen da (hasi, hurrengoa...).

---

## 0. Proba azkarra (DEMO modua, konfiguraziorik gabe)

`js/firebase-config.js` hutsik dagoen bitartean, jokoa **DEMO moduan** dabil:
nabigatzaile bereko fitxen artean soilik. Ikasgelarako ez du balio, baina
probatzeko bai:

1. Ireki `irakaslea.html` Chrome-n (klik bikoitza). Aukeratu maila bat → **Sortu gela**.
2. Ireki `jokalaria.html` **fitxa berri batean** (nabigatzaile berean), idatzi PINa eta izena.
3. Errepikatu nahi adina fitxatan (fitxa bakoitza jokalari bat da), eta sakatu **Hasi jokoa**.

---

## 1. Firebase proiektua sortu (behin bakarrik, ~10 minutu)

Firebasek (Google) mugikorrak eta proiektagailua denbora errealean lotzen ditu.
Doako planarekin (Spark) nahikoa da ikasgela baterako.

1. Joan <https://console.firebase.google.com> helbidera eta sartu Google kontuarekin.
2. **Add project / Proiektua gehitu** → izena, adibidez `logos-arena`.
   Google Analytics ez da beharrezkoa (desaktibatu dezakezu).

## 2. Realtime Database sortu

1. Ezkerreko menuan: **Build → Realtime Database → Create Database**.
2. Kokapena: **Belgium (europe-west1)**.
3. Hasteko modua: **Start in locked mode**.
4. **Rules** fitxan, ezabatu dagoena eta itsatsi `database.rules.json` fitxategiaren
   eduki osoa. Sakatu **Publish**.

## 3. Saio anonimoa aktibatu

1. **Build → Authentication → Get started**.
2. **Sign-in method** fitxan: **Anonymous → Enable → Save**.

(Ikasleek ez dute konturik behar: nabigatzaile bakoitzak identifikatzaile anonimo bat jasotzen du.)

## 4. Web-aplikazioa erregistratu eta konfigurazioa kopiatu

1. Proiektuaren hasierako orrian (⚙️ **Project settings → General**), behean:
   **Your apps → `</>` (Web)**.
2. Izena: `logos-arena`. **Ez** markatu "Firebase Hosting".
3. **Register app** sakatzean `firebaseConfig` objektu bat erakutsiko dizu, honen antzekoa:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "logos-arena.firebaseapp.com",
     databaseURL: "https://logos-arena-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "logos-arena",
     ...
   };
   ```
4. Ireki `js/firebase-config.js` eta ordezkatu `window.LOGOS_FIREBASE_CONFIG = null;`
   lerroa zure balioekin:
   ```js
   window.LOGOS_FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "...",
     databaseURL: "https://....firebasedatabase.app",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
   ⚠️ `databaseURL` ezinbestekoa da. Ez badago, kopiatu Realtime Database orriaren
   goialdeko helbidea (`https://...firebasedatabase.app`).

> `apiKey` hori ez da pasahitz sekretua: web-aplikazio guztietan publikoa da.
> Datuak 2. pausuko arauek babesten dituzte.

## 5. GitHub Pages-en argitaratu

1. Sortu kontu bat <https://github.com> helbidean (baldin ez baduzu).
2. **New repository** → izena, adibidez `logos-arena` → **Public** → Create.
3. **Add file → Upload files** → arrastatu `webgunea` karpetaren **edukia**
   (`index.html`, `irakaslea.html`, `jokalaria.html`, `css/`, `js/`...;
   ez karpeta bera) → **Commit changes**.
4. **Settings → Pages** → *Source*: **Deploy from a branch** → *Branch*: `main`, `/ (root)` → **Save**.
5. Minutu batzuk barru webgunea hemen egongo da:
   `https://ZURE-ERABILTZAILEA.github.io/logos-arena/`
6. Firebase kontsolan: **Authentication → Settings → Authorized domains → Add domain**
   → `ZURE-ERABILTZAILEA.github.io`.

## 6. Ikasgelan

1. Proiektagailuko ordenagailuan ireki `https://.../logos-arena/irakaslea.html`
   (edo webgunean: **Sortu gela**). Pantaila osoa: ⛶ botoia.
2. Aukeratu maila → **Sortu gela**. PINa eta QR kodea agertuko dira.
3. Ikasleek mugikorrarekin QRa eskaneatu edo webgunean PINa idazten dute.
4. Denak barruan daudenean: **Hasi jokoa**.

Ikasle batek fitxa freskatzen badu, automatikoki berriro sartzen da bere puntuekin.
Irakasleak fitxa freskatzen badu, jokoa zegoen tokitik jarraitzen du.
Izen desegokiren bat badago, lobbyan izen horren gainean sakatuta kanporatu daiteke.

---

## Galderak aldatu edo gehitu

Ireki `js/galderak.js`. Galdera bakoitza bloke bat da:

```js
{ mota: 'aukera', m: 'Talesen ustez, zein zen arkhea?',
  a: ['Ura', 'Airea', 'Apeirona', 'Zenbakiak'], z: 0,
  az: 'Talesentzat ura zen gauza guztien iturburua...' },
```

- `mota`: `'aukera'` (aukera anitza), `'eg'` (egia/gezurra) edo `'aipua'` (nork esan zuen?).
- `m`: galdera. `a`: aukerak (2-4). `z`: zuzenaren posizioa (**0 = lehena**).
- `az`: erantzuna erakustean agertzen den azalpena.
- Aukeren ordena jokoan nahasten da; beraz, zuzena lehenengo jar daiteke beti.
- Egia/gezurra galderetan: `a: ['Egia', 'Gezurra']` eta `z: 0` (egia) edo `z: 1` (gezurra).

Aldaketak GitHub-era igo (fitxategia ordezkatu) eta minutu batzuk barru eguneratuta egongo da.

## Arazoak

| Arazoa | Konponbidea |
|---|---|
| "DEMO modua" agertzen da GitHub Pages-en | `js/firebase-config.js` ez dago ondo beteta (4. pausua). |
| "permission_denied" errorea | Arauak ez dira argitaratu (2. pausua) edo saio anonimoa ez dago aktibatuta (3. pausua). |
| Ikasleek ez dute gela aurkitzen | Ziurtatu irakaslearen eta ikasleen helbidea bera dela, eta PINa zuzena dela. |
| Bi ikasle ordenagailu berean probatzeko | Erabili fitxa ezberdinak (fitxa bakoitza jokalari bat da). |

Datu-basean gelak pilatzen badira: irakasleak **✖ Itxi gela** sakatzean gela ezabatzen da.
Gela berri bat sortzean, irakasle horren aurreko gela ere ezabatzen da.
