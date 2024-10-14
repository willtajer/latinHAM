import React, { useState, useCallback } from 'react'
import { LeaderboardEntry } from '../types'
import Leaderboard from './Leaderboard'
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'

interface LeaderboardWrapperProps {
  initialDifficulty?: 'all' | 'easy' | 'medium' | 'hard'
  difficulty?: string // Add this line
}

export function LeaderboardWrapper({ initialDifficulty = 'all', difficulty }: LeaderboardWrapperProps) {
  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>(initialDifficulty)

  const handleCloseViewDialog = useCallback(() => {
    setIsViewDialogOpen(false)
    setViewingEntry(null)
  }, [])

  const handleDifficultyChange = useCallback((newDifficulty: 'all' | 'easy' | 'medium' | 'hard') => {
    setCurrentDifficulty(newDifficulty)
  }, [])

  // Use the passed difficulty prop if available, otherwise use currentDifficulty
  const effectiveDifficulty = difficulty || currentDifficulty

  return (
    <>
      <Leaderboard
        initialDifficulty={effectiveDifficulty as 'all' | 'easy' | 'medium' | 'hard'}
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