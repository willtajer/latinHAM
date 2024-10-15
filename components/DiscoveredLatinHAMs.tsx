'use client'

import React, { useState, useEffect, useCallback } from 'react'
import LatinHAMGrid from './LatinHAMGrid'
import LatinHAMLeaderboard from './LatinHAMLeaderboard'
import { LatinHAM } from '@/types'
import { GamePreview } from './GamePreview'
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs'

// DifficultyFilters component for selecting difficulty levels
const DifficultyFilters: React.FC<{
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard';
  setDifficultyFilter: React.Dispatch<React.SetStateAction<'all' | 'easy' | 'medium' | 'hard'>>;
}> = ({ difficultyFilter, setDifficultyFilter }) => (
  <div className="flex justify-center space-x-2 mb-8">
    {/* Button to select 'All' difficulties */}
    <Button
      onClick={() => setDifficultyFilter('all')}
      variant={difficultyFilter === 'all' ? 'default' : 'outline'}
    >
      All
    </Button>
    {/* Button to select 'Easy' difficulty */}
    <Button
      onClick={() => setDifficultyFilter('easy')}
      variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
    >
      Easy
    </Button>
    {/* Button to select 'Medium' difficulty */}
    <Button
      onClick={() => setDifficultyFilter('medium')}
      variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
    >
      Medium
    </Button>
    {/* Button to select 'Hard' difficulty */}
    <Button
      onClick={() => setDifficultyFilter('hard')}
      variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
    >
      Hard
    </Button>
  </div>
)

// Main component to display discovered LatinHAMs
export function DiscoveredLatinHAMs() {
  // State to hold the list of LatinHAMs
  const [latinHAMs, setLatinHAMs] = useState<LatinHAM[]>([])
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null)
  // State to indicate if data is loading
  const [isLoading, setIsLoading] = useState(true)
  // State to hold the currently selected LatinHAM
  const [selectedLatinHAM, setSelectedLatinHAM] = useState<LatinHAM | null>(null)
  // State to manage the current difficulty filter
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  // Hook to access the current user
  const { user } = useUser()

  // Function to fetch LatinHAMs based on the selected difficulty
  const fetchLatinHAMs = useCallback(async () => {
    setIsLoading(true) // Start loading
    try {
      // Fetch data from the API with the current difficulty filter
      const response = await fetch(`/api/discovered?difficulty=${difficultyFilter}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Ensure the data is an array before setting state
      if (Array.isArray(data)) {
        setLatinHAMs(data)
      } else {
        throw new Error('Invalid data format')
      }
    } catch (error) {
      // Handle any errors during fetch
      console.error('Error fetching latinHAMs:', error)
      setError('Failed to load Discovered LatinHAMs. Please try again later.')
    } finally {
      setIsLoading(false) // End loading
    }
  }, [difficultyFilter]) // Recreate the function if difficultyFilter changes

  // useEffect to fetch LatinHAMs when the component mounts or dependencies change
  useEffect(() => {
    fetchLatinHAMs()
  }, [fetchLatinHAMs, difficultyFilter, user]) // Dependencies: fetchLatinHAMs, difficultyFilter, user

  // Handler for when a LatinHAM is clicked
  const handleLatinHAMClick = (latinHAM: LatinHAM) => {
    setSelectedLatinHAM(latinHAM)
  }

  // Handler to close the leaderboard and reset selected LatinHAM
  const handleCloseLeaderboard = () => {
    setSelectedLatinHAM(null)
    fetchLatinHAMs() // Re-fetch data when closing leaderboard
  }

  // Render a loading state if data is being fetched
  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  // Render an error message if there was an issue fetching data
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  // Render a message if no LatinHAMs are found
  if (latinHAMs.length === 0) {
    return <div className="text-center py-8 text-white">No Discovered LATINhams found. Start playing to create some!</div>
  }

  // Main render of the component
  return (
    <div className="container mx-auto">
      {/* Header for the page */}
      <h1 className="text-6xl font-bold text-center mb-6 text-white">Discovered LATINhams</h1>
      <div className="flex flex-col items-center justify-center">
        {/* Game preview section */}
        <div className="w-[calc(6*3rem+6*0.75rem)]">
          <GamePreview />
        </div>
      </div>
      {/* Description paragraph */}
      <p className="text-center mb-6 text-white">Explore player-identified gameboard layouts.</p>
      {/* Render DifficultyFilters only if no LatinHAM is selected */}
      {!selectedLatinHAM && (
        <DifficultyFilters
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
        />
      )}
      {/* Conditional rendering based on whether a LatinHAM is selected */}
      {selectedLatinHAM ? (
        <div>
          {/* Button to go back to the grid view */}
          <div className="flex justify-center mb-4">
            <Button 
              onClick={handleCloseLeaderboard}
              variant="outline"
            >
              Back to Grid
            </Button>
          </div>
          {/* Leaderboard for the selected LatinHAM */}
          <LatinHAMLeaderboard
            latinHAM={selectedLatinHAM}
          />
        </div>
      ) : (
        // Grid view displaying all LatinHAMs
        <LatinHAMGrid 
          latinHAMs={latinHAMs} 
          onLatinHAMClick={handleLatinHAMClick}
          difficultyFilter={difficultyFilter}
        />
      )}
    </div>
  )
}

// Export the component as default
export default DiscoveredLatinHAMs;
