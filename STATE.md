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
