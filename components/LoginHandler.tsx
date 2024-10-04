'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface GameEntry {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  moves: number
  time: number
  grid: number[][]
  initialGrid: number[][]
  quote: string
  hints: number
  timestamp: string
}

export function LoginHandler() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      syncGameHistory()
    }
  }, [isLoaded, user])

  const syncGameHistory = async () => {
    const localHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]') as GameEntry[]
    
    if (localHistory.length === 0) return

    try {
      const response = await fetch('/api/sync-game-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ games: localHistory }),
      })

      if (response.ok) {
        const { syncedGames } = await response.json()
        localStorage.setItem('gameHistory', JSON.stringify(syncedGames))
        console.log('Game history synced successfully')
      } else {
        console.error('Failed to sync game history')
      }
    } catch (error) {
      console.error('Error syncing game history:', error)
    }
  }

  return null
}