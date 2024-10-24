import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  const [isQuoteValid, setIsQuoteValid] = useState(true)

  const MAX_QUOTE_LENGTH = 31

  useEffect(() => {
    setIsQuoteValid(quote.trim().length <= MAX_QUOTE_LENGTH)
  }, [quote])

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
    const trimmedQuote = quote.trim()
    if (trimmedQuote.length <= MAX_QUOTE_LENGTH) {
      onSubmit(trimmedQuote)
      setQuoteSubmitted(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && (!showQuoteInput || quoteSubmitted)) {
        onOpenChange(newOpen)
      }
    }}>
      <DialogContent className="sm:max-w-[425px] w-full bg-background">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {showQuoteInput && !quoteSubmitted ? "Enter Your Victory Quote" : "Congratulations!"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 px-4">
          {showQuoteInput && !quoteSubmitted ? (
            <div className="space-y-4">
              <p className="text-center">Enter a quote to commemorate your win:</p>
              <div className="space-y-2">
                <Input
                  placeholder="Enter your quote here"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  aria-label="Victory quote"
                  className={`w-full ${!isQuoteValid ? 'border-red-500' : ''}`}
                  maxLength={MAX_QUOTE_LENGTH}
                />
                <p className={`text-sm ${isQuoteValid ? 'text-gray-500' : 'text-red-500'}`}>
                  {quote.trim().length}/{MAX_QUOTE_LENGTH} characters
                </p>
              </div>
              <Button 
                onClick={handleSubmitQuote}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting || !isQuoteValid || quote.trim().length === 0}
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
                <p className="text-center text-gray-900 dark:text-white">Creating LatinHAM card...</p>
              )}
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => { onStartNewGame(); onOpenChange(false); }}
                  className="px-4 py-2"
                >
                  Start New Game
                </Button> 
                {imageFile && (
                  <Button 
                    onClick={handleDownload}
                    className="p-2"
                    aria-label="Download completed puzzle"
                  >
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