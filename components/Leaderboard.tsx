'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { LeaderboardEntry } from '@/types'
import { Button } from "@/components/ui/button"
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface LeaderboardProps {
  initialDifficulty?: "all" | "easy" | "medium" | "hard";
  onDifficultyChange: (newDifficulty: "all" | "easy" | "medium" | "hard") => void;
}

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

const MiniProgressBar: React.FC<{ grid: number[][], onClick: () => void }> = ({ grid, onClick }) => {
  if (!Array.isArray(grid) || grid.length === 0) {
    console.error('Invalid grid data:', grid)
    return null
  }

  return (
    <button onClick={onClick} className="w-full">
      <div className="grid grid-cols-6 gap-px bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg shadow-inner" style={{ aspectRatio: '1 / 1', width: '48px' }}>
        {grid.flat().map((cell, index) => (
          <div
            key={index}
            className={`${cell !== 0 ? colorClasses[cell - 1] : 'bg-white dark:bg-gray-600'}`}
          />
        ))}
      </div>
    </button>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export default function Leaderboard({ initialDifficulty = "all", onDifficultyChange }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">(initialDifficulty)
  const [sortColumn, setSortColumn] = useState<'moves' | 'date' | 'time' | 'hints' | 'duration' | 'difficulty'>('moves')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGame, setSelectedGame] = useState<LeaderboardEntry | null>(null)
  const entriesPerPage = 10

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const [easyData, mediumData, hardData] = await Promise.all([
          fetch('/api/leaderboard?difficulty=easy').then(res => res.json()),
          fetch('/api/leaderboard?difficulty=medium').then(res => res.json()),
          fetch('/api/leaderboard?difficulty=hard').then(res => res.json())
        ])
        const allData = [...easyData, ...mediumData, ...hardData]
        setEntries(allData)
      } catch (err) {
        setError('Failed to fetch leaderboard data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleSort = (column: 'moves' | 'date' | 'time' | 'hints' | 'duration' | 'difficulty') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredEntries = useMemo(() => {
    return difficulty === 'all' ? entries : entries.filter(entry => entry.difficulty === difficulty)
  }, [entries, difficulty])

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      let compareValue: number;
      switch (sortColumn) {
        case 'moves':
          compareValue = a.moves - b.moves;
          break;
        case 'date':
          compareValue = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          break;
        case 'time':
          compareValue = new Date(b.timestamp).getHours() * 60 + new Date(b.timestamp).getMinutes() - 
                         (new Date(a.timestamp).getHours() * 60 + new Date(a.timestamp).getMinutes());
          break;
        case 'hints':
          compareValue = (a.hints || 0) - (b.hints || 0);
          break;
        case 'duration':
          compareValue = a.time - b.time;
          break;
        case 'difficulty':
          compareValue = a.difficulty.localeCompare(b.difficulty);
          break;
        default:
          compareValue = 0;
      }
      return sortDirection === 'asc' ? compareValue : -compareValue
    });
  }, [filteredEntries, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage)
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  const averages = useMemo(() => {
    const totalMoves = filteredEntries.reduce((sum, entry) => sum + entry.moves, 0)
    const totalDuration = filteredEntries.reduce((sum, entry) => sum + entry.time, 0)
    const totalHints = filteredEntries.reduce((sum, entry) => sum + (entry.hints || 0), 0)
    const count = filteredEntries.length

    return {
      moves: count > 0 ? totalMoves / count : 0,
      duration: count > 0 ? totalDuration / count : 0,
      hints: count > 0 ? totalHints / count : 0,
    }
  }, [filteredEntries])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    setSelectedGame(entry)
  }, [])

  const handleDifficultyChange = useCallback((newDifficulty: "all" | "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty)
    setCurrentPage(1) // Reset to first page when changing difficulty
    onDifficultyChange(newDifficulty)
  }, [onDifficultyChange])

  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard entries...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (entries.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center">No entries available {difficulty === 'all' ? 'across all difficulties' : `for ${difficulty} difficulty`}. </p>
          <p className="text-center">Sign in to rank on the leaderboard.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto overflow-auto max-h-[80vh]">
        <CardHeader>
          <div className="text-center">
            <CardTitle>latinHAM Leaderboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-center space-x-2">
            <Button
              onClick={() => handleDifficultyChange('all')}
              variant={difficulty === 'all' ? 'default' : 'outline'}
            >
              All
            </Button>
            <Button
              onClick={() => handleDifficultyChange('easy')}
              variant={difficulty === 'easy' ? 'default' : 'outline'}
            >
              Easy
            </Button>
            <Button
              onClick={() => handleDifficultyChange('medium')}
              variant={difficulty === 'medium' ? 'default' : 'outline'}
            >
              Medium
            </Button>
            <Button
              onClick={() => handleDifficultyChange('hard')}
              variant={difficulty === 'hard' ? 'default' : 'outline'}
            >
              Hard
            </Button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="text-xl text-center font-semibold mb-2 text-gray-900 dark:text-white">
              {difficulty === 'all' ? 'Overall' : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`} Averages
            </h3>
            <div className="grid grid-cols-3 gap-4 justify-items-center text-center">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Avg. Moves</p>
                <p className="text-lg font-bold text-gray-950 dark:text-white">{averages.moves.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Avg. Duration</p>
                <p className="text-lg font-bold text-gray-950 dark:text-white">{formatDuration(Math.round(averages.duration))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Avg. Hints</p>
                <p className="text-lg font-bold text-gray-950 dark:text-white">{averages.hints.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead className="w-16">Minigrid</TableHead>
                <TableHead className="w-20">Difficulty</TableHead>
                <TableHead className="w-24">User</TableHead>
                <TableHead 
                  className="w-16 cursor-pointer"
                  onClick={() => handleSort('moves')}
                >
                  Moves
                  {sortColumn === 'moves' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead 
                  className="w-24 cursor-pointer"
                  onClick={() => handleSort('duration')}
                >
                  Duration
                  {sortColumn === 'duration' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead 
                  className="w-16 cursor-pointer"
                  onClick={() => handleSort('hints')}
                >
                  Hints
                  {sortColumn === 'hints' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead 
                  className="w-20 cursor-pointer"
                  onClick={() => handleSort('time')}
                >
                  Time
                  {sortColumn === 'time' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead 
                  className="w-24 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date
                  {sortColumn === 'date' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="p-2 text-center">{(currentPage - 1) * entriesPerPage + index + 1}</TableCell>
                  <TableCell className="p-2">
                    <MiniProgressBar grid={entry.grid} onClick={() => handleViewCompletedBoard(entry)} />
                  </TableCell>
                  <TableCell className="p-2">
                    <Badge 
                      className={
                        entry.difficulty === 'easy' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : entry.difficulty === 'medium' 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {entry.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1 text-sm">{entry.username || 'Anonymous'}</TableCell>
                  <TableCell className="p-1 text-sm  text-center">{entry.moves}</TableCell>
                  <TableCell className="p-1 text-sm">{formatDuration(entry.time)}</TableCell>
                  <TableCell className="p-1 text-sm text-center">{entry.hints || 0}</TableCell>
                  <TableCell className="p-1 text-sm">{formatTime(entry.timestamp)}</TableCell>
                  <TableCell className="p-1 text-sm">{formatDate(entry.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!selectedGame} onOpenChange={(open) => {
        if (!open) {
          setSelectedGame(null);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Completed latinHAM</DialogTitle>
            <DialogDescription>
              Details of the completed game
            </DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <CompletedPuzzleCard
              entry={selectedGame}
              difficulty={selectedGame.difficulty}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}