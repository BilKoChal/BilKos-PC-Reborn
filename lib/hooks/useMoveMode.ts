import { useState, useCallback } from 'react';
import { MoveLocation, isSameLocation, transferPokemonBatch, movePokemonBatch } from '../utils/manipulation';
import { ParsedSave } from '../parser/types';

/**
 * Tracks the source (tab + location) of a selected Pokemon in move mode.
 */
export interface GlobalMoveSource {
    tabId: string;
    location: MoveLocation;
}

/**
 * Custom hook for managing global move mode state and operations.
 * Extracted from App.tsx to encapsulate all move/drag-and-drop logic.
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

    const handleMoveModeToggle = useCallback((val: boolean) => {
        setIsMoveMode(val);
        setSelectedMoveLocations([]);
        if (val) {
            showToast("Move Mode Active! Checkbox to select, Drag to move.");
        }
    }, [showToast]);

    const isSelected = useCallback((tabId: string, loc: MoveLocation) => {
        return selectedMoveLocations.some(s => s.tabId === tabId && isSameLocation(s.location, loc));
    }, [selectedMoveLocations]);

    const handleSelectionToggle = useCallback((location: MoveLocation) => {
        const activeTabId = getActiveTabId();
        const activeData = getActiveTabData();
        if (!activeTabId || !activeData) return;

        const targetBoxList = location.type === 'party' ? activeData.party : activeData.pcBoxes[location.boxIndex];
        const targetMon = targetBoxList[location.index];
        if (!targetMon) return;

        if (isSelected(activeTabId, location)) {
            setSelectedMoveLocations(prev => prev.filter(s => !(s.tabId === activeTabId && isSameLocation(s.location, location))));
        } else {
            setSelectedMoveLocations(prev => [...prev, { tabId: activeTabId, location }]);
        }
    }, [getActiveTabId, getActiveTabData, isSelected]);

    // Shared Move Execution Logic
    const executeMoveOperation = useCallback((sources: GlobalMoveSource[], targetLocation: MoveLocation) => {
        if (!sources.length) return;

        const activeTabId = getActiveTabId();
        const activeData = getActiveTabData();
        if (!activeTabId || !activeData) return;

        const firstSource = sources[0];
        const sourceTab = getTab(firstSource.tabId);
        const targetTab = getTab(activeTabId);

        if (!sourceTab || !targetTab) return;

        const isSameSave = sourceTab.id === targetTab.id;

        const validSources = sources
            .filter(s => s.tabId === firstSource.tabId)
            .map(s => s.location);

        const targetList = targetLocation.type === 'party'
            ? targetTab.data.party
            : targetTab.data.pcBoxes[targetLocation.boxIndex];
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
            const result = transferPokemonBatch(sourceTab.data, targetTab.data, validSources, targetLocation);

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

    const handleGlobalPokemonSelect = useCallback((location: MoveLocation, e?: React.MouseEvent) => {
        const activeTabId = getActiveTabId();
        const activeData = getActiveTabData();
        if (!activeTabId || !activeData) return;

        const targetBoxList = location.type === 'party' ? activeData.party : activeData.pcBoxes[location.boxIndex];
        const targetMon = targetBoxList[location.index];
        const isEmpty = !targetMon;

        // --- 1. MODIFIERS (Shift/Ctrl) ---
        if (e?.ctrlKey || e?.metaKey) {
            handleSelectionToggle(location);
            return;
        }

        if (e?.shiftKey) {
            if (isEmpty) return;
            if (selectedMoveLocations.length === 0) {
                setSelectedMoveLocations([{ tabId: activeTabId, location }]);
                return;
            }

            const lastSelected = selectedMoveLocations[selectedMoveLocations.length - 1];
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
        if (selectedMoveLocations.length === 0) {
            if (!isEmpty) setSelectedMoveLocations([{ tabId: activeTabId, location }]);
            return;
        }

        if (isSelected(activeTabId, location)) {
            setSelectedMoveLocations([{ tabId: activeTabId, location }]);
            return;
        }

        // EXECUTE MOVE
        executeMoveOperation(selectedMoveLocations, location);
    }, [getActiveTabId, getActiveTabData, selectedMoveLocations, isSelected, handleSelectionToggle, executeMoveOperation]);

    const handleGlobalDrop = useCallback((target: MoveLocation, e?: React.DragEvent) => {
        const activeTabId = getActiveTabId();
        if (!activeTabId) return;

        let sourcesToMove: GlobalMoveSource[] = [];

        if (selectedMoveLocations.length > 0) {
            sourcesToMove = selectedMoveLocations;
        } else if (e) {
            try {
                const data = e.dataTransfer.getData('text/plain');
                if (data) {
                    const singleSource = JSON.parse(data) as MoveLocation;
                    if (singleSource && (singleSource.index !== undefined)) {
                        sourcesToMove = [{ tabId: activeTabId, location: singleSource }];
                    }
                }
            } catch (err) {
                console.error("Drop data parse error", err);
            }
        }

        if (sourcesToMove.length === 0) return;
        executeMoveOperation(sourcesToMove, target);
    }, [getActiveTabId, selectedMoveLocations, executeMoveOperation]);

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
    }, []);

    return {
        isMoveMode,
        setIsMoveMode: handleMoveModeToggle,
        selectedMoveLocations,
        isSelected,
        handleSelectionToggle,
        handleGlobalPokemonSelect,
        handleGlobalDrop,
        getCurrentTabSelections,
        clearTabSelections,
        resetMoveMode
    };
}
