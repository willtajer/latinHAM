'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import PatternDetector from './PatternDetector'

interface Game {
  id: string
  grid: number[][]
  difficulty: string
  created_at: string
}

interface Pattern {
  grid: number[][]
  highlightedCells: number[]
  matchedGame?: Game
  description: string
  color: number
  isAscending?: boolean
}

type RainbowSubsection = 'row' | 'column' | 'diagonal'

const colorNames = ['', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange']

export default function Challenges() {
  const [games, setGames] = useState<Game[]>([])
  const [challengeType, setChallengeType] = useState<'solid' | 'rainbow'>('solid')
  const [rainbowSubsection, setRainbowSubsection] = useState<RainbowSubsection>('row')
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState<string>('')

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

  useEffect(() => {
    const calculateTimeUntilReset = () => {
      const now = new Date()
      const nextSunday = new Date(now)
      nextSunday.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()) % 7)
      nextSunday.setUTCHours(17, 0, 0, 0) // 17:00 UTC is midnight Bangkok time

      const timeDiff = nextSunday.getTime() - now.getTime()
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeUntilReset(`${days}d ${hours}h ${minutes}m`)
    }

    calculateTimeUntilReset()
    const timer = setInterval(calculateTimeUntilReset, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const generatePatterns = () => {
      const size = 6
      const newPatterns: Pattern[] = []

      if (challengeType === 'solid') {
        // Generate solid diagonal patterns
        for (let color = 1; color <= 6; color++) {
          // Top-left to bottom-right
          const tlbrGrid = Array(size).fill(null).map(() => Array(size).fill(0))
          const tlbrHighlight = []
          for (let i = 0; i < size; i++) {
            tlbrGrid[i][i] = color
            tlbrHighlight.push(i * size + i)
          }
          newPatterns.push({ 
            grid: tlbrGrid, 
            highlightedCells: tlbrHighlight,
            description: "Top Left to Bottom Right",
            color: color
          })

          // Top-right to bottom-left
          const trblGrid = Array(size).fill(null).map(() => Array(size).fill(0))
          const trblHighlight = []
          for (let i = 0; i < size; i++) {
            trblGrid[i][size - 1 - i] = color
            trblHighlight.push(i * size + (size - 1 - i))
          }
          newPatterns.push({ 
            grid: trblGrid, 
            highlightedCells: trblHighlight,
            description: "Top Right to Bottom Left",
            color: color
          })
        }
      } else {
        // Generate rainbow patterns
        const generateRainbowPattern = (
          direction: (i: number) => number, 
          ascending: boolean, 
          description: string
        ) => {
          const grid = Array(size).fill(null).map(() => Array(size).fill(0))
          const highlight = []
          for (let i = 0; i < size; i++) {
            const index = direction(i)
            grid[Math.floor(index / size)][index % size] = ascending ? i + 1 : size - i
            highlight.push(index)
          }
          return { grid, highlightedCells: highlight, description, color: 0, isAscending: ascending }
        }

        if (rainbowSubsection === 'row' || rainbowSubsection === 'column') {
          for (let i = 0; i < size; i++) {
            const rowDirection = rainbowSubsection === 'row'
              ? (j: number) => i * size + j
              : (j: number) => j * size + i
            const rowDesc = rainbowSubsection === 'row' ? `Row ${i + 1}` : `Column ${i + 1}`
            newPatterns.push(generateRainbowPattern(rowDirection, true, `${rowDesc} Left to Right`))
            newPatterns.push(generateRainbowPattern(rowDirection, false, `${rowDesc} Right to Left`))
          }
        } else if (rainbowSubsection === 'diagonal') {
          // Main diagonals
          newPatterns.push(generateRainbowPattern((i: number) => i * size + i, true, "Top Left to Bottom Right"))
          newPatterns.push(generateRainbowPattern((i: number) => i * size + i, false, "Bottom Right to Top Left"))
          newPatterns.push(generateRainbowPattern((i: number) => i * size + (size - 1 - i), true, "Top Right to Bottom Left"))
          newPatterns.push(generateRainbowPattern((i: number) => i * size + (size - 1 - i), false, "Bottom Left to Top Right"))
        }
      }

      // Match games to patterns
      games.forEach(game => {
        const gamePatterns = PatternDetector.detectPatterns(game.grid, challengeType)
        gamePatterns.forEach(patternCells => {
          const matchingPattern = newPatterns.find(p => 
            p.highlightedCells.every(cell => patternCells.includes(cell)) &&
            (challengeType === 'rainbow' || game.grid[Math.floor(patternCells[0] / size)][patternCells[0] % size] === p.color)
          )
          if (matchingPattern) {
            matchingPattern.grid = game.grid
            matchingPattern.matchedGame = game
          }
        })
      })

      setPatterns(newPatterns)
    }

    generatePatterns()
  }, [games, challengeType, rainbowSubsection])

  if (isLoading) {
    return <div className="text-center py-8 text-white">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  const foundPatternCount = patterns.filter(p => p.matchedGame).length

  const getFoundCounterText = () => {
    if (challengeType === 'solid') {
      return `Diagonal Solids Found: ${foundPatternCount}/${patterns.length}`
    } else {
      switch (rainbowSubsection) {
        case 'row':
          return `Rainbow Rows Found: ${foundPatternCount}/${patterns.length}`
        case 'column':
          return `Rainbow Columns Found: ${foundPatternCount}/${patterns.length}`
        case 'diagonal':
          return `Rainbow Diagonals Found: ${foundPatternCount}/${patterns.length}`
        default:
          return `Rainbow Patterns Found: ${foundPatternCount}/${patterns.length}`
      }
    }
  }

  const getColorClass = (color: number) => {
    switch (color) {
      case 1: return 'bg-red-500'
      case 2: return 'bg-blue-500'
      case 3: return 'bg-green-500'
      case 4: return 'bg-yellow-500'
      case 5: return 'bg-purple-500'
      case 6: return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-white text-lg">
          Discover unique LatinHAM patterns from your completed games!
        </p>
        <p className="text-white text-md">
          Time until weekly reset: {timeUntilReset}
        </p>
        <p className="text-white text-lg font-bold">
          {getFoundCounterText()}
        </p>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <Button
            onClick={() => setChallengeType('solid')}
            className={`${
              challengeType === 'solid'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Solid Challenges
          </Button>
          <Button
            onClick={() => setChallengeType('rainbow')}
            className={`${
              challengeType === 'rainbow'
                ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Rainbow Challenges
          </Button>
        </div>
      </div>
      {challengeType === 'rainbow' && (
        <RadioGroup
          defaultValue="row"
          onValueChange={(value) => setRainbowSubsection(value as RainbowSubsection)}
          className="flex justify-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="row" id="row" />
            <Label htmlFor="row">Rows</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="column" id="column" />
            <Label htmlFor="column">Columns</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="diagonal" id="diagonal" />
            <Label htmlFor="diagonal">Diagonals</Label>
          </div>
        </RadioGroup>
      )}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
        {patterns.map((pattern, index) => (
          <Card key={index} className="bg-gray-100 dark:bg-gray-800 p-0 rounded-lg shadow-md w-full max-w-[400px] overflow-hidden">
            <CardContent className="p-4 pt-6 relative">
              {challengeType === 'solid' ? (
                <div className={`absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center ${getColorClass(pattern.color)}`}>
                  Solid {colorNames[pattern.color]}
                </div>
              ) : (
                <div className="absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
                  {pattern.isAscending ? 'Rainbow' : 'Backwards Rainbow'}
                </div>
              )}
              <div className="text-sm font-semibold text-gray-800  dark:text-gray-300 mb-2 mt-1 text-center">
                {pattern.description}
              </div>
              <div className="aspect-square mb-4">
                <PatternDetector 
                  board={pattern.grid} 
                  type={challengeType}
                  highlightedCells={pattern.highlightedCells}
                />
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
                {pattern.matchedGame ? (
                  <>
                    <p><strong>Difficulty:</strong> {pattern.matchedGame.difficulty.charAt(0).toUpperCase() + pattern.matchedGame.difficulty.slice(1)}</p>
                    <p><strong>Completed:</strong> {new Date(pattern.matchedGame.created_at).toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-center">Unfound LatinHAM</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}