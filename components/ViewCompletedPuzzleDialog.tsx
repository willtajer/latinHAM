import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry } from '../types'
import { Download } from 'lucide-react'

interface ViewCompletedPuzzleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: LeaderboardEntry | null
  difficulty: 'easy' | 'medium' | 'hard'
}

export const ViewCompletedPuzzleDialog: React.FC<ViewCompletedPuzzleDialogProps> = ({
  open,
  onOpenChange,
  entry,
  difficulty
}) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

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

  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Completed Puzzle</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CompletedPuzzleCard 
            entry={entry} 
            difficulty={difficulty} 
            onImageReady={setImageDataUrl}
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button onClick={handleDownload} className="inline-flex items-center p-2" aria-label="Download completed puzzle">
            <Download className="h-5 w-5 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}