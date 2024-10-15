import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleImageReady = (file: File) => {
    setImageFile(file)
  }

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

  if (!entry) return null

  return (
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
            gameNumber={parseInt(entry.id)}
            onImageReady={handleImageReady}
          />
        </div>
        <DialogFooter className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleDownload} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
            aria-label="Download completed puzzle"
            disabled={!imageFile}
          >
            <Download className="h-5 w-5 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}