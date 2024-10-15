'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card' // Importing Card components for layout
import { Button } from '@/components/ui/button' // Importing Button component for user interactions
import Confetti from 'react-confetti' // Importing Confetti for celebratory effects
import { useLearningGameLogic } from '@/hooks/useLearningGameLogic' // Importing custom hook for game logic

// Define the props for the LearningModeGame component
interface LearningModeGameProps {
  onComplete: () => void // Callback function to be called when the game is completed
  onRestart: () => void // Callback function to be called when the game is restarted
}

// LearningModeGame component definition
export function LearningModeGame({ onComplete, onRestart }: LearningModeGameProps) {
  // State to control whether cell colors should be displayed
  const [showColors, setShowColors] = useState(false)
  // State to control whether confetti should be shown
  const [showConfetti, setShowConfetti] = useState(false)
  // State to determine if the component is running on the client side
  const [isClient, setIsClient] = useState(false)

  // Destructure game-related state and functions from the custom hook
  const {
    grid, // 2D array representing the game grid
    locked, // 2D array indicating which cells are locked (uneditable)
    isComplete, // Boolean indicating if the game is complete
    moveCount, // Number of moves made by the player
    handleCellClick, // Function to handle cell click events
    resetGame, // Function to reset the game state
  } = useLearningGameLogic()

  // useEffect to handle side effects related to game completion
  useEffect(() => {
    setIsClient(true) // Set isClient to true when the component mounts
    // If the game is complete and confetti hasn't been shown yet
    if (isComplete && !showConfetti) {
      onComplete() // Invoke the onComplete callback
      setShowColors(true) // Enable color display for cells
      setShowConfetti(true) // Trigger confetti effect
    }
  }, [isComplete, onComplete, showConfetti]) // Dependencies: isComplete, onComplete, showConfetti

  // Handler to restart the game
  const handleRestart = () => {
    resetGame() // Reset the game state using the custom hook
    setShowColors(false) // Hide cell colors
    setShowConfetti(false) // Hide confetti
    onRestart() // Invoke the onRestart callback
  }

  // Utility function to determine the CSS class for a cell based on its value
  const getColorClass = (value: number) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500'] // Define color classes
    return colors[value - 1] || 'bg-transparent' // Return the corresponding color or transparent if out of range
  }

  // If not running on the client (e.g., during server-side rendering), render nothing or a placeholder
  if (!isClient) {
    return null // Alternatively, you can return a loading spinner here
  }

  return (
    // Card component to contain the game interface
    <Card className="w-full max-w-[300px]">
      <CardContent className="p-4">
        {/* Grid layout for the game cells */}
        <div className="grid grid-cols-3 gap-2">
          {/* Iterate over each row in the grid */}
          {grid.map((row, rowIndex) => (
            // Iterate over each cell in the current row
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`} // Unique key for each cell
                className={`
                  w-full aspect-square rounded-lg flex items-center justify-center text-4xl font-bold transition-all duration-300
                  ${locked[rowIndex][colIndex] ? 'cursor-not-allowed' : 'cursor-pointer'} // Change cursor based on cell lock status
                  ${showColors ? getColorClass(cell) : 'bg-transparent'} // Apply color if showColors is true
                  ${isComplete ? 'text-white' : ''} // Change text color if the game is complete
                  border-4 border-gray-700 hover:border-gray-500 // Border styles with hover effect
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)} // Handle cell click event
                disabled={locked[rowIndex][colIndex] || isComplete} // Disable button if cell is locked or game is complete
              >
                {cell !== 0 && cell} {/* Display cell value if it's not zero */}
              </button>
            ))
          ))}
        </div>
        {/* Display the number of moves made */}
        <p className="mt-4 text-center">Moves: {moveCount}</p>
        {/* Restart button */}
        <div className="flex justify-center space-x-2 mt-4">
          <Button onClick={handleRestart} variant="default" size="sm">
            {isComplete ? "Play Again" : "Restart"} {/* Button label changes based on game completion */}
          </Button>
        </div>
      </CardContent>
      {/* Display confetti if on the client and showConfetti is true */}
      {isClient && showConfetti && (
        <Confetti
          width={window.innerWidth} // Set confetti width to window width
          height={window.innerHeight} // Set confetti height to window height
          recycle={false} // Disable recycling of confetti pieces
          numberOfPieces={200} // Number of confetti pieces
        />
      )}
    </Card>
  )
}
