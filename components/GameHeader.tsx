import React from 'react'
import DiscoveredLatinHAMsButton from './DiscoveredLatinHAMsButton'

interface GameHeaderProps {
  gameState: 'start' | 'playing' | 'won' | 'viewing'
  isGameWon: boolean
  onNewGame: () => void
}

export const GameHeader: React.FC<GameHeaderProps> = ({ gameState, isGameWon, onNewGame }) => {
  return (
    <div className="w-[calc(6*3rem+6*0.75rem)] mt-2 mb-4">
      <h1 
        className="text-6xl font-bold mb-2 text-center cursor-pointer"
        onClick={onNewGame}
      >
        latinHAM
      </h1>
      <p className="text-center mt-4">
        {gameState === 'viewing' 
          ? "Viewing a completed puzzle from the leaderboard." 
          : isGameWon
          ? "Congratulations! You've completed the puzzle."
          : "Click on a cell to cycle through colors. Each color should appear once per row and column."}
      </p>
      <DiscoveredLatinHAMsButton />
    </div>
  )
}