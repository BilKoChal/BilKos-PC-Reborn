import { logger } from '../utils/logger';
import React from 'react';
import { MoveLocation } from '../utils/manipulation';

// --- Types ---

export interface DragPayload {
    type: 'POKEMON';
    pokemonLocation: MoveLocation;
    sourceTabId: string;
    description?: string;
}

// --- Constants ---
export const DND_DATA_TYPE = 'application/x-bilkos-pc-drag';

/**
 * Custom DOM event name fired when a drag session ends (drop or cancel).
 * All slot components listen for this to reset their isDragOver state,
 * since dragLeave doesn't fire on target slots when a drag is cancelled
 * (Escape key, drop outside browser window, etc.).
 */
export const DND_END_EVENT = 'bilkos:drag-end';

// --- Helpers ---

export function serializeDragData(payload: DragPayload): string {
    return JSON.stringify(payload);
}

export function parseDragData(dataTransfer: DataTransfer): DragPayload | null {
    try {
        const data = dataTransfer.getData(DND_DATA_TYPE);
        if (!data) return null;
        return JSON.parse(data) as DragPayload;
    } catch (e) {
        logger.error("DND Parse Error", e);
        return null;
    }
}

export function setDragData(e: React.DragEvent, payload: DragPayload) {
    e.dataTransfer.setData(DND_DATA_TYPE, serializeDragData(payload));
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * Dispatch a global custom event to notify all slot components
 * that a drag session has ended. Called from handleDragEnd on the source slot.
 */
export function dispatchDragEnd() {
    document.dispatchEvent(new CustomEvent(DND_END_EVENT));
}
