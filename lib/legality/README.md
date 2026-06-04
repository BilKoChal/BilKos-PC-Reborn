# Legality module — design note (boundary only, not implemented)

**Status:** boundary + result types only. There is **no legality engine**, and none is
planned for the Gen 1/2 scope. This note exists so future-generation work has a clear
home and a shared mental model, rather than growing ad-hoc validation that later fights a
real engine (TODO 8.5.4).

## The thesis: "find a consistent encounter"

PKHeX's legality model: *an entity is legal iff some real in-game encounter is consistent
with every byte of it.* The engine (1) finds candidate encounters for the entity, then
(2) runs ~50 `Verifier`s (moves/relearn, IVs, EVs, gender↔PID, level, OT, ball, met data,
…), each emitting a `CheckResult` with a `Severity` of **Valid / Fishy / Invalid**. The
aggregate is `Invalid` if any check is `Invalid`; `Fishy` results are surfaced as warnings.

Our `lib/legality/types.ts` mirrors this exactly: `LegalitySeverity`, `CheckResult`
(`category` + `comment`), and `LegalityAnalysis` (`valid`, `analyzed`, `results`,
`summary`). `analyzeLegality()` in `index.ts` is a placeholder returning `analyzed:false`.

## Why a boundary now, not an engine

The risk this guards against is *scattered* validation: IV/EV-range clamps in the stats
panel, move-learnability hints in the move editor, gender/PID checks in the parser, etc.
Each is reasonable alone, but together they become an inconsistent pseudo-engine. By
naming `lib/legality/` as the eventual home and defining the result shape, such checks can
later be migrated into `Verifier`s without an API churn.

## How a real engine would plug in (sketch)

- A per-generation `EncounterProvider` (encounter tables already live as data under
  `lib/generations/genN/data/`, e.g. `pokemonLocations`/`eventDistributions`).
- A list of `Verifier`s run over `(entity, candidateEncounters)`; each pushes `CheckResult`s.
- `analyzeLegality(entity, adapter)` orchestrates: gather encounters → run verifiers →
  fold into a `LegalityAnalysis`. Generation differences come from the adapter (capability
  flags + data), never from `generation === N` branching (enforced by `scalabilityLint`).

This stays consistent with the rest of the architecture: data-driven, adapter-owned,
open for extension.

## Three distinct validation layers (TODO 8.5.6)

Keep these **named and conceptually separate** — they answer different questions:

| Layer | Question | Where | Status |
| :--- | :--- | :--- | :--- |
| **Save integrity** | Are the save's checksums valid? | `validateSaveDetailed()` → `SaveValidationResult`; repaired by `recomputeChecksums()` | ✅ implemented |
| **Entity legality** | Could these entity bytes come from real play? | `lib/legality/` → `LegalityAnalysis` | 🔲 boundary only |
| **Bulk analysis** | Are there anomalies *across* entities (duplicate PIDs/IDs, clones)? | future `lib/legality/` bulk analyzer | 🔲 backlog |

PKHeX separates `SaveFile.ChecksumsValid` (whole-save) from per-`PKM` checksums/legality and
adds a `BulkAnalysis` for cross-entity duplicate/clone detection. We mirror that separation:
save-level integrity is **not** entity legality, and neither is **bulk** analysis.

**Backlog — bulk box analyzer (post-Gen-2 nicety):** scan a box/all boxes for duplicate
identities (same species + DVs + OT + nickname, or, in encrypted gens, duplicate PIDs/ECs)
to flag likely clones. Belongs in this module as a `analyzeBulk(entities)` →
`CheckResult[]` once the single-entity path exists.
