/**
 * Gen 3 trainer-ID + shiny helper tests (TODO §4 — secretId).
 */
import { describe, it, expect } from 'vitest';
import {
  combinedTrainerId,
  splitTrainerId,
  shinyValueGen3,
  isShinyGen3,
  SHINY_THRESHOLD_GEN3,
} from '../lib/generations/gen3/identity';

describe('Gen 3 trainer ID (TID/SID)', () => {
  it('combines and splits as inverses', () => {
    const otid = combinedTrainerId(54321, 12345);
    expect(splitTrainerId(otid)).toEqual({ tid: 54321, sid: 12345 });
  });

  it('TID occupies the low 16 bits, SID the high 16 bits', () => {
    expect(combinedTrainerId(0x1234, 0xabcd)).toBe(0xabcd1234);
  });

  it('masks values beyond 16 bits', () => {
    expect(splitTrainerId(0xffff_ffff)).toEqual({ tid: 0xffff, sid: 0xffff });
  });
});

describe('Gen 3 shininess', () => {
  it('shiny value is TID ^ SID ^ PIDhi ^ PIDlo', () => {
    // PID 0x00000000, TID 0, SID 0 → value 0 → shiny.
    expect(shinyValueGen3(0, 0, 0)).toBe(0);
    expect(isShinyGen3(0, 0, 0)).toBe(true);
  });

  it('a value at the threshold is NOT shiny', () => {
    // Construct PID so that value === threshold (8): pidLow=8, others 0.
    expect(shinyValueGen3(0x0000_0008, 0, 0)).toBe(SHINY_THRESHOLD_GEN3);
    expect(isShinyGen3(0x0000_0008, 0, 0)).toBe(false);
  });

  it('a value just under the threshold IS shiny', () => {
    expect(shinyValueGen3(0x0000_0007, 0, 0)).toBe(7);
    expect(isShinyGen3(0x0000_0007, 0, 0)).toBe(true);
  });

  it('IDs that cancel the PID halves produce a shiny', () => {
    // PID hi=0x1234, lo=0x5678; pick TID=0x1234, SID=0x5678 → value 0.
    const pid = 0x1234_5678;
    expect(isShinyGen3(pid, 0x1234, 0x5678)).toBe(true);
  });
});
