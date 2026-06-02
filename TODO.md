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

### 1.1 `[STRUCT][P1]` Define and document the canonical "add a generation" checklist
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

### 1.2 `[GEN3+ PREP][P1]` Add a throwaway "GenTest"/dummy adapter behind a flag to prove OCP
Add a minimal fake adapter (not a real game) that registers, detects a magic-size buffer, and
round-trips a trivial save — used **only in tests**. This converts the "zero core edits per gen"
claim into an enforced invariant.
> **Acceptance:** a test registers the dummy adapter and asserts that detection, parsing, writing,
> sprite resolution, theme fallback, and panel extension injection all work **without editing any
> file under `lib/core`, `components/`, or `context/`**. If something *must* be edited, that file
> is the real scalability blocker — fix it, then delete the dummy.

### 1.3 `[GEN3+ PREP][P0]` Make `IStandalonePokemonFormat` the *only* standalone path; finish encryption hooks
Today `IStandalonePokemonFormat` exists with `hasEncryption`, but Gen3+ encryption (PID/IV
checksum block shuffle for `.pk3`, CRC16 for `.pk4/.pk5`, etc.) has no hook. Define the contract now:
- Add `decryptBlock(buffer): Uint8Array` / `encryptBlock(mon): Uint8Array` (default identity for Gen1/2).
- Add `boxSize` / `partySize` (struct byte sizes) and `checksumOffsets` to the interface so the
  generic PC/standalone code never hardcodes 33/44/32/48.
> **Acceptance:** Gen1/2 keep working unchanged (no-op crypto). The interface is rich enough that a
> Gen 3 `.pk3` could be added later with zero changes to `PCStorage.tsx` / `PokemonEditorModal.tsx`.

### 1.4 `[GEN3+ PREP][P1]` Generalize feature-capability flags into a single declarative table
Capability flags are spread across the adapter (`hasMailbox`, `hasHallOfFame`, `supportsBoxNames`,
`hasAbilities`, `hasNatures`, …). Add the still-missing ones future gens need so the UI can branch
on data, not on gen number:
- `hasContests`, `hasRibbons`, `hasBallType`, `hasMetData`, `hasMarkings`, `hasFatefulEncounter`,
  `hasFriendshipSystem`, `hasPokerus` (Gen2+), `hasFormSystem`, `hasNationalDexFlag`, `maxMoney`,
  `maxLevel` (100 for all gens but explicit), `tmHmPocketLayout`.
> **Acceptance:** any tab/panel that *could* be gen-specific reads a named capability; grep for new
> `generation === N` introductions in PRs is empty (add an ESLint rule — see 7.4).

### 1.5 `[GEN3+ PREP][P1]` Resolve the dual "props + SaveContext" data flow
`EditorDashboard.tsx` (525 lines) both wraps children in `SaveProvider` **and** drills the same
props down. New gens inherit this double maintenance.
- Pick **context as the source of truth**; convert tab/panel components to consume `useSaveContext()`
  and delete redundant prop chains.
- Keep `EditorDashboard` a thin shell that renders tabs + overlays (the ROADMAP's stated goal).
> **Acceptance:** `EditorDashboard.tsx` shrinks substantially; adding a tab does not require threading
> 10+ props through the shell.

### 1.6 `[GEN3+ PREP][P2]` Make theme + version metadata data-driven per adapter
`data/games.ts` and `lib/sprites.ts` `VERSION_SPRITE_MAP` are hardcoded Gen1/2. To keep "add a gen =
add data," have each adapter expose `getVersionTheme(version)` and `getSpriteFolder(version)` (or a
`versions: VersionMeta[]` array), and have `data/games.ts` / `sprites.ts` *aggregate from registered
adapters* rather than hold a literal Gen1/2 list.
> **Acceptance:** `GameVersionSelector` and theme sync read versions from the registry; Gen3 versions
> would appear automatically once a Gen3 adapter registers.

### 1.7 `[GEN3+ PREP][P2]` Codec ownership: actually route parsing through `adapter.codec`
The adapters expose `codec` + `setCodecRegion()`, but `parseGen1Save` / `parseGen2Save` /
`writeGen*` use **module-level** `_codecInt`/`_codecJpn`/`_codecKor` instances, so `setCodecRegion`
is never exercised and the "adapter-owned codec" is decorative on the hot path.
- Either inject the adapter's region-correct codec into the parser/writer, or delete `setCodecRegion`
  to avoid a misleading API. Decide before Gen 3 (whose codec is genuinely different) locks in the
  pattern.
