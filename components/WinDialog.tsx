// components/WinDialog.tsx
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface WinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (quote: string) => void
  quote: string
  setQuote: (quote: string) => void
}

export const WinDialog: React.FC<WinDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  quote,
  setQuote
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Congratulations! You won!</DialogTitle>
        </DialogHeader>
        <p>Enter a quote to commemorate your victory:</p>
        <Input
          placeholder="Enter your quote here"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={() => onSubmit(quote)}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}