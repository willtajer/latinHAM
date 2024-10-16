'use client'

import React, { useCallback, useRef } from 'react'
import LatinHamGame from './LatinHamGame'
import StickyButtonBar from './StickyButtonBar'

const ParentComponent: React.FC = () => {
  const triggerNewGameRef = useRef<((initialGrid?: number[][]) => void) | null>(null)

  const handleStartNewGame = useCallback((initialGrid?: number[][]) => {
    console.log('Start New Game triggered from StickyButtonBar', initialGrid)
    if (triggerNewGameRef.current) {
      triggerNewGameRef.current(initialGrid)
    } else {
      console.warn('New game trigger function not available')
    }
  }, [])

  return (
    <div className="relative min-h-screen">
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