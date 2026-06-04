# TODO — UI/UX, Code Quality & Bug Fixes

Working backlog for BilKo's PC Reborn. Items are grounded in the current codebase
(Gen I/II shipped, 333 passing tests, clean typecheck) and written so that nothing
here blocks — and several items actively prepare for — **Gen 3+ support**.

**Priority key:** `P0` ship-blocker / data-loss risk · `P1` high-value · `P2` nice-to-have
**Gen3 tag:** 🔺 = doing this now reduces Gen 3+ work later.

---

## ✅ Recently Done

### Round 7 — Gen 2 gender bug fix, Crystal-branch audit, tab tests, undo bound

- [x] **`fix` Party gender always Male.** GSC gender is a function of the Attack DV (like
  shininess), but `Gen2Adapter.recalculateStats` only re-derived `isShiny`, leaving
  `gender` stale whenever DVs changed (e.g. maxing IVs → all Male). It now re-derives
  `gender` from the Attack DV (eggs stay Genderless) and keeps `genExtension.gender` in
  sync. Regression-tested in `tests/gen2Gender.test.ts`.
- [x] **`P2` Crystal-branch audit (§1).** Confirmed `EventsTab`'s `=== 'Crystal'` is a
  legitimate within-Gen2 version distinction (Crystal-only events/UI), already behind the
  `isGen2SaveExtension` guard — documented inline; no abstraction leak.
- [x] **`P1` Component tests → interactions (§5).** Added `tests/SaveTabBar.test.tsx`
  (tab switch, close-tab by label, open-new / close-all, empty render, axe), extending the
  harness beyond static components.
- [x] **`P2` Undo history bound + depth (§3).** `useUndoHistory` now takes a configurable
  `maxHistory` (so Gen 3 can lower it for bigger saves), skips no-op pushes, and exposes
  `historyDepth()`. Tested with `renderHook` in `tests/useUndoHistory.test.tsx`. The full
  slot-diff/changelog model remains the longer-term plan.
- Coverage: +14 tests (`gen2Gender`, `SaveTabBar`, `useUndoHistory`) → 421 total.

### Round 6 — Gen 3 entity crypto, ID/shiny helpers, synthetic fixture

- [x] **`P1` Gen 3 entity crypto + block shuffle (§4).** Added `lib/generations/gen3/entity.ts`
  — the PK3 (80-byte) XOR-by-`PID^OTID` crypt + `PID % 24` block shuffle + word-sum
  checksum, built on the validated `entityFormat` shuffle primitives. Locked by
  `tests/gen3Entity.test.ts`: byte-exact encrypt→decrypt round-trip across PIDs hitting
  all 24 orderings, checksum validation, and tamper detection. The exact `sv`→permutation
  mapping and block field offsets still need byte-for-byte validation against PKHeX + a
  real `.pk3` when the Gen 3 parser lands. 🔺
- [x] **`P2` Gen 3 ID / shiny helpers (§4, secretId).** Added `lib/generations/gen3/identity.ts`
  — `combinedTrainerId`/`splitTrainerId` (TID low / SID high), `shinyValueGen3`, and
  `isShinyGen3` (Gen 3-5 threshold 8). These are the durable core a Gen 3 parser plugs
  `Gen3Extension.secretId` into. Unit-tested. 🔺
- [x] **`P2` Gen 3 synthetic fixture (§5).** A legally-clean, programmatically-built PK3
  fixture (no ROM data) proves the encrypt→detect→decrypt path end-to-end, including the
  `getEntityFormatByLength(80)` → Gen 3 stored recognition. 🔺
- Coverage: +15 tests (`gen3Entity`, `gen3Identity`) → 407 total.

### Round 5 — a11y gate, memo dedup, empty-box state

