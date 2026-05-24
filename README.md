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

## Architecture

Three-pillar design following the **Open-Closed Principle**:

1. **Generation Adapter Pattern** — `IGenerationAdapter` with sub-interfaces. Add generations by creating adapters.
2. **Canonical Data Model (CDM)** — `CanonicalPokemon`/`CanonicalSave` with `genExtension` for generation-specific data. The CDM is the single source of truth for all runtime data.
3. **Modular UI + React Context** — `SaveContext` eliminates prop drilling. Extension system injects generation-specific UI panels.

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
