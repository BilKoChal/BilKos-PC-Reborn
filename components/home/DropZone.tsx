import React, { useRef, useState } from 'react';
import { Loader2, UploadCloud, Monitor, AlertTriangle, Files } from 'lucide-react';

interface DropZoneProps {
    onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileList = Array.from(e.dataTransfer.files);
        onFilesSelected(fileList);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const fileList = Array.from(e.target.files);
        onFilesSelected(fileList);
        // Reset input so same files can be selected again if needed
        e.target.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-lg mx-auto relative z-20 -mt-20 mb-12 px-4">
        
      {/* Retro PC Monitor Design */}
      <div 
        className="flex flex-col items-center transform transition-transform duration-300 hover:scale-105"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Monitor Housing */}
        <div className={`
            relative w-full aspect-[4/3] bg-stone-200 dark:bg-stone-700 rounded-3xl p-4 md:p-6 
            shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_-8px_0_rgba(0,0,0,0.1)] 
            border-b-[12px] border-r-[4px] border-stone-300 dark:border-stone-800
            cursor-pointer group
        `}>
            {/* Screen Bezel */}
            <div className={`
                w-full h-full bg-stone-800 rounded-xl p-2 md:p-3 shadow-inner
                ${isDragOver ? 'ring-4 ring-blue-400' : ''} transition-all
            `}>
                {/* The Screen Itself */}
                <div className={`
                    w-full h-full rounded-lg relative overflow-hidden flex flex-col items-center justify-center
                    transition-colors duration-500 border-2 border-stone-900/50
                    ${isDragOver 
                            ? 'bg-blue-900/80 shadow-[inset_0_0_40px_rgba(59,130,246,0.5)]' 
                            : 'bg-[#98D8D8] dark:bg-[#1a2e3a] shadow-[inset_0_0_60px_rgba(0,0,0,0.2)]'
                    }
                `}>
                    
                    {/* Screen Scanlines Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 pointer-events-none bg-[length:100%_4px,6px_100%]"></div>
                    
                    {/* Screen Glare */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none rounded-lg z-20"></div>

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".sav,.srm" multiple />

                    <div className="relative z-30 flex flex-col items-center text-center p-4 w-full h-full justify-center">
                        <div className={`
                            mb-3 p-3 rounded-full border-2 border-dashed transition-all duration-300
                            ${isDragOver 
                                ? 'border-blue-400 bg-blue-500/20 text-blue-200' 
                                : 'border-stone-500/30 dark:border-blue-500/30 bg-white/20 dark:bg-black/20 text-stone-600 dark:text-blue-300 group-hover:scale-110'
                            }
                        `}>
                            {isDragOver ? <Files size={32} /> : <Monitor size={32} />}
                        </div>
                        
                        <h3 className="font-mono text-lg font-bold text-stone-700 dark:text-blue-200 mb-1 group-hover:text-stone-900 dark:group-hover:text-blue-100 uppercase tracking-tight">
                            BilKo's PC
                        </h3>
                        
                        <div className="text-[10px] md:text-xs font-mono font-medium text-stone-600 dark:text-blue-400/80 px-2 py-1 bg-stone-100/50 dark:bg-black/20 rounded">
                            {isDragOver ? 'RELEASE TO LOAD FILES' : 'CLICK OR DRAG FILES'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Power LED */}
            <div className={`absolute bottom-2 right-8 w-2 h-2 md:w-3 md:h-3 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-colors duration-200 bg-red-500`}></div>
        </div>

        {/* Monitor Stand */}
        <div className="w-32 h-8 bg-stone-300 dark:bg-stone-800 border-l-[6px] border-r-[6px] border-stone-400 dark:border-stone-900 shadow-lg relative z-10 -mt-1"></div>
        
        {/* Monitor Base */}
        <div className="w-48 h-4 bg-stone-200 dark:bg-stone-700 rounded-t-lg shadow-xl border-b-[4px] border-stone-300 dark:border-stone-800"></div>

      </div>
    </div>
  );
};