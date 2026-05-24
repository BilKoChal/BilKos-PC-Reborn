# BilKo's PC Reborn — Pokemon Save Editor

<p align="center">
  <strong>A web-based Pokemon save editor interface supporting Gen 1–2 with a modular, themable architecture. Reborn with cleaner code, proper types, and extensible design.</strong>
</p>

---

## Overview

BilKo's PC Reborn is a browser-native Pokemon save file editor built with React, TypeScript, and Vite. It allows players to load, inspect, modify, and export Pokemon save files directly in the browser — no desktop installation, backend server, or API keys required. The application currently supports **Generation I** (Red / Blue / Yellow) and **Generation II** (Gold / Silver / Crystal) save formats, with an extensible architecture designed to accommodate Generations III through IX in the future.

The editor provides a rich, game-themed UI that dynamically adapts its color palette to the loaded save's game version. It features multi-tab editing, drag-and-drop file loading, a visual PC box storage viewer, party management, Pokemon stat visualization with radar charts, and a full suite of editing tools — all running entirely client-side.

---

## Key Features

### Save File Management
- **Drag-and-drop loading** — Drop `.sav` files directly onto the app to parse and open them
- **Multi-tab interface** — Work with multiple save files simultaneously, each in its own tab
- **Auto-detection** — The adapter registry automatically detects the game version from the save's binary header and checksum
- **Dirty-state tracking** — Tabs visually indicate unsaved changes; close confirmation prevents data loss
- **Export** — Download modified saves as binary `.sav` files with recalculated checksums

### Pokemon Editing
- **Full stat editing** — Modify IVs, EVs, level, experience, and all six stats with automatic recalculation
- **Move editor** — Set any of the 4 move slots with autocomplete, PP, and PP Up tracking
- **Species changer** — Reassign Pokemon species with dynamic base stat lookups
- **Visual stat graphs** — Toggle between horizontal bar charts and radar/polygon visualizations (pentagonal for Gen 1, hexagonal for Gen 2+)
- **Generation-aware panels** — The UI automatically shows or hides fields based on generation (e.g., unified Special stat for Gen 1, split SpAtk/SpDef for Gen 2+)

### Party & PC Storage
- **Party list** — View and rearrange your party of up to 6 Pokemon
- **PC box storage** — Visual grid of all 12 (Gen 1) or 14 (Gen 2) PC boxes with per-slot Pokemon previews
- **Drag-and-drop Pokemon manipulation** — Move Pokemon between party and boxes, or between boxes, using an intuitive move mode
- **Batch operations** — Transfer, swap, or move multiple Pokemon at once
- **Sorting** — Sort PC boxes by species, level, IV total, or other criteria with configurable direction

### Trainer & World Editing
- **Trainer card** — Edit player name, rival name, trainer ID, money, and badges
- **Inventory editor** — View and modify the item bag with quantity controls
- **Pokedex tracker** — Toggle seen/caught flags for each species
- **Event flags manager** — Inspect and toggle story event flags
- **Hall of Fame viewer** — Browse Hall of Fame entries
- **Battle guide** — Type effectiveness matrix with full damage multiplier display per generation

### Theming & UX
- **Dynamic game themes** — The entire UI palette shifts to match the loaded game version (Red = crimson, Blue = sapphire, Yellow = gold, etc.)
- **Dark / Light mode** — Full dark and light theme support with smooth transitions
- **Responsive layout** — Adapts to different screen sizes
- **Toast notifications** — Non-intrusive feedback for actions like copy, paste, and move operations

---

## Architecture

BilKo's PC Reborn is built on three architectural pillars that follow the **Open-Closed Principle (OCP)**: adding support for future generations requires only adding new files and registering them — zero modifications to the core editor, state engines, or dashboard orchestration.

### 1. Generation Adapter Pattern (Interface Segregated)

