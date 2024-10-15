import React from 'react'
import Link from 'next/link'

// Define the props for the GameHeader component
interface GameHeaderProps {
  gameState: 'start' | 'playing' | 'won' | 'viewing' // Current state of the game
  isGameWon: boolean                               // Flag indicating if the game has been won
  onNewGame: () => void                            // Function to start a new game (unused in this component)
}

// GameHeader component definition
export const GameHeader: React.FC<GameHeaderProps> = ({ gameState, isGameWon }) => {
  return (
    // Container div with specific width and vertical margins
    <div className="w-[calc(6*3rem+6*0.75rem)] mt-16 mb-6">
      
      {/* Link component to navigate back to the home page */}
      <Link href="/" passHref>
        {/* Header title styled with large font, bold weight, centered text, and hover effect */}
        <h1 className="text-6xl font-bold mb-6 text-center cursor-pointer hover:text-primary transition-colors duration-200">
          latinHAM
        </h1>
      </Link>
      
      {/* Paragraph displaying dynamic messages based on game state */}
      <p className="text-center mt-4">
        {gameState === 'viewing' 
          ? "Viewing a completed puzzle from the leaderboard."  // Message when viewing a completed puzzle
          : isGameWon
          ? "Congratulations! You've completed the puzzle."     // Message when the game is won
          : "Click on a cell to cycle through colors. Each color should appear once per row and column."} // Instructional message during gameplay
      </p>
    </div>
  )
}
