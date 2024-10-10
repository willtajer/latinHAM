// GameContext.tsx

import React, { createContext, useContext } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameContextProps {
  handleStartNewGame: (difficulty: Difficulty) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

// Custom hook for easier consumption
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  handleStartNewGame: (difficulty: Difficulty) => void;
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ handleStartNewGame, children }) => {
  return (
    <GameContext.Provider value={{ handleStartNewGame }}>
      {children}
    </GameContext.Provider>
  );
};
