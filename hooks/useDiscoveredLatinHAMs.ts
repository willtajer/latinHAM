import { useState, useEffect, useCallback } from 'react'
import { DiscoveredLatinHAM } from '@/types'
import { calculateSolveCount } from '../utils/solveCountLogic'

export function useDiscoveredLatinHAMs(difficultyFilter: 'all' | 'easy' | 'medium' | 'hard') {
  const [latinHAMs, setLatinHAMs] = useState<DiscoveredLatinHAM[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchLatinHAMs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/discovered?difficulty=${difficultyFilter}&timestamp=${Date.now()}`, {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: DiscoveredLatinHAM[] = await response.json()
      if (Array.isArray(data)) {
        const latinHAMsWithSolveCount = data.map(latinHAM => ({
          ...latinHAM,
          possibleSolveCount: calculateSolveCount(latinHAM.initialGrid)
        }))
        setLatinHAMs(latinHAMsWithSolveCount)
      } else {
        throw new Error('Invalid data format')
      }
    } catch (error) {
      console.error('Error fetching latinHAMs:', error)
      setError('Failed to load Discovered LatinHAMs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [difficultyFilter])

  useEffect(() => {
    fetchLatinHAMs()
  }, [fetchLatinHAMs, refreshTrigger])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshTrigger(prev => prev + 1)
      }
    }

    const handleNewGameWon = () => {
      setRefreshTrigger(prev => prev + 1)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('newGameWon', handleNewGameWon)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('newGameWon', handleNewGameWon)
    }
  }, [])

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return { latinHAMs, isLoading, error, refreshData }
}