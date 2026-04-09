import React, { createContext, useContext, useState } from 'react';
export type AccentColorId = 'RED' | 'YELLOW' | 'CYAN' | 'PURPLE' | 'GREEN';

interface WaveConfig {
  color: AccentColorId;
  originX: number;
  originY: number;
  timestamp: number;
  durationMs: number;
}

interface AccentContextType {
  wave: WaveConfig;
  triggerWave: (color: AccentColorId, x: number, y: number) => void;
  waveSpeed: number;
  setWaveSpeed: (speed: number) => void;
}

const DEFAULT_WAVE: WaveConfig = {
  color: 'CYAN',
  originX: 0,
  originY: 0,
  timestamp: 0,
  durationMs: 5000,
};

const AccentContext = createContext<AccentContextType | null>(null);

import { flushSync } from 'react-dom';

// Raw Hex mappings hoisted to avoid re-creation
const getHex = (c: AccentColorId) => {
  switch (c) {
    case 'RED': return '#f43f5e';
    case 'YELLOW': return '#fbbf24';
    case 'PURPLE': return '#8b5cf6';
    case 'GREEN': return '#10b981';
    case 'CYAN': default: return '#22d3ee';
  }
};

export const AccentProvider = ({ children }: { children: React.ReactNode }) => {
  const [wave, setWave] = useState<WaveConfig>(() => {
    const saved = localStorage.getItem('arcade-hangman-accent');
    return {
      ...DEFAULT_WAVE,
      color: (saved as AccentColorId) || 'CYAN',
    }
  });

  const [waveSpeed, setWaveSpeedState] = useState<number>(() => {
    const saved = localStorage.getItem('arcade-hangman-wavespeed');
    return saved ? parseInt(saved, 10) : 5;
  });

  const setWaveSpeed = (speed: number) => {
    setWaveSpeedState(speed);
    localStorage.setItem('arcade-hangman-wavespeed', speed.toString());
  };

  const triggerWave = (color: AccentColorId, x: number, y: number) => {
    localStorage.setItem('arcade-hangman-accent', color);

    // Check graphics mode from localStorage directly to avoid coupling contexts
    const graphicsMode = localStorage.getItem('arcade-hangman-graphics') || 'FANCY';
    
    // Calculate duration based on speed 1-10
    // Speed 10 -> 250ms, Speed 5 -> 1500ms, Speed 1 -> 2500ms
    const calcDurationMs = (10 - waveSpeed) * 250 + 250;

    // LIGHT mode: instant swap, zero GPU work, no transitions
    if (graphicsMode === 'LIGHT') {
      setWave({ color, originX: x, originY: y, timestamp: Date.now(), durationMs: calcDurationMs });
      return;
    }

    if (!document.startViewTransition) {
      setWave({ color, originX: x, originY: y, timestamp: Date.now(), durationMs: calcDurationMs });
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setWave({ color, originX: x, originY: y, timestamp: Date.now(), durationMs: calcDurationMs });
      });
    });

    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const durationMs = calcDurationMs;

      // GPU View Transition wipe
      document.documentElement.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
        ],
        {
          duration: durationMs,
          easing: 'linear',
          pseudoElement: '::view-transition-new(root)',
        }
      );

      // Skip the shockwave ring in Light mode
      if (graphicsMode === 'LIGHT') return;

      const hex = getHex(color);

      // Create the trailing shockwave — batch all styles in one Object.assign to avoid layout thrashing
      const ring = document.createElement('div');
      Object.assign(ring.style, {
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '999999',
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 100px 30px ${hex}, inset 0 0 60px 20px ${hex}`,
        border: `4px solid ${hex}99`,
        outline: `1px solid ${hex}`,
        willChange: 'width, height, opacity',
        contain: 'strict',
      });

      document.body.appendChild(ring);

      ring.animate(
        [
          { width: '0px', height: '0px', opacity: 1 },
          { width: `${endRadius * 2}px`, height: `${endRadius * 2}px`, opacity: 0 }
        ],
        {
          duration: durationMs,
          easing: 'linear',
          fill: 'forwards'
        }
      ).onfinish = () => document.body.removeChild(ring);
    });
  };

  return (
    <AccentContext.Provider value={{ wave, triggerWave, waveSpeed, setWaveSpeed }}>
      {children}
    </AccentContext.Provider>
  );
};

export const useAccent = () => {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be inside AccentProvider");
  return ctx;
};
