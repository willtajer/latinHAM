import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LeaderboardEntry } from '@/types'
import { Play, RotateCcw } from 'lucide-react'

interface ViewCompletedPuzzleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: LeaderboardEntry | null
  difficulty: string
  onResetGame: (initialGrid: number[][]) => void
  onStartNewGame: () => void
}

export function ViewCompletedPuzzleDialog({
  open,
  onOpenChange,
  entry,
  difficulty,
  onResetGame,
  onStartNewGame
}: ViewCompletedPuzzleDialogProps) {
  if (!entry) return null

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleResetGame = () => {
    if (entry.initialGrid) {
      onResetGame(entry.initialGrid)
    }
    onOpenChange(false)
  }

  const handleStartNewGame = () => {
    onStartNewGame()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Completed Puzzle</DialogTitle>
          <DialogDescription>
            Difficulty: {difficulty}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner">
            {entry.grid.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-8 h-8 ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600'} border border-gray-300 dark:border-gray-500`}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="text-sm">
            <p>Moves: {entry.moves}</p>
            <p>Time: {formatTime(entry.time)}</p>
            <p>Quote: {entry.quote || 'No quote provided'}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button onClick={handleResetGame} className="flex items-center">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}