- [x] **`P2` Accessibility CI gate (§5).** Added `vitest-axe`; the `LegalityBadge` and
  `DropZone` render tests now assert zero axe violations. Runs inside the suite (so
  CI's `test:coverage` step enforces it). The gate immediately caught a real bug — the
  hidden file `<input>` had no accessible name — now fixed with an `aria-label`
  (also advances the §2 SR-labels item).
- [x] **`P2` Centralize `React.memo` comparators (§3).** Extracted the shared slot-prop
  comparison into `lib/utils/slotMemo.ts` (`arePokemonSlotPropsEqual`); `PCStorage`
  composes it with its `viewMode`/`viewedBoxIndex` extras and `PartyList` uses it
  directly. Unit-tested in `tests/slotMemo.test.ts`.
- [x] **`P2` Empty-box state (§2).** `PCStorage` now shows a friendly "This box is empty
  — drag a Pokémon here…" hint above the grid when the viewed box has no Pokémon
  (first-run is already handled by the Hero + DropZone screen).
- Coverage: +10 tests (`slotMemo` + axe gates) → 392 total.

### Round 4 — render-test harness, loading state, cache-sync routing

- [x] **`P1` Component/render test harness (§5).** Added happy-dom + Testing Library +
  jest-dom, a `tests/setup.ts` (matchers + auto-cleanup, guarded so node-env logic
  tests are unaffected), and `.test.tsx` support in `vitest.config.ts`. First render
  tests cover `LegalityBadge` (tone/headline, a11y label, popover findings). Component
  tests opt into the DOM per-file via `// @vitest-environment happy-dom`.
- [x] **`P2` Loading / busy state (§2).** `DropZone` now takes `isBusy` (wired from
  `App`'s `isProcessingQueue`/queue length): shows a spinner + "LOADING SAVE…", flips
  the power LED green, and suppresses click/drop so a second file can't be queued
  mid-parse. Render-tested in `tests/DropZone.test.tsx`.
- [x] **`P1` `currentBoxPokemon` cache-drift routing (§1).** The hand-rolled active-box
  re-derivations in `manipulation.ts` (×2) and `sortManager.ts` (×2) now route through
  the single `syncCurrentBox` helper, so the invariant lives in one place. Locked by
  `tests/cacheSync.test.ts` (reference-equality + no drift warning after a sort).
- Coverage: +12 tests (`LegalityBadge`, `DropZone`, `cacheSync`) → 382 total.

### Round 3 — legality wired into the UI + Gen 3 sprite coverage

- [x] **`P1` Surface structural legality in the editor (§4).** Added `useLegality`
  (`lib/hooks/useLegality.ts`), pure display mappers (`lib/legality/display.ts`:
  `analysisTone` / `analysisHeadline` / `notableResults`), and a non-blocking
  `LegalityBadge` (`components/editor/pokemon/`) wired into the Pokémon editor header.
  It recomputes as you edit and its popover states "structural checks only", so it
  never implies a full legality guarantee. 🔺
- [x] **`P1` Save-level clone scan (§4).** Added `analyzeSaveClones`
  (`lib/legality/save.ts`) — flattens party + all boxes, runs `analyzeBulk`, and maps
  each duplicate group back to concrete `{ location, index, boxIndex }` slots so the UI
  can point at offending Pokémon. Makes the round-2 bulk analyzer usable app-side. 🔺
- [x] **`P2` Gen 3 sprite coverage (§4).** Confirmed + locked with
  `tests/spriteCoverage.test.ts`: master/artwork resolve by Dex ID for 252–386, and
  game-specific gracefully falls back to the master sprite for unmapped (Gen 3)
  versions. No code change needed — the resolver was already data-driven. 🔺
- Coverage: +11 tests (`legalityDisplay`, `spriteCoverage`) → 370 total.

### Round 2 — legality engine groundwork + CDM guard

- [x] **`P1` Structural legality verifiers (§4).** Added `lib/legality/verifiers.ts`
  with adapter-driven `StructuralLimits` (`limitsFromAdapter`) and pure verifiers for
  level, IV/DV range, EV per-stat + total cap, species range, and duplicate moves.
  Orchestrated by `analyzeStructure(entity, limits)` in `lib/legality/index.ts`, which
  sets `analyzed:true` but whose summary always states "no encounter analysis" so the
  boundary never implies a full legality guarantee. No `generation === N` branching —
  Gen 1/2 (DV 0–15, no EV cap) and Gen 3 (IV 0–31, 510 cap) run the same code. 🔺
- [x] **`P1` Bulk clone analyzer (§4 backlog).** Added `lib/legality/bulk.ts`
  (`analyzeBulk`) — the third validation layer from the module README. Detects
  duplicate identities (PID for Gen 3+, composite species+DVs+OT+nickname for Gen 1/2)
  and reports them as `Fishy` clone groups. 🔺
- [x] **`P1` CDM field-creep guard (§3).** Extended `tests/scalabilityLint.test.ts` to
  fail if a new optional field is added to `CanonicalPokemon` (allowlisting the two
  sanctioned held-item mirrors), enforcing the "generation data lives in
  `genExtension`" contract as a test rather than by review. 🔺
- [x] **`P1` Modal focus/Esc audit (§2).** Verified: all 9 overlay/modal components
  (Export, LoadSave, SortSettings, the three `modals/*`, PokemonEditor,
  GameVersionSelector, PokemonDetailView) already route through `useModalA11y` for
  focus trap + restore + Esc. No changes needed.
- Coverage: +19 tests (`tests/legalityStructural.test.ts`, CDM guard) → 359 total.

### Round 1 — data-loss guard, error copy, a11y labels

- [x] **`P0` Unsaved-work guard.** Added `lib/utils/sessionGuard.ts`
  (`hasUnsavedWork` / `createBeforeUnloadHandler`) and wired a `beforeunload`
  listener in `App.tsx` that warns only when a tab is dirty. Covered by
  `tests/sessionGuard.test.ts` (7 tests).
- [x] **`P2` Surface real load/export failure reasons.** `App.tsx` now appends the
  underlying `Error.message` to both the load-queue and export error modals instead
  of the generic "Failed to …" copy.
- [x] **`P1` Accessibility: `aria-label`s on icon-only buttons.** Labelled the drawer
  close (`Header`), undo/redo + checksum badge (`EditorTools`), move-mode exit FAB
  (`MoveModeFAB`), and the per-tab close / new / close-all buttons + dirty-state dot
  (`SaveTabBar`).
- [x] **`P1` Undo/redo affordance.** Already shipped — visible Undo/Redo buttons in
  `EditorTools` bound to `canUndo()`/`canRedo()`, reactive via `setData` re-renders.
  Copy fix: corrected stale "Gen 1 Save Editor" footer to "Gen 1 & 2 Save Editor".

---

## 1. Bug Fixes & Correctness (do first)

- [x] **`P0` No unsaved-work guard.** ✅ *Done — see "Recently Done" above.* Saves
  live only in React state (`App.tsx` `tabs[]`); a refresh, accidental tab close, or
  navigation silently discarded every edit. Now guarded by a `beforeunload` listener
  driven by `hasUnsavedWork(tabs)`.
- [ ] **`P1` No crash-recovery / draft persistence.** Because nothing is persisted,
  a single uncaught error loses the whole session. Add opt-in autosave of dirty
  buffers to IndexedDB (binary saves are ~32KB Gen1/2; fine to store) with a
  "restore unsaved session?" prompt on next load. 🔺 *Gen 3 saves are 128KB+;
  design the store key/size budget now.*
- [~] **`P1` `currentBoxPokemon` cache drift.** The active-box re-derivations in
  `manipulation.ts` and `sortManager.ts` now route through the single `syncCurrentBox`
  helper (locked by `tests/cacheSync.test.ts`), so the mutation paths can no longer
  hand-roll the cache. The deliberate `dataIntegrity` test still exercises the dev-only
  drift *warning*. ✅ *Remaining (optional, larger):* drop the cached field entirely in
  favour of a `getActiveBox(save)` selector so the drift class is fully unrepresentable
  — deferred because it changes the `CanonicalSave` shape (parsers/writers/UI touch it).
- [x] **`P2` Generic load/export error copy.** ✅ *Done.* `App.tsx` previously showed
  "Unexpected error processing …" and "Failed to generate save file." with no detail.
  Both paths now append the underlying `Error.message` so users can self-diagnose.
- [x] **`P2` Audit `gameVersion === 'Crystal'` branch** in `EventsTab.tsx`. ✅ *Done.*
  It's a legitimate within-Gen2 version distinction (Crystal-only events/UI), already
  routed through the `isGen2SaveExtension` guard — documented inline as an accepted
  exception, not an abstraction leak.

---

## 2. UI / UX Improvements

- [ ] **`P0` Keyboard accessibility for drag-and-drop.** The core interaction (moving
  Pokémon between party/boxes/tabs) is mouse/touch only. Across all of `components/`
  there is exactly **one** `role=` attribute and ~13 `aria-*` usages. Keyboard-only
  and screen-reader users currently cannot move a Pokémon at all. Add a
  "select → focus target → Enter to place" keyboard path alongside the existing
  `useMoveMode` hook, with `aria-grabbed`/`aria-dropeffect` (or the modern
  `aria-live` announcement pattern) on slots in `PCStorage.tsx` / `PartyList.tsx`.
- [ ] **`P1` Screen-reader labels on sprites & controls.** Sprites have `alt` text
  (good). Prior passes labelled the icon-only buttons in `Header`, `EditorTools`,
  `MoveModeFAB`, `SaveTabBar`, and the hidden file `<input>` in `DropZone` (caught by
  the new axe gate). ✅ *Remaining:* run axe across the editor tabs (bulk-action buttons
  in `Pokedex.tsx:180`, panel controls) and close the findings here.
- [x] **`P1` Focus management in modals.** ✅ *Verified done.* All 9 overlay/modal
  components already use `useModalA11y` for focus trap, focus restore on close, and
  Esc handling. Audited; no gaps found.
- [x] **`P1` Undo/redo affordance.** ✅ *Done (already shipped).* Visible Undo/Redo
  buttons in `EditorTools` are bound to `canUndo()`/`canRedo()` and stay reactive
  because every mutation pairs with a `setData` re-render. Keyboard shortcuts live in
  `EditorDashboard.tsx`.
- [x] **`P2` Loading / busy states.** ✅ *Done.* `DropZone` shows a spinner + "LOADING
  SAVE…" (and a green LED) while `App`'s `isProcessingQueue` is set, and blocks
  click/drop during parse so no second file is queued mid-parse. Render-tested.
  *Remaining (optional):* a skeleton in the tab bar for very large multi-file queues.
- [ ] **`P2` Mobile drag preview polish.** `lib/hooks/touchDnD.ts` reimplements DnD
  for touch via `elementFromPoint`. Verify auto-scroll near screen edges and the
  400ms hover tab-switch behave on small viewports; add haptic feedback on drop where
  available.
- [~] **`P2` Empty/zero states.** Empty box now shows a friendly "This box is empty…"
  hint (`PCStorage`), and first-run is handled by the Hero + DropZone screen. ✅
  *Remaining (optional):* empty-party and "Pokédex 0% seen" guidance.

---

## 3. Code Quality & Architecture

- [ ] **`P1` Finish the `SaveContext` consolidation.** README/ROADMAP flag this as the
  main known gap: `EditorDashboard` provides `SaveContext` but still prop-drills to
  tab composers, so two patterns coexist. 19 components already consume the context —
  migrate the remaining prop-drilled tabs (`StorageTab`, `PartyList`, etc.) onto it
  and delete the redundant props. 🔺 *A clean context boundary is what lets a Gen 3
  panel drop in without touching the dashboard.*
- [ ] **`P1` Decompose the largest files.** Several files are well past a comfortable
  review size and concentrate risk:
  - `lib/generations/gen2/parser.ts` (1356 LOC)
  - `lib/generations/gen2/writer.ts` (888 LOC)
  - `components/editor/PCStorage.tsx` (895 LOC)
  - `components/editor/TrainerCard.tsx` (668 LOC)
  - `components/editor/tabs/EventsTab.tsx` (581 LOC)

  Split parsing/writing into per-section modules (party / box / pokedex / items) and
  extract presentational sub-components from the big React files. 🔺 *Gen 3 will add
  a third large parser/writer pair — establish the per-section file layout now so it's
  a template, not a copy-paste of a 1300-line monolith.*
- [x] **`P1` `genExtension` discipline check.** ✅ *Done.* `tests/scalabilityLint.test.ts`
  now fails if a new optional `?:` field appears on `CanonicalPokemon`, allowlisting the
  two sanctioned held-item mirrors. The "generation data lives in `genExtension`"
  contract is now enforced in CI before Gen 3 work starts.
- [ ] **`P2` Resolve the `TODO 4.x` markers.** Outstanding numbered TODOs reference real
  follow-ups, e.g. `parser/types.ts:83` (Special-DV mirroring), `Gen2Adapter.ts:36` /
  `extensions.tsx:308` (explicit panel-extension registration, TODO 4.7),
  `EditorDashboard.tsx:306` (generic save-extension field updater, TODO 3.9). Triage
  which are pre-Gen3 cleanups vs. deferrable.
- [~] **`P2` Undo snapshot strategy.** `useUndoHistory` now accepts a configurable
  `maxHistory` (memory bound Gen 3 can tune down), skips no-op pushes, and exposes
  `historyDepth()` — tested via `renderHook`. ✅ *Remaining:* the full slot-diff /
  changelog model (PKHeX `SlotChangelog`-style) to replace full `structuredClone`
  snapshots for large saves.
- [x] **`P2` Centralize remaining `React.memo` comparators.** ✅ *Done.* The shared
  slot-prop comparison now lives in `lib/utils/slotMemo.ts` (`arePokemonSlotPropsEqual`),
  composed by `PCStorage` (+ `viewMode`/`viewedBoxIndex`) and used directly by
  `PartyList`. Unit-tested; a new shared prop is now added in one place.

---

## 4. Gen 3+ Readiness (cross-cutting) 🔺

The architecture is already primed for this (lazy adapter registry, block-shuffle
seam, `checksumOffsets`, standalone-format crypto contract, `Gen3Extension` stub in
`canonicalModel.ts`). Track the concrete gaps:

- [~] **`P1` Build the legality engine — structural pass + UI wiring landed; encounter pass remains.**
  `analyzeLegality()` stays an honest placeholder, but `analyzeStructure(entity, limits)`
  runs real structural verifiers (level, IV/EV ranges, EV total cap, species range,
  duplicate moves) behind `analyzed:true`, with summaries that never claim full legality.
  `analyzeBulk()` / `analyzeSaveClones()` add cross-entity clone detection, and a
  non-blocking `LegalityBadge` now surfaces structural findings live in the editor.
  ✅ *Remaining:* the encounter-consistency engine (per-generation `EncounterProvider` +
  move-learnability / gender↔PID / met-data verifiers), and surfacing `analyzeSaveClones`
  in a box/storage view. Gen 3 is where the encounter pass first becomes meaningful.
- [x] **`P1` Gen3 entity crypto + block shuffle.** ✅ *Done (algorithm + round-trip).*
  `lib/generations/gen3/entity.ts` implements PK3 XOR-by-`PID^OTID` + `PID % 24` block
  shuffle + word-sum checksum on the `entityFormat` seam; byte-exact round-trip across all
  24 orderings, checksum + tamper tests (`tests/gen3Entity.test.ts`). *Remaining:* validate
  the `sv`→permutation mapping and data-block field offsets byte-for-byte against PKHeX +
  a real `.pk3` when the Gen 3 adapter/parser is built.
- [ ] **`P1` Gen3 UI panels via the extension system, not new dashboard code.** Abilities
  and natures already have `hasAbilities`/`hasNatures` metadata flags and a
  `Gen3Extension` (abilityId, natureId, ribbons, contestStats). New panels should
  register through `ExtensionRegistry` exactly like `gen2/extensions.tsx` — verify a
  Gen 3 panel can mount with **zero** edits to `EditorDashboard`/`PokemonEditorModal`
  (this is the OCP promise the project is built on).
- [~] **`P2` `secretId`.** ✅ *Helpers landed.* `lib/generations/gen3/identity.ts` provides
  `combinedTrainerId`/`splitTrainerId` (TID low / SID high) and `isShinyGen3` /
  `shinyValueGen3` — the durable shiny-calc core that uses `Gen3Extension.secretId`
  (which already exists on the CDM). *Remaining:* plumb `secretId` parser → CDM → UI once
  the Gen 3 parser exists.
- [x] **`P2` Sprite coverage for 252–386.** ✅ *Done (verified + locked).* `lib/sprites.ts`
  resolves Gen 3 species in master/artwork modes (URL templated by Dex ID), and
  game-specific falls back to the master sprite for unmapped versions. Regression-locked
  by `tests/spriteCoverage.test.ts`. Game-specific *folders* for Gen 3 are pre-staged as
  commented `VERSION_SPRITE_MAP` rows, to enable when the Gen 3 adapter lands.

---

## 5. Testing & Tooling

- [~] **`P1` Add component/render tests.** ✅ *Harness established* (happy-dom + Testing
  Library + jest-dom; `.test.tsx` support; per-file `@vitest-environment`). First tests
  cover `LegalityBadge`, `DropZone`, and `SaveTabBar` (tab switch / close / open).
  *Remaining:* the remaining high-risk interactions — drag-to-move, multi-select,
  and the export flow.
- [x] **`P2` Accessibility CI gate.** ✅ *Done.* `vitest-axe` assertions in the
  `LegalityBadge` and `DropZone` render tests assert zero violations; they run in the
  standard suite, so CI's `test:coverage` step enforces them. Extend to new components
  as they gain render tests.
- [~] **`P2` Wire up the existing tooling consistently.** `ci.yml` already runs `lint`,
  `typecheck`, `test:coverage` (real thresholds), `build`, and `check:bundle` on every
  push/PR. ✅ *Decision:* `format:check` is intentionally NOT in CI — the repo isn't
  globally Prettier-formatted (149 files differ) and instead formats *changed* files on
  commit via `lint-staged`. Adding it would force a noisy whole-repo reformat; revisit
  only if the team decides to adopt repo-wide Prettier in one dedicated PR.
- [x] **`P2` Gen3 fixture early.** ✅ *Done (synthetic).* `tests/gen3Entity.test.ts` builds
  a legally-clean PK3 fixture programmatically (no ROM data) and TDDs the
  encrypt→detect→decrypt path, including `getEntityFormatByLength(80)` → Gen 3 stored.
  A real `.pk3` capture can be added under `tests/fixtures/` later to validate the exact
  PKHeX byte layout.

---

### Suggested next sprint

With the Gen 2 gender fix, Crystal-branch audit, tab-bar tests, and a bounded undo
history in place, the highest-leverage next steps are:

1. Stand up the Gen 3 adapter + parser/writer using the crypto + shuffle now proven,
   then validate the `sv`→permutation map against a real `.pk3` (§4).
2. Keyboard drag-and-drop (§2) — biggest remaining UX/a11y gap.
3. `SaveContext` consolidation (§3) — unblocks clean Gen 3 panel insertion.
4. Extend component/axe tests to drag-to-move and multi-select (§5).
