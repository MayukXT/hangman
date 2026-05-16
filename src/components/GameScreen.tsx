import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types';
import { getDifficultyMaxMistakes } from '../utils/gameConstants';
import { HangmanFigure } from './HangmanFigure';
import { Lightbulb, LayoutDashboard, RotateCcw, User } from 'lucide-react';
import { sfx } from '../utils/audio';
import { DangerModal } from './Modal';
import { useAccent } from '../hooks/useWaveAccent';
import { getAccentTokens, getLevelRoundRequirement } from '../utils/gameConstants';
import { useGraphics } from '../hooks/useGraphics';

const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const ACCENT_SHADOW_MAP: Record<string, string> = {
  RED: 'rgba(249, 115, 22, 0.7)',
  YELLOW: 'rgba(251, 191, 36, 0.7)',
  CYAN: 'rgba(34, 211, 238, 0.7)',
  PURPLE: 'rgba(139, 92, 246, 0.7)',
  GREEN: 'rgba(16, 185, 129, 0.7)'
};

interface GameScreenProps {
  state: GameState;
  highScore: number;
  username: string;
  onGuess: (letter: string) => void;
  onHint: () => void;
  onNextWord: () => void;
  onReturnMenu: () => void;
  onRestartInPlace: () => void;
  onClearData: () => void;
}

