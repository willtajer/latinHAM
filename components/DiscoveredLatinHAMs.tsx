'use client'

import React, { useState, useEffect, useCallback } from 'react'
import LatinHAMGrid from './LatinHAMGrid'
import LatinHAMLeaderboard from './LatinHAMLeaderboard'
import { DiscoveredLatinHAM } from '@/types'
import { GamePreview } from './GamePreview'
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs'
import { calculateSolveCount } from '../utils/solveCountLogic'
import useSWR from 'swr'

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

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function DiscoveredLatinHAMs({ onPlayAgain, onCloseOverlays }: DiscoveredLatinHAMsProps) {
  const [selectedLatinHAM, setSelectedLatinHAM] = useState<DiscoveredLatinHAM | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [key, setKey] = useState(0)
  const { user } = useUser()

  const { data: latinHAMs, error, isLoading, mutate } = useSWR<DiscoveredLatinHAM[]>(
    `/api/discovered?difficulty=${difficultyFilter}&t=${Date.now()}`,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        mutate()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [mutate])

  useEffect(() => {
    setKey(prevKey => prevKey + 1)
  }, [user])

  const handleLatinHAMClick = (latinHAM: DiscoveredLatinHAM) => {
    setSelectedLatinHAM(latinHAM)
  }

  const handleCloseLeaderboard = () => {
    setSelectedLatinHAM(null)
    mutate()
  }

  const handlePlayAgain = useCallback((initialGrid: number[][], difficulty: 'easy' | 'medium' | 'hard') => {
    onPlayAgain(initialGrid, difficulty)
    onCloseOverlays()
  }, [onPlayAgain, onCloseOverlays])

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Failed to load Discovered LatinHAMs. Please try again later.</div>
  }

  if (!latinHAMs || latinHAMs.length === 0) {
    return <div className="text-center py-8 text-white">No Discovered LatinHAMs found. Start playing to create some!</div>
  }

  const latinHAMsWithSolveCount = latinHAMs.map(latinHAM => ({
    ...latinHAM,
    possibleSolveCount: calculateSolveCount(latinHAM.initialGrid)
  }))

  return (
    <div key={key} className="container mx-auto">
      <h1 className="text-6xl font-bold text-center mb-6 text-white">Discovered LatinHAMs</h1>
      <div className="flex flex-col items-center justify-center">
        <div className="w-[calc(6*3rem+6*0.75rem)]">
          <GamePreview />
        </div>
      </div>
      <p className="text-center mb-6 text-white">Explore player-identified gameboard layouts.</p>
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
          latinHAMs={latinHAMsWithSolveCount} 
          onLatinHAMClick={handleLatinHAMClick}
          difficultyFilter={difficultyFilter}
        />
      )}
    </div>
  )
}

export default DiscoveredLatinHAMs