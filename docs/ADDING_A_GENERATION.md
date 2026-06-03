# Adding a Generation

This is the canonical, code-verified checklist for adding support for a new Pokémon
generation (or a new game family) to BilKos-PC-Reborn. It enumerates **every file a new
generation touches today**, grounded in how Gen 1 and Gen 2 are actually implemented.

The architecture goal is **Open/Closed**: adding a generation should be *additive* — you
create a new `lib/generations/genN/` folder and register it, **without editing files under
`lib/core/`, `components/`, or `context/`**. That invariant is enforced by an executable
test: `tests/scalabilityInvariant.test.ts` registers a throwaway "Gen 99" dummy adapter
through the public APIs and asserts the full lifecycle (detect → parse → write → sprites →
theme → panel-extension injection) works with no core edits. If you find yourself needing
to edit a core file to add a generation, that file is the real scalability blocker — fix it
there (and extend the invariant test), rather than special-casing your generation.

---

## 1. Create `lib/generations/genN/`

Mirror the Gen 2 layout (`lib/generations/gen2/`). Required modules:

| File | Responsibility |
| --- | --- |
| `GenNAdapter.ts` | The `IGenerationAdapter` implementation: capability flags, metadata, and the binary/stats/data/codec operations. This is the public face of the generation. |
| `parser.ts` | Raw bytes → `CanonicalPokemon` / `CanonicalSave`. |
| `writer.ts` | `CanonicalSave` → raw bytes, including checksum recomputation. |
| `statCalculator.ts` | Stat formula for the generation (DV/IV → stats, EXP, etc.). |
| `StandaloneFormat.ts` | The `IStandalonePokemonFormat` for loose `.pkN` entity files (parse/create, and — for Gen 3+ — entity encryption; see §6). |
| `extensions.tsx` | Panel-section extensions (e.g. held-item, shiny, gender) registered via `registerGenNPanelExtensions()`, called from the adapter constructor. |
| `data/*` | Pure data tables — see §2. |

### Adapter conventions worth copying
- Set **all capability flags** (`hasAbilities`, `hasNatures`, `hasRibbons`, `hasMetData`,
  `maxLevel`, `tmHmPocketLayout`, …). The UI branches on these named flags, never on
  `generation === N`. See `IGenerationAdapter` for the full list.
- Register panel extensions from the **constructor** (`registerGenNPanelExtensions()`); the
  `ExtensionRegistry` dedupes by id, so this is idempotent and robust across hot-reload/tests.
- Implement `detectSave` as **size-gate, then a structural/checksum fingerprint** (PKHeX's
  pattern). Accept the save if the region's checksum validates; fail closed otherwise.
- Implement `detectRegion` for any localized layouts (see Gen 1 INT vs JP).

## 2. Add the data tables — `lib/generations/genN/data/`

These are pure data (the "add a generation ≈ add data" thesis). Gen 2 ships:
`offsets.ts`, `baseStats.ts`, `constants.ts` (names/moves/items), `moveData.ts` (PP/type),
`types.ts` (type chart), `pokedexEntries.ts`, `pokemonLocations.ts`, `events.ts`,
`eventDistributions.ts`. Add only what the generation needs.

## 3. Register the adapter — `lib/core/AdapterRegistry.ts`

This is the **one** core file you append to (a registration line, not a behavioral edit).
Follow the lazy-factory pattern so Vite code-splits the generation into its own chunk:

```ts
registry.registerLazy(N, new LazyFactory(() =>
  import('../generations/genN/GenNAdapter').then(m => new m.GenNAdapter())
));
```

> If adding this line is the *only* core edit required, the Open/Closed invariant holds.
> (The invariant test uses the public `registry.register(...)` directly and needs no edit here.)

## 4. Add the canonical extension classes — `lib/canonicalModel.ts`

Each generation stores its gen-specific fields in the `genExtension` / save-`genExtension`
slot. Add:
- `class GenNExtension implements IGenExtension` (per-Pokémon extras),
- `class GenNSaveExtension implements ISaveExtension` (save-level extras),
- type guards `isGenNExtension()` / `isGenNSaveExtension()`.

Consumers access these via the type guards (never via `as` casts), so the rest of the app
stays generation-agnostic.

## 5. Add theme + sprite data (OCP-compliant data additions)

- **Theme palette:** add the version entries in `data/games.ts`.
- **Sprite folders:** add rows to `VERSION_SPRITE_MAP` in `lib/sprites.ts` so the
  generation's game-specific sprite folders resolve. (1.6 tracks making these *fully*
  data-only so they're not even code edits.)

## 6. (Gen 3+) Text codec and entity encryption

- **Codec:** if the generation's character encoding differs (Gen 3 single-byte/`0xFF`
  terminator; Gen 4/5 16-bit; Gen 6+ UTF-16), implement an `ITextCodec` and expose it as
  `adapter.codec`. Gen 1/2 reuse the Game Boy codec.
- **Entity encryption (Gen 3+):** the standalone format must implement the block-shuffle +
  XOR scheme — `blockOrder = PID % 24`, LCG-XOR over the data region, refresh the 16-bit
  checksum before encrypt. This is the seam described in TODO 8.5.3; Gen 1/2 entities are
  unencrypted (no-op).

---

## Acceptance / definition of done

1. `npx tsc --noEmit` is clean (the adapter fully implements `IGenerationAdapter`).
2. The generation registers and round-trips a real save (detect → parse → write → re-detect).
3. **No files under `lib/core/`, `components/`, or `context/` changed** beyond the single
   `registerLazy(...)` line in step 3.
4. `tests/scalabilityInvariant.test.ts` still passes (the OCP guard).
5. Add generation-specific round-trip + data-integrity tests mirroring
   `tests/populatedRoundTrip.test.ts` and `tests/dataIntegrity.test.ts`.

> **Validation caveat:** for offset-sensitive work (mail layouts, region variants, new
> entity encryption), validate against a **real save fixture** before shipping a writer.
> Writing speculative offsets can corrupt users' saves on export — prefer a read-only
> viewer first. See TODO 5.4.
