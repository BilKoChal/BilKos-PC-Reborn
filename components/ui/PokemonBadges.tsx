
import React from 'react';
import { TYPE_COLORS } from '../../lib/data/gameData';

export const TypeBadge: React.FC<{ 
    type: string; 
    size?: 'sm' | 'md'; 
    showLabel?: boolean; // Kept for compatibility, but we always show label now
    className?: string;
    onClick?: () => void;
    active?: boolean;
}> = ({ type, size = 'md', className = '', onClick, active }) => {
    const color = TYPE_COLORS[type] || '#A8A878';
    
    // Adjust sizing for text-only badge
    const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-4 py-1 text-xs';
    const minWidth = size === 'sm' ? 'min-w-[40px]' : 'min-w-[60px]';

    return (
        <div 
            onClick={onClick}
            className={`
                ${padding} rounded-md font-black text-white uppercase shadow-sm flex items-center justify-center ${minWidth} select-none
                ${onClick ? 'cursor-pointer transition-transform hover:scale-105' : ''}
                ${active ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110' : ''}
                ${className}
            `}
            style={{ 
                backgroundColor: color,
                boxShadow: active ? `0 0 8px ${color}` : '0 1px 2px rgba(0,0,0,0.15)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
        >
            <span className="leading-none pt-[1px] tracking-wider">{type}</span>
        </div>
    );
};

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
    const colors: Record<string, string> = {
        SLP: 'bg-gray-400 text-white',
        PSN: 'bg-purple-500 text-white',
        BRN: 'bg-red-500 text-white',
        FRZ: 'bg-cyan-400 text-white',
        PAR: 'bg-yellow-400 text-black',
        OK:  'bg-green-500 text-white'
    };
    
    const textSize = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

    return (
        <span className={`${textSize} font-black rounded uppercase shadow-sm ${colors[status] || 'bg-gray-400'}`}>
            {status}
        </span>
    );
};
