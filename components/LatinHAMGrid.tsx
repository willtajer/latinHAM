// components/LatinHAMGrid.tsx
'use client'

import React from 'react'
import { LatinHAM } from '@/types' // Importing the LatinHAM type for typing props

// Define the props for the LatinHAMGrid component
interface LatinHAMGridProps {
  latinHAMs: LatinHAM[] // Array of LatinHAM entries to display
  onLatinHAMClick: (latinHAM: LatinHAM) => void // Callback when a LatinHAM entry is clicked
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard' // Current difficulty filter
}

// LatinHAMGrid component definition
const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ 
  latinHAMs, 
  onLatinHAMClick,
  difficultyFilter
}) => {
  
  // Utility function to format time from seconds to "Xm Ys"
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m${remainingSeconds}s`
  }

  // MiniGameBoard component to display a small version of the game grid
  const MiniGameBoard: React.FC<{ initialGrid: number[][] }> = ({ initialGrid }) => {
    // Handle invalid grid data
    if (!initialGrid || initialGrid.length === 0) {
      return <div className="text-red-500">Error: Invalid grid data</div>;
    }

    return (
      // Container div with grid layout and styling
      <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner aspect-square">
        {/* Iterate over each row in the initialGrid */}
        {initialGrid.map((row, rowIndex) =>
          // Iterate over each cell in the current row
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`} // Unique key for each cell
              className={`
                aspect-square flex items-center justify-center
                relative transition-all duration-150 ease-in-out rounded-sm shadow-sm
                ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600'}
                ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'}
              `}
              role="cell" // Accessibility role
              aria-label={`Cell ${cell !== 0 ? 'filled' : 'empty'}`} // Accessibility label
            />
          ))
        )}
      </div>
    )
  }

  // Filter the LatinHAM entries based on the selected difficulty
  const filteredLatinHAMs = latinHAMs.filter(
    latinHAM => difficultyFilter === 'all' || latinHAM.difficulty === difficultyFilter
  );

  // Display a message if no LatinHAMs match the filter
  if (filteredLatinHAMs.length === 0) {
    return (
      <div className="text-center py-8 text-white">
        No {difficultyFilter !== 'all' ? `${difficultyFilter} ` : ''}LatinHAMs found.
      </div>
    )
  }

  return (
    // Container div with responsive grid layout and styling
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">        
      {/* Iterate over each filtered LatinHAM entry */}
      {filteredLatinHAMs.map((latinHAM, index) => (
        <div 
          key={`latinHAM-${index}`} // Unique key for each LatinHAM entry
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-[400px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => onLatinHAMClick(latinHAM)} // Handle click event
        >
          <MiniGameBoard initialGrid={latinHAM.initialGrid} /> {/* Display the mini game board */}
          <div className="mt-4 text-sm text-gray-800 dark:text-gray-300">
            {/* Display difficulty and solve count */}
            <p>
              <strong>{`${latinHAM.difficulty.charAt(0).toUpperCase() + latinHAM.difficulty.slice(1)}`}</strong> 
              x {latinHAM.solveCount} {latinHAM.solveCount === 1 ? 'time' : 'times'}
            </p>
            {/* Display best moves and the player who achieved it */}
            <p>
              <strong>{latinHAM.bestMoves} moves</strong> by {latinHAM.bestMovesPlayer || 'Anonymous'}
            </p>
            {/* Display best time and the player who achieved it */}
            <p>
              <strong>{formatTime(latinHAM.bestTime)} </strong> by {latinHAM.bestTimePlayer || 'Anonymous'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LatinHAMGrid
