# BilKo's PC Save Editor: Multi-Generation Architecture Roadmap

This document outlines a **3-Phase Architecture Roadmap** to refactor BilKo's PC Pokemon Save Editor from a Generation 1-only structure into a modular, multi-generation, and highly extensible platform. 

The goal of this architecture is to adhere to the core software construction principle: **The Open-Closed Principle (OCP)**. Adding support for future generations (Gen II - Gen IX) should only require adding new files under a generation-specific namespace and registering them with a central registry, requiring **zero modifications** to the core editor layout, state engines, or dashboard orchestration logic.

---

## Current Status (kept in sync with `TODO.md`)

**All three phases below are complete and shipped.** Gen I and Gen II are fully supported (parse/edit/write, validated by a 300+ test vitest suite). The project is now in a **hardening + Gen 3+ preparation** phase: entity block-shuffle seam, save-wrapper detection waterfall, first-class `recomputeChecksums`, standalone-format crypto/geometry contract, adapter-driven `inventoryLayout`, data audits, and the OCP scalability-invariant test. The main known gap is consolidating the dashboard fully onto `SaveContext` (prop-drilling and context currently coexist). See `docs/ADDING_A_GENERATION.md` and `TODO.md`.

---

## Technical Architecture Overview

The multi-generational architecture is built on three pillars:
1. **Generation Adapter Pattern**: A unified, interface-driven dispatch layer (`IGenerationAdapter`) that hides binary offsets, stat calculation logic, checksum rules, and encoding differences.
2. **Canonical Data Model (`CDM`)**: A single, runtime-safe representation of saves (`CanonicalSave`) and Pokémon (`CanonicalPokemon`) with **generation-specific extension objects** (`genExtension`) for fields that only exist in certain eras (e.g., held items in Gen 2+, abilities in Gen 3+).
3. **Modular and Extensible UI (Component Panels)**: Extracting monolithic React views in `EditorDashboard.tsx` and `PokemonEditorModal.tsx` into small, reusable *Component Panels* (e.g. `PokemonInfoPanel`, `PokemonStatsPanel`) that automatically render generation-specific sections by querying the active Pokémon’s `genExtension`.

```
                    ┌────────────────────────────┐
                    │      React Client UI       │
                    │   (Tabs / Modals / Panels) │
                    └─────────────┬──────────────┘
                                  │ Operates on CDM
                                  ▼
                   ┌──────────────────────────────┐
                   │    Adapter Registry / Mgr    │
                   └──────────────┬───────────────┘
                                  │ Decides Active Generation
                                  ▼
                    ┌────────────────────────────┐
                    │    IGenerationAdapter      │
                    │  (Common Generation API)   │
                    └────────┬────────────┬──────┘
                             │            │
            ┌────────────────┴┐          ┌┴────────────────┐
            │   Gen1Adapter   │          │   Gen2Adapter   │
            │  (Gen I engine) │          │ (Gen II engine) │
            └─────────────────┘          └─────────────────┘
```

---

## 3-Phase Implementation Road Map

```
  PHASE 1: Foundations & Abstractions  ──►  PHASE 2: UI Panel Decomposition  ──►  PHASE 3: Gen 2 Support & Validation
  (Est: Low-Medium Effort)                  (Est: Medium-High Effort)              (Est: High Effort)
  • Define core IGenerationAdapter          • Extract sub-panels of components     • Implement Gen 2 binary parsing/writing
  • Map type-safe CanonicalSave & Pokémon  • Implement Panel Extension Pattern   • Create SpAtk/SpDef stat calculator
  • Implement Adapter Registry & Solver     • Build clean component tabs           • Register Gen 2 extension hooks
  ** NO VISUAL BEHAVIOR CHANGES **          ** CLEAN DIRECTORY RESTRUCTURING **    ** FULL END-TO-END VALIDATION **
```

### Phase 1: Foundations, Core Abstractions & CDM
Phase 1 focuses on building the type system, base interfaces, and registry. We wrap our existing Generation 1 logic into the new interface structure. Output must work exactly as before, with no visible changes to the end-user, but all operations will route through the adapter instead of hardcoded dependencies.

