# STATE

_Ostatnia aktualizacja: 2026-08-10 (sesja testowa na emulatorze Android)_

## Co działa (przetestowane end-to-end na emulatorze Medium_Phone)

- Backend (Express + Prisma, Postgres lokalny) + Vite dev server + Capacitor debug build
  na emulatorze — pełny łańcuch działa (`cap:sync:dev` + `gradlew assembleDebug` + `adb install`).
- Auth: rejestracja firmy, logowanie, wylogowanie, weryfikacja e-maila (przez token z logów,
  bo SMTP wyłączony w dev).
- Role-based nawigacja: Employee i Admin widzą różne zestawy zakładek/menu "Więcej" — działa
  poprawnie.
- Tworzenie projektu (Projekty → Utwórz projekt) — zapisuje się poprawnie w bazie.
- Plan gating: funkcje "Stawki godzinowe" i "Budżety projektów" (finance.workerRates /
  projectBudgets) są poprawnie ukryte za paywallem dla planu `starter` i odsłaniają się po
  zmianie planu firmy na `pro`.
- Budżet projektu (Finanse → Budżety projektów) zapisuje się poprawnie w DB (`Project.budget`).
- **Job costing / Expense (nowa funkcja z bieżących zmian) działa end-to-end**: dodanie wydatku
  przez `ProjectCostingCard` poprawnie tworzy rekord `Expense`, przelicza `expensesCost` i
  `totalCost`, oraz % wariancji budżetu.

## Bugi znalezione i naprawione w tej sesji

1. **Uszkodzone linki w mailach transakcyjnych — NAPRAWIONE.**
   `backend/src/services/email.service.ts:287,302` i `backend/src/services/stripe.service.ts:66-88`
   budowały URL-e z surowego `env.FRONTEND_URL` (pole "comma-separated for multiple origins").
   Zmienione na `getAllowedOrigins()[0]`. Zweryfikowane: nowy link weryfikacyjny to poprawny,
   pojedynczy URL (`http://localhost:5173/verify-email?token=...`). Uwaga: backend trzeba było
   twardo zrestartować (`tsx watch` nie złapał zmiany pliku automatycznie na tym Windows setupie)
   — po restarcie zadziałało.

2. **Nieprzetłumaczony placeholder `{{amount}}` w karcie kosztorysowania — NAPRAWIONE.**
   `src/components/finance/ProjectCostingCard.jsx:121-124,136-140` wywoływało
   `t(key, fallbackString, paramsObject)` zamiast `t(key, params, fallback)`. Poprawione kolejność
   argumentów. Zweryfikowane w apce (Vite HMR): baner teraz pokazuje "9749.50 € w ramach budżetu
   97%" zamiast dosłownego "{{amount}} w ramach budżetu".

## Dane testowe zostawione w lokalnej bazie dev

- Firma testowa "Test QA Sp. z o.o." (plan podniesiony ręcznie na `pro` do testów), konto
  `qa-tester-buildforu@example.com` / `TestQA12345`, projekt "Project QA Testowy" (budget 10000,
  1 wydatek testowy 250.50 €). Bezpieczne do usunięcia lub pozostawienia — nie koliduje z
  prawdziwym kontem `maciekpilka-1999@wp.pl`.

## Braki w narzędziach projektu

- `scripts/check.sh` nie istnieje — potrzebny przed użyciem skilli `start`/`koniec`.
- Build Gradle raportuje błąd sieciowy (SSL) przy pobieraniu `lint-gradle` dla modułu
  `capacitor-android` (`extractDebugAnnotations`) — nie blokuje `assembleDebug`, ale build
  kończy się z `BUILD FAILED` mimo że APK powstaje poprawnie.

## Nieprzetestowane w tej sesji

- Widoki: Zadania, Kalendarz, Czat, Materiały, Asystent AI, Ustawienia, Raporty, Pracownicy
  (poza formularzem dodawania) — dotknięte tylko pobieżnie lub wcale.
- Stawki godzinowe pracowników (pole istnieje w UI, ale brak pracowników w firmie testowej,
  więc nie przetestowano zapisu).
