import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { useAccent } from '../hooks/useWaveAccent';
import { getAccentTokens } from '../utils/gameConstants';

export const NameEntryScreen = ({ onSaveName, onCancel }: { onSaveName: (name: string) => void, onCancel?: () => void }) => {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { wave } = useAccent();
  const themeTokens = getAccentTokens(wave.color);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onSaveName(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/70 backdrop-blur-md">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-30 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(100,50,255,0.06),rgba(0,255,100,0.02),rgba(0,100,255,0.06))] bg-[length:100%_4px,3px_100%] z-10" />
      </div>

      <form onSubmit={submit} className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 border border-slate-700 backdrop-blur-md rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.1)] flex flex-col items-center">
        
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          <Gamepad2 size={40} className="text-indigo-400" />
        </div>

        <h1 className="font-['Orbitron'] font-black text-3xl text-slate-100 mb-2 tracking-widest text-center drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">CLAIM YOUR NAME</h1>
        <p className="font-['JetBrains_Mono'] text-sm text-indigo-300/80 mb-8 text-center max-w-[260px]">
          Your arcade name. Your claim to fame. Your excuse for sucking.
        </p>

        <div className="w-full mb-8 relative">
          
          <div className={`relative w-full bg-slate-950/80 border-2 rounded-xl h-[72px] overflow-hidden transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${isFocused ? themeTokens.border : 'border-slate-700'}`}>
            
            {/* The actual hidden caret native text input */}
            <input
              id="gamename"
              required
              type="text"
              value={name}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={e => setName(e.target.value.toUpperCase().slice(0, 16))}
              className={`peer absolute inset-0 w-full h-full text-center font-['Press_Start_2P'] text-[16px] font-black placeholder-transparent outline-none uppercase tracking-widest z-10 bg-transparent ${themeTokens.text}`}
              style={{ caretColor: 'transparent' }}
              placeholder="PLAYER1"
            />
            
            {/* The fake block caret rendering logic */}
            <div className={`absolute inset-0 pointer-events-none flex items-center justify-center font-['Press_Start_2P'] text-[16px] font-black tracking-widest`}>
               <span className="opacity-0">{name}</span>
               {isFocused && <span className={`inline-block w-[1.1ch] h-[1.3em] rounded-[1px] animate-pulse ml-0.5 shrink-0 ${themeTokens.bg}`} />}
            </div>
            
          </div>

          <label 
            htmlFor="gamename" 
            className={`absolute transition-all duration-300 pointer-events-none font-['Press_Start_2P'] z-20 ${isFocused || name ? 'top-0 -translate-y-1/2 left-8 text-[11px] bg-slate-900 px-3 tracking-widest ' + themeTokens.text : 'top-6 left-6 text-slate-500 text-lg'}`}
          >
            Gamename
          </label>
        </div>

        <div className="w-full flex gap-3">
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-['Orbitron'] border border-slate-600 transition-colors"
            >
              CANCEL
            </button>
          )}
          <button 
            disabled={name.trim().length === 0}
            type="submit"
            className={`${onCancel ? 'w-2/3' : 'w-full'} py-4 bg-slate-900 border-2 border-slate-700 hover:${themeTokens.bg} hover:border-transparent rounded-xl font-['Orbitron'] font-bold tracking-widest transition-all duration-300 shadow-lg disabled:opacity-50 active:scale-95 text-white`}
          >
            ENTER GAME
          </button>
        </div>
      </form>
    </div>
  );
};
