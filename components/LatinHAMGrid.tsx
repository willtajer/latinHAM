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

export const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ 
  latinHAMs, 
  onLatinHAMClick, 
  fetchCompletedPuzzle,
  onResetGame 
}) => {
  const [selectedLatinHAM, setSelectedLatinHAM] = useState<LatinHAM | null>(null)
  const [completedPuzzle, setCompletedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleLatinHAMClick = async (latinHAM: LatinHAM) => {
    setSelectedLatinHAM(latinHAM)
    const completed = await fetchCompletedPuzzle(latinHAM.id)
    if (completed) {
      setCompletedPuzzle(completed)
      setIsDialogOpen(true)
    }
    onLatinHAMClick(latinHAM)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedLatinHAM(null)
      setCompletedPuzzle(null)
    }
  }

  const handleResetGame = (initialGrid: number[][]) => {
    onResetGame(initialGrid)
    handleDialogClose(false)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {latinHAMs.map((latinHAM, index) => (
          <div 
            key={index} 
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
      {completedPuzzle && (
        <ViewCompletedPuzzleDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          entry={completedPuzzle}
          difficulty={completedPuzzle.difficulty}
          onResetGame={handleResetGame}
        />
      )}
    </>
  )
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}