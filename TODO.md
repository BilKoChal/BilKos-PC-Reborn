# BilKo's PC Reborn — Master TODO

> **Scope of this document**
> A complete, prioritized engineering backlog for *BilKo's PC Reborn*, derived from a deep
> read of the current codebase plus research into Gen 1–9 save-file formats and PKHeX
> architecture.
>
> **Strategic goal:** make the codebase *scalable to Gen 9* while, for now, **only shipping
> Gen 1 + Gen 2 support and fixing their bugs**. Everything tagged `[GEN3+ PREP]` is
> scaffolding/refactoring that must NOT break the Gen 1/2 experience and must NOT require
> actually implementing later generations yet — it only removes the friction that would make
> adding them painful.
>
> **Repository health snapshot (at time of analysis)**
> - `npm run typecheck` ✅ passes (strict mode, `noUncheckedIndexedAccess`, `noImplicitOverride` all on)
> - `npm test` ✅ 143 tests pass across 5 files
> - `npm run build` ✅ builds; per-generation code splitting works (Gen1Adapter / Gen2Adapter are separate chunks)
> - CI ✅ runs typecheck + test + build on push/PR; gh-pages deploy on green CI
>
> The foundation is strong. This TODO is about *hardening, correctness, completeness, and
> removing the last barriers to Gen 3+*, not a rewrite.

---

## ✅ Progress Log

**Iteration 1 — Milestone M1 "stop the bleeding" (partial):**
- **2.1** Gen 1 status write — FIXED.
- **2.2** Gen 2 party status write — FIXED.
- **2.3** Gen 1 HP-DV derivation on recalc — FIXED.
- Added `encodeStatusByte()` to `lib/utils/byteHelpers.ts` (inverse of `decodeStatus`).
- **5.2** done / **5.1** partial — new `tests/populatedRoundTrip.test.ts` (19 tests).
- Result: **162 tests pass** (was 143), `tsc --noEmit` clean, `vite build` succeeds. The 12
  status/HP-DV tests were verified to FAIL on pre-fix code and PASS after — genuine regression guards.

**Iteration 2 — completes M1 data-loss items + small adjacent bugs:**
- **2.4** Gen 2 JPN/KOR text written with the International codec — FIXED. Added a
  `codecForOffsets(offsets)` resolver in `lib/generations/gen2/writer.ts` and routed *every*
  region-aware encode (party/box nicknames + OT, rival name, daycare, box names, phone contacts,
  trainer name) through it. This also fixes the latent Korean drop (the old `encodeGameBoyText`
  wrapper forwarded only `isJapanese`). Removed the now-dead `encodeGameBoyText`/`sanitizePokemonText`
  wrappers.
- **2.5** Misleading no-op egg `dexId` ternary + unused `effectiveSpeciesId` in the Gen 2 parser —
  removed and documented (body species at byte 0x00 is authoritative; egg marker lives only in the
  species-list header).
- **2.10** Stale `alert()` blocking Gen 2 standalone export — FIXED. Export now driven by
  `adapter.supportsStandalone` + `adapter.standaloneFormat.fileExtension`; button is hidden when
  unsupported and all `alert()`s replaced with the toast system.
- Tests: +2 in `tests/populatedRoundTrip.test.ts` (INT↔JPN codec divergence; International box-mon
  nickname round-trip via the refactored box path). **164 tests pass**, `tsc` clean, build OK.
- **M1 is now data-loss-free for the synthetic-save level.** Remaining before fully closing M1:
  real-fixture coverage (**5.4**) and the byte-range/box extensions of **5.1**.

**Iteration 3 — Milestone M2 "correctness & confidence":**
- **2.6** Wrong Gen 2 TM/HM → move mapping — FIXED. Replaced the incorrect/duplicated table with the
  canonical GSC mapping (verified every slot resolves to the right move name in the repo's own
  `GEN2_MOVES_LIST`), and hoisted it to an exported `GEN2_TM_HM_MOVES` constant so it's testable.
  Examples of what was wrong: TM01 resolved to "Mud-Slap" (should be DynamicPunch), HM04 to "Flash"
  (should be Strength).
- **5.3** Data-table integrity tests — DONE. New `tests/dataIntegrity.test.ts` (12 tests) asserts:
  Gen1 base stats cover 1..151, Gen2 cover 1..251; species-name arrays equal `nationalDexMax + 1` with
  no empty names; Gen1 move list is 0..165; Gen2 move/PP/type arrays are all length 252; type charts
  are square (15×15 / 17×17) with only {0, 0.5, 1, 2} multipliers and include Steel+Dark for Gen2;
  every Gen2 species 1..251 has an explicit growth-rate entry; and the full TM/HM mapping is correct
  (locks 2.6, verified to fail on the old table).
- Exported `SPECIES_GROWTH_RATE` (`lib/utils/experience.ts`) for the coverage assertion (supports 3.3).
- Result: **176 tests pass** (was 164), `tsc` clean, build OK.

**Iteration 4 — Milestone M2 code quality:**
- **4.1** Eliminate `as any` casts — DONE. The only real production cast (`lib/hooks/touchDnD.ts`,
  reading `.boxIndex` off the `SourceLocation` union) now narrows on `src.type === 'box'`. The 8 test
  casts became `as Partial<PokemonStats> as PokemonStats` (type-checks the present fields instead of
  silencing the compiler). Remaining `grep` hits for "as any" are comments / the substring "has any
  idea" — zero real casts left.
- **4.2** Gate production logging — DONE. Added `lib/utils/logger.ts`: `debug/info/log/warn` are
  silenced in production builds (gated on `import.meta.env.DEV`), `error` always fires. Routed all 22
  `console.*` calls in `lib/` through it (e.g. the per-file "[Parser] Analyzing …" log is now
  `logger.debug`). UI-layer `console.error`s (genuine failures) left as-is per 4.2's scope note.
- Result: **176 tests pass**, `tsc` clean, build OK; verified the logger gates correctly per env.

**Iteration 5 — Milestone M2 code-quality refactors:**
- **4.3** De-duplicate the parser "empty Pokémon" object — DONE. Added
  `createEmptyCanonicalPokemon(overrides)` to `lib/canonicalModel.ts` (colocated with the type);
  both Gen 1 and Gen 2 parsers now call it instead of inlining a ~30-field literal. Adding a future
  CDM field now means editing one factory, not every parser.
- **4.4** Consolidate the three `DEX_TO_INTERNAL` reverse maps — DONE. The National-Dex → Gen 1
  internal map is now built once in `gen1/data/offsets.ts` as `GEN1_DEX_TO_INTERNAL` (plus a
  `getGen1InternalSpeciesId()` helper); `Gen1Adapter`, `gen1/writer.ts`, and `crossGenConverter.ts`
  all import it instead of rebuilding it.
- Added 4 refactor-guard tests in `tests/dataIntegrity.test.ts` (factory completeness/overrides;
  reverse map is the exact inverse of `GEN1_INTERNAL_TO_DEX`).
- Result: **180 tests pass** (was 176), `tsc` clean, build OK.

**Iteration 6 — Milestone M2 code quality (finishing the 4.x batch):**
- **4.5** Tidy `PokemonIVs`/`PokemonEVs` optional `spAtk?/spDef?` — DONE. Made both **required**.
  Audit confirmed every construction site (parsers, factory, tests) already populates them and no code
  reads them optionally, so this removes a class of `undefined` hazards under `noUncheckedIndexedAccess`
  and gives Gen 3 (true split IVs) a clean base. `tsc` passes with no call-site changes needed.
- **4.6** Replace `alert()`/`window` UX — DONE (verified). The only `alert()` was the standalone-export
  one already replaced with toasts in Iteration 2 (task 2.10); a full audit now finds **zero**
  `alert(`/`confirm(`/`prompt(` calls remaining (one stale mention is a comment).
- **4.7** Extension registration timing under lazy adapters — DONE. Verified `detectAndParseAsync`
  preloads adapters, so extensions are always registered before any panel renders (no flash). Made the
  contract explicit: extracted `registerGen2PanelExtensions()` and call it from the `Gen2Adapter`
  constructor (idempotent via the registry's id-dedupe — and now robust across registry `clear()`/HMR,
  since the redundant module-boolean guard was removed). Added clarifying comments at the panel
  `getExtensions` calls.
- Added 4 tests (factory/reverse-map were Iteration 5; this iteration adds 2 for 4.7 registration).
- Result: **182 tests pass** (was 180), `tsc` clean, build OK. **All of §4 (4.1–4.7) is now complete.**

**Iteration 7 — Milestone M2 data accuracy (gender ratios):**
- **2.7 / 6.2** Audit `getGen2Gender` species buckets — DONE. Audited every species 1..251 against the
  canonical gender ratios (PokeAPI `gender_rate`): the species assignments AND the DV-threshold logic
  (`atkIv ≤ 1/3/7/11`) were already correct, including the flagged edge cases (Togepi 175/176 = 12.5%F,
  Snubbull 209/210 = 75%F, Corsola 222 = 75%F, fossils 138-142 = 12.5%F, babies). Refactored the
  function to expose the bucket model as data (`getGen2GenderRatio()` + `Gen2GenderRatio` type) so it's
  testable from one source of truth and reusable for Gen 3+. Added an **exhaustive 251-species audit**
  plus threshold-boundary and edge-species tests in `dataIntegrity.test.ts` (verified the audit catches
  a deliberate misclassification). The 51 existing gender spot-checks still pass (behavior-preserving).
- Result: **186 tests pass** (was 182), `tsc` clean, build OK.

**Iteration 8 — Milestone M2 data accuracy (Gen 1 region + items):**
- **2.8** Gen 1 JPN `saveSize` inconsistency — FIXED. JPN Gen 1 SRAM is 32 KB just like International
  (region differs by data layout, not size). Corrected `JPN_REGION_CONFIG.saveSize` from `0x10000` to
  `0x8000`, fixed the field doc, and removed the dead/incorrect `buffer.length >= 0x10000`
  "Japanese = 64 KB" branch in `detectGen1Region` (it could never fire — detection only accepts 32 KB
  files); region is still detected by the existing party-offset heuristic.
- **6.5** Gen 2 item ID/name coverage — DONE. Audited items 1–95: only ID 25 was a `"Item 25"`
  placeholder (silently dropped from `getAllItemNames`); set it to its canonical name **Nugget**. HMs
  (125–131 → HM01–07) and TMs (132–181 → TM01–50) verified to resolve.
- Added 7 tests in `dataIntegrity.test.ts` (region save sizes + layout-based detection; full item
  1–95 non-placeholder coverage + HM/TM ranges).
- Result: **193 tests pass** (was 186), `tsc` clean, build OK.

**Iteration 9 — PKHeX architecture reconciliation (planning, no code change):**
- Cross-checked the project against a deep read of the real PKHeX source (`PKHeX.Core`). **Verdict: on
  track.** Added **§8.5** documenting the point-by-point alignment (abstract base + per-gen subclass,
  size→fingerprint detection, registry/factory routing, data-as-tables, capability interfaces, decrypt-
  in-memory/re-seal-on-write, one-hop cross-gen transfer, fail-closed robustness) and six PKHeX-grounded
  seam-hardening items (8.5.1–8.5.6): detection waterfall + wrapper handlers, explicit `SetChecksums`
  write step, concrete entity-encryption hooks incl. the PID%24 block-shuffle, a legality-engine
  boundary note, HOME-as-hub transfer guidance, and save-vs-entity validation naming.
- Augmented §9.3 with precise PKHeX mechanism references and folded 8.5.x into milestone M4.
- No source files changed; **193 tests still pass**, `tsc` clean, build OK.

**Iteration 10 — Milestone M2 final Gen 2 write/parse bugs:**
- **2.9** Active-box write drift — FIXED. `currentBoxPokemon`/`currentBoxCount` are a cache of
  `pcBoxes[currentBoxId]`, and both writers treat `pcBoxes` as the source of truth. The re-derivation
  was hand-rolled in 7+ places. Added `syncCurrentBox(save)` + a dev-only `assertCurrentBoxInSync(save)`
  (logger-gated) to `canonicalModel.ts`, re-exported via `parser/types.ts`; routed the 4 `EditorDashboard`
  sync sites through the helper and call the assert at the top of both `writeGen*Save`.
