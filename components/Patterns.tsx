'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  moves: number
  time: number
  patterns?: {
    solid: boolean
    ordered: boolean
    rainbow: boolean
  }
}

interface Pattern {
  grid: number[][]
  highlightedCells: number[]
  matchedGames: Game[]
  description: string
  color: number
  isBackward?: boolean
  isAscending?: boolean
}

type ChallengeSubsection = 'row' | 'column' | 'diagonal'
type ChallengeType = 'solid' | 'ordered' | 'rainbow' | 'my-patterns'

const colorNames = ['', 'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']

export default function Challenges() {
  const [games, setGames] = useState<Game[]>([])
  const [challengeType, setChallengeType] = useState<ChallengeType>('solid')
  const [orderedSubsection, setOrderedSubsection] = useState<ChallengeSubsection>('row')
  const [rainbowSubsection, setRainbowSubsection] = useState<ChallengeSubsection>('row')
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
      } catch (error) {
        console.error('Error fetching games:', error)
        setError('Failed to load games. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [])

  const generatePatterns = useCallback((type: ChallengeType, subsection?: ChallengeSubsection) => {
    const size = 6
    const newPatterns: Pattern[] = []

    if (type === 'solid') {
      for (let color = 1; color <= 6; color++) {
        // Left to Right
        const tlbrGrid = Array(size).fill(null).map(() => Array(size).fill(0))
        const tlbrHighlight = []
        for (let i = 0; i < size; i++) {
          tlbrGrid[i][i] = color
          tlbrHighlight.push(i * size + i)
        }
        newPatterns.push({ 
          grid: tlbrGrid, 
          highlightedCells: tlbrHighlight,
          matchedGames: [],
          description: "Left to Right",
          color: color
        })

        // Right to Left
        const trblGrid = Array(size).fill(null).map(() => Array(size).fill(0))
        const trblHighlight = []
        for (let i = 0; i < size; i++) {
          trblGrid[i][size - 1 - i] = color
          trblHighlight.push(i * size + (size - 1 - i))
        }
        newPatterns.push({ 
          grid: trblGrid, 
          highlightedCells: trblHighlight,
          matchedGames: [],
          description: "Right to Left",
          color: color
        })
      }
    } else if (type === 'ordered' || type === 'rainbow') {
      const generatePattern = (
        direction: (i: number) => number,
        description: string,
        isBackward: boolean,
        isAscending: boolean
      ) => {
        const grid = Array(size).fill(null).map(() => Array(size).fill(0))
        const highlight = []
        const values = type === 'ordered' 
          ? Array.from({length: size}, (_, i) => i + 1)
          : [1, 6, 3, 4, 2, 5]
        for (let i = 0; i < size; i++) {
          const index = direction(i)
          grid[Math.floor(index / size)][index % size] = isBackward ? values[size - 1 - i] : values[i]
          highlight.push(index)
        }
        return { grid, highlightedCells: highlight, matchedGames: [], description, color: 0, isBackward, isAscending }
      }

      if (subsection === 'row' || subsection === 'column') {
        for (let i = 0; i < size; i++) {
          const isRow = subsection === 'row'
          const direction = isRow
            ? (j: number) => i * size + j
            : (j: number) => j * size + i
          const desc = isRow ? `Row ${i + 1}` : `Column ${i + 1}`
          newPatterns.push(generatePattern(direction, `${desc} Forward`, false, true))
          newPatterns.push(generatePattern(direction, `${desc} Backward`, true, false))
        }
      } else if (subsection === 'diagonal') {
        newPatterns.push(generatePattern((i: number) => i * size + i, "Left to Right Forward", false, true))
        newPatterns.push(generatePattern((i: number) => i * size + (size - 1 - i), "Right to Left Forward", false, true))
        newPatterns.push(generatePattern((i: number) => (size - 1 - i) * size + i, "Bottom Left to Top Right Forward", true, false))
        newPatterns.push(generatePattern((i: number) => (size - 1 - i) * size + (size - 1 - i), "Bottom Right to Top Left Forward", true, false))
      }
    } else if (type === 'my-patterns') {
      games.forEach(game => {
        if (game.patterns && Object.values(game.patterns).some(Boolean)) {
          const newPattern: Pattern = {
            grid: game.grid,
            highlightedCells: [],
            matchedGames: [game],
            description: "Custom Pattern",
            color: 0
          }
          
          if (game.patterns.solid) {
            newPattern.highlightedCells.push(...PatternDetector.detectPatterns(game.grid, 'solid').flat())
          }
          if (game.patterns.ordered) {
            newPattern.highlightedCells.push(...PatternDetector.detectPatterns(game.grid, 'ordered', subsection).flat())
          }
          if (game.patterns.rainbow) {
            newPattern.highlightedCells.push(...PatternDetector.detectPatterns(game.grid, 'rainbow', subsection).flat())
          }
          
          newPattern.highlightedCells = Array.from(new Set(newPattern.highlightedCells)); // Remove duplicates
          newPatterns.push(newPattern)
        }
      })
    }

    // Match games to patterns
    games.forEach(game => {
      const gamePatterns = PatternDetector.detectPatterns(
        game.grid,
        type,
        subsection
      )
      gamePatterns.forEach(patternCells => {
        const matchingPattern = newPatterns.find(p => 
          p.highlightedCells.every(cell => patternCells.includes(cell)) &&
          p.grid.flat().every((value, index) => 
            value === 0 || value === game.grid[Math.floor(index / size)][index % size]
          )
        )
        if (matchingPattern) {
          matchingPattern.matchedGames.push(game)
          matchingPattern.grid = game.grid // Update the grid with the winning board
        }
      })
    })

    // Sort matched games for each pattern
    newPatterns.forEach(pattern => {
      pattern.matchedGames.sort((a, b) => {
        const difficultyOrder = { 'hard': 0, 'medium': 1, 'easy': 2 }
        if (a.difficulty !== b.difficulty) {
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        }
        if (a.moves !== b.moves) return a.moves - b.moves
        if (a.time !== b.time) return a.time - b.time
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    })

    return newPatterns
  }, [games])

  useEffect(() => {
    const newPatterns = generatePatterns(challengeType, challengeType === 'ordered' ? orderedSubsection : (challengeType === 'rainbow' ? rainbowSubsection : undefined))
    setPatterns(newPatterns)
  }, [games, challengeType, orderedSubsection, rainbowSubsection, generatePatterns])

  const patternCounts = useMemo(() => {
    const solidPatterns = generatePatterns('solid')
    const orderedPatterns = generatePatterns('ordered', orderedSubsection)
    const rainbowPatterns = generatePatterns('rainbow', rainbowSubsection)

    return {
      solid: solidPatterns.filter(p => p.matchedGames.length > 0).length,
      ordered: orderedPatterns.filter(p => p.matchedGames.length > 0).length,
      rainbow: rainbowPatterns.filter(p => p.matchedGames.length > 0).length,
    }
  }, [generatePatterns, orderedSubsection, rainbowSubsection])

  const foundCounterText = useMemo(() => {
    const totalCount = patternCounts.solid + patternCounts.ordered + patternCounts.rainbow
    const totalPatterns = 12 + 28 + 28 // 12 solid, 28 ordered, 28 rainbow

    return {
      solid: `${patternCounts.solid}/12`,
      ordered: `${patternCounts.ordered}/28`,
      rainbow: `${patternCounts.rainbow}/28`,
      total: `${totalCount}/${totalPatterns}`
    }
  }, [patternCounts])

  if (isLoading) {
    return <div className="text-center py-8 text-white">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ' at');
  }

  const renderPatternCard = (pattern: Pattern, index: number) => (
    <Card key={index} className="bg-gray-100 dark:bg-gray-800 p-0 rounded-lg shadow-md w-full max-w-[400px] overflow-visible relative">
      <CardContent className="p-4 pt-6">
        {challengeType === 'solid' && (
          <div className={`absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center ${getColorClass(pattern.color)} rounded-t-lg`}>
            Solid {colorNames[pattern.color]}
          </div>
        )}
        {challengeType === 'ordered' && (
          <div className="absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center bg-gradient-to-r from-red-500 via-blue-500 via-yellow-500 via-green-500 via-purple-500 to-orange-500 rounded-t-lg">
            Ordered
          </div>
        )}
        {challengeType === 'rainbow' && (
          <div className="absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-t-lg">
            Rainbow
          </div>
        )}
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 mt-1 text-center">
          {pattern.description}
        </div>
        <div className="aspect-square mb-4 relative">
          <PatternDetector 
            board={pattern.grid} 
            type={challengeType === 'my-patterns' ? 'solid' : challengeType}
            highlightedCells={pattern.highlightedCells}
          />
        </div>
        <div className="absolute -bottom-2 -right-2 overflow-visible">
          <div className="w-8 h-8 bg-blue-500 rounded-xl rotate-45 flex items-center justify-center">
            <span className="text-white font-bold text-sm -rotate-45">
              {pattern.matchedGames.length}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
          {pattern.matchedGames.length > 0 ? (
            <>
              <p><strong>Difficulty:</strong> {pattern.matchedGames[0].difficulty.charAt(0).toUpperCase() + pattern.matchedGames[0].difficulty.slice(1)}</p>
              <p><strong>Moves:</strong> {pattern.matchedGames[0].moves}</p>
              <p><strong>Time:</strong> {pattern.matchedGames[0].time}s</p>
              <p><strong>Completed:</strong> {formatTimestamp(pattern.matchedGames[0].created_at)}</p>
            </>
          ) : (
            <p className="text-center">Unfound LatinHAM</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderMyPatternsCard = (pattern: Pattern, index: number) => (
    <Card  key={pattern.matchedGames[0]?.id || `unknown-${index}`} className="bg-gray-100 dark:bg-gray-800 p-0 rounded-lg shadow-md w-full max-w-[400px] overflow-visible relative">
      <CardContent className="p-4 pt-6">
        <div className="absolute top-0 left-0 right-0 text-xs font-semibold text-white py-1 px-2 text-center bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg">
          My Pattern
        </div>
        <div className="aspect-square mb-4 relative">
          <PatternDetector 
            board={pattern.grid} 
            type="my-patterns"
            highlightedCells={pattern.highlightedCells}
          />
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
          {pattern.matchedGames[0]?.patterns && Object.entries(pattern.matchedGames[0].patterns)
            .filter(([type, value]) => value)
            .map(([type]) => (
              <p key={type} className="capitalize">{type}</p>
            ))}
          <p><strong>Difficulty:</strong> {pattern.matchedGames[0]?.difficulty?.charAt(0).toUpperCase() + pattern.matchedGames[0]?.difficulty?.slice(1) || 'Unknown'}</p>
          <p><strong>Moves:</strong> {pattern.matchedGames[0]?.moves || 'N/A'}</p>
          <p><strong>Time:</strong> {pattern.matchedGames[0]?.time ? `${pattern.matchedGames[0].time}s` : 'N/A'}</p>
          <p><strong>Completed:</strong> {pattern.matchedGames[0]?.created_at ? formatTimestamp(pattern.matchedGames[0].created_at) : 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-white text-lg pb-6">
          Discover unique LatinHAM patterns from your completed games!
        </p>
        <p className="text-white text-lg font-bold">
          Total Challenges Found: {foundCounterText.total}
        </p>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex justify-center mb-4">
          <Button
            onClick={() => setChallengeType('my-patterns')}
            className={`${
              challengeType === 'my-patterns'
                ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors duration-200 px-6`}
          >
            My Patterns
          </Button>
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
            Solid - {foundCounterText.solid}
          </Button>
          <Button
            onClick={() => setChallengeType('ordered')}
            className={`${
              challengeType === 'ordered'
                ? 'bg-gradient-to-r from-red-500 via-blue-500 via-yellow-500 via-green-500 via-purple-500 to-orange-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Ordered - {foundCounterText.ordered}
          </Button>
          <Button
            onClick={() => setChallengeType('rainbow')}
            className={`${
              challengeType === 'rainbow'
                ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Rainbow - {foundCounterText.rainbow}
          </Button>
        </div>
      </div>
      {challengeType === 'ordered' && (
        <RadioGroup
          defaultValue="row"
          onValueChange={(value) => setOrderedSubsection(value as ChallengeSubsection)}
          className="flex justify-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="row" id="ordered-row" className="border-white text-white" />
            <Label htmlFor="ordered-row" className="text-white">Rows</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="column" id="ordered-column" className="border-white text-white" />
            <Label htmlFor="ordered-column" className="text-white">Columns</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="diagonal" id="ordered-diagonal" className="border-white text-white" />
            <Label htmlFor="ordered-diagonal" className="text-white">Diagonals</Label>
          </div>
        </RadioGroup>
      )}
      {challengeType === 'rainbow' && (
        <RadioGroup
          defaultValue="row"
          onValueChange={(value) => setRainbowSubsection(value as ChallengeSubsection)}
          className="flex justify-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="row" id="rainbow-row" className="border-white text-white" />
            <Label htmlFor="rainbow-row" className="text-white">Rows</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="column" id="rainbow-column" className="border-white text-white" />
            <Label htmlFor="rainbow-column" className="text-white">Columns</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="diagonal" id="rainbow-diagonal" className="border-white text-white" />
            <Label htmlFor="rainbow-diagonal" className="text-white">Diagonals</Label>
          </div>
        </RadioGroup>
      )}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
        {challengeType === 'my-patterns' ? (
          patterns.map((pattern, index) => renderMyPatternsCard(pattern, index))
        ) : (
          patterns.map(renderPatternCard)
        )}
      </div>
    </div>
  )
}