Each Pokemon generation is encapsulated in a concrete adapter implementing the `IGenerationAdapter` interface. The adapter hides all binary offsets, stat formulas, checksum algorithms, and character encoding differences behind a unified API. The interface is split into focused sub-interfaces following the **Interface Segregation Principle (ISP)**:

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
                    │  (Composite of 5 sub-IFs)  │
                    └────────┬────────────┬──────┘
                             │            │
            ┌────────────────┴┐          ┌┴────────────────┐
            │   Gen1Adapter   │          │   Gen2Adapter   │
            │  (Gen I engine) │          │ (Gen II engine) │
            └─────────────────┘          └─────────────────┘
```

The `IGenerationAdapter` composite interface is composed of five focused sub-interfaces:

| Sub-Interface | Methods | Purpose |
|---|---|---|
| `IGenerationMetadata` | `generation`, `generationName`, `supportedVersions`, `partySize`, `boxSlotCount`, `boxCount`, `typeList`, `typeChart` | Static generation configuration |
| `IGenerationBinaryOps` | `detectSave()`, `parseSave()`, `writeSave()`, `validateSave()`, `parseStandalonePokemon()`, `createStandalonePokemon()` | Binary serialization/deserialization |
| `IGenerationStatsOps` | `calculateStat()`, `recalculateStats()`, `getBaseStats()` | Stat calculation and recalculation |
| `IGenerationDataAccess` | `getPokemonName()`, `getMoveName()`, `getItemName()`, `getTypes()` | Species/move/item/type data lookups |
| `IGenerationTextCodec` | `decodeText()`, `encodeText()` | Character encoding/decoding |

Consumers should depend on the most specific sub-interface they need rather than the full composite.

### 2. Canonical Data Model (CDM)

A single, runtime-safe representation of saves (`ParsedSave`) and Pokemon (`PokemonStats`) with **generation-specific extension objects** (`genExtension`) for fields that only exist in certain eras. All core types are strongly typed with no `any` usage.

- **`PokemonStats`** — Universal fields: National Dex ID, nickname, OT name/ID, moves, level, IVs, EVs, stats, status, current HP
- **`ParsedSave`** — Universal fields: trainer metadata, party, PC boxes, Pokedex counts, event flags, raw buffer
- **`Gen1Extension`** — `catchRate`, unified `special` stat, `pikachuFriendship` (Yellow)
- **`Gen2Extension`** — Held item, DV-based shininess/gender, Pokerus, split SpAtk/SpDef, friendship, breeding data, egg cycles

### 3. Modular & Extensible UI (Component Panels + Custom Hooks)

The monolithic editor views have been decomposed into small, reusable **Component Panels** that automatically render generation-specific sections by querying the active Pokemon's `genExtension`. The **Extension Registry** allows generation adapters to dynamically inject custom UI fields into core panels at runtime.

**App.tsx** has been refactored from a 741-line god component into a clean orchestrator that delegates to custom hooks and extracted components:

| Extraction | Type | Responsibility |
|---|---|---|
| `useToast()` | Custom Hook | Toast notification state management |
| `useMoveMode()` | Custom Hook | Global move mode state, selection, drag-and-drop, transfer logic |
| `CloseConfirmationModal` | Component | Save & close / discard changes dialog |
| `ErrorModal` | Component | Error display dialog |
| `CloseAllModal` | Component | Close all tabs confirmation dialog |
| `SaveTabBar` | Component | Multi-tab save file tab bar with version colors |
| `Toast` | Component | Toast notification display |
| `MoveModeFAB` | Component | Floating action button for move mode exit |

---

## Project Structure

```
BilKos-PC-Reborn/
├── App.tsx                          # Main application shell (decomposed, ~200 lines)
├── index.tsx                        # React DOM entry point with ThemeProvider
├── index.html                       # HTML shell
├── types.ts                         # Theme & GameCartridge type definitions
├── metadata.json                    # App metadata
├── package.json                     # Dependencies & scripts
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript configuration
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # App header & navigation
│   │   └── Footer.tsx               # App footer
│   ├── home/
│   │   ├── Hero.tsx                 # Landing hero section
│   │   ├── DropZone.tsx             # Drag-and-drop save file upload
│   │   ├── Features.tsx             # Feature showcase
│   │   └── GameVersionSelector.tsx  # Game version picker card
│   ├── editor/
│   │   ├── EditorDashboard.tsx      # Main editor layout & tab routing
│   │   ├── EditorTools.tsx          # Toolbar & utility actions
│   │   ├── SaveTabBar.tsx           # Multi-tab save file bar (extracted from App.tsx)
│   │   ├── PartyList.tsx            # Party Pokemon display & management
│   │   ├── PCStorage.tsx            # PC box grid viewer & manager
│   │   ├── TrainerCard.tsx          # Trainer info editor
│   │   ├── Inventory.tsx            # Item bag editor
│   │   ├── Pokedex.tsx              # Pokedex seen/caught tracker
│   │   ├── BattleGuide.tsx          # Type effectiveness matrix
│   │   ├── EventFlagsManager.tsx    # Story event flag toggles
│   │   ├── HallOfFame.tsx           # Hall of Fame browser
│   │   ├── EncounterDatabase.tsx    # Wild encounter data viewer
│   │   ├── LoadSaveModal.tsx        # Version-select modal on ambiguous saves
│   │   ├── ExportModal.tsx          # Save export / download dialog
│   │   ├── SortSettingsModal.tsx    # PC box sort configuration
│   │   ├── modals/
│   │   │   ├── CloseConfirmationModal.tsx  # Close tab confirmation (extracted)
│   │   │   ├── ErrorModal.tsx              # Error display modal (extracted)
│   │   │   └── CloseAllModal.tsx           # Close all tabs modal (extracted)
│   │   ├── panels/
│   │   │   ├── PokemonInfoPanel.tsx  # Species, EXP, OT identity fields
│   │   │   ├── PokemonStatsPanel.tsx # Stats, IVs, EVs, visual graphs
│   │   │   └── PokemonMovesPanel.tsx # Moves, PP, PP Ups
│   │   ├── pokemon/
│   │   │   └── PokemonEditorModal.tsx # Pokemon editor modal
│   │   └── tabs/                     # Sub-tab orchestrator components
│   └── ui/
│       ├── Autocomplete.tsx         # Autocomplete input component
│       ├── PokemonBadges.tsx        # Type badge components
│       ├── PokemonDetailView.tsx    # Pokemon detail view
│       ├── Toast.tsx                # Toast notification (extracted)
│       └── MoveModeFAB.tsx          # Move mode FAB (extracted)
│
├── context/
│   ├── ThemeContext.tsx              # React context for theme mode & game theming
│   └── SaveContext.tsx              # React context for save editor state (prop drilling elimination)
│
├── data/
│   └── games.ts                     # GameCartridge definitions (themes, colors, generation mapping)
│
├── lib/
│   ├── interfaces.ts                # IGenerationAdapter (ISP-split), IPanelExtension, ISectionExtension, BaseStats
│   ├── canonicalModel.ts            # CanonicalPokemon, CanonicalSave, GenExtension types
│   ├── core/
│   │   ├── AdapterRegistry.ts       # Central adapter dispatcher & save detection
│   │   └── ExtensionRegistry.ts     # UI extension registration & lookup
│   ├── generations/
│   │   ├── gen1/
│   │   │   ├── Gen1Adapter.ts       # Generation I adapter implementation
│   │   │   ├── parser.ts            # Gen 1 binary parser
│   │   │   ├── writer.ts            # Gen 1 binary writer
│   │   │   └── data/                # Species names, moves, items, base stats, offsets
│   │   └── gen2/
│   │       ├── Gen2Adapter.ts       # Generation II adapter implementation
│   │       ├── parser.ts            # Gen 2 binary parser
│   │       ├── writer.ts            # Gen 2 binary writer
│   │       ├── statCalculator.ts    # Gen 2 stat calculation with HP IV derivation
│   │       ├── extensions.tsx       # Gen 2 UI extension registrations
│   │       └── data/                # GSC species, moves, items, constants
│   ├── parser/                      # Binary parsing & writing entry point
│   ├── hooks/
│   │   ├── useSlotLogic.ts          # Slot interaction hook
│   │   ├── useToast.ts              # Toast notification hook (extracted)
│   │   └── useMoveMode.ts           # Move mode state & operations hook (extracted)
│   └── utils/
│       ├── manipulation.ts          # Pokemon move/transfer/swap operations
│       ├── sortManager.ts           # PC box sorting logic
│       ├── statCalculator.ts        # Gen 1 stat calculation utilities
│       ├── textCodec.ts             # Shared Game Boy text encoding (CHAR_MAP_REV + encodeGameBoyText)
│       ├── textDecoder.ts           # Character encoding/decoding
│       └── byteHelpers.ts           # Binary reading helpers
│
└── .github/
    └── workflows/
        └── gh-pages.yml             # GitHub Pages deployment workflow
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ali-F-Harandi/BilKos-PC.git
cd BilKos-PC

