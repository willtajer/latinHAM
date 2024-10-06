// hooks/useGameLogic.ts

import { useState, useCallback, useEffect } from 'react'
import { createLatinSquare, prefillCells, checkWin } from '../utils/gameLogic'

export const useGameLogic = () => {
  const [grid, setGrid] = useState<number[][]>([])
  const [locked, setLocked] = useState<boolean[][]>([])
  const [edited, setEdited] = useState<boolean[][]>([])
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'viewing'>('start')
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

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || locked[row][col]) return

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r])
      if (isTrashMode) {
        if (edited[row][col]) {
          newGrid[row][col] = 0
        }
      } else {
        newGrid[row][col] = (newGrid[row][col] % 6) + 1
      }
      return newGrid
    })

    setEdited(prevEdited => {
      const newEdited = prevEdited.map(r => [...r])
      newEdited[row][col] = !isTrashMode
      return newEdited
    })

    setMoveCount(prevCount => prevCount + 1)
    setHints(Array(6).fill(false).map(() => Array(6).fill(false)))
    setShowNumbers(false)
    setHintsActive(false)
    setIsTrashMode(false)
  }, [gameState, locked, isTrashMode, edited])

  const handleSelectDifficulty = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty)
    initializeGame(selectedDifficulty)
  }, [])

  const handleNewGame = useCallback(() => {
    initializeGame(difficulty)
  }, [difficulty])

  const handleHint = useCallback(() => {
    if (checkWin(grid)) {
      setGameState('won')
      return
    }

    if (hintsActive) {
      setHints(Array(6).fill(false).map(() => Array(6).fill(false)))
      setHintsActive(false)
    } else {
      const newHints = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!edited[rowIndex][colIndex] || cell === 0) return false
          for (let i = 0; i < 6; i++) {
            if (i !== colIndex && grid[rowIndex][i] === cell) return true
            if (i !== rowIndex && grid[i][colIndex] === cell) return true
          }
          return false
        })
      )

      if (newHints.some(row => row.some(cell => cell))) {
        setHints(newHints)
        setHintsActive(true)
        setHintCount(prevCount => prevCount + 1)
      }
    }
  }, [grid, edited, hintsActive])

  const handleReset = useCallback(() => {
    setGrid(initialGrid.map(row => [...row]))
    setEdited(Array(6).fill(false).map(() => Array(6).fill(false)))
    setHints(Array(6).fill(false).map(() => Array(6).fill(false)))
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

  const initializeGame = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    const newSolution = createLatinSquare()
    setSolution(newSolution)
    const newGrid = Array(6).fill(0).map(() => Array(6).fill(0))
    const newLocked = Array(6).fill(false).map(() => Array(6).fill(false))
    const newEdited = Array(6).fill(false).map(() => Array(6).fill(false))
    prefillCells(newGrid, newLocked, selectedDifficulty)
    setGrid(newGrid)
    setInitialGrid(newGrid.map(row => [...row]))
    setLocked(newLocked)
    setEdited(newEdited)
    setHints(Array(6).fill(false).map(() => Array(6).fill(false)))
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

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && startTime !== null) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState, startTime])

  return {
    grid,
    locked,
    edited,
    gameState,
    difficulty,
    hints,
    showNumbers,
    moveCount,
    hintCount,
    elapsedTime,
    hintsActive,
    isTrashMode,
    initialGrid,
    handleCellClick,
    handleSelectDifficulty,
    handleNewGame,
    handleHint,
    handleReset,
    handleTrashToggle,
    checkWin,
    initializeGame,
  }
}