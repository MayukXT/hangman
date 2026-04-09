import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameState, GameMode, GameDifficulty } from './types';
import { WordTheme, THEME_DICT, ALL_THEMES } from './data/words';
import { getDifficultyMaxMistakes, getDifficultyPoints } from './utils/gameConstants';
import { MenuScreen } from './components/MenuScreen';
import { ThemeSelectScreen } from './components/ThemeSelectScreen';
import { RulesScreen } from './components/RulesScreen';
import { GameScreen } from './components/GameScreen';
import { NameEntryScreen } from './components/NameEntryScreen';
import { GlobalSettings } from './components/GlobalSettings';
import { AccentProvider } from './hooks/useWaveAccent';
import { GraphicsProvider } from './hooks/useGraphics';
import { sfx } from './utils/audio';

const INITIAL_STATE: GameState = {
  screen: 'MENU',
  mode: 'DEFAULT',
  difficulty: 'EASY',
  theme: null,
  runtimeTheme: null,
  score: 0,
  word: '',
  wordHint: '',
  wordClue: '',
  guessedLetters: [],
  isLost: false,
  isWon: false,
  hintsUsed: 0,
  seenWords: {},
  hearts: 5,
};

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('arcade-hangman-save');
    if (saved) {
      try {
        return JSON.parse(saved) as GameState;
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('arcade-hangman-highscore') || '0', 10));
  const [username, setUsername] = useState(() => localStorage.getItem('arcade-hangman-username'));
  const [isChangingName, setIsChangingName] = useState(false);

  // Persist state to localstorage – debounced to avoid I/O jank on rapid keystrokes
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem('arcade-hangman-save', JSON.stringify(state));
    }, 300);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state]);

  // Persist highscore
  useEffect(() => {
    if (state.score > highScore) {
      setHighScore(state.score);
      localStorage.setItem('arcade-hangman-highscore', state.score.toString());
    }
  }, [state.score, highScore]);

  // Derived game state – memoized to avoid recalculation on unrelated renders
  const maxMistakes = getDifficultyMaxMistakes(state.difficulty);
  const mistakes = useMemo(() => state.guessedLetters.filter(l => !state.word.includes(l)).length, [state.guessedLetters, state.word]);
  const computedIsLost = mistakes >= maxMistakes;
  const computedIsWon = useMemo(() => state.word.length > 0 && state.word.split('').every(l => state.guessedLetters.includes(l)), [state.word, state.guessedLetters]);

  // Auto trigger effects on win/loss
  
  useEffect(() => {
    if (state.screen !== 'PLAYING') return;

    if (computedIsWon && !state.isWon) {
      let points = getDifficultyPoints(state.difficulty);
      if (mistakes === 0) points *= 2; 
      
      setState(prev => ({ ...prev, isWon: true, score: prev.score + points }));
      triggerConfetti();
      
      // If we crossed boundary this round, it's a level up. We check boundaries naively:
      const totalScore = state.score + points;
      const leveledUp = (state.difficulty === 'EASY' && totalScore >= 3) || 
                        (state.difficulty === 'NORMAL' && totalScore >= 18) ||
                        (state.difficulty === 'HARD' && totalScore >= 67);
      
      if (leveledUp && state.mode === 'DEFAULT') {
        sfx.playLevelUp();
      } else {
        sfx.playCorrect(); // Standard win beep
      }
    }

    if (computedIsLost && !state.isLost) {
      setState(prev => ({ ...prev, isLost: true }));
      sfx.playGameOver();
    }
  }, [computedIsWon, computedIsLost, state.isWon, state.isLost, state.screen, mistakes, state.difficulty, state.score, state.mode]);


  // Actions – wrapped in useCallback for stable references
  const startGameFlow = useCallback((mode: GameMode, diff: GameDifficulty) => {
    if (mode === 'CASUAL') {
      setState({ ...INITIAL_STATE, screen: 'THEME_SELECT', mode, difficulty: diff });
    } else {
      generateNewWord(diff, 'MIXED', mode, 0, 5);
    }
  }, []);

  const handleThemeSelected = useCallback((theme: WordTheme) => {
    // Read current state via ref to keep callback stable
    const s = stateRef.current;
    generateNewWord(s.difficulty, theme, s.mode, s.score);
  }, []);

  const generateNewWord = (diff: GameDifficulty, theme: WordTheme | 'MIXED', mode: GameMode, currentScore: number, currentHearts?: number) => {
    setState(prev => {
      // Pick theme
      const activeTheme = theme === 'MIXED' ? ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)] : theme;
      const pool = THEME_DICT[activeTheme];

      // Migrate old string[] seenWords format to Record (clean slate on format change)
      const seenWordsMap: Record<string, string[]> =
        prev.seenWords && !Array.isArray(prev.seenWords) ? prev.seenWords : {};
      const themeSeenWords: string[] = seenWordsMap[activeTheme] || [];

      // Filter: unseen + correct length for difficulty
      let availableWords = pool.filter(item => {
        const word = item.word.toUpperCase();
        if (themeSeenWords.includes(word)) return false;
        const len = word.length;
        if (diff === 'EASY'   && (len < 2 || len > 4))  return false;
        if (diff === 'NORMAL' && (len < 5 || len > 7))  return false;
        if (diff === 'HARD'   && (len < 8 || len > 12)) return false;
        return true;
      });

      // Fallback 1: ignore length but keep unseen constraint
      if (availableWords.length === 0) {
        availableWords = pool.filter(item => !themeSeenWords.includes(item.word.toUpperCase()));
      }

      // Fallback 2: full pool exhausted for this theme — reset only this theme's seen list
      let updatedThemeSeenWords = themeSeenWords;
      if (availableWords.length === 0) {
        availableWords = pool;
        updatedThemeSeenWords = [];
      }

      const item = availableWords[Math.floor(Math.random() * availableWords.length)];
      const nextWord = item.word.toUpperCase();
      const wordClue = item.clues[Math.floor(Math.random() * item.clues.length)] || '';

      const updatedSeenWords: Record<string, string[]> = {
        ...seenWordsMap,
        [activeTheme]: [...updatedThemeSeenWords, nextWord],
      };

      return {
        ...prev,
        screen: 'PLAYING',
        mode,
        difficulty: diff,
        theme,
        runtimeTheme: activeTheme,
        score: currentScore,
        hearts: currentHearts !== undefined ? currentHearts : prev.hearts,
        word: nextWord,
        wordHint: item.hint,
        wordClue,
        guessedLetters: [],
        isLost: false,
        isWon: false,
        hintsUsed: 0,
        seenWords: updatedSeenWords,
      };
    });
  };

  const onNextWordAction = useCallback(() => {
    const s = stateRef.current;

    if (s.isLost) {
      if (s.mode === 'CASUAL') {
        // CASUAL: stay in game, reset score, keep theme
        generateNewWord(s.difficulty, s.theme || 'MIXED', s.mode, 0, s.hearts);
        return;
      }
      // DEFAULT mode hearts logic
      if (s.hearts > 0) {
        // Consume 1 heart, continue at same difficulty/theme
        generateNewWord(s.difficulty, s.theme || 'MIXED', s.mode, s.score, s.hearts - 1);
        return;
      }
      // No hearts left — true game over
      setState(INITIAL_STATE);
      return;
    }

    // Win flow: progress algorithm (DEFAULT mode only)
    let nextDifficulty = s.difficulty;
    let nextTheme = s.theme;
    let nextHearts = s.hearts;

    if (s.mode === 'DEFAULT') {
      const score = s.score;
      if (score >= 67) {
        nextDifficulty = 'INSANE';
        nextTheme = 'MIXED';
        nextHearts = 0; // No safety net in INSANE
      } else if (score >= 18) {
        nextDifficulty = 'HARD';
      } else if (score >= 3) {
        nextDifficulty = 'NORMAL';
      }
    }

    generateNewWord(nextDifficulty, nextTheme || 'MIXED', s.mode, s.score, nextHearts);
  }, []);


  // Use ref for latest state to keep guess callback stable across renders
  const stateRef = useRef(state);
  stateRef.current = state;

  const guess = useCallback((letter: string) => {
    const s = stateRef.current;
    if (s.isWon || s.isLost) return;
    if (s.guessedLetters.includes(letter)) return;
    
    const isCorrect = s.word.includes(letter);
    if (isCorrect) sfx.playCorrect();
    else sfx.playWrong();

    setState(prev => ({
      ...prev,
      guessedLetters: [...prev.guessedLetters, letter]
    }));
  }, []);

  const useHint = useCallback(() => {
    setState(prev => {
      if (prev.score < 2 || prev.hintsUsed > 0) return prev;
      return { ...prev, score: prev.score - 2, hintsUsed: 1 };
    });
  }, []);

  // Keyboard binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.screen !== 'PLAYING') return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) guess(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guess, state.screen]);


  const confettiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggerConfetti = useCallback(() => {
    if (confettiTimerRef.current) clearInterval(confettiTimerRef.current);

    const graphicsMode = localStorage.getItem('arcade-hangman-graphics') || 'FANCY';
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, useWorker: true, resize: false };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    if (graphicsMode === 'LIGHT') {
      // Single small burst in Light mode
      confetti({ ...defaults, particleCount: 30, origin: { x: 0.5, y: 0.4 } });
      return;
    }

    // Fancy mode: staggered bursts
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    confettiTimerRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) { clearInterval(confettiTimerRef.current!); confettiTimerRef.current = null; return; }
      const particleCount = 25 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 300);
  }, []);

  const onRestartInPlace = useCallback(() => {
    const s = stateRef.current;
    generateNewWord('EASY', s.theme || 'MIXED', s.mode, 0, 5);
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem('arcade-hangman-username');
    localStorage.removeItem('arcade-hangman-highscore');
    localStorage.removeItem('arcade-hangman-save');
    setUsername(null);
    setHighScore(0);
    setState(INITIAL_STATE);
  }, []);

  const returnToMenu = useCallback(() => setState(INITIAL_STATE), []);
  const openNameChange = useCallback(() => setIsChangingName(true), []);
  const closeNameChange = useCallback(() => setIsChangingName(false), []);
  const openRules = useCallback(() => setState(prev => ({ ...prev, screen: 'RULES' })), []);
  const goBackToMenu = useCallback(() => setState(prev => ({ ...prev, screen: 'MENU' })), []);

  return (
    <GraphicsProvider>
    <AccentProvider>
      <div className="bg-black text-slate-100 selection:bg-violet-900 overflow-hidden relative min-h-screen">
      
      {/* Absolute Bottom Watermark Layer */}
      <div className="fixed bottom-4 right-6 z-[150] group pointer-events-none">
        <span className="font-['Press_Start_2P'] text-[10px] text-[#8B6508] transition-colors duration-500 group-hover:text-[#FFD700] drop-shadow-[0_0_10px_rgba(139,101,8,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] pointer-events-auto cursor-default">
          Made by Mayuk
        </span>
      </div>

      <GlobalSettings 
        isNameEntryActive={!username || isChangingName}
        onChangeNameClick={openNameChange}
        onClearData={clearAllData}
      />

      {(!username || isChangingName) && (
        <NameEntryScreen 
          onSaveName={(name) => {
            localStorage.setItem('arcade-hangman-username', name);
            setUsername(name);
            setIsChangingName(false);
          }} 
          onCancel={isChangingName ? closeNameChange : undefined}
        />
      )}

      {state.screen === 'MENU' && (
        <MenuScreen 
          highScore={highScore}
          username={username || ''}
          onStartGame={startGameFlow} 
          onOpenRules={openRules} 
        />
      )}
      {state.screen === 'RULES' && (
        <RulesScreen onBack={goBackToMenu} />
      )}
      {state.screen === 'THEME_SELECT' && (
        <ThemeSelectScreen 
          onSelect={handleThemeSelected} 
          onBack={goBackToMenu} 
        />
      )}
      {username && state.screen === 'PLAYING' && (
        <GameScreen 
          state={state} 
          username={username}
          onChangeNameClick={openNameChange}
          onClearData={clearAllData}
          onGuess={guess} 
          onHint={useHint}
          onNextWord={onNextWordAction}
          onReturnMenu={returnToMenu}
          onRestartInPlace={onRestartInPlace}
        />
      )}
      </div>
    </AccentProvider>
    </GraphicsProvider>
  );
}