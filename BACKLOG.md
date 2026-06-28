# BACKLOG — Deferred Work

> Items deferred from the original `TODO.md`, re-tagged with phase numbers from `ROADMAP_TO_PKHEX_PLUS.md`.
> **New items must reference a phase from the roadmap.** If an item doesn't fit a phase, the roadmap is incomplete — add it there first.

---

## Phase 1: Architectural Unification

- [ ] **1.1** Unify the type-ID space — adopt one canonical type enum, convert at parse/write boundaries. *(was TODO §4.4)*
- [ ] **1.2** Unify base-stats shape — standardize on `BaseStats = { hp, attack, defense, speed, spAtk, spDef }`.
- [ ] **1.3** Make themes.ts the source of truth — `data/games.ts` auto-aggregates from `registry.getAllVersionThemes()`.
- [ ] **1.4** Per-generation sprite + trainer data — move `VERSION_SPRITE_MAP`/`TRAINER_SPRITE_MAP` to `genN/data/sprites.ts`.
- [ ] **1.5** Per-generation entity format detection — replace `getEntityFormatByLength` switch with adapter-declared `supportedEntitySizes`.
- [ ] **1.6** Unify the writer idiom — `BinaryWriter` is the standard; rewrite Gen 2 writer; extract `optionsCodec.ts`.
- [ ] **1.7** Unify the standalone-Pokémon API — delete legacy `parseStandalonePokemon`/`createStandalonePokemon`.
- [ ] **1.8** Extract Gen 2 convenience methods into `gen2/saveData.ts`.
- [ ] **1.9** Make the scalability lint name-insensitive (AST walker, not identifier regex).

## Phase 2: Gen 3 Full Implementation

- [ ] **2.1** Complete the Gen 3 adapter skeleton (7 files per recipe: `Gen3Adapter.ts`, `parser.ts`, `writer.ts`, `StandaloneFormat.ts`, `extensions.tsx`, `data/*`).
- [ ] **2.2** Wire PK3 parser to populate `Gen3Extension` (PID, OTID, ability, nature, gender, Unown, Wurmple, ribbons, contest stats).
- [ ] **2.3** Gen 3 save-level features (Pokeblock case, Secret Base, Contest records, Battle Tower).
- [ ] **2.4** Gen 3 legality (PID/IV method 1/2/4, encounter validation, event DB).

## Phase 6: Cross-Gen Transfer Hub

- [ ] **6.1** Design `PokemonHub` format (analogous to PKHeX's `PKH`).
- [ ] **6.2** Implement `toHub`/`fromHub` per generation with transfer restrictions.
- [ ] **6.3** UI: drag-and-drop between save tabs of different generations with confirmation modal.
- [ ] **6.4** Delete the pairwise `convertPokemonForTransfer` branches + `canTransferToGen` hardcoded ranges.

## Phase 8: UI/UX Unification

- [ ] **8.1** Design system — `tokens.ts`, no more magic z-index/spacing values. Delete `getVersionThemeColor`.
- [ ] **8.2** Save-level extension seam — `ISavePanelExtension`, `EventsTab` becomes a host.
- [ ] **8.3** `<DnDSlot>` primitive + `useSlotDnD` hook — eliminate ~400 lines of duplicated DnD glue.
- [ ] **8.4** `<Modal>` wrapper component with semantic `zLayer` prop.
- [ ] **8.5** Finish the SaveContext migration — `useSaveActions(ctx)` hook, tab contract = `(ctx-optional-callbacks) => JSX`.
- [ ] **8.6** `<PokemonSprite>` everywhere — add `forceArtwork`/`integerScale`/`form` props; migrate HallOfFame/Pokedex/TrainerCard/Inventory.
- [ ] **8.7** Component reorganization — `features/` directories, all modals in `modals/`, move `DashboardTab` type to `uiTypes.ts`.

## Phase 7: PKHeX+ Features (ongoing)

- [ ] **7.1** Full Pokédex editor (per generation) + Living Dex generator.
- [ ] **7.2** Event / Mystery Gift database (`.pcd`/`.pgf`/`.wc6`/`.wc7`/`.wc8`).
- [ ] **7.3** Legality checker (port PKHeX's `LegalityAnalysis`).
- [ ] **7.4** Batch editor.
- [ ] **7.5** Save diff viewer.
- [ ] **7.6** Backup / version history.
- [ ] **7.7** QR code import/export (Gen 7+).
- [ ] **7.8** Plugin system.
- [ ] **7.9** Multi-language support (i18n).
- [ ] **7.10** Mobile/touch UX pass.

---

## Items awaiting phase assignment

*(If an item doesn't fit a phase above, it goes here until the roadmap is updated.)*

- [ ] Keyboard drag-and-drop (§2 from original TODO) — **→ Phase 8.3** (the `<DnDSlot>` primitive will include keyboard support as a first-class citizen, not a bolt-on).
- [ ] `SaveContext` consolidation (§3 from original TODO) — **→ Phase 8.5**.
- [ ] Extend component/axe tests to drag-to-move and multi-select (§5 from original TODO) — **→ Phase 8.3** (after `<DnDSlot>`, the tests target the primitive, not each consumer).