> **Acceptance:** there is exactly one codec source of truth per parse/write; no dead `setCodecRegion`.

### 1.8 `[GEN3+ PREP][P2]` Generalize PC box geometry & inventory pockets in the UI layer
PC grid and inventory pockets are driven by `boxCount`/`boxSlotCount` and pocket capacities already,
but pocket *identity* (Items/Balls/KeyItems/TM-HM) is Gen2-shaped. Define a generic
`InventoryLayout` (ordered list of pockets with id, label, capacity, stack size) on the adapter so
Gen3 RSE pockets (Items, Poké Balls, TMs/HMs, Berries, Key Items) drop in as data.
> **Acceptance:** `Inventory.tsx` renders pockets from `adapter.inventoryLayout`; Gen1 (1 bag + PC),
> Gen2 (Items/KeyItems/Balls/TM-HM/PC) both reproduced from the table.

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

### 2.6 `[BUG][P1]` Verify Gen 2 TM/HM → move-ID mapping table
`parseGen2TmHmPocket()` hardcodes `TM_HM_MOVES[]`. Spot-checking shows suspicious duplicates
(e.g. move `129`/`97` appear twice across different TM slots) and values that don't match the canonical
GSC TM list (TM01=DynamicPunch, TM02=Headbutt, …). An incorrect table mislabels owned TMs and writes
wrong move names back.
- Cross-check every TM01–TM50 / HM01–HM07 entry against PKHeX's Gen2 TM table (or Bulbapedia) and add a
  data test that asserts the full mapping.

### 2.7 `[BUG][P2]` `getGen2Gender()` thresholds — audit the 12.5%/25%/75% buckets
The species lists for the 87.5%-male, 75%-male, and 25%-male buckets are hand-maintained. The
`gen2GenderShiny.test.ts` covers some cases, but audit the full 1–251 list against PokeAPI
`gender_rate` (already cited in the source comment) and add exhaustive table coverage. Edge species to
re-verify: Togepi line (175/176), Snubbull line (209/210), Corsola (222), fossils, baby Pokémon.

### 2.8 `[BUG][P2]` Gen 1 JPN config `saveSize: 0x10000` vs detection accepting only 32 KB
`offsets.ts` `JPN_REGION_CONFIG.saveSize = 0x10000`, but `Gen1Adapter.detectSave` only accepts
`32768` or `32768+16`. Real JPN Gen 1 saves are 32 KB; the `0x10000` value is unused and misleading.
Either correct it to `0x8000` or make detection consistent with whatever real JPN dumps actually are.
Decide with a real JPN `.sav` fixture (see §5.4).

