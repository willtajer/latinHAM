import React, { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '../types'
import { useUser } from '@clerk/nextjs'
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
  const { user } = useUser()

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/leaderboard?difficulty=${difficulty}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
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

  const handleQuoteSubmit = useCallback(async (quote: string, entry: LeaderboardEntry) => {
    if (!user) {
      console.log('User not logged in, skipping leaderboard submission')
      return
    }

    try {
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          difficulty,
          quote,
          userId: user.id,
          username: user.username || user.firstName || 'Anonymous'
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      console.log('Save game result:', result)
      await fetchLeaderboard()
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }, [difficulty, fetchLeaderboard, user])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    console.log('Viewing completed board:', entry)
    setViewingEntry(entry)
    setIsViewDialogOpen(true)
  }, [])

  const handleCloseViewDialog = useCallback(() => {
    setIsViewDialogOpen(false)
    setViewingEntry(null)
  }, [])

  const handleResetGame = useCallback((initialGrid: number[][]) => {
    // Implement the logic to reset the game with the given initialGrid
    console.log('Resetting game with initial grid:', initialGrid)
    // You might want to navigate to the game page or update the game state here
  }, [])

  const handleStartNewGame = useCallback(() => {
    // Implement the logic to start a new game
    console.log('Starting a new game')
    // You might want to navigate to the game page or update the game state here
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
        onResetGame={handleResetGame}
        onStartNewGame={handleStartNewGame}
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
      const data = await response.json()
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