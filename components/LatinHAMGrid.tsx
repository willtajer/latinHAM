'use client'

import React from 'react'
import { LatinHAM } from '@/types'

interface LatinHAMGridProps {
  latinHAMs: LatinHAM[]
  onLatinHAMClick: (latinHAM: LatinHAM) => void
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard'
}

const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ 
  latinHAMs, 
  onLatinHAMClick,
  difficultyFilter
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const MiniGameBoard: React.FC<{ initialGrid: number[][] }> = ({ initialGrid }) => {
    if (!initialGrid || initialGrid.length === 0) {
      return <div className="text-red-500">Error: Invalid grid data</div>;
    }

    return (
      <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner aspect-square">
        {initialGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center
                relative transition-all duration-150 ease-in-out rounded-sm shadow-sm
                ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600'}
                ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'}
              `}
              role="cell"
              aria-label={`Cell ${cell !== 0 ? 'filled' : 'empty'}`}
            />
          ))
        )}
      </div>
    )
  }

  // Apply filtering logic here based on difficultyFilter
  const filteredLatinHAMs = latinHAMs.filter(
    latinHAM => difficultyFilter === 'all' || latinHAM.difficulty === difficultyFilter
  );

  if (filteredLatinHAMs.length === 0) {
    return (
      <div className="text-center py-8 text-white">
        No {difficultyFilter !== 'all' ? `${difficultyFilter} ` : ''}LatinHAMs found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">        
      {filteredLatinHAMs.map((latinHAM, index) => (
        <div 
          key={`latinHAM-${index}`} 
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-[400px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => onLatinHAMClick(latinHAM)}
        >
          <MiniGameBoard initialGrid={latinHAM.initialGrid} />
          <div className="mt-4 text-sm text-gray-800 dark:text-gray-300">
            <p>Difficulty: {latinHAM.difficulty}</p>
            <p>Solved: {latinHAM.solveCount} time{latinHAM.solveCount !== 1 ? 's' : ''}</p>
            <p>Best Moves: {latinHAM.bestMoves} by {latinHAM.bestMovesPlayer || 'Anonymous'}</p>
            <p>Best Time: {formatTime(latinHAM.bestTime)} by {latinHAM.bestTimePlayer || 'Anonymous'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LatinHAMGrid