### 2.9 `[BUG][P2]` Active-box write source can drift from edited in-memory box
Gen 1 writer copies the active box from `save.pcBoxes[i]` into the current-box RAM cache when
`i === save.currentBoxId`. Gen 2 writer slices the active box region into `currentBoxCopy`. Confirm
the in-memory `currentBoxPokemon` and `pcBoxes[currentBoxId]` are *always* kept in sync by the UI
(they're separate fields on `CanonicalSave`). If a code path edits one but not the other, the export
silently uses stale data. Add an invariant/assert (dev-only) and a round-trip test that edits the
active box.

### 2.10 `[BUG][P2]` ✅ DONE — `PokemonEditorModal` blocked Gen 2 standalone export with a stale `alert()`
The modal showed `alert("Standalone .pk{N} export is not yet supported …")` even though
`Gen2Adapter.createStandalonePokemon()` is implemented (`supportsStandalone = true`).
**Fix shipped:** export availability + extension now come from `adapter.supportsStandalone` and
`adapter.standaloneFormat.fileExtension`; the export button is hidden when unsupported, and all three
`alert()` calls were replaced with `saveCtx.onShowToast(...)` (success, unsupported, and failure
cases).

### 2.11 `[BUG][P2]` Crystal `CaughtData` bytes 0x1D–0x1E written for all versions
`writeGen2PokemonStruct` writes CaughtData when `gen2Ext.caughtData !== 0`. Confirm those struct bytes
are not repurposed in Gold/Silver (where CaughtData doesn't exist). For GS, `caughtData` should stay 0
so the guard skips — verify the parser never sets a non-zero `caughtData` for GS saves, or you'll
clobber GS struct bytes on export.

---

## 3. Feature Completeness — Gen 1 & Gen 2 — `[FEAT]`

These make the *currently supported* gens fully editable, not just viewable.

### 3.1 `[FEAT][P1]` Event-flag editing UI (currently read-only / unavailable)
`EventFlagsManager.tsx` shows "Event flag editing for Generation {N} saves is not yet available." The
parser/writer already read/write the full flag arrays (Gen1 320 bytes; Gen2 2000 flags). Build the
editor:
- Named, categorized toggles from `adapter.getGameEvents(version)` (already returns
  `GameEventDefinition[]`).
- Raw flag index search/jump for power users.
- Persist edits back through `save.eventFlags`.

### 3.2 `[FEAT][P1]` Status condition editor in `PokemonStatsPanel`
Once 2.1/2.2 land, expose status (OK/SLP(n)/PSN/BRN/FRZ/PAR/Toxic where applicable) as an editable
field. This is needed anyway to make the round-trip fixes user-visible.

### 3.3 `[FEAT][P1]` Level ⇄ EXP coupling using growth rates
`lib/utils/experience.ts` has `GrowthRate` + `SPECIES_GROWTH_RATE` (Gen1–3 families). Wire it so editing
level recomputes EXP to the level's minimum (and vice-versa, EXP→level), per species growth group.
Verify all 251 Gen2 species have a growth-rate entry (audit the table for gaps at 152–251).

### 3.4 `[FEAT][P2]` Gen 2 mailbox editor
`Gen2SaveExtension.mailbox` and `Gen2Mail` exist; `MailboxTab.tsx` exists. Confirm parse→edit→write for
party mail + mailbox mail (author name/TID, two message lines, mail type, appear-Pokémon). Add a writer
path if missing.

### 3.5 `[FEAT][P2]` Gen 2 daycare editing (read exists; confirm write)
Parser reads daycare parents + breeding status/steps; writer has `writeGen2Daycare`. Ensure the UI can
add/remove/edit daycare parents and that NOB-interleaved layout round-trips.

### 3.6 `[FEAT][P2]` Crystal-specific editors
Blue Card points, Mystery Gift unlock/item, GS Ball event toggle, Move Tutor flags, and per-mon
CaughtData (met location/level/time-of-day/OT gender) are all parsed and exposed via adapter helpers
but need UI. Surface them in Crystal saves only (driven by `adapter`/`isCrystal`, not gen number).

### 3.7 `[FEAT][P2]` Pokédex caught/seen flag editing (Gen 1 & 2)
Flags are parsed (`pokedexOwnedFlags`/`pokedexSeenFlags`) and written; add toggle UI in `Pokedex.tsx`
(e.g., "mark all seen/caught," per-entry toggle). Useful for living-dex workflows already hinted at by
`sortManager` living-dex mode.

### 3.8 `[FEAT][P2]` Unown form display/edit (Gen 2)
`getGen2UnownFormLetter()` exists and `Gen2SaveExtension` holds Unown dex data. Show the derived letter
on Unown mons and allow form selection (which adjusts DVs to match), matching PKHeX behavior.

### 3.9 `[FEAT][P2]` Trainer & misc save fields
Confirm full edit coverage for: money, coins, badges (Johto + Kanto for Gen2), play time, options,
trainer gender (Crystal), rival name, map/position, mom savings, RTC, phone contacts. Most are parsed;
ensure each has an input and a writer path with validation/clamping.

---

## 4. Code Quality — `[CODE]`

### 4.1 `[CODE][P1]` Eliminate remaining `as any` casts (14 occurrences)
`grep -rn "as any"` finds ~14 across `.ts/.tsx`. A prior commit claimed to remove them; some remain.
Replace with the existing type guards (`isGenNExtension`, `isGenNSaveExtension`) or proper generics.
Add an ESLint rule to ban `as any` (see 7.4).

### 4.2 `[CODE][P1]` Gate production logging
~22 `console.log/warn/error` calls in `lib/` (e.g., parser logs every file). Route through a tiny
`logger` util that is silenced in production builds (or stripped via Vite `define`/esbuild drop).
Keep `console.error` for genuine failures only.

### 4.3 `[CODE][P2]` De-duplicate parser bounds-check "empty Pokémon" object
Both `parsePokemonStruct` (Gen1) and `parseGen2PokemonStruct` (Gen2) build a large literal
"empty/placeholder `CanonicalPokemon`" inline. Extract `createEmptyCanonicalPokemon(overrides)` into a
shared helper so the CDM's required-field list lives in one place (and adding a CDM field doesn't mean
editing every parser).

### 4.4 `[CODE][P2]` Consolidate the two reverse maps `DEX_TO_INTERNAL`
Gen 1 builds a `DEX_TO_INTERNAL` map in **three** places: `Gen1Adapter` (static),
`gen1/writer.ts`, and `crossGenConverter.ts`. Build it once (e.g., export from `gen1/data/offsets.ts`)
and import everywhere.

### 4.5 `[CODE][P2]` Tidy `PokemonIVs`/`PokemonEVs` optional `spAtk?/spDef?`
These optional mirror fields invite `undefined` bugs under `noUncheckedIndexedAccess`. Either make them
required (always mirrored at parse time, which they already are) or remove and compute from `special`.
Pick one and enforce it so Gen 3 (true split IVs) has a clean base.

### 4.6 `[CODE][P2]` Replace `alert()`/`window` UX with the toast/modal system
Audit for `alert(`/`confirm(`/`prompt(`; route through `useToast` + existing modals for consistent UX
and testability (`PokemonEditorModal` standalone export is one; check others).

### 4.7 `[CODE][P2]` Extension registration timing under lazy adapters
`gen2/extensions.tsx` registers via a side-effect import inside `Gen2Adapter.ts` (lazy). Panels query
the registry synchronously on render. `SaveProvider.adapterLoading` should gate rendering until the
adapter (and thus its extensions) load — verify there's no first-paint flash of missing Gen2 sections,
and add a comment/guard making the ordering explicit for future gens.

---

## 5. Testing — `[TEST]`

Current tests are good for checksums and synthetic empty saves but **do not** populate party/box mons
with full field sets — which is exactly why bugs 2.1/2.2 slipped through.

### 5.1 `[TEST][P0]` 🟡 PARTIAL — Populated round-trip identity tests
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

### 5.3 `[TEST][P1]` Data-table integrity tests
Assert: Gen1 base-stats has 151 species (+placeholder); Gen2 has 251; species/move/item name arrays
match `nationalDexMax`; Gen2 TM/HM→move table is fully correct (locks 2.6); every Gen2 species has a
growth-rate entry (supports 3.3); type charts are square (15×15 Gen1, 17×17 Gen2).

### 5.4 `[TEST][P1]` Real save fixtures (privacy-safe)
Add a few **freshly-created / trash-save** real `.sav` fixtures (Red/Blue/Yellow, Gold/Silver/Crystal,
and at least one JPN dump) under `tests/fixtures/`. Round-trip them. These catch offset/region bugs
synthetic saves miss (e.g., 2.4, 2.8). Document provenance; avoid any personal data.

### 5.5 `[TEST][P2]` Cross-gen transfer tests
Gen1→Gen2 (catch-rate→held-item rules, friendship default 70) and Gen2→Gen1 (reject dex>151, strip
moves >165, drop held item) with explicit warning assertions from `crossGenConverter`.

### 5.6 `[TEST][P2]` Scalability invariant test (pairs with 1.2)
The dummy-adapter test asserting no core files need editing to add a generation.

### 5.7 `[DX][P2]` Coverage gate in CI
`vitest --coverage` is configured; add a minimum threshold (start realistic, e.g. lib/ statements ≥ 70%)
and ratchet up. Wire into the CI `Test` step.

---

## 6. Data Accuracy & Completeness — `[DATA]`

### 6.1 `[DATA][P1]` Audit Gen 2 TM/HM table (see 2.6) — owns the data half of that bug.
### 6.2 `[DATA][P1]` Audit `getGen2Gender` species buckets (see 2.7).
### 6.3 `[DATA][P2]` Verify Gen 1 event-flag region mapping
Gen 1 reads 320 bytes starting at `MISSABLE_OBJECTS` (0x2852) and treats them as 2560 generic event
flags. Confirm this region/length matches PKHeX's Gen1 event-flag layout (missable objects vs. the
broader event-flag array) before exposing flag editing (3.1), or the toggles will write to the wrong
bits.
### 6.4 `[DATA][P2]` Fill Pokédex flavor text / location gaps
Gen2 `pokedexEntries.ts` / `pokemonLocations.ts` are large but spot-check for `undefined`/placeholder
entries (esp. 152–251 and version-specific Gold/Silver/Crystal text). Track completeness with a test
(6 above can assert "no missing entries for IDs ≤ nationalDexMax").
### 6.5 `[DATA][P2]` Item ID/name coverage
`getAllItemNames()` filters out `Item N` placeholders. Verify Gen2 ordinary items (1–95), HMs
(125–131), TMs (132–181) are all named, and that held-item editing covers the full valid set.

