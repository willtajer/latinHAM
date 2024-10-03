import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Eye, Download } from 'lucide-react'

export interface LeaderboardEntry {
  timestamp: string
  moves: number
  time: number
  hints: number
  grid: number[][]
  initialGrid: number[][]
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  difficulty: 'easy' | 'medium' | 'hard'
  onViewCompletedBoard: (entry: LeaderboardEntry) => void
  onDownloadCompletedBoard: (entry: LeaderboardEntry, rank: number) => void
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
  return (
    <div className="grid grid-cols-6 bg-gray-200 p-2 rounded-lg shadow-inner">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-6 h-6 ${cell !== 0 ? colorClasses[cell - 1] : 'bg-white border border-gray-300'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Leaderboard({ entries, difficulty, onViewCompletedBoard, onDownloadCompletedBoard }: LeaderboardProps) {
  const [sortColumn, setSortColumn] = useState<keyof LeaderboardEntry>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedEntries = [...entries].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (column: keyof LeaderboardEntry) => {
    if (column === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit'
    })
    return `${time} ${formattedDate}`
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Top 10 - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead className="w-40">
                <Button variant="ghost" onClick={() => handleSort('timestamp')} className="w-full justify-start">
                  Date & Time <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[calc(6*3rem+5*0.75rem)] text-center">Completed Board</TableHead>
              <TableHead className="w-24 text-center">
                <Button variant="ghost" onClick={() => handleSort('moves')} className="w-full justify-center">
                  Moves <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-24 text-center">
                <Button variant="ghost" onClick={() => handleSort('hints')} className="w-full justify-center">
                  Hints <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map((entry, index) => (
              <TableRow key={entry.timestamp}>
                <TableCell className="font-medium text-center align-middle">{index + 1}</TableCell>
                <TableCell className="align-middle">{formatDateTime(entry.timestamp)}</TableCell>
                <TableCell className="text-center py-2">
                  <div className="flex justify-center">
                    <MiniProgressBar grid={entry.grid} />
                  </div>
                </TableCell>
                <TableCell className="text-center align-middle">{entry.moves}</TableCell>
                <TableCell className="text-center align-middle">{entry.hints}</TableCell>
                <TableCell className="text-center align-middle">
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onViewCompletedBoard(entry)}>
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDownloadCompletedBoard(entry, index + 1)}>
                      <Download className="w-4 h-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}