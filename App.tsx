
import React, { useState, useEffect, useCallback } from 'react';
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
import { SpriteProvider } from './context/SpriteContext';
import { pokemonGames } from './data/games';
import { registry } from './lib/core/AdapterRegistry';
import { detectAndParseSave } from './lib/parser';
import { ExportModal } from './components/editor/ExportModal';
import { SortScope, SortCriteria, SortDirection, sortPCBoxes } from './lib/utils/sortManager';
import { useToast } from './lib/hooks/useToast';
import { useMoveMode, GlobalMoveSource } from './lib/hooks/useMoveMode';
import { SaveTabBar } from './components/editor/SaveTabBar';
import { Toast } from './components/ui/Toast';
import { MoveModeFAB } from './components/ui/MoveModeFAB';
import { CloseConfirmationModal } from './components/editor/modals/CloseConfirmationModal';
import { ErrorModal } from './components/editor/modals/ErrorModal';
import { CloseAllModal } from './components/editor/modals/CloseAllModal';

interface SaveTab {
    id: string;
    filename: string;
    data: ParsedSave;
    version: GameVersion;
    isDirty: boolean;
    currentView: DashboardTab;
}

const App: React.FC = () => {
  // --- Core Tab State ---
  const [tabs, setTabs] = useState<SaveTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // --- File Queue Management ---
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<ParsedSave | null>(null);

  // --- Modal State ---
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [tabToClose, setTabToClose] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCloseAllConfirmOpen, setIsCloseAllConfirmOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportingTabId, setExportingTabId] = useState<string | null>(null);

  const { setActiveGameId } = useTheme();

  // --- Custom Hooks ---
  const { toastMessage, showToast } = useToast();

  // Tab lookup helpers for useMoveMode
  const getTab = useCallback((tabId: string) => {
      return tabs.find(t => t.id === tabId);
  }, [tabs]);

  const getActiveTabId = useCallback(() => activeTabId, [activeTabId]);

  const getActiveTabData = useCallback(() => {
      const tab = tabs.find(t => t.id === activeTabId);
      return tab?.data;
  }, [tabs, activeTabId]);

  const handleSaveUpdate = useCallback((tabId: string, newData: ParsedSave) => {
      setTabs(prev => prev.map(tab => {
          if (tab.id === tabId) {
              return { ...tab, data: newData, isDirty: true };
          }
          return tab;
      }));
  }, []);

  const moveMode = useMoveMode(getTab, getActiveTabId, getActiveTabData, handleSaveUpdate, showToast);

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

                  // Use the adapter-driven ambiguity flag instead of a hardcoded
                  // version name allowlist. Unambiguous versions (Yellow, Crystal)
                  // skip the disambiguation modal; ambiguous versions (Red/Blue,
                  // Gold/Silver) show it so the user can pick the right one.
                  if (!result.ambiguous) {
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

  // --- Tab Management Handlers ---

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
          currentView: 'home'
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
      moveMode.resetMoveMode();
  };

  const finalizeCloseTab = (tabId: string) => {
      moveMode.clearTabSelections(tabId);
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

  // --- Export Logic ---

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

  // --- Sort Logic ---

  const handleGlobalSort = (scope: SortScope, criteria: SortCriteria, direction: SortDirection, includeAllSaves: boolean) => {
      if (!activeTabId || !activeTab) return;

      let externalSources: { id: string, data: ParsedSave }[] = [];

      if (includeAllSaves && scope === 'living-dex') {
          externalSources = tabs
            .filter(t => t.id !== activeTabId)
            .map(t => ({ id: t.id, data: t.data }));
      }

      const result = sortPCBoxes(activeTab.data, scope, criteria, direction, externalSources);

      if (result.success) {
          handleSaveUpdate(activeTabId, result.newData);

          if (result.externalRemovals && result.externalRemovals.size > 0) {
              setTabs(prevTabs => prevTabs.map(tab => {
                  const removals = result.externalRemovals?.get(tab.id);
                  if (removals && removals.length > 0) {
                      const newParty = [...tab.data.party];
                      const newBoxes = tab.data.pcBoxes.map(b => [...b]);

                      removals.sort((a, b) => b.index - a.index);

                      removals.forEach(rem => {
                          if (rem.location === 'party') {
                              newParty.splice(rem.index, 1);
                          } else if (rem.location === 'box' && rem.boxIndex !== undefined) {
                              newBoxes[rem.boxIndex].splice(rem.index, 1);
                          }
                      });

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

  // --- Filtered selections for current view ---
  const currentTabSelections = moveMode.getCurrentTabSelections();

  return (
    <SpriteProvider>
    <div className="flex flex-col min-h-screen relative bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden font-sans">

      <Toast message={toastMessage} />

      <MoveModeFAB
        isActive={moveMode.isMoveMode}
        selectedCount={moveMode.selectedMoveLocations.length}
        onExit={() => moveMode.setIsMoveMode(false)}
      />

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

      <CloseConfirmationModal
        tabToClose={tabToClose}
        tabs={tabs}
        isExportModalOpen={isExportModalOpen}
        exportingTabId={exportingTabId}
        onConfirmSave={() => confirmCloseTab(true)}
        onConfirmDiscard={() => confirmCloseTab(false)}
        onCancel={() => setTabToClose(null)}
      />

      <ErrorModal
        errorMessage={errorMessage}
        onDismiss={() => setErrorMessage(null)}
      />

      <CloseAllModal
        isOpen={isCloseAllConfirmOpen}
        onConfirm={performCloseAll}
        onCancel={() => setIsCloseAllConfirmOpen(false)}
      />

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

      <SaveTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={switchToTab}
        onCloseTab={initiateCloseTab}
        onOpenNew={() => setIsLoadModalOpen(true)}
        onCloseAll={requestCloseAll}
      />

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

                    isMoveMode={moveMode.isMoveMode}
                    setIsMoveMode={moveMode.setIsMoveMode}
                    globalMoveSources={currentTabSelections}
                    onMovePokemon={moveMode.handleGlobalPokemonSelect}
                    onToggleSelection={moveMode.handleSelectionToggle}
                    onDropPokemon={moveMode.handleDragDrop}
                    onTouchDrop={(target) => moveMode.handleDragDrop(target)}
                    onShowToast={showToast}
                    activeTabId={activeTab.id}
                    onBeginDragSession={moveMode.beginDragSession}
                    onEndDragSession={moveMode.endDragSession}
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
    </SpriteProvider>
  );
};

export default App;
