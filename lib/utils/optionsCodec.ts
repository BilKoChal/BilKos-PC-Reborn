/**
 * Shared options-byte codec for Gen 1/2 (Phase 1.6).
 *
 * The options byte is shared between Gen 1 and Gen 2 with minor differences:
 * - Bits 0-2: Text speed (1=Fast, 3=Normal, 5=Slow, 0=Instant)
 * - Bit 3: Sound (Gen 1: 0=Mono, 1=Stereo; Gen 2: same bit, plus Earphone options in bits 4-5)
 * - Bits 4-5: Sound (Gen 2 only: 0=Mono, 1=Stereo, 2=Earphone1, 3=Earphone2... actually Gen 2
 *   uses bits 4-5 for the full sound setting: 00=Mono, 01=Stereo, 10=Earphone1, 11=Earphone2)
 *   Wait — actually Gen 2's bit layout is: bit 3 is unused, bits 4-5 are the sound setting.
 *   Gen 1 uses bit 3 only.
 * - Bit 6: Battle style (0=Shift, 1=Set)
 * - Bit 7: Battle animation (0=On, 1=Off)
 *
 * This module extracts the shared speed/battle decode/encode logic so both
 * generations use the same code instead of duplicating it.
 */
import type { GameOptions } from '../parser/types';

/** Decode text speed from the low 3 bits. */
export function decodeTextSpeed(speedBits: number): string {
    if (speedBits === 1) return 'Fast';
    if (speedBits === 5) return 'Slow';
    if (speedBits === 3) return 'Normal';
    if (speedBits === 0) return 'Instant';
    return speedBits.toString();
}

/** Encode text speed string to the low 3 bits. */
export function encodeTextSpeed(speed: string): number {
    if (speed === 'Fast' || speed === '1') return 1;
    if (speed === 'Slow' || speed === '5') return 5;
    if (speed === 'Instant' || speed === '0') return 0;
    if (speed === 'Normal' || speed === '3') return 3;
    const parsed = parseInt(speed, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 7) return parsed;
    return 3; // default Normal
}

/** Decode battle animation from bit 7. */
export function decodeBattleAnimation(byte: number): 'On' | 'Off' {
    return (byte & 0x80) ? 'Off' : 'On';
}

/** Decode battle style from bit 6. */
export function decodeBattleStyle(byte: number): 'Shift' | 'Set' {
    return (byte & 0x40) ? 'Set' : 'Shift';
}

/** Encode battle animation + battle style into the upper 2 bits. */
export function encodeBattleSettings(options: Pick<GameOptions, 'battleAnimation' | 'battleStyle'>): number {
    let byte = 0;
    if (options.battleAnimation === 'Off') byte |= 0x80;
    if (options.battleStyle === 'Set') byte |= 0x40;
    return byte;
}
