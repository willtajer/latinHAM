'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { LatinHAM, LeaderboardEntry } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'
import { NewGameDialog } from './NewGameDialog'
import { ChevronUp, ChevronDown, RefreshCw } from 'lucide-react'
import { calculateSolveCount } from '../utils/solveCountLogic'
import { useGameLogic } from '../hooks/useGameLogic'

interface LatinHAMLeaderboardProps {
  latinHAM: LatinHAM;
  onPlayAgain: (initialGrid: number[][]) => void;
  onCloseOverlays: () => void;
}

export default function LatinHAMLeaderboard({ latinHAM, onPlayAgain, onCloseOverlays }: LatinHAMLeaderboardProps) {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPuzzle, setSelectedPuzzle] = useState<LeaderboardEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<'username' | 'moves' | 'time' | 'quote' | 'timestamp'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [possibleSolves, setPossibleSolves] = useState<number | null>(null)
  const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false)

  const { gameState } = useGameLogic()

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

    const solveCount = calculateSolveCount(latinHAM.initialGrid)
    setPossibleSolves(solveCount)
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

  const handlePlayAgain = () => {
    console.log("Play Again button clicked")
    if (gameState === 'playing') {
      setShowNewGameConfirmation(true)
    } else {
      startNewGame()
    }
  }

  const startNewGame = () => {
    onCloseOverlays()
    onPlayAgain(latinHAM.initialGrid)
  }

  const confirmNewGame = () => {
    setShowNewGameConfirmation(false)
    startNewGame()
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
      <div className="w-[288px] h-[288px]">
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

  const uniqueSortedEntries = useMemo(() => {
    const uniqueEntries = leaderboardEntries.reduce((acc, entry) => {
      const gridKey = JSON.stringify(entry.grid);
      if (!acc[gridKey] || new Date(entry.timestamp) < new Date(acc[gridKey].timestamp)) {
        acc[gridKey] = entry;
      }
      return acc;
    }, {} as Record<string, LeaderboardEntry>);

    return Object.values(uniqueEntries).sort((a, b) => {
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
  }, [leaderboardEntries, sortField, sortOrder]);

  const handleSort = (field: 'username' | 'moves' | 'time' | 'quote' | 'timestamp') => {
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
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-auto flex flex-col items-center md:items-start">
          <MiniGameBoard initialGrid={latinHAM.initialGrid} />
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-left w-full md:w-[288px]">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-300">
              <div>
                <p><strong>Difficulty:</strong> {latinHAM.difficulty}</p>
                <p><strong>Solved:</strong> {latinHAM.solveCount} / {possibleSolves !== null ? possibleSolves.toLocaleString() : 'Calculating...'}</p>
                <p><strong>Best Moves:</strong> {latinHAM.bestMoves}</p>
              </div>
              <div>
                <p><strong>Best Time:</strong> {formatTime(latinHAM.bestTime)}</p>
                <p><strong>Avg. Moves:</strong> {averages.moves.toFixed(2)}</p>
                <p><strong>Avg. Time:</strong> {formatTime(Math.round(averages.duration))}</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={handlePlayAgain}
            className="w-full mt-4 inline-flex items-center justify-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Play This LatinHAM
          </Button>
        </div>
        <div className="w-full md:flex-1 overflow-x-auto">
          {uniqueSortedEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">LatinHAM</TableHead>
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
                {uniqueSortedEntries.map((entry, index) => (
                  <TableRow 
                    key={entry.id || index}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <TableCell className="w-[120px]">
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
      <NewGameDialog
        open={showNewGameConfirmation}
        onOpenChange={setShowNewGameConfirmation}
        onConfirm={confirmNewGame}
      />
    </div>
  )
}