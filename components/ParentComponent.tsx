'use client'

import React, { useCallback, useRef } from 'react'
import LatinHamGame from './LatinHamGame'
import StickyButtonBar from './StickyButtonBar'

const ParentComponent: React.FC = () => {
  const triggerNewGameRef = useRef<(() => void) | null>(null)

  const handleStartNewGame = useCallback(() => {
    console.log('Start New Game triggered from StickyButtonBar')
    if (triggerNewGameRef.current) {
      triggerNewGameRef.current()
    } else {
      console.warn('New game trigger function not available')
    }
  }, [])

  return (
    <div className="relative min-h-screen pb-16">
      <LatinHamGame 
        onTriggerNewGame={(trigger) => {
          triggerNewGameRef.current = trigger
        }}
      />
      <StickyButtonBar onStartNewGame={handleStartNewGame} />
    </div>
  )
}

export default ParentComponent