---

## 7. Tooling, CI & DX — `[DX]`

### 7.1 `[DX][P1]` Add ESLint + Prettier
There is no linter/formatter config in the repo. Add `eslint` (typescript-eslint, react-hooks,
react-refresh) + `prettier`, an `npm run lint` script, and a CI `Lint` step before typecheck.
### 7.2 `[DX][P2]` Pin / align React types
`package.json` runs React 18.3.1 but pulls `@types/react@^19`. Align types to React 18 to avoid subtle
type mismatches (`useDefineForClassFields:false` + decorators are already in place for the adapter
pattern; keep them).
### 7.3 `[DX][P2]` Bundle-size budget per gen
Build already splits per gen (Gen2Adapter chunk ~289 KB raw / ~65 KB gz). Add a CI check that fails if a
per-gen chunk exceeds a budget, so Gen 3+ data growth is caught early (Vite `build.rollupOptions` notes
already anticipate this).
### 7.4 `[DX][P1]` Lint rule: ban new `generation === N` branches and `as any`
Add a custom ESLint rule (or `no-restricted-syntax`) flagging `=== <number>` comparisons against a
`.generation` member and `as any`. This *enforces* the adapter-driven scalability the ROADMAP promises.
### 7.5 `[DX][P2]` Pre-commit hook
Add husky + lint-staged to run lint/typecheck on changed files.

