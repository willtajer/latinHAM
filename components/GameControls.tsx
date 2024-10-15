// components/GameControls.tsx

import React from 'react'
import { Button } from '@/components/ui/button' // Importing a custom Button component
import { Trash2 } from 'lucide-react' // Importing the Trash2 icon from lucide-react

// Define the props for the GameControls component
interface GameControlsProps {
  handleNewGame: () => void          // Function to start a new game
  handleHint: () => void             // Function to toggle hints
  handleReset: () => void            // Function to reset the current game
  handleTrashToggle: () => void      // Function to toggle trash mode
  isGameWon: boolean                 // Flag indicating if the game has been won
  isTrashMode: boolean               // Flag indicating if trash mode is active
  hintsActive: boolean               // Flag indicating if hints are currently active
}

// GameControls component definition
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
    // Container div with flex layout to arrange buttons horizontally with spacing
    <div className="flex space-x-2 mb-8 pb-12">
      
      {/* Button to start a new game */}
      <Button
        onClick={handleNewGame}                       // Trigger handleNewGame on click
        variant="ghost"                               // Button style variant
        className="hover:bg-transparent focus:bg-transparent" // Additional styling for hover and focus states
      >
        New Game
      </Button>
      
      {/* Button to toggle hints; disabled if the game is won */}
      <Button
        onClick={handleHint}                          // Trigger handleHint on click
        variant="ghost"                               // Button style variant
        className="hover:bg-transparent focus:bg-transparent" // Additional styling
        disabled={isGameWon}                          // Disable button if the game is won
      >
        {hintsActive ? 'Hide Hints' : 'Hint'}         {/* Dynamic label based on hintsActive state */}
      </Button>
      
      {/* Button to reset the current game */}
      <Button
        onClick={handleReset}                         // Trigger handleReset on click
        variant="ghost"                               // Button style variant
        className="hover:bg-transparent focus:bg-transparent" // Additional styling
      >
        Reset
      </Button>
      
      {/* Button to toggle trash mode; changes appearance based on isTrashMode and isGameWon */}
      <Button
        onClick={handleTrashToggle}                   // Trigger handleTrashToggle on click
        variant={isTrashMode ? "destructive" : "ghost"} // Change variant if trash mode is active
        className="hover:bg-transparent focus:bg-transparent" // Additional styling
        disabled={isGameWon}                          // Disable button if the game is won
      >
        <Trash2 className="w-4 h-4" />                {/* Display the Trash2 icon */}
      </Button>
      
    </div>
  )
}
