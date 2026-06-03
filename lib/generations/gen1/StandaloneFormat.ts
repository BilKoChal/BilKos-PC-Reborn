import { IStandalonePokemonFormat } from '../../interfaces';
import { PokemonStats } from '../../parser/types';
import { parsePk1 } from './parser';
import { createPk1Binary } from './writer';

/**
 * Standalone Pokemon format handler for Generation 1.
 * Implements the PKHeX-compatible .pk1 format:
 *   - International: 69 bytes (PokeList1 INT)
 *   - Japanese: 59 bytes (PokeList1 JPN)
 *   - Also accepts: 66 (legacy), 44 (raw party), 33 (raw box)
 * 
 * Species in the PokeList1 header uses Gen 1 INTERNAL species IDs
 * (not National Dex!). Pokemon data is always party format (44 bytes).
 * No encryption. No header padding.
 */
export class Gen1StandaloneFormat implements IStandalonePokemonFormat {
  fileExtension = '.pk1';
  acceptPattern = '.pk1';
  expectedSizes = { international: 69, japanese: 59 };
  hasEncryption = false;
  hasAbilities = false;
  hasNatures = false;

  // Struct geometry + crypto contract (TODO 1.3). Gen 1 is plaintext.
  boxStructSize = 33;
  partyStructSize = 44;
  checksumOffsets: number[] = []; // Gen 1 .pk1 has no per-entity checksum
  decryptBlock(buffer: Uint8Array): Uint8Array { return buffer; } // identity
  encryptBlock(buffer: Uint8Array): Uint8Array { return buffer; } // identity

  createFile(mon: PokemonStats, region?: string): Uint8Array {
    return createPk1Binary(mon, region === 'japanese' ? 'japanese' : 'international');
  }

  parseFile(buffer: Uint8Array, region?: string): PokemonStats {
    const result = parsePk1(buffer);
    if (!result) {
      throw new Error(`Failed to parse .pk1 file (size: ${buffer.length})`);
    }
    return result;
  }

  validateFile(buffer: Uint8Array): { valid: boolean; error?: string } {
    const size = buffer.length;
    if (size === 69 || size === 59 || size === 66 || size === 44 || size === 33) {
      return { valid: true };
    }
    return { valid: false, error: `Invalid .pk1 file size: ${size}. Expected 69 (INT), 59 (JPN), 66 (legacy), 44 (party), or 33 (box).` };
  }
}
