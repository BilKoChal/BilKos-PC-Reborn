# BilKo's PC Reborn — Pokemon Save Editor

A web-based Pokemon save file editor supporting **Gen I** (R/B/Y) and **Gen II** (G/S/C) with modular, themable architecture. Built with React 18, TypeScript, and Vite 6.

## Key Features

- **Drag-and-drop save loading** — Drop `.sav` files to parse and open them
- **Multi-tab interface** — Work with multiple saves simultaneously
- **Cross-save Pokemon transfer** — Drag Pokemon between save file tabs with 400ms auto tab-switch on hover
- **Smart move mode** — Click to select, click target to swap/move. Ctrl/Shift for multi-select
- **Modern drag feedback** — Animated themed ring highlights, scale effects, shadow on drag-over
- **Full Pokemon editing** — Stats, moves, IVs, EVs, species, generation-aware panels
- **Game-themed UI** — Dynamic color palette matches loaded game version
- **Party & PC management** — Batch operations, sorting, visual box grid
- **Sprite mode selector** — Choose between Game Specific (default), Master, or Artwork sprites via the settings icon in the header. Changes apply instantly across all views (PC, Party, Pokedex, Hall of Fame, etc.)
- **Shiny sprite support** — Shiny Pokemon display their shiny sprites in all modes: artwork shiny, master shiny, and game-specific shiny (Gen 2+ games; Gen 1 falls back to master shiny)
- **Integer-scaled pixel art** — Small pixel sprites in the Pokédex detail panel use integer scaling (2x, 3x…) for sharp, crisp rendering instead of blurry interpolation
- **Smart encounters view** — The Encounter Database uses Master or Artwork sprites (not game-specific) since it displays cross-generation content

## Architecture

Three-pillar design following the **Open-Closed Principle**:

1. **Generation Adapter Pattern** — `IGenerationAdapter` with sub-interfaces. Add generations by creating adapters.
2. **Canonical Data Model (CDM)** — `CanonicalPokemon`/`CanonicalSave` with `genExtension` for generation-specific data. The CDM is the single source of truth for all runtime data.
3. **Modular UI + React Context** — `SaveContext` (`SaveProvider`) exposes the active save to deeply-nested components, and an extension system injects generation-specific UI panels. Migration is partial: `EditorDashboard` provides `SaveContext` but still passes some props down to its tab composers, so prop-drilling and context coexist today (full consolidation onto `SaveContext` is tracked as a follow-up).

### Canonical Data Model

The CDM defines two core types in `lib/canonicalModel.ts`:

- **`CanonicalPokemon`** — Universal fields (dexId, nickname, stats, types, moves, IVs/EVs) plus a `genExtension: IGenExtension | null` slot for generation-specific data.
- **`CanonicalSave`** — Universal save fields (trainer, party, PC boxes, items, pokedex) plus a `genExtension: ISaveExtension | null` slot.

**Backward compatibility**: `PokemonStats` and `ParsedSave` are type aliases for `CanonicalPokemon` and `CanonicalSave`, so all existing code continues to work without modification.

**Generation extensions**:
| Extension | Fields |
|---|---|
| `Gen1Extension` | catchRate, special (unified), pikachuFriendship, isParty, raw |
| `Gen2Extension` | heldItemId/Name, isShiny (DV), gender (DV), spAtk/spDef, friendship, pokerus |
| `Gen3Extension` | abilityId/Name, natureId/Name, ribbons, contestStats, secretId (stub) |

**Design rationale**: Universal fields (isShiny, gender, spAtk, etc.) exist both as flat first-class properties AND inside `genExtension`. This is intentional — flat fields provide O(1) UI access without type guards, while `genExtension` preserves generation-specific raw/metadata for binary round-tripping and future generation support.

**Adding a new generation**: Create a `GenNExtension` class, populate it in the parser, and register UI extensions. The `genExtension` slot is the ONLY place where generation-specific fields should live — never add optional fields directly to `CanonicalPokemon`. This ensures the "zero core modifications per generation" promise.

### Adapter-Driven Generation Metadata

UI components no longer contain hardcoded `generation === 1 / === 2` checks. Instead, each adapter declares generation facts through `IGenerationMetadata`:

| Property | Gen 1 | Gen 2 | Gen 3 | ... |
|---|:---:|:---:|:---:|:---:|
| `nationalDexMax` | 151 | 251 | 386 | ... |
| `hasSplitSpecial` | false | true | true | ... |
| `hasAbilities` | false | false | true | ... |
| `hasNatures` | false | false | true | ... |
| `hasGender` | false | true | true | ... |
| `hasMultiRegionBadges` | false | true | true | ... |
| `playTimeFormat` | text | clock | clock | ... |
| `getTrainerSpriteUrl()` | Red-gen1rb/Yellow-gen1 | Ethan/Kris-gen2 | Per-version | ... |

