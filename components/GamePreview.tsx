// components/GamePreview.tsx
'use client'

import React, { useState, useEffect } from 'react'
import seedrandom from 'seedrandom'

// Define the size of the game board
const BOARD_SIZE = 6;

// Array of CSS classes for different cell colors
const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

// Props interface for the PreviewCell component
interface PreviewCellProps {
  value: number // The value to display in the cell
}

// PreviewCell component representing a single cell in the preview grid
const PreviewCell: React.FC<PreviewCellProps> = ({ value }) => {
  // Determine the background color based on the cell's value
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-transparent'

  return (
    // Render a div with appropriate styling and color
    <div className={`w-6 h-6 ${colorClass} transition-colors duration-300`}></div>
  )
}

// Function to create a seeded Latin square based on a given seed
const createSeededLatinSquare = (seed: string): number[][] => {
  // Initialize the seeded random number generator
  const rng = seedrandom(seed);
  
  // Initialize a BOARD_SIZE x BOARD_SIZE grid filled with zeros
  const square: number[][] = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
  
  // Create the first row with numbers 1 to BOARD_SIZE
  const firstRow = Array.from({length: BOARD_SIZE}, (_, i) => i + 1);
  
  // Shuffle the first row using Fisher-Yates algorithm with the seeded RNG
  for (let i = firstRow.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [firstRow[i], firstRow[j]] = [firstRow[j], firstRow[i]];
  }
  
  // Assign the shuffled first row to the grid
  square[0] = firstRow;

  // Fill the rest of the grid based on the previous row
  for (let i = 1; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      // Ensure each number appears once per column by incrementing the above cell's value
      square[i][j] = ((square[i-1][j] % BOARD_SIZE) + 1);
    }
  }

  return square; // Return the completed Latin square
}

// GamePreview component that displays a dynamic preview of the game grid
export const GamePreview: React.FC = () => {
  // State to hold the current preview grid, initialized with a seeded Latin square
  const [previewGrid, setPreviewGrid] = useState(() => createSeededLatinSquare('latinHAM'))

  // useEffect hook to update the grid at regular intervals
  useEffect(() => {
    // Initialize the seeded RNG
    const rng = seedrandom('latinHAM');
    
    // Set up an interval to update a random cell every 420 milliseconds
    const interval = setInterval(() => {
      setPreviewGrid(prevGrid => {
        // Create a deep copy of the current grid
        const newGrid = prevGrid.map(row => [...row])
        
        // Select a random row and column
        const randomRow = Math.floor(rng() * BOARD_SIZE)
        const randomCol = Math.floor(rng() * BOARD_SIZE)
        
        // Increment the cell's value, wrapping around using modulo
        newGrid[randomRow][randomCol] = (newGrid[randomRow][randomCol] % BOARD_SIZE) + 1
        
        return newGrid // Update the grid state
      })
    }, 420)

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval)
  }, []) // Empty dependency array ensures this runs once on mount

  return (
    // Container div for the preview grid with styling
    <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner mb-8">
      {/* Iterate over each row in the preview grid */}
      {previewGrid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Iterate over each cell in the current row */}
          {row.map((cell, colIndex) => (
            <PreviewCell key={`${rowIndex}-${colIndex}`} value={cell} /> // Render PreviewCell with its value
          ))}
        </div>
      ))}
    </div>
  )
}