- **2.11** Crystal `CaughtData` read for all versions — FIXED. The parser read struct bytes 0x1D-0x1E
  as CaughtData **unconditionally**; in Gold/Silver those bytes aren't CaughtData and can be non-zero,
  polluting the model. Added an `isCrystal` param to `parseGen2PokemonStruct` (default `false` =
  GS-safe), gated the read, and threaded real Crystal-ness from `parseGen2Save` into the party, box
  (`parsePCBoxGen2`), and daycare paths. The standalone `.pk2` path safely defaults to no CaughtData.
- Added 5 tests in `dataIntegrity.test.ts` (CaughtData GS/Crystal/default gating — verified to fail on
  the old unconditional read; `syncCurrentBox`/invariant behavior).
- Result: **198 tests pass** (was 193), `tsc` clean, build OK. **All of §2 (2.1–2.11) is now complete.**

**Iteration 11 — User-reported bug: Japanese Gen 1 save fails to load:**
- **Symptom:** loading a 32 KB JP Blue save → "Unsupported save format. No compatible generation
  adapter found for this file size (32768 bytes)."
- **Root cause:** `validateGen1Checksum` hardcoded the summed range end to `0x3522` and the JP offset
  config had `CHECKSUM: 0x3523` — both **International** values. The real JP main-data checksum byte is
  at `0x3594` (covering `[PLAYER_NAME .. 0x3593]`), so every JP save failed checksum validation →
  `detectSave` returned `detected:false` → registry reported "no compatible adapter." The Gen 1 **writer**
  had the identical hardcoded `0x3522`, which would have corrupted JP saves on export.
- **Fix:** (1) `validateGen1Checksum` now derives the range end from the region's `CHECKSUM` offset
  (`[PLAYER_NAME .. CHECKSUM-1]`); (2) corrected JP `CHECKSUM` to `0x3594`; (3) writer main-checksum now
  uses `offsets.CHECKSUM - 1`; (4) hardened `Gen1Adapter.detectSave` to accept the save if **either**
  region's checksum validates (PKHeX-style resilience). This supersedes the earlier 2.8 note that
  assumed JP detection was already correct — it was not.
- Added 5 regression tests (JP vs INT checksum offsets differ; JP checksum validates; `detectSave`
  accepts a JP save; INT still works; writer range is region-derived).
- Result: **203 tests pass** (was 198), `tsc` clean, build OK.

**Iteration 12 — Milestone M3: first Gen 1/2 editing features:**
- **3.2** Status condition editor — DONE. `PokemonStatsPanel` now renders an editable status selector
  (OK/Sleep/Poison/Burn/Freeze/Paralysis) for **party** Pokémon only (box/stored mons have no status
  byte). It writes `mon.status`, which the writers encode via `encodeStatusByte` (the 2.1/2.2 fixes) —
  so the round-trip work is finally user-visible. `updateField` is threaded from the modal as an
  optional prop (read-only contexts still work).
- **3.3** Level ⇄ EXP coupling — VERIFIED DONE + TESTED. The modal already couples them
  (`handleLevelChange` → `getExpAtLevel`, `handleExpChange` → `getLevelFromExp`, per-species
  `getGrowthRate`), wired to both the level and EXP inputs. Added tests locking the round-trip,
  boundary behavior, canonical L100 totals (Fast 800k / MediumFast 1M / Slow 1.25M), and 1..100 clamp.
- Added 9 tests (level⇄EXP coupling; status codec round-trip for the editor's value set).
- Result: **208 tests pass** (was 203), `tsc` clean, build OK.

**Iteration 13 — Milestone M3: event-flag editing:**
- **3.1** Event-flag editing UI — DONE. Found the named-event toggle editor already functional
  (`EventFlagsManager` renders `adapter.getGameEvents()` — 23 Gen1 / 53 Gen2 events — with working
  toggle persistence through `handleEventFlagsUpdate` → `save.eventFlags` → writers). The genuinely
  missing piece from 3.1's checklist was the **raw flag index search/jump for power users**: added a
  free-text filter over named events (name/description/category/offset) and a raw flag-index inspector
  that reads/toggles any flag by its array index, with a "no matches" hint. The placeholder only shows
  when no adapter is present.
- **6.3** Gen 1 event-flag region — VERIFIED. `getEventFlags` reads 320 bytes (2560 flags) from
  `MISSABLE_OBJECTS` (0x2852); this matches pokered's `wEventFlags` (WRAM 0xD747 → save 0x2852, 0x140
  bytes), and all event offsets (29–227) fall in range. Mapping confirmed correct.
- Added 3 tests (event ids unique + offsets within the per-gen flag array bounds; Gen 2 version
  filtering sanity).
- Result: **211 tests pass** (was 208), `tsc` clean, build OK.

**Iteration 14 — Milestone M3: Pokédex caught/seen editing:**
- **3.7** Pokédex caught/seen flag editing — DONE. Per-entry toggling (hidden→seen→owned→hidden) already
  existed in `Pokedex.tsx`. Added the missing pieces: **bulk actions** ("Mark all caught", "Mark all
  seen", "Clear all") over the valid 1..maxDex range, **and** the real persistence gap — the **Gen 2
  writer never wrote dex flags back**, so GSC edits were silently lost on export. Added
  `writeGen2PokedexFlags` (inverse of `getPokedexFlagsGen2`, 32-byte/256-bit LSB-first region) and wired
  it into `writeGen2Save` for both caught and seen sets. (Gen 1 already persisted via
  `writePokedexFlags`.)
- Added 2 round-trip tests (write→read preserves caught species; region is cleared so stale bits don't
  leak).
- Result: **213 tests pass** (was 211), `tsc` clean, build OK.

**Iteration 15 — Milestone M3: Unown form display/edit:**
- **3.8** Unown form display/edit — DONE. The derived letter was already *displayed* (form sprites in
  `PartyList`/`PokemonInfoPanel` via `getUnownFormLetter`). Added the missing **form selection**: a new
  `setUnownFormDVs(letter, iv)` inverse helper in `sprites.ts` computes the DVs that produce a target
  letter, changing as few DVs as possible and **preserving every non-form bit** (`~6`) of each DV so
  unrelated stats/shininess aren't disturbed. Wired an A–Z form picker into `PokemonInfoPanel` (shown
  only for species 201) that calls `updateField('iv', …)`. Matches PKHeX's "form adjusts DVs" behavior.
- Added 4 tests (all 26 letters reachable + round-trip via `getUnownFormLetter`; non-form bits
  preserved; idempotent; invalid-letter no-op).
- Result: **217 tests pass** (was 213), `tsc` clean, build OK.

**Iteration 16 — Milestone M3: trainer & misc save fields audit (3.9):**
- **3.9** Trainer & misc save fields — DONE (audit + one fix). Audited every listed field for the
  parse→edit→write chain: **name, TID, money, coins, badges (Johto+Kanto), play time, options,
  gender (Crystal), rival name** are all editable in `TrainerCard` with working write paths.
  **Map/position, RTC, phone contacts** are parsed + written (round-trip intact) but intentionally
  display-only in the read-only Events overview. Verified the **Gen 2 badge round-trip** works via the
  packed convention (`trainer.badges` low byte = Johto, high byte = Kanto; `kantoBadges` offset =
  `johtoBadges + 1`, so the writer's 2-byte split persists both — the separate `gen2SaveExt.kantoBadges`
  is a redundant mirror, not a data-loss path).
  The one genuine gap was **mom savings**: parsed + written (BCD) but display-only. Added a generic
  `handleSaveExtUpdate` (prototype-preserving genExtension updater) in `EditorDashboard`, threaded it to
  `EventsTab`, and made mom savings an editable, clamped (0–999,999) input. This also lays the plumbing
  for future Crystal-field editors (3.6).
- Added 2 BCD round-trip tests (set→parse recovers value; correct BCD digit encoding).
- Result: **219 tests pass** (was 217), `tsc` clean, build OK. **All of §3 (3.1–3.9) is now complete.**

**Iteration 17 — Unown sprite bug fix + Crystal-specific editors (3.6):**
- **User bug:** Unown form 'A' sprite 404'd because the URL used `201-a.png`, but the PokeAPI repo
  names form A as the **default** `201.png` (no suffix); only B–Z use `201-{form}`. Fixed
  `getUnownFormSpriteUrl` in `lib/sprites.ts` (form 'a' → no suffix, both master and game-specific
  modes), and refactored the duplicate `UnownFormSprite` builder in `EventsTab` to reuse the shared
  `getPokemonSpriteUrl` so there's a single source of truth. Locked by 4 regression tests (verified to
  fail on the old code).
- **3.6** Crystal-specific editors — DONE. Blue Card / Mystery Gift / GS Ball were parsed + written but
  display-only. Using the `handleSaveExtUpdate` plumbing from Iteration 16, made them editable in
  `EventsTab` (Crystal saves only): Blue Card **points** input (0–9999), Mystery Gift **status toggle**
  (locked/unlocked), GS Ball **event toggle** (active/inactive). All persist through the existing
  writer paths. (Per-mon CaughtData + Move Tutor flag editing remain as future niceties; CaughtData is
  correctly Crystal-gated per 2.11.)
- Added 4 Unown-sprite regression tests.
- Result: **223 tests pass** (was 219), `tsc` clean, build OK.

**Iteration 18 — Milestone M3: daycare editing (3.5); 3.4 deferred:**
- **3.5** Gen 2 daycare editing — DONE. Verified the existing parse↔`writeGen2Daycare` round-trip
  (parents + breeding metadata) with new tests — it was wired but untested. Added a **"Withdraw"**
  action per parent in the daycare UI (via `handleSaveExtUpdate`), and fixed a real gap: the writer
  previously **skipped** null parents, leaving stale bytes, so a withdrawn Pokémon wouldn't actually
  leave the save. Now `writeGen2Daycare` **zeroes the body species byte** when a slot is null, so
  withdraw persists. (Full deposit/edit-parent flow left as a future nicety.)
- Added 3 tests (parent round-trip with nickname/OT/breeding intact; empty daycare stays empty; withdraw
  clears the slot on next write).
- **3.4 (Gen 2 mailbox) — DEFERRED, documented why.** Mail has a model + read-only UI but **no offsets,
  no parser, and no writer** anywhere in the codebase. Implementing it means inventing GSC mail offsets
  + per-region struct layout that I cannot validate without a real save fixture (see 5.4). Shipping
  speculative offsets that write to the save risks **corrupting users' saves on export** — strictly
  worse than the current honest "future update" placeholder. Deferring until a real fixture exists.
- Result: **226 tests pass** (was 223), `tsc` clean, build OK.

**Iteration 19 — Milestone M4: generalize capability flags (1.4):**
- **1.4** Extended feature-capability flags — DONE. Added the still-missing named capabilities to
  `IGenerationAdapter` so future gens + UI branch on data, not gen number: `hasContests`, `hasRibbons`,
  `hasBallType`, `hasMetData`, `hasMarkings`, `hasFatefulEncounter`, `hasFriendshipSystem`, `hasPokerus`,
  `hasFormSystem`, `hasNationalDexFlag`, `maxMoney`, `maxLevel`, `tmHmPocketLayout`. Populated correct
  Gen 1 (all false except money/level) and Gen 2 (friendship/pokerus/forms/markings true) values on both
  adapters, with doc comments recording Gen 3+ values for future implementers.
- Kept the established **individual-flag pattern** (the UI already branches on named flags like
  `hasMailbox`) rather than introducing a parallel nested `capabilities` object — that would duplicate
  30+ existing flags for no functional gain. The codebase had already largely eliminated
  `generation === N` branches; the new flags are forward-looking, so I did **not** force artificial
  usage in Gen 1/2 UI that doesn't expose those features (e.g. ribbons/contests/met-data have no UI yet).
- Added 4 tests (documented Gen1/Gen2 values; all flags defined with correct primitive types; monotonic
  growth Gen1→Gen2).
- Result: **230 tests pass** (was 226), `tsc` clean, build OK.

**Iteration 20 — Milestone M4: OCP invariant + "add a generation" docs (1.2/5.6/1.1/8.2):**
- **1.2 / 5.6** Scalability invariant test — DONE. New `tests/scalabilityInvariant.test.ts` defines a
  throwaway "Gen 99" dummy adapter and asserts the full lifecycle works through **public APIs only**:
  registration (`registry.register`), magic-size detection, the detect→parse cascade, byte-for-byte
  write round-trip, inherited sprite/theme/codec surface, and panel-extension injection (with isolation
  from other gens). This converts the "zero core edits per generation" claim into an enforced test.
  (The dummy extends `Gen1Adapter` to inherit the ~90-member surface, overriding only what makes it a
  distinct fake gen.)
