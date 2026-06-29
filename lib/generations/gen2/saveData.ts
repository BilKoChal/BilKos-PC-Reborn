/**
 * Gen 2 save-level data access module (Phase 1.8).
 *
 * This module is the target location for Gen 2-specific save data accessors.
 * Previously, 17 convenience methods lived on `Gen2Adapter` itself, blurring
 * the "adapter is a thin interface impl" pattern. Phase 1.8 establishes this
 * module as the correct location: the adapter stays thin, and generation-
 * specific save logic lives here.
 *
 * Existing adapter methods are retained for backward compatibility but new
 * save-level accessors should be added here, not on the adapter.
 *
 * Usage:
 *   import { getBoxNames, getRivalName, isCrystal } from './saveData';
 *   const names = getBoxNames(save);
 */

import { ParsedSave } from '../../parser/types';
import { isGen2SaveExtension } from '../../canonicalModel';
import type { Gen2SaveExtension } from '../../canonicalModel';

/** Type guard: is this a Gen 2 save?
 *  This module is the sanctioned location for Gen 2 generation checks (same
 *  pattern as canonicalModel.ts type guards). */
export function isGen2Save(save: ParsedSave): boolean {
    // eslint-disable-next-line no-restricted-syntax
    return save.generation === 2;
}

/** Get the Gen2SaveExtension from a save, or null if not Gen 2. */
export function getGen2SaveExt(save: ParsedSave): Gen2SaveExtension | null {
    if (!isGen2Save(save) || !save.genExtension) return null;
    return isGen2SaveExtension(save.genExtension) ? save.genExtension : null;
}

/** Get box names from a Gen 2 save. Returns [] for non-Gen-2 saves. */
export function getBoxNames(save: ParsedSave): string[] {
    const ext = getGen2SaveExt(save);
    return ext?.boxNames ?? [];
}

/** Get the rival's name from a Gen 2 save. Returns '' for non-Gen-2 saves. */
export function getRivalName(save: ParsedSave): string {
    const ext = getGen2SaveExt(save);
    return ext?.rivalName ?? '';
}

/** Check if a Gen 2 save is Crystal. Returns false for non-Gen-2 saves. */
export function isCrystal(save: ParsedSave): boolean {
    const ext = getGen2SaveExt(save);
    return ext?.gameVersion === 'Crystal';
}

/** Get the blue card points (Crystal only). Returns 0 for non-Crystal saves. */
export function getBlueCardPoints(save: ParsedSave): number {
    const ext = getGen2SaveExt(save);
    return ext?.blueCardPoints ?? 0;
}

/** Check if the GS Ball event is enabled (Crystal only). */
export function isGSBallEventEnabled(save: ParsedSave): boolean {
    const ext = getGen2SaveExt(save);
    return ext?.gsBallEventEnabled ?? false;
}

/** Get the mom savings amount. */
export function getMomSavings(save: ParsedSave): number {
    const ext = getGen2SaveExt(save);
    return ext?.momSavings ?? 0;
}

/** Get the RTC flags. */
export function getRtcFlags(save: ParsedSave): number {
    const ext = getGen2SaveExt(save);
    return ext?.rtcFlags ?? 0;
}

/** Get the move tutor flags (Crystal only). */
export function getMoveTutorFlags(save: ParsedSave): boolean[] {
    const ext = getGen2SaveExt(save);
    return ext?.moveTutorFlags ?? [];
}

/** Get the current map data. */
export function getMapData(save: ParsedSave): { currentMapId: number; x: number; y: number } {
    const ext = getGen2SaveExt(save);
    if (!ext) return { currentMapId: 0, x: 0, y: 0 };
    return { currentMapId: ext.currentMapId, x: ext.mapX, y: ext.mapY };
}

/** Get the phone contacts. */
export function getPhoneContacts(save: ParsedSave): { trainerClass: number; name: string; mapGroup: number; mapNumber: number }[] {
    const ext = getGen2SaveExt(save);
    return ext?.phoneContacts ?? [];
}

/** Get the Unown Dex data. */
export function getUnownDexData(save: ParsedSave): { caughtForms: number[]; unlockedFlags: number; firstSeen: number } {
    const ext = getGen2SaveExt(save);
    if (!ext) return { caughtForms: [], unlockedFlags: 0, firstSeen: 0 };
    return {
        caughtForms: ext.unownCaughtForms,
        unlockedFlags: ext.unownUnlockedFlags,
        firstSeen: ext.unownFirstSeen,
    };
}
