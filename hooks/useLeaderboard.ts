import { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '../types'
import { useUser } from '@clerk/nextjs'

// Custom hook to manage leaderboard data based on difficulty level
export function useLeaderboard(difficulty: 'easy' | 'medium' | 'hard') {
  // State to store leaderboard entries for each difficulty
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  
  // Retrieve the current user using Clerk's useUser hook
  const { user } = useUser()

  // Function to fetch leaderboard data from the server
  const fetchLeaderboard = useCallback(async () => {
    try {
      // Fetch leaderboard data for the specified difficulty
      const response = await fetch(`/api/leaderboard?difficulty=${difficulty}`)
      
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Parse the JSON data from the response
      const data = await response.json()
      console.log('Fetched leaderboard data:', data)
      
      // Update the leaderboard state with the fetched data
      setLeaderboard(prevState => ({
        ...prevState,
        [difficulty]: data
      }))
    } catch (error) {
      // Log any errors that occur during the fetch
      console.error('Failed to fetch leaderboard:', error)
    }
  }, [difficulty]) // Recreate the function only if difficulty changes

  // useEffect to fetch leaderboard data when the component mounts or difficulty changes
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Function to handle submitting a victory quote to the leaderboard
  const handleQuoteSubmit = useCallback(async (quote: string, entry: LeaderboardEntry) => {
    // If the user is not logged in, skip submission
    if (!user) {
      console.log('User not logged in, skipping leaderboard submission')
      return
    }

    try {
      // Send a POST request to save the game data along with the quote
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          difficulty,
          quote,
          userId: user.id,
          username: user.username || user.firstName || 'Anonymous' // Use available username or default
        }),
      })
      
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Parse the JSON data from the response
      const result = await response.json()
      console.log('Save game result:', result)
      
      // Refresh the leaderboard after saving the game
      await fetchLeaderboard()
    } catch (error) {
      // Log any errors that occur during the submission
      console.error('Failed to save game:', error)
    }
  }, [difficulty, fetchLeaderboard, user]) // Recreate the function if difficulty, fetchLeaderboard, or user changes

  // Function to handle viewing a completed game's details
  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    console.log('Viewing completed board:', entry)
    // Additional logic for viewing the completed board can be added here
  }, []) // Function does not depend on any external variables

  // Return the leaderboard data and handler functions for use in components
  return {
    leaderboard,
    handleQuoteSubmit,
    handleViewCompletedBoard,
  }
}
