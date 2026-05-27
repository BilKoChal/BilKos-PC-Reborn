import React from 'react';
import { Trash2 } from 'lucide-react';
import { useModalA11y } from '../../../lib/hooks/useModalA11y';
import { ModalPortal } from '../../../lib/hooks/ModalPortal';

interface CloseAllModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const CloseAllModal: React.FC<CloseAllModalProps> = ({ isOpen, onConfirm, onCancel }) => {
    const { modalRef, handleKeyDown, handleBackdropClick, modalProps, headingId } = useModalA11y({
        isOpen,
        onClose: onCancel,
        alert: true,               // destructive action confirmation
        closeOnBackdrop: false,    // prevent accidental dismissal
    });

    if (!isOpen) return null;
    return (
    <ModalPortal>
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleBackdropClick}>
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                {...modalProps}
                aria-labelledby={headingId}
                className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500"><Trash2 size={28} /></div>
                    <h3 id={headingId} className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Close All Tabs?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to close all open save files? Any unsaved progress will be lost.</p>
                </div>
                <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={onCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-500/20">Close All</button>
                </div>
            </div>
        </div>
    </ModalPortal>
    );
};