- **1.1 / 8.2** `docs/ADDING_A_GENERATION.md` — DONE. Code-verified checklist of every touch-point
  (genN folder + modules, data tables, the single `registerLazy` line, canonical extension classes +
  type guards, theme/sprite data, Gen3+ codec/entity-encryption seam), with an explicit OCP acceptance
  section pointing at the invariant test and the 5.4 fixture caveat.
- Result: **236 tests pass** (was 230), `tsc` clean, build OK.

**Iteration 21 — Milestone M4: data-driven theme/version metadata (1.6):**
- **1.6** Theme + version metadata data-driven per adapter — DONE. Moved the hardcoded Gen1/2 cartridge
  list out of `data/games.ts` into per-generation data files (`lib/generations/gen1/data/themes.ts`
  `GEN1_GAMES`, `gen2/data/themes.ts` `GEN2_GAMES`). `data/games.ts` now **aggregates** those
  (`[...GEN1_GAMES, ...GEN2_GAMES]`) instead of holding a literal. Each adapter exposes
  `versionThemes: GameCartridge[]`, and the registry gained `getAllVersionThemes()` which aggregates
  the themes of all *loaded* adapters (gen-sorted) — so a Gen 3 adapter's themes appear automatically
  once registered, with no central-literal edit. No circular imports (themes files import only the
  `GameCartridge` type). `ThemeContext` keeps working via the unchanged `pokemonGames` export.
- Added 4 tests (games.ts equals the aggregate; adapter exposes its themes; registry aggregates only
  loaded adapters, gen-sorted; a newly registered gen contributes themes automatically).
- Result: **240 tests pass** (was 236), `tsc` clean, build OK.

**Iteration 22 — Milestone M4: codec ownership (1.7):**
- **1.7** Route the adapter-owned codec through real use — DONE. `setCodecRegion` existed on both
  adapters but was **never called**, so `adapter.codec` was permanently stuck at `'international'`.
  That was not just dead code: UI components (`PokemonEditorModal`, `TrainerCard`, `PokemonInfoPanel`,
  `PCStorage`) use `adapter.codec.sanitize()/isValidChar()/otNameMaxLength()` for input handling, so
  Japanese/Korean saves were silently getting the international codec (the components papered over it
  with hardcoded `isJapanese ? 5 : …` fallbacks). Fixed by calling
  `this.setCodecRegion(this.detectRegion(parsed))` at the end of each adapter's `parseSave`, making
  `adapter.codec` the single region-correct source of truth for UI text handling. The byte-level hot
  path keeps its per-offset region codecs (`codecForOffsets`/`decodeText`), which were already correct;
  `setCodecRegion` is no longer dead.
- Added 3 tests (default international; flips to Japanese after parsing a JP save — verified to FAIL
  without the wiring; stays international for INT saves).
- Result: **243 tests pass** (was 240), `tsc` clean, build OK.

**Iteration 23 — Milestone M4: standalone format crypto/geometry contract (1.3, P0):**
- **1.3** `IStandalonePokemonFormat` crypto hooks + struct geometry — DONE. Extended the interface with
  `boxStructSize`/`partyStructSize` (so generic PC/standalone code never hardcodes 33/44/32/48),
  `checksumOffsets` (empty Gen1/2; populated Gen3+), and entity-crypto hooks
  `decryptBlock(buf)`/`encryptBlock(buf)` (identity for Gen1/2). Implemented on both
  `Gen1StandaloneFormat` (33/44) and `Gen2StandaloneFormat` (32/48), and **wired the hooks into the
  live `.pk2` create/parse path** (decrypt the entity region before reading, encrypt after writing) so
  the contract isn't decorative (the 1.7 lesson).
- Proved the seam is rich enough for Gen 3: a test subclass that XORs the entity bytes round-trips
  through the *unchanged* create/parse path, and the on-disk struct bytes verifiably differ from
  plaintext. So a Gen 3 `.pk3` (PID block-shuffle + XOR) can be added without touching
  `PCStorage.tsx` / `PokemonEditorModal.tsx`.
- Added 5 tests (struct geometry; no Gen1/2 checksum offsets; identity crypto; `.pk2` round-trip with
  hooks wired; Gen3-style XOR crypto seam with on-disk-bytes-differ assertion).
- Result: **248 tests pass** (was 243), `tsc` clean, build OK. **All P0 items are now complete.**

**Iteration 24 — Milestone M4: first-class checksum step (8.5.2):**
- **8.5.2** `recomputeChecksums` as a named adapter contract — DONE. Added
  `recomputeChecksums(buffer): Uint8Array` to `IGenerationBinaryOps`, symmetric with the existing
  `validateSaveDetailed` (PKHeX's `Write → … → SetChecksums` seam). Extracted each writer's inline
  checksum logic into exported, reusable functions — `recomputeGen1Checksums` (per-box + bank + main)
  and `recomputeGen2Checksums` (per-box + main + version/region-specific backup mirroring) — and made
  `writeSave` call them as its final step, so there is now **one** checksum source of truth per gen
  rather than duplicated inline code. Each adapter's `recomputeChecksums` derives region/version from
  the buffer and calls the same function, so it doubles as a repair tool for hand-edited saves.
- Refactor safety net: the round-trip tests re-detect after write (Gen1 `detectSave` validates the
  checksum), so a checksum regression would fail loudly — all green confirms the extraction preserved
  behavior.
- Added 4 tests (fresh write validates; corrupt→recompute→repairs for Gen1 & Gen2, Gen1 idempotence).
- Result: **252 tests pass** (was 248), `tsc` clean, build OK.

**Iteration 25 — Milestone M5 test/data hardening (5.5, 6.4):**
- **5.5** Cross-gen transfer tests — DONE. New `tests/crossGenTransfer.test.ts` (24 tests) drives
  `crossGenConverter` through the real Gen1/Gen2 adapters: Gen1→Gen2 (Magnemite #81 gains Steel,
  friendship→70, held item "None", `Gen2Extension` swap, stable dexId, raw-byte clear) and Gen2→Gen1
  (reject dex>151, strip moves >165, drop held item, SpAtk→unified Special, strip
  friendship/gender/pokerus, `Gen1Extension` + catch-rate), plus same-gen no-op and the primitives
  (`convertSpeciesId`, `validateMovesForTargetGen` incl. all-stripped→Pound, `canTransferToGen`,
  `getTransferImpactDescription`). All warning/error assertions from the TODO are covered.
- **6.4** Pokédex flavor-text / location completeness — DONE. Audited both Gen2 tables: 1..251 fully
  covered (753 values each, no gaps/empties/placeholders), so no data fix was needed — the risk is now
  *locked* by `tests/pokedexCompleteness.test.ts` (6 tests) asserting, via the adapter accessors, a
  meaningful Gold/Silver/Crystal string for every species ≤ `nationalDexMax`, plus version-fallback and
  out-of-range behavior.
- Result: **282 tests pass** (was 252), `tsc` clean, build OK.

**Iteration 26 — Milestone M4: entity block-shuffle seam (8.5.3):**
- **8.5.3** Make the Gen 3+ entity-encryption seam real (block-shuffle, not just `hasEncryption`) — DONE.
  Added `lib/core/entityFormat.ts` with the two generation-agnostic primitives a future Gen 3-7
  standalone format needs inside `decryptBlock`/`encryptBlock`: (a) a PID-keyed **block shuffle**
  (`BLOCK_ORDERS` = the 24 deterministic permutations, `getBlockOrderIndex(pid, gen)` for Gen3 `pid%24`
  vs Gen4/5 `((pid>>13)&31)%24`, and `shuffleBlocks`/`unshuffleBlocks` proven invertible for all 24
  orders and both 12- and 32-byte block geometries), and (b) `getEntityFormatByLength()` (PKHeX's
  `GetFormatInternal` counterpart) that maps loose `.pkX` sizes to a generation/context and reports the
  **136-byte Gen4/5 stored** case as ambiguous (needs a checksum probe). Documented the seam on
  `IStandalonePokemonFormat`'s crypto hooks. **No Gen 3 implementation** — explicitly noted that the
  order *indexing* and XOR/LCG stream must be validated byte-for-byte against PKHeX + a real `.pk3`
  fixture before shipping Gen 3; what's guaranteed now is the invertible round-trip and the size
  waterfall (both fixture-independent).
- Added `tests/entityFormat.test.ts` (10 tests): 24 unique permutations; invertible shuffle for all
  orders (header preserved, non-identity actually moves bytes); Gen3 vs Gen4/5 PID indexing; index
  always valid; length→format incl. the ambiguous 136 case and null for unknown sizes.
- Result: **292 tests pass** (was 282), `tsc` clean, build OK.

**Iteration 27 — Milestone M4: detection waterfall + wrapper handlers (8.5.1):**
- **8.5.1** Detection waterfall + pre-format wrapper handlers — DONE. Added `lib/core/saveWrappers.ts`
  formalizing PKHeX's "strip-then-retry" step in one place: a `SaveWrapperHandler` contract +
  `stripKnownWrappers()`, with a `desmume-dsv` handler (detects the `|-DESMUME SAVE-|` magic / `.dsv`
  extension) and a generic `trailing-footer` handler (strips a small footer back to a known GB SRAM
  size). Refactored `AdapterRegistry.detectAndParse` into Phase 1 (existing direct detection, now in a
  `tryDirectDetect` helper — **unchanged** path, Gen 1/2 `+16` still accepted inline by the adapters)
  + Phase 2 (NEW: on direct-detection failure, strip wrappers and retry). Purely additive: a clean
  save or `+16` file behaves identically; only previously-unrecognized wrappers now recover.
- Verified the seam genuinely adds capability: a `.dsv`-wrapped Gen 1 save (32792 bytes) fails direct
  `detectSave` but succeeds via `detectAndParse`'s fallback.
- Added `tests/saveWrappers.test.ts` (9 tests): `.dsv` magic strip, generic footer strip, `+16` left to
  the adapters, no-wrapper → `[]`, and end-to-end through a real `AdapterRegistry`+`Gen1Adapter`
  (direct hit, `.dsv` recovery, footer recovery, and the unchanged garbage-buffer failure).
- Result: **301 tests pass** (was 292), `tsc` clean, build OK.

**Iteration 28 — Milestone M5: Gen 2 TM/HM table audit (6.1):**
- **6.1** Audit Gen 2 TM/HM table — DONE. Verified all **57** TM/HM→move-ID mappings (TM01-TM50 +
  HM01-HM07) in `GEN2_TM_HM_MOVES` against the canonical GSC TM/HM list — **every ID is correct** (the
  iteration-8 2.6 fix holds). The audit surfaced one real data inaccuracy in the move *name* table:
  `GEN2_MOVES_LIST[197]` was the non-canonical `"Detection"` (surfaced via TM43), where move #197 is
  officially **"Detect"** (its PP=5 and Fighting type in `moveData.ts` were already correct). Fixed the
  name in `constants.ts`, updated the two `moveData.ts` comments, corrected the existing TM43 test
  expectation, and added an explicit lock asserting `GEN2_MOVES_LIST[197] === 'Detect'` and the TM43
  slot still maps to id 197.
- Result: **302 tests pass** (was 301), `tsc` clean, build OK.

**Iteration 29 — Item sprite URL fix + React types alignment (7.2):**
- **USER BUG: wrong item sprite URLs.** `Inventory.tsx` built slugs with
  `name.toLowerCase().replace(/ /g,'-')…` and never stripped accents, so "Poké Ball" became
  `poké-ball` → the browser percent-encoded it to `pok%C3%A9-ball.png` (404). Centralized the logic in
  `lib/sprites.ts`: new `itemNameToSlug()` (NFD accent strip é→e, camelCase split `TwistedSpoon`→
  `twisted-spoon`, drop `'`/`.`, spaces→hyphens) + `ITEM_SLUG_OVERRIDES` for abbreviations/spelling
  PokeAPI differs on (apricorn colors Blk/Blu/Grn/Pnk/Wht/Ylw, `Elixer`→elixir, `Thunderstone`→
  thunder-stone, `Parlyz Heal`→paralyze-heal, `BrightPowder`/`SilverPowder`, `X Defend`→x-defense,
  `X Special`→x-sp-atk, `Itemfinder`→dowsing-machine, `Exp. All`→exp-share, lineage berries). Repurposed
  `getItemSpriteUrl` to take the item *name*; `Inventory.tsx` now calls it. **Verified every item name
  against the live PokeAPI sprite repo**: 0 accent-leftovers, all spelling overrides resolve; the only
  non-resolving names are non-bag entries (floor labels `1F`/`B2F`, badges, key items) which fall back
  to the pokeball placeholder as before.
- **7.2** Pin/align React types — DONE. `package.json` ran React 18.3.1 but pulled `@types/react@^19`;
  aligned to `@types/react@^18.3.12` / `@types/react-dom@^18.3.1` (installed 18.3.30 / 18.3.7).
  Typecheck clean with the matched types — no React-19-type drift.
- Added 5 `itemNameToSlug` tests (accent strip, camelCase, apostrophe/period, overrides, clean ASCII URL).
- Result: **307 tests pass** (was 302), `tsc` clean, build OK.

**Iteration 30 — Milestone M4: generic inventory layout (1.8):**
- **1.8** Generalize PC box geometry & inventory pockets — DONE (pockets). Box geometry was already
  adapter-driven (`boxCount`/`boxSlotCount`); the gap was pocket *identity* being Gen2-shaped in the UI.
  Added a generic `InventoryPocket` type (`id`, `label`, `source` = the `CanonicalSave` array it binds
  to, `capacity`, `stackSize`, `quantityless`) and `inventoryLayout: InventoryPocket[]` on the adapter.
  Gen 1 declares `[Items(20), PC(50)]`; Gen 2 declares `[Items(20), KeyItems(26, quantityless),
  Balls(12), TM/HM(57), PC(50)]` matching the GSC pouches. `Inventory.tsx` now sources its bag/PC tab
  labels + capacities from `adapter.inventoryLayout` instead of hardcoded `'BAG'`/`20`/`'PC'`/`50`, so a
  Gen 3 RSE adapter's pockets drop in as data.
- **Honest scope:** the contract + adapter data are complete and the UI sources the items/PC pockets
  from the layout (Gen 1 fully reproduced from the table). Surfacing Gen 2's KeyItems/Balls/TM-HM (and
  Gen 3's extra pockets) as additional *editable* tabs is a follow-up — those arrays already exist on
  `CanonicalSave` and in the layout, but need plumbing through the `Inventory` props/`onUpdate`
  signature (and `EditorDashboard`), which is the risky part deferred here.
- Added 3 tests (Gen 1 2-pocket layout; Gen 2 5-pocket layout with GSC capacities + quantityless key
  items; every pocket source maps to a real field with sane stack sizes).
- Result: **310 tests pass** (was 307), `tsc` clean, build OK.

**Iteration 31 — save-format constants doc (8.3) + re-applied 5.1/8.1:**
- **8.3** Document save-format constants — DONE. Added `docs/SAVE_FORMAT_CONSTANTS.md`: a per-gen
  offset/struct/checksum reference mirrored from the real `genN/data/offsets.ts` tables (Gen 1 R/B/Y and
  Gen 2 G/S/C, with the Crystal-INT divergences and JPN/KOR notes), cross-referenced to PKHeX
  `SAV1`/`SAV2`/`PK1`/`PK2` for traceability, plus a "how the code uses these" section tying it to
  detect→parse→write→recomputeChecksums and the wrapper waterfall. Every cited offset spot-checked
  against the code.
- Re-applied **5.1** (full-field round-trip + Gen 1 box/active-box-drift tests) and **8.1** (README
  prop-drilling correction + Testing/Gen3 sections; ROADMAP status banner + lazy-registration example),
  which were authored earlier but not present in this working copy — keeps the snapshot cumulative.
- Result: **315 tests pass**, `tsc` clean, build OK.

**Iteration 32 — Milestone M4: scalability lint guard (7.4):**
- **7.4** Ban ad-hoc `generation === N` branches and `as any` — DONE (as a guard test). Since ESLint
  isn't set up yet (7.1), implemented the enforcement as `tests/scalabilityLint.test.ts`, matching the
  project's existing invariant-test philosophy: it scans `lib/`/`components/`/`context/` (comments +
  strings stripped) and fails on any `as any` cast or `generation <op> <number>` comparison, with a
  justified allowlist for the two files that legitimately key on gen number — `canonicalModel.ts` (the
  `isGenNExtension` type-guard definitions) and `core/entityFormat.ts` (the PID→block-order seed formula,
  an intrinsic per-gen crypto difference). Can be re-expressed as an ESLint `no-restricted-syntax` rule
  once 7.1 lands.
