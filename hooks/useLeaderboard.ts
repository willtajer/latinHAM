import { useState, useCallback, useEffect, useRef } from 'react'
import { LeaderboardEntry } from '../types'
import { useUser } from '@clerk/nextjs'

export function useLeaderboard(difficulty: 'easy' | 'medium' | 'hard') {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  const { user } = useUser()
  const hasFetchedRef = useRef<Record<string, boolean>>({ easy: false, medium: false, hard: false })

  const fetchLeaderboard = useCallback(async () => {
    if (hasFetchedRef.current[difficulty]) return;

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
      hasFetchedRef.current[difficulty] = true
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
      hasFetchedRef.current[difficulty] = false
      await fetchLeaderboard()
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }, [difficulty, fetchLeaderboard, user])

  return {
    leaderboard,
    handleQuoteSubmit,
  }
}