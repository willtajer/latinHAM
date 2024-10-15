'use client'

import React, { useCallback, useRef } from 'react' // Importing React and necessary hooks
import LatinHamGame from './LatinHamGame' // Importing the LatinHamGame component
import StickyButtonBar from './StickyButtonBar' // Importing the StickyButtonBar component

// Define the ParentComponent as a React Functional Component
const ParentComponent: React.FC = () => {
  // useRef to store a reference to the triggerNewGame function from LatinHamGame
  const triggerNewGameRef = useRef<(() => void) | null>(null)

  // useCallback to memoize the handleStartNewGame function
  const handleStartNewGame = useCallback(() => {
    console.log('Start New Game triggered from StickyButtonBar') // Log message for debugging
    if (triggerNewGameRef.current) { // Check if the trigger function is available
      triggerNewGameRef.current() // Invoke the triggerNewGame function to start a new game
    } else {
      console.warn('New game trigger function not available') // Warn if the trigger function is not set
    }
  }, []) // Empty dependency array ensures this callback is created only once

  return (
    <div className="relative min-h-screen"> {/* Container div with relative positioning and minimum height */}
      <LatinHamGame 
        onTriggerNewGame={(trigger) => { // Prop to receive the triggerNewGame function from LatinHamGame
          triggerNewGameRef.current = trigger // Assign the received trigger function to the ref
        }}
      />
      <StickyButtonBar onStartNewGame={handleStartNewGame} /> {/* Render StickyButtonBar with the start game handler */}
    </div>
  )
}

export default ParentComponent // Export the ParentComponent as the default export
