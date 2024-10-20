'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import LatinHAMGrid from './LatinHAMGrid'
import LatinHAMLeaderboard from './LatinHAMLeaderboard'
import { DiscoveredLatinHAM } from '@/types'
import { GamePreview } from './GamePreview'
import { Button } from "@/components/ui/button"
import { calculateSolveCount } from '../utils/solveCountLogic'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { RefreshCw } from 'lucide-react'

const DifficultyFilters: React.FC<{
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard';
  setDifficultyFilter: React.Dispatch<React.SetStateAction<'all' | 'easy' | 'medium' | 'hard'>>;
}> = ({ difficultyFilter, setDifficultyFilter }) => (
  <div className="flex justify-center space-x-2 mb-8">
    <Button
      onClick={() => setDifficultyFilter('all')}
      variant={difficultyFilter === 'all' ? 'default' : 'outline'}
      className={difficultyFilter === 'all' ? 'bg-blue-500 hover:bg-blue-600' : ''}
    >
      All
    </Button>
    <Button
      onClick={() => setDifficultyFilter('easy')}
      variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
      className={difficultyFilter === 'easy' ? 'bg-green-500 hover:bg-green-600' : ''}
    >
      Easy
    </Button>
    <Button
      onClick={() => setDifficultyFilter('medium')}
      variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
      className={difficultyFilter === 'medium' ? 'bg-orange-500 hover:bg-orange-600' : ''}
    >
      Medium
    </Button>
    <Button
      onClick={() => setDifficultyFilter('hard')}
      variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
      className={difficultyFilter === 'hard' ? 'bg-red-500 hover:bg-red-600' : ''}
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
  const [sortCriteria, setSortCriteria] = useState<'totalPlays' | 'date' | 'solvedCount' | 'possibleSolveCount'>('totalPlays')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showIncomplete, setShowIncomplete] = useState(true)
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

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData()
      }
    }

    const handleNewGameWon = () => {
      refreshData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('newGameWon', handleNewGameWon)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('newGameWon', handleNewGameWon)
    }
  }, [refreshData])

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

  const filteredAndSortedLatinHAMs = useMemo(() => {
    return latinHAMs
      .filter(latinHAM => {
        const isCompleted = latinHAM.uniqueSolves === latinHAM.possibleSolveCount
        return (showCompleted && isCompleted) || (showIncomplete && !isCompleted)
      })
      .sort((a, b) => {
        switch (sortCriteria) {
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'solvedCount':
            return b.uniqueSolves - a.uniqueSolves
          case 'possibleSolveCount':
            return b.possibleSolveCount - a.possibleSolveCount
          case 'totalPlays':
          default:
            return b.solveCount - a.solveCount
        }
      })
  }, [latinHAMs, sortCriteria, showCompleted, showIncomplete])

  const completedLatinHAMs = latinHAMs.filter(
    latinHAM => latinHAM.uniqueSolves === latinHAM.possibleSolveCount
  ).length

  if (isLoading) {
    return <div className="text-center text-white py-8">Loading...</div>
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
      <p className="text-center mb-6 text-white">Explore player-identified boards and help find all possible solutions to complete the LatinHAM.</p>
      {!selectedLatinHAM && (
        <>
          <div className="text-center mb-6 text-white text-xl font-bold">
            Completed: {completedLatinHAMs} / {latinHAMs.length}
          </div>
          <DifficultyFilters
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
          />
          <RadioGroup 
            defaultValue="incomplete"
            onValueChange={(value) => {
              setShowIncomplete(value === 'incomplete');
              setShowCompleted(value === 'complete');
            }}
            className="flex justify-center space-x-4 mb-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="incomplete" id="filter-incomplete" className="border-white text-white" />
              <Label htmlFor="filter-incomplete" className="text-white">Incomplete</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="complete" id="filter-complete" className="border-white text-white" />
              <Label htmlFor="filter-complete" className="text-white">Complete</Label>
            </div>
          </RadioGroup>
          <div className="flex justify-center mb-4">
            <RadioGroup value={sortCriteria} onValueChange={(value: 'totalPlays' | 'date' | 'solvedCount' | 'possibleSolveCount') => setSortCriteria(value)}>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="totalPlays" id="sort-totalPlays" className="border-white text-white" />
                  <Label htmlFor="sort-totalPlays" className="text-white">Total Plays</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="sort-date" className="border-white text-white" />
                  <Label htmlFor="sort-date" className="text-white">Discovery Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solvedCount" id="sort-solvedCount" className="border-white text-white" />
                  <Label htmlFor="sort-solvedCount" className="text-white">Solved</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="possibleSolveCount" id="sort-possibleSolveCount" className="border-white text-white" />
                  <Label htmlFor="sort-possibleSolveCount" className="text-white">Possible</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-center mb-4">
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </>
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
          latinHAMs={filteredAndSortedLatinHAMs}
          onLatinHAMClick={handleLatinHAMClick}
          difficultyFilter={difficultyFilter}
        />
      )}
    </div>
  )
}

export default DiscoveredLatinHAMs