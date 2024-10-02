import React from 'react'
import { Button } from '@/components/ui/button'

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void
}

export function DifficultySelector({ onSelectDifficulty }: DifficultySelectorProps) {
  return (
    <div className="flex justify-center space-x-4 mt-4">
      <Button onClick={() => onSelectDifficulty('easy')}>Easy</Button>
      <Button onClick={() => onSelectDifficulty('medium')}>Medium</Button>
      <Button onClick={() => onSelectDifficulty('hard')}>Hard</Button>
    </div>
  )
}