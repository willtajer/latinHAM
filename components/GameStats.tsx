// components/GameStats.tsx

import React from 'react'
import { LeaderboardEntry } from '../types' // Importing the LeaderboardEntry type for typing props
import { formatTime } from '../utils/formatTime' // Importing a utility function to format time

// Define the props for the GameStats component
interface GameStatsProps {
  gameState: 'start' | 'playing' | 'won' | 'viewing' // Current state of the game
  viewingEntry: LeaderboardEntry | null // Leaderboard entry being viewed, if any
  moveCount: number // Number of moves made in the current game
  elapsedTime: number // Time elapsed in the current game (in seconds)
  hintCount: number // Number of hints used in the current game
}

// GameStats component definition
export const GameStats: React.FC<GameStatsProps> = ({
  gameState,
  viewingEntry,
  moveCount,
  elapsedTime,
  hintCount
}) => {
  return (
    // Container div with specific width and vertical margins
    <div className="w-[calc(6*3rem+5*0.75rem)] mt-4 mb-2">
      {/* Flex container to arrange stats horizontally with space between them */}
      <div className="flex justify-between font-bold text-md">
        {/* Display the number of moves:
            - If viewing a leaderboard entry, show the moves from viewingEntry
            - Otherwise, show the current game's moveCount */}
        <span>Moves: {gameState === 'viewing' ? viewingEntry?.moves : moveCount}</span>
        
        {/* Display the elapsed time:
            - If viewing a leaderboard entry, format and show the time from viewingEntry
            - Otherwise, format and show the current game's elapsedTime */}
        <span>Time: {formatTime(gameState === 'viewing' ? viewingEntry?.time || 0 : elapsedTime)}</span>
        
        {/* Display the number of hints:
            - If viewing a leaderboard entry, show the hints from viewingEntry
            - Otherwise, show the current game's hintCount */}
        <span>Hints: {gameState === 'viewing' ? viewingEntry?.hints : hintCount}</span>
      </div>
    </div>
  )
}
