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

export const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ latinHAMs, onLatinHAMClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {latinHAMs.map((latinHAM, index) => (
        <div 
          key={index} 
          className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          onClick={() => onLatinHAMClick(latinHAM)}
        >
          <div className="mt-4 text-sm text-gray-300">
            <p>Difficulty: {latinHAM.difficulty}</p>
            <p>Best Moves: {latinHAM.bestMoves}</p>
            <p>Best Time: {formatTime(latinHAM.bestTime)}</p>
            <p>Solved: {latinHAM.solveCount} time{latinHAM.solveCount !== 1 ? 's' : ''}</p>
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