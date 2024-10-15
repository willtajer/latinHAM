'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Importing table components
import { Card, CardContent } from "@/components/ui/card" // Importing Card components
import { Badge } from "@/components/ui/badge" // Importing Badge component for displaying difficulty levels
import { ChevronUp, ChevronDown } from 'lucide-react' // Importing icons for sort indicators
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination" // Importing Pagination components
import { LeaderboardEntry } from '../types' // Importing the LeaderboardEntry type
import { Button } from "@/components/ui/button" // Importing Button component
import { CompletedPuzzleCard } from './CompletedPuzzleCard' // Importing CompletedPuzzleCard component for dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // Importing Dialog components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts' // Importing Recharts components for data visualization
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" // Importing RadioGroup components for view selection
import { Label } from "@/components/ui/label" // Importing Label component

// Define the props for the Leaderboard component
interface LeaderboardProps {
  initialDifficulty?: "all" | "easy" | "medium" | "hard"; // Optional prop to set initial difficulty filter
  onDifficultyChange: (newDifficulty: "all" | "easy" | "medium" | "hard") => void; // Callback when difficulty changes
}

// Array of CSS classes for different cell colors in MiniProgressBar
const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

// MiniProgressBar component to display a small grid representation
const MiniProgressBar: React.FC<{ grid: number[][], onClick: () => void }> = ({ grid, onClick }) => {
  // Validate grid data
  if (!Array.isArray(grid) || grid.length === 0) {
    console.error('Invalid grid data:', grid)
    return null // Return nothing if grid is invalid
  }

  return (
    // Button to make the progress bar clickable
    <button onClick={onClick} className="w-full">
      {/* Grid layout for the progress bar */}
      <div className="grid grid-cols-6 gap-px bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg shadow-inner" style={{ aspectRatio: '1 / 1', width: '48px' }}>
        {/* Flatten the grid array and map each cell to a div with appropriate color */}
        {grid.flat().map((cell, index) => (
          <div
            key={index} // Unique key for each cell
            className={`${cell !== 0 ? colorClasses[cell - 1] : 'bg-white dark:bg-gray-600'}`} // Apply color based on cell value
          />
        ))}
      </div>
    </button>
  )
}

// Utility function to format a date string into MM/DD/YY format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`;
}