- Audit found the codebase already clean except **one** real violation: `Gen2Adapter.ts` used an ad-hoc
  `ext.generation !== 2` + `as Gen2Extension` cast; replaced both with the `isGen2Extension` type guard
  (the guard narrows the type, so the cast dropped out). 0 `as any` casts remain.
- Verified the guard genuinely catches violations (injected an `as any` → fails; the generation rule was
  proven by catching `entityFormat`'s `generation <= 3` before allowlisting).
- Added 4 guard tests. Result: **319 tests pass** (was 315), `tsc` clean, build OK.

**Iteration 33 — Milestone M5: contribution guide + issue/PR templates (8.4):**
- **8.4** Contribution guide + bug-report template — DONE. Added `CONTRIBUTING.md` (dev workflow, the
  enforced scalability rules — no `as any`/`generation === N`, pointer to `docs/ADDING_A_GENERATION.md`,
  PR expectations) with a prominent **save-file provenance & privacy** section: saves contain PII
  (player name, TID, OT/nicknames), so contributors must not attach real saves to public issues —
  describe provenance (game/version/region/how-produced) and prefer a synthetic repro using the test
  helpers; redact + share privately only if essential; no ROMs/copyrighted data. Added
  `.github/ISSUE_TEMPLATE/bug_report.md` (asks for provenance, not the save; privacy checklist),
  `feature_request.md`, `config.yml` (disables blank issues + privacy contact link), and
  `pull_request_template.md` (test/typecheck/build + no-`as any`/no-real-saves checklist). Linked
  CONTRIBUTING from the README. Docs/config only — **319 tests pass**, `tsc` clean, build OK.

**Iteration 33 — Milestone M4: per-gen bundle-size budget (7.3):**
- **7.3** Bundle-size budget per gen — DONE. Added `scripts/check-bundle-size.mjs`: reads the built
  `dist/assets/*.js` chunks, computes raw + gzip size, and fails (exit 1) if any chunk exceeds its
  budget. Each `GenNAdapter` chunk shares a per-gen budget (100 KB gz / 400 KB raw) so a future Gen 3
  adapter's data growth is caught before it regresses load time; named vendor/index chunks have their
  own budgets. Robust chunk naming via prefix-match (Vite hashes can contain hyphens, e.g.
  `Gen2Adapter-B-H6ibCp.js`, and `vendor-react` must not be swallowed by `vendor`). Wired `npm run
  check:bundle` and added a "Check bundle size budget" step after Build in `ci.yml`.
- Current: Gen2Adapter 64.4 KB gz / 284 KB raw, Gen1Adapter 28.1 / 84 — comfortably within budget.
  Verified the check fails when over budget (temporarily lowered the per-gen budget → exit 1) and passes
  when restored.
- Result: **319 tests pass** (unchanged — script-based check, not a vitest test), `tsc` clean, build +
  `check:bundle` green.

**Iteration 34 — Milestone M4: legality boundary + validation-layer naming (8.5.4 + 8.5.6):**
- **8.5.4** Legality boundary + design note — DONE (boundary only, no engine). Added `lib/legality/`:
  `types.ts` mirrors PKHeX's result objects (`LegalitySeverity` Valid/Fishy/Invalid, `CheckResult` with
  category + comment, `LegalityAnalysis`, `isLegal()`); `index.ts` exposes `analyzeLegality(entity)` as
  an explicit `analyzed:false` placeholder (must not be shown as a guarantee); `README.md` is the
  one-page design note (the "find a consistent encounter" thesis, why a boundary-not-engine now, and a
  sketch of how per-gen `EncounterProvider` + `Verifier`s plug in without `generation === N` branching).
- **8.5.6** Save-vs-entity validation naming — DONE. The design note formalizes three distinct layers —
  **save integrity** (`validateSaveDetailed`/`SaveValidationResult`, implemented), **entity legality**
  (`lib/legality/`, boundary only), and **bulk analysis** (cross-entity duplicate/clone detection,
  backlogged with a concrete `analyzeBulk()` sketch) — so the namings stay separate as PKHeX keeps
  `ChecksumsValid` vs per-`PKM` legality vs `BulkAnalysis`.
- Added 3 tests locking the boundary contract (severity values; placeholder is non-failing + `analyzed:false`;
  `isLegal` false iff any Invalid, Fishy is only a warning). New code passes the `scalabilityLint` guard.
- Result: **322 tests pass** (was 319), `tsc` clean, build OK.

**Iteration 35 — USER request: egg visual redesign + "Is Egg" toggle + `hasEggs` flag:**
- **Egg visual was bad** — `PokemonSprite.tsx` overlaid a tiny lucide `Egg` badge on top of the still-
  visible species sprite (looked like a sticker). Redesigned: when `isEgg`, render a clean, dependency-
  free inline-SVG egg (classic silhouette + Gen 2 spots + highlight) **instead of** the species sprite
  (an egg hides its species in-game). Removed the now-unused `Egg` import.
- **"Is Egg" toggle** — added a checkbox to the Pokémon summary (`PokemonInfoPanel`) that sets
  `isEgg` via `updateField`. Gated on the new capability flag so it only appears where eggs exist.
- **`hasEggs` capability flag** — added to `IGenerationMetadata`; Gen 1 = false (no breeding/eggs),
  Gen 2 = true. The toggle uses `adapter.hasEggs` (NOT `generation === N`), so it passes the
  `scalabilityLint` guard and Gen 1 correctly never shows it.
- Verified the toggle's data path: Gen 2 writer persists `isEgg` (species-list header `0xFD`) and the
  parser reads it back. Added 3 tests (flag values; isEgg=true and =false both survive write→re-parse).
- Result: **325 tests pass** (was 322), `tsc` clean, build OK.

---

## Legend

| Tag | Meaning |
|---|---|
| `[BUG]` | Confirmed or strongly-suspected incorrect behavior |
| `[GEN3+ PREP]` | Scalability work; enables future gens without shipping them now |
| `[FEAT]` | New user-facing capability for Gen 1/2 |
| `[CODE]` | Internal code quality / refactor (no behavior change intended) |
| `[STRUCT]` | Project / directory / module structure |
| `[DATA]` | Data-table accuracy or completeness |
| `[TEST]` | Test coverage |
| `[DX]` | Developer experience / tooling / CI / docs |

Priority: **P0** = correctness/data-loss, do first · **P1** = important · **P2** = nice-to-have.

---

## 0. Current Architecture — what already exists (so we don't redo it)

So nothing is duplicated, here is what is **already done** and should be *built on*, not rebuilt:

- **Canonical Data Model** (`lib/canonicalModel.ts`): `CanonicalPokemon` / `CanonicalSave` with a
  `genExtension` slot; `Gen1Extension`, `Gen2Extension`, `Gen3Extension` (Gen3 is a stub),
  `Gen1SaveExtension`, `Gen2SaveExtension`; type guards `isGenNExtension` / `isGenNSaveExtension`.
- **Adapter pattern** (`lib/interfaces.ts`): `IGenerationAdapter` segregated into
  `IGenerationMetadata` / `IGenerationBinaryOps` / `IGenerationStatsOps` / `IGenerationDataAccess` /
  `IGenerationTextCodec`, plus `ITextCodec` and `IStandalonePokemonFormat`.
- **Registries**: `AdapterRegistry` (eager + **lazy** registration via `LazyFactory` + dynamic
  `import()`, Vite code-splits per gen), `ExtensionRegistry` (panel UI injection).
- **Adapter-driven metadata**: `nationalDexMax`, `hasSplitSpecial`, `hasGender`, `ivMax`, `evMax`,
  `bagItemCapacity`, `hasMailbox`, `supportsBoxNames`, etc. — the ~27 hardcoded `generation === N`
  UI branches were already removed.
- **Open types**: `Generation = number`, `GameVersion = string` (no closed unions to break).
- **Panel extension system**: `PokemonInfoPanel` / `PokemonStatsPanel` / `PokemonMovesPanel`
  query `extensionRegistry.getExtensions(panelId, gen)`; Gen 2 registers HeldItem, Shiny, Gender,
  Sp.Atk/Sp.Def, CaughtData, Friendship/Egg sections (`lib/generations/gen2/extensions.tsx`).
- **Centralized sprites** (`lib/sprites.ts` + `SpriteContext`): data-driven `VERSION_SPRITE_MAP`,
  three modes (Game-Specific / Master / Artwork), shiny + integer-scaling helpers.
