import { useState, useCallback, useEffect } from 'react'
import { createLatinSquare, prefillCells, checkWin } from '../utils/gameLogic'

export const useGameLogic = () => {
  const [grid, setGrid] = useState<number[][]>(() => {
    const savedGrid = localStorage.getItem('latinHamGrid')
    return savedGrid ? JSON.parse(savedGrid) : []
  })
  const [locked, setLocked] = useState<boolean[][]>(() => {
    const savedLocked = localStorage.getItem('latinHamLocked')
    return savedLocked ? JSON.parse(savedLocked) : []
  })
  const [edited, setEdited] = useState<boolean[][]>(() => {
    const savedEdited = localStorage.getItem('latinHamEdited')
    return savedEdited ? JSON.parse(savedEdited) : []
  })
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'viewing'>(() => {
    const savedGameState = localStorage.getItem('latinHamGameState') as 'start' | 'playing' | 'won' | 'viewing'
    return savedGameState || 'start'
  })
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => {
    const savedDifficulty = localStorage.getItem('latinHamDifficulty') as 'easy' | 'medium' | 'hard'
    return savedDifficulty || 'easy'
  })
  const [hints, setHints] = useState<boolean[][]>(() => {
    const savedHints = localStorage.getItem('latinHamHints')
    return savedHints ? JSON.parse(savedHints) : []
  })
  const [showNumbers, setShowNumbers] = useState<boolean>(false)
  const [solution, setSolution] = useState<number[][]>(() => {
    const savedSolution = localStorage.getItem('latinHamSolution')
    return savedSolution ? JSON.parse(savedSolution) : []
  })
  const [initialGrid, setInitialGrid] = useState<number[][]>(() => {
    const savedInitialGrid = localStorage.getItem('latinHamInitialGrid')
    return savedInitialGrid ? JSON.parse(savedInitialGrid) : []
  })
  const [isTrashMode, setIsTrashMode] = useState<boolean>(false)
  const [moveCount, setMoveCount] = useState<number>(() => {
    const savedMoveCount = localStorage.getItem('latinHamMoveCount')
    return savedMoveCount ? parseInt(savedMoveCount) : 0
  })
  const [hintCount, setHintCount] = useState<number>(() => {
    const savedHintCount = localStorage.getItem('latinHamHintCount')
    return savedHintCount ? parseInt(savedHintCount) : 0
  })
  const [startTime, setStartTime] = useState<number | null>(() => {
    const savedStartTime = localStorage.getItem('latinHamStartTime')
    return savedStartTime ? parseInt(savedStartTime) : null
  })
  const [elapsedTime, setElapsedTime] = useState<number>(() => {
    const savedElapsedTime = localStorage.getItem('latinHamElapsedTime')
    return savedElapsedTime ? parseInt(savedElapsedTime) : 0
  })
  const [hintsActive, setHintsActive] = useState<boolean>(false)

  useEffect(() => {
    localStorage.setItem('latinHamGrid', JSON.stringify(grid))
    localStorage.setItem('latinHamLocked', JSON.stringify(locked))
    localStorage.setItem('latinHamEdited', JSON.stringify(edited))
    localStorage.setItem('latinHamGameState', gameState)
    localStorage.setItem('latinHamDifficulty', difficulty)
    localStorage.setItem('latinHamHints', JSON.stringify(hints))
    localStorage.setItem('latinHamSolution', JSON.stringify(solution))
    localStorage.setItem('latinHamInitialGrid', JSON.stringify(initialGrid))
    localStorage.setItem('latinHamMoveCount', moveCount.toString())
    localStorage.setItem('latinHamHintCount', hintCount.toString())
    localStorage.setItem('latinHamStartTime', startTime ? startTime.toString() : '')
    localStorage.setItem('latinHamElapsedTime', elapsedTime.toString())
  }, [grid, locked, edited, gameState, difficulty, hints, solution, initialGrid, moveCount, hintCount, startTime, elapsedTime])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || locked[row][col]) return

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r])
      if (isTrashMode) {
        if (edited[row][col] && newGrid[row][col] !== 0) {
          newGrid[row][col] = 0
          setMoveCount(prevCount => prevCount + 1)
        }
      } else {
        newGrid[row][col] = (newGrid[row][col] % 6) + 1
        setMoveCount(prevCount => prevCount + 1)
      }

      // Check for win condition after updating the grid
      if (checkWin(newGrid)) {
        setGameState('won')
        setStartTime(null) // This will stop the timer
      }

      return newGrid
    })

    setEdited(prevEdited => {
      const newEdited = prevEdited.map(r => [...r])
      newEdited[row][col] = !isTrashMode || (isTrashMode && grid[row][col] !== 0)
      return newEdited
    })

    setHints(Array(6).fill(false).map(() => Array(6).fill(false)))
    setShowNumbers(false)
    setHintsActive(false)
    setIsTrashMode(false)
  }, [gameState, locked, isTrashMode, edited, grid])

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

    // Check for win condition after resetting
    if (checkWin(initialGrid)) {
      setGameState('won')
      setStartTime(null)
    }
  }, [initialGrid])

  const handleTrashToggle = useCallback(() => {
    setIsTrashMode(prevMode => !prevMode)
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

    // Check for win condition after initializing
    if (checkWin(newGrid)) {
      setGameState('won')
      setStartTime(null)
    }
  }, [])

  const resetGame = useCallback((newInitialGrid: number[][]) => {
    setGrid(newInitialGrid.map(row => [...row]))
    setInitialGrid(newInitialGrid)
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

    // Check for win condition after resetting
    if (checkWin(newInitialGrid)) {
      setGameState('won')
      setStartTime(null)
    }
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
    resetGame,
    setGameState,
  }
}