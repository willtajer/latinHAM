import React from 'react' // Importing React to use JSX and React functionalities
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog' // Importing Dialog components for building the modal
import { Button } from '@/components/ui/button' // Importing Button component for user interactions

// Define the props interface for the NewGameDialog component
interface NewGameDialogProps {
  open: boolean // Determines whether the dialog is open or closed
  onOpenChange: (open: boolean) => void // Callback function to handle changes in the dialog's open state
  onConfirm: () => void // Callback function to handle the confirmation action
}

// NewGameDialog component definition
export const NewGameDialog: React.FC<NewGameDialogProps> = ({
  open, // Destructure 'open' prop to control dialog visibility
  onOpenChange, // Destructure 'onOpenChange' prop to handle dialog state changes
  onConfirm // Destructure 'onConfirm' prop to handle confirmation action
}) => {
  return (
    // Dialog component acts as the modal container
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent wraps the main content of the dialog */}
      <DialogContent>
        {/* DialogHeader contains the title and description */}
        <DialogHeader>
          {/* DialogTitle displays the main heading of the dialog */}
          <DialogTitle>Start a New Game?</DialogTitle>
          {/* DialogDescription provides additional information or context */}
          <DialogDescription>
            Starting a new game will reset your current progress. Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>
        {/* DialogFooter contains action buttons */}
        <DialogFooter>
          {/* Container for the action buttons with centered alignment and spacing */}
          <div className="flex justify-center w-full space-x-2">
            {/* Cancel button to close the dialog without taking action */}
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
            {/* Confirm button to proceed with starting a new game */}
            <Button onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