- **Cross-gen transfer** (`lib/utils/crossGenConverter.ts`): dexId-keyed species/move/item/type remap.

---

## 1. Scalability & Architecture (toward Gen 3–9) — `[GEN3+ PREP]`

The single most important deliverable: define **exactly** the surface that a new generation
touches, shrink that surface to "add files + register + add data rows," and verify it with a
**dummy adapter** so the promise is testable instead of aspirational.

### 1.1 `[STRUCT][P1]` ✅ DONE — Define and document the canonical "add a generation" checklist
*(Delivered as `docs/ADDING_A_GENERATION.md` — see 8.2. Code-verified touch-point list with an OCP acceptance section that references the invariant test.)*

Create `docs/ADDING_A_GENERATION.md` enumerating every file a new gen touches today. Based on the
current code, adding Gen N requires:
1. `lib/generations/genN/` — `GenNAdapter.ts`, `parser.ts`, `writer.ts`, `statCalculator.ts`,
   `StandaloneFormat.ts`, `data/*` (offsets, baseStats, names, moves, items, types, pokedexEntries,
   locations, events, eventDistributions), and `extensions.tsx`.
2. Register in `lib/core/AdapterRegistry.ts` via `registry.registerLazy(N, …)`.
3. Add a `GenNExtension` / `GenNSaveExtension` class + type guard in `lib/canonicalModel.ts`.
4. Add theme entries in `data/games.ts` (palette per version).
5. Add sprite folder rows in `lib/sprites.ts` `VERSION_SPRITE_MAP`.
6. Possibly a new `ITextCodec` implementation (Gen 3 single-byte/0xFF; Gen 4/5 16-bit; Gen 6+ UTF-16).
> **Acceptance:** the doc lists each touch-point with the line/section; a reviewer can follow it
> end-to-end. Items 4 & 5 are *data additions* (OCP-compliant) — see 1.6 to make them truly data-only.

### 1.2 `[GEN3+ PREP][P1]` ✅ DONE — Add a throwaway "GenTest"/dummy adapter behind a flag to prove OCP
*(`tests/scalabilityInvariant.test.ts`: a "Gen 99" dummy adapter registers via public APIs and asserts detect/parse/write round-trip, sprite/theme/codec surface, and panel-extension injection — all with no edits under `lib/core`, `components/`, or `context/`. Paired with 5.6.)*

Add a minimal fake adapter (not a real game) that registers, detects a magic-size buffer, and
round-trips a trivial save — used **only in tests**. This converts the "zero core edits per gen"
claim into an enforced invariant.
> **Acceptance:** a test registers the dummy adapter and asserts that detection, parsing, writing,
> sprite resolution, theme fallback, and panel extension injection all work **without editing any
> file under `lib/core`, `components/`, or `context/`**. If something *must* be edited, that file
> is the real scalability blocker — fix it, then delete the dummy.

### 1.3 `[GEN3+ PREP][P0]` ✅ DONE (encryption hooks + geometry) — Standalone format contract
Extended `IStandalonePokemonFormat` with `decryptBlock(buf)`/`encryptBlock(buf)` entity-crypto hooks
(identity for Gen1/2), `boxStructSize`/`partyStructSize` (33/44 Gen1, 32/48 Gen2 — no more hardcoded
sizes in generic code), and `checksumOffsets` (empty Gen1/2). Wired the hooks into the live `.pk2`
create/parse path so they're exercised, not decorative. A test XOR subclass round-trips through the
*unchanged* path with on-disk bytes verifiably encrypted, proving a Gen 3 `.pk3` could be added with no
changes to `PCStorage.tsx`/`PokemonEditorModal.tsx`. Tested.
*Remaining sub-goal (the "only standalone path" consolidation) is tracked separately; the encryption-hook
+ geometry contract this P0 centered on is complete.*

### 1.4 `[GEN3+ PREP][P1]` ✅ DONE — Generalize feature-capability flags
Added the still-missing named capabilities to `IGenerationAdapter`: `hasContests`, `hasRibbons`,
`hasBallType`, `hasMetData`, `hasMarkings`, `hasFatefulEncounter`, `hasFriendshipSystem`, `hasPokerus`,
`hasFormSystem`, `hasNationalDexFlag`, `maxMoney`, `maxLevel`, `tmHmPocketLayout`. Both adapters set
correct Gen1/Gen2 values; doc comments record Gen3+ values. Kept the existing individual-flag pattern
(the UI already branches on named flags) rather than a parallel nested object that would duplicate 30+
flags for no gain. Tested (documented values + type/monotonicity checks). *Note: the ESLint rule
banning new `generation === N` introductions is tracked under 7.4.*

### 1.5 `[GEN3+ PREP][P1]` Resolve the dual "props + SaveContext" data flow
`EditorDashboard.tsx` (525 lines) both wraps children in `SaveProvider` **and** drills the same
props down. New gens inherit this double maintenance.
- Pick **context as the source of truth**; convert tab/panel components to consume `useSaveContext()`
  and delete redundant prop chains.
