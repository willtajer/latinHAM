// components/ViewCompletedPuzzleDialog.tsx
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GameBoard } from './GameBoard'
import { formatTime } from '../utils/formatTime'
import { LeaderboardEntry } from '../types'

interface ViewCompletedPuzzleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: LeaderboardEntry | null
  onClose: () => void
  onDownload: (entry: LeaderboardEntry) => void
}

export const ViewCompletedPuzzleDialog: React.FC<ViewCompletedPuzzleDialogProps> = ({
  open,
  onOpenChange,
  entry,
  onClose,
  onDownload
}) => {
  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completed Puzzle</DialogTitle>
        </DialogHeader>
        <GameBoard
          grid={entry.grid}
          locked={Array(6).fill(Array(6).fill(true))}
          edited={Array(6).fill(Array(6).fill(false))}
          hints={Array(6).fill(Array(6).fill(false))}
          showNumbers={false}
          onCellClick={() => {}}
          isTrashMode={false}
        />
        <div className="mt-4">
          <p>Moves: {entry.moves}</p>
          <p>Time: {formatTime(entry.time)}</p>
          <p>Hints: {entry.hints}</p>
          <p>Quote: &quot;{entry.quote}&quot;</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={() => onDownload(entry)}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}