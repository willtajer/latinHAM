'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LatinHAM, LeaderboardEntry } from '../types/'
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface LatinHAMGridProps {
  latinHAMs: LatinHAM[]
  onLatinHAMClick: (latinHAM: LatinHAM) => void
  fetchCompletedPuzzle: (id: string) => Promise<LeaderboardEntry | null>
  onResetGame: (initialGrid: number[][]) => void
}

const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ 
  latinHAMs, 
  onLatinHAMClick, 
  fetchCompletedPuzzle,
  onResetGame 
}) => {
  const router = useRouter()
  const [completedPuzzle, setCompletedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

  const handleLatinHAMClick = async (latinHAM: LatinHAM) => {
    console.log('Clicked LatinHAM:', latinHAM);
    if (!latinHAM.initialGrid || latinHAM.initialGrid.length === 0) {
      console.error('LatinHAM has no initialGrid:', latinHAM);
      return;
    }
    const id = `${latinHAM.difficulty}-${latinHAM.bestMoves}-${latinHAM.bestTime}-${encodeURIComponent(JSON.stringify(latinHAM.initialGrid))}`
    try {
      const completed = await fetchCompletedPuzzle(id)
      if (completed) {
        setCompletedPuzzle(completed)
        setSelectedDifficulty(latinHAM.difficulty)
        setIsDialogOpen(true)
        onLatinHAMClick(latinHAM)
      } else {
        console.error('No completed puzzle found for this LatinHAM')
      }
    } catch (error) {
      console.error('Error fetching completed puzzle:', error)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setCompletedPuzzle(null)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handlePlayGame = (initialGrid: number[][]) => {
    const encodedGrid = encodeURIComponent(JSON.stringify(initialGrid))
    router.push(`/?preset=${encodedGrid}`)
  }

  const MiniGameBoard: React.FC<{ initialGrid: number[][] }> = ({ initialGrid }) => {
    if (!initialGrid || initialGrid.length === 0) {
      return <div className="text-red-500">Error: Invalid grid data</div>;
    }

    return (
      <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner aspect-square">
        {initialGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center
                relative transition-all duration-150 ease-in-out rounded-sm shadow-sm
                ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600'}
                ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'}
              `}
              role="cell"
              aria-label={`Cell ${cell !== 0 ? 'filled' : 'empty'}`}
            />
          ))
        )}
      </div>
    )
  }

  return (
    <>
<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">        
{latinHAMs.map((latinHAM, index) => (
          <div 
            key={`latinHAM-${index}`} 
            className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-[300px]"
          >
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => handleLatinHAMClick(latinHAM)}
            >
              <MiniGameBoard initialGrid={latinHAM.initialGrid} />
              <div className="mt-4 text-sm text-gray-800 dark:text-gray-300">
                <p>Difficulty: {latinHAM.difficulty}</p>
                <p>Solved: {latinHAM.solveCount} time{latinHAM.solveCount !== 1 ? 's' : ''}</p>
                <p>Best Moves: {latinHAM.bestMoves}</p>
                <p>Best Time: {formatTime(latinHAM.bestTime)}</p>
              </div>
            </div>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handlePlayGame(latinHAM.initialGrid);
              }}
              className="bg-gray-400 dark:bg-gray-700 text-gray-200 dark:text-gray-200 hover:bg-blue-800 dark:hover:bg-blue-800 w-full mt-4 inline-flex items-center justify-center px-4 py-2" 
              aria-label="Play this latinHAM puzzle"
            >
              <RefreshCw className="h-5 w-5 mr-2 text-gray-200 dark:text-gray-200" />
              Play
            </Button>
          </div>
        ))}
      </div>
      {completedPuzzle && (
        <ViewCompletedPuzzleDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          entry={completedPuzzle}
          difficulty={selectedDifficulty}
          onResetGame={onResetGame}
        />
      )}
    </>
  )
}

export default LatinHAMGrid