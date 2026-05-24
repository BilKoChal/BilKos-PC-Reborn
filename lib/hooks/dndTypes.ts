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
        console.error("DND Parse Error", e);
        return null;
    }
}

export function setDragData(e: React.DragEvent, payload: DragPayload) {
    e.dataTransfer.setData(DND_DATA_TYPE, serializeDragData(payload));
    e.dataTransfer.effectAllowed = 'move';
}
