'use client'

import React, { useState, useEffect } from 'react'
import LatinHAMGrid from './LatinHAMGrid'
import { LatinHAM, LeaderboardEntry } from '../types/'
import { useRouter } from 'next/navigation'
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'

export const DiscoveredLatinHAMs: React.FC = () => {
  const [latinHAMs, setLatinHAMs] = useState<LatinHAM[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPuzzle, setSelectedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchLatinHAMs = async () => {
      try {
        const response = await fetch('/api/discovered')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          setLatinHAMs(data)
        } else {
          throw new Error('Invalid data format')
        }
      } catch (error) {
        console.error('Error fetching latinHAMs:', error)
        setError('Failed to load Discovered LatinHAMs. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatinHAMs()
  }, [])

  const fetchCompletedPuzzle = async (id: string) => {
    try {
      const response = await fetch(`/api/completed-puzzles/${id}`)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching completed puzzle:', error)
      return null
    }
  }

  const handleLatinHAMClick = async (latinHAM: LatinHAM) => {
    console.log('LatinHAM clicked:', latinHAM)
    const id = `${latinHAM.difficulty}-${latinHAM.bestMoves}-${latinHAM.bestTime}`
    const completedPuzzle = await fetchCompletedPuzzle(id)
    if (completedPuzzle) {
      setSelectedPuzzle(completedPuzzle)
      setIsDialogOpen(true)
    } else {
      console.log('No completed puzzle found for this LatinHAM')
    }
  }

  const handleResetGame = (initialGrid: number[][]) => {
    router.push(`/game?grid=${JSON.stringify(initialGrid)}`)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (latinHAMs.length === 0) {
    return <div className="text-center py-8">No Discovered LatinHAMs found. Start playing to create some!</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LatinHAMGrid 
        latinHAMs={latinHAMs} 
        onLatinHAMClick={handleLatinHAMClick}
        fetchCompletedPuzzle={fetchCompletedPuzzle}
        onResetGame={handleResetGame}
      />
      {selectedPuzzle && (
        <ViewCompletedPuzzleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          entry={selectedPuzzle}
          difficulty={selectedPuzzle.difficulty}
          onResetGame={handleResetGame}
        />
      )}
    </div>
  )
}

export default DiscoveredLatinHAMs