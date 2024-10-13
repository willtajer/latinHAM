import React, { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '../types'
import { Leaderboard } from './Leaderboard'
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'

interface LeaderboardWrapperProps {
  difficulty: 'easy' | 'medium' | 'hard'
}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = ({ difficulty }) => {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/leaderboard?difficulty=${difficulty}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: LeaderboardEntry[] = await response.json()
      console.log('Fetched leaderboard data:', data)
      setLeaderboard(prevState => ({
        ...prevState,
        [difficulty]: data
      }))
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }, [difficulty])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    console.log('Viewing completed board:', entry)
    setViewingEntry(entry)
    setIsViewDialogOpen(true)
  }, [])

  const handleCloseViewDialog = useCallback(() => {
    setIsViewDialogOpen(false)
    setViewingEntry(null)
  }, [])

  return (
    <>
      <Leaderboard
        entries={leaderboard[difficulty]}
        difficulty={difficulty}
        onViewCompletedBoard={handleViewCompletedBoard}
      />
      <ViewCompletedPuzzleDialog
        open={isViewDialogOpen}
        onOpenChange={handleCloseViewDialog}
        entry={viewingEntry}
        difficulty={difficulty}
      />
    </>
  )
}

export const useLeaderboard = (difficulty: 'easy' | 'medium' | 'hard') => {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/leaderboard?difficulty=${difficulty}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: LeaderboardEntry[] = await response.json()
      console.log('Fetched leaderboard data:', data)
      setLeaderboard(prevState => ({
        ...prevState,
        [difficulty]: data
      }))
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }, [difficulty])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    console.log('Viewing completed board:', entry)
  }, [])

  return {
    leaderboard,
    handleViewCompletedBoard,
  }
}