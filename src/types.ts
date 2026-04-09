import { WordTheme } from './data/words';

export type GameDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE';
export type GameMode = 'CASUAL' | 'DEFAULT';

export interface GameState {
  screen: 'INTRO' | 'MENU' | 'RULES' | 'THEME_SELECT' | 'PLAYING' | 'GAMEOVER';
  mode: GameMode;
  difficulty: GameDifficulty;
  theme: WordTheme | 'MIXED' | null;
  runtimeTheme: string | null;
  score: number;
  word: string;
  wordHint: string;
  wordClue: string;
  guessedLetters: string[]; // using array instead of Set cause its easier to save to localStorage
  isLost: boolean;
  isWon: boolean;
  hintsUsed: number;
  seenWords: Record<string, string[]>; // tracks which words you've already played per theme
  hearts: number; // your lives in default mode (insane mode has 0 lol)
  roundsWonInLevel: number;
  fabulousStreak: number;
}
