'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { useUser } from '@clerk/nextjs'
import { SignInButton } from '@clerk/nextjs'

interface LeaderboardProps {
  initialDifficulty?: "all" | "easy" | "medium" | "hard";
  onDifficultyChange: (newDifficulty: "all" | "easy" | "medium" | "hard") => void;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  difficulty: "easy" | "medium" | "hard";
  moves: number;
  time: number;
  hints: number;
  grid: number[][];
  initialGrid: number[][];
  quote: string;
  timestamp: string;
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

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  xAxisView: 'game' | 'daily';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, xAxisView }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="label">{`${xAxisView === 'game' ? 'Game' : 'Date'}: ${label}`}</p>
        {payload.map((pld) => (
          <p key={pld.name} style={{ color: pld.color }}>
            {`${pld.name}: ${Math.round(pld.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Leaderboard({ initialDifficulty = "all", onDifficultyChange }: LeaderboardProps) {
  const { user, isLoaded } = useUser()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">(initialDifficulty)
  const [sortColumn, setSortColumn] = useState<'moves' | 'date' | 'hints' | 'duration' | 'difficulty' | 'username'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
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

    if (isLoaded) {
      fetchLeaderboard()
    }
  }, [isLoaded])

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(2)}s`
  }

  const handleSort = (column: 'moves' | 'date' | 'hints' | 'duration' | 'difficulty' | 'username') => {
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

  const rankedEntries = useMemo(() => {
    return filteredEntries.sort((a, b) => a.moves - b.moves);
  }, [filteredEntries]);

  const sortedEntries = useMemo(() => {
    return [...rankedEntries].sort((a, b) => {
      let compareValue: number;
      switch (sortColumn) {
        case 'date':
          compareValue = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          break;
        case 'moves':
          compareValue = a.moves - b.moves;
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
        case 'username':
          compareValue = (a.username || 'Anonymous').localeCompare(b.username || 'Anonymous');
          break;
        default:
          compareValue = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return sortDirection === 'desc' ? compareValue : -compareValue;
    });
  }, [rankedEntries, sortColumn, sortDirection]);

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
        .sort((a, b) => a.date - b.date)

      return sortedData.map((entry, index) => {
        movesSum += entry.moves
        timeSum += entry.time
        return {
          game: index + 1,
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

  const bestPerformances = useMemo(() => {
    const difficulties: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];
    return difficulties.reduce((acc, diff) => {
      const diffEntries = entries.filter(entry => entry.difficulty === diff);
      const bestMoves = diffEntries.reduce((best, current) => 
        current.moves < best.moves ? current : best
      , diffEntries[0] || null);
      const bestTime = diffEntries.reduce((best, current) => 
        current.time < best.time ? current : best
      , diffEntries[0] || null);
      acc[diff] = { bestMoves, bestTime };
      return acc;
    }, {} as Record<"easy" | "medium" | "hard", { bestMoves: LeaderboardEntry | null, bestTime: LeaderboardEntry | null }>);
  }, [entries]);

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    setSelectedGame(entry)
  }, [])

  const handleDifficultyChange = useCallback((newDifficulty: "all" | "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty)
    setCurrentPage(1)
    onDifficultyChange(newDifficulty)
  }, [onDifficultyChange])

  const renderBestPerformanceCard = (difficulty: "easy" | "medium" | "hard", type: "moves" | "time") => {
    const entry = type === "moves" ? bestPerformances[difficulty].bestMoves : bestPerformances[difficulty].bestTime;
    const textColor = difficulty === 'easy' ? 'text-green-500' : difficulty === 'medium' ? 'text-orange-500' : 'text-red-500';
    
    return (
      <Card className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center flex flex-col">
        <CardHeader className="rounded-t-lg p-0 text-center">
          <CardTitle className="text-lg">
            <div className="p-2 rounded-t-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500">
              <span className="font-bold text-white">{entry?.username || 'Anonymous'}</span>
            </div>
            <div className={`${textColor} pt-2`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - Best {type === "moves" ? "Moves" : "Time"}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 pt-2 flex-grow flex flex-col justify-between">
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Moves:</span>{' '}
              <span className={type === "moves" ? "text-yellow-500 font-bold" : ""}>
                {entry?.moves}
              </span>
            </p>
            <p>
              <span className="font-semibold">Time:</span>{' '}
              <span className={type === "time" ? "text-yellow-500 font-bold" : ""}>
                {entry ? formatTime(entry.time) : 'N/A'}
              </span>
            </p>
          </div>
          <p className="italic mt-2 text-sm">
            &ldquo;{entry?.quote || 'No quote available'}&rdquo;
          </p>
        </CardContent>
      </Card>
    );
  };

  const totalGames = entries.length;
  const  gameCounts = {
    easy: entries.filter(entry => entry.difficulty === 'easy').length,
    medium: entries.filter(entry => entry.difficulty === 'medium').length,
    hard: entries.filter(entry => entry.difficulty === 'hard').length,
  };

  const ImprovedPagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    const pageRange = 1 // Number of pages to show on each side of the current page
    
    const renderPageNumbers = () => {
      const pages = []
      const startPage = Math.max(1, currentPage - pageRange)
      const endPage = Math.min(totalPages, currentPage + pageRange)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => onPageChange(i)} isActive={currentPage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      return pages
    }

    return (
      <Pagination className="flex flex-wrap justify-center items-center gap-1">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          {currentPage > pageRange + 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}
          {renderPageNumbers()}
          {currentPage < totalPages - pageRange && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  if (!isLoaded || isLoading) {
    return <div className="text-center py-8 text-white">Loading leaderboard entries...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!user && (
        <Card className="w-full max-w-md mx-auto mb-6 bg-white dark:bg-gray-800">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Join the Leaderboard</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Sign in to submit your scores and compete on the leaderboard!</p>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-6xl mx-auto mb-6 bg-transparent border-transparent shadow-transparent">
        <CardContent className="py-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Total Games Played: {totalGames}</h2>
            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="text-lg py-1 px-3">
                Easy: {gameCounts.easy}
              </Badge>
              <Badge variant="secondary" className="text-lg py-1 px-3">
                Medium: {gameCounts.medium}
              </Badge>
              <Badge variant="secondary" className="text-lg py-1 px-3">
                Hard: {gameCounts.hard}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-6">
        <div className="col-span-2 lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
          {renderBestPerformanceCard("easy", "moves")}
          {renderBestPerformanceCard("easy", "time")}
        </div>
        <div className="col-span-2 lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
          {renderBestPerformanceCard("medium", "moves")}
          {renderBestPerformanceCard("medium", "time")}
        </div>
        <div className="col-span-2 lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
          {renderBestPerformanceCard("hard", "moves")}
          {renderBestPerformanceCard("hard", "time")}
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="font-bold text-3xl p-4 text-white">Game History</h2>
      </div>

      <Card className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 flex-grow">
        <CardContent className="p-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="text-xl text-center font-semibold mb-2 text-gray-900 dark:text-white">
              {difficulty === 'all' ? 'Overall' : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`} Averages
            </h3>
            <div className="grid grid-cols-3 gap-4 justify-items-center text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Moves</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{averages.moves.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Duration</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(averages.duration)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Hints</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{averages.hints.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="w-full relative">
              <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-center">
                <div className="transform -rotate-90 origin-center translate-x-[-50%] whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  Time (seconds)
                </div>
              </div>
              <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-center">
                <div className="transform rotate-90 origin-center translate-x-[50%] whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  Moves
                </div>
              </div>
              <div ref={chartRef} className="overflow-x-auto ml-8 mr-8" style={{ width: 'calc(100% - 4rem)' }}>
                <div className="w-full" style={{ minWidth: `${Math.max(chartData.length * 50, 1000)}px` }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#525252" />
                      <XAxis 
                        dataKey={xAxisView === 'game' ? 'game' : 'date'}
                        label={{ value: xAxisView === 'game' ? 'Game Number' : 'Date', position: 'insideBottom', offset: -5 }}
                        stroke="#a3a3a3"
                      />
                      <YAxis yAxisId="left" stroke="#a3a3a3" />
                      <YAxis yAxisId="right" orientation="right" stroke="#a3a3a3" />
                      <Tooltip content={<CustomTooltip xAxisView={xAxisView} />} />
                      <Line yAxisId="left" type="monotone" dataKey="time" stroke="#8884d8" name="Time" strokeWidth={3} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="moves" stroke="#82ca9d" name="Moves" strokeWidth={3} dot={false} />
                      {xAxisView === 'game' && (
                        <>
                          <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="rgba(136, 132, 216, 0.5)" name="Avg Time" strokeWidth={3} dot={false} />
                          <Line yAxisId="right" type="monotone" dataKey="avgMoves" stroke="rgba(130, 202, 157, 0.5)" name="Avg Moves" strokeWidth={3} dot={false} />
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
                <span className="text-gray-900 dark:text-white">Time</span>
              </div>
              {xAxisView === 'game' && (
                <div className="flex items-center mr-4 mb-2">
                  <div className="w-4 h-4 bg-[rgba(136,132,216,0.5)] mr-2"></div>
                  <span className="text-gray-900 dark:text-white">Avg Time</span>
                </div>
              )}
              <div className="flex items-center mr-4 mb-2">
                <div className="w-4 h-4 bg-[#82ca9d] mr-2"></div>
                <span className="text-gray-900 dark:text-white">Moves</span>
              </div>
              {xAxisView === 'game' && (
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-[rgba(130,202,157,0.5)] mr-2"></div>
                  <span className="text-gray-900 dark:text-white">Avg Moves</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <RadioGroup defaultValue="game" onValueChange={(value) => setXAxisView(value as 'game' | 'daily')} className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="game" id="game" />
                <Label htmlFor="game" className="text-gray-900 dark:text-white">Game View</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="text-gray-900 dark:text-white">Daily View</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            <Button
              onClick={() => handleDifficultyChange('all')}
              variant={difficulty === 'all' ? 'default' : 'outline'}
              className={difficulty === 'all' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              All
            </Button>
            <Button
              onClick={() => handleDifficultyChange('easy')}
              variant={difficulty === 'easy' ? 'default' : 'outline'}
              className={difficulty === 'easy' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              Easy
            </Button>
            <Button
              onClick={() => handleDifficultyChange('medium')}
              variant={difficulty === 'medium' ? 'default' : 'outline'}
              className={difficulty === 'medium' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              Medium
            </Button>
            <Button
              onClick={() => handleDifficultyChange('hard')}
              variant={difficulty === 'hard' ? 'default' : 'outline'}
              className={difficulty === 'hard' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              Hard
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-gray-900 dark:text-white">#</TableHead>
                  <TableHead 
                    className="w-24 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleSort('date')}
                  >
                    Date
                    {sortColumn === 'date' && (
                      sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="w-16 text-gray-900 dark:text-white">LatinHAM</TableHead>
                  <TableHead 
                    className="w-20 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleSort('difficulty')}
                  >
                    Difficulty
                    {sortColumn === 'difficulty' && (
                      sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="w-24 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleSort('username')}
                  >
                    User
                    {sortColumn === 'username' && (
                      sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="w-16 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleSort('moves')}
                  >
                    Moves
                    {sortColumn === 'moves' && (
                      sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="w-16 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleSort('hints')}
                  >
                    Hints
                    {sortColumn === 'hints' && (
                      sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="w-24 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleSort('duration')}
                  >
                    Duration
                    {sortColumn === 'duration' && (
                      sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="w-32 text-gray-900 dark:text-white">Quote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="p-2 text-center text-gray-900 dark:text-white">{(currentPage - 1) * entriesPerPage + index + 1}</TableCell>
                    <TableCell className="p-1 text-sm text-gray-900 dark:text-white">{formatDate(entry.timestamp)}</TableCell>
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
                    <TableCell className="p-1 text-sm text-gray-900 dark:text-white">{entry.username || 'Anonymous'}</TableCell>
                    <TableCell className="p-1 text-sm text-center text-gray-900 dark:text-white">{entry.moves}</TableCell>
                    <TableCell className="p-1 text-sm text-center text-gray-900 dark:text-white">{entry.hints || 0}</TableCell>
                    <TableCell className="p-1 text-sm text-gray-900 dark:text-white">{formatTime(entry.time)}</TableCell>
                    <TableCell className="p-1 text-sm truncate text-gray-900 dark:text-white">{entry.quote}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <ImprovedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Completed LatinHAM</DialogTitle>
            <DialogDescription>Details of the completed game</DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <CompletedPuzzleCard
              entry={selectedGame}
              difficulty={selectedGame.difficulty}
              gameNumber={rankedEntries.findIndex((entry) => entry.id === selectedGame.id) + 1}
              onImageReady={(file: File) => {
                console.log('Image ready:', file.name);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}