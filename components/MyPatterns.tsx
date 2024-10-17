'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import PatternDetector from './PatternDetector'

interface Game {
  id: string
  grid: number[][]
  difficulty: string
  created_at: string
  moves: number
  time: number
  patterns: {
    solid: boolean
    ordered: boolean
    rainbow: boolean
  }
}

interface Pattern {
  type: 'solid' | 'ordered' | 'rainbow'
  grid: number[][]
  highlightedCells: number[]
  description: string
  color?: number
}

const colorNames = ['', 'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']

export default function MyPatterns() {
  const [games, setGames] = useState<Game[]>([])
  const [displayMode, setDisplayMode] = useState<'single' | 'combo'>('single')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games')
        if (!response.ok) {
          throw new Error('Failed to fetch games')
        }
        const data = await response.json()
        setGames(data.games || [])
      } catch (error) {
        console.error('Error fetching games:', error)
        setError('Failed to load games. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [])

  const getPatternDescription = (game: Game, type: 'solid' | 'ordered' | 'rainbow'): Pattern[] => {
    // This is a placeholder function. You'll need to implement the actual pattern detection logic.
    // For now, we'll return dummy data.
    return [{
      type,
      grid: game.grid,
      highlightedCells: [0, 7, 14, 21, 28, 35], // Diagonal for example
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} pattern`,
      color: type === 'solid' ? 1 : undefined
    }]
  }

  const renderPatternCard = (game: Game, pattern: Pattern) => {
    const getColorClass = (color: number) => {
      switch (color) {
        case 1: return 'bg-red-500'
        case 2: return 'bg-blue-500'
        case 3: return 'bg-yellow-500'
        case 4: return 'bg-green-500'
        case 5: return 'bg-purple-500'
        case 6: return 'bg-orange-500'
        default: return 'bg-gray-500'
      }
    }

    const getHeaderClass = (type: string) => {
      switch (type) {
        case 'solid': return getColorClass(pattern.color || 0)
        case 'ordered': return 'bg-gradient-to-r from-red-500 via-blue-500 via-yellow-500 via-green-500 via-purple-500 to-orange-500'
        case 'rainbow': return 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
        default: return 'bg-gray-500'
      }
    }

    return (
      <Card key={`${game.id}-${pattern.type}`} className="bg-gray-100 dark:bg-gray-800 p-0 rounded-lg shadow-md w-full max-w-[400px] overflow-visible relative">
        <CardContent className="p-4 pt-6">
          <div className={`absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center ${getHeaderClass(pattern.type)} rounded-t-lg`}>
            {pattern.type === 'solid' ? `Solid ${colorNames[pattern.color || 0]}` : pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)}
          </div>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 mt-1 text-center">
            {pattern.description}
          </div>
          <div className="aspect-square mb-4 relative">
            <PatternDetector 
              board={pattern.grid} 
              type={pattern.type}
              highlightedCells={pattern.highlightedCells}
            />
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
            <p><strong>Difficulty:</strong> {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}</p>
            <p><strong>Moves:</strong> {game.moves}</p>
            <p><strong>Time:</strong> {game.time}s</p>
            <p><strong>Completed:</strong> {new Date(game.created_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderComboCard = (game: Game) => {
    const comboCount = Object.values(game.patterns).filter(Boolean).length
    const gradientClass = `bg-gradient-to-r from-orange-${comboCount * 100} to-orange-${comboCount * 200}`

    return (
      <Card key={game.id} className="bg-gray-100 dark:bg-gray-800 p-0 rounded-lg shadow-md w-full max-w-[400px] overflow-visible relative">
        <CardContent className="p-4 pt-6">
          <div className={`absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center ${gradientClass} rounded-t-lg`}>
            Combo ({comboCount})
          </div>
          <div className="aspect-square mb-4 relative">
            <PatternDetector 
              board={game.grid} 
              type="combo"
              highlightedCells={[]}
            />
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
            {game.patterns.solid && <p>Solid</p>}
            {game.patterns.ordered && <p>Ordered</p>}
            {game.patterns.rainbow && <p>Rainbow</p>}
            <p><strong>Difficulty:</strong> {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}</p>
            <p><strong>Moves:</strong> {game.moves}</p>
            <p><strong>Time:</strong> {game.time}s</p>
            <p><strong>Completed:</strong> {new Date(game.created_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <div className="text-center py-8 text-white">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-white mb-6">My Patterns</h1>
      <RadioGroup
        defaultValue="single"
        onValueChange={(value) => setDisplayMode(value as 'single' | 'combo')}
        className="flex justify-center space-x-4 mb-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="single" id="single-detections" className="border-white text-white" />
          <Label htmlFor="single-detections" className="text-white">Single Detections</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="combo" id="combo-detections" className="border-white text-white" />
          <Label htmlFor="combo-detections" className="text-white">Combo Detections</Label>
        </div>
      </RadioGroup>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayMode === 'single' ? (
          games.flatMap(game => 
            ['solid', 'ordered', 'rainbow'].flatMap(type => 
              game.patterns[type as keyof typeof game.patterns] 
                ? getPatternDescription(game, type as 'solid' | 'ordered' | 'rainbow').map(pattern => renderPatternCard(game, pattern))
                : []
            )
          )
        ) : (
          games.filter(game => Object.values(game.patterns).filter(Boolean).length > 1).map(game => renderComboCard(game))
        )}
      </div>
    </div>
  )
}