#### Task 1.1: Define Core Interfaces (`/lib/interfaces.ts`)
Create a compile-time safe TypeScript interface definition:
*   `IGenerationAdapter`: Methods for detecting, parsing, and writing saves. Methods for calculating stats, looking up species names, and encoding strings.
*   `IPanelExtension<T>` and `ISectionExtension<T>`: Hooks allowing UI panels to query and append inputs or badges based on active structures.

#### Task 1.2: Implement the Canonical Data Model (`/lib/canonicalModel.ts`)
Refactor the save model into an unified architecture:
*   `CanonicalPokemon`: Contains fields universal to every generation (National Dex ID, nickname, original trainer ID, moves, level, standard IVs, EVs, stats, status, current HP). Appends `genExtension: GenExtension | null` to contain additional attributes.
*   `CanonicalSave`: Contains unified fields (trainer metadata, party, PC boxes, pokedex counts, event flags, raw data buffer). Appends `genExtension: SaveExtension | null`.
*   `Gen1Extension`: Implements Gen-specific details: `catchRate`, unified `special` stat, and `pikachuFriendship` (Yellow only).

#### Task 1.3: Create Gen 1 Adapter & Registry
*   Extract the core Gen 1 parsing and writing routines from `/lib/parser/index.ts` and `/lib/writer/gen1.ts` to form `Gen1Adapter.ts`.
*   Create `AdapterRegistry.ts` which routes buffer parsing requests to registered adapters, executing a cascading `.detectSave(buffer)` test.

#### Task 1.4: Adapter-Driven Generation Metadata (Eliminate Hardcoded Branching)
Replace ~27 hardcoded `generation === 1 / === 2` checks scattered across UI components with adapter-driven metadata:
*   Add to `IGenerationMetadata`: `nationalDexMax`, `hasSplitSpecial`, `hasAbilities`, `hasNatures`, `hasGender`, `hasMultiRegionBadges`, `playTimeFormat`, `getTrainerSpriteUrl()`.
*   Add to `IGenerationDataAccess`: `getAllSpeciesNames()`, `getAllMoveNames()`, `getMoveBasePp()`, `getAllItemNames()`.
*   Refactor `Pokedex.tsx`, `EditorDashboard.tsx`, `PokemonEditorModal.tsx`, `Inventory.tsx`, `sortManager.ts`, `TrainerCard.tsx`, `PokemonStatsPanel.tsx`, `PokemonInfoPanel.tsx`, `PokemonMovesPanel.tsx` to read generation facts from the adapter instead of branching on generation numbers.
*   Widen `Generation` from `1 | 2` to `number` and `GameVersion` from a closed string union to `string` — adding Gen 3+ no longer produces compiler error cascades. Each adapter's `supportedVersions` provides runtime validation.
*   Result: Adding Gen 3+ requires zero UI changes — `adapter.nationalDexMax` returns 386, `adapter.hasAbilities` returns true, etc.

#### Task 1.5: Centralized Sprite System with Mode Selector
Replace all hardcoded sprite URLs across 9+ component files with a centralized sprite URL resolver (`lib/sprites.ts`) and React context (`context/SpriteContext.tsx`):
*   **Three sprite modes**: Game Specific (default, version-specific pixel sprites from PokeAPI generation folders), Master (standard pixel sprites), Artwork (official high-res illustrations).
*   **Shiny sprite support**: All three modes support shiny variants. `getPokemonSpriteUrl()` accepts an `isShiny` parameter. Artwork shiny uses `/official-artwork/shiny/`, master shiny uses `/pokemon/shiny/`, game-specific shiny uses version-specific paths for Gen 2+ games (Gen 1 has no game-specific shiny on PokeAPI, so it falls back to master shiny).
*   **Settings UI**: Gear icon in the header opens a popup panel to switch modes. Selection persists to `localStorage` and propagates instantly to all views.
*   **Centralized resolver**: `getPokemonSpriteUrl(dexId, mode, gameVersion, isShiny)` and `getTrainerSpriteUrl(gender, mode, gameVersion)` are the single source of truth for all sprite URLs.
*   **Artwork scaling**: `getSpriteImgClasses()` helper removes `pixelated` CSS class and ensures `object-contain` for artwork mode so 475x475px images scale to fit in 96x96px containers alongside pixel sprites.
*   **Integer scaling**: `getIntegerScaleStyle()` computes integer multiples (2x, 3x…) of 96x96px pixel sprites for large containers (Pokédex detail panel), keeping pixel art sharp and crisp instead of blurry.
*   **Smart mode resolution**: `getEffectiveSpriteMode()` allows specific views to opt out of game-specific sprites. The Encounter Database uses master/artwork only since it displays cross-generation content.
*   **Home page**: Hero section always uses static artwork sprites regardless of sprite mode setting.
*   **Complete coverage**: PC Storage, Party, Pokedex, Hall of Fame, Encounter Database, Pokemon Detail View, Pokemon Info Panel, Trainer Card, and Hero all use the centralized system.
*   Result: Adding a new sprite source or mode requires changes in only `lib/sprites.ts` — zero component modifications.

