# DONE — Shipped Work (Historical Reference)

> This file is a read-only record of completed work from the original `TODO.md`.
> It is preserved for reference. **Do not add new items here** — new work is tracked in `BACKLOG.md`, tagged with phase numbers from `ROADMAP_TO_PKHEX_PLUS.md`.

---

## Round 7 — Gen 2 gender bug fix, Crystal-branch audit, tab tests, undo bound

- [x] **`fix` Party gender always Male.** GSC gender is a function of the Attack DV (like shininess), but `Gen2Adapter.recalculateStats` only re-derived `isShiny`, leaving `gender` stale whenever DVs changed. It now re-derives `gender` from the Attack DV and keeps `genExtension.gender` in sync. Regression-tested in `tests/gen2Gender.test.ts`.
- [x] **`P2` Crystal-branch audit.** Confirmed `EventsTab`'s `=== 'Crystal'` is a legitimate within-Gen2 version distinction, already behind the `isGen2SaveExtension` guard.
- [x] **`P1` Component tests → interactions.** Added `tests/SaveTabBar.test.tsx`.
- [x] **`P2` Undo history bound + depth.** `useUndoHistory` now takes a configurable `maxHistory`, skips no-op pushes, and exposes `historyDepth()`.

## Round 6 — Gen 3 entity crypto, ID/shiny helpers, synthetic fixture

- [x] **`P1` Gen 3 entity crypto + block shuffle.** Added `lib/generations/gen3/entity.ts` — PK3 LCRNG stream cipher + `PID % 24` block shuffle + word-sum checksum. Byte-exact round-trip across all 24 orderings, LCRNG correctness tests.
- [x] **`P2` Sprite coverage for 252–386.** `lib/sprites.ts` resolves Gen 3 species in master/artwork modes. Regression-locked by `tests/spriteCoverage.test.ts`.
- [x] **`P2` Gen3 fixture early.** `tests/gen3Entity.test.ts` builds a legally-clean PK3 fixture programmatically and TDDs the encrypt→detect→decrypt path.

## Rounds 1-5 (summarized)

- Gen 1/2 adapter pattern, CDM, lazy registry, scalability invariant test.
- Cross-gen converter (Gen1↔Gen2), text codec unification, region detection.
- Standalone format (.pk1/.pk2), save wrapper detection, entity format block shuffle.
- Pokedex editor, Hall of Fame, Event Flags, Daycare, Box Names, Map Data, Phone Contacts, Unown Dex.
- Sprite system (game-specific/master/artwork modes, shiny, integer scaling).
- Accessibility: `useModalA11y` hook, focus trap, body scroll lock, inert background.
- P0/P1/P2/P3/P4 bug fixes (stat formula, sleep decode, Pokedex flags, PK3 crypto, cross-gen transfer, Gen 3 stat calculator, PID helpers, context memoization, UI/UX/a11y, writer clamps, region detect, Unown form, FOUC, error boundary, etc.).

**Test count:** 485 passing (30 files).
