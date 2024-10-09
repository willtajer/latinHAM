'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Confetti from 'react-confetti'
import { useLearningGameLogic } from '@/hooks/useLearningGameLogic'

interface LearningModeGameProps {
  onComplete: () => void
  onRestart: () => void
}

export function LearningModeGame({ onComplete, onRestart }: LearningModeGameProps) {
  const [showNumbers, setShowNumbers] = useState(true)
  const [showColors, setShowColors] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const {
    grid,
    locked,
    isComplete,
    moveCount,
    handleCellClick,
    resetGame,
  } = useLearningGameLogic()

  useEffect(() => {
    if (isComplete && !showConfetti) {
      onComplete()
      setTimeout(() => {
        setShowNumbers(false)
        setShowColors(true)
        setShowConfetti(true)
      }, 1000)
    }
  }, [isComplete, onComplete, showConfetti])

  const getColorClass = (value: number) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500']
    return colors[value - 1] || 'bg-transparent'
  }

  return (
    <Card className="w-auto">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-24 h-24 rounded-lg flex items-center justify-center text-4xl font-bold transition-all duration-300
                  ${locked[rowIndex][colIndex] ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${showColors ? getColorClass(cell) : 'bg-transparent'}
                  border-4 border-gray-700 hover:border-gray-500`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={locked[rowIndex][colIndex] || isComplete}
              >
                {(showNumbers && cell !== 0) && cell}
              </button>
            ))
          ))}
        </div>
        <p className="mt-4 text-center">Moves: {moveCount}</p>
      </CardContent>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
    </Card>
  )
}