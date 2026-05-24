import React, { useRef } from 'react';
import { PokemonStats } from '../parser/types';

interface UseSlotLogicProps {
    mon: PokemonStats | undefined;
    index: number;
    boxIndex?: number;
    isMoveMode?: boolean;
    isSelected?: boolean;
    onEnableMoveMode?: () => void;
    onToggleSelection?: (index: number, boxIndex?: number) => void;
    onPokemonClick?: (mon: PokemonStats, index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    onEmptySlotClick?: (index: number, boxIndex: number | undefined, e: React.MouseEvent) => void;
    onDropPokemon?: (index: number, boxIndex: number | undefined, e: React.DragEvent) => void;
}

export const useSlotLogic = ({
    mon, index, boxIndex, isMoveMode, isSelected,
    onEnableMoveMode, onToggleSelection, onPokemonClick, onEmptySlotClick, onDropPokemon
}: UseSlotLogicProps) => {
    
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDragStart = (e: React.DragEvent) => {
        // Auto-Enable Move Mode
        if (!isMoveMode && mon && onEnableMoveMode) {
            onEnableMoveMode();
        }

        const type = boxIndex !== undefined ? 'box' : 'party';
        
        // If not empty, set data
        if (mon || !isMoveMode) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({ type, boxIndex, index }));
        }

        // Auto-select if in move mode and not already selected
        if (isMoveMode && !isSelected && onToggleSelection) {
            onToggleSelection(index, boxIndex);
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
        // Prevent click if we just finished a long press? 
        // Logic handled by mode switch usually.
        if (mon) {
            onPokemonClick && onPokemonClick(mon, index, boxIndex, e);
        } else {
            onEmptySlotClick && onEmptySlotClick(index, boxIndex, e);
        }
    };

    return {
        handleDragStart,
        handleDrop,
        handlePointerDown,
        handlePointerUp,
        handleClick
    };
};