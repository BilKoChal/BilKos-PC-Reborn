/**
 * Gen 3 TM/HM → move ID mapping (Phase 2 Sprint 5).
 * 50 TMs + 8 HMs = 58 entries.
 * Source: PKHeX TMsRS / Bulbapedia
 */
export const GEN3_TM_HM_MOVES: readonly number[] = [
  // TM01-TM10
  264, 337, 352, 347, 46, 92, 258, 249, 331, 237,
  // TM11-TM20
  241, 269, 58, 59, 63, 113, 182, 240, 202, 203,
  // TM21-TM30
  218, 76, 231, 87, 89, 216, 91, 94, 247, 280,
  // TM31-TM40
  189, 104, 322, 9, 207, 214, 188, 126, 129, 332,
  // TM41-TM50
  259, 263, 290, 156, 213, 168, 211, 7, 210, 171,
  // HM01-HM08
  15, 19, 57, 70, 148, 249, 127, 291,
];

export function getGen3TmMove(tmIndex: number): number {
  return GEN3_TM_HM_MOVES[tmIndex] || 0;
}