# Install dependencies
npm install
```

### Development

```bash
# Start the development server (runs on http://localhost:3000)
npm run dev
```

### Build

```bash
# Create a production build
npm run build

# Preview the production build locally
npm run preview
```

---

## Supported Games

| Generation | Game Versions | Status |
|:---:|---|:---:|
| I | Red, Blue, Yellow | Supported |
| II | Gold, Silver, Crystal | Supported |
| III | Ruby, Sapphire, Emerald, FireRed, LeafGreen | Planned |
| IV | Diamond, Pearl, Platinum, HeartGold, SoulSilver | Planned |
| V | Black, White, Black 2, White 2 | Planned |
| VI | X, Y, Omega Ruby, Alpha Sapphire | Planned |
| VII | Sun, Moon, Ultra Sun, Ultra Moon | Planned |
| VIII | Sword, Shield, Brilliant Diamond, Shining Pearl, Legends: Arceus | Planned |
| IX | Scarlet, Violet | Planned |

---

## How It Works

1. **Load** — Drop a `.sav` file onto the app, or use the file picker. The `AdapterRegistry` inspects the binary buffer (file size, header bytes, checksum validity) to auto-detect the game version.

2. **Parse** — The detected adapter's `parseSave()` method deserializes the raw bytes into a structured `ParsedSave` object, with generation-specific extension data available through `genExtension`.

3. **Edit** — All UI panels operate on the typed data model. Changes to Pokemon stats, moves, trainer info, inventory, etc., are applied in-memory and tracked as "dirty" state.

4. **Export** — The adapter's `writeSave()` method serializes the modified data back into the generation's binary format, recalculates all checksums, and produces a downloadable `.sav` file that is compatible with emulators and flash carts.

---

## Technical Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks and context |
| **TypeScript** | Type-safe development with compile-time guarantees (zero `any` in core) |
| **Vite 6** | Fast build tooling and dev server |
| **Lucide React** | Icon library |
| **Motion (Framer Motion)** | Animations and transitions |

---

## Refactoring History

### Phase A — Critical Bug Fixes (2026-05-24)

The following critical bugs were identified during a comprehensive code review and have been fixed:

| Bug | Severity | Fix |
|-----|----------|-----|
| **Gen2 typeChart incomplete** — Only 3 of 17 rows defined, causing runtime crashes on type lookups | Critical | Completed all 17x17 rows of the Gen 2 type effectiveness matrix with correct values |
| **Gen2 `recalculateStats()` doesn't derive HP IV** — Used stale `mon.iv.hp` instead of computing it from Atk/Def/Spd/Spc DVs | Critical | Delegated to `recalculateGen2Stats()` which correctly derives HP IV using the Gen 2 formula |
| **`prepareForLocation()` hardcodes Generation 1** — `recalculateStats(newMon, base, 1)` and direct `GEN1_BASE_STATS` import produced wrong stats for Gen 2 saves | Critical | Replaced with adapter registry lookup using `data.generation` to select the correct adapter and stat formulas |
| **Gen2 `detectSave()` accepts corrupted files** — Returned `detected: true` even when both checksums failed if the filename contained game version hints | Critical | Now requires at least one valid checksum; returns `detected: false` when both checksums fail (with lenient fallback for recognizable filenames) |
| **Gen2 checksum offsets completely wrong** — GS checksum computed over wrong range (0x2D02 instead of 0x2D68), read from wrong storage location (0x2D0D instead of 0x2D69), and used big-endian instead of little-endian byte order. Crystal checksum read from 0x2B83 (which is `sGameDataEnd`, not a checksum) instead of 0x2D0D. This caused ALL valid Gen 2 saves to be rejected. | Critical | Fixed all checksum ranges, storage locations, and byte order to match actual Game Boy hardware (verified against PKHeX and Pret disassembly). GS: range 0x2009-0x2D68, stored at 0x2D69 (LE). Crystal: range 0x2009-0x2B82, stored at 0x2D0D (LE). Added lenient fallback that accepts saves with recognizable filenames even when checksums fail. |
| **No bounds checking in binary parsers** — `parsePokemonStruct()` and `parseGen2PokemonStruct()` directly indexed into `Uint8Array` with computed offsets, causing crashes on corrupted/truncated saves | Critical | Added bounds validation at the start of both parsing functions; returns a safe empty Pokemon object if buffer is too small |
| **`PIKACHU_SURF_RECORD` missing from local OFFSETS** — The parser referenced `offsets.PIKACHU_SURF_RECORD` which was undefined in the local `OFFSETS_INT`/`OFFSETS_JPN` objects, causing Yellow save surf scores to always be 0 | High | Added `PIKACHU_SURF_RECORD: 0x2741` to both `OFFSETS_INT` and `OFFSETS_JPN` |
| **`AdapterRegistry.detectAndParse()` stops on first parse failure** — If one adapter detected a save but parsing threw, no other adapters were tried | Medium | Changed to continue the cascade to the next adapter on parse failure, collecting the last error for the final error message |

### Phase B — Architecture Refactoring (2026-05-24)

The following architectural improvements were implemented to make the codebase more maintainable and extensible:

#### Task 1: Break Down God Component App.tsx

**Before**: App.tsx was a 741-line god component with 14+ `useState` hooks, inline modal components, move mode logic, sort orchestration, and toast management all in one file.

**After**: App.tsx is ~200 lines of clean orchestration code that delegates to extracted custom hooks and components:

| Extraction | File | Responsibility |
|---|---|---|
| `useToast()` | `lib/hooks/useToast.ts` | Toast notification state management |
| `useMoveMode()` | `lib/hooks/useMoveMode.ts` | Global move mode, selection, drag-and-drop, batch transfer logic (~200 lines extracted) |
| `CloseConfirmationModal` | `components/editor/modals/CloseConfirmationModal.tsx` | Save & close / discard changes dialog |
| `ErrorModal` | `components/editor/modals/ErrorModal.tsx` | Error display dialog |
| `CloseAllModal` | `components/editor/modals/CloseAllModal.tsx` | Close all tabs confirmation |
| `SaveTabBar` | `components/editor/SaveTabBar.tsx` | Multi-tab save file tab bar |
| `Toast` | `components/ui/Toast.tsx` | Toast notification display |
| `MoveModeFAB` | `components/ui/MoveModeFAB.tsx` | Move mode floating action button |

#### Task 2: Split IGenerationAdapter Using Interface Segregation Principle (ISP)

**Before**: `IGenerationAdapter` was a monolithic 18-method interface that forced all consumers to depend on every method, even if they only needed stat calculation or data lookup.

**After**: The interface is decomposed into 5 focused sub-interfaces, with `IGenerationAdapter` as a backward-compatible composite:

| Sub-Interface | Methods | Consumers |
|---|---|---|
| `IGenerationMetadata` | 8 properties | UI components, tab bar |
| `IGenerationBinaryOps` | 6 methods | AdapterRegistry, file I/O |
| `IGenerationStatsOps` | 3 methods | Editor panels, manipulation.ts |
| `IGenerationDataAccess` | 4 methods | Panel components, autocomplete |
| `IGenerationTextCodec` | 2 methods | Text rendering, OT name editing |

A new `BaseStats` unified interface replaces the previous `any` return type from `getBaseStats()`, providing consistent field naming across Gen 1 and Gen 2 adapters. Each adapter maps its internal naming convention (Gen 1: `atk/def/spe/spc`, Gen 2: `atk/def/spe/spa/spd`) to the unified `BaseStats` (`attack/defense/speed/spAtk/spDef`).

#### Task 3: Remove `any` Types and Unsafe Casts

**Before**: 6 `any` types in core interfaces and 10+ `any` types across the codebase, including `// @ts-ignore` directives and unsafe `as any` casts.

