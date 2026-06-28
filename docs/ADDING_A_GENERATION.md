# Adding a Generation

> **Status:** This document describes the *intended* OCP-compliant process. The
> architectural audit (`download/ARCHITECTURAL_PROBLEMS.md`) found that the current
> codebase requires editing **more files than documented here** (themes, sprites,
> entity format detection, cross-gen converter). **Phase 1** of
> `download/ROADMAP_TO_PKHEX_PLUS.md` fixes these seams so this document becomes
> accurate. Until Phase 1 ships, treat the "Acceptance" section below as the
> target, not the current reality.

This is the canonical checklist for adding support for a new Pokémon generation
to BilKo's PC Reborn. It enumerates every file a new generation should touch
**after Phase 1 (Architectural Unification) is complete**.

The architecture goal is **Open/Closed**: adding a generation should be *additive* —
you create a new `lib/generations/genN/` folder and register it, **without editing
files under `lib/core/`, `components/`, `context/`, `data/`, or `lib/sprites.ts`**.
That invariant is enforced by `tests/scalabilityInvariant.test.ts`.

---

## 1. Create `lib/generations/genN/`

Mirror the Gen 2 layout (`lib/generations/gen2/`). Required modules:

| File | Responsibility |
| --- | --- |
| `GenNAdapter.ts` | The `IGenerationAdapter` implementation: capability flags, metadata, and the binary/stats/data/codec operations. This is the public face of the generation. |
| `parser.ts` | Raw bytes → `CanonicalPokemon` / `CanonicalSave`. |
| `writer.ts` | `CanonicalSave` → raw bytes, including checksum recomputation. Uses `BinaryWriter` (the standard writer idiom — see Phase 1.6). |
| `statCalculator.ts` | Stat formula for the generation (DV/IV → stats, EXP, etc.). |
| `StandaloneFormat.ts` | The `IStandalonePokemonFormat` for loose `.pkN` entity files (parse/create, and — for Gen 3+ — entity encryption). |
| `extensions.tsx` | Panel-section extensions registered via `registerGenNPanelExtensions()`, called from the adapter constructor. |
| `saveData.ts` | Save-level convenience methods (getBoxNames, getRivalName, etc.) — see Phase 1.8. **Not on the adapter itself.** |
| `data/*` | Pure data tables — see §2. |

### Adapter conventions worth copying
- Set **all capability flags** (`hasAbilities`, `hasNatures`, `hasRibbons`, `hasMetData`, `maxLevel`, `tmHmPocketLayout`, …). The UI branches on these named flags, never on `generation === N`.
- Register panel extensions from the **constructor** (`registerGenNPanelExtensions()`); the `ExtensionRegistry` dedupes by id.
- Implement `detectSave` as **size-gate, then a structural/checksum fingerprint** (PKHeX's pattern).
- Implement `detectRegion` for any localized layouts.
- **Do NOT add convenience methods to the adapter.** Put them in `saveData.ts` (Phase 1.8).

## 2. Add the data tables — `lib/generations/genN/data/`

These are pure data (the "add a generation ≈ add data" thesis). Required files:
`offsets.ts`, `baseStats.ts` (using the unified `BaseStats` shape — Phase 1.2),
`speciesNames.ts`, `moves.ts` (names + PP + type), `items.ts`, `types.ts`,
`pokedexEntries.ts`, `pokemonLocations.ts`, `events.ts`, `eventDistributions.ts`,
`themes.ts`, `sprites.ts` (version → sprite folder mapping — Phase 1.4),
`badges.ts` (Phase 0.2a re-adds per generation).

## 3. Register the adapter — `lib/core/AdapterRegistry.ts`

This is the **one** core file you append to (a registration line, not a behavioral edit):

```ts
registry.registerLazy(N, new LazyFactory(() =>
  import('../generations/genN/GenNAdapter').then(m => new m.GenNAdapter())
));
```

> After Phase 1.3, `data/games.ts` auto-aggregates themes from the registry, so
> **no edit to `data/games.ts` is needed**. Until then, you must add
> `...GENN_GAMES` to `data/games.ts` manually.

## 4. Add the canonical extension classes — `lib/canonicalModel.ts`

Each generation stores its gen-specific fields in the `genExtension` / save-`genExtension`
slot. Add:
- `class GenNExtension implements IGenExtension` (per-Pokémon extras),
- `class GenNSaveExtension implements ISaveExtension` (save-level extras),
- type guards `isGenNExtension()` / `isGenNSaveExtension()`.

Consumers access these via the type guards (never via `as` casts).

## 5. Theme + sprite data (OCP-compliant after Phase 1)

- **Theme palette:** add version entries in `genN/data/themes.ts`. After Phase 1.3,
  these auto-appear via `registry.getAllVersionThemes()` — no edit to `data/games.ts`.
- **Sprite folders:** add rows to `genN/data/sprites.ts` (Phase 1.4 moves the central
  `VERSION_SPRITE_MAP` out of `lib/sprites.ts` into per-generation files). Until Phase 1.4,
  you must add rows to `lib/sprites.ts` manually.

## 6. (Gen 3+) Text codec and entity encryption

- **Codec:** if the generation's character encoding differs (Gen 3 single-byte/`0xFF`
  terminator; Gen 4/5 16-bit; Gen 6+ UTF-16), implement an `ITextCodec` and expose it as
  `adapter.codec`. Gen 1/2 reuse the Game Boy codec.
- **Entity encryption (Gen 3+):** the standalone format must implement the block-shuffle +
  LCRNG stream cipher — `blockOrder = PID % 24`, LCRNG-XOR over the data region, refresh
  the 16-bit checksum before encrypt. Gen 1/2 entities are unencrypted (no-op).

## 7. (Gen 4+) Entity format detection

After Phase 1.5, the adapter declares `supportedEntitySizes: number[]` via
`IGenerationMetadata`, and `getEntityFormatByLength` queries the registry. Until then,
you must add a `case` to `lib/core/entityFormat.ts:114-134` manually.

---

## Acceptance / definition of done

1. `npx tsc --noEmit` is clean (the adapter fully implements `IGenerationAdapter`).
2. The generation registers and round-trips a real save (detect → parse → write → re-detect).
3. **No files under `lib/core/`, `components/`, `context/`, `data/`, or `lib/sprites.ts`
   changed** beyond the single `registerLazy(...)` line in step 3. *(Requires Phase 1.)*
4. `tests/scalabilityInvariant.test.ts` still passes (the OCP guard).
5. Add generation-specific round-trip + data-integrity tests mirroring
   `tests/populatedRoundTrip.test.ts` and `tests/dataIntegrity.test.ts`.

> **Validation caveat:** for offset-sensitive work (mail layouts, region variants, new
> entity encryption), validate against a **real save fixture** before shipping a writer.
> Writing speculative offsets can corrupt users' saves on export — prefer a read-only
> viewer first.
