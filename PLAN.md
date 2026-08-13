# PLAN

_Ostatnia aktualizacja: 2026-08-13_

1. ~~Napraw uszkodzone linki w mailach/Stripe~~ — naprawione i zweryfikowane 2026-08-10.
2. ~~Napraw placeholder `{{amount}}` w `ProjectCostingCard.jsx`~~ — naprawione i zweryfikowane
   2026-08-10.
3. Dodać `scripts/check.sh` (lint/typecheck/testy frontend + backend), żeby skille
   `start`/`koniec` miały co uruchamiać.
4. Błąd SSL przy `gradlew assembleDebug` (`capacitor-android:extractDebugAnnotations`,
   pobieranie `lint-gradle`) — **zdiagnozowany 2026-08-13**: Norton Antivirus przechwytuje TLS,
   jego cert nie jest zaufany przez JDK/JBR używany przez Gradle. Naprawa (import certu Nortona
   do `cacerts` JBR) zaproponowana, ale niewykonana — użytkownik wstrzymał się z decyzją. Bez
   tego nie da się dziś zrobić świeżego builda debug/release na tej maszynie.
5. ~~Zdecydować, czy commitować obecne, duże niezacommitowane zmiany~~ — zrobione 2026-08-13:
   jeden zbiorczy commit (`3b9dab2`), repo podłączone do
   `github.com/strongloki457/Aplikacja-BuildForU`, push wykonany.
6. **Naprawić refresh tokenu w kontekście Android WebView** — `SameSite=Lax` cookie z
   `.buildforu.eu` nie dotrze do backendu z originu `https://localhost` (Capacitor). Użytkownik
   będzie wylogowywany po ~1h w apce mobilnej. Patrz STATE.md, dziennik 2026-08-13, dla
   proponowanego podejścia (refresh token też w body JSON).
7. (Opcjonalnie, do rozważenia) Wyczyścić historię gita z ~307 MB starych plików `.zip` i
   ~7000 plików `node_modules` zacommitowanych w przeszłości (przepisanie historii +
   force-push) — obecnie tylko odznaczone ze śledzenia, nadal zajmują miejsce w `.git`.
