import type { GameDifficulty } from '../types';
import type { AccentColorId } from '../hooks/useWaveAccent';

export const APP_VERSION = 'v2.2';

export const getDifficultyMaxMistakes = (diff: GameDifficulty): number => {
  switch (diff) {
    case 'EASY': return 8;
    case 'NORMAL': return 6;
    case 'HARD': return 4;
    case 'INSANE': return 3;
  }
};

export const getLevelRoundRequirement = (diff: GameDifficulty): number => {
  switch (diff) {
    case 'EASY': return 3;
    case 'NORMAL': return 5;
    case 'HARD': return 7;
    case 'INSANE': return Infinity;
  }
};

export const getDifficultyPoints = (diff: GameDifficulty): number => {
  switch (diff) {
    case 'EASY': return 1;
    case 'NORMAL': return 3;
    case 'HARD': return 7;
    case 'INSANE': return 15;
  }
};

export const getAccentTokens = (color: AccentColorId) => {
  switch(color) {
     case 'RED': return { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', hoverBg: 'hover:bg-rose-500', hoverText: 'hover:text-rose-500', hoverBorder: 'hover:border-rose-400', shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]', insetShadow: 'shadow-[inset_0_0_20px_rgba(244,63,94,0.5)]' };
     case 'YELLOW': return { text: 'text-amber-400', bg: 'bg-amber-400', border: 'border-amber-400', hoverBg: 'hover:bg-amber-400', hoverText: 'hover:text-amber-400', hoverBorder: 'hover:border-amber-300', shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]', insetShadow: 'shadow-[inset_0_0_20px_rgba(251,191,36,0.5)]' };
     case 'PURPLE': return { text: 'text-violet-400', bg: 'bg-violet-500', border: 'border-violet-500', hoverBg: 'hover:bg-violet-500', hoverText: 'hover:text-violet-400', hoverBorder: 'hover:border-violet-400', shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]', insetShadow: 'shadow-[inset_0_0_20px_rgba(139,92,246,0.5)]' };
     case 'GREEN': return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', hoverBg: 'hover:bg-emerald-500', hoverText: 'hover:text-emerald-400', hoverBorder: 'hover:border-emerald-400', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', insetShadow: 'shadow-[inset_0_0_20px_rgba(16,185,129,0.5)]' };
     case 'CYAN': 
     default: return { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500', hoverBg: 'hover:bg-cyan-500', hoverText: 'hover:text-cyan-400', hoverBorder: 'hover:border-cyan-400', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]', insetShadow: 'shadow-[inset_0_0_20px_rgba(34,211,238,0.5)]' };
  }
};

export const getAccentColorValues = (color: AccentColorId): { stroke: string; shadow: string } => {
  switch(color) {
     case 'RED': return { stroke: '#ef4444', shadow: '0 0 15px rgba(244, 63, 94, 0.8)' };
     case 'YELLOW': return { stroke: '#facc15', shadow: '0 0 15px rgba(251, 191, 36, 0.8)' };
     case 'PURPLE': return { stroke: '#a78bfa', shadow: '0 0 15px rgba(139, 92, 246, 0.8)' };
     case 'GREEN': return { stroke: '#4ade80', shadow: '0 0 15px rgba(16, 185, 129, 0.8)' };
     case 'CYAN': 
     default: return { stroke: '#22d3ee', shadow: '0 0 15px rgba(34, 211, 238, 0.8)' };
  }
};
