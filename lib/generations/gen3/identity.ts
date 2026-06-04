/**
 * Gen 3 trainer-ID and shininess helpers (TODO §4 — secretId).
 *
 * From Gen 3 onward a trainer is identified by a 32-bit value split into a
 * public Trainer ID (TID, low 16 bits) and a Secret ID (SID, high 16 bits) —
 * the `Gen3Extension.secretId` the CDM already reserves. Shininess is derived
 * from the PID and both IDs, so these pure helpers are the durable core that a
 * future Gen 3 parser/UI will plug `secretId` into.
 */

/** Combine a 16-bit TID and 16-bit SID into the stored 32-bit OT ID. */
export function combinedTrainerId(tid: number, sid: number): number {
  return (((sid & 0xffff) << 16) | (tid & 0xffff)) >>> 0;
}

/** Split a stored 32-bit OT ID back into `{ tid, sid }`. */
export function splitTrainerId(otid: number): { tid: number; sid: number } {
  const v = otid >>> 0;
  return { tid: v & 0xffff, sid: (v >>> 16) & 0xffff };
}

/**
 * The Gen 3 "shiny value": `TID ^ SID ^ PID_high ^ PID_low`. A Pokémon is shiny
 * when this is below the shiny threshold (8 in Gen 3-5).
 */
export function shinyValueGen3(pid: number, tid: number, sid: number): number {
  const p = pid >>> 0;
  return ((tid & 0xffff) ^ (sid & 0xffff) ^ ((p >>> 16) & 0xffff) ^ (p & 0xffff)) & 0xffff;
}

/** Gen 3-5 shiny threshold. */
export const SHINY_THRESHOLD_GEN3 = 8;

/** True when the PID/ID combination yields a shiny Pokémon (Gen 3-5 rule). */
export function isShinyGen3(pid: number, tid: number, sid: number): boolean {
  return shinyValueGen3(pid, tid, sid) < SHINY_THRESHOLD_GEN3;
}
