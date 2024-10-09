import React from 'react'
import { GamePreview } from './GamePreview'

interface LearningGameHeaderProps {
  isComplete: boolean
}

export const LearningGameHeader: React.FC<LearningGameHeaderProps> = ({ isComplete }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mb-8">
      <div className="w-[calc(6*3rem+6*0.75rem)]">
        <h1 className="text-6xl font-bold mb-6 text-center">latinHAM</h1>
        <GamePreview />
        <h2 className="text-2xl font-semibold text-center mt-24 mb-4">Learning Mode</h2>
        <p className="text-center mt-4">
          {isComplete
            ? "Great job! You've mastered the basics of Latin squares."
            : "Fill the grid so that each number (1-3) appears exactly once in each row and column."}
        </p>
      </div>
    </div>
  )
}