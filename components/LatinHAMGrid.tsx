import React from 'react'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LatinHAM } from '../types/'

interface LatinHAMGridProps {
  latinHAMs: LatinHAM[]
  onLatinHAMClick: (latinHAM: LatinHAM) => void
}

export const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ latinHAMs, onLatinHAMClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {latinHAMs.map((latinHAM, index) => (
        <div key={index} className="cursor-pointer" onClick={() => onLatinHAMClick(latinHAM)}>
          <CompletedPuzzleCard
            entry={{
              id: `discovered-${index}`,
              difficulty: latinHAM.difficulty,
              moves: latinHAM.bestMoves,
              time: latinHAM.bestTime,
              grid: latinHAM.preset,
              initialGrid: latinHAM.preset,
              quote: `Solved ${latinHAM.solveCount} times`,
              hints: 0,
              timestamp: new Date().toISOString()
            }}
            difficulty={latinHAM.difficulty}
          />
        </div>
      ))}
    </div>
  )
}