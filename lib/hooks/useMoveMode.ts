import React, { useState, useCallback, useRef } from 'react';
import { MoveLocation, isSameLocation, transferPokemonBatch, movePokemonBatch } from '../utils/manipulation';
import { ParsedSave } from '../parser/types';
import { parseDragData, DragPayload, DND_DATA_TYPE } from './dndTypes';

/**
 * Tracks the source (tab + location) of a selected Pokemon in move mode.
 */
export interface GlobalMoveSource {
    tabId: string;
    location: MoveLocation;
}

/**
 * Tracks the active drag session independently from click-select state.
 * This is stored in a ref (not React state) to avoid stale-closure issues
 * during the drag lifecycle.
 */
export interface ActiveDragSource {
    tabId: string;
    location: MoveLocation;
}

/**
 * Custom hook for managing global move mode state and operations.
 *
 * ARCHITECTURE: Two fully independent interaction systems
 * ─────────────────────────────────────────────────────
 * 🖱 Click-select system: Click → select → click target → execute via selectedMoveLocations
 * 🖐 Drag system: dragStart → set payload → drop → read payload only
 *
 * These two systems NEVER share state:
 * - A drag operation is determined ENTIRELY by the dataTransfer payload
 * - A click-select operation uses selectedMoveLocations only
 * - Starting a drag clears selectedMoveLocations and stores source in activeDragSource ref
 * - Dropping never reads selectedMoveLocations; it reads the payload
 * - Clicking never reads or modifies activeDragSource
 */
