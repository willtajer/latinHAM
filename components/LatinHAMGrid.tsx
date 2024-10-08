'use client'

import React from 'react'
import { LatinHAM } from '../types/'

interface LatinHAMGridProps {
  latinHAMs: LatinHAM[]
  onLatinHAMClick: (latinHAM: LatinHAM) => void
}

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

interface CellProps {
  value: number
  locked: boolean
}

const Cell: React.FC<CellProps> = ({ value, locked }) => {
  const baseClasses = "w-8 h-8 flex items-center justify-center text-sm font-bold relative transition-all duration-150 ease-in-out rounded-md shadow-sm"
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-white dark:bg-gray-600'
  const borderClass = locked ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'

  return (
    <div
      className={`${baseClasses} ${colorClass} ${borderClass}`}
      role="cell"
      aria-label={`Cell value ${value || 'Empty'}${locked ? ', locked' : ''}`}
    >
      {value !== 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
          {value}
        </span>
      )}
    </div>
  )
}

const MiniGameBoard: React.FC<{ preset: number[][] }> = ({ preset }) => {
  return (
    <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner">
      {preset.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            locked={cell !== 0}
          />
        ))
      )}
    </div>
  )
}

export const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ latinHAMs, onLatinHAMClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {latinHAMs.map((latinHAM, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer" onClick={() => onLatinHAMClick(latinHAM)}>
          <MiniGameBoard preset={latinHAM.preset} />
          <div className="mt-4 text-sm">
            <p>Difficulty: {latinHAM.difficulty}</p>
            <p>Best Moves: {latinHAM.bestMoves}</p>
            <p>Best Time: {formatTime(latinHAM.bestTime)}</p>
            <p>Solved: {latinHAM.solveCount} times</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}