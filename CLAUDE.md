# BuildForU — zasady pracy

- Po każdej zmianie kodu: napisz test i odpal `./scripts/check.sh`.
- Nie commituj, jeśli `check.sh` nie przechodzi.
- Na koniec sesji zaktualizuj `STATE.md` i `PLAN.md`.

## Pliki stanu

- `STATE.md` — co działa, co w połowie, znane bugi.
- `PLAN.md` — 3-5 zadań na dziś.

## Uwaga

`scripts/check.sh` jeszcze nie istnieje w repo — trzeba go dodać (np. lint/typecheck/testy
frontendu i backendu), zanim skille `start`/`koniec` będą mogły go realnie uruchomić.
