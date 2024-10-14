import React, { useState, useCallback } from 'react'
import { LeaderboardEntry } from '../types'
import Leaderboard from './Leaderboard'
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'

interface LeaderboardWrapperProps {
  initialDifficulty: 'all' | 'easy' | 'medium' | 'hard'
}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = ({ initialDifficulty }) => {
  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>(initialDifficulty)

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    console.log('Viewing completed board:', entry)
    setViewingEntry(entry)
    setIsViewDialogOpen(true)
  }, [])

  const handleCloseViewDialog = useCallback(() => {
    setIsViewDialogOpen(false)
    setViewingEntry(null)
  }, [])

  const handleDifficultyChange = useCallback((newDifficulty: 'all' | 'easy' | 'medium' | 'hard') => {
    setCurrentDifficulty(newDifficulty)
  }, [])

  return (
    <>
      <Leaderboard
        initialDifficulty={currentDifficulty}
        onViewCompletedBoard={handleViewCompletedBoard}
        onDifficultyChange={handleDifficultyChange}
      />
      <ViewCompletedPuzzleDialog
        open={isViewDialogOpen}
        onOpenChange={handleCloseViewDialog}
        entry={viewingEntry}
        difficulty={viewingEntry?.difficulty || 'easy'}
      />
    </>
  )
}