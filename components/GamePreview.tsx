// components/GamePreview.tsx
'use client'

import React, { useState, useEffect } from 'react'
import seedrandom from 'seedrandom'

const BOARD_SIZE = 6;

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

const PreviewCell: React.FC<{ value: number }> = ({ value }) => {
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-transparent'
  return (
    <div className={`w-6 h-6 ${colorClass} transition-colors duration-300`}></div>
  )
}

const createSeededLatinSquare = (seed: string): number[][] => {
  const rng = seedrandom(seed);
  const square: number[][] = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
  
  // Fill the first row with shuffled numbers
  const firstRow = Array.from({length: BOARD_SIZE}, (_, i) => i + 1);
  for (let i = firstRow.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [firstRow[i], firstRow[j]] = [firstRow[j], firstRow[i]];
  }
  square[0] = firstRow;

  // Fill the rest of the square
  for (let i = 1; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      square[i][j] = ((square[i-1][j] % BOARD_SIZE) + 1);
    }
  }

  return square;
}

export const GamePreview: React.FC = () => {
  const [previewGrid, setPreviewGrid] = useState(() => createSeededLatinSquare('latinHAM'))

  useEffect(() => {
    const rng = seedrandom('latinHAM');
    const interval = setInterval(() => {
      setPreviewGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row])
        const randomRow = Math.floor(rng() * BOARD_SIZE)
        const randomCol = Math.floor(rng() * BOARD_SIZE)
        newGrid[randomRow][randomCol] = (newGrid[randomRow][randomCol] % BOARD_SIZE) + 1
        return newGrid
      })
    }, 420)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner mb-8">
      {previewGrid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <PreviewCell key={`${rowIndex}-${colIndex}`} value={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}