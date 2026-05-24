
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative w-full flex flex-col items-center justify-center pt-32 pb-32 md:pb-40 overflow-visible">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[25%] w-[50%] h-[50%] bg-yellow-400/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mt-8">
        
        {/* Pikachu (Central Mascot) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-32 md:w-48 z-20 animate-[bounce_3s_infinite] drop-shadow-2xl">
            <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
                alt="Pikachu"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]"
            />
        </div>

        {/* Title */}
        <h1 className="relative text-6xl md:text-8xl font-black mb-6 tracking-tighter mt-16 md:mt-20">
          <span className="text-gray-900 dark:text-white relative z-10 drop-shadow-sm">BilKo's </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 relative z-10">
            PC
          </span>
          
          {/* Title Underglow */}
          <div className="absolute inset-0 blur-2xl bg-white/50 dark:bg-black/50 -z-10"></div>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-white/30 dark:bg-black/30 p-4 rounded-2xl border border-white/20 dark:border-white/5 shadow-sm">
          The ultimate Gen 1 Save Editor. <br/>
          <span className="text-sm opacity-80 font-normal">
            Drag & Drop your <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-red-500 font-bold">.sav</code> or <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-blue-500 font-bold">.srm</code> file into BilKo's PC to begin.
          </span>
        </p>

      </div>

      {/* Guardians (Charizard & Blastoise) */}
      <div className="absolute top-32 w-full max-w-6xl mx-auto pointer-events-none flex justify-between items-center px-4 md:px-0 z-0">
        
        {/* Charizard - Left */}
        <div className="relative w-48 md:w-80 lg:w-96 transform -translate-x-12 md:translate-x-0 rotate-6 hover:scale-110 transition-transform duration-700 ease-in-out">
             <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" 
                alt="Charizard"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(220,38,38,0.3)] animate-[pulse_4s_infinite]"
             />
        </div>

        {/* Blastoise - Right */}
        <div className="relative w-44 md:w-72 lg:w-80 transform translate-x-12 md:translate-x-0 -rotate-6 hover:scale-110 transition-transform duration-700 ease-in-out">
            <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png" 
                alt="Blastoise"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(37,99,235,0.3)] animate-[pulse_5s_infinite]"
             />
        </div>

      </div>
      
    </div>
  );
};
