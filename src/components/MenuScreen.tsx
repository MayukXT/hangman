import { GameMode, GameDifficulty } from '../types';
import { Gamepad2, Trophy, ScrollText, Check, User } from 'lucide-react';
import { useState } from 'react';
import { useAccent } from '../hooks/useWaveAccent';
import { getAccentTokens, APP_VERSION } from '../utils/gameConstants';
import { UpdateWarningModal } from './Modal';
import { type UpdateInfo } from '../utils/updater';

interface MenuScreenProps {
  onStartGame: (mode: GameMode, difficulty: GameDifficulty) => void;
  onOpenRules: () => void;
  highScore: number;
  username: string;
  updateInfo: UpdateInfo | null;
}

export const MenuScreen = ({ onStartGame, onOpenRules, highScore, username, updateInfo }: MenuScreenProps) => {
  const { wave } = useAccent();
  const themeTokens = getAccentTokens(wave.color);
  const [showUpdateWarning, setShowUpdateWarning] = useState(false);

  return (
    <div className="w-full flex justify-center min-h-screen items-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0f] to-black">
      
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(139,92,246,0.06),rgba(0,255,100,0.02),rgba(0,100,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl p-6 flex flex-col items-center">
        
        <div className="mb-4 px-4 py-1 bg-slate-800/80 rounded-full border border-slate-600 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
           <User size={14} className="text-violet-400" />
           <span className="font-['Press_Start_2P'] text-[10px] text-slate-300 uppercase">{username}</span>
        </div>

        <h1 
          className={`font-['Press_Start_2P'] text-center text-4xl md:text-5xl mb-2 transition-colors duration-0 drop-shadow-[0_0_25px_currentColor] animate-pulse ${themeTokens.text}`}
        >
          HANGMAN
        </h1>
        <h2 className="font-['VT323'] text-2xl md:text-3xl text-rose-500 mb-8 tracking-widest uppercase font-bold">
          Prepare to Suffer
        </h2>

        <div className="flex items-center gap-2 px-6 py-2 bg-slate-800/80 border border-slate-700 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-12">
          <Trophy className="text-yellow-400" size={20} />
          <span className="font-['Orbitron'] text-cyan-50 font-bold tracking-widest text-lg">HIGH SCORE: {highScore}</span>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* DEFAULT MODE (Endless) */}
          <div 
            onClick={() => onStartGame('DEFAULT', 'EASY')} // Start easy, random theme at runtime per word
            className={`group relative flex flex-col items-center p-8 bg-slate-900 border-2 rounded-2xl cursor-pointer transition-colors duration-0 transform hover:scale-105 overflow-hidden ${themeTokens.border} ${themeTokens.hoverBorder} ${themeTokens.shadow}`}
          >
            {/* Glowing orb effect */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-20 blur-3xl group-hover:opacity-40 transition-colors duration-0 ${themeTokens.bg}`} />
            
            <Gamepad2 size={48} className={`mb-4 group-hover:animate-bounce relative z-10 transition-colors duration-0 ${themeTokens.text}`} />
            <h3 className="font-['Orbitron'] text-3xl font-black text-slate-50 mb-2 relative z-10 tracking-widest">DEFAULT</h3>
            <p className="font-['VT323'] text-slate-300 text-xl text-center relative z-10 leading-tight">
              One shot. No checkpoints. No excuses.<br/>Levels up from EASY to INSANE.<br/>Spoiler: You probably won't make it.
            </p>
          </div>

          {/* CASUAL MODES */}
          <div className="flex flex-col gap-4">
            <h3 className="font-['Orbitron'] text-sm tracking-widest text-slate-400 font-bold uppercase text-center mb-2">Casual: No Pressure, No Shame</h3>
            
            {(['EASY', 'NORMAL', 'HARD'] as GameDifficulty[]).map((diff) => (
              <div 
                key={diff}
                onClick={() => onStartGame('CASUAL', diff)} // Actually we should let them choose theme but for MVP flow click to open Theme mode
                className="group flex justify-between items-center px-6 py-4 bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${diff === 'EASY' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : diff === 'NORMAL' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`} />
                  <span className="font-['Orbitron'] font-bold text-gray-200 tracking-wider">{diff}</span>
                </div>
                <Check className="opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" size={20} />
              </div>
            ))}
          </div>

        </div>

        <button 
          onClick={onOpenRules}
          className="mt-12 flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
        >
          <ScrollText size={18} />
          <span className="font-['VT323'] text-xl tracking-wider">HOW NOT TO DIE</span>
        </button>

      </div>

      {/* Version badge / Update card — bottom left */}
      {updateInfo ? (
        <div className="fixed bottom-4 left-5 z-20">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 backdrop-blur-sm border-2 border-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-in fade-in duration-500">
            <div>
              <span className="font-['Press_Start_2P'] text-[8px] text-emerald-400 block leading-tight">UPDATE AVAILABLE</span>
              <span className="font-['Orbitron'] text-[10px] text-slate-400 tracking-wider">{updateInfo.version}</span>
            </div>
            <button 
              onClick={() => setShowUpdateWarning(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-['Orbitron'] text-xs font-bold rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.4)] active:scale-95"
            >
              UPDATE
            </button>
          </div>
        </div>
      ) : (
        <div className={`fixed bottom-4 left-5 font-['Press_Start_2P'] text-[10px] tracking-widest opacity-60 hover:opacity-100 transition-opacity ${themeTokens.text}`}>
          {APP_VERSION}
        </div>
      )}

      <UpdateWarningModal
        isOpen={showUpdateWarning}
        onClose={() => setShowUpdateWarning(false)}
        onContinue={() => setShowUpdateWarning(false)}
        version={updateInfo?.version || ''}
      />
    </div>
  );
};
