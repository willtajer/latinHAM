'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { GamePreview } from './GamePreview'

// Interface defining the structure of a game entry
interface GameEntry {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  moves: number
  time: number
  hints: number
  grid: number[][]
  initialGrid: number[][]
  quote: string
  created_at: string
}

// Interface defining the structure of user profile data
interface UserProfileData {
  username: string
  user_created_at: string
  games: GameEntry[]
}

// Array of CSS classes for different cell colors
const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

// MiniProgressBar component to display a small grid preview
const MiniProgressBar: React.FC<{ grid: number[][], onClick: () => void }> = ({ grid, onClick }) => {
  if (!Array.isArray(grid) || grid.length === 0) { // Validate grid data
    console.error('Invalid grid data:', grid)
    return null
  }

  return (
    <button onClick={onClick} className="w-full">
      <div className="grid grid-cols-6 gap-px bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg shadow-inner" style={{ aspectRatio: '1 / 1', width: '48px' }}>
        {grid.flat().map((cell, index) => (
          <div
            key={index}
            className={`${cell !== 0 ? colorClasses[cell - 1] : 'bg-white dark:bg-gray-600'}`} // Apply color based on cell value
          />
        ))}
      </div>
    </button>
  )
}

// Utility function to format a date string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`;
}

// Utility function to format time from a date string
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// UserProfile component to display user information and game history
export function UserProfile() {
  const { user } = useUser() // Get the current user
  const [profileData, setProfileData] = useState<UserProfileData | null>(null) // State for profile data
  const [isLoading, setIsLoading] = useState(true) // State for loading
  const [error, setError] = useState<string | null>(null) // State for error messages
  const [sortColumn, setSortColumn] = useState<'date' | 'moves' | 'time' | 'hints' | 'duration' | 'quote'>('date') // State for sorting
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc') // State for sort direction
  const [currentPage, setCurrentPage] = useState(1) // State for current pagination page
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null) // State for selected game in dialog
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all') // State for difficulty filter
  const [xAxisView, setXAxisView] = useState<'game' | 'daily'>('game') // State for chart X-axis view
  const entriesPerPage = 10 // Number of entries per page for pagination
  const chartRef = useRef<HTMLDivElement>(null) // Ref for chart container

  // Fetch user profile data on component mount or when user changes
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return // Exit if no user

      try {
        const response = await fetch(`/api/user-profile?userId=${user.id}`) // Fetch profile data
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const data: UserProfileData = await response.json()
        const processedData: UserProfileData = {
          ...data,
          games: data.games.map((game: GameEntry) => ({
            ...game,
            grid: ensureGrid2D(game.grid),
            initialGrid: ensureGrid2D(game.initialGrid),
          }))
        }
        setProfileData(processedData) // Set profile data
      } catch (err) {
        setError('Error loading profile data') // Set error message
        console.error(err)
      } finally {
        setIsLoading(false) // Set loading to false
      }
    }

    fetchUserProfile()
  }, [user])

  // Ensure grid data is 2D
  const ensureGrid2D = (grid: number[] | number[][]): number[][] => {
    if (Array.isArray(grid[0])) {
      return grid as number[][]
    }
    return convertTo2DArray(grid as number[])
  }

  // Convert a flat array to a 2D array with 6 columns
  const convertTo2DArray = (arr: number[]): number[][] => {
    const result: number[][] = []
    for (let i = 0; i < arr.length; i += 6) {
      result.push(arr.slice(i, i + 6))
    }
    return result
  }

  // Handle sorting based on column
  const handleSort = (column: 'date' | 'moves' | 'time' | 'hints' | 'duration' | 'quote') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') // Toggle sort direction
    } else {
      setSortColumn(column)
      setSortDirection('desc') // Set new sort column with descending order
    }
  }

  // Format duration from seconds to "Xm Ys"
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Handle viewing a completed game's details
  const handleViewCompletedBoard = (game: GameEntry) => {
    setSelectedGame(game) // Set the selected game
  }

  // Calculate averages based on filtered games
  const averages = useMemo(() => {
    if (!profileData || profileData.games.length === 0) return null;
    const filteredGames = difficultyFilter === 'all' 
      ? profileData.games 
      : profileData.games.filter(game => game.difficulty === difficultyFilter);
    const totalMoves = filteredGames.reduce((sum, game) => sum + game.moves, 0)
    const totalDuration = filteredGames.reduce((sum, game) => sum + game.time, 0)
    const totalHints = filteredGames.reduce((sum, game) => sum + game.hints, 0)
    const count = filteredGames.length

    return count > 0 ? {
      moves: totalMoves / count,
      duration: totalDuration / count,
      hints: totalHints / count,
    } : null;
  }, [profileData, difficultyFilter])

  // Filter and sort games based on current state
  const filteredAndSortedGames = useMemo(() => {
    let filtered = profileData ? profileData.games : [];
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(game => game.difficulty === difficultyFilter);
    }
    return filtered.sort((a, b) => {
      let compareValue: number;
      switch (sortColumn) {
        case 'date':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'moves':
          compareValue = a.moves - b.moves;
          break;
        case 'time':
          compareValue = new Date(a.created_at).getHours() * 60 + new Date(a.created_at).getMinutes() - 
                         (new Date(b.created_at).getHours() * 60 + new Date(b.created_at).getMinutes());
          break;
        case 'hints':
          compareValue = a.hints - b.hints;
          break;
        case 'duration':
          compareValue = a.time - b.time;
          break;
        case 'quote':
          compareValue = a.quote.localeCompare(b.quote);
          break;
        default:
          compareValue = 0;
      }
      return sortDirection === 'asc' ? compareValue : -compareValue
    });
  }, [profileData, difficultyFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedGames.length / entriesPerPage) // Calculate total pages
  const paginatedGames = filteredAndSortedGames.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  ) // Slice games for current page

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!profileData) return [];
    if (xAxisView === 'game') {
      let movesSum = 0;
      let timeSum = 0;
      return profileData.games
        .filter(game => difficultyFilter === 'all' || game.difficulty === difficultyFilter)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Sort from oldest to newest
        .map((game, index) => {
          movesSum += game.moves;
          timeSum += game.time;
          return {
            game: index + 1, // Start from 1 for the oldest game
            moves: game.moves,
            time: game.time,
            avgMoves: movesSum / (index + 1),
            avgTime: timeSum / (index + 1),
          };
        });
    } else {
      const dailyData: { [key: string]: { moves: number, time: number, count: number } } = {};
      profileData.games
        .filter(game => difficultyFilter === 'all' || game.difficulty === difficultyFilter)
        .forEach((game) => {
          const date = new Date(game.created_at).toLocaleDateString();
          if (!dailyData[date]) {
            dailyData[date] = { moves: 0, time: 0, count: 0 };
          }
          dailyData[date].moves += game.moves;
          dailyData[date].time += game.time;
          dailyData[date].count++;
        });
      return Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          moves: data.moves / data.count,
          time: data.time / data.count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
    }
  }, [profileData, difficultyFilter, xAxisView]);

  // Scroll chart to the end when data or view changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth;
    }
  }, [chartData, xAxisView])

  // Render loading skeleton while data is being fetched
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Render error message if there's an error or no profile data
  if (error || !profileData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">{error || 'Failed to load profile data'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* User Information Section */}
      <div className="text-center mb-6 text-white">
        <h1 className="text-6xl font-bold mb-4">{profileData.username}</h1>
        <div className="flex flex-col items-center justify-center">
          <div className="w-[calc(6*3rem+6*0.75rem)] mt-2">
            <GamePreview /> {/* Game preview component */}
          </div>
        </div>
        <p className="text-xl mb-6">Member since: {new Date(profileData.user_created_at).toLocaleDateString()}</p>
        <p className="text-xl mb-6">
          {difficultyFilter === 'all'
            ? `Total games played: ${profileData.games.length}`
            : `${difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)} games played: ${profileData.games.filter(game => game.difficulty === difficultyFilter).length}`}
        </p>
        {/* Difficulty Filter Buttons */}
        <div className="flex justify-center space-x-2 mb-6">
          <Button
            onClick={() => setDifficultyFilter('all')}
            variant={difficultyFilter === 'all' ? 'default' : 'outline'}
            className={difficultyFilter === 'all' ? '' : 'text-foreground'}
          >
            All
          </Button>
          <Button
            onClick={() => setDifficultyFilter('easy')}
            variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
            className={difficultyFilter === 'easy' ? '' : 'text-foreground'}
          >
            Easy
          </Button>
          <Button
            onClick={() => setDifficultyFilter('medium')}
            variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
            className={difficultyFilter === 'medium' ? '' : 'text-foreground'}
          >
            Medium
          </Button>
          <Button
            onClick={() => setDifficultyFilter('hard')}
            variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
            className={difficultyFilter === 'hard' ? '' : 'text-foreground'}
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Statistics and Charts Section */}
      <Card className="w-full max-w-6xl mx-auto overflow-auto max-h-[80vh] pt-6">
        <CardContent>
          {/* Averages Display */}
          {averages && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-xl text-center font-semibold mb-2 text-gray-900 dark:text-white">
                {difficultyFilter === 'all' ? 'Overall' : `${difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)}`} Averages
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
          )}

          {/* Chart Section */}
          <div className="flex flex-col items-center">
            <div className="w-full relative">
              {/* Y-Axis Labels */}
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
              {/* Chart Container */}
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
                      {/* Lines for Time and Moves */}
                      <Line yAxisId="left" type="monotone" dataKey="time" stroke="#8884d8" name="Time" strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="moves" stroke="#82ca9d" name="Moves" strokeWidth={3} />
                      {xAxisView === 'game' && (
                        <>
                          {/* Average Lines */}
                          <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="rgba(136, 132, 216, 0.5)" name="Avg Time" strokeWidth={3} />
                          <Line yAxisId="right" type="monotone" dataKey="avgMoves" stroke="rgba(130, 202, 157, 0.5)" name="Avg Moves" strokeWidth={3} />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Chart Legends */}
            <div className="flex flex-wrap justify-center mt-4">
              <div className="flex items-center mr-4 mb-2">
                <div className="w-4 h-4 bg-[#8884d8] mr-2"></div>
                <span>Time</span>
              </div>
              {xAxisView === 'game' && (
                <div className="flex items-center mr-4 mb-2">
                  <div className="w-4 h-4 bg-[rgba(136,132,216,0.5)] mr-2"></div>
                  <span>Avg Time</span>
                </div>
              )}
              <div className="flex items-center mr-4 mb-2">
                <div className="w-4 h-4 bg-[#82ca9d] mr-2"></div>
                <span>Moves</span>
              </div>
              {xAxisView === 'game' && (
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-[rgba(130,202,157,0.5)] mr-2"></div>
                  <span>Avg Moves</span>
                </div>
              )}
            </div>
          </div>

          {/* Chart View Toggle */}
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

          {/* Games Table */}
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">LATINham</TableHead>
                <TableHead className="w-20">Difficulty</TableHead>
                <TableHead 
                  className="w-24 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date
                  {sortColumn === 'date' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead 
                  className="w-16 cursor-pointer"
                  onClick={() => handleSort('time')}
                >
                  Time
                  {sortColumn === 'time' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
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
                <TableHead 
                  className="w-40 cursor-pointer"
                  onClick={() => handleSort('quote')}
                >
                  Quote
                  {sortColumn === 'quote' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="p-2">
                    <MiniProgressBar grid={game.grid} onClick={() => handleViewCompletedBoard(game)} /> {/* Mini grid preview */}
                  </TableCell>
                  <TableCell className="p-2">
                    <Badge 
                      className={
                        game.difficulty === 'easy' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : game.difficulty === 'medium' 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {game.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1 text-sm">{formatDate(game.created_at)}</TableCell> {/* Formatted date */}
                  <TableCell className="p-1 text-sm">{formatTime(game.created_at)}</TableCell> {/* Formatted time */}
                  <TableCell className="p-1 text-sm text-center">{game.moves}</TableCell> {/* Moves count */}
                  <TableCell className="p-1 text-sm text-center">{game.hints}</TableCell> {/* Hints count */}
                  <TableCell className="p-1 text-sm">{formatDuration(game.time)}</TableCell> {/* Formatted duration */}
                  <TableCell className="p-1 text-sm truncate">{game.quote}</TableCell> {/* Quote with truncation */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
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
      {/* Dialog for Viewing Completed Puzzle Details */}
      <Dialog open={!!selectedGame} onOpenChange={(open) => {
        if (!open) {
          setSelectedGame(null); // Clear selected game when dialog is closed
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Completed LATINham</DialogTitle>
            <DialogDescription>
              Details of the completed game
            </DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <CompletedPuzzleCard
              entry={{
                ...selectedGame,
                timestamp: selectedGame.created_at,
              }}
              difficulty={selectedGame.difficulty}
              gameNumber={profileData.games.findIndex(game => game.id === selectedGame.id) + 1}
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

// LoadingSkeleton component to display while data is loading
function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        <Skeleton className="h-8 w-[200px] mb-4" /> {/* Skeleton for username */}
        <Skeleton className="h-4 w-[150px] mb-2" /> {/* Skeleton for member since */}
        <Skeleton className="h-4 w-[180px] mb-6" /> {/* Skeleton for total games */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" /> ), {/* Skeleton rows for table */}
          )}
        </div>
      </CardContent>
    </Card>
  )
}
