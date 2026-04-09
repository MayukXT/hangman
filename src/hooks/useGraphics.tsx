import React, { createContext, useContext, useState, useCallback } from 'react';

export type GraphicsMode = 'FANCY' | 'LIGHT';

interface GraphicsContextType {
  graphics: GraphicsMode;
  setGraphics: (mode: GraphicsMode) => void;
  isFancy: boolean;
}

const GraphicsContext = createContext<GraphicsContextType | null>(null);

const STORAGE_KEY = 'arcade-hangman-graphics';

export const GraphicsProvider = ({ children }: { children: React.ReactNode }) => {
  const [graphics, setGraphicsState] = useState<GraphicsMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'LIGHT' ? 'LIGHT' : 'FANCY') as GraphicsMode;
  });

  const setGraphics = useCallback((mode: GraphicsMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setGraphicsState(mode);
  }, []);

  return (
    <GraphicsContext.Provider value={{ graphics, setGraphics, isFancy: graphics === 'FANCY' }}>
      {children}
    </GraphicsContext.Provider>
  );
};

export const useGraphics = () => {
  const ctx = useContext(GraphicsContext);
  if (!ctx) throw new Error('useGraphics must be inside GraphicsProvider');
  return ctx;
};
