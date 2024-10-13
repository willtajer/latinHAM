'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { CompletedPuzzleCard } from './CompletedPuzzleCard'

interface GameEntry {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  moves: number
  time: number
  hints: number
  grid: number[] | number[][]
  initialGrid: number[] | number[][]
  quote: string
  created_at: string
}

interface UserProfileData {
  username: string
  user_created_at: string
  games: GameEntry[]
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

export function UserProfile() {
  const { user } = useUser()
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<'date' | 'moves' | 'time' | 'hints' | 'duration' | 'quote'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const entriesPerPage = 10

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return

      try {
        const response = await fetch(`/api/user-profile?userId=${user.id}`)
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
        setProfileData(processedData)
      } catch (err) {
        setError('Error loading profile data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  const ensureGrid2D = (grid: number[] | number[][]): number[][] => {
    if (Array.isArray(grid[0])) {
      return grid as number[][]
    }
    return convertTo2DArray(grid as number[])
  }

  const convertTo2DArray = (arr: number[]): number[][] => {
    const result: number[][] = []
    for (let i = 0; i < arr.length; i += 6) {
      result.push(arr.slice(i, i + 6))
    }
    return result
  }

  const handleSort = (column: 'date' | 'moves' | 'time' | 'hints' | 'duration' | 'quote') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleViewCompletedBoard = (game: GameEntry) => {
    setSelectedGame(game)
  }

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

  const totalPages = Math.ceil(filteredAndSortedGames.length / entriesPerPage)
  const paginatedGames = filteredAndSortedGames.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

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
      <Card className="w-full max-w-4xl mx-auto overflow-auto max-h-[80vh]">
        <CardHeader>
          <CardTitle>User Profile: {profileData.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Member since: {new Date(profileData.user_created_at).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">Total games played: {profileData.games.length}</p>
          </div>

          <div className="mb-4 flex justify-center space-x-2">
            <Button
              onClick={() => setDifficultyFilter('all')}
              variant={difficultyFilter === 'all' ? 'default' : 'outline'}
            >
              All
            </Button>
            <Button
              onClick={() => setDifficultyFilter('easy')}
              variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
            >
              Easy
            </Button>
            <Button
              onClick={() => setDifficultyFilter('medium')}
              variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
            >
              Medium
            </Button>
            <Button
              onClick={() => setDifficultyFilter('hard')}
              variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
            >
              Hard
            </Button>
          </div>

          {averages && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-xl text-center font-semibold mb-2 text-gray-900 dark:text-white">
                {difficultyFilter === 'all' ? 'Overall' : `${difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)}`} Averages
              </h3>
              <div className="grid grid-cols-3 gap-4 justify-items-center text-center">
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-400">Avg. Moves</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{averages.moves.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-400">Avg. Duration</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDuration(Math.round(averages.duration))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-400">Avg. Hints</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{averages.hints.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">latinHAM</TableHead>
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
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
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
                    <MiniProgressBar grid={game.grid as number[][]} onClick={() => handleViewCompletedBoard(game)} />
                  </TableCell>
                  <TableCell className="p-2">
                    <Badge variant={game.difficulty === 'easy' ? 'default' : game.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {game.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1 text-sm">{formatDate(game.created_at)}</TableCell>
                  <TableCell  className="p-1 text-sm">{formatTime(game.created_at)}</TableCell>
                  <TableCell className="p-1 text-sm text-center">{game.moves}</TableCell>
                  <TableCell className="p-1 text-sm text-center">{game.hints}</TableCell>
                  <TableCell className="p-1 text-sm">{formatDuration(game.time)}</TableCell>
                  <TableCell className="p-1 text-sm truncate">{game.quote}</TableCell>
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
              entry={{
                ...selectedGame,
                grid: selectedGame.grid as number[][],
                initialGrid: selectedGame.initialGrid as number[][],
                timestamp: selectedGame.created_at,
              }}
              difficulty={selectedGame.difficulty}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-[150px] mb-2" />
        <Skeleton className="h-4 w-[180px] mb-6" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}