import React from 'react';
import { AlertTriangle, Save as SaveIcon } from 'lucide-react';
import { useModalA11y } from '../../../lib/hooks/useModalA11y';

interface CloseConfirmationModalProps {
    tabToClose: string | null;
    tabs: { id: string; filename: string }[];
    isExportModalOpen: boolean;
    exportingTabId: string | null;
    onConfirmSave: () => void;
    onConfirmDiscard: () => void;
    onCancel: () => void;
}

export const CloseConfirmationModal: React.FC<CloseConfirmationModalProps> = ({
    tabToClose,
    tabs,
    isExportModalOpen,
    exportingTabId,
    onConfirmSave,
    onConfirmDiscard,
    onCancel
}) => {
    const isOpen = tabToClose !== null && !(isExportModalOpen && exportingTabId === tabToClose);
    const tab = tabs.find(t => t.id === tabToClose);

    const { modalRef, handleKeyDown, handleBackdropClick, modalProps, headingId } = useModalA11y({
        isOpen,
        onClose: onCancel,
        alert: true,               // destructive action confirmation
        closeOnBackdrop: false,    // prevent accidental dismissal
    });

    if (!isOpen || !tab) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleBackdropClick}>
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                {...modalProps}
                aria-labelledby={headingId}
                className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-500" size={24} />
                    </div>
                    <h3 id={headingId} className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                        Close &quot;{tab.filename}&quot;?
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You have unsaved changes.
                    </p>
                </div>
                <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-950/50">
                    <button onClick={onConfirmSave} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors shadow-sm"><SaveIcon size={16} /> Save &amp; Close</button>
                    <button onClick={onConfirmDiscard} className="w-full bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold py-2 rounded-lg transition-colors">Discard Changes</button>
                    <button onClick={onCancel} className="w-full text-gray-500 font-bold text-sm mt-2 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
                </div>
            </div>
        </div>
    );
};
