'use client'

import React, { useState, useEffect, useCallback } from 'react'
import LatinHAMGrid from './LatinHAMGrid'
import LatinHAMLeaderboard from './LatinHAMLeaderboard'
import { DiscoveredLatinHAM } from '@/types'
import { GamePreview } from './GamePreview'
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs'
import { calculateSolveCount } from '../utils/solveCountLogic'

const DifficultyFilters: React.FC<{
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard';
  setDifficultyFilter: React.Dispatch<React.SetStateAction<'all' | 'easy' | 'medium' | 'hard'>>;
}> = ({ difficultyFilter, setDifficultyFilter }) => (
  <div className="flex justify-center space-x-2 mb-8">
    <Button
      onClick={() => setDifficultyFilter('all')}
      variant={difficultyFilter === 'all' ? 'default' : 'outline'}
    >
      All
    </Button>
    <Button
      onClick={() => setDifficultyFilter('easy')}
      variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
    >
      Easy
    </Button>
    <Button
      onClick={() => setDifficultyFilter('medium')}
      variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
    >
      Medium
    </Button>
    <Button
      onClick={() => setDifficultyFilter('hard')}
      variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
    >
      Hard
    </Button>
  </div>
)

interface DiscoveredLatinHAMsProps {
  onPlayAgain: (initialGrid: number[][], difficulty: 'easy' | 'medium' | 'hard') => void;
  onCloseOverlays: () => void;
}

export function DiscoveredLatinHAMs({ onPlayAgain, onCloseOverlays }: DiscoveredLatinHAMsProps) {
  const [latinHAMs, setLatinHAMs] = useState<DiscoveredLatinHAM[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLatinHAM, setSelectedLatinHAM] = useState<DiscoveredLatinHAM | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const { user } = useUser()

  const fetchLatinHAMs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/discovered?difficulty=${difficultyFilter}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
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
  }, [fetchLatinHAMs, difficultyFilter, user])

  const handleLatinHAMClick = (latinHAM: DiscoveredLatinHAM) => {
    setSelectedLatinHAM(latinHAM)
  }

  const handleCloseLeaderboard = () => {
    setSelectedLatinHAM(null)
    fetchLatinHAMs()
  }

  const handlePlayAgain = useCallback((initialGrid: number[][], difficulty: 'easy' | 'medium' | 'hard') => {
    onPlayAgain(initialGrid, difficulty)
    onCloseOverlays()
  }, [onPlayAgain, onCloseOverlays])

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (latinHAMs.length === 0) {
    return <div className="text-center py-8 text-white">No Discovered LatinHAMs found. Start playing to create some!</div>
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-6xl font-bold text-center mb-6 text-white">Discovered LatinHAMs</h1>
      <div className="flex flex-col items-center justify-center">
        <div className="w-[calc(6*3rem+6*0.75rem)]">
          <GamePreview />
        </div>
      </div>
      <p className="text-center mb-6 text-white">Explore player-identified complete and LatinHAMs.</p>
      {!selectedLatinHAM && (
        <DifficultyFilters
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
        />
      )}
      {selectedLatinHAM ? (
        <div>
          <div className="flex justify-center mb-4">
            <Button 
              onClick={handleCloseLeaderboard}
              variant="outline"
            >
              Back to Grid
            </Button>
          </div>
          <LatinHAMLeaderboard
            latinHAM={selectedLatinHAM}
            onPlayAgain={(initialGrid) => handlePlayAgain(initialGrid, selectedLatinHAM.difficulty)}
            onCloseOverlays={onCloseOverlays}
          />
        </div>
      ) : (
        <LatinHAMGrid 
          latinHAMs={latinHAMs} 
          onLatinHAMClick={handleLatinHAMClick}
          difficultyFilter={difficultyFilter}
        />
      )}
    </div>
  )
}

export default DiscoveredLatinHAMs