export function useMoveMode(
    getTab: (tabId: string) => { id: string; data: ParsedSave } | undefined,
    getActiveTabId: () => string | null,
    getActiveTabData: () => ParsedSave | undefined,
    onUpdateSave: (tabId: string, data: ParsedSave) => void,
    showToast: (msg: string) => void
) {
    const [isMoveMode, setIsMoveMode] = useState(false);
    const [selectedMoveLocations, setSelectedMoveLocations] = useState<GlobalMoveSource[]>([]);

    // Active drag source stored in a ref to avoid stale closure / async state race
    const activeDragSourceRef = useRef<ActiveDragSource | null>(null);

    const handleMoveModeToggle = useCallback((val: boolean) => {
        setIsMoveMode(val);
        setSelectedMoveLocations([]);
        activeDragSourceRef.current = null;
        if (val) {
            showToast("Move Mode Active! Click to select, then click target to swap/move. Use Ctrl/Shift or checkbox for multi-select.");
        }
    }, [showToast]);

    const isSelected = useCallback((tabId: string, loc: MoveLocation) => {
        return selectedMoveLocations.some(s => s.tabId === tabId && isSameLocation(s.location, loc));
    }, [selectedMoveLocations]);

    const handleSelectionToggle = useCallback((location: MoveLocation) => {
        const activeTabId = getActiveTabId();
        const activeData = getActiveTabData();
        if (!activeTabId || !activeData) return;

        const targetBoxList = location.type === 'party' ? activeData.party : activeData.pcBoxes[location.boxIndex]!;
        const targetMon = targetBoxList[location.index];
        if (!targetMon) return;

        if (isSelected(activeTabId, location)) {
            setSelectedMoveLocations(prev => prev.filter(s => !(s.tabId === activeTabId && isSameLocation(s.location, location))));
        } else {
            setSelectedMoveLocations(prev => [...prev, { tabId: activeTabId, location }]);
        }
    }, [getActiveTabId, getActiveTabData, isSelected]);

    // ──────────────────────────────────────────────
    // Shared Move Execution Logic (used by both paths)
    // ──────────────────────────────────────────────
    const executeMoveOperation = useCallback((sources: GlobalMoveSource[], targetLocation: MoveLocation) => {
        if (!sources.length) return;

        const activeTabId = getActiveTabId();
        const activeData = getActiveTabData();
        if (!activeTabId || !activeData) return;

        const firstSource = sources[0]!;
        const sourceTab = getTab(firstSource.tabId);
        const targetTab = getTab(activeTabId);

        if (!sourceTab || !targetTab) return;

        // FIX (Phase 3): Use tabId string comparison instead of object reference equality
        const isSameSave = sourceTab.id === targetTab.id;

        const validSources = sources
            .filter(s => s.tabId === firstSource.tabId)
            .map(s => s.location);

        const targetList = targetLocation.type === 'party'
            ? targetTab.data.party
            : targetTab.data.pcBoxes[targetLocation.boxIndex]!;
        const targetMon = targetList[targetLocation.index];

        const isTargetOccupied = !!targetMon;

        const isSameContainer = isSameSave && (
            (firstSource.location.type === 'party' && targetLocation.type === 'party') ||
            (firstSource.location.type === 'box' && targetLocation.type === 'box' && firstSource.location.boxIndex === targetLocation.boxIndex)
        );

        if (!isTargetOccupied && isSameContainer) {
            const result = movePokemonBatch(activeData, validSources, targetLocation);
            if (result.success && result.newData) {
                onUpdateSave(activeTabId, result.newData);
                setSelectedMoveLocations([]);
                showToast("Reordered successfully!");
            } else {
                showToast(result.error || "Move failed.");
            }
        } else {
            const result = transferPokemonBatch(sourceTab.data, targetTab.data, validSources, targetLocation, isSameSave);

            if (result.success && result.newSource && result.newTarget) {
                if (isSameSave) {
                    onUpdateSave(sourceTab.id, result.newSource);
                } else {
                    onUpdateSave(sourceTab.id, result.newSource);
                    onUpdateSave(targetTab.id, result.newTarget);
                }
                setSelectedMoveLocations([]);
                showToast(isSameSave ? "Moved successfully!" : "Transferred between saves!");
            } else {
                showToast(result.error || "Transfer failed.");
            }
        }
    }, [getActiveTabId, getActiveTabData, getTab, onUpdateSave, showToast]);

    // ──────────────────────────────────────────────
    // DRAG PATH: beginDragSession / handleDragDrop / endDragSession
    // ──────────────────────────────────────────────

    /**
     * Called when a drag starts. Clears click-selections and stores the drag
     * source in a ref (not state) to avoid async state races.
     */
    const beginDragSession = useCallback((tabId: string, location: MoveLocation) => {
        // Clear click-selections — drag takes over
        setSelectedMoveLocations([]);
        activeDragSourceRef.current = { tabId, location };
    }, []);

    /**
     * Handle drop event from HTML5 drag-and-drop.
     * Reads ENTIRELY from the dataTransfer payload — NEVER from selectedMoveLocations.
     */
    const handleDragDrop = useCallback((target: MoveLocation, e?: React.DragEvent) => {
        const activeTabId = getActiveTabId();
        if (!activeTabId) return;

        let sourcesToMove: GlobalMoveSource[] = [];

        // DRAG PATH: Always read from payload, ignore selectedMoveLocations
        if (e) {
            const payload = parseDragData(e.dataTransfer);
            if (payload && payload.type === 'POKEMON' && payload.pokemonLocation) {
                const sourceTabId = payload.sourceTabId || activeTabId;
                sourcesToMove = [{ tabId: sourceTabId, location: payload.pokemonLocation }];
            }
        } else if (activeDragSourceRef.current) {
            // Fallback: touch drag or other non-event drop — use ref data
            sourcesToMove = [{ tabId: activeDragSourceRef.current.tabId, location: activeDragSourceRef.current.location }];
        }

        if (sourcesToMove.length === 0) return;

        // Don't drop on the same location as the source
        const src = sourcesToMove[0]!;
        if (src.tabId === activeTabId && isSameLocation(src.location, target)) {
            activeDragSourceRef.current = null;
            return;
        }

        executeMoveOperation(sourcesToMove, target);

        // Clean up drag session
        activeDragSourceRef.current = null;
    }, [getActiveTabId, executeMoveOperation]);

    /**
     * Called when a drag ends (whether successful or cancelled).
     * Cleans up activeDragSource and any orphaned visual state.
     */
    const endDragSession = useCallback(() => {
        activeDragSourceRef.current = null;
    }, []);

    // ──────────────────────────────────────────────
    // CLICK PATH: handleGlobalPokemonSelect
    // ──────────────────────────────────────────────

    /**
     * Handle Pokemon slot click in move mode.
     *
     * Selection Model:
     * - Click (no modifiers): Select first Pokemon. If already selected, click another to swap/move.
     * - Ctrl/Cmd + Click: Toggle multi-select (like checkbox).
     * - Shift + Click: Range select from last selected.
     * - Checkbox click: Toggle multi-select for that Pokemon.
     */
    const handleGlobalPokemonSelect = useCallback((location: MoveLocation, e?: React.MouseEvent) => {
        const activeTabId = getActiveTabId();
        const activeData = getActiveTabData();
        if (!activeTabId || !activeData) return;

        const targetBoxList = location.type === 'party' ? activeData.party : activeData.pcBoxes[location.boxIndex]!;
        const targetMon = targetBoxList[location.index];
        const isEmpty = !targetMon;

        // --- 1. MODIFIERS (Ctrl/Shift for multi-select) ---
        if (e?.ctrlKey || e?.metaKey) {
            // Ctrl+click = toggle selection (same as checkbox)
            if (isEmpty) return; // Can't select empty slots for multi-select
            handleSelectionToggle(location);
            return;
        }

        if (e?.shiftKey) {
            // Shift+click = range select
            if (isEmpty) return;
            if (selectedMoveLocations.length === 0) {
                setSelectedMoveLocations([{ tabId: activeTabId, location }]);
                return;
            }

            const lastSelected = selectedMoveLocations[selectedMoveLocations.length - 1]!;
            const lastLoc = lastSelected.location;

            if (lastSelected.tabId !== activeTabId) {
                setSelectedMoveLocations([{ tabId: activeTabId, location }]);
                return;
            }

            if (lastLoc.type !== location.type) {
                setSelectedMoveLocations([{ tabId: activeTabId, location }]);
                return;
            }
            if (lastLoc.type === 'box' && location.type === 'box') {
                if (lastLoc.boxIndex !== location.boxIndex) {
                    setSelectedMoveLocations([{ tabId: activeTabId, location }]);
                    return;
                }
            }

            const currentBoxIndex = location.type === 'box' ? location.boxIndex : undefined;
            const start = Math.min(lastLoc.index, location.index);
            const end = Math.max(lastLoc.index, location.index);
            const range: GlobalMoveSource[] = [];

            for (let i = start; i <= end; i++) {
                if (targetBoxList[i]) {
                    let loc: MoveLocation;
                    if (currentBoxIndex !== undefined) {
                        loc = { type: 'box', boxIndex: currentBoxIndex, index: i };
                    } else {
                        loc = { type: 'party', index: i };
                    }
                    range.push({ tabId: activeTabId, location: loc });
                }
            }

            const newSet = [...selectedMoveLocations];
            range.forEach(r => {
                if (!newSet.some(s => s.tabId === r.tabId && isSameLocation(s.location, r.location))) newSet.push(r);
            });
            setSelectedMoveLocations(newSet);
            return;
        }

        // --- 2. NO MODIFIERS ---
        // No selection yet → select this Pokemon
        if (selectedMoveLocations.length === 0) {
            if (!isEmpty) setSelectedMoveLocations([{ tabId: activeTabId, location }]);
            return;
        }

        // Clicking on an already-selected Pokemon → keep it as sole selection
        if (isSelected(activeTabId, location)) {
            setSelectedMoveLocations([{ tabId: activeTabId, location }]);
            return;
        }

        // EXECUTE MOVE/SWAP: Move all selected Pokemon to the clicked target
        executeMoveOperation(selectedMoveLocations, location);
    }, [getActiveTabId, getActiveTabData, selectedMoveLocations, isSelected, handleSelectionToggle, executeMoveOperation]);

    /** Get selections filtered for the current tab */
    const getCurrentTabSelections = useCallback((): MoveLocation[] => {
        const activeTabId = getActiveTabId();
        if (!activeTabId) return [];
        return selectedMoveLocations
            .filter(s => s.tabId === activeTabId)
            .map(s => s.location);
    }, [getActiveTabId, selectedMoveLocations]);

    /** Clean up selections from a closed tab */
    const clearTabSelections = useCallback((tabId: string) => {
        setSelectedMoveLocations(prev => prev.filter(s => s.tabId !== tabId));
    }, []);

    /** Reset all move mode state */
    const resetMoveMode = useCallback(() => {
        setIsMoveMode(false);
        setSelectedMoveLocations([]);
        activeDragSourceRef.current = null;
    }, []);

    return {
        isMoveMode,
        setIsMoveMode: handleMoveModeToggle,
        selectedMoveLocations,
        isSelected,
        handleSelectionToggle,
        handleGlobalPokemonSelect,
        // NEW: separated drag handlers
        handleDragDrop,
        beginDragSession,
        endDragSession,
        // Keep legacy handleGlobalDrop as an alias for backward compatibility during migration
        handleGlobalDrop: handleDragDrop,
        getCurrentTabSelections,
        clearTabSelections,
        resetMoveMode
    };
}
