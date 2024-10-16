import React from 'react'
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, Lightbulb } from "lucide-react"

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
  handleHint,
  handleReset,
  handleTrashToggle,
  isGameWon,
  isTrashMode,
  hintsActive
}) => {
  return (
    <div className="flex justify-center space-x-2 mt-4">
      {/* <Button
        onClick={handleNewGame}
        variant="outline"
        size="icon"
        aria-label="New Game"
      >
        <Plus className="h-4 w-4" />
      </Button> */}
      <Button
        onClick={handleReset}
        variant="outline"
        size="icon"
        disabled={isGameWon}
        aria-label="Reset"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleHint}
        variant="outline"
        size="icon"
        disabled={isGameWon}
        aria-label="Hint"
        className={hintsActive ? "bg-yellow-200" : ""}
      >
        <Lightbulb className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleTrashToggle}
        variant="outline"
        size="icon"
        disabled={isGameWon}
        aria-label="Toggle Trash Mode"
        className={isTrashMode ? "bg-red-200" : ""}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}