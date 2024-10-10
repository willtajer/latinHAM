'use client'

import React, { useState, useEffect } from 'react'
import { LatinHAM, LeaderboardEntry } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'
import { useRouter } from 'next/navigation'
import { GamePreview } from './GamePreview'

interface LatinHAMLeaderboardProps {
  latinHAM: LatinHAM;
}

const LatinHAMLeaderboard: React.FC<LatinHAMLeaderboardProps> = ({ latinHAM }) => {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPuzzle, setSelectedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchLeaderboardEntries = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/leaderboard?initialGrid=${JSON.stringify(latinHAM.initialGrid)}&difficulty=${latinHAM.difficulty}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: LeaderboardEntry[] = await response.json()
        console.log('Fetched data:', data)
        
        // Filter entries based on the specific LatinHAM's initialGrid
        const filteredEntries = data.filter((entry: LeaderboardEntry) => {
          const initialGridMatch = JSON.stringify(entry.initialGrid) === JSON.stringify(latinHAM.initialGrid)
          console.log(`Entry ${entry.id || 'unknown'}:`)
          console.log(`  Initial Grid match: ${initialGridMatch}`)
          console.log(`  Entry initialGrid: ${JSON.stringify(entry.initialGrid)}`)
          return initialGridMatch
        })
        
        console.log('LatinHAM initialGrid:', JSON.stringify(latinHAM.initialGrid))
        console.log('Filtered entries:', filteredEntries)
        setLeaderboardEntries(filteredEntries)
      } catch (error) {
        console.error('Error fetching leaderboard entries:', error)
        setError('Failed to load leaderboard entries. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboardEntries()
  }, [latinHAM])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleViewCompletedBoard = (entry: LeaderboardEntry) => {
    setSelectedPuzzle(entry)
    setIsDialogOpen(true)
  }

  const handleResetGame = (initialGrid: number[][]) => {
    router.push(`/game?grid=${JSON.stringify(initialGrid)}`)
  }

  const handleStartNewGame = () => {
    router.push('/game')
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

  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard entries...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4">LatinHAM Leaderboard</h2>
      <div>
        <GamePreview />
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/3">
          <MiniGameBoard initialGrid={latinHAM.initialGrid} />
          <div className="mt-4 text-sm text-gray-800 dark:text-gray-300">
            <p>Difficulty: {latinHAM.difficulty}</p>
            <p>Solved: {latinHAM.solveCount} time{latinHAM.solveCount !== 1 ? 's' : ''}</p>
            <p>Best Moves: {latinHAM.bestMoves}</p>
            <p>Best Time: {formatTime(latinHAM.bestTime)}</p>
          </div>
        </div>
        <div className="w-full md:w-2/3">
          {leaderboardEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Moves</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Quote</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardEntries.map((entry, index) => (
                  <TableRow key={entry.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry.moves}</TableCell>
                    <TableCell>{formatTime(entry.time)}</TableCell>
                    <TableCell>{entry.quote || 'No quote provided'}</TableCell>
                    <TableCell>
                      <button 
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                        onClick={() => handleViewCompletedBoard(entry)}
                      >
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">No leaderboard entries found for this LatinHAM.</div>
          )}
        </div>
      </div>
      {selectedPuzzle && (
        <ViewCompletedPuzzleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          entry={selectedPuzzle}
          difficulty={latinHAM.difficulty}
          onResetGame={handleResetGame}
          onStartNewGame={handleStartNewGame}
        />
      )}
    </div>
  )
}

export default LatinHAMLeaderboard