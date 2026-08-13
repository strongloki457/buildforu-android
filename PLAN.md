# PLAN

_Ostatnia aktualizacja: 2026-08-13_

1. ~~Napraw uszkodzone linki w mailach/Stripe~~ — naprawione i zweryfikowane 2026-08-10.
2. ~~Napraw placeholder `{{amount}}` w `ProjectCostingCard.jsx`~~ — naprawione i zweryfikowane
   2026-08-10.
3. Dodać `scripts/check.sh` (lint/typecheck/testy frontend + backend), żeby skille
   `start`/`koniec` miały co uruchamiać.
4. ~~Błąd SSL przy `gradlew assembleDebug`~~ — **naprawione 2026-08-13**: Norton Antivirus
   przechwytuje TLS, jego cert nie był zaufany przez JDK/JBR używany przez Gradle. Naprawione
   przez własną, zapisywalną kopię `cacerts` (`%USERPROFILE%\.android-build-truststore\cacerts`)
   + `JAVA_TOOL_OPTIONS` wskazujący na nią przy każdym buildzie Gradle. `assembleDebug` przechodzi
   teraz w pełni.
5. ~~Zdecydować, czy commitować obecne, duże niezacommitowane zmiany~~ — zrobione 2026-08-13:
   jeden zbiorczy commit (`3b9dab2`), repo podłączone do `github.com/strongloki457/buildforu-android`
   (patrz dziennik w STATE.md — pierwotnie omyłkowo trafiło do `Aplikacja-BuildForU`, cofnięte tam
   revertem, poprawione repo to `buildforu-android`).
6. ~~Naprawić refresh tokenu w kontekście Android WebView~~ — **naprawione i przetestowane
   2026-08-13** (commit `1f7dfc0`). `src/api/auth.storage.js` zaczyna realnie zapisywać refresh
   token na platformie natywnej (`Capacitor.isNativePlatform()`), PC/web bez zmian.
7. (Opcjonalnie, do rozważenia) Wyczyścić historię gita z ~307 MB starych plików `.zip` i
   ~7000 plików `node_modules` zacommitowanych w przeszłości (przepisanie historii +
   force-push) — obecnie tylko odznaczone ze śledzenia, nadal zajmują miejsce w `.git`.
8. **Norton blokuje też ruch sieciowy emulatora do prawdziwego `api.buildforu.eu`** (nie tylko
   Gradle) — `CertPathValidatorException: Trust anchor for certification path not found` w logu
   WebView. Nie blokuje developmentu (apka poprawnie łapie `NETWORK_ERROR` i pokazuje ekran
   logowania zamiast się wywalać), ale uniemożliwia pełny test end-to-end z produkcyjnym API na
   tej maszynie/emulatorze, dopóki cert Nortona nie trafi też do zaufanych certów systemu Android
   w AVD (osobny problem od naprawy Gradle — inny magazyn zaufania).
9. Dokończyć audyt Fazy 1 z pierwotnego briefu: przetestować szerzej nieprzetestowane widoki
   (Zadania, Kalendarz, Materiały, Asystent AI, Raporty pełne), `google-services.json` /
   Firebase dla push notifications wciąż brakuje.