---

## 8. Documentation — `[DX]`

### 8.1 `[DX][P1]` Update `ROADMAP.md` / `README.md` to reflect reality
- Mark Phase 1/2/3 status accurately (Gen 2 is shipped; panel decomposition + tab composers done).
- `README` describes `SaveContext` as eliminating prop drilling, but `EditorDashboard` still drills
  props — fix the doc (or fix the code per 1.5 and then the doc is true).
### 8.2 `[DX][P1]` Write `docs/ADDING_A_GENERATION.md` (the deliverable of 1.1).
### 8.3 `[DX][P2]` Document the save-format constants actually used
Keep a per-gen offset/struct reference (the ROADMAP's constants table is a good start) co-located with
each `genN/data/offsets.ts`, citing PKHeX `SAVN`/`PKN` sources for traceability.
### 8.4 `[DX][P2]` Contribution guide + bug-report template referencing save provenance/privacy.

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
  (ours is *more* dynamic: registry-based, lazy).
- **Per-gen `PersonalTable`** → our `genN/data/baseStats.ts` (lazy-loaded chunks).
- **`SpeciesConverter.GetInternal1/GetNational1`** → `getInternalSpeciesId` + `GEN1_INTERNAL_TO_DEX`.
- **`ChecksumsValid` + `ChecksumInfo`** → `validateSaveDetailed` returning per-component results.
- **`IBoxDetailName(Read)`** → `getBoxNames`/`setBoxName`/`getBoxNameMaxLength`.
- **`IEventFlagArray`** → `getGameEvents` per adapter.
- **`EntityConverter` (reject impossible transfers)** → `crossGenConverter` warnings/errors.
> Gaps to close for future gens (capture as backlog, not now): **legality checking** (PKHeX's biggest
> subsystem — encounter/move/relearn/ability legality), **trade-evolution & form handling**,
> **encryption constants**, and **block-table abstractions** for Gen 8/9.

---

## 10. Suggested execution order (milestones)

1. **M1 — Stop the bleeding (P0 data-loss):** 2.1, 2.2, 5.1 (failing→passing), 2.4. Then 1.3 so the
   standalone/struct sizing isn't hardcoded while you're in there.
2. **M2 — Correctness & confidence:** 2.3, 2.5, 2.6, 5.2, 5.3, 5.4, 4.1, 4.2.
3. **M3 — Make Gen 1/2 fully editable:** 3.1, 3.2, 3.3; then 3.4–3.9.
4. **M4 — Scalability hardening:** 1.1, 1.2 (+5.6), 1.4, 1.5, 1.6, 1.7, 1.8.
5. **M5 — DX & polish:** 7.1, 7.4, 7.3, 8.x, 5.7, remaining P2s.

> **Definition of done for "scalable but Gen 1/2 only":** M1–M2 complete (no export data loss, real
> fixtures round-trip), the dummy-adapter test in 1.2 proves zero-core-edit extensibility, and
> `docs/ADDING_A_GENERATION.md` exists — *without* any Gen 3+ game code shipped.
