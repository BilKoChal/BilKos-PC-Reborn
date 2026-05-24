# BilKo's PC Reborn — Pokemon Save Editor

A web-based Pokemon save file editor supporting **Gen I** (R/B/Y) and **Gen II** (G/S/C) with modular, themable architecture. Built with React 18, TypeScript, and Vite 6.

---

## Key Features

- **Drag-and-drop save loading** — Drop `.sav` files to parse and open them
- **Multi-tab interface** — Work with multiple saves simultaneously
- **Cross-save Pokemon transfer** — Drag Pokemon between different save file tabs with auto tab-switching on hover
- **Smart move mode** — Click to select, click target to swap/move. Ctrl/Shift for multi-select. Checkbox for toggle.
- **Modern drag feedback** — Animated themed ring highlights, scaling effects, and shadow on drag-over
- **Full Pokemon editing** — Stats, moves, IVs, EVs, species, with generation-aware panels
- **Game-themed UI** — Dynamic color palette matches the loaded game version
- **Dark/Light mode** — Full theme support with smooth transitions
- **Party & PC management** — Batch operations, sorting, and visual box grid
- **Trainer/World editing** — Name, ID, money, badges, items, Pokedex, events, Hall of Fame

## Architecture

Three-pillar design following the **Open-Closed Principle**:

1. **Generation Adapter Pattern** — ISP-split `IGenerationAdapter` with 5 sub-interfaces. Add new generations by creating adapter files and registering them.
2. **Canonical Data Model** — Universal `ParsedSave`/`PokemonStats` with `genExtension` for generation-specific data. Type guards for safe narrowing.
3. **Modular UI + React Context** — `SaveContext` eliminates prop drilling. `ExtensionRegistry` allows dynamic UI injection.

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

## Recent Changes (Phase C)

### Advanced Drag-and-Drop & Selection System
- **Smart selection model**: Click selects, click target swaps/moves. Ctrl+click toggles multi-select. Shift+click range-selects. Checkbox toggles individually.
- **Cross-save drag-and-drop**: Drag Pokemon between save file tabs. Hover over a tab header for 400ms to auto-switch. Source tabId is securely serialized in drag payload.
- **Modern visual feedback**: Drag-over shows animated themed ring (color matches game version), scale-up effect, and distinctive shadow. Empty party slots redesigned with drag behavior and hover feedback.
- **New DND module** (`lib/hooks/dndTypes.ts`): Custom MIME type `application/x-bilkos-pc-drag`, `DragPayload` with `sourceTabId`, typed `setDragData`/`parseDragData` helpers.

See [WORKLOG.md](./WORKLOG.md) for full history.

## License

Open source. See repository for details.
