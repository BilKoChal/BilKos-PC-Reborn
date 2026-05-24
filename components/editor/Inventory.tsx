
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Item } from '../../lib/parser/types';
import { useTheme } from '../../context/ThemeContext';
import { Backpack, Monitor, Trash2, Plus, ArrowDownAZ, Hash, Disc } from 'lucide-react';
import { Autocomplete } from '../ui/Autocomplete';
import { getItemName } from '../../lib/generations/gen1/data/items';
import { getGen2ItemName } from '../../lib/generations/gen2/data/constants';

interface InventoryProps {
    items: Item[]; // Bag (Limit 20)
    pcItems: Item[]; // PC (Limit 50)
    isMoveMode: boolean;
    onEnableMoveMode?: () => void;
    onUpdate: (newItems: Item[], newPcItems: Item[]) => void;
}

// Generate all valid item names for Gen 1
const ALL_ITEMS = Array.from({ length: 256 }, (_, i) => {
    const name = getItemName(i);
    return (name !== '-' && !name.startsWith('Item ')) ? name : null;
}).filter(Boolean) as string[];

export const Inventory: React.FC<InventoryProps> = ({ items, pcItems, isMoveMode, onEnableMoveMode, onUpdate }) => {
    const { getGameTheme } = useTheme();
    const theme = getGameTheme();
    const generation = theme?.generation || 1;

    const availableItems = useMemo(() => {
        if (generation === 2) {
            const list: string[] = [];
            // Ordinary items (1-95)
            for (let i = 1; i <= 95; i++) {
                const name = getGen2ItemName(i);
                if (name && !name.startsWith('Item ')) {
                    list.push(name);
                }
            }
            // GSC HMs (125-131)
            for (let i = 125; i <= 131; i++) {
                list.push(getGen2ItemName(i));
            }
            // GSC TMs (132-181)
            for (let i = 132; i <= 181; i++) {
                list.push(getGen2ItemName(i));
            }
            return list;
        } else {
            return ALL_ITEMS;
        }
    }, [generation]);

    const resolveItemName = (id: number): string => {
        return generation === 2 ? getGen2ItemName(id) : getItemName(id);
    };

    const resolveItemId = (name: string): number => {
        if (generation === 2) {
            // Check ordinary items
            for (let i = 1; i <= 255; i++) {
                if (getGen2ItemName(i) === name) {
                    return i;
                }
            }
        } else {
            for (let i = 1; i <= 255; i++) {
                if (getItemName(i) === name) {
                    return i;
                }
            }
        }
        return 0;
    };

    const [activeTab, setActiveTab] = useState<'bag' | 'pc'>('bag');
    const [sortMethod, setSortMethod] = useState<'id' | 'name'>('id');
    
    // Selection state for Move Mode
    // { location: 'bag'|'pc', index: number }
    const [moveSource, setMoveSource] = useState<{ loc: 'bag' | 'pc', index: number } | null>(null);

    // Editing State (for quantity/adding)
    const [editingSlot, setEditingSlot] = useState<{ loc: 'bag' | 'pc', index: number } | null>(null);
    const [editForm, setEditForm] = useState({ id: 0, name: '', count: 1 });

    // Long Press Refs
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentList = activeTab === 'bag' ? items : pcItems;
    const capacity = activeTab === 'bag' ? 20 : 50;

    // Reset move source if mode is disabled
    useEffect(() => {
        if (!isMoveMode) setMoveSource(null);
    }, [isMoveMode]);

    // Handle Long Press Start
    const handlePointerDown = () => {
        if (isMoveMode) return;
        timerRef.current = setTimeout(() => {
            if (onEnableMoveMode) {
                onEnableMoveMode();
                // Optionally vibrate on mobile
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }, 500); // 500ms for long press
    };

    const handlePointerUp = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleSlotClick = (index: number) => {
        // If we just finished a long press (timer fired), don't treat as click
        // But here we rely on mode switch.
        
        if (isMoveMode) {
            handleMoveClick(index);
        } else {
            // Edit Mode
            const item = currentList[index];
            if (item) {
                setEditingSlot({ loc: activeTab, index });
                setEditForm({ id: item.id, name: item.name, count: item.count });
            } else {
                // Empty slot -> Add Item
                setEditingSlot({ loc: activeTab, index });
                setEditForm({ id: 0, name: '', count: 1 });
            }
        }
    };

    const handleMoveClick = (targetIndex: number) => {
        const targetLoc = activeTab;

        if (!moveSource) {
            // Select Source
            // Can only pick a slot that has an item
            const list = activeTab === 'bag' ? items : pcItems;
            if (list[targetIndex]) {
                setMoveSource({ loc: activeTab, index: targetIndex });
            }
        } else {
            // Execute Move
            executeItemMove(moveSource, { loc: targetLoc, index: targetIndex });
            setMoveSource(null);
        }
    };

    const executeItemMove = (source: { loc: 'bag'|'pc', index: number }, target: { loc: 'bag'|'pc', index: number }) => {
        // Clone lists
        const newBag = [...items];
        const newPc = [...pcItems];

        const getList = (loc: 'bag'|'pc') => loc === 'bag' ? newBag : newPc;
        const srcList = getList(source.loc);
        const tgtList = getList(target.loc);

        const srcItem = srcList[source.index];
        const tgtItem = tgtList[target.index]; // Might be undefined (empty slot)

        if (!srcItem) return;

        // Swap logic
        if (source.loc === target.loc && source.index === target.index) return; // Same slot

        if (tgtItem) {
            // Swap
            srcList[source.index] = tgtItem;
            tgtList[target.index] = srcItem;
        } else {
            // Move to empty
            // 1. Remove from source
            srcList.splice(source.index, 1);
            // 2. Insert at target (handling array bounds)
            if (target.index >= tgtList.length) {
                tgtList.push(srcItem);
            } else {
                tgtList.splice(target.index, 0, srcItem);
            }
        }

        onUpdate(newBag, newPc);
    };

    const handleSaveEdit = () => {
        if (!editingSlot) return;

        // Resolve Name to ID
        let itemId = editForm.id;
        if (itemId === 0 && editForm.name) {
            itemId = resolveItemId(editForm.name);
        }

        const newBag = [...items];
        const newPc = [...pcItems];
        const targetList = editingSlot.loc === 'bag' ? newBag : newPc;

        if (editForm.count <= 0) {
            // Delete
            targetList.splice(editingSlot.index, 1);
        } else if (itemId > 0) {
            // Add or Update
            const newItem = { id: itemId, name: resolveItemName(itemId), count: Math.min(99, editForm.count) };
            if (targetList[editingSlot.index]) {
                targetList[editingSlot.index] = newItem;
            } else {
                if (editingSlot.index >= targetList.length) {
                    targetList.push(newItem);
                } else {
                    targetList[editingSlot.index] = newItem;
                }
            }
        }

        onUpdate(newBag, newPc);
        setEditingSlot(null);
    };

    const sortItems = () => {
        const list = [...currentList];
        
        list.sort((a, b) => {
            if (sortMethod === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                return a.id - b.id;
            }
        });

        // Apply sort to correct list
        if (activeTab === 'bag') onUpdate(list, pcItems);
        else onUpdate(items, list);
    };

    const getSpriteUrl = (itemName: string, id: number) => {
        // TMs/HMs fallback
        if (itemName.startsWith('TM') || itemName.startsWith('HM')) return null;
        
        // Clean name for PokeAPI
        const slug = itemName.toLowerCase().replace(/ /g, '-').replace(/\./g, '').replace(/'/g, '');
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden relative">
            
            {/* Edit Modal Overlay */}
            {editingSlot && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 w-full max-w-xs animate-in zoom-in-95">
                        <h4 className="font-black uppercase text-gray-400 mb-4 text-xs tracking-widest">
                            {currentList[editingSlot.index] ? 'Edit Item' : 'Add Item'}
                        </h4>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Item Name</label>
                                <Autocomplete 
                                    options={availableItems} 
                                    value={editForm.name} 
                                    onChange={(val) => setEditForm({...editForm, name: val, id: 0})}
                                    placeholder="Search Item..."
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Quantity (Max 99)</label>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditForm(prev => ({...prev, count: Math.max(0, prev.count - 1)}))} className="p-2 bg-gray-100 dark:bg-gray-800 rounded">-</button>
                                    <input 
                                        type="number" 
                                        value={editForm.count}
                                        onChange={(e) => setEditForm({...editForm, count: Math.min(99, Math.max(0, parseInt(e.target.value) || 0))})}
                                        className="flex-1 text-center font-mono font-bold bg-gray-50 dark:bg-gray-800 border-none rounded py-2"
                                    />
                                    <button onClick={() => setEditForm(prev => ({...prev, count: Math.min(99, prev.count + 1)}))} className="p-2 bg-gray-100 dark:bg-gray-800 rounded">+</button>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={() => setEditingSlot(null)}
                                    className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                    Cancel
                                </button>
                                {currentList[editingSlot.index] && (
                                    <button 
                                        onClick={() => { setEditForm({...editForm, count: 0}); setTimeout(handleSaveEdit, 100); }} 
                                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                                        title="Delete Item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <button 
                                    onClick={handleSaveEdit}
                                    className="flex-1 py-2 text-xs font-bold bg-theme-primary text-theme-text-on-primary hover:opacity-90 rounded shadow-md transition-opacity"
                                >
                                    {editForm.count === 0 ? 'Delete' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button
                    onClick={() => setActiveTab('bag')}
                    className={`flex-1 py-3 text-sm font-black uppercase flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'bag' ? 'bg-white dark:bg-gray-800 text-theme-primary' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/80'}`}
                >
                    <Backpack size={18} />
                    BAG <span className="text-[10px] opacity-60 ml-1">{items.length}/20</span>
                    {activeTab === 'bag' && (
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-1 bg-theme-primary"
                        ></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('pc')}
                    className={`flex-1 py-3 text-sm font-black uppercase flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'pc' ? 'bg-white dark:bg-gray-800 text-theme-primary' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/80'}`}
                >
                    <Monitor size={18} />
                    PC <span className="text-[10px] opacity-60 ml-1">{pcItems.length}/50</span>
                    {activeTab === 'pc' && (
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-1 bg-theme-primary"
                        ></div>
                    )}
                </button>
            </div>

            {/* Sort Controls */}
            <div className="px-2 py-1.5 bg-gray-100 dark:bg-gray-950/30 flex justify-end gap-1">
                <button 
                    onClick={() => { setSortMethod('name'); setTimeout(sortItems, 50); }}
                    className={`p-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${sortMethod === 'name' ? 'bg-theme-accent text-theme-primary' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                >
                    <ArrowDownAZ size={12} /> Name
                </button>
                <button 
                    onClick={() => { setSortMethod('id'); setTimeout(sortItems, 50); }}
                    className={`p-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${sortMethod === 'id' ? 'bg-theme-accent text-theme-primary' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                >
                    <Hash size={12} /> ID
                </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-grow overflow-y-auto bg-gray-100 dark:bg-gray-900/50 p-2 space-y-1 custom-scrollbar">
                {Array.from({ length: capacity }).map((_, idx) => {
                    const item = currentList[idx];
                    const isSelected = moveSource && moveSource.loc === activeTab && moveSource.index === idx;
                    const isEmpty = !item;
                    const sprite = item ? getSpriteUrl(item.name, item.id) : null;

                    return (
                        <div 
                            key={idx}
                            onMouseDown={handlePointerDown}
                            onTouchStart={handlePointerDown}
                            onMouseUp={handlePointerUp}
                            onTouchEnd={handlePointerUp}
                            onMouseLeave={handlePointerUp}
                            onClick={() => handleSlotClick(idx)}
                            className={`
                                flex items-center justify-between p-2 rounded-lg border-2 transition-all select-none
                                ${isSelected 
                                    ? 'bg-theme-accent border-theme-primary' 
                                    : isMoveMode 
                                        ? 'cursor-pointer hover:border-theme-primary/50 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800' 
                                        : 'cursor-pointer hover:shadow-md border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
                                }
                                ${isEmpty && !isMoveMode ? 'opacity-50 hover:opacity-100 border-dashed border-gray-200 dark:border-gray-700' : ''}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-gray-300 dark:text-gray-600 w-4 text-right">
                                    {idx + 1}
                                </span>
                                
                                {item ? (
                                    <>
                                        {/* Sprite */}
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            {sprite ? (
                                                <img src={sprite} alt={item.name} className="w-6 h-6 object-contain pixelated" />
                                            ) : (
                                                <Disc size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-none">{item.name}</span>
                                            <span className="text-[9px] font-mono text-gray-400 mt-0.5">ID: {item.id}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-300 dark:text-gray-600">
                                        <div className="w-8 h-8" />
                                        <span className="text-xs font-bold uppercase italic">Empty Slot</span>
                                    </div>
                                )}
                            </div>

                            {item && (
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">x{item.count}</span>
                                </div>
                            )}
                            
                            {isEmpty && !isMoveMode && (
                                <Plus size={14} className="text-gray-300" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Tip */}
            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
                {isMoveMode 
                    ? moveSource 
                        ? 'Select destination slot' 
                        : 'Select item to move'
                    : 'Click to Edit / Hold to Move'
                }
            </div>
        </div>
    );
};
