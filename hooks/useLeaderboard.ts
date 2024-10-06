// hooks/useLeaderboard.ts
import { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '../types'

export const useLeaderboard = (difficulty: 'easy' | 'medium' | 'hard') => {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/get-leaderboard?difficulty=${difficulty}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setLeaderboard(prevState => ({
        ...prevState,
        [difficulty]: data
      }))
      setError(null)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setError('Failed to fetch leaderboard. Please try again later.')
    }
  }, [difficulty])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const handleQuoteSubmit = useCallback(async (quote: string, entry: LeaderboardEntry) => {
    try {
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...entry, difficulty, quote }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      await fetchLeaderboard()
    } catch (error) {
      console.error('Failed to save game:', error)
      setError('Failed to save game. Please try again later.')
    }
  }, [difficulty, fetchLeaderboard])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    // Implementation for viewing completed board
    console.log('Viewing completed board:', entry)
    // You can add your logic here, such as opening a modal or navigating to a new page
  }, [])

  const handleDownloadCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    // Implementation for downloading completed board
    console.log('Downloading completed board:', entry)
    // You can add your logic here, such as generating a file and triggering a download
  }, [])

  return {
    leaderboard,
    error,
    handleQuoteSubmit,
    refetchLeaderboard: fetchLeaderboard,
    handleViewCompletedBoard,
    handleDownloadCompletedBoard,
  }
}