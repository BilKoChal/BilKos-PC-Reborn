# BilKo's PC — Pokemon Save Editor

<p align="center">
  <strong>A web-based Pokemon save editor interface supporting Gen 1–9 with a modular, themable architecture.</strong>
</p>

---

## Overview

BilKo's PC is a browser-native Pokemon save file editor built with React, TypeScript, and Vite. It allows players to load, inspect, modify, and export Pokemon save files directly in the browser — no desktop installation or backend server required. The application currently supports **Generation I** (Red / Blue / Yellow) and **Generation II** (Gold / Silver / Crystal) save formats, with an extensible architecture designed to accommodate Generations III through IX in the future.

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

BilKo's PC is built on three architectural pillars that follow the **Open-Closed Principle (OCP)**: adding support for future generations requires only adding new files and registering them — zero modifications to the core editor, state engines, or dashboard orchestration.

### 1. Generation Adapter Pattern

Each Pokemon generation is encapsulated in a concrete adapter implementing the `IGenerationAdapter` interface. The adapter hides all binary offsets, stat formulas, checksum algorithms, and character encoding differences behind a unified API.

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

The `IGenerationAdapter` interface defines:

| Method | Purpose |
|--------|---------|
| `detectSave()` | Identify game version from binary header and checksum |
| `parseSave()` | Deserialize raw bytes into a `ParsedSave` object |
| `writeSave()` | Serialize edited data back to binary with valid checksums |
| `validateSave()` | Verify save integrity |
| `calculateStat()` | Generation-specific stat formula |
| `recalculateStats()` | Recompute all stats from base/IV/EV/level |
| `decodeText()` / `encodeText()` | Generation-specific character encoding |
| `getPokemonName()` / `getMoveName()` / `getItemName()` | Data lookups |
| `getTypes()` | Fetch type assignments for a given species |
| `getBaseStats()` | Retrieve base stats for stat calculation |

### 2. Canonical Data Model (CDM)

A single, runtime-safe representation of saves (`CanonicalSave`) and Pokemon (`CanonicalPokemon`) with **generation-specific extension objects** (`genExtension`) for fields that only exist in certain eras:

- **`CanonicalPokemon`** — Universal fields: National Dex ID, nickname, OT name/ID, moves, level, IVs, EVs, stats, status, current HP
- **`CanonicalSave`** — Universal fields: trainer metadata, party, PC boxes, Pokedex counts, event flags, raw buffer
- **`Gen1Extension`** — `catchRate`, unified `special` stat, `pikachuFriendship` (Yellow)
- **`Gen2Extension`** — Held item, DV-based shininess/gender, Pokerus, split SpAtk/SpDef, friendship, breeding data, egg cycles
- **`Gen3Extension`** — Abilities, natures, characteristics, ribbons, contest stats

### 3. Modular & Extensible UI (Component Panels)

The monolithic editor views have been decomposed into small, reusable **Component Panels** that automatically render generation-specific sections by querying the active Pokemon's `genExtension`. The **Extension Registry** allows generation adapters to dynamically inject custom UI fields into core panels at runtime.

---

## Project Structure

