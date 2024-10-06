import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  difficulty: "easy" | "medium" | "hard";
  onViewCompletedBoard: (entry: LeaderboardEntry) => void;
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
    </button>
  )
}

export function Leaderboard({ entries = [], difficulty, onViewCompletedBoard }: LeaderboardProps) {
  const [sortColumn, setSortColumn] = useState<'moves' | 'time'>('moves')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleSort = (column: 'moves' | 'time') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedEntries = [...entries].sort((a, b) => {
    const compareValue = sortColumn === 'moves' ? a.moves - b.moves : a.time - b.time
    return sortDirection === 'asc' ? compareValue : -compareValue
  })

  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage)
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  if (entries.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold mb-4 text-center">My {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} latinHAMs</h2>
        <p className="text-center">No entries available for {difficulty} difficulty.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-20">
      <h2 className="text-2xl font-bold mb-4 text-center">My {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} latinHAMs</h2>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead className="w-[calc(6*3rem+5*0.75rem)] text-center">latinHAM</TableHead>
              <TableHead 
                className="w-24 text-center cursor-pointer"
                onClick={() => handleSort('moves')}
              >
                Moves
                {sortColumn === 'moves' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                )}
              </TableHead>
              <TableHead 
                className="w-32 text-center cursor-pointer"
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
            {paginatedEntries.map((entry, index) => {
              const entryNumber = (currentPage - 1) * entriesPerPage + index + 1
              return (
                <TableRow key={entry.id || index}>
                  <TableCell className="font-medium text-center align-middle">{entryNumber}</TableCell>
                  <TableCell className="text-center py-2">
                    {entry.grid ? (
                      <MiniProgressBar 
                        grid={entry.grid} 
                        onClick={() => onViewCompletedBoard(entry)}
                      />
                    ) : (
                      <div>No grid data</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-center align-middle">{entry.moves || 'N/A'}</TableCell>
                  <TableCell className="text-center align-middle">{entry.time ? formatDuration(entry.time) : 'N/A'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
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
    </div>
  )
}