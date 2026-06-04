# Cross-generation transfer — hub-and-spoke design note

**Status:** design guidance. The current converter (`lib/utils/crossGenConverter.ts`)
is fine as-is for the Gen 1 ↔ Gen 2 scope; this note records the architecture so the
transfer code doesn't grow into an O(N²) tangle of pairwise converters as more
generations land (TODO 8.5.5).

## The problem with pairwise converters

The naïve approach is a direct converter for every ordered pair of generations:
`Gen1→Gen2`, `Gen2→Gen1`, `Gen2→Gen3`, `Gen3→Gen2`, … That's **O(N²)** converters, and
each new generation forces you to touch many of them. PKHeX hit this and solved it by
routing **all** Gen 8+ inter-game transfers through a single neutral format — **HOME**
(`PKH`) — so each generation only needs to convert *to/from the hub*, not to every peer.
That's **O(N)** spokes instead of O(N²) edges.

## We already have the hub: `CanonicalPokemon`

This project is well-positioned because parsing already normalizes every save's entities
into a generation-neutral `CanonicalPokemon` (with a `genExtension` slot for gen-specific
extras), keyed by **National Dex `dexId`**. That canonical model *is* the transfer
envelope — the same role HOME's `PKH` plays for PKHeX.

The current `convertPokemonForTransfer(mon, sourceGen, targetGen)` already leans on this:
every species remap routes through `dexId` (`sourceGen internal id → dexId → targetGen
internal id`), not through pairwise internal-id tables. So the *key* is already hub-shaped;
only the field-level fixups (move/item/type filtering) are written pairwise today, which is
fine while there are two generations.

## When and how to pivot

Keep the current direct path while the matrix is small (≤ ~Gen 5). When it grows past that:

1. **Define explicit hub round-trips per generation, not per pair.** Each adapter gains
   `toHub(entity) → CanonicalPokemon` and `fromHub(CanonicalPokemon) → entity` (parse/write
   already approximate these). A transfer is then `fromHub(toHub(src))` re-keyed for the
   target — N spokes, no N² edges.
2. **Make the hub lossless-where-possible + explicitly lossy-where-not.** Fields absent in
   the target generation are dropped with a recorded warning (the converter already returns
   `warnings[]`); fields absent in the *hub* must be carried in `genExtension` so a
   round-trip back to the origin generation can restore them.
3. **Validate at the target, not in the converter.** Legality/consistency belongs in the
   `lib/legality/` boundary (TODO 8.5.4), not scattered across transfer code.

## Invariant to preserve

The hub key (`dexId`) must survive a round-trip: converting an entity to another generation
and back must preserve its National Dex identity (modulo entities that legitimately can't
exist in the intermediate generation, which are rejected outright). This is locked by a test
in `tests/crossGenTransfer.test.ts`.
