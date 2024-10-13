import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry } from '../types'
import { Download, RefreshCw, X } from 'lucide-react'

interface WinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (quote: string) => void
  quote: string
  setQuote: (quote: string) => void
  entry?: LeaderboardEntry
  gameNumber?: number
  difficulty: 'easy' | 'medium' | 'hard'
  onStartNewGame: () => void
  onResetGame: (initialGrid: number[][]) => void
  showQuoteInput: boolean
  isSubmitting?: boolean
}

export const WinDialog: React.FC<WinDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  quote,
  setQuote,
  entry,
  gameNumber,
  difficulty,
  onStartNewGame,
  onResetGame,
  showQuoteInput,
  isSubmitting = false
}) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(true)

  const handleDownload = () => {
    if (imageDataUrl) {
      const link = document.createElement('a')
      link.href = imageDataUrl
      link.download = `latinHAM_${difficulty}_game${gameNumber}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleResetGame = () => {
    if (entry && entry.initialGrid) {
      onResetGame(entry.initialGrid)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={`text-center ${showQuoteInput ? "" : "text-2xl font-bold"}`}>
            {showQuoteInput ? "Enter Your Victory Quote" : "Congratulations!"}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        {showQuoteInput ? (
          <>
            <div className="py-4">
              <p className="text-center mb-4">Enter a quote to commemorate your victory:</p>
              <Input
                placeholder="Enter your quote here"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                aria-label="Victory quote"
                className="w-full"
              />
            </div>
            <DialogFooter className="flex justify-center">
              <Button 
                onClick={() => onSubmit(quote)} 
                className="w-full sm:w-auto"
                disabled={isSubmitting || isImageLoading}
              >
                {isSubmitting || isImageLoading ? "Loading..." : "Submit"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <CompletedPuzzleCard 
                entry={entry!} 
                difficulty={difficulty} 
                onImageReady={(dataUrl) => {
                  setImageDataUrl(dataUrl)
                  setIsImageLoading(false)
                }}
              />
            </div>
            <DialogFooter className="flex flex-col items-center gap-4 justify-center">
              <div className="flex justify-center w-full gap-4">
                <Button onClick={onStartNewGame} className="inline-flex items-center px-4 py-2">
                  Start New Game
                </Button> 
                <Button onClick={handleResetGame} className="inline-flex items-center p-2" aria-label="Reset and play this puzzle">
                  <RefreshCw className="h-5 w-5" />
                </Button>
                <Button onClick={handleDownload} className="inline-flex items-center p-2" aria-label="Download completed puzzle">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}