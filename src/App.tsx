import { useState, useEffect, useCallback, useMemo, useRef, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import confetti from 'canvas-confetti';
import { GameState, GameMode, GameDifficulty } from './types';
import { WordTheme, THEME_DICT, ALL_THEMES } from './data/words';
import { getDifficultyMaxMistakes, getDifficultyPoints, getLevelRoundRequirement } from './utils/gameConstants';
import { IntroScreen } from './components/IntroScreen';
import { MenuScreen } from './components/MenuScreen';
import { ThemeSelectScreen } from './components/ThemeSelectScreen';
import { RulesScreen } from './components/RulesScreen';
import { GameScreen } from './components/GameScreen';
import { NameEntryScreen } from './components/NameEntryScreen';
import { GlobalSettings } from './components/GlobalSettings';
import { AccentProvider } from './hooks/useWaveAccent';
import { GraphicsProvider } from './hooks/useGraphics';
import { sfx } from './utils/audio';
import { checkForUpdate, type UpdateInfo } from './utils/updater';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-center p-8">
          <div>
            <h1 className="font-['Press_Start_2P'] text-2xl text-rose-500 mb-4">GAME CRASHED</h1>
            <p className="font-['VT323'] text-xl text-slate-400 mb-6">Something went wrong. Your data is safe.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-['Orbitron'] font-bold rounded-lg transition-colors"
            >
              RELOAD GAME
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const INITIAL_STATE: GameState = {
  screen: 'INTRO',
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
  roundsWonInLevel: 0,
  fabulousStreak: 0,
};

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('arcade-hangman-save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameState;
        if (parsed.screen === 'MENU') parsed.screen = 'INTRO';
        // fill in any missing fields from older saves so nothing breaks
        return { ...INITIAL_STATE, ...parsed };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('arcade-hangman-highscore') || '0', 10));
  const [showHighScoreCross, setShowHighScoreCross] = useState(false);
  const [previousHighScore, setPreviousHighScore] = useState(highScore);
  const [username, setUsername] = useState(() => localStorage.getItem('arcade-hangman-username'));
  const [isChangingName, setIsChangingName] = useState(false);

  // checks for updates every time you open the app
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  useEffect(() => { checkForUpdate().then(info => { if (info) setUpdateInfo(info); }); }, []);

  const confettiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggerConfetti = useCallback(() => {
    if (confettiTimerRef.current) clearInterval(confettiTimerRef.current);

    const graphicsMode = localStorage.getItem('arcade-hangman-graphics') || 'FANCY';
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, useWorker: true, resize: false };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    if (graphicsMode === 'LIGHT') {
      confetti({ ...defaults, particleCount: 30, origin: { x: 0.5, y: 0.4 } });
      return;
    }

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

  // saves your game to localStorage (waits 300ms so it doesn't lag when you're typing fast)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('arcade-hangman-save', JSON.stringify(state));
      } catch { /* storage full, not a big deal */ }
    }, 300);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state]);

  // save high score whenever you beat it
  useEffect(() => {
    if (state.score > highScore) {
      setHighScore(state.score);
      try { localStorage.setItem('arcade-hangman-highscore', state.score.toString()); } catch { /* oh well */ }
    }

    if (state.score > previousHighScore && !showHighScoreCross && previousHighScore > 0 && highScore > 0) {
      setShowHighScoreCross(true);
      triggerConfetti();
      sfx.playHighScoreCross();
    }
  }, [state.score, highScore, previousHighScore, showHighScoreCross, triggerConfetti]);

  // figure out if you won or lost (cached so it doesn't recalculate for no reason)
  const maxMistakes = getDifficultyMaxMistakes(state.difficulty);
  const mistakes = useMemo(() => state.guessedLetters.filter(l => !state.word.includes(l)).length, [state.guessedLetters, state.word]);
  const computedIsLost = mistakes >= maxMistakes;
  const computedIsWon = useMemo(() => state.word.length > 0 && state.word.split('').filter(l => l !== ' ').every(l => state.guessedLetters.includes(l)), [state.word, state.guessedLetters]);

  // play sounds and update state when you win or lose
  useEffect(() => {
    if (state.screen !== 'PLAYING') return;

    if (computedIsWon && !state.isWon) {
      let points = getDifficultyPoints(state.difficulty);
      if (mistakes === 0) points *= 2; 
      
      const leveledUp = state.roundsWonInLevel + 1 >= getLevelRoundRequirement(state.difficulty) && state.difficulty !== 'INSANE';
      const newFabulousStreak = mistakes === 0 ? state.fabulousStreak + 1 : 0;

      setState(prev => ({ 
        ...prev, 
        isWon: true, 
        score: prev.score + points,
        roundsWonInLevel: prev.roundsWonInLevel + 1,
        fabulousStreak: newFabulousStreak
      }));
      triggerConfetti();
      
      if (leveledUp && state.mode === 'DEFAULT') {
        sfx.playLevelUp();
      } else if (newFabulousStreak >= 6) {
        sfx.playFabulous5p();
      } else if (newFabulousStreak === 5) {
        sfx.playFabulous5x();
      } else if (newFabulousStreak >= 3) {
        sfx.playFabulous3x();
      } else if (newFabulousStreak >= 1) {
        sfx.playFabulous1x();
      } else {
        sfx.playRoundWin();
      }
    }

    if (computedIsLost && !state.isLost) {
      setState(prev => ({
        ...prev,
        isLost: true,
        fabulousStreak: 0,
        hearts: prev.mode === 'DEFAULT' ? Math.max(0, prev.hearts - 1) : prev.hearts
      }));
      if (state.mode === 'CASUAL') {
        sfx.playRoundLostCasual();
      } else if (state.hearts <= 1 || state.difficulty === 'INSANE') {
        sfx.playGameLost();
      } else {
        sfx.playHeartLost();
      }
    }
  }, [computedIsWon, computedIsLost, state.isWon, state.isLost, state.screen, mistakes, state.difficulty, state.score, state.mode, state.roundsWonInLevel, state.fabulousStreak, state.hearts, triggerConfetti]);


  // game actions (wrapped in useCallback so they don't cause extra re-renders)
  const startGameFlow = useCallback((mode: GameMode, diff: GameDifficulty) => {
    setPreviousHighScore(highScore);
    setShowHighScoreCross(false);
    if (mode === 'CASUAL') {
      setState({ ...INITIAL_STATE, screen: 'THEME_SELECT', mode, difficulty: diff });
    } else {
      generateNewWord(diff, 'MIXED', mode, 0, 5, { fabulousStreak: 0, roundsWonInLevel: 0, hintsUsed: 0 });
    }
  }, [highScore]);

  const handleThemeSelected = useCallback((theme: WordTheme) => {
    // grab latest state from ref so this callback stays stable
    const s = stateRef.current;
    generateNewWord(s.difficulty, theme, s.mode, s.score);
  }, []);

  const generateNewWord = (
    diff: GameDifficulty, 
    theme: WordTheme | 'MIXED', 
    mode: GameMode, 
    currentScore: number, 
    currentHearts?: number,
    stateOverrides?: Partial<GameState>
  ) => {
    setState(prev => {
      // pick a random theme if MIXED, otherwise use what was selected
      const activeTheme = theme === 'MIXED' ? ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)] : theme;
      const pool = THEME_DICT[activeTheme];

      // handle old save format - if it's the old array style, start fresh
      const seenWordsMap: Record<string, string[]> =
        prev.seenWords && !Array.isArray(prev.seenWords) ? prev.seenWords : {};
      const themeSeenWords: string[] = seenWordsMap[activeTheme] || [];

      // only pick words you haven't seen yet that fit the difficulty's length range
      let availableWords = pool.filter(item => {
        const word = item.word.toUpperCase();
        if (themeSeenWords.includes(word)) return false;
        const len = word.length;
        if (diff === 'EASY'   && (len < 2 || len > 4))  return false;
        if (diff === 'NORMAL' && (len < 5 || len > 7))  return false;
        if (diff === 'HARD'   && (len < 8 || len > 12)) return false;
        return true;
      });

      // if nothing matches the length, just pick any unseen word
      if (availableWords.length === 0) {
        availableWords = pool.filter(item => !themeSeenWords.includes(item.word.toUpperCase()));
      }

      // if you've seen every word in this theme, reset and start over
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
        ...stateOverrides,
      };
    });
  };

  const onNextWordAction = useCallback(() => {
    const s = stateRef.current;

    if (s.isLost) {
      if (s.mode === 'CASUAL') {
        // casual mode: you don't really lose, just reset score and keep going
        generateNewWord(s.difficulty, s.theme || 'MIXED', s.mode, 0, s.hearts, { fabulousStreak: 0 });
        return;
      }
      // default mode: lose a heart but keep playing if you have some left
      if (s.hearts >= 0 && s.hearts !== 0) {
        generateNewWord(s.difficulty, s.theme || 'MIXED', s.mode, s.score, s.hearts, { fabulousStreak: 0 });
        return;
      }
      // no hearts = you're done, back to start
      setState(INITIAL_STATE);
      return;
    }

    // if you won, check if you should level up (default mode only)
    let nextDifficulty = s.difficulty;
    let nextTheme = s.theme;
    let nextHearts = s.hearts;
    let leveledUp = false;

    if (s.mode === 'DEFAULT') {
      leveledUp = s.roundsWonInLevel >= getLevelRoundRequirement(s.difficulty) && s.difficulty !== 'INSANE';
      if (leveledUp) {
        if (s.difficulty === 'EASY') {
          nextDifficulty = 'NORMAL';
        } else if (s.difficulty === 'NORMAL') {
          nextDifficulty = 'HARD';
        } else if (s.difficulty === 'HARD') {
          nextDifficulty = 'INSANE';
          nextTheme = 'MIXED';
          nextHearts = 0; // insane mode = no hearts, good luck lol
        }
      }
    }

    generateNewWord(nextDifficulty, nextTheme || 'MIXED', s.mode, s.score, nextHearts, leveledUp ? { roundsWonInLevel: 0 } : {});
  }, []);


  // ref trick so the guess function always sees the latest state
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
      sfx.playHint();
      return { ...prev, score: prev.score - 2, hintsUsed: 1 };
    });
  }, []);

  // let the player type letters on their keyboard to guess
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.screen !== 'PLAYING') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) guess(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guess, state.screen]);


  const onRestartInPlace = useCallback(() => {
    setPreviousHighScore(highScore);
    setShowHighScoreCross(false);
    const s = stateRef.current;
    generateNewWord('EASY', s.theme || 'MIXED', s.mode, 0, 5, { fabulousStreak: 0, roundsWonInLevel: 0, hintsUsed: 0 });
  }, [highScore]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem('arcade-hangman-username');
    localStorage.removeItem('arcade-hangman-highscore');
    localStorage.removeItem('arcade-hangman-save');
    setUsername(null);
    setHighScore(0);
    setPreviousHighScore(0);
    setShowHighScoreCross(false);
    setState({ ...INITIAL_STATE, screen: 'MENU' });
  }, []);

  const returnToMenu = useCallback(() => {
    setPreviousHighScore(highScore);
    setShowHighScoreCross(false);
    setState({ ...INITIAL_STATE, screen: 'MENU' });
  }, [highScore]);
  const openNameChange = useCallback(() => setIsChangingName(true), []);
  const closeNameChange = useCallback(() => setIsChangingName(false), []);
  const openRules = useCallback(() => setState(prev => ({ ...prev, screen: 'RULES' })), []);
  const goBackToMenu = useCallback(() => setState(prev => ({ ...prev, screen: 'MENU' })), []);

  return (
    <ErrorBoundary>
    <GraphicsProvider>
    <AccentProvider>
      <div className="bg-black text-slate-100 selection:bg-violet-900 overflow-y-auto overflow-x-hidden relative min-h-screen">
      
      {/* watermark at the bottom right */}
      <div className="fixed bottom-4 right-6 z-[150] group pointer-events-none">
        <span className="font-['Press_Start_2P'] text-[10px] text-[#8B6508] transition-colors duration-500 group-hover:text-[#FFD700] drop-shadow-[0_0_10px_rgba(139,101,8,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] pointer-events-auto cursor-default">
          Made by Mayuk
        </span>
      </div>

      <GlobalSettings 
        isNameEntryActive={!username || isChangingName}
        onChangeNameClick={openNameChange}
        onClearData={clearAllData}
        updateInfo={updateInfo}
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

      {state.screen === 'INTRO' && (
        <IntroScreen onComplete={() => setState(prev => ({ ...prev, screen: 'MENU' }))} />
      )}
      {state.screen === 'MENU' && (
        <MenuScreen 
          highScore={highScore}
          username={username || ''}
          onStartGame={startGameFlow} 
          onOpenRules={openRules}
          updateInfo={updateInfo}
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
          highScore={highScore}
          onClearData={clearAllData}
          onGuess={guess} 
          onHint={useHint}
          onNextWord={onNextWordAction}
          onReturnMenu={returnToMenu}
          onRestartInPlace={onRestartInPlace}
        />
      )}

      {showHighScoreCross && (
        <div className="fixed inset-0 z-[200] backdrop-blur-xl bg-black/60 flex items-center justify-center flex-col gap-8">
          <div className="text-amber-400 drop-shadow-[0_0_20px_#fbbf24] text-5xl font-['Press_Start_2P'] text-center">
            NEW<br/>HIGHSCORE!
          </div>
          <div className="bg-[#12121a] border-4 border-amber-400 p-8 rounded-xl shadow-[0_0_40px_rgba(251,191,36,0.3)]">
            <span className="text-slate-400 text-sm tracking-widest font-bold block mb-2 text-center">SCORE</span>
            <span className="text-amber-400 text-6xl font-['Press_Start_2P'] tracking-widest">
              {state.score}
            </span>
          </div>
          <button 
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-300 font-['Press_Start_2P'] uppercase text-xl shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all"
            onClick={() => {
               setShowHighScoreCross(false);
               setPreviousHighScore(Infinity); // so it doesn't pop up again this session
               sfx.stopCurrent();
            }}
          >
            CONTINUE
          </button>
        </div>
      )}
      </div>
    </AccentProvider>
    </GraphicsProvider>
    </ErrorBoundary>
  );
}