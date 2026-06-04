# TODO — UI/UX, Code Quality & Bug Fixes

Working backlog for BilKo's PC Reborn. Items are grounded in the current codebase
(Gen I/II shipped, 333 passing tests, clean typecheck) and written so that nothing
here blocks — and several items actively prepare for — **Gen 3+ support**.

**Priority key:** `P0` ship-blocker / data-loss risk · `P1` high-value · `P2` nice-to-have
**Gen3 tag:** 🔺 = doing this now reduces Gen 3+ work later.

---

## ✅ Recently Done

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
- [ ] **`P1` `currentBoxPokemon` cache drift.** The test suite repeatedly logs
  `[invariant] currentBoxPokemon is out of sync with pcBoxes[...]` (visible in
  `dataIntegrity` / `populatedRoundTrip` runs). The writer guards against it, but
  callers must remember to call `syncCurrentBox()` after editing `pcBoxes`. Make the
  active-box cache derived (selector/memo) instead of a separately-mutated field so
  the drift class of bug becomes unrepresentable.
- [x] **`P2` Generic load/export error copy.** ✅ *Done.* `App.tsx` previously showed
  "Unexpected error processing …" and "Failed to generate save file." with no detail.
  Both paths now append the underlying `Error.message` so users can self-diagnose.
- [ ] **`P2` Audit `gameVersion === 'Crystal'` branch** in `EventsTab.tsx:57`. This is
  one of the few remaining hardcoded version checks in the UI; confirm it routes
  through adapter metadata, or document why Crystal events are a legitimate exception.

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
  (good). A first pass added `aria-label`s to the icon-only buttons in `Header`,
  `EditorTools`, `MoveModeFAB`, and `SaveTabBar`. ✅ *Remaining:* run axe DevTools
  across the editor tabs (bulk-action buttons in `Pokedex.tsx:180`, panel controls)
  and close the findings here.
- [x] **`P1` Focus management in modals.** ✅ *Verified done.* All 9 overlay/modal
  components already use `useModalA11y` for focus trap, focus restore on close, and
  Esc handling. Audited; no gaps found.
- [x] **`P1` Undo/redo affordance.** ✅ *Done (already shipped).* Visible Undo/Redo
  buttons in `EditorTools` are bound to `canUndo()`/`canRedo()` and stay reactive
  because every mutation pairs with a `setData` re-render. Keyboard shortcuts live in
  `EditorDashboard.tsx`.
- [ ] **`P2` Loading / busy states.** `isProcessingQueue` exists in `App.tsx` but
  confirm the DropZone and tab bar show a spinner/skeleton while large saves parse,
  so the app doesn't appear frozen. 🔺 *Matters more for bigger Gen 3 buffers.*
- [ ] **`P2` Mobile drag preview polish.** `lib/hooks/touchDnD.ts` reimplements DnD
  for touch via `elementFromPoint`. Verify auto-scroll near screen edges and the
  400ms hover tab-switch behave on small viewports; add haptic feedback on drop where
  available.
- [ ] **`P2` Empty/zero states.** Ensure first-run (no save loaded), empty box, and
  "Pokédex 0% seen" states have friendly guidance rather than blank grids.

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
- [ ] **`P2` Undo snapshot strategy.** `useUndoHistory` deep-clones the *entire*
  `ParsedSave` (`structuredClone`, MAX_HISTORY=50). The code itself notes this is
  "feasible at ~200KB per snapshot for Gen 1/2." 🔺 *Gen 3 saves are larger and may be
  edited more granularly — switch to a slot-diff/changelog model (PKHeX's
  `SlotChangelog` approach the comment references) before snapshots get expensive.*
- [ ] **`P2` Centralize remaining `React.memo` comparators.** `PCStorage.tsx:438` and
  `PartyList.tsx:313` hand-roll `gameVersion ===` equality checks. Extract a shared
  `arePropsEqual` helper to avoid drift as fields are added.

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
- [ ] **`P1` Gen3 entity crypto + block shuffle.** The seams exist
  (`lib/core/entityFormat.ts`, `IGenerationBinaryOps.unscramble/rescramble`,
  `checksumOffsets`, CRC16 hooks in `interfaces.ts`). Implement the Gen 3 24-byte
  block shuffle + XOR-by-PID decryption against these interfaces and lock it with a
  round-trip test mirroring `tests/roundTrip.test.ts`.
- [ ] **`P1` Gen3 UI panels via the extension system, not new dashboard code.** Abilities
  and natures already have `hasAbilities`/`hasNatures` metadata flags and a
  `Gen3Extension` (abilityId, natureId, ribbons, contestStats). New panels should
  register through `ExtensionRegistry` exactly like `gen2/extensions.tsx` — verify a
  Gen 3 panel can mount with **zero** edits to `EditorDashboard`/`PokemonEditorModal`
  (this is the OCP promise the project is built on).
- [ ] **`P2` `secretId` stub.** `Gen3Extension.secretId` is a stub; Gen 3 trainer ID is
  a 32-bit (TID+SID) value used in shiny calc. Plumb it through parser → CDM → UI.
- [x] **`P2` Sprite coverage for 252–386.** ✅ *Done (verified + locked).* `lib/sprites.ts`
  resolves Gen 3 species in master/artwork modes (URL templated by Dex ID), and
  game-specific falls back to the master sprite for unmapped versions. Regression-locked
  by `tests/spriteCoverage.test.ts`. Game-specific *folders* for Gen 3 are pre-staged as
  commented `VERSION_SPRITE_MAP` rows, to enable when the Gen 3 adapter lands.

---

## 5. Testing & Tooling

- [ ] **`P1` Add component/render tests.** The suite is excellent for logic
  (round-trip, codecs, stat calc, scalability invariant) but has **no** UI/render
  tests. Add React Testing Library coverage for the highest-risk interactions:
  drag-to-move, multi-select, tab switching, and the export flow.
- [ ] **`P2` Accessibility CI gate.** Add `jest-axe`/`vitest-axe` assertions to the new
  component tests so the a11y items in §2 don't regress.
- [ ] **`P2` Wire up the existing tooling consistently.** `lint`, `format:check`,
  `typecheck`, `test:coverage`, and `check:bundle` scripts exist — ensure they all run
  in CI (`.github/`) on every PR, and that the coverage gate has a real threshold.
- [ ] **`P2` Gen3 fixture early.** Add a (legally-sourced/synthetic) Gen 3 save fixture
  under `tests/fixtures/` so detection and parsing can be TDD'd before the adapter is
  written.

---

### Suggested next sprint

With legality now wired into the editor (badge + clone scan) and Gen 3 sprite
coverage confirmed, the highest-leverage next steps are:

1. Surface `analyzeSaveClones` in the PC storage view (highlight clone slots) — the
   helper exists; show it.
2. Keyboard drag-and-drop (§2) — biggest remaining UX/a11y gap.
3. `SaveContext` consolidation (§3) — unblocks clean Gen 3 panel insertion.
4. First React Testing Library component tests (§5) — would let us render-test the
   new `LegalityBadge` directly.
