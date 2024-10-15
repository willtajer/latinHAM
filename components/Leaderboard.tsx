'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { LeaderboardEntry } from '@/types'
import { Button } from "@/components/ui/button"
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

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

export default function Component({ initialDifficulty = "all", onDifficultyChange }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">(initialDifficulty)
  const [sortColumn, setSortColumn] = useState<'moves' | 'date' | 'hints' | 'duration' | 'difficulty'>('moves')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGame, setSelectedGame] = useState<LeaderboardEntry | null>(null)
  const [xAxisView, setXAxisView] = useState<'game' | 'daily'>('game')
  const entriesPerPage = 10
  const chartRef = useRef<HTMLDivElement>(null)

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

  const handleSort = (column: 'moves' | 'date' | 'hints' | 'duration' | 'difficulty') => {
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

  const chartData = useMemo(() => {
    if (xAxisView === 'game') {
      let movesSum = 0
      let timeSum = 0
      const sortedData = sortedEntries
        .map((entry) => ({
          date: new Date(entry.timestamp).getTime(),
          moves: entry.moves,
          time: entry.time,
        }))
        .sort((a, b) => a.date - b.date) // Sort by date, oldest first

      return sortedData.map((entry, index) => {
        movesSum += entry.moves
        timeSum += entry.time
        return {
          game: index + 1, // Sequential game number
          moves: entry.moves,
          time: entry.time,
          avgMoves: movesSum / (index + 1),
          avgTime: timeSum / (index + 1),
          date: entry.date,
        }
      })
    } else {
      const dailyData: { [key: string]: { moves: number, time: number, count: number } } = {}
      sortedEntries.forEach((entry) => {
        const date = new Date(entry.timestamp).toLocaleDateString()
        if (!dailyData[date]) {
          dailyData[date] = { moves: 0, time: 0, count: 0 }
        }
        dailyData[date].moves += entry.moves
        dailyData[date].time += entry.time
        dailyData[date].count++
      })
      return Object.entries(dailyData).map(([date, data]) => ({
        date,
        moves: data.moves / data.count,
        time: data.time / data.count,
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  }, [sortedEntries, xAxisView])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth;
    }
  }, [chartData, xAxisView])

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
      <div className="text-center mb-6">
        <p className="text-xl mb-4 text-white">
          {difficulty === 'all'
            ? `Total games played: ${entries.length}`
            : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} games played: ${entries.filter(entry => entry.difficulty === difficulty).length}`}
        </p>
        <div className="flex justify-center space-x-2 mb-6">
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
      </div>
      <Card className="w-full max-w-6xl mx-auto overflow-auto max-h-[80vh] pt-6">
        <CardContent>
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

          <div className="flex flex-col items-center">
            <div className="w-full relative">
              <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-center">
                <div className="transform -rotate-90 origin-center translate-x-[-50%] whitespace-nowrap text-sm text-gray-500">
                  Time (seconds)
                </div>
              </div>
              <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-center">
                <div className="transform rotate-90 origin-center translate-x-[50%] whitespace-nowrap text-sm text-gray-500">
                  Moves
                </div>
              </div>
              <div ref={chartRef} className="overflow-x-auto ml-8 mr-8" style={{ width: 'calc(100% - 4rem)' }}>
                <div className="w-full" style={{ minWidth: `${Math.max(chartData.length * 50, 1000)}px` }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey={xAxisView === 'game' ? 'game' : 'date'} 
                        label={{ value: xAxisView === 'game' ? 'Game Number' : 'Date', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="time" stroke="#8884d8" name="Time" strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="moves" stroke="#82ca9d" name="Moves" strokeWidth={3} />
                      {xAxisView === 'game' && (
                        <>
                          <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="#ffc658" name="Avg Time" strokeWidth={3} />
                          <Line yAxisId="right" type="monotone" dataKey="avgMoves" stroke="#ff7300" name="Avg Moves" strokeWidth={3} />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center mt-4">
              <div className="flex items-center mr-4 mb-2">
                <div className="w-4 h-4 bg-[#8884d8] mr-2"></div>
                <span>Time</span>
              </div>
              {xAxisView === 'game' && (
                <div className="flex items-center mr-4 mb-2">
                  <div className="w-4 h-4 bg-[#ffc658] mr-2"></div>
                  <span>Avg Time</span>
                </div>
              )}
              <div className="flex items-center mr-4 mb-2">
                <div className="w-4 h-4 bg-[#82ca9d] mr-2"></div>
                <span>Moves</span>
              </div>
              {xAxisView === 'game' && (
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-[#ff7300] mr-2"></div>
                  <span>Avg Moves</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <RadioGroup defaultValue="game" onValueChange={(value) => setXAxisView(value as 'game' | 'daily')} className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="game" id="game" />
                <Label htmlFor="game">Game View</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily View</Label>
              </div>
            </RadioGroup>
          </div>

          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead 
                  className="w-24 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date
                  {sortColumn === 'date' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="w-16">Minigrid</TableHead>
                <TableHead 
                  className="w-20 cursor-pointer"
                  onClick={() => handleSort('difficulty')}
                >
                  Difficulty
                  {sortColumn === 'difficulty' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
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
                  className="w-16 cursor-pointer"
                  onClick={() => handleSort('hints')}
                >
                  Hints
                  {sortColumn === 'hints' && (
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
                <TableHead className="w-32">Quote</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="p-2 text-center">{(currentPage - 1) * entriesPerPage + index + 1}</TableCell>
                  <TableCell className="p-1 text-sm">{formatDate(entry.timestamp)}</TableCell>
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
                      }>
                      {entry.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1 text-sm">{entry.username || 'Anonymous'}</TableCell>
                  <TableCell className="p-1 text-sm text-center">{entry.moves}</TableCell>
                  <TableCell className="p-1 text-sm text-center">{entry.hints || 0}</TableCell>
                  <TableCell className="p-1 text-sm">{formatDuration(entry.time)}</TableCell>
                  <TableCell className="p-1 text-sm truncate max-w-xs">{entry.quote || 'No quote'}</TableCell>
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
              gameNumber={entries.findIndex(entry => entry.id === selectedGame.id) + 1}
              onImageReady={(file: File) => {
                // Handle the image file if needed
                console.log('Image ready:', file.name);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}