import React, { useState, useEffect } from 'react'
import { CompletedPuzzleCard } from './CompletedPuzzleCard'
import { LeaderboardEntry, LatinHAM } from '../types'

interface LatinHAMDetailProps {
  latinHAM: LatinHAM
  onBackClick: () => void
}

export const LatinHAMDetail: React.FC<LatinHAMDetailProps> = ({ latinHAM, onBackClick }) => {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const fetchLeaderboardEntries = async () => {
      try {
        const response = await fetch(`/api/leaderboard-entries?initialGrid=${JSON.stringify(latinHAM.initialGrid)}&difficulty=${latinHAM.difficulty}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setLeaderboardEntries(data)
      } catch (error) {
        console.error('Error fetching leaderboard entries:', error)
      }
    }

    fetchLeaderboardEntries()
  }, [latinHAM.initialGrid, latinHAM.difficulty])

  return (
    <div className="w-full">
      <div className="flex justify-center mb-4">
        <button 
          onClick={onBackClick} 
          className="px-4 py-2 bg-blue-500 text-white rounded mx-auto block"
        >
          Back to Grid
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">LatinHAM Details</h2>
      <div className="mb-4">
        <CompletedPuzzleCard
          entry={{
            id: 'detail',
            username: 'Best Score',
            difficulty: latinHAM.difficulty,
            moves: latinHAM.bestMoves,
            time: latinHAM.bestTime,
            grid: latinHAM.initialGrid,
            initialGrid: latinHAM.initialGrid,
            quote: `Solved ${latinHAM.solveCount} times`,
            hints: 0,
            timestamp: new Date().toISOString()
          }}
          difficulty={latinHAM.difficulty}
        />
      </div>
      <h3 className="text-xl font-bold mb-2 text-center">Leaderboard</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {leaderboardEntries.map((entry) => (
          <CompletedPuzzleCard key={entry.id} entry={entry} difficulty={entry.difficulty} />
        ))}
      </div>
    </div>
  )
}