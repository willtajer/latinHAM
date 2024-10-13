'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
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
      <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg shadow-inner" style={{ aspectRatio: '1 / 1', width: '60%' }}>
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

export function UserProfile() {
  const { user } = useUser()
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<'date' | 'moves' | 'time'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null)
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
        // Ensure grid and initialGrid are 2D arrays
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

  const handleSort = (column: 'date' | 'moves' | 'time') => {
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

  const sortedGames = [...profileData.games].sort((a, b) => {
    let compareValue: number;
    switch (sortColumn) {
      case 'date':
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'moves':
        compareValue = a.moves - b.moves;
        break;
      case 'time':
        compareValue = a.time - b.time;
        break;
      default:
        compareValue = 0;
    }
    return sortDirection === 'asc' ? compareValue : -compareValue
  })

  const totalPages = Math.ceil(sortedGames.length / entriesPerPage)
  const paginatedGames = sortedGames.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

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
          <Table>
            <TableHead>
              <TableRow>
                <TableHead className="w-16">latinHAM</TableHead>
                <TableHead 
                  className="w-32 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date
                  {sortColumn === 'date' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead 
                  className="w-24 cursor-pointer"
                  onClick={() => handleSort('moves')}
                >
                  Moves
                  {sortColumn === 'moves' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead 
                  className="w-32 cursor-pointer"
                  onClick={() => handleSort('time')}
                >
                  Duration
                  {sortColumn === 'time' && (
                    sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead>Hints</TableHead>
                <TableHead>Quote</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <MiniProgressBar grid={game.grid as number[][]} onClick={() => handleViewCompletedBoard(game)} />
                  </TableCell>
                  <TableCell>{new Date(game.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={game.difficulty === 'easy' ? 'default' : game.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {game.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{game.moves}</TableCell>
                  <TableCell>{formatDuration(game.time)}</TableCell>
                  <TableCell>{game.hints}</TableCell>
                  <TableCell>{game.quote}</TableCell>
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
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
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
                timestamp: selectedGame.created_at
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