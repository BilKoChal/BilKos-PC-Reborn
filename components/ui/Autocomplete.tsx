
import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import { Search, X } from 'lucide-react';

interface AutocompleteProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    /** Accessible label for the input (required for screen readers). */
    ariaLabel?: string;
    icon?: React.ElementType;
    className?: string;
}

/**
 * Autocomplete — filterable dropdown input.
 *
 * UX-A02 fix: added full WAI-ARIA combobox semantics so screen reader users
 * can operate the dropdown. Previously the input had no `role`, no
 * `aria-expanded`/`aria-controls`/`aria-activedescendant`, and the dropdown
 * options were plain `<div>`s with no `role="option"` or `aria-selected`.
 * Screen reader users had no way to know this was an autocomplete or to
 * navigate the options. Also clamped `highlightIndex` when the filtered list
 * shrinks (e.g., typing narrows results) so the highlight never points past
 * the end of the list.
 *
 * Reference: WAI-ARIA Authoring Practices — Combobox Pattern.
 */
export const Autocomplete: React.FC<AutocompleteProps> = ({ options, value, onChange, placeholder, ariaLabel, icon: Icon, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState(value);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

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

    // UX-A02 fix: clamp highlightIndex when the filtered list shrinks so the
    // highlight never points past the end of the list (which would make Enter
    // do nothing and ArrowDown wrap unexpectedly).
    const clampedHighlight = filteredOptions.length > 0
        ? Math.min(highlightIndex, filteredOptions.length - 1)
        : 0;

    const handleSelect = (option: string) => {
        onChange(option);
        setFilter(option);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) { setIsOpen(true); return; }
            if (filteredOptions.length === 0) return;
            setHighlightIndex(prev => (prev + 1) % filteredOptions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isOpen) { setIsOpen(true); return; }
            if (filteredOptions.length === 0) return;
            setHighlightIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === 'Enter') {
            if (isOpen && filteredOptions[clampedHighlight]) {
                e.preventDefault();
                handleSelect(filteredOptions[clampedHighlight]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Build the activedescendant ID for the currently-highlighted option.
    const activeOptionId = isOpen && filteredOptions.length > 0
        ? `${listboxId}-opt-${clampedHighlight}`
        : undefined;

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
                        <Icon size={14} />
                    </div>
                )}
                <input
                    type="text"
                    role="combobox"
                    aria-label={ariaLabel || placeholder || 'Search'}
                    aria-expanded={isOpen && filteredOptions.length > 0}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={activeOptionId}
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
                        onClick={() => { setFilter(''); onChange(''); setIsOpen(true); setHighlightIndex(0); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Clear search"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <ul
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto no-scrollbar p-0 list-none"
                >
                    {filteredOptions.map((opt, idx) => (
                        <li
                            key={`${opt}-${idx}`}
                            id={`${listboxId}-opt-${idx}`}
                            role="option"
                            aria-selected={idx === clampedHighlight}
                            onClick={() => handleSelect(opt)}
                            className={`
                                px-4 py-2 text-xs font-bold cursor-pointer transition-colors
                                ${idx === clampedHighlight
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
