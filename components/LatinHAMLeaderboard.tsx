'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { LatinHAM, LeaderboardEntry } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface LatinHAMLeaderboardProps {
  latinHAM: LatinHAM;
}

type SortField = 'username' | 'moves' | 'time' | 'quote' | 'timestamp';
type SortOrder = 'asc' | 'desc';

const ENTRIES_PER_PAGE = 10;

export default function LatinHAMLeaderboard({ latinHAM }: LatinHAMLeaderboardProps) {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPuzzle, setSelectedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [uniqueFilter, setUniqueFilter] = useState(false)
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    const fetchLeaderboardEntries = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/leaderboard?initialGrid=${JSON.stringify(latinHAM.initialGrid)}&difficulty=${latinHAM.difficulty}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: LeaderboardEntry[] = await response.json()
        setLeaderboardEntries(data.filter((entry: LeaderboardEntry) => 
          JSON.stringify(entry.initialGrid) === JSON.stringify(latinHAM.initialGrid)
        ))
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTimeOfDay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString()
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
      <div className="max-w-[350px] max-h-[350px] w-full h-full aspect-square mx-auto">
        <div className="grid grid-cols-6 gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner w-full h-full">
          {initialGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  aspect-square flex items-center justify-center
                  relative transition-all duration-150 ease-in-out rounded-md shadow-sm
                  ${cell !== 0 ? colorClasses[cell - 1] : 'bg-white dark:bg-gray-600'}
                  ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'}
                `}
                role="cell"
                aria-label={`Cell value ${cell || 'Empty'}`}
              />
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

  const sortedAndFilteredEntries = useMemo(() => {
    const entries = uniqueFilter
      ? leaderboardEntries.filter((entry, index, self) =>
          index === self.findIndex((t) => JSON.stringify(t.grid) === JSON.stringify(entry.grid))
        )
      : [...leaderboardEntries];

    return entries.sort((a, b) => {
      if (sortField === 'timestamp') {
        return sortOrder === 'asc'
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortField === 'username' || sortField === 'quote') {
        return sortOrder === 'asc'
          ? (a[sortField] || '').localeCompare(b[sortField] || '')
          : (b[sortField] || '').localeCompare(a[sortField] || '');
      }
      return sortOrder === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
    });
  }, [leaderboardEntries, uniqueFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedAndFilteredEntries.length / ENTRIES_PER_PAGE)
  const paginatedEntries = sortedAndFilteredEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  )

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard entries...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full">
      <div className="flex flex-col items-center md:items-start md:flex-row gap-4 mb-4">
        <div className="w-full md:w-[288px] flex flex-col items-center md:items-start">
          <MiniGameBoard initialGrid={latinHAM.initialGrid} />
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-left w-full max-w-[288px]">
            <h3 className="text-lg font-semibold mb-2 text-center">Info & Averages</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-300">
              <div>
                <p>Difficulty: {latinHAM.difficulty}</p>
                <p>Solved: {latinHAM.solveCount} time{latinHAM.solveCount !== 1 ? 's' : ''}</p>
                <p>Best Moves: {latinHAM.bestMoves}</p>
                <p>Best Time: {formatTime(latinHAM.bestTime)}</p>
              </div>
              <div>
                <p>Avg. Moves: {averages.moves.toFixed(2)}</p>
                <p>Avg. Duration: {formatTime(Math.round(averages.duration))}</p>
                <p>Avg. Hints: {averages.hints.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center items-center w-full">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unique-filter"
                checked={uniqueFilter}
                onCheckedChange={(checked) => setUniqueFilter(checked as boolean)}
              />
              <label
                htmlFor="unique-filter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show only unique solutions
              </label>
            </div>
          </div>
        </div>
        <div className="w-full md:flex-1">
          {paginatedEntries.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LatinHAM</TableHead>
                      <TableHead onClick={() => handleSort('username')} className="cursor-pointer">
                        User {sortField === 'username' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('moves')} className="cursor-pointer">
                        Moves {sortField === 'moves' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('time')} className="cursor-pointer">
                        Time {sortField === 'time' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('quote')} className="cursor-pointer">
                        Quote {sortField === 'quote' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer">
                        Time of Day {sortField === 'timestamp' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer">
                        Date {sortField === 'timestamp' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map((entry, index) => (
                      <TableRow 
                        key={entry.id || index}
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <TableCell className="min-w-[120px]">
                          <MiniProgressBar 
                            grid={entry.grid} 
                            onClick={() => handleViewCompletedBoard(entry)}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{entry.username || 'Anonymous'}</TableCell>
                        <TableCell>{entry.moves}</TableCell>
                        <TableCell>{formatTime(entry.time)}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.quote || 'No quote provided'}</TableCell>
                        
                        <TableCell>{formatTimeOfDay(entry.timestamp)}</TableCell>
                        <TableCell>{formatDate(entry.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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