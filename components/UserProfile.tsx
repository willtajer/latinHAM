'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface GameEntry {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  moves: number
  time: number
  grid: number[][]
  initialGrid: number[][]
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

const MiniProgressBar: React.FC<{ grid: number[][] }> = ({ grid }) => {
  if (!Array.isArray(grid) || grid.length === 0) {
    console.error('Invalid grid data:', grid)
    return null
  }

  return (
    <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-6 h-6 ${cell !== 0 ? colorClasses[cell - 1] : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500'}`}
            />
          ))}
        </div>
      ))}
    </div>
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
  const entriesPerPage = 10

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return

      try {
        const response = await fetch(`/api/user-profile?userId=${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        setError('Error loading profile data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

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
          <TableHeader>
            <TableRow>
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
              <TableHead className="w-[calc(6*3rem+5*0.75rem)]">latinHAM</TableHead>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGames.map((game) => (
              <TableRow key={game.id}>
                <TableCell>{new Date(game.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={game.difficulty === 'easy' ? 'default' : game.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                    {game.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <MiniProgressBar grid={game.grid} />
                </TableCell>
                <TableCell>{game.moves}</TableCell>
                <TableCell>{formatDuration(game.time)}</TableCell>
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