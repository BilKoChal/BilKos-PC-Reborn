/**
 * Shared `React.memo` comparator for Pokémon slot components (TODO §3).
 *
 * `PCStorage`'s box-slot and `PartyList`'s party-slot both re-render on the same
 * core set of props. Their comparators had drifted into two near-identical inline
 * copies; this centralises the shared fields so a new prop is added in one place.
 * Components compose this with any extra fields they own (e.g. PCStorage's
 * `viewMode` / `viewedBoxIndex`).
 */
export interface SharedSlotMemoProps {
  mon: unknown;
  isSelected?: boolean;
  isMoveMode?: boolean;
  gameVersion?: unknown;
  tabId?: unknown;
  spriteMode?: unknown;
  onDropPokemon?: unknown;
}

/** True when the shared slot props are referentially/identically equal. */
export function arePokemonSlotPropsEqual(prev: SharedSlotMemoProps, next: SharedSlotMemoProps): boolean {
  return (
    prev.mon === next.mon &&
    prev.isSelected === next.isSelected &&
    prev.isMoveMode === next.isMoveMode &&
    prev.gameVersion === next.gameVersion &&
    prev.tabId === next.tabId &&
    prev.spriteMode === next.spriteMode &&
    prev.onDropPokemon === next.onDropPokemon
  );
}
