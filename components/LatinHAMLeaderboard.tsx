'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { LatinHAM, LeaderboardEntry } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'

interface LatinHAMLeaderboardProps {
  latinHAM: LatinHAM;
}

const ENTRIES_PER_PAGE = 10;

const LatinHAMLeaderboard: React.FC<LatinHAMLeaderboardProps> = ({ latinHAM }) => {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPuzzle, setSelectedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  const MiniGameBoard: React.FC<{ initialGrid: number[][] }> = ({ initialGrid }) => {
    if (!initialGrid || initialGrid.length === 0) {
      return <div className="text-red-500">Error: Invalid grid data</div>;
    }

    const colorClasses = [
      'bg-red-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
    ]

    return (
      <div className="w-[288px] h-[288px] mx-auto">
        <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg shadow-inner w-full h-full">
          {initialGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-11 h-11 flex items-center justify-center text-base font-bold
                  relative transition-all duration-150 ease-in-out rounded-md shadow-sm
                  ${cell !== 0 ? colorClasses[cell - 1] : 'bg-white dark:bg-gray-600'}
                  ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'}
                `}
                role="cell"
                aria-label={`Cell value ${cell || 'Empty'}`}
              >
                {cell !== 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
                    {cell}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const MiniProgressBar: React.FC<{ grid: number[][], onClick: () => void }> = ({ grid, onClick }) => {
    if (!Array.isArray(grid) || grid.length === 0) {
      console.error('Invalid grid data:', grid)
      return null
    }
  
    return (
      <button onClick={onClick} className="w-full">
        <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg shadow-inner">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-4 h-4 ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </button>
    )
  }

  const averages = useMemo(() => {
    const totalMoves = leaderboardEntries.reduce((sum, entry) => sum + entry.moves, 0)
    const totalDuration = leaderboardEntries.reduce((sum, entry) => sum + entry.time, 0)
    const totalHints = leaderboardEntries.reduce((sum, entry) => sum + (entry.hints || 0), 0)
    const count = leaderboardEntries.length

    return {
      moves: count > 0 ? totalMoves / count : 0,
      duration: count > 0 ? totalDuration / count : 0,
      hints: count > 0 ? totalHints / count : 0,
    }
  }, [leaderboardEntries])

  const totalPages = Math.ceil(leaderboardEntries.length / ENTRIES_PER_PAGE)
  const paginatedEntries = leaderboardEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  )

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
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
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-[288px]">
          <MiniGameBoard initialGrid={latinHAM.initialGrid} />
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center md:text-left w-[288px]">
            <h3 className="text-lg font-semibold mb-2">Initial Grid Info</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-800 dark:text-gray-300">
              <p>Difficulty: {latinHAM.difficulty}</p>
              <p>Solved: {latinHAM.solveCount} time{latinHAM.solveCount !== 1 ? 's' : ''}</p>
              <p>Best Moves: {latinHAM.bestMoves}</p>
              <p>Best Time: {formatTime(latinHAM.bestTime)}</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center md:text-left w-[288px]">
            <h3 className="text-lg font-semibold mb-2">Overall Averages</h3>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Moves</p>
                <p className="text-lg font-bold">{averages.moves.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Duration</p>
                <p className="text-lg font-bold">{formatTime(Math.round(averages.duration))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Hints</p>
                <p className="text-lg font-bold">{averages.hints.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:flex-1">
          {paginatedEntries.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Moves</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Quote</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry, index) => (
                    <TableRow 
                      key={entry.id || index}
                      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell>{(currentPage - 1) * ENTRIES_PER_PAGE + index + 1}</TableCell>
                      <TableCell>{entry.username || 'Anonymous'}</TableCell>
                      <TableCell>
                        <MiniProgressBar 
                          grid={entry.grid} 
                          onClick={() => handleViewCompletedBoard(entry)}
                        />
                      </TableCell>
                      <TableCell>{entry.moves}</TableCell>
                      <TableCell>{formatTime(entry.time)}</TableCell>
                      <TableCell>{entry.quote || 'No quote provided'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
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
        />
      )}
    </div>
  )
}

export default LatinHAMLeaderboard