- Keep `EditorDashboard` a thin shell that renders tabs + overlays (the ROADMAP's stated goal).
> **Acceptance:** `EditorDashboard.tsx` shrinks substantially; adding a tab does not require threading
> 10+ props through the shell.

### 1.6 `[GEN3+ PREP][P2]` ✅ DONE (themes; sprite-map noted) — Make theme + version metadata data-driven per adapter
Moved the hardcoded Gen1/2 cartridge list out of `data/games.ts` into per-gen data files
(`gen1/data/themes.ts` `GEN1_GAMES`, `gen2/data/themes.ts` `GEN2_GAMES`). `data/games.ts` now
aggregates them; each adapter exposes `versionThemes: GameCartridge[]`; and `registry.getAllVersionThemes()`
aggregates the themes of all *loaded* adapters (gen-sorted), so a Gen 3 adapter's themes appear
automatically once registered. Tested. *Remaining sub-item:* `lib/sprites.ts` `VERSION_SPRITE_MAP` is
still a central map — the same adapter-owned-data treatment could be applied there (left as a follow-up;
it's already data, just not yet adapter-scoped).

### 1.7 `[GEN3+ PREP][P2]` ✅ DONE — Codec ownership: actually route through `adapter.codec`
`setCodecRegion` was never called, so `adapter.codec` was stuck at `'international'` — a latent bug,
since UI components use `adapter.codec.sanitize()/isValidChar()/otNameMaxLength()` and were getting the
wrong codec for JPN/KOR saves. Fixed by calling `this.setCodecRegion(this.detectRegion(parsed))` at the
end of each adapter's `parseSave`, so `adapter.codec` is the single region-correct source of truth for
UI text handling. The byte-level hot path keeps its already-correct per-offset region codecs
(`codecForOffsets`/`decodeText`). `setCodecRegion` is no longer dead. Tested (verified to fail without
the wiring).

### 1.8 `[GEN3+ PREP][P2]` ✅ DONE (contract + data + tab sourcing) — Generalize inventory pockets
Added a generic `InventoryPocket` type + `inventoryLayout` on the adapter. Gen 1 = `[Items, PC]`; Gen 2
= `[Items, KeyItems(quantityless), Balls, TM/HM, PC]` with GSC capacities — both reproduced from the
table and tested. `Inventory.tsx` sources its bag/PC tab labels + capacities from `adapter.inventoryLayout`
(no more hardcoded `'BAG'`/20/`'PC'`/50), so a Gen 3 adapter's pockets drop in as data. *Follow-up:*
rendering Gen 2's KeyItems/Balls/TM-HM (and Gen 3's pockets) as additional **editable** tabs needs the
`Inventory` props/`onUpdate` signature widened to carry those arrays (they already exist on
`CanonicalSave` + in the layout) — deferred as the risky UI-plumbing half.

---

## 2. Bug Fixes — Gen 1 & Gen 2 — `[BUG]`

> These are the highest-value items: they cause silent **data loss / corruption** on save export,
> which is the worst failure mode for a save editor. The synthetic round-trip tests pass today only
> because they never place a populated Pokémon with status into party/box (see §5.1).

### 2.1 `[BUG][P0]` ✅ DONE — Gen 1 writer discards Pokémon status condition
`lib/generations/gen1/writer.ts` → `writePokemonStruct()` wrote the status byte (struct offset 0x04)
as a hardcoded `writer.u8(0)`. The parser reads & decodes it (`decodeStatus(view[offset+4])`), so any
non-OK Pokémon was **healed on every export**.
**Fix shipped:** added `encodeStatusByte()` (inverse of `decodeStatus`) in `lib/utils/byteHelpers.ts`
and the writer now emits `encodeStatusByte(mon.status, mon.raw[0x04])`, preserving the original raw
byte (incl. the sleep-turn counter) when status is unchanged. Locked by tests in
`tests/populatedRoundTrip.test.ts` (TODO 2.1 block) — verified to fail pre-fix, pass post-fix.

### 2.2 `[BUG][P0]` ✅ DONE — Gen 2 writer discards party Pokémon status condition
`lib/generations/gen2/writer.ts` → `writeGen2PokemonStruct()` wrote `data[offset+32] = 0` for party
mons, discarding parsed status (parser uses `decodeStatus(view[offset+32])`). Same data-loss class.
**Fix shipped:** writer now emits `encodeStatusByte(mon.status, mon.raw[32])` for party mons
(box/stored mons have no status byte and are unchanged). Locked by tests in
`tests/populatedRoundTrip.test.ts` (TODO 2.2 block) — verified fail→pass.

### 2.3 `[BUG][P1]` ✅ DONE — Gen 1 stat recalculation never re-derived the HP DV
`lib/utils/statCalculator.ts` → `recalculateStats(..., hasSplitSpecial=false)` (Gen 1 path) used
`mon.iv.hp` directly. In Gen 1/2 the HP DV is *derived* from the low bits of Atk/Def/Spe/Spc DVs, so
editing another DV left HP DV (and HP) stale.
**Fix shipped:** the Gen 1 branch now derives `hpIv` exactly like the Gen 2 path and writes it back to
`newMon.iv.hp` before computing HP (deep-clone preserved, so the caller's `mon` is untouched). Locked
by `tests/populatedRoundTrip.test.ts` (TODO 2.3 block + a Gen 2 regression guard).

### 2.4 `[BUG][P1]` ✅ DONE — Gen 2 box/daycare text written with International codec regardless of region
`writePCBoxGen2()` and the rival/daycare/box-name/phone-contact/trainer/party encoders called
`encodeGameBoyText(..., 0x50)` **without** a region flag, so JPN/KOR saves got International-encoded
text on export → corrupted nicknames/OT/box-names. (The old `encodeGameBoyText` wrapper also only
forwarded `isJapanese`, silently dropping Korean.)
**Fix shipped:** added `codecForOffsets(offsets)` (region resolved from `offsets.stringLength === 6`
JPN / `offsets.boxNameEntrySize === 17` KOR) and routed every region-aware encode through it; deleted
the dead wrappers. Locked by `tests/populatedRoundTrip.test.ts` (INT↔JPN codec divergence + box-mon
nickname round-trip). *Note: full JPN/KOR end-to-end round-trip still wants a real 64 KB JPN fixture
(5.4).*

### 2.5 `[BUG][P1]` ✅ DONE — Gen 2 egg `dexId` no-op branch
`parseGen2PokemonStruct()` had `const dexId = isEggFromList ? speciesId : speciesId;` plus an unused
`effectiveSpeciesId`. Verified against the format: the struct body at byte 0x00 always holds the real
(hatched) species; the `0xFD` egg marker only appears in the species-list header (`listSpeciesId`).
**Fix shipped:** replaced with `const dexId = speciesId;` and an explanatory comment; removed the dead
variable.

### 2.6 `[BUG][P1]` ✅ DONE — Gen 2 TM/HM → move-ID mapping was wrong
`parseGen2TmHmPocket()` hardcoded a `TM_HM_MOVES[]` table with wrong/duplicated IDs (TM01→Mud-Slap
instead of DynamicPunch, HM04→Flash instead of Strength, etc.), mislabeling owned TMs.
**Fix shipped:** replaced with the canonical GSC mapping (verified each slot against the repo's own
`GEN2_MOVES_LIST` names), hoisted to an exported `GEN2_TM_HM_MOVES` constant. Locked by
`tests/dataIntegrity.test.ts` (full per-slot name assertion; verified to fail on the old table).

### 2.7 `[BUG][P2]` ✅ DONE — `getGen2Gender()` thresholds — audited the 12.5%/25%/75% buckets
Audited all 1..251 species against canonical ratios: assignments and DV thresholds (`atkIv ≤ 1/3/7/11`)
were already correct, including every flagged edge case (Togepi 175/176, Snubbull 209/210, Corsola 222,
fossils 138-142, baby Pokémon). Refactored to expose the model as data (`getGen2GenderRatio()` +
`Gen2GenderRatio` type) and added an exhaustive 251-species audit + boundary/edge tests in
`dataIntegrity.test.ts` (verified to catch a deliberate misclassification). Behavior unchanged.

### 2.8 `[BUG][P2]` ✅ DONE — Gen 1 JPN config `saveSize` was wrong (0x10000)
JPN Gen 1 SRAM is 32 KB like International (region differs by data layout, not size). Corrected
`JPN_REGION_CONFIG.saveSize` to `0x8000`, fixed the field doc comment, and removed the dead/incorrect
`buffer.length >= 0x10000` "Japanese = 64 KB" branch in `detectGen1Region` (it could never fire since
detection only accepts 32 KB files). Region detection still uses the party-offset layout heuristic.
Locked by tests in `dataIntegrity.test.ts`. **Follow-up (Iteration 11):** the predicted "real JP
fixture would harden this" caveat proved correct — a real JP save exposed that the JP `CHECKSUM` offset
was *also* wrong (was INT's `0x3523`, corrected to `0x3594`) and the checksum range was hardcoded to
the INT end. Both the validator and writer are now region-correct, and detection accepts either layout.

### 2.9 `[BUG][P2]` ✅ DONE — Active-box write source can drift from edited in-memory box
Confirmed both writers use `pcBoxes` as the source of truth and derive the active-box SRAM copy from
it, so a stale `currentBoxPokemon` cache only misleads the UI. The re-derivation was duplicated across
7+ sites. Added `syncCurrentBox()` + dev-only `assertCurrentBoxInSync()` (logger-gated) in
`canonicalModel.ts`; routed the `EditorDashboard` edit paths through the helper and assert at both
writer entry points. Tested in `dataIntegrity.test.ts`.

### 2.10 `[BUG][P2]` ✅ DONE — `PokemonEditorModal` blocked Gen 2 standalone export with a stale `alert()`
The modal showed `alert("Standalone .pk{N} export is not yet supported …")` even though
`Gen2Adapter.createStandalonePokemon()` is implemented (`supportsStandalone = true`).
**Fix shipped:** export availability + extension now come from `adapter.supportsStandalone` and
`adapter.standaloneFormat.fileExtension`; the export button is hidden when unsupported, and all three
`alert()` calls were replaced with `saveCtx.onShowToast(...)` (success, unsupported, and failure
cases).

### 2.11 `[BUG][P2]` ✅ DONE — Crystal `CaughtData` read for all versions
Root cause was on the PARSE side: `parseGen2PokemonStruct` read bytes 0x1D-0x1E as CaughtData
unconditionally, so Gold/Silver mons (where those bytes aren't CaughtData) carried garbage `caughtData`.
Added an `isCrystal` param (default `false` = GS-safe), gated the read, and threaded real Crystal-ness
from `parseGen2Save` into party/box/daycare parses; the standalone `.pk2` path defaults to no
CaughtData. The writer's existing `caughtData !== 0` guard now never fires for GS. Locked by tests
(verified to fail on the old unconditional read).

---

## 3. Feature Completeness — Gen 1 & Gen 2 — `[FEAT]`

These make the *currently supported* gens fully editable, not just viewable.

### 3.1 `[FEAT][P1]` ✅ DONE — Event-flag editing UI
The named, categorized toggle editor was already functional (`EventFlagsManager` renders
`adapter.getGameEvents()` — 23 Gen1 / 53 Gen2 — and persists via `handleEventFlagsUpdate` →
`save.eventFlags` → writers; the placeholder only shows when no adapter is present). Added the missing
power-user pieces: a **free-text search** over named events (name/description/category/offset) and a
**raw flag-index inspector** to read/toggle any flag by array index, with a "no matches" hint. Event
data validated by tests (unique ids, offsets within bounds).

### 3.2 `[FEAT][P1]` ✅ DONE — Status condition editor in `PokemonStatsPanel`
Added an editable status selector (OK/Sleep/Poison/Burn/Freeze/Paralysis) shown for **party** mons
only (box/stored Pokémon have no status byte). Writes `mon.status`, which the writers encode via
`encodeStatusByte` (2.1/2.2) — making the round-trip fixes user-visible. `updateField` is threaded
from the modal as an optional prop. Status codec round-trip tested in `dataIntegrity.test.ts`.

### 3.3 `[FEAT][P1]` ✅ DONE — Level ⇄ EXP coupling using growth rates
Already wired in `PokemonEditorModal`: `handleLevelChange` recomputes EXP via `getExpAtLevel`,
`handleExpChange` recomputes level via `getLevelFromExp`, both using per-species `getGrowthRate`, and
connected to the level + EXP inputs. Full 1..251 growth-rate coverage was confirmed in Iteration 3
(5.3). This iteration adds tests locking the round-trip, level boundaries, canonical L100 totals, and
the 1..100 clamp.

### 3.4 `[FEAT][P2]` ⏸️ DEFERRED — Gen 2 mailbox editor
Model (`Gen2Mail`/`mailbox`) + read-only `MailboxTab` exist, but there is **no mail offset config, no
parser, and no writer** — the `mailbox` field is never populated. Implementing it requires inventing
GSC mail offsets + per-region struct layout (message lines, author/TID, type, appear-Pokémon) that
cannot be validated without a real save fixture (blocked on 5.4). Shipping speculative offsets that
write to the save risks corrupting users' saves on export, which is worse than the current honest
placeholder. **Deferred until a real GSC fixture is available**; do parse-first (viewer) before any
writer.

### 3.5 `[FEAT][P2]` ✅ DONE — Gen 2 daycare editing (read exists; confirm write)
Verified the parse↔`writeGen2Daycare` round-trip (parents + breeding metadata) with new tests — it was
wired but untested. Added a **Withdraw** action per parent in the daycare UI (`handleSaveExtUpdate`),
and fixed a gap where the writer skipped null parents (leaving stale bytes): it now zeroes the body
species byte when a slot is empty, so withdraw actually persists. NOB-interleaved layout round-trips.
Full deposit/edit-parent flow left as a future nicety.

### 3.6 `[FEAT][P2]` ✅ DONE (mostly) — Crystal-specific editors
Made the main Crystal fields editable in `EventsTab` (Crystal-gated via `isCrystal`), using the
`handleSaveExtUpdate` plumbing: **Blue Card points** (0–9999 input), **Mystery Gift** status toggle,
**GS Ball event** toggle. All persist through existing writer paths. *Remaining as future niceties:*
per-mon **CaughtData** editing UI (met location/level/ToD/OT gender — parse is Crystal-gated per 2.11)
and **Move Tutor** flag toggles; both are parsed/written, just not yet surfaced as inputs.

### 3.7 `[FEAT][P2]` ✅ DONE — Pokédex caught/seen flag editing (Gen 1 & 2)
Per-entry toggling (hidden→seen→owned) already existed. Added **bulk actions** (Mark all caught / Mark
all seen / Clear all) over 1..maxDex, and fixed a real persistence gap: the **Gen 2 writer never wrote
dex flags back** (GSC edits were lost on export). Added `writeGen2PokedexFlags` (inverse of
`getPokedexFlagsGen2`) and wired it into `writeGen2Save` for caught + seen sets; Gen 1 already
persisted. Round-trip tested in `dataIntegrity.test.ts`.

### 3.8 `[FEAT][P2]` ✅ DONE — Unown form display/edit (Gen 2)
The derived letter was already displayed via form sprites. Added **form selection**: a new
`setUnownFormDVs(letter, iv)` inverse helper computes DVs for a target letter, changing as few DVs as
possible and preserving non-form bits (`~6`) so unrelated stats/shininess aren't disturbed. An A–Z
picker in `PokemonInfoPanel` (species 201 only) calls `updateField('iv', …)` — matching PKHeX's
"form adjusts DVs" behavior. Inverse round-trip + bit-preservation tested in `dataIntegrity.test.ts`.

### 3.9 `[FEAT][P2]` ✅ DONE — Trainer & misc save fields
Audited the full parse→edit→write chain. Editable with write paths in `TrainerCard`: name, TID, money,
coins, badges (Johto+Kanto), play time, options, gender (Crystal), rival name. Parsed + written
(round-trip intact) but display-only in the Events overview: map/position, RTC, phone contacts.
Verified the Gen 2 badge round-trip works via the packed convention (`trainer.badges` low=Johto,
high=Kanto; `kantoBadges` offset = `johtoBadges+1`). Fixed the one real gap — **mom savings** was
parsed+written (BCD) but display-only: added a generic prototype-preserving `handleSaveExtUpdate` in
`EditorDashboard`, threaded to `EventsTab`, and made it an editable clamped (0–999,999) input (also
sets up plumbing for 3.6 Crystal editors). BCD round-trip tested.

---

## 4. Code Quality — `[CODE]`

### 4.1 `[CODE][P1]` ✅ DONE — Eliminate remaining `as any` casts
The one real production cast (`lib/hooks/touchDnD.ts`, reaching `.boxIndex` on the `SourceLocation`
discriminated union) now narrows on `src.type === 'box'`. The 8 test-fixture casts became
`as Partial<PokemonStats> as PokemonStats`, which still type-checks the fields that are present.
No real `as any` casts remain (only comments and the substring "has any idea"). *Note: the ESLint
ban on `as any` is still pending under 7.1/7.4.*

### 4.2 `[CODE][P1]` ✅ DONE — Gate production logging
Added `lib/utils/logger.ts`: `debug`/`info`/`log`/`warn` are silenced in production builds (gated on
`import.meta.env.DEV`, with a type-safe non-`any` env access), while `error` always fires. Routed all
22 `console.*` calls in `lib/` through it — notably the parser's per-file "[Parser] Analyzing …" log
is now `logger.debug`. The four UI-layer `console.error`s (genuine failures) were left as-is per this
item's "keep console.error for genuine failures only" note.

### 4.3 `[CODE][P2]` ✅ DONE — De-duplicate parser bounds-check "empty Pokémon" object
Added `createEmptyCanonicalPokemon(overrides)` to `lib/canonicalModel.ts` (re-exported via
`parser/types.ts`). Both `parsePokemonStruct` (Gen1) and `parseGen2PokemonStruct` (Gen2) now call it
with just the situational overrides (nickname/OT/isParty/offset/raw names) instead of inlining the full
literal. The CDM's required-field list now lives in one place. Guarded by tests in
`dataIntegrity.test.ts`.

### 4.4 `[CODE][P2]` ✅ DONE — Consolidate the `DEX_TO_INTERNAL` reverse maps
The National-Dex → Gen 1 internal-species map was rebuilt in three places. It is now derived once in
`gen1/data/offsets.ts` as `GEN1_DEX_TO_INTERNAL` (next to its source `GEN1_INTERNAL_TO_DEX`), with a
`getGen1InternalSpeciesId()` helper. `Gen1Adapter` (static field removed), `gen1/writer.ts`, and
`crossGenConverter.ts` all import the shared map. Guarded by a test asserting it's the exact inverse of
the source array.

### 4.5 `[CODE][P2]` ✅ DONE — Tidy `PokemonIVs`/`PokemonEVs` optional `spAtk?/spDef?`
Made `spAtk`/`spDef` **required** on both interfaces. Every construction site (Gen1/Gen2 parsers, the
`createEmptyCanonicalPokemon` factory, and tests) already populates them, and no code reads them as
optional, so `tsc` passes unchanged. This removes a `undefined`-hazard class under
`noUncheckedIndexedAccess` and gives Gen 3 (true split IVs) a clean base.

### 4.6 `[CODE][P2]` ✅ DONE — Replace `alert()`/`window` UX with the toast/modal system
The only `alert()` (standalone `.pk2` export in `PokemonEditorModal`) was already routed through the
toast system in Iteration 2 (task 2.10). A full audit now finds **zero** `alert(`/`confirm(`/`prompt(`
calls in the codebase (the single grep hit is a comment).

### 4.7 `[CODE][P2]` ✅ DONE — Extension registration timing under lazy adapters
Verified there's no first-paint flash: `detectAndParseAsync` preloads adapters, so a save can only
exist after its adapter (and thus its extension side-effect) has loaded. Made the ordering explicit by
extracting `registerGen2PanelExtensions()` and calling it from the `Gen2Adapter` constructor
(idempotent via the registry's id-dedupe, and robust across registry `clear()`/HMR). Added clarifying
comments at the panel `getExtensions()` calls documenting that an empty result is a safe no-op. Locked
by 2 tests in `dataIntegrity.test.ts`.

---

## 5. Testing — `[TEST]`

Current tests are good for checksums and synthetic empty saves but **do not** populate party/box mons
with full field sets — which is exactly why bugs 2.1/2.2 slipped through.

### 5.1 `[TEST][P0]` ✅ DONE — Populated round-trip identity tests
**Done:** `tests/populatedRoundTrip.test.ts` injects a fully-populated party mon (non-OK status,
moves, PP/PP-Ups, DVs, EVs, OT, nickname, friendship, held item/shiny for Gen2) and asserts status
survives write→re-parse for both gens. This was authored to fail on the pre-2.1/2.2 code and pass
after (verified). **Remaining:** extend to full byte-range identity assertions (not just status) and
add box-mon coverage for the active-box drift case (2.9).

### 5.2 `[TEST][P1]` ✅ DONE — Stat-recalc unit tests incl. HP-DV derivation (locks 2.3)
`tests/populatedRoundTrip.test.ts` asserts the Gen 1 `recalculateStats` path re-derives HP DV from
Atk/Def/Spe/Spc DVs (incl. a stale-`iv.hp` case and a max-DV case), plus a Gen 2 parallel guard and
`encodeStatusByte`/`decodeStatus` inverse round-trip tests. (Existing `tests/statCalculator.test.ts`
already covers the raw formula against known in-game values.)

### 5.3 `[TEST][P1]` ✅ DONE — Data-table integrity tests
`tests/dataIntegrity.test.ts` (12 tests) asserts: Gen1 base stats cover 1..151, Gen2 cover 1..251 with
non-zero HP; species-name arrays equal `nationalDexMax + 1` and have no empty names; Gen1 move list is
length 166 (ids 0..165); Gen2 move/PP/type arrays are all length 252; type charts are square
(15×15 / 17×17) with only {0, 0.5, 1, 2} multipliers (Gen2 includes Steel + Dark); every Gen2 species
1..251 has an explicit growth-rate entry (`SPECIES_GROWTH_RATE`, now exported); and the full Gen2
TM/HM → move mapping is correct (locks 2.6).

### 5.4 `[TEST][P1]` Real save fixtures (privacy-safe)
Add a few **freshly-created / trash-save** real `.sav` fixtures (Red/Blue/Yellow, Gold/Silver/Crystal,
and at least one JPN dump) under `tests/fixtures/`. Round-trip them. These catch offset/region bugs
synthetic saves miss (e.g., 2.4, 2.8). Document provenance; avoid any personal data.

### 5.5 `[TEST][P2]` ✅ DONE — Cross-gen transfer tests
New `tests/crossGenTransfer.test.ts` exercises `crossGenConverter` end-to-end through the real
Gen1/Gen2 adapters (eager-registered). **Gen1→Gen2:** type upgrade (Magnemite #81 gains Steel),
friendship default 70 (+warning), held item left "None", `Gen2Extension` swap, stable National-Dex id,
stale-raw-byte clearing. **Gen2→Gen1:** reject dex>151 (Chikorita #152), strip moves >165 (+warning),
drop held item (+warning), collapse SpAtk→unified Special, strip friendship/gender/pokerus, `Gen1Extension`
swap carrying the looked-up catch rate. Plus same-gen no-op and the primitives (`convertSpeciesId`,
`validateMovesForTargetGen` incl. the all-stripped→Pound default, `canTransferToGen`,
`getTransferImpactDescription`). Caught a real fixture trap: a Johto starter (#157) is correctly
rejected, so the success-path mon must be Kanto (Charizard #6).

### 5.6 `[TEST][P2]` ✅ DONE — Scalability invariant test (pairs with 1.2)
The dummy-adapter test asserting no core files need editing to add a generation. Implemented in `tests/scalabilityInvariant.test.ts` (6 tests).

### 5.7 `[DX][P2]` Coverage gate in CI
`vitest --coverage` is configured; add a minimum threshold (start realistic, e.g. lib/ statements ≥ 70%)
and ratchet up. Wire into the CI `Test` step.

---

## 6. Data Accuracy & Completeness — `[DATA]`

### 6.1 `[DATA][P1]` ✅ DONE — Audit Gen 2 TM/HM table (see 2.6)
Verified all 57 TM/HM→move-ID mappings against the canonical GSC list — every ID correct (the 2.6 fix
holds). Audit found one move-*name* inaccuracy: `GEN2_MOVES_LIST[197]` was `"Detection"` (surfaced via
TM43) where move #197 is canonically **"Detect"**; fixed the name (PP/type were already right), updated
comments + the existing TM43 test, and locked it (`GEN2_MOVES_LIST[197] === 'Detect'`, TM43→id 197).
### 6.2 `[DATA][P1]` ✅ DONE — Audit `getGen2Gender` species buckets (see 2.7). Full 1..251 audit + exhaustive tests; all buckets verified correct against canonical ratios.
### 6.3 `[DATA][P2]` ✅ DONE — Verify Gen 1 event-flag region mapping
Verified: `getEventFlags` reads 320 bytes (2560 flags) from `MISSABLE_OBJECTS` (0x2852), matching
pokered's `wEventFlags` (WRAM 0xD747 → save offset 0x2852, 0x140 bytes), with LSB-first bit order. All
Gen 1 event offsets (29–227) fall within range. Locked by an offset-bounds test in
`dataIntegrity.test.ts`.
### 6.4 `[DATA][P2]` ✅ DONE — Fill Pokédex flavor text / location gaps
Audited both Gen2 tables: `pokedexEntries.ts` and `pokemonLocations.ts` each cover **all** species
1..251 with separate Gold/Silver/Crystal strings — 753 values apiece, **zero** gaps, empties, or
placeholders (incl. 152–251). No data fixes were needed; the gap is now *locked* by a completeness
test. New `tests/pokedexCompleteness.test.ts` asserts — through the adapter accessors
`getPokedexEntry()` / `getEncounterLocations()`, not the raw tables — that every species
1..`nationalDexMax` resolves to a meaningful (non-empty, non-placeholder) string for all three versions,
plus the Gold-fallback for unknown versions and `undefined` for out-of-range ids. A dropped or stubbed
species row will now fail CI.
### 6.5 `[DATA][P2]` ✅ DONE — Item ID/name coverage
Audited Gen 2 items 1–95: only ID 25 was a `"Item 25"` placeholder (so it was silently dropped from
`getAllItemNames()`); set to its canonical name **Nugget**. HMs (125–131) and TMs (132–181) verified to
resolve to HM01–07 / TM01–50. Locked by a test asserting no placeholders remain in 1–95.

---

## 7. Tooling, CI & DX — `[DX]`

### 7.1 `[DX][P1]` Add ESLint + Prettier
There is no linter/formatter config in the repo. Add `eslint` (typescript-eslint, react-hooks,
react-refresh) + `prettier`, an `npm run lint` script, and a CI `Lint` step before typecheck.
### 7.2 `[DX][P2]` ✅ DONE — Pin / align React types
Aligned `@types/react`/`@types/react-dom` from `^19` to `^18.3.12`/`^18.3.1` to match the React 18.3.1
runtime (installed 18.3.30 / 18.3.7). Typecheck clean with the matched types; the adapter-pattern
`useDefineForClassFields:false` + decorator settings are untouched.
### 7.3 `[DX][P2]` ✅ DONE — Bundle-size budget per gen
`scripts/check-bundle-size.mjs` (npm `check:bundle`) measures each `dist/assets/*.js` chunk (raw + gzip)
and fails if over budget. Per-gen adapter chunks share a 100 KB gz / 400 KB raw budget so Gen 3+ data
growth is caught early; vendor/index have their own. Added as a CI step after Build. Verified it fails
when over budget. Current: Gen2 64 KB gz, Gen1 28 KB gz — within.
### 7.4 `[DX][P1]` ✅ DONE (as guard test) — Ban `generation === N` branches and `as any`
Implemented as `tests/scalabilityLint.test.ts` (ESLint not yet set up — 7.1): scans app source (comments
+ strings stripped) and fails on any `as any` cast or `generation <op> <number>` comparison, with a
justified allowlist for `canonicalModel.ts` (type guards) and `core/entityFormat.ts` (intrinsic per-gen
crypto seed). Fixed the one real violation found (`Gen2Adapter` ad-hoc `generation !== 2` + cast →
`isGen2Extension`). Re-expressible as a `no-restricted-syntax` ESLint rule once 7.1 lands.
### 7.5 `[DX][P2]` Pre-commit hook
Add husky + lint-staged to run lint/typecheck on changed files.

---

## 8. Documentation — `[DX]`

### 8.1 `[DX][P1]` ✅ DONE — Update `ROADMAP.md` / `README.md` to reflect reality
Fixed the README's inaccurate "SaveContext eliminates prop drilling" claim (documented as a hybrid; 1.5
tracks full consolidation), added Testing + Gen 3+ readiness sections, added a ROADMAP Current-Status
banner (Phases 1-3 done + hardening) and corrected the stale App.tsx example to lazy `registerLazy`.
### 8.2 `[DX][P1]` ✅ DONE — Write `docs/ADDING_A_GENERATION.md` (the deliverable of 1.1).
Code-verified checklist: genN folder/modules, data tables, the single `registerLazy` line, canonical extension classes + type guards, theme/sprite data, and the Gen3+ codec/entity-encryption seam. Includes an OCP acceptance section and the 5.4 fixture caveat.
### 8.3 `[DX][P2]` ✅ DONE — Document the save-format constants actually used
`docs/SAVE_FORMAT_CONSTANTS.md` — per-gen offset/struct/checksum reference mirrored from the real
`genN/data/offsets.ts` (Gen 1 + Gen 2, Crystal-INT divergences, JPN/KOR notes), cited to PKHeX
`SAV1`/`SAV2`/`PK1`/`PK2`, with a "how the code uses these" section. Offsets spot-checked vs code.
### 8.4 `[DX][P2]` ✅ DONE — Contribution guide + bug-report template referencing save provenance/privacy
Added `CONTRIBUTING.md` (dev workflow, enforced scalability rules, PR expectations) with a save-file
**provenance & privacy** section (saves are PII — don't attach real saves to public issues; give
provenance + synthetic repro; no ROMs/copyrighted data). Added `.github/ISSUE_TEMPLATE/` (bug_report,
feature_request, config disabling blank issues + privacy link) and a PR template; linked from README.

---

## 8.5 PKHeX Architecture Reconciliation — "are we on the right track?"

A deep read of the **actual PKHeX source** (`PKHeX.Core`, ~227k LOC) was cross-checked against this
project's design. **Verdict: the direction is correct.** Our core architecture mirrors PKHeX's proven
patterns, generally in a lighter, TypeScript-idiomatic way. Where we diverge, it's mostly because we
target a narrower scope (Gen 1/2 now) — but a few divergences are genuine gaps to close *before* Gen 3
locks the patterns in. This section records the alignment and adds the concrete follow-ups.

### What we already do the PKHeX way ✅ (keep going)
- **Single abstract base + concrete per-game subclass.** PKHeX: `SaveFile`/`PKM` + `SAVx`/`PKx`.
  Us: `IGenerationAdapter` + `GenNAdapter`, `CanonicalPokemon` + `genExtension`. Same polymorphism story.
- **Detection = size gate, then structural/cryptographic fingerprint.** PKHeX `SaveUtil.GetTypeInfo`
  is a size→fingerprint waterfall. Our `Gen1Adapter.detectSave` (size 0x8000 → `validateGen1Checksum`)
  and `Gen2Adapter.detectSave` (size → GS/Crystal/region checksum) already follow this exactly.
- **Registry/factory maps detected type → constructor.** PKHeX: the `switch` in `GetSaveFileInternal`.
  Us: `AdapterRegistry` (better, arguably — lazy + code-split per gen).
- **Per-generation data as tables, not branching logic.** PKHeX: embedded `Resources/byte/*`. Us:
  `lib/generations/genN/data/*`. "Add a gen ≈ add data" is the shared thesis.
- **Capability interfaces over type checks.** PKHeX: `if (entity is ITeraType t)`. Us: capability
  flags (`hasGender`, `hasSplitSpecial`, …) + `ExtensionRegistry` panels. Same intent.
- **Entity held decrypted in memory, re-sealed on write.** PKHeX: decrypt on load / `RefreshChecksum`
  + encrypt on `WriteEncryptedData*`. Us: parse → `CanonicalPokemon`, `writer` re-emits + re-checksums.
- **Cross-gen transfer walks one hop at a time with outbound/inbound filters.** PKHeX:
  `EntityConverter.IntermediaryConvert`. Us: `crossGenConverter` (dexId remap + reject >151, strip
  moves >165, etc.). Conceptually identical, just 1↔2 today.
- **Robustness by design.** PKHeX wraps load/legality in try/catch → graceful "invalid". Our parsers
  bounds-check and return an empty mon; detection fails closed. Aligned.

### Corrections / refinements the PKHeX read surfaced

### 8.5.1 `[GEN3+ PREP][P1]` ✅ DONE — Detection waterfall + wrapper handlers
Added `lib/core/saveWrappers.ts`: a `SaveWrapperHandler` contract + `stripKnownWrappers()` with a
`desmume-dsv` handler (`|-DESMUME SAVE-|` magic / `.dsv`) and a generic `trailing-footer` handler.
`AdapterRegistry.detectAndParse` is now Phase 1 (direct detection via `tryDirectDetect`, unchanged — Gen
1/2 `+16` still inline) + Phase 2 (strip-then-retry on failure). Purely additive; Gen 1/2 behavior
identical. New emulator/flashcart wrappers (and Gen 3+ ones) now drop into one place instead of
per-adapter. Tested (`tests/saveWrappers.test.ts`, 9; incl. end-to-end `.dsv` recovery through a real
adapter). *(Extends 1.1/1.2.)*

### 8.5.2 `[GEN3+ PREP][P1]` ✅ DONE — `SetChecksums` is a first-class adapter step
Added `recomputeChecksums(buffer): Uint8Array` to `IGenerationBinaryOps`, symmetric with
`validateSaveDetailed`. Extracted each writer's inline checksum logic into exported
`recomputeGen1Checksums` (per-box + bank + main) and `recomputeGen2Checksums` (per-box + main +
version/region backup mirroring); `writeSave` now calls these as its final step (one source of truth
per gen, no duplicated inline code). Each adapter's `recomputeChecksums` derives region/version from the
buffer and calls the same function — so it also repairs hand-edited saves. Tested (fresh-write
validates; corrupt→recompute→repairs for both gens; idempotence). This is the seam Gen 3 sector
checksums / Gen 8 hash-on-encrypt will plug into.

### 8.5.3 `[GEN3+ PREP][P1]` ✅ DONE — Entity encryption hooks cover **block-shuffle**
Added `lib/core/entityFormat.ts`: the PID-keyed block-shuffle primitive (`BLOCK_ORDERS` 24 perms,
`getBlockOrderIndex(pid,gen)` for Gen3 `pid%24` / Gen4-5 `((pid>>13)&31)%24`, invertible
`shuffleBlocks`/`unshuffleBlocks` for 12- and 32-byte geometries) and `getEntityFormatByLength()`
(PKHeX `GetFormatInternal` counterpart) that reports the ambiguous 136-byte Gen4/5 case. The
`decryptBlock`/`encryptBlock` hooks (from 1.3) are documented as the entity seam that calls these.
Tested (`tests/entityFormat.test.ts`, 10). **Not a Gen 3 implementation** — the order indexing + XOR/LCG
stream must be validated against PKHeX + a real `.pk3` before Gen 3 ships; the invertible round-trip and
size waterfall (fixture-independent) are what's guaranteed now.

### 8.5.4 `[GEN3+ PREP][P2]` ✅ DONE — Legality boundary + design note (no engine)
Added `lib/legality/`: `types.ts` (PKHeX-style `LegalitySeverity` Valid/Fishy/Invalid, `CheckResult`,
`LegalityAnalysis`, `isLegal`), `index.ts` (`analyzeLegality` explicit `analyzed:false` placeholder), and
a one-page `README.md` design note (the "consistent encounter" thesis; how per-gen `EncounterProvider` +
`Verifier`s would plug in). No engine — boundary only, so future entity validation has a typed home.
Tested (`tests/legality.test.ts`).

### 8.5.5 `[GEN3+ PREP][P2]` HOME is the modern interop hub — plan transfers around it, not pairwise
PKHeX routes **all** Gen 8+ inter-game transfers through the HOME format (`PKH`) rather than NxN pairwise
converters. Our `crossGenConverter` is currently pairwise (fine for 1↔2). **Action:** document that when
the matrix grows past ~Gen 5, transfers should pivot to a hub format (a neutral "transfer envelope" akin
to `CanonicalPokemon` itself, which we already have) instead of adding O(N²) converters. Largely a
design-note + a note in `crossGenConverter` — our `CanonicalPokemon` is already well-positioned to *be*
that hub.

### 8.5.6 `[DATA][P2]` ✅ DONE — Save integrity vs entity integrity (naming distinction)
`lib/legality/README.md` formalizes three distinct layers: **save integrity** (`validateSaveDetailed`/
`SaveValidationResult`, implemented), **entity legality** (`lib/legality/`, boundary only), and **bulk
analysis** (cross-entity duplicate/clone detection, backlogged with an `analyzeBulk()` sketch) — keeping
the namings separate exactly as PKHeX separates `ChecksumsValid` / per-`PKM` legality / `BulkAnalysis`.

> **Bottom line for the maintainer:** nothing in the PKHeX read invalidates the current plan or any
> shipped fix. The Gen 1/2 correctness work (§2) and the scalability seams (§1) are the right
> priorities. The five `8.5.x [GEN3+ PREP]` items above are *seam-hardening* to do alongside §1 before
> Gen 3 — they cost little now and save a refactor later. They are explicitly **not** a mandate to start
> Gen 3.

---

## 9. Research Notes — Gen 1–9 save formats & PKHeX (for future implementers)

Captured so future-gen work doesn't restart from zero. These inform the `[GEN3+ PREP]` items above;
**none of this is to be implemented now** beyond keeping interfaces capable of expressing it.

### 9.1 Save sizes, checksums, struct sizes (the dimensions the interfaces must express)
| Gen | Games | Save size | Checksum | Stored / Party mon |
|---|---|---|---|---|
| I | R/B/Y | 32 KB (`0x8000`) | 8-bit inverted byte sum | 33 / 44 |
| II | G/S/C | 32 KB INT/KOR, 64 KB JPN | 16-bit additive sum, dual-slot backup | 32 / 48 |
| III | RSE/FRLG | 128 KB (`0x20000`) | CRC-style per 4 KB sector; 14 sectors, rotating | 80 / 100 |
| IV | DPPt/HGSS | 512 KB | CRC16-CCITT per block, dual general/storage blocks | 136 / 236 |
| V | BW/B2W2 | 512 KB | CRC16-CCITT, many blocks | 136 / 220 |
| VI | XY/ORAS | ~415 KB | CRC16-CCITT per block; **encrypted PKM** | 232 / 260 |
| VII | SM/USUM | ~441 KB | CRC16-CCITT per block | 232 / 260 |
| VIII | LGPE/SwSh/BDSP/PLA | SwSh ~360 KB (SWSH `SCBlock` keyed blocks) | SHA-256-keyed `SCBlock` + per-block | 328 / 344 (SwSh) |
| IX | SV | keyed `SCBlock` container | per-block hashes | varies (SCB) |

Key implications already anticipated by the codebase: `Generation`/`GameVersion` are open types,
`IStandalonePokemonFormat` has `hasEncryption`/`hasAbilities`/`hasNatures`, `LazyFactory` keeps each
gen's (large) data out of the initial bundle. The big new mechanisms for Gen 3+ are: **block/sector
checksums**, **PKM encryption (PID/checksum-seeded block shuffle in Gen3; per-mon CRC in Gen4+)**, and
**Gen8/9 `SCBlock` keyed containers** — express these via 1.3.

### 9.2 Text encoding per gen (drives `ITextCodec` design — already 1-byte vs 2-byte aware)
- **Gen 1/2:** proprietary 1-byte charmap, `0x50` terminator (this repo's `GameBoyTextCodec`). JPN
  uses katakana/hiragana tables; box names wider than nicknames.
- **Gen 3:** custom 1-byte table, `0xFF` terminator.
- **Gen 4:** 16-bit LE custom index, dual INT/KOR tables, `0xFFFF` terminator.
- **Gen 5:** raw UTF-16 codepoints, terminate on `0xFFFF`/`0x0000`.
- **Gen 6/7:** UTF-16 with Private-Use-Area gender glyphs (`\uE08E`/`\uE08F`).
- **Gen 8/9:** plain UTF-16 LE, no custom table.
> The `ITextCodec.charSize: 1 | 2` and `terminator` fields already model this. Gen 4+ will add a second
> codec class; keep `adapter.codec` the single entry point (resolve 1.7 first).

### 9.3 PKHeX patterns this project already mirrors (keep aligning)
- **SaveUtil.GetTypeInfo / sequential probe** → our `AdapterRegistry.detectAndParse` cascade
  (ours is *more* dynamic: registry-based, lazy). PKHeX strips wrappers (`SaveHandlerFooterRTC`,
  `SaveHandlerGCI`, …) before retrying — see 8.5.1 for our planned equivalent.
- **Per-gen `PersonalTable`** → our `genN/data/baseStats.ts` (lazy-loaded chunks).
- **`SpeciesConverter.GetInternal1/GetNational1`** → `getInternalSpeciesId` + `GEN1_INTERNAL_TO_DEX`
  (+ shared `GEN1_DEX_TO_INTERNAL`).
- **`SaveFile.Write → GetFinalData → SetChecksums → Metadata.Finalize`** → our per-gen `writeSave`
  (checksum step to be made explicit — see 8.5.2).
- **`ChecksumsValid` + `ChecksumInfo`** → `validateSaveDetailed` returning per-component results.
- **`PokeCrypto` block-shuffle (PID % 24) + LCG-XOR; `RefreshChecksum`** → our standalone-format
  encryption hooks (boolean today; to be made concrete — see 8.5.3). Gen 1/2 entities are unencrypted,
  matching PKHeX.
- **`EntityFormat.GetFormatInternal` (length → format, checksum probe for ambiguous 136-byte)** →
  planned `EntityFormat.getFormatByLength()` (8.5.3).
- **`IBoxDetailName(Read)`** → `getBoxNames`/`setBoxName`/`getBoxNameMaxLength`.
- **`IEventFlagArray`** → `getGameEvents` per adapter.
- **`EntityConverter.IntermediaryConvert` (one legal hop; HOME hub for Gen8+)** → `crossGenConverter`
  warnings/errors (pairwise today; pivot to `CanonicalPokemon`-as-hub later — 8.5.5).
- **`SaveFile.ChecksumsValid` vs per-`PKM` checksum; `BulkGenerator`** → `validateSaveDetailed`
  (save-level); bulk box analyzer is future backlog (8.5.6).
> Gaps to close for future gens (capture as backlog, not now): **legality checking** (PKHeX's biggest
> subsystem — encounter/move/relearn/ability legality), **trade-evolution & form handling**,
> **encryption constants**, and **block-table abstractions** for Gen 8/9.

---

## 10. Suggested execution order (milestones)

1. **M1 — Stop the bleeding (P0 data-loss):** 2.1, 2.2, 5.1 (failing→passing), 2.4. Then 1.3 so the
   standalone/struct sizing isn't hardcoded while you're in there.
2. **M2 — Correctness & confidence:** 2.3, 2.5, 2.6, 5.2, 5.3, 5.4, 4.1, 4.2.
3. **M3 — Make Gen 1/2 fully editable:** 3.1, 3.2, 3.3; then 3.4–3.9.
4. **M4 — Scalability hardening:** 1.1, 1.2 (+5.6), 1.4, 1.5, 1.6, 1.7, 1.8, **plus the PKHeX-grounded
   seams 8.5.1–8.5.6** (detection/wrapper handlers, explicit `SetChecksums` step, concrete entity
   encryption hooks incl. PID%24 block-shuffle, legality boundary note, HOME-hub transfer note,
   save-vs-entity validation naming). These are cheap now and prevent a Gen 3 refactor.
5. **M5 — DX & polish:** 7.1, 7.4, 7.3, 8.x, 5.7, remaining P2s.

> **Definition of done for "scalable but Gen 1/2 only":** M1–M2 complete (no export data loss, real
> fixtures round-trip), the dummy-adapter test in 1.2 proves zero-core-edit extensibility, and
> `docs/ADDING_A_GENERATION.md` exists — *without* any Gen 3+ game code shipped.
