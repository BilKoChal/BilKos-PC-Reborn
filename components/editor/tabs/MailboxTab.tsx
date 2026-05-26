import React from 'react';
import { ParsedSave, isGen2SaveExtension, Gen2Mail } from '../../../lib/parser/types';
import { Mail, Inbox, Send, User } from 'lucide-react';
import { useSaveContextSafe } from '../../../context/SaveContext';

interface MailboxTabProps {
    data: ParsedSave;
}

/** Map mail type item IDs to their names */
const MAIL_TYPE_NAMES: Record<number, string> = {
    0x9E: 'Blank Mail',
    0xB5: 'Flower Mail',
    0xB6: 'Surf Mail',
    0xB7: 'Liteblue Mail',
    0xB8: 'Portrait Mail',
    0xB9: 'Lovely Mail',
    0xBA: 'Eon Mail',
    0xBB: 'Morph Mail',
    0xBC: 'Blue Sky Mail',
    0xBD: 'Music Mail',
    0xBE: 'Mirage Mail',
};

/** Map nationality byte to country name */
const NATIONALITY_NAMES: Record<number, string> = {
    0: 'Japan',
    1: 'English',
    2: 'French',
    3: 'German',
    4: 'Italian',
    5: 'Spanish',
};

function getMailTypeName(mailType: number): string {
    return MAIL_TYPE_NAMES[mailType] || `Mail Type 0x${mailType.toString(16).toUpperCase()}`;
}

function getNationalityName(nat: number): string {
    return NATIONALITY_NAMES[nat] || `Region ${nat}`;
}

/** Render a single mail item as a card */
const MailCard: React.FC<{ mail: Gen2Mail; index: number; label: string }> = ({ mail, index, label }) => {
    const mailTypeName = getMailTypeName(mail.mailType);
    const nationalityName = getNationalityName(mail.authorNationality);
    const hasMessage = mail.messageLine1.trim() || mail.messageLine2.trim();

    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Mail size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{label} #{index + 1}</span>
                </div>
                <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                    {mailTypeName}
                </span>
            </div>
            
            {/* Message */}
            {hasMessage && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 mb-2 border border-amber-100 dark:border-amber-800/20">
                    <div className="text-[11px] text-gray-700 dark:text-gray-300 font-mono">
                        {mail.messageLine1.trim() || '—'}
                    </div>
                    <div className="text-[11px] text-gray-700 dark:text-gray-300 font-mono">
                        {mail.messageLine2.trim() || '—'}
                    </div>
                </div>
            )}

            {/* Author Info */}
            <div className="flex items-center gap-3 text-[10px] text-amber-600 dark:text-amber-400">
                <div className="flex items-center gap-1">
                    <User size={10} />
                    <span className="font-semibold">{mail.authorName || '???'}</span>
                </div>
                <span className="opacity-50">|</span>
                <span>TID: {mail.authorTid}</span>
                <span className="opacity-50">|</span>
                <span>{nationalityName}</span>
            </div>

            {/* Pokemon on mail */}
            {mail.appearPokemon > 0 && (
                <div className="text-[9px] text-amber-500 mt-1">
                    Display: Species #{mail.appearPokemon}
                </div>
            )}
        </div>
    );
};

export const MailboxTab: React.FC<MailboxTabProps> = ({ data }) => {
    const saveCtx = useSaveContextSafe();
    const adapter = saveCtx?.adapter;

    // D1: Use adapter capability flag instead of `data.generation !== 2`.
    // The parent tab already conditionally renders this tab via adapter?.hasMailbox.
    if (!adapter?.hasMailbox) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 text-gray-400">
                <Mail size={48} className="mb-4 opacity-40" />
                <h3 className="font-bold text-lg uppercase tracking-widest">Mailbox Not Available</h3>
                <p className="text-sm mt-2">Mailbox is not available for this generation.</p>
            </div>
        );
    }

    // D2: Use isGen2SaveExtension type guard instead of `as Gen2SaveExtension` cast.
    const ext = isGen2SaveExtension(data.genExtension) ? data.genExtension : null;
    const mailbox = ext?.mailbox;

    // Count non-null mail entries
    const partyMailCount = mailbox ? mailbox.partyMail.filter(m => m !== null).length : 0;
    const mailboxMailCount = mailbox ? mailbox.mailboxMail.filter(m => m !== null).length : 0;
    const totalMail = partyMailCount + mailboxMailCount;

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
                    {mailbox && (
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                                {totalMail} Mail{totalMail !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                    {!mailbox ? (
                        /* No mailbox data parsed */
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
                    ) : totalMail === 0 ? (
                        /* Mailbox parsed but empty */
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                            <Inbox size={48} className="mb-4 opacity-40" />
                            <h3 className="font-bold text-base uppercase tracking-wider">No Mail</h3>
                            <p className="text-sm mt-2 text-center max-w-md">
                                The mailbox is currently empty. No mail items are stored in party slots or the mailbox storage.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Party Mail */}
                            {partyMailCount > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Send size={16} className="text-amber-500" />
                                        <h3 className="text-sm font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">Party Mail</h3>
                                        <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">{partyMailCount}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {mailbox.partyMail.map((mail, idx) => 
                                            mail ? <MailCard key={idx} mail={mail} index={idx} label="Party" /> : null
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Mailbox Storage */}
                            {mailboxMailCount > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Inbox size={16} className="text-blue-500" />
                                        <h3 className="text-sm font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">Mailbox Storage</h3>
                                        <span className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">{mailboxMailCount} / {mailbox.mailboxCount}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {mailbox.mailboxMail.map((mail, idx) => 
                                            mail ? <MailCard key={idx} mail={mail} index={idx} label="Box" /> : null
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
