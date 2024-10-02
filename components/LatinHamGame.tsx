'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BOARD_SIZE, createLatinSquare, prefillCells, checkWin } from '../utils/gameLogic'
import { GameBoard } from './GameBoard'
import { DifficultySelector } from './DifficultySelector'
import { Leaderboard, LeaderboardEntry } from './Leaderboard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

const PreviewCell: React.FC<{ value: number }> = ({ value }) => {
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-white'
  return (
    <div className={`w-6 h-6 ${colorClass}`}></div>
  )
}

const GamePreview: React.FC = () => {
  const previewGrid = createLatinSquare()
  
  return (
    <div className="grid grid-cols-6 bg-gray-200 p-2 rounded-lg shadow-inner mb-8">
      {previewGrid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <PreviewCell key={`${rowIndex}-${colIndex}`} value={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function LatinHamGame() {
  const [grid, setGrid] = useState<number[][]>([])
  const [locked, setLocked] = useState<boolean[][]>([])
  const [edited, setEdited] = useState<boolean[][]>([])
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won'>('start')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [hints, setHints] = useState<boolean[][]>([])
  const [showNumbers, setShowNumbers] = useState<boolean>(false)
  const [solution, setSolution] = useState<number[][]>([])
  const [initialGrid, setInitialGrid] = useState<number[][]>([])
  const [isTrashMode, setIsTrashMode] = useState<boolean>(false)
  const [moveCount, setMoveCount] = useState<number>(0)
  const [hintCount, setHintCount] = useState<number>(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [hintsActive, setHintsActive] = useState<boolean>(false)
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem('gameState')
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      setGrid(parsedState.grid)
      setLocked(parsedState.locked)
      setEdited(parsedState.edited)
      setGameState(parsedState.gameState)
      setDifficulty(parsedState.difficulty)
      setHints(parsedState.hints)
      setShowNumbers(parsedState.showNumbers)
      setSolution(parsedState.solution)
      setInitialGrid(parsedState.initialGrid)
      setMoveCount(parsedState.moveCount)
      setHintCount(parsedState.hintCount)
      setStartTime(parsedState.startTime)
      setElapsedTime(parsedState.elapsedTime)
      setHintsActive(parsedState.hintsActive)
    } else {
      setGameState('start')
    }

    const savedLeaderboard = localStorage.getItem('leaderboard')
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard))
    }
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      const savedGameState = {
        grid,
        locked,
        edited,
        gameState,
        difficulty,
        hints,
        showNumbers,
        solution,
        initialGrid,
        moveCount,
        hintCount,
        startTime,
        elapsedTime,
        hintsActive
      }
      localStorage.setItem('gameState', JSON.stringify(savedGameState))
    }
  }, [grid, locked, edited, gameState, difficulty, hints, showNumbers, solution, initialGrid, moveCount, hintCount, startTime, elapsedTime, hintsActive])

  useEffect(() => {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
  }, [leaderboard])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && startTime !== null) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1
          localStorage.setItem('elapsedTime', newTime.toString())
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState, startTime])

  const handleWin = useCallback(() => {
    setGameState('won')
    const newEntry: LeaderboardEntry = {
      timestamp: new Date().toISOString(),
      moves: moveCount,
      time: elapsedTime,
      hints: hintCount
    }

    setLeaderboard(prevLeaderboard => {
      const updatedLeaderboard = {
        ...prevLeaderboard,
        [difficulty]: [...prevLeaderboard[difficulty], newEntry]
          .sort((a, b) => a.moves - b.moves)
          .slice(0, 10)
      }
      localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard))
      return updatedLeaderboard
    })
  }, [difficulty, moveCount, elapsedTime, hintCount])

  useEffect(() => {
    if (gameState === 'playing' && checkWin(grid)) {
      handleWin()
    }
  }, [grid, gameState, handleWin])

  const initializeGame = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    const newSolution = createLatinSquare()
    setSolution(newSolution)
    const newGrid = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0))
    const newLocked = Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false))
    const newEdited = Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false))
    prefillCells(newGrid, newLocked, selectedDifficulty)
    setGrid(newGrid)
    setInitialGrid(newGrid.map(row => [...row]))
    setLocked(newLocked)
    setEdited(newEdited)
    setHints(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setShowNumbers(false)
    setIsTrashMode(false)
    setMoveCount(0)
    setHintCount(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setGameState('playing')
    setHintsActive(false)
    setDifficulty(selectedDifficulty)
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || locked[row][col]) return

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r])
      if (isTrashMode) {
        if (edited[row][col]) {
          newGrid[row][col] = 0
        }
      } else {
        newGrid[row][col] = (newGrid[row][col] % BOARD_SIZE) + 1
      }
      return newGrid
    })

    setEdited(prevEdited => {
      const newEdited = prevEdited.map(r => [...r])
      newEdited[row][col] = !isTrashMode
      return newEdited
    })

    setMoveCount(prevCount => prevCount + 1)
    setHints(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setShowNumbers(false)
    setHintsActive(false)
    setIsTrashMode(false)
  }, [gameState, locked, isTrashMode, edited])

  const handleSelectDifficulty = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    initializeGame(selectedDifficulty)
  }, [initializeGame])

  const handleNewGame = useCallback(() => {
    setShowNewGameConfirmation(true)
  }, [])

  const confirmNewGame = useCallback(() => {
    localStorage.removeItem('gameState')
    setGameState('start')
    setDifficulty('easy')
    setShowNewGameConfirmation(false)
  }, [])

  const handleHint = useCallback(() => {
    if (checkWin(grid)) {
      handleWin()
      return
    }

    const newHints = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (!edited[rowIndex][colIndex] || cell === 0) return false

        for (let i = 0; i < BOARD_SIZE; i++) {
          if (i !== colIndex && grid[rowIndex][i] === cell) return true
          if (i !== rowIndex && grid[i][colIndex] === cell) return true
        }

        return false
      })
    )

    if (newHints.some(row => row.some(cell => cell))) {
      setHints(newHints)
      setShowNumbers(true)
      setHintCount(prevCount => prevCount + 1)
      setHintsActive(true)
    }
  }, [grid, edited, handleWin])

  const handleReset = useCallback(() => {
    setGrid(initialGrid.map(row => [...row]))
    setEdited(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setHints(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setShowNumbers(false)
    setIsTrashMode(false)
    setMoveCount(0)
    setHintCount(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setGameState('playing')
    setHintsActive(false)
  }, [initialGrid])

  const handleTrashToggle = useCallback(() => {
    setIsTrashMode(prevMode => !prevMode)
    setMoveCount(prevCount => prevCount + 1)
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-[calc(6*3rem+6*0.75rem)]">
          <h1 className="text-6xl font-bold mb-6 text-center">36latinHam</h1>
          <GamePreview />
          <p className="text-center mt-4 mb-8">
            Fill the grid with colors so that each color appears exactly once in each row and column.
          </p>
          <DifficultySelector onSelectDifficulty={handleSelectDifficulty} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="max-w-lg mb-4">
        <h1 className="text-5xl font-bold mb-2 text-center">36latinHAM</h1>
        <p className="text-center mt-4 mb-4">
          Click on a cell to cycle through colors. Each color should appear once per row and column.
        </p>
      </div>
      <div className="w-[calc(6*3rem+5*0.75rem)] mb-2">
        <div className="flex justify-between font-bold text-md">
          <span>Moves: {moveCount}</span>
          <span>Time: {formatTime(elapsedTime)}</span>
          <span>Hints: {hintCount}</span>
        </div>
      </div>
      <GameBoard 
        grid={grid} 
        locked={locked} 
        edited={edited}
        hints={hints} 
        showNumbers={showNumbers}
        onCellClick={handleCellClick}
        isTrashMode={isTrashMode}
      />
      {gameState === 'won' && (
        <div className="mt-4 text-2xl font-bold p-4 text-green-600">Congratulations! You solved the puzzle!</div>
      )}
      <div className="flex space-x-4 mt-4">
        <Button 
          onClick={handleNewGame}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        >
          New Game
        </Button>
        <Button 
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        >
          Reset
        </Button>
        <Button 
          onClick={handleHint} 
          disabled={gameState === 'won' || hintsActive}
          className={hintsActive ? "bg-yellow-500 hover:bg-yellow-500 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-600 text-white"}
        >
          Hint
        </Button>
        <Button 
          onClick={handleTrashToggle} 
          variant={isTrashMode ? "destructive" : "outline"}
          className={isTrashMode ? "bg-red-500 hover:bg-red-600" : ""}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isTrashMode ? "Cancel" : "Clear"}
        </Button>
      </div>
      <div className="mt-8 w-full max-w-lg">
        <Leaderboard entries={leaderboard[difficulty]} difficulty={difficulty} />
      </div>
      <Dialog open={showNewGameConfirmation} onOpenChange={setShowNewGameConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Game?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to start a new game? Your current progress will be lost.</p>
          <DialogFooter>
            <Button onClick={() => setShowNewGameConfirmation(false)} variant="outline">Cancel</Button>
            <Button onClick={confirmNewGame}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}