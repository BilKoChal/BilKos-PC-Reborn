# Save-Format Constants Reference

A per-generation reference for the binary save constants this project actually uses.
Values are mirrored from the authoritative offset tables in code — when in doubt, the
code is the source of truth:

- Gen 1 — `lib/generations/gen1/data/offsets.ts`
- Gen 2 — `lib/generations/gen2/data/offsets.ts`

PKHeX is cited for traceability (its `SAV1`/`SAV2` save classes and `PK1`/`PK2` entity
classes); offsets were cross-checked against it and against real-save behavior. This doc
is descriptive — changing a number here does nothing; edit the `offsets.ts` table.

> ⚠️ Region matters. Japanese (and, for Gen 2, Korean) builds move several offsets and
> change string lengths, box geometry, and save size. The tables below list the
> **international** layout unless noted; see the `*_JPN` / `*_KOR` configs in `offsets.ts`
> for the regional variants (the adapters pick the right one via `detectRegion`).

---

## Cross-generation summary

| Generation | Versions | SRAM size (INT) | Primary checksum | Party / Stored mon size |
| :--- | :--- | :--- | :--- | :--- |
| **Gen I** | Red, Blue, Yellow | 32 KB (`0x8000`) | 8-bit inverted byte sum | 44 / 33 bytes |
| **Gen II** | Gold, Silver, Crystal | 32 KB (`0x8000`)¹ | 16-bit additive sum (dual slots) | 48 / 32 bytes |

¹ Japanese Gen 2 SRAM is 64 KB (`0x10000`). Japanese Gen 1 SRAM is **32 KB** — the same
as international (a prior `0x10000` value was wrong; see TODO 2.8).

Gen 3+ sizes/checksums (Gen 3 `0x20000` CheckSum32 per sector, Gen 4/5 CRC16-CCITT per
block, etc.) are documented in `ROADMAP.md` and will move into each future
`genN/data/offsets.ts` as those adapters land.

---

## Gen I (R/B/Y) — international SRAM (`0x8000`)

Geometry: 12 PC boxes × 20 slots. Party mon struct 44 bytes; stored (box) mon 33 bytes.
External PC banks live at `0x4000` (bank 2) and `0x6000` (bank 3).

| Field | Offset | Notes |
| :--- | :--- | :--- |
| Player name | `0x2598` | terminator `0x50` |
| Rival name | `0x25F6` | |
| Player ID (TID) | `0x2605` | big-endian u16 |
| Money | `0x25F3` | 3-byte BCD |
| Badges | `0x2602` | bitfield (8 Kanto) |
| Options | `0x2601` | |
| Pikachu friendship | `0x271C` | Yellow only |
| Pokédex owned / seen | `0x25A3` / `0x25B6` | 19-byte bitfields (151 species) |
| Item bag | `0x25C9` | count-prefixed, 20 slots |
| PC items | `0x27E6` | 50 slots |
| Current box id | `0x284C` | |
| Party data | `0x2F2C` | count + species list + 6 structs |
| Current box data (RAM cache) | `0x30C0` | mirror of the active box |
| **Main checksum** | `0x3523` | 8-bit inverted sum over `[player name .. checksum-1]` |

**Checksum (Gen 1).** `checksum = (~Σ bytes[0x2598 .. CHECKSUM-1]) & 0xFF`. PC banks 2/3 also
carry per-box and bank-wide checksums. All are recomputed by `recomputeGen1Checksums`
(see TODO 8.5.2). *PKHeX ref: `SAV1`, `PK1`.*

---

## Gen II (G/S/C) — international SRAM (`0x8000`)

Geometry: 14 PC boxes × 20 slots. Party mon struct 48 bytes; stored (box) mon 32 bytes.
G/S and Crystal differ in several offsets — Crystal moves the party and checksums — so the
table lists **Gold/Silver (INT)** with Crystal (INT) noted where it diverges.

| Field | G/S (INT) | Crystal (INT) | Notes |
| :--- | :--- | :--- | :--- |
| Options | `0x2000` | `0x2000` | |
| Trainer block (TID) | `0x2009` | `0x2009` | |
| Rival name | `0x2021` | — | |
| Time played | `0x2053` | — | |
| Money | `0x23DB` | — | 3-byte |
| Mom's savings | `0x23DD` | — | |
| Coins | `0x23E2` | — | |
| Johto / Kanto badges | `0x23E4` / `0x23E5` | — | bitfields |
| TM/HM pouch | `0x23E6` | — | 57 direct-indexed slots |
| Item pouch (count/start) | `0x241E` / `0x241F` | — | 20 slots |
| Key-item pouch | `0x2448` | — | 26 slots, quantityless |
| Party | (G/S party offset) | `0x2865` | 6 structs |
| Pokédex caught / seen | `0x2A4C` / `0x2A6C` | `0x2A27` / `0x2A47` | 32-byte bitfields (251) |
| **Checksum 1** (primary) | `0x2D69` | `0x2D0D` | 16-bit additive |
| **Checksum 2** (backup) | `0x7E6D` | `0x1F0D` | mirror/backup slot |
| Accumulated checksum end | `0x2D68` | `0x2B82` | inclusive end of the summed range |

**Checksum (Gen 2).** A 16-bit additive sum over the save data region, written to a primary
slot and mirrored to a backup slot (the dual-slot redundancy GSC uses), plus per-box
checksums. All recomputed by `recomputeGen2Checksums` (TODO 8.5.2). The `inventoryLayout`
(TODO 1.8) maps the Items/KeyItems/Balls/TM-HM/PC pockets above to UI tabs. *PKHeX ref:
`SAV2`, `PK2`.*

---

## How the code uses these

1. `detectSave(buffer, filename)` size-gates, then validates the region's checksum.
2. `detectRegion(save)` picks the INT/JPN/KOR offset config.
3. `parseSave` reads fields via the chosen `offsets` table into the Canonical Data Model.
4. `writeSave` writes them back and calls `recomputeChecksums` as its final step.
5. Emulator/flashcart wrappers (e.g. `.dsv`) are stripped by `lib/core/saveWrappers.ts`
   before detection (TODO 8.5.1).
