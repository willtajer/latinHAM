import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry } from '../types'
import { Download, RefreshCw } from 'lucide-react'

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
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)

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

  const handleSubmitQuote = () => {
    onSubmit(quote)
    setQuoteSubmitted(true)
    onOpenChange(false)
  }

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      if (showQuoteInput && !quoteSubmitted) {
        // If closing without submitting a quote, submit an empty quote
        onSubmit("")
        setQuoteSubmitted(true)
      }
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={`text-center ${showQuoteInput && !quoteSubmitted ? "" : "text-2xl font-bold"}`}>
            {showQuoteInput && !quoteSubmitted ? "Enter Your Victory Quote" : "Congratulations!"}
          </DialogTitle>
        </DialogHeader>
        {showQuoteInput && !quoteSubmitted ? (
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
                onClick={handleSubmitQuote}
                className="w-full sm:w-auto bg-red-500 text-white hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : (quote.trim() ? "Submit" : "Skip")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              {entry && (
                <CompletedPuzzleCard 
                  entry={{
                    ...entry,
                    quote: quoteSubmitted ? quote : entry.quote
                  }}
                  difficulty={difficulty} 
                  onImageReady={(dataUrl) => {
                    setImageDataUrl(dataUrl)
                  }}
                />
              )}
            </div>
            <DialogFooter className="flex flex-col items-center gap-4 justify-center">
              <div className="flex justify-center w-full gap-4">
                <Button onClick={() => { onStartNewGame(); onOpenChange(false); }} className="inline-flex items-center px-4 py-2">
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