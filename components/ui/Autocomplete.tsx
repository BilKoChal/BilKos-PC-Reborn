
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface AutocompleteProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    icon?: React.ElementType;
    className?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({ options, value, onChange, placeholder, icon: Icon, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState(value);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal filter when external value changes
    useEffect(() => {
        setFilter(value);
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert to last valid value if needed, or keep current text
                setFilter(value); 
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    const uniqueOptions = useMemo(() => {
        return Array.from(new Set(options));
    }, [options]);

    const filteredOptions = useMemo(() => {
        return uniqueOptions.filter(opt => 
            opt && opt.toLowerCase().includes(filter.toLowerCase())
        ).slice(0, 50); // Limit to 50 results for perf
    }, [uniqueOptions, filter]);

    const handleSelect = (option: string) => {
        onChange(option);
        setFilter(option);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex(prev => (prev + 1) % filteredOptions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions[highlightIndex]) {
                handleSelect(filteredOptions[highlightIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icon size={14} />
                    </div>
                )}
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        setIsOpen(true);
                        setHighlightIndex(0);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`
                        w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
                        text-gray-900 dark:text-gray-100 text-sm font-bold rounded-xl py-2 
                        ${Icon ? 'pl-9' : 'pl-3'} pr-8 outline-none focus:ring-2 focus:ring-blue-500 transition-all
                    `}
                />
                {filter && (
                    <button 
                        onClick={() => { setFilter(''); onChange(''); setIsOpen(true); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto no-scrollbar">
                    {filteredOptions.map((opt, idx) => (
                        <div
                            key={`${opt}-${idx}`}
                            onClick={() => handleSelect(opt)}
                            className={`
                                px-4 py-2 text-xs font-bold cursor-pointer transition-colors
                                ${idx === highlightIndex 
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
