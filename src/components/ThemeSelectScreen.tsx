import { useState } from 'react';
import { WordTheme, ALL_THEMES } from '../data/words';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface ThemeSelectScreenProps {
  onSelect: (theme: WordTheme) => void;
  onBack: () => void;
}

export const ThemeSelectScreen = ({ onSelect, onBack }: ThemeSelectScreenProps) => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Parse dictionary dynamically
  const groupings: Record<string, WordTheme[]> = {};
  ALL_THEMES.forEach(t => {
    const parent = t.split('_')[0];
    if (!groupings[parent]) groupings[parent] = [];
    groupings[parent].push(t);
  });

  const getGroupEmoji = (parent: string) => {
    switch(parent) {
      case 'FOOTBALL': return '⚽️';
      case 'SCIENCE': return '🔬';
      case 'COMPUTER': return '💻';
      case 'WORLD': return '🌍';
      case 'MUSIC': return '🎵';
      case 'MOVIES': return '🎬';
      case 'FOOD': return '🍜';
      case 'SPACE': return '🚀';
      default: return '🎮';
    }
  };

  const getGroupColor = (parent: string) => {
    switch(parent) {
      case 'FOOTBALL': return 'border-emerald-500 hover:border-emerald-400 text-emerald-400 from-emerald-900/40';
      case 'SCIENCE': return 'border-fuchsia-500 hover:border-fuchsia-400 text-fuchsia-400 from-fuchsia-900/40';
      case 'COMPUTER': return 'border-cyan-500 hover:border-cyan-400 text-cyan-400 from-cyan-900/40';
      case 'WORLD': return 'border-amber-500 hover:border-amber-400 text-amber-400 from-amber-900/40';
      case 'MUSIC': return 'border-pink-500 hover:border-pink-400 text-pink-400 from-pink-900/40';
      case 'MOVIES': return 'border-orange-500 hover:border-orange-400 text-orange-400 from-orange-900/40';
      case 'FOOD': return 'border-yellow-500 hover:border-yellow-400 text-yellow-400 from-yellow-900/40';
      case 'SPACE': return 'border-indigo-500 hover:border-indigo-400 text-indigo-400 from-indigo-900/40';
      default: return 'border-slate-500 hover:border-slate-400 text-slate-400 from-slate-900/40';
    }
  };

  return (
    <div className="w-full flex justify-center min-h-screen items-start pt-8 md:pt-20 relative bg-[#0a0a0f] overflow-y-auto">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0f] to-black fixed" />

      <div className="relative z-10 w-full max-w-3xl p-6 flex flex-col items-center">
        
        <button 
          onClick={onBack}
          className="self-start mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="font-['VT323'] text-2xl tracking-widest">BACK TO MENU</span>
        </button>

        <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold tracking-widest text-gray-100 mb-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          SELECT THEME
        </h2>

        <div className="flex flex-col gap-4 w-full">
          {Object.entries(groupings).map(([parent, subtopics]) => {
            const isOpen = openGroup === parent;
            const colorTokens = getGroupColor(parent);
            const parentBase = colorTokens.split(' ')[0]; // Gets the initial border color class

            return (
              <div key={parent} className="flex flex-col gap-2">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : parent)}
                  className={`group relative flex items-center justify-between px-6 py-6 bg-slate-900 border-2 ${colorTokens} rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${isOpen ? `shadow-[0_0_25px_rgba(0,0,0,0.4)] bg-gradient-to-r to-transparent` : ''}`}
                >
                  <div className="flex items-center gap-4 z-10">
                    <span className="text-4xl">{getGroupEmoji(parent)}</span>
                    <span className="font-['Orbitron'] text-2xl font-bold tracking-widest z-10">{parent}</span>
                  </div>
                  <ChevronDown size={28} className={`transition-transform duration-300 z-10 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Sub-topic Accordion Dropdown */}
                <div 
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-2 mb-4' : 'max-h-0 opacity-0'}`}
                >
                  {subtopics.map(topic => {
                    const label = topic.split('_')[1];
                    return (
                      <button
                        key={topic}
                        onClick={() => onSelect(topic)}
                        className={`flex items-center justify-center py-4 px-4 bg-slate-800/80 border border-slate-700 hover:${parentBase} rounded-xl font-['VT323'] text-2xl tracking-widest text-slate-300 transition-all hover:text-white group`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