export const GameScreen = ({ state, highScore, username, onGuess, onHint, onNextWord, onReturnMenu, onRestartInPlace, onClearData }: GameScreenProps) => {
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { wave } = useAccent();
  const { isFancy } = useGraphics();
  const themeTokens = useMemo(() => getAccentTokens(wave.color), [wave.color]);

  const maxMistakes = getDifficultyMaxMistakes(state.difficulty);
  const mistakes = useMemo(() => state.guessedLetters.filter(letter => !state.word.includes(letter)).length, [state.guessedLetters, state.word]);
  
  const isLossLocked = state.isLost;
  const isWinLocked = state.isWon;
  const isFlawlessWin = isWinLocked && mistakes === 0;

  const wordChars = useMemo(() => state.word.split(''), [state.word]);
  const guessedSet = useMemo(() => new Set(state.guessedLetters), [state.guessedLetters]);

  const bgTheme = 'bg-[#0a0a0f]';

  const waveElCacheRef = useRef<HTMLElement[]>([]);
  useEffect(() => {
    requestAnimationFrame(() => {
      waveElCacheRef.current = Array.from(document.querySelectorAll('.wave-target')) as HTMLElement[];
    });
  }, [state.word, state.guessedLetters]);

  React.useEffect(() => {
    if (!wave.timestamp) return;

    const waveElements = waveElCacheRef.current;
    if (!waveElements.length) {
      waveElCacheRef.current = Array.from(document.querySelectorAll('.wave-target')) as HTMLElement[];
    }
    const els = waveElCacheRef.current;
    if (!els.length) return;

    const maxDist = Math.hypot(window.innerWidth, window.innerHeight);
    const shadowColor = ACCENT_SHADOW_MAP[wave.color] || ACCENT_SHADOW_MAP.CYAN;

    const entries: { el: HTMLElement; delay: number }[] = [];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const rect = el.getBoundingClientRect();
      const dist = Math.hypot(rect.left + rect.width / 2 - wave.originX, rect.top + rect.height / 2 - wave.originY);
      entries.push({ el, delay: (dist / maxDist) * wave.durationMs });
    }

    requestAnimationFrame(() => {
      for (const { el, delay } of entries) {
        el.style.setProperty('--wave-delay', `${delay}ms`);
        el.style.setProperty('--wave-shadow-color', shadowColor);
        el.classList.remove('animate-wave-bump');
      }
      void (entries[0]?.el.offsetWidth);
      for (const { el, delay } of entries) {
        el.classList.add('animate-wave-bump');
        setTimeout(() => el.classList.remove('animate-wave-bump'), delay + 600);
      }
    });
  }, [wave.timestamp, wave.originX, wave.originY, wave.color, wave.durationMs]);

  return (
    <div className={`w-full min-h-screen flex flex-col items-center justify-start p-3 pt-20 sm:p-4 sm:pt-20 lg:p-6 lg:pt-6 relative overflow-x-hidden select-none font-['JetBrains_Mono'] transition-colors duration-1000 ${bgTheme}`}>
      
      {/* retro TV scanline overlay - only shows in fancy mode */}
      {isFancy && (
        <div className="floating-layer absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-30 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,0,0,0.5),rgba(30,30,30,0.5),rgba(0,0,0,0.5))] bg-[length:100%_4px,3px_100%] z-10" />
        </div>
      )}

      <MemoizedFloatingEnvironment theme={state.runtimeTheme || state.theme} isFancy={isFancy} />

      {/* confirmation popups */}
      <DangerModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          setIsResetModalOpen(false);
          onClearData();
        }}
        title="PURGE SYSTEM"
        description="Deletes your name, high score, saved run, and settings. No recovery."
        requireTyping="reset"
        confirmText="ERASE DATA"
      />
      <DangerModal
        isOpen={isAbortModalOpen}
        onClose={() => setIsAbortModalOpen(false)}
        onConfirm={() => {
          setIsAbortModalOpen(false);
          sfx.stopCurrent();
          onReturnMenu();
        }}
        title="ABORT RUN"
        variant="warning"
        description={
          <>
            Leave this run? Score <span className="font-bold text-amber-500 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">{state.score}</span> stays saved, but this word ends now.
          </>
        }
        confirmText="ABORT"
      />

      {/* top bar with all the buttons and info */}
      <div className="relative z-40 mb-3 flex w-full max-w-7xl flex-col items-stretch justify-between gap-3 pointer-events-none lg:pl-[72px] xl:mb-4 xl:flex-row xl:items-start">
        
        {/* left side - high score, restart, menu */}
        <div className="flex min-h-12 flex-wrap items-stretch justify-center gap-2 pointer-events-auto sm:justify-start sm:gap-3">
          <div className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-900 px-3 text-slate-300 shadow-lg font-['Orbitron'] sm:px-4 ${isFancy ? 'backdrop-blur-sm' : ''}`}>
            <span className="flex items-center gap-1 text-xs font-bold tracking-widest sm:text-sm">HS🔥: <span className={themeTokens.text}>{highScore}</span></span>
          </div>

          <button 
            onClick={() => { sfx.stopCurrent(); onRestartInPlace(); }}
            className="group flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-900 px-3 text-slate-300 shadow-lg transition-all active:scale-95 hover:border-amber-500 hover:bg-amber-950/30 hover:text-amber-400 font-['Orbitron'] sm:px-5"
          >
            <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-700" />
            <span className="hidden sm:inline font-bold tracking-widest text-sm">RESTART</span>
          </button>
          
          <button 
            onClick={() => setIsAbortModalOpen(true)}
            className="group flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-900 px-3 text-slate-300 shadow-lg transition-all active:scale-95 hover:border-violet-500 hover:bg-violet-900/30 hover:text-violet-400 font-['Orbitron'] sm:px-5"
          >
            <LayoutDashboard size={20} />
            <span className="hidden sm:inline font-bold tracking-widest text-sm">MENU</span>
          </button>
        </div>

        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 pointer-events-auto xl:w-auto xl:items-end">
          
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-3 xl:justify-end xl:gap-6">
            {state.mode === 'DEFAULT' && state.difficulty !== 'INSANE' && (
              <div className="flex flex-wrap justify-center gap-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] sm:gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`font-['Press_Start_2P'] text-xl transition-all duration-300 sm:text-2xl md:text-3xl ${i < state.hearts ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(239,68,68,1)]' : 'text-slate-800/50 scale-75'}`}
                  >
                    ♥
                  </span>
                ))}
              </div>
            )}

            <div className={`flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900 px-3 py-2 shadow-md font-['Press_Start_2P'] sm:px-4 ${isFancy ? 'backdrop-blur-sm' : ''}`}>
              <User size={14} className="text-violet-400" />
              <span className="max-w-[12rem] truncate text-[10px] uppercase tracking-widest text-slate-300 sm:text-xs">{username}</span>
            </div>
          </div>

          <div className={`flex w-full items-center justify-center gap-4 self-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-xl font-['Orbitron'] sm:w-fit sm:gap-6 sm:px-5 xl:self-end ${isFancy ? 'backdrop-blur-sm' : ''}`}>
            <div className="flex flex-col items-center border-r border-slate-700 pr-4 sm:pr-6">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">SCORE</span>
              <span className={`text-2xl font-bold drop-shadow-[0_0_5px_currentColor] transition-colors duration-0 ${themeTokens.text}`}>
                {state.score}
              </span>
            </div>
            <div className="flex flex-col items-center pl-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">LEVEL</span>
              <span className={`text-xl font-bold tracking-wider ${state.difficulty === 'INSANE' ? 'text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]' : 'text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]'}`}>
                {state.difficulty}
              </span>
            </div>
          </div>
          
          <div className="mt-1 flex w-full max-w-full flex-col items-stretch self-center sm:w-[26rem] xl:w-[22rem] xl:self-end">
            <div className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-0 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-1 text-center text-xl text-slate-300 font-['VT323'] sm:text-2xl xl:justify-start xl:text-left ${isFancy ? 'backdrop-blur-sm' : ''}`}>
              THEME: <span className={`break-words uppercase tracking-wider [overflow-wrap:anywhere] ${state.difficulty === 'INSANE' ? 'line-through text-rose-500' : themeTokens.text}`}>
                {(state.runtimeTheme || state.theme || 'MIXED').replace(/_/g, ' ')}
              </span>
            </div>

            <div className={`mt-2 flex max-h-32 min-h-16 w-full overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 text-center shadow-lg transition-all ${state.wordClue ? 'items-start justify-center' : 'items-center justify-center'} ${isFancy ? 'backdrop-blur-md' : ''}`}>
              <span className={`break-words text-xs font-bold italic leading-tight opacity-80 pointer-events-none [overflow-wrap:anywhere] font-['JetBrains_Mono'] sm:text-sm md:text-base ${state.wordClue ? themeTokens.text : 'text-slate-500'}`}>
                {state.wordClue || '🔍'}
              </span>
            </div>
          </div>
        </div>
      </div>

<div className="z-10 flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-3 lg:gap-4">

          {/* main game area */}
          <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3 lg:flex-row lg:gap-6">
          
          {/* the hangman drawing */}
          <div className={`relative flex h-56 w-56 shrink-0 items-center justify-center rounded-xl border-2 bg-slate-900/80 p-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all duration-500 sm:h-64 sm:w-64 sm:p-4 lg:h-[320px] lg:w-[320px] lg:p-5 ${isFancy ? 'backdrop-blur-md' : ''} ${isFlawlessWin ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]' : 'border-slate-800'}`}>
            <HangmanFigure mistakes={mistakes} maxMistakes={maxMistakes} isLost={isLossLocked} />
            
            {isFlawlessWin ? (
              <div className="absolute top-2 left-2 px-3 py-1 bg-amber-950/80 rounded-lg border border-amber-500/80 font-['VT323'] text-xl text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                FLAWLESS
              </div>
            ) : (
              <div className="absolute top-2 left-2 px-3 py-1 bg-black/50 rounded-lg border border-slate-700/50 font-['VT323'] text-xl text-slate-400">
                ERR: <span className={mistakes >= maxMistakes - 1 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}>{mistakes}/{maxMistakes}</span>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">

            <div className="flex flex-col items-center gap-0">
              {/* Fabulous Streak Counter */}
              {state.fabulousStreak > 0 && mistakes === 0 && (
                <div className="font-['Orbitron'] font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-bounce text-2xl md:text-3xl tracking-[0.2em] uppercase italic mt-0 mb-0">
                  FABULOUS<span className="text-amber-200 ml-2">({state.fabulousStreak}x)</span>
                </div>
              )}

              {/* Progress Bars for DEFAULT mode */}
              {state.mode === 'DEFAULT' && (
                <div className="flex gap-2 items-center h-4 mt-1 mb-1">
                  {state.difficulty === 'INSANE' ? (
                    <div className={`text-3xl font-bold font-['Orbitron'] mt-[-6px] ${themeTokens.text} drop-shadow-[0_0_8px_currentColor]`}>∞</div>
                  ) : (
                    Array.from({ length: getLevelRoundRequirement(state.difficulty) }).map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-2.5 w-8 rounded-full border border-black/30 transition-all duration-500 ${
                          idx < state.roundsWonInLevel
                            ? `bg-current shadow-[0_0_8px_currentColor] ${themeTokens.text}`
                            : 'bg-slate-800'
                        }`}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Word Display */}
            <div className="flex max-w-full flex-wrap justify-center gap-x-1.5 gap-y-2 px-1 sm:gap-x-2 sm:px-2">
              {wordChars.map((letter, index) => {
                if (letter === ' ') return (
                  <div
                    key={`${state.word}-space-${index}`}
                    className="flex h-12 w-4 items-end justify-center pb-1 sm:h-16 sm:w-6 md:h-[4.5rem] md:w-8"
                  >
                    <div className="w-full border-b-[6px] border-slate-700/40 rounded-sm" />
                  </div>
                );
                const isRevealed = guessedSet.has(letter) || isLossLocked;
                const isMissed = isLossLocked && !guessedSet.has(letter);
                return (
                  <div 
                    key={`${state.word}-${index}`} 
                    className={`
                      flex h-12 w-8 items-center justify-center rounded-md text-2xl font-bold sm:h-16 sm:w-10 sm:text-3xl md:h-[4.5rem] md:w-12
                        border-b-[6px] overflow-visible transition-all duration-500 transform
                      ${isFlawlessWin 
                        ? 'border-amber-400 bg-amber-950/40 text-amber-100 scale-100 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-flawless' 
                        : isRevealed 
                          ? 'border-cyan-500 bg-slate-800/90 text-gray-100 scale-100 shadow-[0_4px_15px_rgba(34,211,238,0.2)]' 
                          : 'border-slate-600 bg-slate-900/50 text-gray-100 scale-95'}
                      ${isMissed ? 'text-rose-500 border-rose-500 bg-rose-950/30 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : ''}
                    `}
                  >
                    <span className={`transition-all duration-500 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      {letter}
                    </span>
                  </div>
                );
              })}
            </div>

            {state.hintsUsed > 0 && (
              <div className="max-h-32 w-full max-w-xl overflow-y-auto rounded-xl border border-yellow-500/50 bg-slate-800/80 p-2 px-4 shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="font-['Orbitron'] text-xs text-yellow-500 mb-0 tracking-widest font-bold">DECRYPTED DATA:</p>
                <p className="break-words text-base leading-snug text-slate-200 pointer-events-none [overflow-wrap:anywhere] font-['VT323'] sm:text-xl">{state.wordHint}</p>
              </div>
            )}
            
            {(isWinLocked || isLossLocked) && (
              <button 
                onClick={() => { sfx.stopCurrent(); onNextWord(); }}
                className={`group flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border-2 rounded-xl font-bold transition-colors duration-0 hover:shadow-[0_0_30px_currentColor] active:scale-95 animate-in zoom-in ${themeTokens.border} ${themeTokens.text}`}
              >
                <span className="font-['Orbitron'] text-xl tracking-wider">
                  {isLossLocked
                    ? state.mode === 'CASUAL'
                      ? 'RESTART ->'
                      : state.hearts > 0
                        ? `CONTINUE ->`
                        : 'GAME OVER! RETURN ->'
                    : 'NEXT ROUND ->'}
                </span>
              </button>
            )}

            {!isWinLocked && !isLossLocked && state.hintsUsed === 0 && (
              <button 
                onClick={onHint}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-950/40 border border-yellow-600/50 hover:bg-yellow-900/60 text-yellow-500 rounded-lg font-['Orbitron'] text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                <Lightbulb size={16} />
                HINT (-2 PTS)
              </button>
            )}

          </div>
        </div>

        {/* on-screen keyboard */}
        <div className="z-20 mt-2 flex w-full max-w-4xl flex-col gap-2 px-0 pb-4 sm:gap-3 sm:px-2">
          {KEYBOARD.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
              {row.map(key => (
                <KeyboardKey
                  key={key}
                  letter={key}
                  isGuessed={guessedSet.has(key)}
                  isCorrect={guessedSet.has(key) && state.word.includes(key)}
                  isWrong={guessedSet.has(key) && !state.word.includes(key)}
                  isDisabled={isWinLocked || isLossLocked}
                  isFancy={isFancy}
                  themeTokens={themeTokens}
                  onGuess={onGuess}
                />
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// each key is memoized so the whole keyboard doesn't re-render when you press one
interface KeyboardKeyProps {
  letter: string;
  isGuessed: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  isDisabled: boolean;
  isFancy: boolean;
  themeTokens: ReturnType<typeof getAccentTokens>;
  onGuess: (letter: string) => void;
}

const KeyboardKey = React.memo(({ letter, isGuessed, isCorrect, isWrong, isDisabled, isFancy, themeTokens, onGuess }: KeyboardKeyProps) => {
  const handleClick = useCallback(() => onGuess(letter), [onGuess, letter]);

  return (
    <button
      onClick={handleClick}
      disabled={isGuessed || isDisabled}
      className={`keyboard-key wave-target
        relative h-11 w-[8.4vw] min-w-7 max-w-9 overflow-visible rounded-lg text-base font-bold sm:h-14 sm:w-12 sm:max-w-none sm:text-xl md:h-16 md:w-16
        flex items-center justify-center border-2
        transition-[transform,border-color,color,box-shadow,background-color] duration-75 will-change-transform
        ${!isGuessed ? `bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700 ${themeTokens.hoverBorder} ${themeTokens.hoverText} ${isFancy ? 'hover:shadow-[0_0_20px_currentColor]' : ''} hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer shadow-lg` : ''}
        ${isCorrect ? `bg-slate-900 ${themeTokens.border} ${themeTokens.text} ${isFancy ? themeTokens.insetShadow : ''} cursor-default opacity-90` : ''}
        ${isWrong ? 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-default opacity-50 scale-95' : ''}
      `}
    >
      <span className="relative z-10">{letter}</span>
    </button>
  );
});

// cache the floating emoji positions so they don't reshuffle every render
const emojiConfigCache = new Map<string, { emoji: string; initialX: number; initialY: number; driftX: number; duration: number; delay: number }[]>();

const getEmojiConfigs = (theme: string, emojis: string[]) => {
  if (emojiConfigCache.has(theme)) return emojiConfigCache.get(theme)!;
  const configs = Array.from({ length: 12 }, (_, i) => {
    const chunkWidth = 100 / 12;
    const initialX = (i * chunkWidth) + (Math.random() * chunkWidth);
    const initialY = Math.random() * 100;
    return {
      emoji: emojis[i % emojis.length],
      initialX,
      initialY,
      driftX: initialX + (Math.random() * 20 - 10),
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    };
  });
  emojiConfigCache.set(theme, configs);
  return configs;
};

const FloatingEnvironment = ({ theme, isFancy }: { theme: string | null; isFancy: boolean }) => {
  if (!theme) return null;
  
  let emojis: string[] = [];
  if (theme.includes('FOOTBALL')) emojis = ['⚽️', '🥅', '🏟️', '🏆', '👟'];
  else if (theme.includes('SCIENCE')) emojis = ['🔬', '🧬', '🔭', '🧪', '⚛️', '🚀'];
  else if (theme.includes('COMPUTER')) emojis = ['💻', '💾', '🖥️', '💽', '⌨️', '🖱️'];
  else if (theme.includes('WORLD')) emojis = ['🌍', '🗼', '🗽', '⛩️', '🏰', '🗺️'];
  else if (theme.includes('MUSIC')) emojis = ['🎵', '🎸', '🎤', '🥁', '🎹'];
  else if (theme.includes('MOVIES')) emojis = ['🎬', '🎥', '🍿', '🎭', '⭐'];
  else if (theme.includes('FOOD')) emojis = ['🍜', '🍕', '🍣', '🌮', '🧆'];
  else if (theme.includes('SPACE')) emojis = ['🚀', '⭐', '🌌', '🪐', '☄️'];
  else emojis = ['✨', '🕹️', '👾', '🎮', '💥']; // Mixed / fallback

  const configs = getEmojiConfigs(theme, emojis);

  return (
    <div className="floating-layer absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20" style={{ contain: 'strict' }}>
      {configs.map((cfg, i) => (
        <motion.div
          key={`${theme}-${i}`}
          initial={{ opacity: 0, scale: 0, x: `${cfg.initialX}vw`, y: `${cfg.initialY}vh` }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            scale: [0, 1.2, 1, 0.5],
            x: [`${cfg.initialX}vw`, `${cfg.driftX}vw`],
            y: [`${cfg.initialY}vh`, `${cfg.initialY - 30}vh`]
          }}
          transition={{
            duration: cfg.duration,
            repeat: Infinity,
            ease: "linear",
            delay: cfg.delay
          }}
          style={{ willChange: 'transform, opacity' }}
          className={`absolute text-5xl md:text-7xl ${isFancy ? 'filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`}
        >
          {cfg.emoji}
        </motion.div>
      ))}
    </div>
  );
};

// memoized so the floating emojis don't restart their animations when unrelated state changes
const MemoizedFloatingEnvironment = React.memo(FloatingEnvironment);