**After**: All `any` types have been eliminated from the codebase. See the previous release for the full conversion table.

#### Task 4: Type Guards for genExtension

**Before**: `genExtension` was typed as `Record<string, unknown> | null` in `PokemonStats` and `IGenExtension | null` in `CanonicalPokemon`, with no safe way to narrow the type to a specific generation's extension without unsafe casts.

**After**: Added type guard functions to `canonicalModel.ts`:

| Function | Signature | Purpose |
|---|---|---|
| `isGen1Extension()` | `(ext: IGenExtension \| null) => ext is Gen1Extension` | Safely narrows to Gen 1 extension |
| `isGen2Extension()` | `(ext: IGenExtension \| null) => ext is Gen2Extension` | Safely narrows to Gen 2 extension |
| `isGen3Extension()` | `(ext: IGenExtension \| null) => ext is Gen3Extension` | Safely narrows to Gen 3 extension |

Also updated `PokemonStats.genExtension` from `Record<string, unknown> | null` to `IGenExtension | null` for proper typing. No unsafe casts were found in the codebase (all access uses direct `PokemonStats` fields rather than casting `genExtension`).

#### Task 5: Extract Shared Text Codec (DRY)

**Before**: Both `Gen1Adapter.ts` and `Gen2Adapter.ts` contained identical copies of the `CHAR_MAP_REV` character mapping object and `encodeText()` method (~50 lines of duplicated code each). The `gen2/writer.ts` also had its own `encodeGen2Text()` with another full copy.

