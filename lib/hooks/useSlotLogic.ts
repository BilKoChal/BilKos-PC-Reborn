import React, { useRef } from 'react';
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
}

export const useSlotLogic = ({
    mon, index, boxIndex, isMoveMode, isSelected, tabId,
    onEnableMoveMode, onToggleSelection, onPokemonClick, onEmptySlotClick, onDropPokemon
}: UseSlotLogicProps) => {
    
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDragStart = (e: React.DragEvent) => {
        // Auto-Enable Move Mode
        if (!isMoveMode && mon && onEnableMoveMode) {
            onEnableMoveMode();
        }

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

        // Auto-select if in move mode and not already selected
        if (isMoveMode && !isSelected && onToggleSelection) {
            onToggleSelection(index, boxIndex);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        // Check if this is our custom drag type
        if (e.dataTransfer.types.includes(DND_DATA_TYPE)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        if (onDropPokemon) {
            e.preventDefault();
            onDropPokemon(index, boxIndex, e);
        }
    };

    const handlePointerDown = () => {
        if (isMoveMode) return;
        timerRef.current = setTimeout(() => {
            if (onEnableMoveMode) {
                onEnableMoveMode();
                if (navigator.vibrate) navigator.vibrate(50);
                // Also select the item that was long-pressed
                if (onToggleSelection) onToggleSelection(index, boxIndex);
            }
        }, 500); 
    };

    const handlePointerUp = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (mon) {
            onPokemonClick && onPokemonClick(mon, index, boxIndex, e);
        } else {
            onEmptySlotClick && onEmptySlotClick(index, boxIndex, e);
        }
    };

    return {
        handleDragStart,
        handleDragOver,
        handleDrop,
        handlePointerDown,
        handlePointerUp,
        handleClick
    };
};
