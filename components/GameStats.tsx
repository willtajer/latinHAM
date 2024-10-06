// components/GameStats.tsx
import React from 'react'
import { formatTime } from '../utils/formatTime'

interface GameStatsProps {
  gameState: 'start' | 'playing' | 'won' | 'viewing'
  viewingEntry: any
  moveCount: number
  elapsedTime: number
  hintCount: number
}

export const GameStats: React.FC<GameStatsProps> = ({
  gameState,
  viewingEntry,
  moveCount,
  elapsedTime,
  hintCount
}) => {
  return (
    <div className="w-[calc(6*3rem+5*0.75rem)] mt-4 mb-2">
      <div className="flex justify-between font-bold text-md">
        <span>Moves: {gameState === 'viewing' ? viewingEntry?.moves : moveCount}</span>
        <span>Time: {formatTime(gameState === 'viewing' ? viewingEntry?.time || 0 : elapsedTime)}</span>
        <span>Hints: {gameState === 'viewing' ? viewingEntry?.hints : hintCount}</span>
      </div>
    </div>
  )
}