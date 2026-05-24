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
2. **Canonical Data Model** — `ParsedSave`/`PokemonStats` with `genExtension` for generation-specific data.
3. **Modular UI + React Context** — `SaveContext` eliminates prop drilling.

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
