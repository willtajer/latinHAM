import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry } from '../types'
import { Download } from 'lucide-react'

interface WinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (quote: string) => void
  quote: string
  setQuote: (quote: string) => void
  entry?: LeaderboardEntry
  gameNumber: number
  difficulty: 'easy' | 'medium' | 'hard'
  onStartNewGame: () => void
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
  showQuoteInput,
  isSubmitting = false
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)

  const handleDownload = () => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      const link = document.createElement('a')
      link.href = url
      link.download = imageFile.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleSubmitQuote = () => {
    onSubmit(quote)
    setQuoteSubmitted(true)
  }

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      if (showQuoteInput && !quoteSubmitted) {
        onSubmit("")
      }
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px] w-full bg-background">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {showQuoteInput && !quoteSubmitted ? "Enter Your Victory Quote" : "Congratulations!"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 px-4">
          {showQuoteInput && !quoteSubmitted ? (
            <div className="space-y-4">
              <p className="text-center">Enter a quote to commemorate your victory:</p>
              <Input
                placeholder="Enter your quote here"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                aria-label="Victory quote"
                className="w-full"
              />
              <Button 
                onClick={handleSubmitQuote}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : (quote.trim() ? "Submit" : "Skip")}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {entry ? (
                <CompletedPuzzleCard 
                  entry={{
                    ...entry,
                    quote: quoteSubmitted ? quote : entry.quote
                  }}
                  difficulty={difficulty}
                  gameNumber={gameNumber}
                  onImageReady={(file: File) => {
                    setImageFile(file)
                  }}
                />
              ) : (
                <p className="text-center">Thank you for playing!</p>
              )}
              <div className="flex justify-center gap-4">
                <Button onClick={() => { onStartNewGame(); handleDialogClose(false); }} className="px-4 py-2">
                  Start New Game
                </Button> 
                {imageFile && (
                  <Button onClick={handleDownload} className="p-2" aria-label="Download completed puzzle">
                    <Download className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}