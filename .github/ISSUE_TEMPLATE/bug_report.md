---
name: Bug report
about: Report incorrect parsing, editing, or saving behavior
title: "[Bug] "
labels: bug
---

<!--
PRIVACY: A save file contains personal data (player name, trainer ID, OT names).
Please DO NOT attach your real save file here. Describe its provenance below and,
if possible, provide a synthetic/redacted repro instead. No ROMs or copyrighted
game data. See CONTRIBUTING.md → "Save-file provenance & privacy".
-->

## What happened

A clear description of the bug (what you saw vs. what you expected).

## Save provenance (NOT the save file itself)

- **Game / version / region:** <!-- e.g. Crystal, International -->
- **How was the save produced?** <!-- real cartridge dump / emulator (which?) / flashcart -->
- **File size & extension:** <!-- e.g. 32768-byte .sav, .dsv, 32784-byte (+16 footer) -->
- **Which screen/feature?** <!-- e.g. Inventory PC tab, Pokédex, party editing -->

## Steps to reproduce

1.
2.
3.

## Expected vs. actual

- **Expected:**
- **Actual:**

## Minimal / synthetic repro (preferred)

<!--
If you can, reproduce using a synthetic save built from scratch rather than your real
one. The test suite has helpers (createMinimalGen1Save, buildGen2PartyMon, …). A failing
test snippet here is the fastest path to a fix. If a real save is truly required, redact
the player name / OT / trainer ID first and share it privately with a maintainer.
-->

## Environment

- **Browser / OS:**
- **App version / commit:**

## Checklist

- [ ] I did **not** attach a real, unredacted save file or any copyrighted game data.
- [ ] I included the save's provenance (game/version/region/how-produced).
- [ ] I described clear steps to reproduce.
