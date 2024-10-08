'use client'

import React, { useState } from 'react'
import { LatinHAM, LeaderboardEntry } from '../types/'
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'

interface LatinHAMGridProps {
  latinHAMs: LatinHAM[]
  onLatinHAMClick: (latinHAM: LatinHAM) => void
  fetchCompletedPuzzle: (id: string) => Promise<LeaderboardEntry | null>
  onResetGame: (initialGrid: number[][]) => void
}

const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ 
  latinHAMs, 
  onLatinHAMClick, 
  fetchCompletedPuzzle,
  onResetGame 
}) => {
  const [completedPuzzle, setCompletedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

  const handleLatinHAMClick = async (latinHAM: LatinHAM) => {
    if (latinHAM.id) {
      try {
        const completed = await fetchCompletedPuzzle(latinHAM.id)
        if (completed) {
          setCompletedPuzzle(completed)
          setSelectedDifficulty(latinHAM.difficulty as 'easy' | 'medium' | 'hard')
          setIsDialogOpen(true)
          onLatinHAMClick(latinHAM)
        } else {
          console.error('No completed puzzle found for this LatinHAM')
        }
      } catch (error) {
        console.error('Error fetching completed puzzle:', error)
      }
    } else {
      console.error('LatinHAM id is undefined:', latinHAM)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setCompletedPuzzle(null)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {latinHAMs.map((latinHAM, index) => (
          <div 
            key={latinHAM.id || index} 
            className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            onClick={() => handleLatinHAMClick(latinHAM)}
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
      <ViewCompletedPuzzleDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        entry={completedPuzzle}
        difficulty={selectedDifficulty}
        onResetGame={onResetGame}
      />
    </>
  )
}

export default LatinHAMGrid