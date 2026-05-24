
import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { DropZone } from './components/home/DropZone';
import { Features } from './components/home/Features';
import { GameVersionSelector } from './components/home/GameVersionSelector';
import { EditorDashboard, DashboardTab } from './components/editor/EditorDashboard';
import { LoadSaveModal } from './components/editor/LoadSaveModal';
import { ParsedSave, GameVersion } from './lib/parser/types';
import { useTheme } from './context/ThemeContext';
import { plusGame, pokemonGames } from './data/games';
import { Plus, X, Save as SaveIcon, AlertTriangle, Trash2, AlertCircle, Move, MousePointer2 } from 'lucide-react';
import { registry } from './lib/core/AdapterRegistry';
import { detectAndParseSave } from './lib/parser';
import { ExportModal } from './components/editor/ExportModal';
import { MoveLocation, transferPokemonBatch, movePokemonBatch, isSameLocation } from './lib/utils/manipulation';
import { SortScope, SortCriteria, SortDirection, sortPCBoxes } from './lib/utils/sortManager';

interface SaveTab {
    id: string;
    filename: string;
    data: ParsedSave;
    version: GameVersion;
    isDirty: boolean;
    currentView: DashboardTab; // Added: Independent view state per tab
}

// Extended Selection Type to track Source Save
interface GlobalMoveSource {
    tabId: string;
    location: MoveLocation;
}