- Płatności/Stripe (BillingPage, PricingPage) — mają duże niezacommitowane diffy, nie
  przetestowane w tej sesji.

## Dziennik zmian

### 2026-08-13 — audyt Android (Faza 1) + podłączenie repo do GitHuba

**Audyt Android:**
- `android/app/build.gradle`: `applicationId com.buildforu.app` ✓, `minSdk 24 / compileSdk 36 /
  targetSdk 36` (w `android/variables.gradle`). Release build ma już `minifyEnabled`,
  `shrinkResources`, warunkowy `signingConfig` (fallback na unsigned bez `keystore.properties`)
  i `lint { checkReleaseBuilds = false }` — próba obejścia znanego błędu SSL przy pobieraniu
  `lint-gradle`, ale nie rozwiązuje go dla wariantu **debug** (patrz niżej).
- `AndroidManifest.xml`: uprawnienia INTERNET, ACCESS_NETWORK_STATE, ACCESS_FINE/COARSE_LOCATION,
  CAMERA, READ_MEDIA_IMAGES, READ_EXTERNAL_STORAGE(≤32), POST_NOTIFICATIONS,
  RECEIVE_BOOT_COMPLETED, VIBRATE — zgodne z zainstalowanymi pluginami. Jest już skonfigurowany
  `FileProvider` (przygotowany pod przyszły plugin `share`/`filesystem`).
- `google-services.json` — **nie istnieje** nigdzie w repo. Push Notifications nie zadziałają bez
  skonfigurowania Firebase i wgrania tego pliku.
- **Cykl build → sync → run:** `npm run build` ✓ i `npx cap sync android` ✓ działają czysto.
  `npx cap run android` **pada** z `'gradlew' is not recognized` — bug w Capacitor CLI przy
  spawnowaniu `.bat` na Node v24 (Windows). Obejście: wywoływać `android\gradlew.bat` bezpośrednio.
  Bezpośredni `gradlew.bat assembleDebug` też **kończy się BUILD FAILED** —
  `capacitor-android:extractDebugAnnotations` nie może pobrać zależności lintu AGP
  (`PKIX path building failed`). **Ustalona przyczyna: Norton Antivirus przechwytuje ruch TLS**
  (cert `CN=Norton Web/Mail Shield Root`, zaufany przez Windows, ale nie przez JDK/JBR, którego
  używa Gradle wg `~/.gradle/gradle.properties: org.gradle.java.home`). Skorygowany wcześniejszy
  wpis z 2026-08-10: to NIE jest "kosmetyczny" błąd — dzisiejszy build w ogóle nie dotarł do
  spakowania APK; plik `android/app/build/outputs/apk/debug/app-debug.apk` na dysku to stary
  artefakt z 10.08 16:21, nie świeży build. Naprawa (import certu Nortona do `cacerts` JBR) była
  zaproponowana, ale **jeszcze nie wykonana** — czeka na decyzję użytkownika.
- **Realny problem znaleziony w auth (WebView Android):** access token leci jako
  `Authorization: Bearer` (localStorage) — OK w WebView. Ale refresh token jest WYŁĄCZNIE w
  httpOnly cookie (`SameSite=Lax`, `Domain=.buildforu.eu`, `backend/src/controllers/auth.controller.ts`),
  a `getStoredRefreshToken()` w `src/api/auth.storage.js` celowo zawsze zwraca `null`. Bundlowany
  build Capacitora serwuje appkę z originu `https://localhost` — zupełnie inny site niż
  `buildforu.eu`, więc `SameSite=Lax` **zablokuje** wysyłanie tego cookie przy odświeżaniu tokenu.
  Skutek: po ~1h (`ACCESS_MAX_AGE`) użytkownik prawdopodobnie zostanie wylogowany w apce Android,
  mimo że w wersji webowej (ten sam eTLD+1) refresh działa. Nie ujawniło się w sesji z 10.08, bo
  test trwał <1h. **Proponowana naprawa (jeszcze nie zrobiona):** backend zwraca `refreshToken`
  też w body JSON logowania, `auth.storage.js` zaczyna go faktycznie zapisywać/wysyłać —
  `client.js` już częściowo to obsługuje (wysyła `refreshToken` w body `/api/auth/refresh`, jeśli
  `getStoredRefreshToken()` coś zwróci).

