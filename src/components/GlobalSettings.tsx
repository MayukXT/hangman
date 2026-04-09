import { useState, useRef } from 'react';
import { Settings, Volume2, VolumeX, User, Trash2, Palette, ChevronDown, Monitor } from 'lucide-react';
import { sfx } from '../utils/audio';
import { DangerModal } from './Modal';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useAccent, AccentColorId } from '../hooks/useWaveAccent';
import { getAccentTokens } from '../utils/gameConstants';
import { useGraphics } from '../hooks/useGraphics';

interface GlobalSettingsProps {
  isNameEntryActive: boolean;
  onChangeNameClick: () => void;
  onClearData: () => void;
}

export const GlobalSettings = ({ isNameEntryActive, onChangeNameClick, onClearData }: GlobalSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const settingsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(settingsRef, () => { setIsOpen(false); setIsAccordionOpen(false); });

  const { wave, triggerWave, waveSpeed, setWaveSpeed } = useAccent();
  const { setGraphics, isFancy } = useGraphics();
  const themeTokens = getAccentTokens(wave.color);

  const toggleAudio = () => {
    sfx.toggle(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  };

  return (
    <div className="absolute top-6 left-6 z-[200]">
      <DangerModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          setIsResetModalOpen(false);
          onClearData();
        }}
        title="SYSTEM WIPE"
        description="Last chance, pal. This wipes your name, score, dignity, and all that saved crap. The machine forgets you ever existed. No backup, no recovery, just emptiness."
        requireTyping="reset"
        confirmText="ERASE ME"
      />

      <div className="relative" ref={settingsRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-[52px] h-[52px] bg-slate-900 border-2 border-slate-700 hover:${themeTokens.border} hover:${themeTokens.text} rounded-xl text-gray-400 transition-all shadow-lg active:scale-95 z-50 relative`}
        >
          <Settings size={28} className={`transition-transform duration-500 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
        </button>
        
        <div className={`absolute top-full left-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden transition-all duration-300 origin-top-left ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}>
          <button 
            onClick={toggleAudio}
            className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              {isAudioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              SFX
            </div>
            <span className={`font-bold tracking-widest ${isAudioEnabled ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]'}`}>
              {isAudioEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* GRAPHICS MODE TOGGLE */}
          <button
            onClick={() => setGraphics(isFancy ? 'LIGHT' : 'FANCY')}
            className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] border-t border-slate-800 flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <Monitor size={18} />
              Graphics
            </div>
            <span className={`font-bold tracking-widest ${isFancy ? 'text-violet-400 drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'text-slate-400'}`}>
              {isFancy ? 'FANCY' : 'LIGHT'}
            </span>
          </button>

          {!isNameEntryActive && (
            <button 
              onClick={() => {
                setIsOpen(false);
                onChangeNameClick();
              }}
              className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] border-t border-slate-800 flex items-center gap-3 text-sm"
            >
              <User size={18} />
              Change Username
            </button>
          )}

          {/* ACCORDION PALETTE */}
          <div className="border-t border-slate-800">
            <button 
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] flex items-center justify-between gap-3 text-sm font-bold group"
            >
              <div className="flex items-center gap-2">
                <Palette size={18} className={`transition-colors group-hover:${themeTokens.text}`} />
                <span className={`group-hover:${themeTokens.text} transition-colors`}>Change Accent</span>
              </div>
              <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${isAccordionOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAccordionOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={`flex gap-3 justify-center px-5 pt-4 ${!isFancy ? 'pb-4' : ''}`}>
                {(['RED', 'YELLOW', 'CYAN', 'PURPLE', 'GREEN'] as AccentColorId[]).map(color => (
                  <button 
                    key={color}
                    onClick={(e) => triggerWave(color, e.clientX, e.clientY)}
                    className={`w-6 h-6 rounded-full transition-all hover:scale-125 ${getAccentTokens(color).bg} ${wave.color === color ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_currentColor]' : 'opacity-40 hover:opacity-100'}`}
                  />
                ))}
              </div>
              
              {isFancy && (
              <div className="px-5 pb-6 pt-6">
                <div className="flex justify-between items-center mb-3 font-['Orbitron'] text-xs text-slate-400">
                  <span>Wave Speed</span>
                  <span className={`${themeTokens.text} font-bold`}>{waveSpeed}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={waveSpeed}
                  onChange={(e) => setWaveSpeed(Number(e.target.value))}
                  className={`w-full h-2 rounded-lg bg-slate-800 outline-none hover:bg-slate-700 transition-colors accent-current sm:cursor-pointer ${themeTokens.text}`}
                />
              </div>
              )}
            </div>
          </div>

          {!isNameEntryActive && (
            <button 
              onClick={() => { setIsOpen(false); setIsResetModalOpen(true); }}
              className="w-full text-left px-5 py-4 hover:bg-rose-950/40 text-rose-500 hover:text-rose-400 font-bold tracking-wider transition-colors font-['Orbitron'] border-t border-slate-800 flex items-center gap-3 text-sm"
            >
              <Trash2 size={18} />
              RESET APPLICATION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