const App: React.FC = () => {
  // --- State ---
  const [tabs, setTabs] = useState<SaveTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  
  // File Queue Management
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<ParsedSave | null>(null); 
  
  // Modals
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [tabToClose, setTabToClose] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCloseAllConfirmOpen, setIsCloseAllConfirmOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportingTabId, setExportingTabId] = useState<string | null>(null);

  // --- GLOBAL MOVE MODE STATE ---
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedMoveLocations, setSelectedMoveLocations] = useState<GlobalMoveSource[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { setActiveGameId } = useTheme();

  // --- Computed ---
  const activeTab = tabs.find(t => t.id === activeTabId);

  // --- Sync Theme Context with Active Tab ---
  useEffect(() => {
      if (activeTab) {
          let gameId = activeTab.version.toLowerCase();
          const match = pokemonGames.find(g => g.id === gameId);
          if (match) gameId = match.id;
          setActiveGameId(gameId);
      } else {
          setActiveGameId(null);
      }
  }, [activeTab, setActiveGameId]);

  // --- Auto-adjust Active Tab when tabs list changes ---
  useEffect(() => {
      if (tabs.length === 0) {
          if (activeTabId !== null) {
              setActiveTabId(null);
          }
          return;
      }
      const activeTabExists = tabs.some(t => t.id === activeTabId);
      if (!activeTabExists) {
          setActiveTabId(tabs[tabs.length - 1].id);
      }
  }, [tabs, activeTabId]);

  // --- Queue Processor ---
  useEffect(() => {
      const processQueue = async () => {
          if (pendingSaveData || isProcessingQueue || fileQueue.length === 0 || errorMessage) return;

          setIsProcessingQueue(true);
          const currentFile = fileQueue[0];
          
          try {
              const result = await detectAndParseSave(currentFile);
              
              if (result.success && result.data) {
                  const data = result.data;
                  const versionStr = data.gameVersion || 'Red';

                  if (versionStr === 'Yellow' || versionStr === 'Crystal') {
                      createNewTab(data, versionStr);
                      setFileQueue(prev => prev.slice(1));
                  } else {
                      setPendingSaveData(data);
                  }
              } else {
                  setErrorMessage(`Failed to load "${currentFile.name}".\n\nReason: ${result.error}`);
                  setFileQueue(prev => prev.slice(1));
              }
          } catch (e) {
              console.error(e);
              setErrorMessage(`Unexpected error processing "${currentFile.name}".`);
              setFileQueue(prev => prev.slice(1));
          } finally {
              setIsProcessingQueue(false);
          }
      };

      processQueue();
  }, [fileQueue, pendingSaveData, isProcessingQueue, errorMessage]);

  // --- Handlers ---

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFilesSelected = (files: File[]) => {
      setFileQueue(prev => [...prev, ...files]);
  };

  const handleVersionConfirm = (selectedVersion: GameVersion) => {
      if (pendingSaveData) {
          const updatedData = { ...pendingSaveData, gameVersion: selectedVersion };
          createNewTab(updatedData, selectedVersion);
          setPendingSaveData(null);
          setFileQueue(prev => prev.slice(1));
      }
  };

  const handleVersionCancel = () => {
      setPendingSaveData(null);
      setFileQueue(prev => prev.slice(1));
  };

  const createNewTab = (data: ParsedSave, version: GameVersion) => {
      const newTabId = crypto.randomUUID();
      const newTab: SaveTab = {
          id: newTabId,
          filename: data.originalFilename || `Save File ${tabs.length + 1}`,
          data: data,
          version: version,
          isDirty: false,
          currentView: 'home' // Default view
      };

      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);
  };

  const switchToTab = (tabId: string) => {
      setActiveTabId(tabId);
  };

  const handleDashboardTabChange = (newView: DashboardTab) => {
      if (!activeTabId) return;
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, currentView: newView } : t));
  };

  const initiateCloseTab = (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      setTabToClose(tabId);
  };

  const requestCloseAll = () => {
      setIsCloseAllConfirmOpen(true);
  };

  const performCloseAll = () => {
      setTabs([]);
      setActiveTabId(null);
      setIsCloseAllConfirmOpen(false);
      setIsMoveMode(false);
      setSelectedMoveLocations([]);
  };

  const finalizeCloseTab = (tabId: string) => {
      // Clean up selections from this tab
      setSelectedMoveLocations(prev => prev.filter(s => s.tabId !== tabId));

      setTabs(prev => prev.filter(t => t.id !== tabId));
      setTabToClose(null);
  };

  const confirmCloseTab = (saveChanges: boolean) => {
      if (!tabToClose) return;
      if (saveChanges) {
          setExportingTabId(tabToClose);
          setIsExportModalOpen(true);
      } else {
          finalizeCloseTab(tabToClose);
      }
  };

  const handleExportConfirmed = (extension: 'sav' | 'srm') => {
      const targetId = exportingTabId || activeTabId;
      const tab = tabs.find(t => t.id === targetId);
      setIsExportModalOpen(false); 
      if (!tab) return;

      try {
          const adapter = registry.getAdapter(tab.data.generation);
          if (!adapter) {
              throw new Error(`No adapter found for Generation ${tab.data.generation}`);
          }
          const newBytes = adapter.writeSave(tab.data);
          const blob = new Blob([newBytes], { type: "application/octet-stream" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          let baseName = tab.filename.replace(/\.(sav|srm)$/i, "");
          a.download = `${baseName}.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          if (exportingTabId) {
              finalizeCloseTab(exportingTabId);
              setExportingTabId(null);
              setTabToClose(null);
          }
      } catch (e) {
          console.error("Failed to save", e);
          setErrorMessage("Failed to generate save file.");
      }
  };

  const handleSaveUpdate = (tabId: string, newData: ParsedSave) => {
      setTabs(prev => prev.map(tab => {
          if (tab.id === tabId) {
              return { ...tab, data: newData, isDirty: true };
          }
          return tab;
      }));
  };

  const handleGlobalSort = (scope: SortScope, criteria: SortCriteria, direction: SortDirection, includeAllSaves: boolean) => {
      if (!activeTabId || !activeTab) return;

      let externalSources: { id: string, data: ParsedSave }[] = [];
      
      if (includeAllSaves && scope === 'living-dex') {
          // Pass other tabs for "Move" logic
          externalSources = tabs
            .filter(t => t.id !== activeTabId)
            .map(t => ({ id: t.id, data: t.data }));
      }

      const result = sortPCBoxes(activeTab.data, scope, criteria, direction, externalSources);
      
      if (result.success) {
          // 1. Update Target Save (The Living Dex)
          handleSaveUpdate(activeTabId, result.newData);

          // 2. Handle Removals from External Saves (If any were moved)
          if (result.externalRemovals && result.externalRemovals.size > 0) {
              // We need to iterate tabs and apply deletions
              setTabs(prevTabs => prevTabs.map(tab => {
                  const removals = result.externalRemovals?.get(tab.id);
                  if (removals && removals.length > 0) {
                      // Apply deletions to this tab
                      // Deep clone to be safe
                      const newParty = [...tab.data.party];
                      const newBoxes = tab.data.pcBoxes.map(b => [...b]);

                      // Sort removals by index DESC to avoid shifting issues when splicing
                      removals.sort((a, b) => b.index - a.index);

                      removals.forEach(rem => {
                          if (rem.location === 'party') {
                              newParty.splice(rem.index, 1);
                          } else if (rem.location === 'box' && rem.boxIndex !== undefined) {
                              newBoxes[rem.boxIndex].splice(rem.index, 1);
                          }
                      });

                      // Reconstruct tab data
                      const updatedData = {
                          ...tab.data,
                          party: newParty,
                          partyCount: newParty.length,
                          pcBoxes: newBoxes,
                          currentBoxPokemon: newBoxes[tab.data.currentBoxId],
                          currentBoxCount: newBoxes[tab.data.currentBoxId].length
                      };
                      return { ...tab, data: updatedData, isDirty: true };
                  }
                  return tab;
              }));
              showToast("Living Dex Generated! Pokemon moved from other saves.");
          } else {
              showToast("Box sorted successfully!");
          }
      }
  };

  // --- Global Move Logic ---

  const handleMoveModeToggle = (val: boolean) => {
      setIsMoveMode(val);
      setSelectedMoveLocations([]);
      if (val) {
          showToast("Move Mode Active! Checkbox to select, Drag to move.");
      }
  };

  const isSelected = (tabId: string, loc: MoveLocation) => {
      return selectedMoveLocations.some(s => s.tabId === tabId && isSameLocation(s.location, loc));
  };

  const handleSelectionToggle = (location: MoveLocation) => {
      if (!activeTabId || !activeTab) return;
      const targetBoxList = location.type === 'party' ? activeTab.data.party : activeTab.data.pcBoxes[location.boxIndex];
      const targetMon = targetBoxList[location.index];
      if (!targetMon) return; // Cannot select empty

      if (isSelected(activeTabId, location)) {
          setSelectedMoveLocations(prev => prev.filter(s => !(s.tabId === activeTabId && isSameLocation(s.location, location))));
      } else {
          setSelectedMoveLocations(prev => [...prev, { tabId: activeTabId, location }]);
      }
  };

  // Shared Move Execution Logic
  const executeMoveOperation = (sources: GlobalMoveSource[], targetLocation: MoveLocation) => {
      if (!sources.length) return;
      
      const firstSource = sources[0];
      const sourceTab = tabs.find(t => t.id === firstSource.tabId);
      const targetTab = activeTab; // Drop target is always active tab
      
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
          const result = movePokemonBatch(activeTab!.data, validSources, targetLocation);
          if (result.success && result.newData) {
              handleSaveUpdate(activeTabId!, result.newData);
              setSelectedMoveLocations([]); 
              showToast("Reordered successfully!");
          } else {
              showToast(result.error || "Move failed.");
          }
      } else {
          const result = transferPokemonBatch(sourceTab.data, targetTab.data, validSources, targetLocation);
          
          if (result.success && result.newSource && result.newTarget) {
              if (isSameSave) {
                  handleSaveUpdate(sourceTab.id, result.newSource);
              } else {
                  handleSaveUpdate(sourceTab.id, result.newSource);
                  handleSaveUpdate(targetTab.id, result.newTarget);
              }
              setSelectedMoveLocations([]);
              showToast(isSameSave ? "Moved successfully!" : "Transferred between saves!");
          } else {
              showToast(result.error || "Transfer failed.");
          }
      }
  };

  const handleGlobalPokemonSelect = (location: MoveLocation, e?: React.MouseEvent) => {
      if (!activeTabId || !activeTab) return;

      const targetBoxList = location.type === 'party' ? activeTab.data.party : activeTab.data.pcBoxes[location.boxIndex];
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

          // Simple single select if cross-tab range attempt
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

      // If clicking an existing selected item -> Reset selection to just this one
      if (isSelected(activeTabId, location)) {
          setSelectedMoveLocations([{ tabId: activeTabId, location }]);
          return;
      }

      // EXECUTE MOVE
      executeMoveOperation(selectedMoveLocations, location);
  };

  const handleGlobalDrop = (target: MoveLocation, e?: React.DragEvent) => {
      if (!activeTabId || !activeTab) return;

      let sourcesToMove: GlobalMoveSource[] = [];

      // 1. Check if we have active selections (Move Mode or Multi-Select)
      if (selectedMoveLocations.length > 0) {
          sourcesToMove = selectedMoveLocations;
      } 
      // 2. If no selection, check the Drag Event Data (Single Drag in Normal Mode)
      else if (e) {
          try {
              const data = e.dataTransfer.getData('text/plain');
              if (data) {
                  const singleSource = JSON.parse(data) as MoveLocation;
                  if (singleSource && (singleSource.index !== undefined)) {
                      // Assume the drag source came from the ACTIVE tab for now. 
                      // (To support cross-tab drag without selection, we'd need to embed tabId in dataTransfer)
                      sourcesToMove = [{ tabId: activeTabId, location: singleSource }];
                  }
              }
          } catch (err) {
              console.error("Drop data parse error", err);
          }
      }

      if (sourcesToMove.length === 0) return;

      executeMoveOperation(sourcesToMove, target);
  };

  // --- Components ---

  const CloseConfirmationModal = () => {
      if (!tabToClose) return null;
      if (isExportModalOpen && exportingTabId === tabToClose) return null;
      const tab = tabs.find(t => t.id === tabToClose);
      if (!tab) return null;

      return (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="text-yellow-600 dark:text-yellow-500" size={24} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                          Close "{tab.filename}"?
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                          You have unsaved changes.
                      </p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-950/50">
                      <button onClick={() => confirmCloseTab(true)} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors shadow-sm"><SaveIcon size={16} /> Save & Close</button>
                      <button onClick={() => confirmCloseTab(false)} className="w-full bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold py-2 rounded-lg transition-colors">Discard Changes</button>
                      <button onClick={() => setTabToClose(null)} className="w-full text-gray-500 font-bold text-sm mt-2 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
                  </div>
              </div>
          </div>
      );
  };

  const ErrorModal = () => {
      if (!errorMessage) return null;
      return (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500"><AlertCircle size={32} /></div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Load Error</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{errorMessage}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={() => setErrorMessage(null)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-500/20">Dismiss</button>
                  </div>
              </div>
          </div>
      );
  };

  const CloseAllModal = () => {
      if (!isCloseAllConfirmOpen) return null;
      return (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500"><Trash2 size={28} /></div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Close All Tabs?</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to close all open save files? Any unsaved progress will be lost.</p>
                  </div>
                  <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={() => setIsCloseAllConfirmOpen(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
                      <button onClick={performCloseAll} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-500/20">Close All</button>
                  </div>
              </div>
          </div>
      );
  };

  // Filter selections for current view
  const currentTabSelections = selectedMoveLocations
    .filter(s => s.tabId === activeTabId)
    .map(s => s.location);

  return (
    <div className="flex flex-col min-h-screen relative bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in pointer-events-none">
              <Move size={18} className="text-blue-400" />
              <span className="font-bold text-sm">{toastMessage}</span>
          </div>
      )}

      {/* Exit Move Mode Floating Action Button (FAB) */}
      {isMoveMode && (
          <div className="fixed bottom-6 right-6 z-[900] animate-in zoom-in duration-300">
              <button 
                onClick={() => handleMoveModeToggle(false)}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
                title="Exit Move Mode"
              >
                  <X size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              </button>
              <div className="absolute -top-10 right-0 bg-black/70 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {selectedMoveLocations.length > 0 ? `${selectedMoveLocations.length} Selected` : 'Move Mode'}
              </div>
          </div>
      )}

      {/* Game Version Selector */}
      {pendingSaveData && (
          <GameVersionSelector 
             key={`${pendingSaveData.originalFilename}-${pendingSaveData.gameVersion || 'Red'}`}
             filename={pendingSaveData.originalFilename || 'Unknown File'}
             detectedVersion={pendingSaveData.gameVersion || 'Red'} 
             onConfirm={handleVersionConfirm}
             onCancel={handleVersionCancel}
          />
      )}

      <LoadSaveModal 
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onFilesSelected={handleFilesSelected}
      />

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => {
            setIsExportModalOpen(false);
            setExportingTabId(null);
        }}
        onExport={handleExportConfirmed}
      />

      <CloseConfirmationModal />
      <ErrorModal />
      <CloseAllModal />

      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.15]" 
           style={{
             backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}>
      </div>
      
      <Header 
        onNavigate={handleDashboardTabChange} 
        hasActiveSave={!!activeTabId} 
      />

      {/* Tab Bar */}
      {tabs.length > 0 && (
          <div className="bg-gray-200 dark:bg-gray-900 pt-2 px-2 flex items-end gap-1 overflow-x-auto border-b border-gray-300 dark:border-gray-800 z-10 relative scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
              {tabs.map(tab => {
                  const isActive = tab.id === activeTabId;
                  const versionColor = 
                      tab.version === 'Red' ? 'bg-red-500' :
                      tab.version === 'Blue' ? 'bg-blue-500' :
                      tab.version === 'Yellow' ? 'bg-yellow-400' :
                      tab.version === 'Gold' ? 'bg-amber-500' :
                      tab.version === 'Silver' ? 'bg-slate-400' :
                      tab.version === 'Crystal' ? 'bg-cyan-400' : 'bg-gray-400';
                  
                  return (
                      <div 
                        key={tab.id}
                        onClick={() => switchToTab(tab.id)}
                        className={`
                            group relative pl-4 pr-8 py-2 min-w-[160px] max-w-[240px] shrink-0 rounded-t-lg cursor-pointer select-none transition-all duration-200
                            ${isActive 
                                ? 'bg-gray-50 dark:bg-gray-950 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] translate-y-[1px]' 
                                : 'bg-gray-300 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/80 opacity-80 hover:opacity-100'
                            }
                        `}
                      >
                          {isActive && <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${versionColor}`}></div>}
                          <div className="flex flex-col">
                              <span className={`text-xs font-bold uppercase tracking-wide truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {tab.filename}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                  {tab.version} Version {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 ml-1" title="Unsaved Changes"></span>}
                              </span>
                          </div>
                          <button onClick={(e) => initiateCloseTab(e, tab.id)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <X size={12} className="text-gray-500" />
                          </button>
                      </div>
                  )
              })}
              
              {/* Tab Actions (Moved Next to Tabs) */}
              <button onClick={() => setIsLoadModalOpen(true)} className="p-2 h-10 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30 transition-colors shadow-sm mb-1 ml-1" title="Open New Save"><Plus size={18} /></button>
              <button onClick={requestCloseAll} className="p-2 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors shadow-sm mb-1" title="Close All Tabs"><Trash2 size={18} /></button>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative">
        {activeTab ? (
            <div key={activeTab.id} className="animate-in fade-in duration-300">
                <EditorDashboard 
                    data={activeTab.data} 
                    activeTab={activeTab.currentView}
                    onTabChange={handleDashboardTabChange}
                    onSaveUpdate={(newData) => handleSaveUpdate(activeTab.id, newData)}
                    onOpenLoadModal={() => setIsLoadModalOpen(true)}
                    onExport={() => {
                        setExportingTabId(null); 
                        setIsExportModalOpen(true);
                    }}
                    onSort={handleGlobalSort}
                    
                    // Global Move Props
                    isMoveMode={isMoveMode}
                    setIsMoveMode={handleMoveModeToggle}
                    // Filter selections for the current tab so highlighting is correct
                    globalMoveSources={currentTabSelections} 
                    onMovePokemon={handleGlobalPokemonSelect}
                    onToggleSelection={handleSelectionToggle}
                    onDropPokemon={handleGlobalDrop}
                    onShowToast={showToast}
                />
            </div>
        ) : (
            <div className="flex-grow w-full flex flex-col items-center justify-start pb-24">
              <Hero />
              <DropZone onFilesSelected={handleFilesSelected} />
              <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-center"><Features /></div>
            </div>
        )}
        <Footer />
      </main>
    </div>
  );
};

export default App;
