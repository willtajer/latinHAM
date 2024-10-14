'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Confetti from 'react-confetti'
import { useLearningGameLogic } from '@/hooks/useLearningGameLogic'
import Link from 'next/link'

interface LearningModeGameProps {
  onComplete: () => void
  onRestart: () => void
}

export function LearningModeGame({ onComplete, onRestart }: LearningModeGameProps) {
  const [showColors, setShowColors] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const {
    grid,
    locked,
    isComplete,
    moveCount,
    handleCellClick,
    resetGame,
  } = useLearningGameLogic()

  useEffect(() => {
    setIsClient(true)
    if (isComplete && !showConfetti) {
      onComplete()
      setShowColors(true)
      setShowConfetti(true)
    }
  }, [isComplete, onComplete, showConfetti])

  const handleRestart = () => {
    resetGame()
    setShowColors(false)
    setShowConfetti(false)
    onRestart()
  }

  const getColorClass = (value: number) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500']
    return colors[value - 1] || 'bg-transparent'
  }

  if (!isClient) {
    return null // or a loading spinner
  }

  return (
    <Card className="w-full max-w-[300px]">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-4xl font-bold transition-all duration-300
                  ${locked[rowIndex][colIndex] ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${showColors ? getColorClass(cell) : 'bg-transparent'}
                  border-4 border-gray-700 hover:border-gray-500`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={locked[rowIndex][colIndex] || isComplete}
              >
                {cell !== 0 && cell}
              </button>
            ))
          ))}
        </div>
        <p className="mt-4 text-center">Moves: {moveCount}</p>
        <div className="flex justify-center space-x-2 mt-4">
          <Button onClick={handleRestart} variant="default" size="sm">
            {isComplete ? "Play Again" : "Restart"}
          </Button>
        </div>
      </CardContent>
      {isClient && showConfetti && (
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