Data access methods like `getAllSpeciesNames()`, `getAllMoveNames()`, `getMoveBasePp()`, and `getAllItemNames()` provide list enumeration for Autocomplete dropdowns and Pokédex grids, so UI components never import generation-specific data modules directly.

**Open types**: `Generation` is `number` and `GameVersion` is `string` — widened from closed unions (`1 | 2` / `'Red' | 'Blue' | ...`) so that adding Gen 3+ does not produce compiler error cascades. Each adapter's `supportedVersions: string[]` provides runtime validation instead.

**Example**: `Pokedex.tsx` uses `adapter.nationalDexMax` and `adapter.getAllSpeciesNames()` — adding Gen 3 requires zero UI changes.

### Sprite System

All Pokemon and trainer sprite URLs are resolved centrally through `lib/sprites.ts` and the `SpriteContext`. Three sprite modes are available via the settings gear icon in the header:

| Mode | Pokemon Sprites | Shiny Sprites | Trainer Sprites | Rendering |
|---|---|---|---|---|
| **Game Specific** (default) | Version-specific pixel sprites (e.g. R/B Charizard, Yellow Pikachu) | Gen 2+: version-specific shiny (`generation-ii/gold/shiny/`); Gen 1: falls back to master shiny | Generation-suffixed trainer sprites (e.g. `red-gen1rb.png`, `ethan-gen2.png`) | `pixelated` |
| **Master** | Standard `sprites/pokemon/${id}.png` | `sprites/pokemon/shiny/${id}.png` | Non-suffixed trainer sprites (e.g. `red.png`, `ethan.png`) | `pixelated` |
| **Artwork** | `sprites/pokemon/other/official-artwork/${id}.png` | `sprites/pokemon/other/official-artwork/shiny/${id}.png` | Same as Master (no artwork trainers exist) | Smooth (no `pixelated`) |

**Shiny support**: `getPokemonSpriteUrl()` accepts an optional `isShiny` parameter. When true, it returns the shiny variant URL appropriate for the current mode. Gen 1 games have no game-specific shiny sprites on PokeAPI, so they fall back to the master shiny sprite.

**Integer scaling**: The `getIntegerScaleStyle()` helper computes integer multiples (2x, 3x…) of the 96x96px source sprite to fill large containers (e.g. the Pokédex detail panel) with sharp, pixel-perfect rendering instead of blurry interpolation. Artwork sprites are exempt — they're already high-res and use `object-fit: contain`.

**Smart mode resolution**: `getEffectiveSpriteMode()` allows specific views to opt out of game-specific sprites. The Encounter Database uses this since it displays cross-generation content where a single game version doesn't apply.

**Home page**: The hero section always uses static artwork sprites (Pikachu, Charizard, Blastoise) regardless of the user's sprite mode setting, providing a consistent branded appearance.

**Implementation**: Every component calls `getPokemonSpriteUrl(dexId, spriteMode, gameVersion, isShiny)` instead of constructing URLs inline. The `getSpriteImgClasses()` helper ensures artwork sprites (475x475+ px) scale down to fit the same containers as pixel sprites (96x96 px) using `object-contain` and removing the `pixelated` CSS class. The `SpriteContext` persists the user's choice to `localStorage` and changes propagate instantly to all views.

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the dev workflow, the architecture/scalability rules, and — important for a save editor — **save-file provenance & privacy** guidance (please don't attach real saves to public issues). Bug reports use the issue template, which asks for save *provenance* rather than the save itself.

## Testing

The project has an extensive vitest suite (**300+ tests**) run with `npm test`. Coverage includes round-trip identity (a fully-populated party/box Pokémon survives write→re-parse for both gens), the scalability invariant (a dummy "Gen 99" adapter runs the full lifecycle through public APIs only), data integrity (TM/HM tables, item-name→sprite slugs, codec-region wiring), cross-gen transfer, Pokédex completeness, stat calculators, gender/shiny DV buckets, text codecs, entity block-shuffle, and save-wrapper detection.

```bash
npm test          # run the full suite
npm run typecheck # tsc --noEmit
```

## Generation Extensibility (Gen 3+ readiness)

Adding a generation is additive — see **`docs/ADDING_A_GENERATION.md`** for the full checklist. The seams Gen 3+ will plug into already exist and are tested: lazy adapter registry (`registry.registerLazy(...)`), adapter-owned data (version themes, capability flags, `inventoryLayout`), the standalone entity-format contract (`decryptBlock`/`encryptBlock` + `lib/core/entityFormat.ts` block-shuffle), first-class `recomputeChecksums(buffer)`, and the `lib/core/saveWrappers.ts` detection waterfall.

## Quick Start

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # Production build
```

## Supported Games

| Gen | Versions | Status |
|:---:|---|:---:|
| I | Red, Blue, Yellow | Supported |
| II | Gold, Silver, Crystal | Supported |
| III+ | Ruby through Violet | Planned |

## License

Open source. See repository for details.
