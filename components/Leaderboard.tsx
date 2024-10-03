import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Download } from 'lucide-react'

export interface LeaderboardEntry {
  timestamp: string
  moves: number
  time: number
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const rankedEntries = [...entries].sort((a, b) => a.moves - b.moves)

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Top 10 - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 text-center">Moves</TableHead>
              <TableHead className="w-[calc(6*3rem+5*0.75rem)] text-center">Completed Board</TableHead>
              <TableHead className="w-40 text-center">Date & Time</TableHead>
              <TableHead className="w-32 text-center">Duration</TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedEntries.map((entry, index) => (
              <TableRow key={entry.timestamp}>
                <TableCell className="text-center align-middle">{entry.moves}</TableCell>
                <TableCell className="text-center align-middle">{formatDuration(entry.time)}</TableCell>
                <TableCell className="text-center py-2">
                  <div className="flex justify-center">
                    <MiniProgressBar grid={entry.grid} />
                  </div>
                </TableCell>
                <TableCell className="text-center align-middle">{formatDateTime(entry.timestamp)}</TableCell>
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