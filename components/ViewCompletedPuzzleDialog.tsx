import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry } from '../types'
import { Download, RefreshCw, Plus } from 'lucide-react'
import { NewGameDialog } from './NewGameDialog'

interface ViewCompletedPuzzleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: LeaderboardEntry | null
  difficulty: 'easy' | 'medium' | 'hard'
  onResetGame: (initialGrid: number[][]) => void
  onStartNewGame: () => void
}

export const ViewCompletedPuzzleDialog: React.FC<ViewCompletedPuzzleDialogProps> = ({
  open,
  onOpenChange,
  entry,
  difficulty,
  onResetGame,
  onStartNewGame
}) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(false)

  const handleDownload = () => {
    if (imageDataUrl && entry) {
      const link = document.createElement('a')
      link.href = imageDataUrl
      link.download = `latinHAM_${difficulty}_game${entry.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleResetGame = () => {
    if (entry && entry.initialGrid) {
      onResetGame(entry.initialGrid)
      onOpenChange(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStartNewGame = () => {
    setIsNewGameDialogOpen(true)
  }

  const handleConfirmNewGame = () => {
    setIsNewGameDialogOpen(false)
    onStartNewGame()
    onOpenChange(false)
  }

  if (!entry) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold">latinHAM Identified!</DialogTitle>
            <DialogDescription className="mt-2">
              View your latinHAM puzzle and game statistics.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            <CompletedPuzzleCard 
              entry={entry} 
              difficulty={difficulty} 
              onImageReady={setImageDataUrl}
            />
          </div>
          <DialogFooter className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleResetGame} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
              aria-label="Reset and play this puzzle"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={handleStartNewGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white" 
              aria-label="Start a new game"
            >
              <Plus className="h-5 w-5 mr-2" />
              Start New Game
            </Button>
            <Button 
              onClick={handleDownload} 
              variant="outline"
              className="w-full" 
              aria-label="Download completed puzzle"
            >
              <Download className="h-5 w-5 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NewGameDialog
        open={isNewGameDialogOpen}
        onOpenChange={setIsNewGameDialogOpen}
        onConfirm={handleConfirmNewGame}
      />
    </>
  )
}