---

### Phase 2: Modular UI/UX Re-architecture
Phase 2 decomposes the monolithic React rendering sections. Currently, `EditorDashboard.tsx` conducts extensive internal UI bindings and tabs logic. We will extract individual pages into clean, modular files.

```
/src/components/editor/
  ├── EditorDashboard.tsx               // Thin Shell orchestrator (renders tabs & overlays)
  ├── tabs/
  │   ├── DashboardTab.tsx              // Renders Trainer Card + active party
  │   ├── StorageTab.tsx                // Renders PC Storage and Inventory panels
  │   ├── PokedexTab.tsx                // Renders National Dex lists and details
  │   ├── BattleTab.tsx                 // Renders Battle Guide and Type Charts
  │   └── EventsTab.tsx                 // Renders Event Flag switches
  └── panels/
      ├── TrainerCardPanel.tsx          // Trainer card view & item editing
      ├── PartyPanel.tsx                // 6-slot draggable list grid
      ├── PCBoxPanel.tsx                // Render PC box grid (configured by adapter dimensions)
      ├── InventoryPanel.tsx            // Bags, Pockets, custom Item list autocomplete
      ├── PokemonInfoPanel.tsx          // ID, forms, gender, shininess (Extensible)
      ├── PokemonStatsPanel.tsx         // HP/Atk/Def/Spe bar graph indicators (Extensible)
      └── PokemonMovesPanel.tsx         // 4-Moves list configuration (Extensible)
```

#### Task 2.1: Extract Extensible panels
*   Decompose `PokemonEditorModal.tsx` into:
    1.  `PokemonInfoPanel`: Displays Species, Level, Types, and Gender.
    2.  `PokemonStatsPanel`: Displays Stat charts, Levels, IVs, and EVs.
    3.  `PokemonMovesPanel`: Displays Move listings, custom Autocomplete selectors, and PP details.
*   Implement the **Panel Extension Pattern** for each extensible component. The panels will render native fields, then ask the active generation's registered extensions to append HTML/inputs (e.g. `PokemonInfoPanel` appends the "Held Item" row for Gen 2+ saves).

#### Task 2.2: Establish clean Tab Composers [Completed]
*   Created `/components/editor/tabs/` directory.
*   Extracted all editor tabs into isolated tab composers: `DashboardTab.tsx`, `StorageTab.tsx`, `EncountersTab.tsx`, `PokedexTab.tsx`, `BattleTab.tsx`, `EventsTab.tsx`, and `HallOfFameTab.tsx`.
*   Cleanly bound all operational properties and event handlers from the central `EditorDashboard.tsx` shell dispatcher.

---

### Phase 3: Multi-Generation Integration (Gen 2 Validation)
Phase 3 validates the flexibility of our architecture. We implement Gen 2 support. If the refactoring is successful, we should be able to integrate full Gold/Silver/Crystal support **without editing any files in `/core`, `/ui`, or `/tabs`**, with the single exception of registering the new adapter during app startup in `App.tsx`.

#### Task 3.1: Build Gen 2 Adapter & Native Data Engine (`/lib/generations/gen2/`)
Create the core components for processing GSC save data:
*   `parser.ts`: Implement parsing support for the Gen 2 file structure (32KB save. International offset 0x2009 for TID, Johto badges at 0x23E4, 14 boxes of 20 slots). Parses Held Items and shiny status (calculated from DV configurations: Speed, Defense, Special equal to 10; Attack equal to 2, 3, 6, 7, 10, 11, 14, or 15).
*   `writer.ts`: Implement writing logic, reproducing dual-bank redundancy copies (Gold/Silver duplicates primary sectors onto backup areas, Crystal manages specific segments) and computing GSC 16-bit additive checksums.
*   `statCalculator.ts`: Recalculates stats using the Gen 2 system, which splits the unified Special stat into SpAtk and SpDef.
*   `data/`: Port GSC constants (251 speciesNames, Steel/Dark type chart configurations, Egg Groups, and Held Items).

