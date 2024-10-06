import { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '../types'
import { useUser } from '@clerk/nextjs'

export const useLeaderboard = (difficulty: 'easy' | 'medium' | 'hard') => {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  const { user } = useUser()

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const handleQuoteSubmit = useCallback(async (quote: string, entry: LeaderboardEntry) => {
    if (!user) {
      console.log('User not logged in, skipping leaderboard submission')
      return
    }

    try {
      await fetch('/api/save-game', {
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
      await fetchLeaderboard()
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }, [difficulty, fetchLeaderboard, user])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    // Implementation for viewing completed board
    console.log('Viewing completed board:', entry)
  }, [])

  const handleDownloadCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    // Implementation for downloading completed board
    console.log('Downloading completed board:', entry)
    // Add your download logic here
  }, [])

  return {
    leaderboard,
    handleQuoteSubmit,
    handleViewCompletedBoard,
    handleDownloadCompletedBoard,
  }
}