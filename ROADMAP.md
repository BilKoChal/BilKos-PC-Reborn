# BilKo's PC Reborn — Roadmap

> **This file has been superseded.** The active roadmap now lives at **[`download/ROADMAP_TO_PKHEX_PLUS.md`](../download/ROADMAP_TO_PKHEX_PLUS.md)** (or `ROADMAP_TO_PKHEX_PLUS.md` in the project root if moved there).
>
> The content below is the original 3-Phase Architecture Roadmap, kept here as **historical reference only**. It describes the Gen 1 → Gen 2 migration that has already shipped. It does NOT describe the path to Gen 3+ or the PKHeX+ vision.
>
> **For the current direction:**
> - **Problems to fix:** `download/ARCHITECTURAL_PROBLEMS.md`
> - **Roadmap to PKHeX+:** `download/ROADMAP_TO_PKHEX_PLUS.md` (includes a Problem → Fix traceability matrix)
>
> **Current phase:** Phase 0 (Foundation Cleanup) — see the new roadmap.

---

# Historical: 3-Phase Architecture Roadmap (Gen 1 → Gen 2)

*The following is the original roadmap, completed when Gen 2 shipped. It is preserved for reference.*

This document outlined a **3-Phase Architecture Roadmap** to refactor BilKo's PC Pokemon Save Editor from a Generation 1-only structure into a modular, multi-generation, and highly extensible platform.

The goal of this architecture was to adhere to the core software construction principle: **The Open-Closed Principle (OCP)**. Adding support for future generations (Gen II - Gen IX) should only require adding new files under a generation-specific namespace and registering them with a central registry, requiring **zero modifications** to the core editor layout, state engines, or dashboard orchestration logic.

---

## Status (as of Gen 2 ship)

**All three phases below are complete and shipped.** Gen I and Gen II are fully supported (parse/edit/write, validated by a 300+ test vitest suite). The project then entered a **hardening + Gen 3+ preparation** phase: entity block-shuffle seam, save-wrapper detection waterfall, first-class `recomputeChecksums`, standalone-format crypto/geometry contract, adapter-driven `inventoryLayout`, data audits, and the OCP scalability-invariant test.

---

## Technical Architecture Overview

*(Original content preserved below for reference — see the file history for the full original text.)*

1. **Generation Adapter Pattern** — `IGenerationAdapter` with sub-interfaces.
2. **Canonical Data Model (CDM)** — `CanonicalPokemon`/`CanonicalSave` with `genExtension`.
3. **Modular UI + React Context** — `SaveContext` + extension system.

See `README.md` for the current architecture description, and `download/ARCHITECTURAL_PROBLEMS.md` for an audit of where the architecture's execution diverges from its documentation.
