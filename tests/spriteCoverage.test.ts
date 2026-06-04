/**
 * Sprite coverage for Gen 3 species (TODO §4 — confirm 252–386 resolve).
 *
 * Sprite URLs are templated by Dex ID, so master/artwork already cover every
 * generation; game-specific gracefully falls back to the master sprite for any
 * version not yet in VERSION_SPRITE_MAP (i.e. Gen 3+). These tests lock that so a
 * future change can't silently break Gen 3 sprite resolution.
 */
import { describe, it, expect } from 'vitest';
import { getPokemonSpriteUrl, getArtworkSpriteUrl } from '../lib/sprites';

// A spread of Gen 3 National Dex IDs (Treecko … Deoxys).
const GEN3_IDS = [252, 280, 300, 350, 384, 386];

describe('Gen 3 sprite coverage (TODO §4)', () => {
  it('master mode resolves a real URL for every Gen 3 species', () => {
    for (const id of GEN3_IDS) {
      const url = getPokemonSpriteUrl(id, 'master');
      expect(url).toContain(`/pokemon/${id}.png`);
    }
  });

  it('artwork mode resolves official artwork for Gen 3 species', () => {
    for (const id of GEN3_IDS) {
      expect(getArtworkSpriteUrl(id)).toContain(`/official-artwork/${id}.png`);
      expect(getPokemonSpriteUrl(id, 'artwork')).toContain(`/official-artwork/${id}.png`);
    }
  });

  it('game-specific mode falls back to the master sprite for an unmapped (Gen 3) version', () => {
    // 'Ruby' is not yet in VERSION_SPRITE_MAP — must fall back, not throw or 404 a bad path.
    const url = getPokemonSpriteUrl(384, 'game-specific', 'Ruby');
    expect(url).toContain('/pokemon/384.png');
    expect(url).not.toContain('undefined');
  });

  it('game-specific mode still uses the version folder for a mapped (Gen 1/2) version', () => {
    const url = getPokemonSpriteUrl(151, 'game-specific', 'Crystal');
    expect(url).toContain('generation-ii');
    expect(url).toContain('crystal');
  });
});
