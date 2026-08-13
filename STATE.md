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
