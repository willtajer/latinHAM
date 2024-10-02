import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from 'lucide-react'

export interface LeaderboardEntry {
  timestamp: string
  moves: number
  time: number
  hints: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export function Leaderboard({ entries, difficulty }: LeaderboardProps) {
  const [sortColumn, setSortColumn] = useState<keyof LeaderboardEntry>('moves')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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
      setSortDirection('asc')
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
    <div className="w-full max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Top 10 - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">Rank</TableHead>
              <TableHead className="w-40">
                <Button variant="ghost" onClick={() => handleSort('timestamp')} className="w-full justify-start">
                  Time & Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-24 text-center">
                <Button variant="ghost" onClick={() => handleSort('moves')} className="w-full justify-center">
                  Moves <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-24 text-center">
                <Button variant="ghost" onClick={() => handleSort('time')} className="w-full justify-center">
                  Duration <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-24 text-center">
                <Button variant="ghost" onClick={() => handleSort('hints')} className="w-full justify-center">
                  Hints <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map((entry, index) => (
              <TableRow key={entry.timestamp}>
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
                <TableCell className="text-center">{entry.moves}</TableCell>
                <TableCell className="text-center">{formatTime(entry.time)}</TableCell>
                <TableCell className="text-center">{entry.hints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}