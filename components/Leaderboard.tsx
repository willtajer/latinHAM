import React from 'react'
import { Button } from '@/components/ui/button'
import { formatTime } from '../utils/formatTime'
import { LeaderboardEntry } from '../types'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  difficulty: 'easy' | 'medium' | 'hard'
  onViewCompletedBoard: (entry: LeaderboardEntry) => void
  onDownloadCompletedBoard: (entry: LeaderboardEntry) => void
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  difficulty,
  onViewCompletedBoard,
  onDownloadCompletedBoard
}) => {
  return (
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Leaderboard ({difficulty})</h2>
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="py-2 px-4 text-left">Rank</th>
              <th className="py-2 px-4 text-left">Moves</th>
              <th className="py-2 px-4 text-left">Time</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id} className="border-t border-border">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{entry.moves}</td>
                <td className="py-2 px-4">{formatTime(entry.time)}</td>
                <td className="py-2 px-4">
                  <Button
                    onClick={() => onViewCompletedBoard(entry)}
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => onDownloadCompletedBoard(entry)}
                    variant="ghost"
                    size="sm"
                  >
                    Download
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}