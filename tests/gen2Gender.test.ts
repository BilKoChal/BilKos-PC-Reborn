/**
 * Gen 2 gender ↔ Attack DV recalculation (bug fix).
 *
 * GSC gender is a function of the Attack DV, exactly like shininess. The editor
 * recomputes `isShiny` on every stat recalculation but used to leave `gender`
 * stale, so changing the Attack DV (or maxing IVs) could leave a Pokémon showing
 * the wrong gender. `Gen2Adapter.recalculateStats` now re-derives gender too.
 */
import { describe, it, expect } from 'vitest';
import { Gen2Adapter } from '../lib/generations/gen2/Gen2Adapter';
import { isGen2Extension } from '../lib/parser/types';
import { createEmptyCanonicalPokemon } from '../lib/canonicalModel';

const adapter = new Gen2Adapter();

// Pidgey (#16) is a 50/50 species: Female when Attack DV <= 7, else Male.
function pidgey(atkDv: number, gender = 'Male') {
  return createEmptyCanonicalPokemon({
    speciesId: 16,
    dexId: 16,
    speciesName: 'Pidgey',
    level: 20,
    gender,
    iv: { hp: 0, attack: atkDv, defense: 10, speed: 10, special: 10, spAtk: 10, spDef: 10 },
  });
}

describe('Gen 2 gender follows the Attack DV on recalc (bug fix)', () => {
  it('re-derives Female for a low Attack DV even if the stored gender said Male', () => {
    const result = adapter.recalculateStats(pidgey(3, 'Male'), adapter.getBaseStats(16)!);
    expect(result.gender).toBe('Female');
  });

  it('re-derives Male for a high Attack DV even if the stored gender said Female', () => {
    const result = adapter.recalculateStats(pidgey(15, 'Female'), adapter.getBaseStats(16)!);
    expect(result.gender).toBe('Male');
  });

  it('keeps the genExtension gender in sync with the universal field', () => {
    const result = adapter.recalculateStats(pidgey(2, 'Male'), adapter.getBaseStats(16)!);
    expect(result.gender).toBe('Female');
    if (isGen2Extension(result.genExtension)) {
      expect(result.genExtension.gender).toBe('Female');
    }
  });

  it('leaves an egg Genderless regardless of Attack DV', () => {
    const egg = pidgey(15, 'Male');
    egg.isEgg = true;
    const result = adapter.recalculateStats(egg, adapter.getBaseStats(16)!);
    expect(result.gender).toBe('Genderless');
  });
});
