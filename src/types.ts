import { WordTheme } from './data/words';

export type GameDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE';
export type GameMode = 'CASUAL' | 'DEFAULT';

export interface GameState {
  screen: 'MENU' | 'RULES' | 'THEME_SELECT' | 'PLAYING' | 'GAMEOVER';
  mode: GameMode;
  difficulty: GameDifficulty;
  theme: WordTheme | 'MIXED' | null;
  runtimeTheme: string | null;
  score: number;
  word: string;
  wordHint: string;
  wordClue: string;
  guessedLetters: string[]; // Set is harder to clone for localStorage
  isLost: boolean;
  isWon: boolean;
  hintsUsed: number;
  seenWords: Record<string, string[]>; // per-theme seen word tracking
  hearts: number; // DEFAULT mode only — starts at 5, zeroed on INSANE
}
