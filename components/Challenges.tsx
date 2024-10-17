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
}

type RainbowSubsection = 'row' | 'column' | 'diagonal'

export default function Challenges() {
  const [games, setGames] = useState<Game[]>([])
  const [challengeType, setChallengeType] = useState<'solid' | 'rainbow'>('solid')
  const [rainbowSubsection, setRainbowSubsection] = useState<RainbowSubsection>('row')
  const [patterns, setPatterns] = useState<Pattern[]>([])
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
      } catch (err) {
        setError('Failed to load games. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
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
            description: "Top Left to Bottom Right"
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
            description: "Top Right to Bottom Left"
          })
        }
      } else {
        // Generate rainbow patterns
        const generateRainbowPattern = (
          direction: (i: number, j: number) => number, 
          ascending: boolean, 
          description: string
        ) => {
          const grid = Array(size).fill(null).map(() => Array(size).fill(0))
          const highlight = []
          for (let i = 0; i < size; i++) {
            const index = direction(i, i)
            grid[Math.floor(index / size)][index % size] = ascending ? i + 1 : size - i
            highlight.push(index)
          }
          return { grid, highlightedCells: highlight, description }
        }

        if (rainbowSubsection === 'row' || rainbowSubsection === 'column') {
          for (let i = 0; i < size; i++) {
            const rowDirection = rainbowSubsection === 'row'
              ? (_: number, j: number) => i * size + j
              : (_: number, j: number) => j * size + i
            const rowDesc = rainbowSubsection === 'row' ? `Row ${i + 1}` : `Column ${i + 1}`
            newPatterns.push(generateRainbowPattern(rowDirection, true, `${rowDesc} Left to Right`))
            newPatterns.push(generateRainbowPattern(rowDirection, false, `${rowDesc} Right to Left`))
          }
        } else if (rainbowSubsection === 'diagonal') {
          // Main diagonals
          newPatterns.push(generateRainbowPattern((i: number, _: number) => i * size + i, true, "Top Left to Bottom Right"))
          newPatterns.push(generateRainbowPattern((i: number, _: number) => i * size + i, false, "Bottom Right to Top Left"))
          newPatterns.push(generateRainbowPattern((i: number, _: number) => i * size + (size - 1 - i), true, "Top Right to Bottom Left"))
          newPatterns.push(generateRainbowPattern((i: number, _: number) => i * size + (size - 1 - i), false, "Bottom Left to Top Right"))
        }
      }

      // Match games to patterns
      games.forEach(game => {
        const gamePatterns = PatternDetector.detectPatterns(game.grid, challengeType)
        gamePatterns.forEach(patternCells => {
          const matchingPattern = newPatterns.find(p => 
            p.highlightedCells.every(cell => patternCells.includes(cell))
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-white text-lg">
          {getFoundCounterText()}
        </div>
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
          <Card key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-[400px]">
            <CardContent className="p-0">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 text-center">
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