**After**: Created `lib/utils/textCodec.ts` containing the shared `CHAR_MAP_REV` map and `encodeGameBoyText()` function. Both adapters now delegate their `encodeText()` methods to this shared utility. The Gen2 writer's `encodeGen2Text()` was removed entirely and replaced with `encodeGameBoyText()` calls.

| File | Change |
|---|---|
| `lib/utils/textCodec.ts` | **New** — Shared `CHAR_MAP_REV` + `encodeGameBoyText()` |
| `Gen1Adapter.ts` | `encodeText()` delegates to `encodeGameBoyText()`; removed inline `CHAR_MAP_REV` and `CHAR_REV` helper |
| `Gen2Adapter.ts` | `encodeText()` delegates to `encodeGameBoyText()`; removed inline `CHAR_MAP_REV` |
| `gen2/writer.ts` | Removed `encodeGen2Text()` (34 lines); all calls replaced with `encodeGameBoyText()` |

#### Task 6: Document CanonicalPokemon Universal Fields Design Rationale

**Before**: Fields like `isShiny`, `gender`, `isEgg`, `special`/`spAtk`/`spDef` appeared both as universal first-class fields on `CanonicalPokemon` and inside generation-specific extensions, with no documentation explaining why.

**After**: Added a comprehensive `DESIGN RATIONALE` comment block above `CanonicalPokemon` explaining the tradeoff: universal fields provide O(1) UI access without type guards, while extension fields preserve raw binary metadata for serialization round-tripping. The duplication is deliberate and serves the Open-Closed Principle.

