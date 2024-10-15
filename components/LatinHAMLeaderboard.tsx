'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { LatinHAM, LeaderboardEntry } from '@/types' // Importing type definitions for LatinHAM and LeaderboardEntry
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Importing table components for building the leaderboard
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog' // Importing a dialog component to view completed puzzles
import { ChevronUp, ChevronDown } from 'lucide-react' // Importing icons for indicating sort order

// Define the props for the LatinHAMLeaderboard component
interface LatinHAMLeaderboardProps {
  latinHAM: LatinHAM; // The specific LatinHAM game instance for which the leaderboard is displayed
}

// Define the possible fields by which the leaderboard can be sorted
type SortField = 'username' | 'moves' | 'time' | 'quote' | 'timestamp';
// Define the sort order types
type SortOrder = 'asc' | 'desc';

// LatinHAMLeaderboard component definition
export default function LatinHAMLeaderboard({ latinHAM }: LatinHAMLeaderboardProps) {
  // State to hold the fetched leaderboard entries
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  // State to manage the loading status
  const [isLoading, setIsLoading] = useState(true)
  // State to handle any errors during data fetching
  const [error, setError] = useState<string | null>(null)
  // State to manage the currently selected puzzle for viewing in the dialog
  const [selectedPuzzle, setSelectedPuzzle] = useState<LeaderboardEntry | null>(null)
  // State to control the visibility of the completed puzzle dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // State to manage the current field by which the leaderboard is sorted
  const [sortField, setSortField] = useState<SortField>('timestamp')
  // State to manage the current sort order (ascending or descending)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // useEffect hook to fetch leaderboard entries when the component mounts or when latinHAM changes
  useEffect(() => {
    const fetchLeaderboardEntries = async () => {
      setIsLoading(true) // Start loading
      try {
        // Fetch leaderboard data from the API based on the initialGrid and difficulty of the current LatinHAM
        const response = await fetch(`/api/leaderboard?initialGrid=${JSON.stringify(latinHAM.initialGrid)}&difficulty=${latinHAM.difficulty}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`) // Throw an error if the response is not OK
        }
        const data: LeaderboardEntry[] = await response.json() // Parse the JSON response
        // Filter entries to include only those that match the initialGrid of the current LatinHAM
        setLeaderboardEntries(data.filter((entry: LeaderboardEntry) => 
          JSON.stringify(entry.initialGrid) === JSON.stringify(latinHAM.initialGrid)
        ))
      } catch (error) {
        console.error('Error fetching leaderboard entries:', error) // Log any errors to the console
        setError('Failed to load leaderboard entries. Please try again later.') // Set an error message for the user
      } finally {
        setIsLoading(false) // End loading regardless of success or failure
      }
    }

    fetchLeaderboardEntries() // Invoke the data fetching function
  }, [latinHAM]) // Dependency array includes latinHAM to refetch if it changes

  // Utility function to format time from seconds to "Xm Ys" format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60) // Calculate minutes
    const remainingSeconds = seconds % 60 // Calculate remaining seconds
    return `${minutes}m ${remainingSeconds}s` // Return formatted time string
  }

  // Utility function to format a date string to a readable date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString) // Create a Date object from the string
    return date.toLocaleDateString() // Return the locale-specific date string
  }

  // Utility function to format a date string to a readable time of day
  const formatTimeOfDay = (dateString: string) => {
    const date = new Date(dateString) // Create a Date object from the string
    return date.toLocaleTimeString() // Return the locale-specific time string
  }

  // Handler to open the dialog for viewing a completed puzzle
  const handleViewCompletedBoard = (entry: LeaderboardEntry) => {
    setSelectedPuzzle(entry) // Set the selected puzzle entry
    setIsDialogOpen(true) // Open the dialog
  }

  // MiniGameBoard component to display a small version of the game grid
  const MiniGameBoard: React.FC<{ initialGrid: number[][] }> = ({ initialGrid }) => {
    // Check if the initialGrid is valid
    if (!initialGrid || initialGrid.length === 0) {
      return <div className="text-red-500">Error: Invalid grid data</div>; // Display an error message if invalid
    }

    // Array of CSS classes corresponding to different cell colors
    const colorClasses = [
      'bg-red-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
    ]

    return (
      // Container div with fixed width and height
      <div className="w-[288px] h-[288px]">
        {/* Grid layout for the mini game board */}
        <div className="grid grid-cols-6 gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner w-full h-full">
          {/* Iterate over each row in the initialGrid */}
          {initialGrid.map((row, rowIndex) =>
            // Iterate over each cell in the current row
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`} // Unique key for each cell
                className={`
                  aspect-square flex items-center justify-center
                  relative transition-all duration-150 ease-in-out rounded-md shadow-sm
                  ${cell !== 0 ? colorClasses[cell - 1] : 'bg-white dark:bg-gray-600'} // Set background color based on cell value
                  ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'} // Set border based on cell value
                `}
                role="cell" // Accessibility role
                aria-label={`Cell value ${cell || 'Empty'}`} // Accessibility label
              />
            ))
          )}
        </div>
      </div>
    )
  }

  // MiniProgressBar component to display a small progress bar of the grid
  const MiniProgressBar: React.FC<{ grid: number[][], onClick: () => void }> = ({ grid, onClick }) => {
    // Validate grid data
    if (!Array.isArray(grid) || grid.length === 0) {
      console.error('Invalid grid data:', grid) // Log error to console
      return null // Return null to render nothing
    }
  
    return (
      // Button wrapping the progress bar for interactivity
      <button onClick={onClick} className="w-full">
        {/* Grid layout for the progress bar */}
        <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg shadow-inner">
          {/* Iterate over each row in the grid */}
          {grid.map((row, rowIndex) => (
            // Iterate over each cell in the current row
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`} // Unique key for each cell
                  className={`w-4 h-4 ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500'}`} // Set background color and border based on cell value
                />
              ))}
            </div>
          ))}
        </div>
      </button>
    )
  }

  // useMemo hook to calculate average moves, time, and hints from leaderboard entries
  const averages = useMemo(() => {
    const totalMoves = leaderboardEntries.reduce((sum, entry) => sum + entry.moves, 0) // Sum of all moves
    const totalDuration = leaderboardEntries.reduce((sum, entry) => sum + entry.time, 0) // Sum of all times
    const totalHints = leaderboardEntries.reduce((sum, entry) => sum + (entry.hints || 0), 0) // Sum of all hints
    const count = leaderboardEntries.length // Number of entries

    return {
      moves: count > 0 ? totalMoves / count : 0, // Average moves
      duration: count > 0 ? totalDuration / count : 0, // Average time
      hints: count > 0 ? totalHints / count : 0, // Average hints
    }
  }, [leaderboardEntries])

  // useMemo hook to filter and sort unique leaderboard entries
  const uniqueSortedEntries = useMemo(() => {
    // Remove duplicate entries based on the grid configuration, keeping the earliest entry
    const uniqueEntries = leaderboardEntries.reduce((acc, entry) => {
      const gridKey = JSON.stringify(entry.grid);
      if (!acc[gridKey] || new Date(entry.timestamp) < new Date(acc[gridKey].timestamp)) {
        acc[gridKey] = entry;
      }
      return acc;
    }, {} as Record<string, LeaderboardEntry>);

    // Sort the entries based on the selected sort field and order
    return Object.values(uniqueEntries).sort((a, b) => {
      if (sortField === 'timestamp') {
        // Sort by timestamp
        return sortOrder === 'asc'
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortField === 'username' || sortField === 'quote') {
        // Sort alphabetically for username and quote
        return sortOrder === 'asc'
          ? (a[sortField] || '').localeCompare(b[sortField] || '')
          : (b[sortField] || '').localeCompare(a[sortField] || '');
      }
      // Sort numerically for moves and time
      return sortOrder === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
    });
  }, [leaderboardEntries, sortField, sortOrder]);

  // Handler to manage sorting when a table header is clicked
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') // Toggle sort order if the same field is clicked
    } else {
      setSortField(field) // Set new sort field
      setSortOrder('asc') // Default to ascending order
    }
  }

  // Conditional rendering for the loading state
  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard entries...</div>
  }

  // Conditional rendering for the error state
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Left section displaying the mini game board and statistics */}
        <div className="w-full md:w-auto flex flex-col items-center md:items-start">
          <MiniGameBoard initialGrid={latinHAM.initialGrid} /> {/* Display the mini game board */}
          {/* Container for game difficulty and average statistics */}
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-left w-full md:w-[288px]">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-300">
              <div>
                <p><strong>Difficulty:</strong> {latinHAM.difficulty}</p> {/* Display the difficulty level */}
                <p><strong>Solved:</strong> {latinHAM.solveCount} time{latinHAM.solveCount !== 1 ? 's' : ''}</p> {/* Display how many times solved */}
                <p><strong>Best Moves:</strong> {latinHAM.bestMoves}</p> {/* Display the best (fewest) moves */}
                <p><strong>Best Time:</strong> {formatTime(latinHAM.bestTime)}</p> {/* Display the best (shortest) time */}
              </div>
              <div>
                <p><strong>Avg. Moves:</strong> {averages.moves.toFixed(2)}</p> {/* Display average moves */}
                <p><strong>Avg. Time:</strong> {formatTime(Math.round(averages.duration))}</p> {/* Display average time */}
                <p><strong>Avg. Hints:</strong> {averages.hints.toFixed(2)}</p> {/* Display average hints */}
              </div>
            </div>
          </div>
        </div>
        {/* Right section displaying the leaderboard table */}
        <div className="w-full md:flex-1 overflow-x-auto">
          {uniqueSortedEntries.length > 0 ? (
            <Table>
              {/* Table header with sortable columns */}
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
              {/* Table body displaying leaderboard entries */}
              <TableBody>
                {uniqueSortedEntries.map((entry, index) => (
                  <TableRow 
                    key={entry.id || index} // Unique key for each row
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {/* Cell displaying a mini progress bar of the puzzle grid */}
                    <TableCell className="w-[120px]">
                      <MiniProgressBar 
                        grid={entry.grid} 
                        onClick={() => handleViewCompletedBoard(entry)} // Open dialog on click
                      />
                    </TableCell>
                    {/* Cell displaying the username */}
                    <TableCell className="whitespace-nowrap">{entry.username || 'Anonymous'}</TableCell>
                    {/* Cell displaying the number of moves */}
                    <TableCell>{entry.moves}</TableCell>
                    {/* Cell displaying the elapsed time */}
                    <TableCell>{formatTime(entry.time)}</TableCell>
                    {/* Cell displaying the user's quote */}
                    <TableCell className="max-w-xs truncate">{entry.quote || 'No quote provided'}</TableCell>
                    {/* Cell displaying the time of day the game was completed */}
                    <TableCell>{formatTimeOfDay(entry.timestamp)}</TableCell>
                    {/* Cell displaying the date the game was completed */}
                    <TableCell>{formatDate(entry.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            // Message displayed if no leaderboard entries are found
            <div className="text-center py-8">No leaderboard entries found for this LatinHAM.</div>
          )}
        </div>
      </div>
      {/* Dialog to view details of a selected completed puzzle */}
      {selectedPuzzle && (
        <ViewCompletedPuzzleDialog
          open={isDialogOpen} // Controls the visibility of the dialog
          onOpenChange={setIsDialogOpen} // Handler to change the dialog's open state
          entry={selectedPuzzle} // The selected leaderboard entry to display
          difficulty={latinHAM.difficulty} // Pass the difficulty level to the dialog
        />
      )}
    </div>
  )
}