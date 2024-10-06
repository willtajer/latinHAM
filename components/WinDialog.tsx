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
  gameNumber?: number
  difficulty: 'easy' | 'medium' | 'hard'
  onStartNewGame: () => void
  showQuoteInput: boolean
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
  showQuoteInput
}) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{showQuoteInput ? "Enter Your Victory Quote" : "Congratulations!"}</DialogTitle>
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
              <Button onClick={() => onSubmit(quote)} className="w-full sm:w-auto">Submit</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <CompletedPuzzleCard 
                entry={entry!} 
                difficulty={difficulty} 
                onImageReady={setImageDataUrl}
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button onClick={onStartNewGame} className="inline-flex items-center px-4 py-2">
                Start New Game
              </Button>
              <Button onClick={handleDownload} className="inline-flex items-center p-2" aria-label="Download completed puzzle">
                <Download className="h-5 w-5 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}