**Podłączenie repo do GitHuba:**
- Repo **już było** zainicjowane i miało zdalne `origin` ustawione na
  `https://github.com/strongloki457/Aplikacja-BuildForU.git` (nie był to pusty/nowy remote).
  Lokalny `main` był 1 commit za `origin/main` — zsynchronizowano przez `git pull --ff-only`
  (czysty fast-forward, bez konfliktów).
- `.gitignore` rozszerzony o: `dist/`, `android/app/build/`, `android/.gradle/`, `android/build/`,
  `android/local.properties`, `.idea/`, `*.iml`, `*.keystore`, `*.jks`, `.env.local`.
- **Znalezione i odznaczone ze śledzenia** (pliki zostały na dysku, tylko usunięte z indeksu gita):
  `dist/` (był trackowany mimo że powinien być ignorowany), **13 dużych plików `.zip` backupowych
  w katalogu głównym (razem ~307 MB!)** mimo że `*.zip` był w `.gitignore` od dawna, oraz
  **~7168 plików z `node_modules/`** — cały drzewo zależności było zacommitowane do historii repo.
  `backend/node_modules/`, `.idea/`, `*.iml`, `.env`, `*.jks` — sprawdzone, nic z tego nie było
  trackowane.
  **Uwaga:** odznaczenie ze śledzenia NIE usuwa tych dużych plików z już istniejącej historii
  gita — `.git` waży ~237 MB głównie przez nie. Jeśli zależy na mniejszym repo, potrzebny byłby
  osobny, świadomie zaakceptowany krok przepisania historii (np. `git filter-repo`/BFG +
  force-push) — nie wykonano tego, bo to działanie destrukcyjne wymagające osobnej zgody.
  `android/buildforu-release.jks` (release keystore) — **potwierdzone, że nigdy nie trafił do
  repo**.
  Katalog `android/` (cały natywny projekt) był dotąd **całkowicie nietrackowany** — teraz dodany.
- Zrobiono jeden commit (`3b9dab2`) obejmujący: dodanie `android/`, powyższe zmiany `.gitignore`
  + untracking, oraz zaległe zmiany z wcześniejszej sesji (feature job costing/expenses, poprawki
  linków w mailach/Stripe, drobne zmiany frontendu). To NIE są rozdzielone logiczne commity — user
  poprosił o jeden `git add . && git commit`, więc tak to zrobiono (temat z PLAN.md, punkt 5,
  rozstrzygnięty na "jeden duży commit"). Push do `origin/main` powiódł się.

### 2026-08-13 (ciąg dalszy) — poprawka repo, fix SSL Gradle, fix refresh tokenu, 4 nowe pluginy

**WAŻNA KOREKTA: zły remote.** Repo `Aplikacja-BuildForU` (do którego poszedł commit `3b9dab2`
opisany wyżej) to **inna aplikacja**, nie ta. Właściwe repo dla tego projektu to
`https://github.com/strongloki457/buildforu-android.git`. Naprawione:
- `origin` w tym repo przepięty na `buildforu-android` (potwierdzone: było puste, teraz ma pełną
  historię łącznie z `3b9dab2`).
- Commit `3b9dab2` w `Aplikacja-BuildForU` **cofnięty przez `git revert`** (nowy commit `94f4e48`
  na ich `main`, wypchnięty tam) — nie force-push, historia tamtego repo nietknięta poza tym.
  Zrobione na tymczasowym branchu + tymczasowym drugim remote (`old-origin`), oba posprzątane po
  fakcie.
- **Od teraz ten folder ma tylko jeden remote (`origin` → `buildforu-android`)** — potwierdzone
  `git remote -v`. Żadna dalsza praca nie dotyka `Aplikacja-BuildForU`.
