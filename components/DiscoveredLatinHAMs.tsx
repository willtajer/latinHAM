// components/DiscoveredLatinHAMs.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { LatinHAMGrid } from './LatinHAMGrid'
import { LatinHAMDetail } from './LatinHAMDetail'
import { LatinHAM } from '../types/'

export const DiscoveredLatinHAMs: React.FC = () => {
  const [latinHAMs, setLatinHAMs] = useState<LatinHAM[]>([])
  const [selectedLatinHAM, setSelectedLatinHAM] = useState<LatinHAM | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLatinHAMs = async () => {
      try {
        const response = await fetch('/api/discovered-latinhams')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setLatinHAMs(data)
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

  const handleBackClick = () => {
    setSelectedLatinHAM(null)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (latinHAMs.length === 0) {
    return <div className="text-center py-8">No Discovered LatinHAMs found. Start playing to create some!</div>
  }

  return (
    <div>
      {selectedLatinHAM ? (
        <LatinHAMDetail latinHAM={selectedLatinHAM} onBackClick={handleBackClick} />
      ) : (
        <LatinHAMGrid latinHAMs={latinHAMs} onLatinHAMClick={handleLatinHAMClick} />
      )}
    </div>
  )
}