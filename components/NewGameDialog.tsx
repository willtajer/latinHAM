// components/NewGameDialog.tsx
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface NewGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const NewGameDialog: React.FC<NewGameDialogProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Game?</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to start a new game? Your current progress will be lost.</p>
        <DialogFooter className="sm:space-x-2">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="sm:w-auto">Cancel</Button>
            <Button onClick={onConfirm} className="sm:w-auto">Confirm</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}