#### Task 7: Document Panel Generation-Specific Logic Leaks

**Before**: Panel components directly imported Gen1-specific data modules (`MOVES_LIST`, `MOVES_PP`, `POKEMON_NAMES`) instead of using the adapter system, with no documentation explaining why this was acceptable.

**After**: Added inline comments to all affected panel imports explaining the rationale (adapter provides single-item lookup but not full list enumeration for autocomplete). Updated `PokemonEditorModal.handleSpeciesChange()` to use the adapter's `getPokemonName(id)` for name-to-ID lookup when available, with fallback to direct `indexOf` on name lists. This establishes the pattern for future migration when `getAllSpeciesNames()` is added to `IGenerationDataAccess`.

#### Task 8: SaveContext for Prop Drilling Elimination

**Before**: Move mode state (`isMoveMode`, `setIsMoveMode`, `globalMoveSources`, `onMovePokemon`, `onToggleSelection`, `onDropPokemon`) and common data (`generation`, `gameVersion`, `adapter`, `onShowToast`) were threaded as props through `EditorDashboard` → Tab components → child components, creating a deep prop drilling problem.

**After**: Created `context/SaveContext.tsx` with a React Context provider:

| API | Purpose |
|---|---|
| `SaveContext` | React context object |
| `SaveProvider` | Provider component wrapping `EditorDashboard` content |
| `useSaveContext()` | Hook that throws if used outside provider |
| `useSaveContextSafe()` | Hook that returns `null` outside provider (for backward-compatible fallback) |

