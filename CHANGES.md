# BilKo's PC Reborn — P0 Bug Fixes

This document summarizes the P0 (data-corruption-risk) bug fixes applied to this build. All 428 tests pass (`npm test`), `npm run typecheck` is clean, and `npm run lint` reports 0 errors.

## P0 Fixes Applied

### BUG-G01 — Stat formula inflated EV contribution by 1

**File:** `lib/utils/statCalculator.ts`

**Before:** `Math.floor(Math.ceil(Math.sqrt(statExp)) / 4)` — used `Math.ceil`, which rounds UP, inflating the EV factor by 1 whenever `sqrt(StatExp)` was non-integer and the ceiling crossed a `/4` boundary.

**After:** `Math.floor(Math.sqrt(statExp) / 4)` — matches the Gen 1 ROM's integer-square-root + `srl c; srl c` shift, the pokered disassembly, and PKHeX's `StatCalculator`.

**Impact:** Every Gen 1 and Gen 2 box-mon stat (and every stat recalculation) was 1 too high in display and on write-back. Example: Mewtwo Lv100 max-EV Special dropped from 407 → 406 (the correct value per Bulbapedia).

**Tests updated:** `tests/statCalculator.test.ts` (expected values 416→415, 407→406, 319→318), `tests/gen2GenderShiny.test.ts` (416→415, 407→406). Added a regression test (`BUG-G01 regression: non-perfect-square EV does not inflate by 1`).

---

### BUG-G02 — Sleep counter values 1-3 misdecoded as "OK"

**File:** `lib/utils/byteHelpers.ts`

**Before:** `if (byte & (1 << 2)) return "SLP";` — `(1 << 2)` is `0x04`, which only catches sleep counter values 4-7. Counters 1, 2, 3 (bytes `0x01`, `0x02`, `0x03`) were silently misdecoded as "OK".

**After:** `if (byte & 0x07) return "SLP";` — any of bits 0-2 set means the Pokémon is asleep (counter 1-7), matching the Gen 1/2 status byte layout.

**Impact:** Sleeping Pokémon appeared awake in the editor. The `encodeStatusByte` round-trip had two failure modes: SLP→SLP lost the original counter (replaced with 0x04), and SLP→OK preserved the sleep bit even though the UI said "OK".

**Tests added:** `tests/byteHelpers.test.ts` — `BUG-G02 regression: sleep counter 1-3 decodes to SLP (not OK)`, `BUG-G02 regression: all sleep counters 1-7 decode to SLP`, and `should prioritize SLP over other statuses when sleep bits are set`.

---

### BUG-G03 — Gen 2 Pokedex flag round-trip shifted every species by one

**File:** `lib/generations/gen2/parser.ts`

**Before:** `getPokedexFlagsGen2` returned a 0-indexed array (`flags[0]` = Bulbasaur), but `writeGen2PokedexFlags` and `Pokedex.tsx` both expect a 1-indexed array (`flags[1]` = Bulbasaur, matching the Gen 1 parser). This off-by-one caused every species to display the NEXT species' caught/seen status, and every round-trip shifted all flags left by 1 (Bulbasaur's bit got Ivysaur's value, etc., Celebi's bit got padding).

**After:** Added `flags.push(false)` at index 0 before the bit loop, making the array 1-indexed exactly like the Gen 1 parser (`lib/generations/gen1/parser.ts:43-59`). Now `flags[N]` = species N for all N in 1..251.

**Impact:** Pokédex display and save round-trip are now correct for Gen 2. Without this fix, opening and re-saving a Gen 2 save would silently corrupt the Pokédex state, with the corruption compounding on each save.

**Tests updated:** `tests/gen2GenderShiny.test.ts` — Pokédex flag tests now expect 1-indexed access (`flags[1]` = Bulbasaur, `flags[251]` = Celebi, length 257). `tests/dataIntegrity.test.ts` — round-trip test now asserts `read[id]` instead of `read[id - 1]`, and verifies `read[0]` is the dummy `false`.

---

### BUG-G3-01 — PK3 encryption used fixed-key XOR instead of LCRNG stream cipher

**File:** `lib/generations/gen3/entity.ts`

