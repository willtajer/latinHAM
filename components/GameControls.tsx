// components/GameControls.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface GameControlsProps {
  handleNewGame: () => void
  handleHint: () => void
  handleReset: () => void
  handleTrashToggle: () => void
  isGameWon: boolean
  isTrashMode: boolean
  hintsActive: boolean
}

export const GameControls: React.FC<GameControlsProps> = ({
  handleNewGame,
  handleHint,
  handleReset,
  handleTrashToggle,
  isGameWon,
  isTrashMode,
  hintsActive
}) => {
  return (
    <div className="flex space-x-2 mb-8">
      <Button onClick={handleNewGame} variant="ghost" className="hover:bg-transparent focus:bg-transparent">New Game</Button>
      <Button onClick={handleHint} variant="ghost" className="hover:bg-transparent focus:bg-transparent" disabled={isGameWon}>
        {hintsActive ? 'Hide Hints' : 'Hint'}
      </Button>
      <Button onClick={handleReset} variant="ghost" className="hover:bg-transparent focus:bg-transparent">Reset</Button>
      <Button onClick={handleTrashToggle} variant={isTrashMode ? "destructive" : "ghost"} className="hover:bg-transparent focus:bg-transparent" disabled={isGameWon}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}