```
BilKos-PC/
├── App.tsx                          # Main application shell (tabs, modals, global state)
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
│   │   ├── panels/
│   │   │   ├── PokemonInfoPanel.tsx  # Species, EXP, OT identity fields
│   │   │   ├── PokemonStatsPanel.tsx # Stats, IVs, EVs, visual graphs
│   │   │   └── PokemonMovesPanel.tsx # Moves, PP, PP Ups
│   │   ├── pokemon/                  # Pokemon-specific sub-components
│   │   └── tabs/                     # Sub-tab orchestrator components
│   └── ui/                           # Reusable UI primitives
│
├── context/
│   └── ThemeContext.tsx              # React context for theme mode & game theming
│
├── data/
│   └── games.ts                     # GameCartridge definitions (themes, colors, generation mapping)
│
├── lib/
│   ├── interfaces.ts                # IGenerationAdapter, IPanelExtension, ISectionExtension
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
│   ├── hooks/                       # Custom React hooks
│   └── utils/
│       ├── manipulation.ts          # Pokemon move/transfer/swap operations
│       ├── sortManager.ts           # PC box sorting logic
│       ├── statCalculator.ts        # Gen 1 stat calculation utilities
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

### Environment Variables

If you plan to use AI-powered features (optional), create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

This is **not required** for core save editing functionality — the editor works entirely offline and client-side without any API keys.

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

2. **Parse** — The detected adapter's `parseSave()` method deserializes the raw bytes into a structured `ParsedSave` object, which is then wrapped into a `CanonicalSave` with generation-specific extensions.

3. **Edit** — All UI panels operate on the canonical data model. Changes to Pokemon stats, moves, trainer info, inventory, etc., are applied in-memory and tracked as "dirty" state.

4. **Export** — The adapter's `writeSave()` method serializes the modified canonical data back into the generation's binary format, recalculates all checksums, and produces a downloadable `.sav` file that is compatible with emulators and flash carts.

---

## Technical Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks and context |
| **TypeScript** | Type-safe development with compile-time guarantees |
| **Vite 6** | Fast build tooling and dev server |
| **Lucide React** | Icon library |
| **Motion (Framer Motion)** | Animations and transitions |

---

## Bug Fix History

### Phase A — Critical Bug Fixes (2026-05-24)

The following critical bugs were identified during a comprehensive code review and have been fixed:

| Bug | Severity | Fix |
|-----|----------|-----|
| **Gen2 typeChart incomplete** — Only 3 of 17 rows defined, causing runtime crashes on type lookups | Critical | Completed all 17x17 rows of the Gen 2 type effectiveness matrix with correct values |
| **Gen2 `recalculateStats()` doesn't derive HP IV** — Used stale `mon.iv.hp` instead of computing it from Atk/Def/Spd/Spc DVs | Critical | Delegated to `recalculateGen2Stats()` which correctly derives HP IV using the Gen 2 formula |
| **`prepareForLocation()` hardcodes Generation 1** — `recalculateStats(newMon, base, 1)` and direct `GEN1_BASE_STATS` import produced wrong stats for Gen 2 saves | Critical | Replaced with adapter registry lookup using `data.generation` to select the correct adapter and stat formulas |
| **Gen2 `detectSave()` accepts corrupted files** — Returned `detected: true` even when both checksums failed if the filename contained game version hints | Critical | Now requires at least one valid checksum; returns `detected: false` when both checksums fail |
| **No bounds checking in binary parsers** — `parsePokemonStruct()` and `parseGen2PokemonStruct()` directly indexed into `Uint8Array` with computed offsets, causing crashes on corrupted/truncated saves | Critical | Added bounds validation at the start of both parsing functions; returns a safe empty Pokemon object if buffer is too small |
| **`PIKACHU_SURF_RECORD` missing from local OFFSETS** — The parser referenced `offsets.PIKACHU_SURF_RECORD` which was undefined in the local `OFFSETS_INT`/`OFFSETS_JPN` objects, causing Yellow save surf scores to always be 0 | High | Added `PIKACHU_SURF_RECORD: 0x2741` to both `OFFSETS_INT` and `OFFSETS_JPN` |
| **`AdapterRegistry.detectAndParse()` stops on first parse failure** — If one adapter detected a save but parsing threw, no other adapters were tried | Medium | Changed to continue the cascade to the next adapter on parse failure, collecting the last error for the final error message |

---

## Roadmap

The project follows a **3-phase architecture roadmap** to expand from a Generation 1-only editor to a full multi-generation platform:

### Phase 1: Foundations & Abstractions (Completed)
- Defined core `IGenerationAdapter` interface
- Implemented Canonical Data Model (`CanonicalPokemon`, `CanonicalSave`)
- Created Gen 1 Adapter and Adapter Registry

### Phase 2: Modular UI/UX Re-architecture (Completed)
- Extracted extensible panel components (`PokemonInfoPanel`, `PokemonStatsPanel`, `PokemonMovesPanel`)
- Established Extension Registry for generation-specific UI injection
- Built clean sub-tab composers under `/components/editor/tabs/`

### Phase 3: Multi-Generation Integration (In Progress)
- Gen 2 (GSC) binary parsing and writing implemented
- Split SpAtk/SpDef stat calculator
- GSC extension registry hooks
- Full end-to-end validation against real save files
- Gen 3+ adapters planned for future phases

See [ROADMAP.md](./ROADMAP.md) for the full detailed plan and [WORKLOG.md](./WORKLOG.md) for implementation progress.

---

## Known Architectural Issues (For Contributors)

A thorough code review identified the following architectural concerns that should be addressed before adding Gen 3+ support:

- **App.tsx is a god component** (739 lines, 14 useState hooks) — needs decomposition into custom hooks
- **`IGenerationAdapter` is a fat interface** (18 methods) — should be split using Interface Segregation Principle
- **6 `any` types in core interfaces** — need proper typed interfaces
- **`genExtension` pattern lacks discriminated unions** — forces unsafe type casts
- **~60-70% code duplication** between Gen1 and Gen2 adapters — needs a `BaseGenerationAdapter` abstract class
- **Redundant fields** on both `CanonicalPokemon` and GenExtension objects (e.g., `isShiny`, `spAtk`, `spDef`)
- **Panels leak generation-specific logic** via `if (generation === 1)` branches instead of using the Extension Registry

These issues are documented for planning purposes and do not affect current Gen 1/2 functionality.

---

## Contributing

Contributions are welcome! The architecture is designed to make adding new generations straightforward:

1. **Create a generation adapter** — Implement `IGenerationAdapter` in `/lib/generations/genN/`
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
