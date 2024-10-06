// hooks/useLeaderboard.ts
import { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '../types'

export const useLeaderboard = (difficulty: 'easy' | 'medium' | 'hard') => {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })

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
    try {
      await fetch('/api/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...entry, difficulty, quote }),
      })
      await fetchLeaderboard()
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }, [difficulty, fetchLeaderboard])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    // Implementation for viewing completed board
  }, [])

  const handleDownloadCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    // Implementation for downloading completed board
  }, [])

  return {
    leaderboard,
    handleQuoteSubmit,
    handleViewCompletedBoard,
    handleDownloadCompletedBoard,
  }
}