import React from 'react';
import { ParsedSave, isGen2Extension, Gen2SaveExtension } from '../../../lib/parser/types';
import { Mail, Inbox } from 'lucide-react';

interface MailboxTabProps {
    data: ParsedSave;
}

export const MailboxTab: React.FC<MailboxTabProps> = ({ data }) => {
    if (data.generation !== 2) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 text-gray-400">
                <Mail size={48} className="mb-4 opacity-40" />
                <h3 className="font-bold text-lg uppercase tracking-widest">Mailbox Not Available</h3>
                <p className="text-sm mt-2">Mailbox is only available in Generation 2 saves.</p>
            </div>
        );
    }

    // Read from Gen2SaveExtension
    const ext = data.genExtension as Gen2SaveExtension | null;

    return (
        <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 flex items-center gap-3 bg-theme-primary text-theme-text-on-primary z-10 transition-colors duration-300">
                    <Mail size={24} />
                    <div>
                        <h2 className="font-black text-xl uppercase tracking-widest leading-none">Mailbox</h2>
                        <p className="text-xs text-white/80 font-medium">Gen 2 Mail Storage & Party Mail</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                        <Inbox size={48} className="mb-4 opacity-40" />
                        <h3 className="font-bold text-base uppercase tracking-wider">Mailbox Data</h3>
                        <p className="text-sm mt-2 text-center max-w-md">
                            The Gen 2 Mailbox stores mail items attached to party Pokémon and PC mail storage. 
                            Full mailbox viewing and editing will be available in a future update.
                        </p>
                        {ext && (
                            <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30 w-full max-w-md">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Save Info</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    <div>Region: {ext.region || 'international'}</div>
                                    <div>Version: {ext.gameVersion || 'Unknown'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
