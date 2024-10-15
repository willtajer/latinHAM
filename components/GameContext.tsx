// GameContext.tsx

import React, { createContext, useContext } from 'react';

// Define the possible difficulty levels
type Difficulty = 'easy' | 'medium' | 'hard';

// Interface for the GameContext properties
interface GameContextProps {
  // Function to start a new game with the selected difficulty
  handleStartNewGame: (difficulty: Difficulty) => void;
}

// Create the GameContext with an undefined default value
const GameContext = createContext<GameContextProps | undefined>(undefined);

// Custom hook to consume the GameContext easily
export const useGameContext = () => {
  const context = useContext(GameContext);
  
  // Throw an error if the hook is used outside of the GameProvider
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  
  return context;
};

// Interface for the GameProvider component's props
interface GameProviderProps {
  // Function to handle starting a new game
  handleStartNewGame: (difficulty: Difficulty) => void;
  // Children components that will have access to the context
  children: React.ReactNode;
}

// GameProvider component that provides the GameContext to its children
export const GameProvider: React.FC<GameProviderProps> = ({ handleStartNewGame, children }) => {
  return (
    // Provide the handleStartNewGame function to all child components
    <GameContext.Provider value={{ handleStartNewGame }}>
      {children}
    </GameContext.Provider>
  );
};