// Main Leaderboard component
export default function Component({ initialDifficulty = "all", onDifficultyChange }: LeaderboardProps) {
  // State variables for leaderboard entries, loading status, errors, filters, sorting, pagination, and selected game
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">(initialDifficulty)
  const [sortColumn, setSortColumn] = useState<'moves' | 'date' | 'hints' | 'duration' | 'difficulty'>('moves')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGame, setSelectedGame] = useState<LeaderboardEntry | null>(null)
  const [xAxisView, setXAxisView] = useState<'game' | 'daily'>('game') // State to toggle between game and daily view for the chart
  const entriesPerPage = 10 // Number of entries per pagination page
  const chartRef = useRef<HTMLDivElement>(null) // Ref for the chart container to handle scrolling

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true) // Start loading
      try {
        // Fetch data for all difficulties concurrently
        const [easyData, mediumData, hardData] = await Promise.all([
          fetch('/api/leaderboard?difficulty=easy').then(res => res.json()),
          fetch('/api/leaderboard?difficulty=medium').then(res => res.json()),
          fetch('/api/leaderboard?difficulty=hard').then(res => res.json())
        ])
        const allData = [...easyData, ...mediumData, ...hardData] // Combine all data
        setEntries(allData) // Set entries state
      } catch (err) {
        setError('Failed to fetch leaderboard data') // Set error message
        console.error(err) // Log error to console
      } finally {
        setIsLoading(false) // End loading
      }
    }

    fetchLeaderboard() // Invoke the fetch function
  }, [])

  // Utility function to format time from seconds to "Xm Ys" format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Handler to manage sorting when a table header is clicked
  const handleSort = (column: 'moves' | 'date' | 'hints' | 'duration' | 'difficulty') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') // Toggle sort direction if same column is clicked
    } else {
      setSortColumn(column) // Set new sort column
      setSortDirection('asc') // Default to ascending order
    }
  }

  // Memoized filtered entries based on selected difficulty
  const filteredEntries = useMemo(() => {
    return difficulty === 'all' ? entries : entries.filter(entry => entry.difficulty === difficulty)
  }, [entries, difficulty])

  // Memoized sorted entries based on selected sort column and direction
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
      return sortDirection === 'asc' ? compareValue : -compareValue // Adjust sort direction
    });
  }, [filteredEntries, sortColumn, sortDirection]);

  // Memoized chart data based on the selected X-axis view (game or daily)
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

  // Effect to scroll the chart into view when chart data or view changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth;
    }
  }, [chartData, xAxisView])

  // Calculate total number of pagination pages
  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage)
  // Slice the sorted entries to get the entries for the current page
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  // Memoized averages for moves, duration, and hints
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

  // Handler to set the selected game for viewing in the dialog
  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    setSelectedGame(entry)
  }, [])

  // Handler to change the difficulty filter
  const handleDifficultyChange = useCallback((newDifficulty: "all" | "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty) // Update difficulty state
    setCurrentPage(1) // Reset to first page
    onDifficultyChange(newDifficulty) // Invoke callback prop
  }, [onDifficultyChange])

  // Conditional rendering for the loading state
  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard entries...</div>
  }

  // Conditional rendering for the error state
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  // Conditional rendering if there are no entries
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
      {/* Difficulty Filter Buttons */}
      <div className="text-center mb-6">
        <p className="text-xl mb-4 text-white">
          {difficulty === 'all'
            ? `Total games played: ${entries.length}`
            : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} games played: ${entries.filter(entry => entry.difficulty === difficulty).length}`}
        </p>
        <div className="flex justify-center space-x-2 mb-6">
          {/* Button to filter all difficulties */}
          <Button
            onClick={() => handleDifficultyChange('all')}
            variant={difficulty === 'all' ? 'default' : 'outline'}
          >
            All
          </Button>
          {/* Button to filter easy difficulty */}
          <Button
            onClick={() => handleDifficultyChange('easy')}
            variant={difficulty === 'easy' ? 'default' : 'outline'}
          >
            Easy
          </Button>
          {/* Button to filter medium difficulty */}
          <Button
            onClick={() => handleDifficultyChange('medium')}
            variant={difficulty === 'medium' ? 'default' : 'outline'}
          >
            Medium
          </Button>
          {/* Button to filter hard difficulty */}
          <Button
            onClick={() => handleDifficultyChange('hard')}
            variant={difficulty === 'hard' ? 'default' : 'outline'}
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Leaderboard Statistics and Chart */}
      <Card className="w-full max-w-6xl mx-auto overflow-auto max-h-[80vh] pt-6">
        <CardContent>
          {/* Averages Section */}
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
                <p className="text-lg font-bold text-gray-950 dark:text-white">{formatTime(Math.round(averages.duration))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Avg. Hints</p>
                <p className="text-lg font-bold text-gray-950 dark:text-white">{averages.hints.toFixed(2)}</p>
              </div>
            </div>
          </div>

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
              {/* Chart Container with horizontal scrolling */}
              <div ref={chartRef} className="overflow-x-auto ml-8 mr-8" style={{ width: 'calc(100% - 4rem)' }}>
                <div className="w-full" style={{ minWidth: `${Math.max(chartData.length * 50, 1000)}px` }}>
                  {/* Responsive Container for the LineChart */}
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" /> {/* Grid lines */}
                      <XAxis 
                        dataKey={xAxisView === 'game' ? 'game' : 'date'} // Dynamic X-axis based on view
                        label={{ value: xAxisView === 'game' ? 'Game Number' : 'Date', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis yAxisId="left" /> {/* Left Y-axis for Time */}
                      <YAxis yAxisId="right" orientation="right" /> {/* Right Y-axis for Moves */}
                      <Tooltip /> {/* Tooltip for data points */}
                      {/* Line for Time */}
                      <Line yAxisId="left" type="monotone" dataKey="time" stroke="#8884d8" name="Time" strokeWidth={3} />
                      {/* Line for Moves */}
                      <Line yAxisId="right" type="monotone" dataKey="moves" stroke="#82ca9d" name="Moves" strokeWidth={3} />
                      {xAxisView === 'game' && (
                        <>
                          {/* Line for Average Time */}
                          <Line yAxisId="left"  type="monotone" dataKey="avgTime"  stroke="rgba(136, 132, 216, 0.5)" name="Avg Time"  strokeWidth={3} />
                          {/* Line for Average Moves */}
                          <Line yAxisId="right" type="monotone" dataKey="avgMoves" stroke="rgba(130, 202, 157, 0.5)" name="Avg Moves" strokeWidth={3} />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Legend for the Chart */}
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

          {/* Radio Buttons to switch between Game and Daily view for the chart */}
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

          {/* Leaderboard Table */}
          <Table className="w-full">
            {/* Table Header with sortable columns */}
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
            {/* Table Body with leaderboard entries */}
            <TableBody>
              {paginatedEntries.map((entry, index) => (
                <TableRow key={entry.id}>
                  {/* Rank Cell */}
                  <TableCell className="p-2 text-center">{(currentPage - 1) * entriesPerPage + index + 1}</TableCell>
                  {/* Date Cell */}
                  <TableCell className="p-1 text-sm">{formatDate(entry.timestamp)}</TableCell>
                  {/* Minigrid Cell with MiniProgressBar */}
                  <TableCell className="p-2">
                    <MiniProgressBar grid={entry.grid} onClick={() => handleViewCompletedBoard(entry)} />
                  </TableCell>
                  {/* Difficulty Cell with Badge */}
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
                  {/* User Cell */}
                  <TableCell className="p-1 text-sm">{entry.username || 'Anonymous'}</TableCell>
                  {/* Moves Cell */}
                  <TableCell className="p-1 text-sm text-center">{entry.moves}</TableCell>
                  {/* Hints Cell */}
                  <TableCell className="p-1 text-sm text-center">{entry.hints || 0}</TableCell>
                  {/* Duration Cell */}
                  <TableCell className="p-1 text-sm">{formatTime(entry.time)}</TableCell>
                  {/* Quote Cell */}
                  <TableCell className="p-1 text-sm truncate max-w-xs">{entry.quote || 'No quote'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                {/* Previous Page Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {/* Page Number Buttons */}
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
                {/* Next Page Button */}
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
            <DialogTitle>Completed latinHAM</DialogTitle>
            <DialogDescription>
              Details of the completed game
            </DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <CompletedPuzzleCard
              entry={selectedGame} // Pass the selected game entry
              difficulty={selectedGame.difficulty} // Pass the difficulty level
              gameNumber={sortedEntries.findIndex(entry => entry.id === selectedGame.id) + 1} // Calculate game number
              onImageReady={(file: File) => {
                console.log('Image ready:', file.name); // Callback when image is ready
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
