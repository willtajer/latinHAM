'use client'

import { useEffect } from 'react' // Importing useEffect hook from React
import { useUser } from '@clerk/nextjs' // Importing useUser hook from Clerk for authentication

// Define the structure of a game entry
interface GameEntry {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  moves: number
  time: number
  grid: number[][]
  initialGrid: number[][]
  quote: string
  hints: number
  timestamp: string
}

// LoginHandler component to synchronize game history upon user login
export function LoginHandler() {
  // Destructure user and isLoaded from useUser hook
  const { user, isLoaded } = useUser()

  // useEffect to trigger game history synchronization when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      syncGameHistory() // Call the synchronization function
    }
  }, [isLoaded, user]) // Dependency array: runs when isLoaded or user changes

  // Function to synchronize game history from localStorage to the server
  const syncGameHistory = async () => {
    // Retrieve game history from localStorage, parse it as an array of GameEntry
    const localHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]') as GameEntry[]
    
    // If there are no game entries, exit the function
    if (localHistory.length === 0) return

    try {
      // Send a POST request to the sync API with the local game history
      const response = await fetch('/api/sync-game-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ games: localHistory }), // Send games in the request body
      })

      if (response.ok) { // If the response is successful
        const { syncedGames } = await response.json() // Extract synced games from the response
        // Update localStorage with the synced games returned from the server
        localStorage.setItem('gameHistory', JSON.stringify(syncedGames))
        console.log('Game history synced successfully') // Log success message
      } else {
        console.error('Failed to sync game history') // Log error if response is not OK
      }
    } catch (error) {
      console.error('Error syncing game history:', error) // Log any errors that occur during fetch
    }
  }

  return null // This component does not render any UI
}
