import React from 'react'
import DiscoveredLatinHAMsButton from './DiscoveredLatinHAMsButton'
import LearningModeButton from './LearningModeButton'
import Link from 'next/link'

interface GameHeaderProps {
  gameState: 'start' | 'playing' | 'won' | 'viewing'
  isGameWon: boolean
  onNewGame: () => void
}

export const GameHeader: React.FC<GameHeaderProps> = ({ gameState, isGameWon, onNewGame }) => {
  return (
    <div className="w-[calc(6*3rem+6*0.75rem)] mb-6">
      <Link href="/" passHref>
          <h1 className="text-6xl font-bold mb-6 text-center cursor-pointer hover:text-primary transition-colors duration-200">
            latinHAM
          </h1>
        </Link>
      <p className="text-center mt-4">
        {gameState === 'viewing' 
          ? "Viewing a completed puzzle from the leaderboard." 
          : isGameWon
          ? "Congratulations! You've completed the puzzle."
          : "Click on a cell to cycle through colors. Each color should appear once per row and column."}
      </p>
      <DiscoveredLatinHAMsButton />
      <LearningModeButton />
    </div>
  )
}