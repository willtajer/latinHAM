import React from 'react'
import { Button } from '@/components/ui/button'

// Define the props for the DifficultySelector component
interface DifficultySelectorProps {
  // Callback function to handle difficulty selection
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void
}

// DifficultySelector component definition
export function DifficultySelector({ onSelectDifficulty }: DifficultySelectorProps) {
  return (
    // Container div with flex layout to center buttons and add spacing
    <div className="flex justify-center space-x-4 mt-4">
      {/* Button for selecting 'Easy' difficulty */}
      <Button onClick={() => onSelectDifficulty('easy')}>Easy</Button>
      
      {/* Button for selecting 'Medium' difficulty */}
      <Button onClick={() => onSelectDifficulty('medium')}>Medium</Button>
      
      {/* Button for selecting 'Hard' difficulty */}
      <Button onClick={() => onSelectDifficulty('hard')}>Hard</Button>
    </div>
  )
}
