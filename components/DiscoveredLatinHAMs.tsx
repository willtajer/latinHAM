'use client'

import React, { useState, useEffect } from 'react'
import LatinHAMGrid from './LatinHAMGrid'
import LatinHAMLeaderboard from './LatinHAMLeaderboard'
import { LatinHAM } from '@/types'
import { GamePreview } from './GamePreview'

export const DiscoveredLatinHAMs: React.FC = () => {
  const [latinHAMs, setLatinHAMs] = useState<LatinHAM[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLatinHAM, setSelectedLatinHAM] = useState<LatinHAM | null>(null)

  useEffect(() => {
    const fetchLatinHAMs = async () => {
      try {
        const response = await fetch('/api/discovered')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          setLatinHAMs(data)
        } else {
          throw new Error('Invalid data format')
        }
      } catch (error) {
        console.error('Error fetching latinHAMs:', error)
        setError('Failed to load Discovered LatinHAMs. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatinHAMs()
  }, [])

  const handleLatinHAMClick = (latinHAM: LatinHAM) => {
    setSelectedLatinHAM(latinHAM)
  }

  const handleCloseLeaderboard = () => {
    setSelectedLatinHAM(null)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (latinHAMs.length === 0) {
    return <div className="text-center py-8 text-white">No Discovered LatinHAMs found. Start playing to create some!</div>
  }

  return (
    <div className="container mx-auto pb-16">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">Discovered LatinHAMs</h1>
      <div className="flex flex-col items-center justify-center">
        <div className="w-[calc(6*3rem+6*0.75rem)]">
          <GamePreview />
      </div>
      </div>
      <p className="text-center mb-8 text-white">Explore player-identified gameboard layouts.</p>
      {selectedLatinHAM ? (
        <div>
          <button 
            onClick={handleCloseLeaderboard}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Grid
          </button>
          <LatinHAMLeaderboard
            latinHAM={selectedLatinHAM}
          />
        </div>
      ) : (
        <LatinHAMGrid 
          latinHAMs={latinHAMs} 
          onLatinHAMClick={handleLatinHAMClick}
        />
      )}
    </div>
  )
}

export default DiscoveredLatinHAMs