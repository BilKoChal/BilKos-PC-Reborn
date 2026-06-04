# Contributing to BilKos-PC-Reborn

Thanks for your interest in improving BilKos-PC-Reborn! This guide covers the dev
workflow, the architecture rules that keep the project scalable, and — important
for a save editor — how to handle save-file **provenance and privacy** when
reporting bugs.

## Save-file provenance & privacy (read this first)

A Pokémon save is **personal data**. It embeds the player's name, trainer ID, money,
play time, and any nicknames / OT names the player chose (which are sometimes real
names). Treat save files like you would any file containing PII.

**When reporting a bug, do NOT attach your real save file to a public issue.** Instead:

- Describe the **provenance**: game + version + region (e.g. "Crystal, International"),
  how the save was produced (real cartridge dump, which emulator, which flashcart),
  and the file's byte size and extension (e.g. `32768-byte .sav`, `.dsv`, `+16` footer).
- Provide a **minimal, synthetic repro** where possible. The test suite has helpers
  (`createMinimalGen1Save`, `buildGen2PartyMon`, …) that build checksum-valid saves
  from scratch — a failing test using those is the ideal bug report.
- If a specific save is essential to reproduce, **redact it first** (blank the player
  name / OT / trainer ID) and confirm the redacted copy still reproduces the issue
  before sharing it privately with a maintainer — not in a public thread.

**Do not commit or attach copyrighted game data** — no ROMs, no extracted game
resources, no real save dumps in the repo or in issues/PRs. The project ships only
its own data tables (names, base stats, offsets) authored for interoperability.

## Development workflow

```bash
npm install
npm run dev        # Vite dev server
npm test           # full vitest suite (must stay green)
npm run typecheck  # tsc --noEmit (must be clean)
npm run build      # production build (must succeed)
```

A change is ready for review when **all three** of `npm test`, `npm run typecheck`,
and `npm run build` pass. Add or extend tests for any behavior you change — round-trip
identity tests (`tests/populatedRoundTrip.test.ts`) are the safety net for parser/writer
work, and a good bug fix usually comes with a test that fails before it and passes after.

## Architecture rules (what keeps this scalable)

The project follows the Open/Closed Principle: **adding a generation should be additive**
— a new `lib/generations/genN/` folder plus one `registry.registerLazy(...)` line, with
no edits to core/UI/context. See `docs/ADDING_A_GENERATION.md` for the full checklist and
`ROADMAP.md` for the architecture overview.

Two invariants are **enforced by `tests/scalabilityLint.test.ts`** (they will fail CI if
violated):

1. **No `as any` casts** in `lib/`, `components/`, or `context/`. Use the Canonical Data
   Model and the `isGenNExtension` / `isGenNSaveExtension` type guards instead.
2. **No ad-hoc `generation === N` branches.** Generation facts come from adapter
   capability flags (`hasGender`, `hasSplitSpecial`, `inventoryLayout`, …) and metadata;
   extension discrimination uses the type guards. (The only allowlisted exceptions are the
   type-guard definitions in `canonicalModel.ts` and the per-gen crypto seed in
   `core/entityFormat.ts`.)

Other conventions:

- **Generation-specific data lives in `lib/generations/genN/data/`** as tables, not logic.
- **Offsets are documented** in `docs/SAVE_FORMAT_CONSTANTS.md` (kept in sync with the
  `offsets.ts` tables, which are the source of truth).
- **Writers must recompute checksums** via the adapter's `recomputeChecksums` step.
- **Detection fails closed** — `detectSave` only claims a save it can validate.

## Pull requests

- Keep PRs focused; one logical change per PR.
- Reference the relevant `TODO.md` task id where applicable.
- Use a conventional-commit style subject (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`).
- Confirm in the description that tests/typecheck/build pass and that **no real save files
  or copyrighted data** were added.

## Reporting bugs

Open an issue using the **Bug report** template. It asks for save provenance (game/version/
region/how-produced) rather than the save itself, plus the steps to reproduce and what you
expected. The more your report looks like a failing test against a synthetic save, the
faster it gets fixed.