**Before:** `xorCryptData` XORed every 4-byte chunk of the 48-byte data region with the SAME 32-bit key (`PID ^ OTID`). The JSDoc also incorrectly called this the "16-bit XOR encryption key" (it's 32-bit, and the algorithm is wrong).

**After:** Implemented the correct Gen 3 LCRNG stream cipher:
```ts
function lcrngNext(seed: number): number {
  return (Math.imul(seed >>> 0, 0x41C64E6D) + 0x6073) >>> 0;
}

// In xorCryptData:
let seed = key >>> 0;
for (let i = 0; i < PK3_DATA_SIZE; i += 4) {
  seed = lcrngNext(seed); // advance BEFORE XOR (PKHeX order)
  const word = readU32LE(out, i) ^ seed;
  ...
}
```
Each 4-byte chunk is now XORed with a FRESH PRNG output, matching PKHeX's `PK3.cs` and Bulbapedia's "Pokémon data substructures (Generation III)" article.

**Impact:** If a maintainer had followed the README's "Gen 3+ readiness" claim and registered a Gen 3 adapter, the old code would have silently corrupted every real Gen 3 save opened in this editor, and produced files no real game or PKHeX could read. The fix ensures interoperability with PKHeX and real Gen 3 cartridges.

---

### BUG-G3-02 — Gen 3 entity tests were tautological

**File:** `tests/gen3Entity.test.ts`

**Before:** The tests only verified `encrypt(decrypt(x)) = x`, which is trivially true for ANY XOR (even a no-op identity function). The broken fixed-key XOR passed all tests, and so would a function that did nothing at all. No test could detect the wrong encryption algorithm.

**After:** Added three non-tautological tests that prove the LCRNG is correct independently of the round-trip:

1. **`LCRNG stream matches an independent BigInt reference (BUG-G3-02)`** — encrypts an all-zeros plaintext with a known PID/OTID and asserts the ciphertext equals the LCRNG stream computed by an independent BigInt reference implementation (no `Math.imul`, no 32-bit truncation tricks). Catches: wrong LCRNG constant, wrong "advance before XOR" order, wrong word size, wrong endianness.

2. **`first LCRNG output for seed=0 is 0x00006073 (well-known anchor)`** — a single hard-coded anchor that doesn't depend on any reference implementation. Verifies the LCRNG constant and the "advance before XOR" order with bytes `[0x73, 0x60, 0x00, 0x00]`.

3. **`ciphertext = plaintext XOR LCRNG stream for non-zero plaintext`** — verifies the XOR is actually applied (not just returning the stream).

The existing round-trip tests are retained (they still verify block-shuffle correctness across all 24 PID%24 orderings).

---

## Verification

```bash
npm test          # 428 passed (28 files)
npm run typecheck # clean (tsc --noEmit)
npm run lint      # 0 errors, 188 pre-existing warnings (none from these fixes)
```

## Files Changed

| File | Change |
|---|---|
| `lib/utils/statCalculator.ts` | BUG-G01: `Math.ceil(Math.sqrt())` → `Math.sqrt()` (2 places: `calculateGen1Stat` + `deriveBaseStats`) |
| `lib/utils/byteHelpers.ts` | BUG-G02: `byte & (1 << 2)` → `byte & 0x07` in `decodeStatus` |
| `lib/generations/gen2/parser.ts` | BUG-G03: `getPokedexFlagsGen2` now 1-indexed (added dummy `false` at index 0) |
| `lib/generations/gen3/entity.ts` | BUG-G3-01: replaced fixed-key XOR with LCRNG stream cipher (`lcrngNext` + advance-before-XOR) |
| `tests/statCalculator.test.ts` | Updated expected values (416→415, 407→406, 319→318) + added BUG-G01 regression test |
| `tests/gen2GenderShiny.test.ts` | Updated Pokédex flag tests to 1-indexed + updated Gen2 stat expected values |
| `tests/dataIntegrity.test.ts` | Updated Pokédex round-trip test to assert `read[id]` (not `read[id - 1]`) + `read[0]` is dummy |
| `tests/byteHelpers.test.ts` | Added BUG-G02 sleep counter regression tests (counters 1-3, 1-7, priority) |
| `tests/gen3Entity.test.ts` | Added BUG-G3-02 LCRNG correctness tests (BigInt reference, seed=0 anchor, non-zero plaintext) |

---

# BilKo's PC Reborn — P1 Bug Fixes

This document summarizes the P1 (Gen 3 readiness) bug fixes applied on top of the P0 build. All 477 tests pass (`npm test`), `npm run typecheck` is clean, and `npm run lint` reports 0 errors.

## P1 Fixes Applied

### BUG-G04 — `convertSpeciesId` returned source speciesId for Gen 3+ targets

**File:** `lib/utils/crossGenConverter.ts`

**Before:** For any `toGen >= 3`, the function returned the source `speciesId` unchanged. This would silently corrupt Gen 1 → Gen 3 transfers (a Gen 1 Pikachu has `speciesId=84` internally; returning 84 as the Gen 3 speciesId would point at a completely different Pokémon).

**After:** Added a Gen 3 branch that uses the National Dex ID as the Gen 3 internal speciesId (verified against PKHeX `PersonalTable.RS` — internal index == dexId for species 1..386) and rejects anything outside the Gen 3 dex range.

**Tests added:** `tests/crossGenTransfer.test.ts` — `BUG-G04 fix: uses National Dex id for Gen 3 targets`, `BUG-G04 fix: rejects dex out of Gen 3 range (1..386)`.

---

### BUG-G05 — `canTransferToGen` always returned `true` for Gen 3+

**File:** `lib/utils/crossGenConverter.ts`

**Before:** Returned `true` for any `dexId` when `targetGen >= 3`. A Gen 4 Leafeon (#470) would be silently allowed into a Gen 3 transfer (max 386), producing an invalid Pokémon.

**After:** Added a Gen 3 branch that gates to `dexId >= 1 && dexId <= 386`. Also changed the default for unknown generations from `true` to `false` (safer to reject than silently corrupt). The species-range gate also now runs in `convertPokemonForTransfer` before the adapter lookup, so Gen 4+ species get a specific error message.

**Tests added:** `tests/crossGenTransfer.test.ts` — `BUG-G05 fix: gates Gen 3 to dex 1..386`, `BUG-G05 fix: returns false for unknown generations (safe default)`, `BUG-G05 fix: rejects Gen 4+ species before the adapter lookup (specific error)`.

---

### BUG-G3-03 — `convertPokemonForTransfer` didn't construct `Gen3Extension`

**File:** `lib/utils/crossGenConverter.ts`

**Before:** No branch for transfers into Gen 3. A Gen 2 → Gen 3 transfer would leave the stale `Gen2Extension` attached (with DV-based fields) and never construct a `Gen3Extension` carrying `abilityId`, `natureId`, `secretId`, `ribbons`, or `contestStats`.

**After:** Added a Gen 3 transfer branch that:
- Synthesizes a deterministic PID from TID + dexId (if the source has no PID).
- Pads DVs (0-15) to Gen 3 IVs (0-31) using the standard DV→IV padding.
- Caps StatExp (0-65535) to Gen 3 EVs (0-255 per stat).
- Derives nature, ability slot, and gender from the synthesized PID via the new helpers in `identity.ts`.
- Constructs a fresh `Gen3Extension` with all Gen 3-specific fields.
- Resets the held item (Gen 3 uses a different item ID table).
- Documents all changes in `getTransferImpactDescription` so the UI can warn the user.

**Tests added:** `tests/crossGenTransfer.test.ts` — `BUG-G3-03: Gen 3 transfer handling` (4 tests covering graceful refusal, species gating, and impact descriptions).

---

### BUG-G3-04 — No Gen 3 stat calculator

**File:** `lib/generations/gen3/statCalculator.ts` (new file)

**Before:** The shared `calculateGen1Stat` and `recalculateStats` use the Gen 1/2 stat-exp formula (`floor(sqrt(StatExp)/4)`), which is wrong for Gen 3. Gen 3 uses `floor(EV/4)` and a nature modifier (×1.1 boost, ×0.9 nerf). No Gen 3 stat calculator file existed.

**After:** Created `lib/generations/gen3/statCalculator.ts` with:
- `calculateGen3Stat(base, iv, ev, level, isHp, natureMod)` — the Gen 3 formula, with EV clamping to 0-255 and IV masking to 5 bits.
- `recalculateGen3Stats(mon, baseStats)` — mirrors the structure of `recalculateGen2Stats` but uses the Gen 3 formula and nature modifiers. Derives nature from `mon.pid`, deep-clones iv/ev, heals HP to max, and mirrors `special` from `spAtk` for UI compatibility. Handles `pid=0` (uninitialized) as Hardy (neutral).

A future `Gen3Adapter.recalculateStats()` should delegate to this function.

**Tests added:** `tests/gen3StatCalculator.test.ts` (new file) — 12 tests covering the Gen 3 formula (HP, non-HP, nature boost/nerf, EV clamping, IV masking, level 5 Bulbasaur) and `recalculateGen3Stats` (full Mewtwo stat block, Modest nature, auto-heal, deep-clone, `special` mirroring, PID=0 fallback, Gen 1/2 divergence regression).

---

### BUG-G3-05 — Missing PID interpretation helpers

**File:** `lib/generations/gen3/identity.ts`

**Before:** Only had TID/SID + shininess helpers. Missing: nature, ability slot, gender, Unown form, Wurmple evolution, and 5-bit IV extraction — all needed by any Gen 3 parser/UI.

**After:** Added:
- `NATURE_NAMES` (25 canonical names), `NATURE_NEUTRAL`/`NATURE_BOOST`/`NATURE_NERF` constants.
- `getNatureId(pid)` = `PID % 25`.
- `getNatureName(pid)` — returns one of the 25 names.
- `getNatureModifier(natureId, stat)` — returns 1.1/0.9/1.0, with the diagonal (Hardy/Docile/Serious/Bashful/Quirky) correctly handled as neutral for ALL stats.
- `getAbilitySlot(pid)` = `(PID >> 16) & 1`.
- `getGenderFromPidByThreshold(pid, threshold)` and `getGenderFromPid(pid, dexId)` — Gen 3 gender rule with a built-in species threshold table (100% male, 87.5% male, 75% male, 50/50, 25% male, 100% female, genderless) for all 386 Gen 3 species.
- `getUnownFormLetterGen3(pid)` — 28-form Unown derivation (A-Z, ?, !).
- `getWurmpleEvolution(pid)` — Silcoon vs Cascoon branch.
- `extractGen3IVs(iv32)` / `packGen3IVs(ivs)` — 5-bit IV extraction/packing from the 32-bit IV word (HP bits 0-4, Atk 5-9, Def 10-14, Spe 15-19, SpA 20-24, SpD 25-29).

**Bug found during testing:** The initial `getNatureModifier` returned `NATURE_BOOST` for diagonal natures (Hardy boosting Attack) because it checked `statIndex === boosted` before handling the diagonal case. Fixed by checking `boosted === reduced` first.

**Tests added:** `tests/gen3Identity.test.ts` — 18 new tests covering nature ID/name/modifier (including diagonal neutrality), ability slot (bit 16 only, not bit 19), gender (all 7 threshold cases + species lookups + unknown default), Unown form, Wurmple evolution, and IV extraction/packing (round-trip + 5-bit masking).

---

### BUG-G06 — Volbeat growth rate was `Erratic`, should be `Fluctuating`

**File:** `lib/utils/experience.ts:179`

**Before:** `313: 'Erratic', 314: 'Fluctuating'` — Volbeat (#313) was incorrectly listed as `Erratic`.

**After:** `313: 'Fluctuating', 314: 'Fluctuating'` — both Volbeat and Illumise are `Fluctuating` (verified against Bulbapedia and PKHeX's `PersonalTable.RS`).

**Tests added:** `tests/dataIntegrity.test.ts` — `BUG-G06 fix: Volbeat (#313) is Fluctuating, not Erratic`, `BUG-G06 fix: Volbeat and Illumise share the same growth rate`.

---

## Verification

```bash
npm test          # 477 passed (29 files) — was 428 before P1 fixes
npm run typecheck # clean (tsc --noEmit)
npm run lint      # 0 errors, 188 pre-existing warnings (none from these fixes)
```

## Files Changed (P1)

| File | Change |
|---|---|
| `lib/utils/experience.ts` | BUG-G06: Volbeat `'Erratic'` → `'Fluctuating'` |
| `lib/utils/crossGenConverter.ts` | BUG-G04: added Gen 3 branch to `convertSpeciesId` (uses dexId, gates 1..386). BUG-G05: added Gen 3 range check to `canTransferToGen` + `convertPokemonForTransfer`, safe `false` default for unknown gens. BUG-G3-03: added Gen 3 transfer branch (synthesizes PID/SID, pads DVs→IVs, caps EVs, derives nature/ability/gender, constructs `Gen3Extension`, resets held item) + Gen 3 impact descriptions. |
| `lib/generations/gen3/identity.ts` | BUG-G3-05: added nature (names/ID/modifier with diagonal fix), ability slot, gender (threshold table for all 386 species), Unown form, Wurmple evolution, and IV extraction/packing helpers. |
| `lib/generations/gen3/statCalculator.ts` | BUG-G3-04: new file — `calculateGen3Stat` + `recalculateGen3Stats` using the Gen 3 formula (`floor(EV/4)` + nature modifier). |
| `tests/crossGenTransfer.test.ts` | Added BUG-G04, BUG-G05, BUG-G3-03 test blocks (10 new tests). |
| `tests/gen3Identity.test.ts` | Added BUG-G3-05 PID helper tests (18 new tests). |
| `tests/gen3StatCalculator.test.ts` | New file — BUG-G3-04 Gen 3 stat calculator tests (12 new tests). |
| `tests/dataIntegrity.test.ts` | Added BUG-G06 Volbeat growth rate tests (2 new tests). |

**Total new tests: 49** (428 → 477).

---

# BilKo's PC Reborn — P2 Bug Fixes

This document summarizes the P2 (React / state management) bug fixes applied on top of the P1 build. All 485 tests pass (`npm test`), `npm run typecheck` is clean, and `npm run lint` reports 0 errors.

## P2 Fixes Applied

### BUG-G07 — `SaveContext` did not reset `adapter` when `data.generation` changed

**File:** `context/SaveContext.tsx`

**Before:** When the `data` prop changed to a save with a different generation (e.g., user opens a Gen 2 save after a Gen 1 save in the same session), `adapter` still held the previous adapter. The load effect re-ran (because `data.generation` changed) but the `if (adapter) return;` guard exited immediately, so the new generation's adapter never loaded. Every Gen 2-specific operation (stat calculation, types, dex max, sprite resolution) ran through the wrong adapter.

**After:** Added a `prevGenerationRef` that tracks the previous `data.generation`. A new effect detects when the generation changes and resets `adapter`/`adapterLoading` to the synchronous-or-undefined state, which re-triggers the existing async load effect. The ref-based approach avoids an extra render cycle and is safe under React 18 strict mode (the ref is idempotent).

**Tests added:** `tests/p2ContextFixes.test.tsx` — `loads the Gen 1 adapter for a Gen 1 save`, `loads the Gen 2 adapter for a Gen 2 save`, `BUG-G07 fix: switches adapter when the save generation changes` (the core regression test that swaps a Gen 1 save for a Gen 2 save and asserts the adapter follows).

---

### BUG-G08 — `ThemeContext` value was not memoized

**File:** `context/ThemeContext.tsx`

**Before:** The context value object `{ mode, toggleMode, theme, setTheme, activeGameId, setActiveGameId, getGameTheme }` was recreated on every render, and `toggleMode`/`getGameTheme` were inline arrow functions (new identity each render). This caused **all consumers** of `useTheme()` (Header, PCStorage, PartyList, PokemonSprite, etc.) to re-render on every provider state change, even when nothing they cared about had actually changed.

**After:** Wrapped `toggleMode` and `getGameTheme` in `useCallback` so their identities are stable, and wrapped the context value in `useMemo` keyed on `[mode, toggleMode, theme, activeGameId, getGameTheme]`. Consumers now only re-render when one of those values actually changes.

**Tests added:** `tests/p2ContextFixes.test.tsx` — `toggleMode identity is stable across renders (useCallback)`, `value identity is stable when state is unchanged`.

---

### BUG-G09 — `SpriteContext` value was not memoized

**File:** `context/SpriteContext.tsx`

**Before:** Same issue as BUG-G08. The value `{ mode, setMode }` was recreated on every render, and `setMode` was an inline arrow function (new identity each render). All consumers of `useSpriteMode()` re-rendered on every provider state change.

**After:** Wrapped `setMode` in `useCallback` (empty deps — `setModeState` from `useState` is already stable) and wrapped the context value in `useMemo` keyed on `[mode, setMode]`.

**Tests added:** `tests/p2ContextFixes.test.tsx` — `setMode identity is stable across renders (useCallback)`, `value identity is stable when mode is unchanged`, `value reflects mode changes (setMode propagates to consumers)`.

---

### UX-R02 — `Pokedex.tsx` local state didn't sync with prop changes

**File:** `components/editor/Pokedex.tsx`

**Before:** Two bugs in the Pokedex component's state management:
1. `useState([...data.pokedexOwnedFlags])` initialized from props but never updated when `data.pokedexOwnedFlags` changed (e.g., user loads a different save tab or the parent re-parses). The Pokedex kept showing the OLD save's caught/seen state after the user switched saves.
2. The `useEffect` that calls `onUpdate` didn't include `onUpdate` in its dependency array (stale closure risk) and fired on initial mount (unnecessary save update — the parent already had those values, it passed them to us).

**After:**
- Added a sync effect that watches `data.pokedexOwnedFlags`/`data.pokedexSeenFlags` identity and re-copies them into local state when they change. Uses `useRef` to track the last-synced reference so it only fires on actual identity changes (not every render).
- Added `onUpdate` to the `onUpdate`-calling effect's dependency array (fixes the stale closure).
- Added a `didMountRef` to skip the initial mount so we don't trigger an unnecessary save update on first render.

**Tests:** The Pokedex component is deeply coupled to the adapter and save context, so it's not unit-tested in isolation here. The fix is covered by manual verification and the existing integration tests (which still pass). The pattern (sync effect + mount-skip ref) is the same one used in the broader React ecosystem for "derived state that needs to reset when props change" (see the React docs' "You Might Not Need an Effect" → "Adjusting some state when a prop changes" guidance).

---

## Verification

```bash
npm test          # 485 passed (30 files) — was 477 before P2 fixes
npm run typecheck # clean (tsc --noEmit)
npm run lint      # 0 errors, 188 pre-existing warnings (none from these fixes)
```

## Files Changed (P2)

| File | Change |
|---|---|
| `context/SaveContext.tsx` | BUG-G07: added `prevGenerationRef` + effect that resets `adapter`/`adapterLoading` when `data.generation` changes, re-triggering the async load. |
| `context/ThemeContext.tsx` | BUG-G08: wrapped `toggleMode`/`getGameTheme` in `useCallback` + memoized the context value with `useMemo`. |
| `context/SpriteContext.tsx` | BUG-G09: wrapped `setMode` in `useCallback` + memoized the context value with `useMemo`. |
| `components/editor/Pokedex.tsx` | UX-R02: added prop-sync effect (re-copies flags when `data` identity changes) + `onUpdate` dep + mount-skip ref. |
| `tests/p2ContextFixes.test.tsx` | New file — 8 tests covering BUG-G07 (adapter reset), BUG-G08 (Theme memoization), BUG-G09 (Sprite memoization). |

**Total new tests: 8** (477 → 485).


---

# BilKo's PC Reborn — P3 Bug Fixes

This document summarizes the P3 (UI/UX and accessibility) bug fixes applied on top of the P2 build. All 485 tests pass (`npm test`), `npm run typecheck` is clean, and `npm run lint` reports 0 errors.

## P3 Fixes Applied

### UX-A01 — Toast had no ARIA live region
**File:** `components/ui/Toast.tsx`
Added `role="status"`, `aria-live="polite"`, `aria-atomic="true"` so screen readers announce toast messages. Previously toasts were visually visible but completely silent to assistive technology.

### UX-A02 — Autocomplete had no combobox ARIA semantics
**File:** `components/ui/Autocomplete.tsx`
Added `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant` to the input; `role="listbox"` to the dropdown; `role="option"` + `aria-selected` to each option; `aria-label` for the input + clear button. Also clamped `highlightIndex` when the filtered list shrinks so the highlight never points past the end.

### UX-A03 — PokemonSprite alt text not descriptive
**File:** `components/ui/PokemonSprite.tsx`
Alt text now conveys shiny/egg state (e.g., "Shiny Pikachu sprite" or "Pikachu egg" instead of just "Pikachu"). Added `role="img"` + `aria-label="Shiny"` to the shiny overlay badge.

### UX-A04 — Icon-only buttons missing tooltips
**File:** `components/layout/Header.tsx`
Added `title` attributes to the dark-mode toggle, settings, and menu buttons so sighted users get hover tooltips explaining what each icon does.

### UX-A05 — DropZone not keyboard-accessible
**File:** `components/home/DropZone.tsx`
Added `tabIndex`, `onKeyDown` (Enter/Space triggers the file picker), `aria-label`, `aria-disabled`, and a focus-visible ring. Used `tabIndex` + `onKeyDown` instead of `role="button"` to avoid axe's `nested-interactive` violation (the div contains a hidden `<input type="file">`).

### UX-A06 — Move Mode not documented as keyboard DnD alternative
**File:** `components/editor/PCStorage.tsx`
Updated the Move Mode toggle button's `title` and added `aria-label` + `aria-pressed` to document that Move Mode (click-to-select, click-to-target) is the keyboard-accessible alternative to drag-and-drop.

### UX-T01 — Hardcoded colors instead of theme tokens
**File:** `components/ui/Toast.tsx`
Migrated the hardcoded `bg-gray-900 text-white` to `bg-theme-primary text-theme-text-on-primary` so the toast respects the active game's theme color.

### UX-U01 — Broken GitHub links
**File:** `components/layout/Header.tsx`
Corrected both links from `BilKos-PC` to `BilKos-PC-Reborn` (the actual repo name). Both were 404.

### UX-U02 — Hero copy said "Gen 1 Save Editor"
**File:** `components/home/Hero.tsx`
Updated to "The ultimate Gen 1 & 2 Save Editor." The app supports both Gen 1 (R/B/Y) and Gen 2 (G/S/C); the old copy undersold the Gen 2 support.

### UX-U05 — Tab close always showed unsaved-changes warning
**File:** `App.tsx`
`initiateCloseTab` now checks `tab.isDirty` — clean tabs close immediately; only dirty tabs show the Save/Discard/Cancel confirmation. Previously the modal popped up for every tab close, training users to dismiss it without reading.

### UX-U06 — No React error boundary
**Files:** `components/editor/ErrorBoundary.tsx` (new), `App.tsx`
Created an `ErrorBoundary` class component and wrapped the `EditorDashboard` with it. A render-time crash in any child now shows a recovery UI ("Something went wrong" + error details + "Reload Save" button) instead of a white screen. The boundary is keyed by `activeTab.id` so switching tabs resets its error state.

### UX-U09 — No lazy loading for sprites
**File:** `components/ui/PokemonSprite.tsx`
Defaulted `loading` to `'lazy'` so pages with many sprites (PC boxes, Pokedex, encounters) don't fire 100+ simultaneous image requests. Callers can still override with `loading="eager"` for above-the-fold sprites.

## Verification

```bash
npm test          # 485 passed (30 files)
npm run typecheck # clean (tsc --noEmit)
npm run lint      # 0 errors, 188 pre-existing warnings
```

## Files Changed (P3)

| File | Change |
|---|---|
| `components/ui/Toast.tsx` | UX-A01: aria-live + UX-T01: theme tokens |
| `components/ui/Autocomplete.tsx` | UX-A02: combobox ARIA + highlightIndex clamp |
| `components/ui/PokemonSprite.tsx` | UX-A03: descriptive alt + UX-U09: default lazy loading |
| `components/layout/Header.tsx` | UX-A04: title tooltips + UX-U01: GitHub link fix |
| `components/home/DropZone.tsx` | UX-A05: keyboard accessibility |
| `components/editor/PCStorage.tsx` | UX-A06: Move Mode docs + aria-pressed |
| `components/home/Hero.tsx` | UX-U02: "Gen 1 & 2" copy fix |
| `App.tsx` | UX-U05: dirty-check on tab close + UX-U06: ErrorBoundary wrapper |
| `components/editor/ErrorBoundary.tsx` | UX-U06: new error boundary component |

---

# BilKo's PC Reborn — P4 Bug Fixes

This document summarizes the P4 (polish and minor bugs) fixes applied on top of the P3 build. All 485 tests pass (`npm test`), `npm run typecheck` is clean, and `npm run lint` reports 0 errors.

## P4 Fixes Applied

### BUG-G10 — Dead `theme`/`setTheme` state in ThemeContext
**Files:** `uiTypes.ts`, `context/ThemeContext.tsx`
Removed the `theme: ThemeColor` / `setTheme` fields from `ThemeContextType` and the corresponding `useState` in `ThemeProvider`. They were initialized to `'default'` and never read or written — the actual theming is driven entirely by `activeGameId` + CSS variables. `ThemeColor` is retained as a deprecated type for backward compatibility.

### BUG-G11 — Item/party counts not clamped to capacity in writers
**Files:** `lib/generations/gen1/writer.ts`, `lib/generations/gen2/writer.ts`
- Gen 1 `writeItems`: clamped count byte to `Math.min(items.length, maxCapacity)`.
- Gen 1 party species list: clamped to `Math.min(save.party.length, 6)`.
- Gen 2 `writeInventoryPocketGen2`: documented the existing clamp (already present via `Math.min`).
A corrupted or hand-edited model with too many items/party mons can no longer write a count byte larger than the number of structs that follow.

### BUG-G12 — Level/exp not clamped to Gen 1/2 ranges in writers
**Files:** `lib/generations/gen1/writer.ts`, `lib/generations/gen2/writer.ts`
- Level: clamped to `Math.max(1, Math.min(mon.level, 100))` in both Gen 1 (`writePokemonStruct` box + party bytes) and Gen 2 (`writeGen2PokemonStruct`).
- Exp: clamped to `Math.max(0, Math.min(mon.exp, 0xFFFFFF))` (24-bit max = 16,777,215) in both writers.
A model with level > 100 or exp > 0xFFFFFF would have written garbage that the game interprets incorrectly.

### BUG-G13 — `pikachuSurfScore` write not gated on Yellow
**File:** `lib/generations/gen1/writer.ts`
Wrapped the Surfing Pikachu score write in `if (save.gameVersion === 'Yellow')`. The parser only reads it for Yellow, but the old writer wrote it whenever `pikachuSurfScore` was set — so a Red/Blue save loaded after a Yellow save in the same session would have the stale score written to offset 0x2741 (unused in R/B but a latent corruption risk for ROM hacks).

### BUG-G14 — `detectGen1Region` defaulted to International for empty parties
**File:** `lib/generations/gen1/data/offsets.ts`
Added an empty-party fallback: when both party checks fail (count=0 at both offsets), the function now checks the trainer-name bytes at the Japanese (0x2ED7) vs International (0x2F2E) offsets. A valid Game Boy text name (non-zero, non-0xFF, with a 0x50 terminator) at one region but not the other is a reliable region signal. A real Japanese save with an empty party is no longer misdetected as International.

### BUG-G15 — `currentBoxId` writer always set bit 7
**File:** `lib/generations/gen1/writer.ts`
Changed `(save.currentBoxId & 0x7F) | 0x80` to `save.currentBoxId & 0x7F`. PKHeX writes just `value & 0x7F` — bit 7 is the "box contents modified, flush to SRAM" flag, and setting it on every write forces the game to re-flush the active box on next load.

### BUG-G16 — Gen 1 `parseOptions` sound semantics mixed Gen 1 and Gen 2
**Files:** `lib/generations/gen1/parser.ts`, `lib/generations/gen1/writer.ts`
Gen 1 uses a single bit (bit 3) for sound: 0=Mono, 1=Stereo. The Earphone1/2/3 options (bits 4-5) are Gen 2-only. The old parser read bits 4-5 and mapped them to Earphone1/2/3, then used a fragile heuristic to recover Stereo. The old writer mapped 'Stereo' to 0x10 (bit 4, wrong bit). Both now correctly use bit 3 only. Earphone1/2/3 values from a cross-gen transfer are silently downgraded to Mono (they don't exist in Gen 1).

### BUG-G2-02 — Gen 2 Unown form formula used modulo instead of integer division
**Files:** `lib/generations/gen2/parser.ts`, `lib/sprites.ts`
The old code computed `letter_index = combined % 26`. The Bulbapedia-documented formula (verified against the pokegold disassembly and PKHeX) is `letter_index = floor(combined / 10)`, which maps 0-9→A, 10-19→B, ..., 250-255→Z. The modulo formula happened to produce 26 distinct values but they didn't match the on-cartridge letter for any given DV set. Fixed in `getGen2UnownFormLetter` (parser), `getUnownFormLetter` (sprites), and the `letterOf` inner function in `setUnownFormDVs` (sprites).

### UX-T03 — Theme switching caused flash of unstyled content (FOUC)
**File:** `index.html`
Added a tiny synchronous pre-hydration script in `<head>` that reads `localStorage.getItem('themeMode')` and adds the `dark` class to `<html>` BEFORE React mounts. Users with saved mode='dark' now see a dark first paint instead of a flash of light content.

### UX-T04 — No warning when active game theme is unknown
**File:** `context/ThemeContext.tsx`
Added a `console.warn` when `activeGameId` is set but no matching game is found in `pokemonGames`. Helps developers notice a missing theme registration before users see inconsistent colors.

### UX-T05 — PCStorage version colors hardcoded, duplicating theme data
**File:** `components/editor/PCStorage.tsx`
Documented the duplication (the switch can't be replaced by `adapter.getTheme()` because Tailwind's JIT can't generate classes from runtime values). Changed the `default` case from always-blue to `ring-current`/`border-current` so unknown versions inherit the active game's theme color instead of always being blue.

### UX-V04 — Hero sprites caused cumulative layout shift (CLS)
**File:** `components/home/Hero.tsx`
Added `width`/`height` attributes to the Pikachu, Charizard, and Blastoise `<img>` tags so the browser reserves the box before the image loads.

### Cleanup — Removed unused eslint-disable directive
**File:** `tests/p2ContextFixes.test.tsx`
Removed the `/* eslint-disable react-hooks/rules-of-hooks, ... */` directive that became unnecessary after the P2 test refactor moved all mutations into `useEffect`.

## Verification

```bash
npm test          # 485 passed (30 files)
npm run typecheck # clean (tsc --noEmit)
npm run lint      # 0 errors, 187 pre-existing warnings
```

## Files Changed (P4)

| File | Change |
|---|---|
| `uiTypes.ts` | BUG-G10: removed `theme`/`setTheme` from `ThemeContextType`, deprecated `ThemeColor` |
| `context/ThemeContext.tsx` | BUG-G10: removed dead `theme`/`setTheme` state + UX-T04: unknown-theme console.warn |
| `lib/generations/gen1/writer.ts` | BUG-G11: clamp items/party counts + BUG-G12: clamp level/exp + BUG-G13: gate pikachuSurfScore on Yellow + BUG-G15: don't set bit 7 on currentBoxId + BUG-G16: sound bit 3 only |
| `lib/generations/gen2/writer.ts` | BUG-G11: document clamp + BUG-G12: clamp level/exp |
| `lib/generations/gen1/parser.ts` | BUG-G16: parseOptions sound bit 3 only |
| `lib/generations/gen1/data/offsets.ts` | BUG-G14: empty-party fallback in `detectGen1Region` |
| `lib/generations/gen2/parser.ts` | BUG-G2-02: Unown form `floor(combined/10)` not `% 26` |
| `lib/sprites.ts` | BUG-G2-02: same fix in `getUnownFormLetter` + `setUnownFormDVs` |
| `index.html` | UX-T03: pre-hydration dark-mode script |
| `components/editor/PCStorage.tsx` | UX-T05: `default` case uses `ring-current` + documented duplication |
| `components/home/Hero.tsx` | UX-V04: width/height on sprite imgs |
| `tests/p2ContextFixes.test.tsx` | Cleanup: removed unused eslint-disable |