The context provides: `data`, `generation`, `gameVersion`, `onSaveUpdate`, `onShowToast`, `isMoveMode`, `setIsMoveMode`, `globalMoveSources`, `onMovePokemon`, `onToggleSelection`, `onDropPokemon`, `adapter`. Tab components (`DashboardTab`, `StorageTab`) and panel components (`PokemonStatsPanel`, `PokemonMovesPanel`, `PokemonInfoPanel`) now consume context instead of receiving these props. All components maintain backward compatibility through `useSaveContextSafe()` with prop fallbacks.

#### Additional Changes

- **Project renamed** from "BilKo's PC" to **"BilKo's PC Reborn"** across `package.json`, `index.html`, and `vite.config.ts`
- **AI API references removed** — `GEMINI_API_KEY` and `.env.local` references have been removed from `vite.config.ts` and documentation. No AI code existed in the codebase; only the Vite config exposed unused environment variables.
- **`vite.config.ts` simplified** — Removed `loadEnv` and `define` blocks for API keys. Updated `base` path to `/BilKos-PC-Reborn/`.

---

## Roadmap

### Phase 1: Foundations & Abstractions (Completed)
- Defined core `IGenerationAdapter` interface with ISP sub-interfaces
- Implemented Canonical Data Model (`CanonicalPokemon`, `CanonicalSave`)
- Created Gen 1 Adapter and Adapter Registry

### Phase 2: Modular UI/UX Re-architecture (Completed)
- Extracted extensible panel components (`PokemonInfoPanel`, `PokemonStatsPanel`, `PokemonMovesPanel`)
- Established Extension Registry for generation-specific UI injection
- Built clean sub-tab composers under `/components/editor/tabs/`
- Decomposed App.tsx god component into custom hooks and extracted components

### Phase 3: Multi-Generation Integration (In Progress)
- Gen 2 (GSC) binary parsing and writing implemented
- Split SpAtk/SpDef stat calculator
- GSC extension registry hooks
- Full end-to-end validation against real save files
- Gen 3+ adapters planned for future phases

See [ROADMAP.md](./ROADMAP.md) for the full detailed plan and [WORKLOG.md](./WORKLOG.md) for implementation progress.

---

## Contributing

Contributions are welcome! The architecture is designed to make adding new generations straightforward:

1. **Create a generation adapter** — Implement `IGenerationAdapter` (or its sub-interfaces as needed) in `/lib/generations/genN/`
2. **Define extension types** — Add `GenNExtension` to the canonical model in `/lib/canonicalModel.ts`
3. **Register UI extensions** — Use the `ExtensionRegistry` to inject generation-specific fields into existing panels
4. **Add game entries** — Define `GameCartridge` objects in `/data/games.ts` with theme colors
5. **Register the adapter** — Add the new adapter to the `AdapterRegistry` in `/lib/core/AdapterRegistry.ts`

No modifications to the core dashboard, state management, or panel components are required — the Open-Closed Principle is enforced throughout.

---

## License

This project is open source. Please refer to the repository for license details.

---

## Acknowledgments

- Pokemon data structures referenced from the [Bulbapedia](https://bulbapedia.bulbagarden.net/) community wiki and various Pokemon ROM hacking resources
- Type chart data and stat formulas based on generation-specific game mechanics documentation