- Skutek uboczny do zapamiętania: przełączanie branchy na inny checkout (do revertu) **nadpisało
  realny `node_modules/`** starą, zacommitowaną wersją (bo git nie rozróżnia "duży folder
  zależności" od zwykłych plików przy checkout) — trzeba było `npm install` żeby naprawić
  (`vite` zniknął z `node_modules/.bin`). Jeśli kiedyś znowu trzeba będzie przełączać branch na
  coś, co ma inną historię `node_modules`/`dist`, spodziewać się tego samego i od razu robić
  `npm install` po powrocie.

**Fix SSL Gradle — zrobiony i zweryfikowany.** Norton nie pozwalał zapisać certu bezpośrednio do
`C:\Program Files\Android\Android Studio\jbr\lib\security\cacerts` (Odmowa dostępu — wymaga
admina). Obejście: kopia `cacerts` w `%USERPROFILE%\.android-build-truststore\cacerts` (z
zaimportowanym certem Nortona) + `$env:JAVA_TOOL_OPTIONS = "-Djavax.net.ssl.trustStore=...
-Djavax.net.ssl.trustStorePassword=changeit"` przed każdym `gradlew`. To ustawienie środowiskowe,
nie plik w repo — trzeba je ustawiać w każdej nowej sesji/terminalu przed buildem Androida.
`gradlew assembleDebug` przechodzi teraz w pełni (BUILD SUCCESSFUL), APK się pakuje.

**Fix refresh tokenu — zrobiony, zacommitowany (`1f7dfc0`), przetestowany na emulatorze.**
`src/api/auth.storage.js`: `getStoredRefreshToken`/`setStoredRefreshToken` przestały być no-opami
na platformie natywnej (`Capacitor.isNativePlatform()`) — realnie zapisują/zwracają token z
localStorage tylko na Androidzie, web/PC bez zmian (nadal `null`, cookie-only). Test: świeże
logowanie na koncie QA przez lokalny dev backend (`JWT_EXPIRES_IN` tymczasowo skrócony do 20s,
potem przywrócony na 15m) — appka nie wylogowała po wygaśnięciu tokenu. Zastrzeżenie: w trybie dev
frontend i backend siedzą na tym samym hoście (`10.0.2.2`, różne porty), więc `SameSite=Lax` i tak
by przeszło — to nie jest w 100% wierna reprodukcja cross-site scenariusza z produkcji. Mechanizm
(jawny refresh token w body zamiast polegania na cookie) jest jednak poprawny niezależnie od tego.

**Dodane 4 brakujące pluginy Capacitor + integracje** (`@capacitor/app`, `@capacitor/filesystem`,
`@capacitor/share`, `@capacitor/preferences`, wszystkie `^8.x`):
- `App` — obsługa przycisku wstecz w `src/App.jsx` (cofa w historii routera, przy braku historii
  zamyka appkę). Zweryfikowane w logu: listener się rejestruje bez błędu.
- `Share`/`Filesystem` — nowy `src/utils/nativeMedia.js` (helpers: `shareImageAttachment`,
  `saveImageAttachment`, `shareText`, `shareTextFile`, wszystkie no-op poza platformą natywną).
  Wpięte w:
  - `AttachmentPreview.jsx` (lightbox zdjęć w czacie) — przyciski Udostępnij/Zapisz, tylko native.
    Save idzie do `Directory.Documents` (app-scoped, bez uprawnień) — **to NIE jest systemowa
    Galeria/Zdjęcia**, świadoma decyzja żeby nie obiecywać czegoś niesprawdzonego (prawdziwy zapis
    do Galerii na scoped storage Androida 10+ wymaga MediaStore API / osobnego pluginu, nie
    zrobione).
  - `WorkerAccessModal.jsx` — przycisk Udostępnij (Share.share z tekstem: email + hasło
    tymczasowe pracownika).
  - `AttendanceReportsPage.jsx` — **naprawiony realny bug**: istniejący "Export CSV" używał
    `<a download>` + blob URL, co **nie działa w Android WebView** (brak menedżera pobierania).
    Na native teraz idzie przez `Filesystem` + `Share`; web/PC bez zmian (stary kod, nietknięty).
- `Preferences` — offline cache w `src/contexts/AppDataContext.jsx`. Przy udanym
  `loadBackendData()` normalizowany payload (workers/projects/tasks/attendance/materials) zapisuje
  się do `Preferences` pod kluczem per `companyId`, tylko na native. Przy błędzie sieci
  (`ApiError.code === "NETWORK_ERROR"`) na native próbuje wczytać cache zamiast czyścić dane do
  pustych — UI dostaje istniejący baner `dataError` ("You're offline — showing the last saved
  data.") + przycisk Refresh, bez nowego komponentu.
- Build zweryfikowany: `npm run build` + `cap sync android` + `gradlew assembleDebug` — wszystkie
  8 pluginów zarejestrowanych, BUILD SUCCESSFUL, APK się instaluje i appka się uruchamia bez crasha
  na emulatorze (potwierdzone zrzutem ekranu, ekran logowania renderuje się poprawnie).

**Nowe odkrycie: Norton blokuje też ruch sieciowy emulatora do `api.buildforu.eu`**, nie tylko
Gradle (`CertPathValidatorException: Trust anchor for certification path not found` w logu
WebView). To osobny magazyn zaufania (system Android w AVD) niż ten naprawiony dla Gradle/JBR —
nienaprawione, bo to inny problem/inny fix. Nie blokuje developmentu (apka poprawnie łapie błąd
sieci i pokazuje login zamiast się wywalać), ale uniemożliwia pełny test end-to-end z prawdziwym
backendem produkcyjnym na tym emulatorze, dopóki ktoś nie zaimportuje certu Nortona też do
systemowego magazynu zaufania Androida w AVD (albo nie wyłączy skanowania SSL Nortona dla tego
ruchu).

### 2026-08-14 — google-services.json dodany, test rejestracji push tokenu

- Użytkownik założył projekt Firebase "BuildForU-Android" (konto Google biznesowe
  `suport@buildforu.eu` — literówka w adresie, ale konto działa, niekrytyczne, odpuszczone) i
  zarejestrował appkę Android (`com.buildforu.app`). Pobrany `google-services.json` wgrany do
  `android/app/google-services.json` (to NIE jest sekret — bezpieczne w repo, zawarty w każdym
  APK i tak; w przeciwieństwie do klucza service account, który zostaje tylko lokalnie).
- Root `android/build.gradle` już miał `classpath 'com.google.gms:google-services:4.4.4'`
  przygotowany wcześniej przez generator Capacitora — nic dodatkowego nie trzeba było dopisywać.
- `gradlew assembleDebug` z prawdziwym configiem: **BUILD SUCCESSFUL**.
- **Test na emulatorze (przez lokalny dev backend)**: logowanie ✓, system poprawnie poprosił o
  zgodę na powiadomienia (`Allow BuildForU to send you notifications?`) ✓, `registrationError`
  listener poprawnie złapał błąd bez crasha appki ✓. Sama rejestracja tokenu FCM **nie powiodła
  się** — `FirebaseMessaging: Failed to get FIS auth token... SERVICE_NOT_AVAILABLE` przy próbie
  dobicia do `firebaseinstallations.googleapis.com`. To ten sam Norton co poprzednio, ale
  **prawdopodobnie nienaprawialny lokalnie tym samym sposobem** — Google Play Services celowo
  ignoruje ręcznie dodane certy CA (ochrona przed MITM), więc import certu Nortona do systemu
  Android (w przeciwieństwie do JBR dla Gradle) najpewniej by nie pomógł. To ograniczenie tej
  maszyny deweloperskiej — prawdziwy telefon nie routuje ruchu przez Nortona na tym PC, więc
  produkcyjnie push notifications powinny działać. Pełny test end-to-end wymaga prawdziwego
  telefonu albo tymczasowego wyłączenia skanowania SSL w Nortonie.
- Zostało: `FIREBASE_SERVICE_ACCOUNT` w `backend/.env` (klucz z Firebase Console → Project
  settings → Service accounts → Generate new private key) — backend bez tego cicho nie wysyła
  powiadomień (zaprojektowane tak celowo, nie crashuje).
