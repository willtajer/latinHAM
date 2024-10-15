import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry } from '../types'
import { Download } from 'lucide-react'

// Props interface defining the expected properties for the dialog
interface ViewCompletedPuzzleDialogProps {
  open: boolean // Controls whether the dialog is open
  onOpenChange: (open: boolean) => void // Callback when dialog open state changes
  entry: LeaderboardEntry | null // The game entry to display
  difficulty: 'easy' | 'medium' | 'hard' // Difficulty level of the game
}

// Functional component for viewing a completed puzzle in a dialog
export const ViewCompletedPuzzleDialog: React.FC<ViewCompletedPuzzleDialogProps> = ({
  open,
  onOpenChange,
  entry,
  difficulty
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null) // State to store the image file for download

  // Handler to set the image file when it's ready
  const handleImageReady = (file: File) => {
    setImageFile(file)
  }

  // Handler to download the completed puzzle image
  const handleDownload = () => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile) // Create a temporary URL for the file
      const link = document.createElement('a') // Create an anchor element
      link.href = url
      link.download = imageFile.name // Set the download attribute with the file name
      document.body.appendChild(link) // Append the link to the body
      link.click() // Programmatically click the link to trigger download
      document.body.removeChild(link) // Remove the link from the body
      URL.revokeObjectURL(url) // Revoke the temporary URL
    }
  }

  if (!entry) return null // If there's no entry, don't render the dialog

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        {/* Dialog Header with Title and Description */}
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">LATINham Identified!</DialogTitle>
          <DialogDescription className="mt-2">
            View your LATINham puzzle and game statistics.
          </DialogDescription>
        </DialogHeader>
        
        {/* Completed Puzzle Card Display */}
        <div className="py-4 flex justify-center">
          <CompletedPuzzleCard 
            entry={entry} 
            difficulty={difficulty}
            gameNumber={parseInt(entry.id)} // Assuming gameNumber is derived from entry ID
            onImageReady={handleImageReady} // Callback when the image is ready
          />
        </div>
        
        {/* Dialog Footer with Download Button */}
        <DialogFooter className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleDownload} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
            aria-label="Download completed puzzle"
            disabled={!imageFile} // Disable button if image is not ready
          >
            <Download className="h-5 w-5 mr-2" /> {/* Download Icon */}
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Optional: Separate component for loading skeletons (if used elsewhere)
// function LoadingSkeleton() {
//   return (
//     <Card className="w-full max-w-4xl mx-auto">
//       <CardContent>
//         <Skeleton className="h-8 w-[200px] mb-4" />
//         <Skeleton className="h-4 w-[150px] mb-2" />
//         <Skeleton className="h-4 w-[180px] mb-6" />
//         <div className="space-y-2">
//           {[...Array(5)].map((_, i) => (
//             <Skeleton key={i} className="h-12 w-full" />
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
