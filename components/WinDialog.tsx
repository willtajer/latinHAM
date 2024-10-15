import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry } from '../types'
import { Download } from 'lucide-react'

// Props interface defining the expected properties for the WinDialog component
interface WinDialogProps {
  open: boolean // Controls whether the dialog is open
  onOpenChange: (open: boolean) => void // Callback when dialog open state changes
  onSubmit: (quote: string) => void // Function to handle quote submission
  quote: string // Current value of the quote input
  setQuote: (quote: string) => void // Function to update the quote state
  entry?: LeaderboardEntry // Optional leaderboard entry data
  gameNumber: number // Number indicating the game number
  difficulty: 'easy' | 'medium' | 'hard' // Difficulty level of the game
  onStartNewGame: () => void // Function to start a new game
  showQuoteInput: boolean // Determines whether to show the quote input field
  isSubmitting?: boolean // Indicates if the quote is being submitted
}

// Functional component for the WinDialog
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
  const [imageFile, setImageFile] = useState<File | null>(null) // State to store the image file for download
  const [quoteSubmitted, setQuoteSubmitted] = useState(false) // State to track if the quote has been submitted

  // Handler to manage the download of the completed puzzle image
  const handleDownload = () => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile) // Create a temporary URL for the image file
      const link = document.createElement('a') // Create an anchor element
      link.href = url
      link.download = imageFile.name // Set the download attribute with the image file name
      document.body.appendChild(link) // Append the link to the document body
      link.click() // Programmatically click the link to trigger the download
      document.body.removeChild(link) // Remove the link from the document body
      URL.revokeObjectURL(url) // Revoke the temporary URL to free up memory
    }
  }

  // Handler to submit the victory quote
  const handleSubmitQuote = () => {
    onSubmit(quote) // Call the onSubmit prop with the current quote
    setQuoteSubmitted(true) // Update the state to indicate the quote has been submitted
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Only allow closing the dialog if quote input is not shown or the quote has been submitted
      if (!newOpen && (!showQuoteInput || quoteSubmitted)) {
        onOpenChange(newOpen)
      }
    }}>
      <DialogContent className="sm:max-w-[425px] w-full bg-background">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {/* Conditionally render the title based on whether the quote input is shown and if the quote has been submitted */}
            {showQuoteInput && !quoteSubmitted ? "Enter Your Victory Quote" : "Congratulations!"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 px-4">
          {showQuoteInput && !quoteSubmitted ? (
            // Render the quote input form if showQuoteInput is true and the quote hasn't been submitted
            <div className="space-y-4">
              <p className="text-center">Enter a quote to commemorate your win:</p>
              <Input
                placeholder="Enter your quote here" // Placeholder text for the input field
                value={quote} // Bind the input value to the quote state
                onChange={(e) => setQuote(e.target.value)} // Update the quote state on input change
                aria-label="Victory quote" // Accessibility label for screen readers
                className="w-full" // Full width styling
              />
              <Button 
                onClick={handleSubmitQuote} // Handle quote submission on button click
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90" // Tailwind CSS classes for styling
                disabled={isSubmitting} // Disable the button if the quote is being submitted
              >
                {/* Conditionally render button text based on submission state and quote content */}
                {isSubmitting ? "Submitting..." : (quote.trim() ? "Submit" : "Skip")}
              </Button>
            </div>
          ) : (
            // Render the completed puzzle and action buttons if not showing the quote input or if the quote has been submitted
            <div className="space-y-6">
              {entry ? (
                // If an entry exists, display the CompletedPuzzleCard
                <CompletedPuzzleCard 
                  entry={{
                    ...entry,
                    quote: quoteSubmitted ? quote : entry.quote // Use the submitted quote if available
                  }}
                  difficulty={difficulty} // Pass the difficulty level
                  gameNumber={gameNumber} // Pass the game number
                  onImageReady={(file: File) => {
                    setImageFile(file) // Update the imageFile state when the image is ready
                  }}
                />
              ) : (
                // If no entry exists, display a loading message
                <p className="text-center">Creating latinHAM card...</p>
              )}
              {/* Action buttons for starting a new game and downloading the completed puzzle */}
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => { onStartNewGame(); onOpenChange(false); }} // Start a new game and close the dialog on click
                  className="px-4 py-2" // Padding for the button
                >
                  Start New Game
                </Button> 
                {imageFile && (
                  // If the imageFile exists, show the download button
                  <Button 
                    onClick={handleDownload} // Handle the download on button click
                    className="p-2" // Padding for the button
                    aria-label="Download completed puzzle" // Accessibility label
                  >
                    <Download className="h-5 w-5" /> {/* Download icon from lucide-react */}
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
