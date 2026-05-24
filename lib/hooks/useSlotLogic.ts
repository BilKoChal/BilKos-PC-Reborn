import React, { useRef, useCallback } from 'react';
import { PokemonStats } from '../parser/types';
import { setDragData, parseDragData, DragPayload, DND_DATA_TYPE } from './dndTypes';

interface UseSlotLogicProps {
    mon: PokemonStats | undefined;
    index: number;
    boxIndex?: number;
    isMoveMode?: boolean;
    isSelected?: boolean;
    tabId?: string;
    onEnableMoveMode?: () => void;
    onToggleSelection?: (index: number, boxIndex?: number) => void;
    onPokemonClick?: (mon: PokemonStats, index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    onEmptySlotClick?: (index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    onDropPokemon?: (index: number, boxIndex: number | undefined, e: React.DragEvent) => void;
    /** Called when a drag session begins — stores drag source in ref, clears click-selections */
    onBeginDragSession?: (tabId: string, location: { type: 'party'; index: number } | { type: 'box'; boxIndex: number; index: number }) => void;
    /** Called when a drag session ends (cancel or complete) — cleans up drag state */
    onEndDragSession?: () => void;
}

export const useSlotLogic = ({
    mon, index, boxIndex, isMoveMode, isSelected, tabId,
    onEnableMoveMode, onToggleSelection, onPokemonClick, onEmptySlotClick, onDropPokemon,
    onBeginDragSession, onEndDragSession
}: UseSlotLogicProps) => {
    
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent) => {
        // FIX (Phase 2): Remove onEnableMoveMode() from handleDragStart entirely.
        // Auto-enabling Move Mode on drag was a design antipattern that created
        // an async state race: onEnableMoveMode() sets React state asynchronously,
        // but the isMoveMode check below reads the stale (false) value.
        //
        // The drag payload (dataTransfer) is set unconditionally from the slot's
        // own props — no state dependency. This eliminates the race entirely.
        //
        // The long-press → Move Mode path for mobile is NOT affected (see handlePointerDown).

        if (!mon) {
            e.preventDefault();
            return;
        }

        const type = boxIndex !== undefined ? 'box' : 'party';
        const location = type === 'box' 
            ? { type: 'box' as const, boxIndex: boxIndex!, index } 
            : { type: 'party' as const, index };

        const payload: DragPayload = {
            type: 'POKEMON',
            pokemonLocation: location,
            sourceTabId: tabId || '',
            description: mon.nickname
        };

        setDragData(e, payload);

        // Notify the move mode system that a drag session has started.
        // This clears click-selections and stores the drag source in a ref.
        if (onBeginDragSession && tabId) {
            onBeginDragSession(tabId, location);
        }

        // NOTE: We do NOT call onToggleSelection here. The drag payload is
        // the sole source of truth for drag operations. Click-selections are
        // a completely separate system.
    }, [mon, boxIndex, index, tabId, onBeginDragSession]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        // Check if this is our custom drag type
        if (e.dataTransfer.types.includes(DND_DATA_TYPE)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        if (onDropPokemon) {
            e.preventDefault();
            onDropPokemon(index, boxIndex, e);
        }
    }, [onDropPokemon, index, boxIndex]);

    /**
     * FIX (Phase 2): onDragEnd handler that was completely missing.
     * Called when a drag ends — whether by dropping on a target, pressing Escape,
     * or releasing outside the browser window. Cleans up any orphaned drag state.
     */
    const handleDragEnd = useCallback(() => {
        if (onEndDragSession) {
            onEndDragSession();
        }
    }, [onEndDragSession]);

    const handlePointerDown = useCallback(() => {
        if (isMoveMode) return;
        timerRef.current = setTimeout(() => {
            if (onEnableMoveMode) {
                onEnableMoveMode();
                if (navigator.vibrate) navigator.vibrate(50);
                // Also select the item that was long-pressed
                if (onToggleSelection) onToggleSelection(index, boxIndex);
            }
        }, 500); 
    }, [isMoveMode, onEnableMoveMode, onToggleSelection, index, boxIndex]);

    const handlePointerUp = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (mon) {
            onPokemonClick && onPokemonClick(mon, index, boxIndex, e);
        } else {
            onEmptySlotClick && onEmptySlotClick(index, boxIndex, e);
        }
    }, [mon, index, boxIndex, onPokemonClick, onEmptySlotClick]);

    return {
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        handlePointerDown,
        handlePointerUp,
        handleClick
    };
};