#### Task 3.2: Create GSC Extension Registry
*   `HeldItemSection`: Injects held-item Autocomplete selection directly into `PokemonInfoPanel`.
*   `ShinyFlagSection`: Appends shiny sparks/stars next to the Pokémon's name card and rendering borders.
*   `GenderSection`: Leverages DV values inside `genExtension` to display the male/female indicator in the details view.
*   `SpAtkSpDefSection`: Injects Split Sp.Atk / Sp.Def rows into `PokemonStatsPanel` to replace the single "Special" metric.

#### Task 3.3: Register the GSC Adapter
Adapters are registered centrally in `lib/core/AdapterRegistry.ts` using **lazy factories** so Vite code-splits each generation into its own chunk:
```typescript
// lib/core/AdapterRegistry.ts
export const registry = new AdapterRegistry();
registry.registerLazy(1, new LazyFactory(() => import('../generations/gen1/Gen1Adapter').then(m => new m.Gen1Adapter())));
registry.registerLazy(2, new LazyFactory(() => import('../generations/gen2/Gen2Adapter').then(m => new m.Gen2Adapter())));
```
Adding Gen 3 is a single additional `registry.registerLazy(3, …)` line — no other core edits.

---

## Technical Specifications & Constants Reference

For future development reference, key generation characteristics mapped from PKHeX and Save analysis documents should be followed:

### Save File Constants
| Generation | Game Variants | File Size (Bytes) | Primary Checksum | Core Pokémon Size |
| :--- | :--- | :--- | :--- | :--- |
| **Gen I** | Red, Blue, Yellow | 32,768 (0x8000) | 8-bit Inverted Byte Sum | 44 bytes (Party) / 33 bytes (Stored) |
| **Gen II** | Gold, Silver, Crystal | 32,768 (0x8000) (INT) | 16-bit Additive Sum (Dual Slots) | 48 bytes (Party) / 32 bytes (Stored) |
| **Gen III** | R, S, E, FR, LG | 131,072 (0x20000) | CheckSum32 per Sector | 100 bytes (Party) / 80 bytes (Stored) |
| **Gen IV** | DP, Pt, HG, SS | 524,288 (0x80000) | CRC16-CCITT per Block | 236 bytes (Party) / 136 bytes (Stored) |
| **Gen V** | BW, B2W2 | 524,288 (0x80000) | CRC16-CCITT (70/74 blocks) | 220 bytes (Party) / 136 bytes (Stored) |

### Character Encoding Implementations
*   **Gen I / II**: Proprietary 8-bit encoding. Uses 0x50 character as string terminator. Supported with Japanese variants (katakana maps). Mail and Box names in Gen 2 use a wider character-set than nicknames.
*   **Gen III**: Custom single-byte format. 0xFF terminator. Character mappings represented compactly over inline ReadOnlySpans.
*   **Gen IV**: 16-bit Little-Endian custom index with dual-mapping tables (TableINT for international, TableKOR for Korean Hangul). 0xFFFF terminator.
*   **Gen V**: Raw 16-bit Unicode codepoints. Simplifies string mapping, terminating on either 0xFFFF or 0x0000.
*   **Gen VI / VII**: 16-bit Unicode UTF-16 with customized Private Use Area (PUA) remapping for native gender glyph symbols (`\uE08E` male, `\uE08F` female).
*   **Gen VIII / IX**: Raw UTF-16 Little-Endian natively with zero custom string tables.

---

## Conclusion & Architectural Benefits

By implementing this Roadmap:
1.  **Strict Isolation**: Binary operations are completely isolated from React UI components. Changes in a game's structure will never introduce regressions into the layout render loop.
2.  **Unpolluted Codebase**: The React codebase can remain completely unaware of raw byte manipulation, allowing UI designers to construct interfaces using elegant, safe, and descriptive TypeScript models.
3.  **Future-Safe Platform**: Expanding the save editor to accommodate Gen 3, Gen 4, or beyond follows a clearly documented, trivial path of replicating the modular generation packages.
