# PLAN

_Ostatnia aktualizacja: 2026-08-10_

1. ~~Napraw uszkodzone linki w mailach/Stripe~~ — naprawione i zweryfikowane 2026-08-10.
2. ~~Napraw placeholder `{{amount}}` w `ProjectCostingCard.jsx`~~ — naprawione i zweryfikowane
   2026-08-10.
3. Dodać `scripts/check.sh` (lint/typecheck/testy frontend + backend), żeby skille
   `start`/`koniec` miały co uruchamiać.
4. Rozstrzygnąć błąd SSL przy `gradlew assembleDebug` (pobieranie `lint-gradle` dla
   `capacitor-android`) — build kończy się `BUILD FAILED` mimo że APK powstaje.
5. Zdecydować, czy commitować obecne, duże niezacommitowane zmiany (w tym usunięte pliki
   w `dist/`, i naprawki z tej sesji) w osobnych, logicznych commitach.
