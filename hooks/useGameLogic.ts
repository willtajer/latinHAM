import { useState, useCallback, useEffect } from 'react'
import { createLatinSquare, prefillCells, checkWin } from '../utils/gameLogic'

// Custom hook to manage the game logic for latinHAM
export const useGameLogic = () => {
  // Initialize the game grid from localStorage or as an empty array
  const [grid, setGrid] = useState<number[][]>(() => {
    const savedGrid = localStorage.getItem('latinHamGrid')
    return savedGrid ? JSON.parse(savedGrid) : []
  })

  // Initialize locked cells from localStorage or as an empty array
  const [locked, setLocked] = useState<boolean[][]>(() => {
    const savedLocked = localStorage.getItem('latinHamLocked')
    return savedLocked ? JSON.parse(savedLocked) : []
  })

  // Initialize edited cells from localStorage or as an empty array
  const [edited, setEdited] = useState<boolean[][]>(() => {
    const savedEdited = localStorage.getItem('latinHamEdited')
    return savedEdited ? JSON.parse(savedEdited) : []
  })

  // Initialize game state from localStorage or default to 'start'
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'viewing'>(() => {
    const savedGameState = localStorage.getItem('latinHamGameState') as 'start' | 'playing' | 'won' | 'viewing'
    return savedGameState || 'start'
  })

  // Initialize difficulty from localStorage or default to 'easy'
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => {
    const savedDifficulty = localStorage.getItem('latinHamDifficulty') as 'easy' | 'medium' | 'hard'
    return savedDifficulty || 'easy'
  })

  // Initialize hints from localStorage or as an empty array
  const [hints, setHints] = useState<boolean[][]>(() => {
    const savedHints = localStorage.getItem('latinHamHints')
    return savedHints ? JSON.parse(savedHints) : []
  })

  // State to toggle the visibility of numbers
  const [showNumbers, setShowNumbers] = useState<boolean>(false)

  // Initialize the solution grid from localStorage or as an empty array
  const [solution, setSolution] = useState<number[][]>(() => {
    const savedSolution = localStorage.getItem('latinHamSolution')
    return savedSolution ? JSON.parse(savedSolution) : []
  })

  // Initialize the initial grid from localStorage or as an empty array
  const [initialGrid, setInitialGrid] = useState<number[][]>(() => {
    const savedInitialGrid = localStorage.getItem('latinHamInitialGrid')
    return savedInitialGrid ? JSON.parse(savedInitialGrid) : []
  })

  // State to toggle trash mode
  const [isTrashMode, setIsTrashMode] = useState<boolean>(false)

  // Initialize move count from localStorage or default to 0
  const [moveCount, setMoveCount] = useState<number>(() => {
    const savedMoveCount = localStorage.getItem('latinHamMoveCount')
    return savedMoveCount ? parseInt(savedMoveCount) : 0
  })

  // Initialize hint count from localStorage or default to 0
  const [hintCount, setHintCount] = useState<number>(() => {
    const savedHintCount = localStorage.getItem('latinHamHintCount')
    return savedHintCount ? parseInt(savedHintCount) : 0
  })

  // Initialize start time from localStorage or as null
  const [startTime, setStartTime] = useState<number | null>(() => {
    const savedStartTime = localStorage.getItem('latinHamStartTime')
    return savedStartTime ? parseInt(savedStartTime) : null
  })

  // Initialize elapsed time from localStorage or default to 0
  const [elapsedTime, setElapsedTime] = useState<number>(() => {
    const savedElapsedTime = localStorage.getItem('latinHamElapsedTime')
    return savedElapsedTime ? parseInt(savedElapsedTime) : 0
  })

  // State to track if hints are currently active
  const [hintsActive, setHintsActive] = useState<boolean>(false)

  // Persist relevant state variables to localStorage whenever they change
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

  // Handler for clicking a cell in the grid
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || locked[row][col]) return // Do nothing if game isn't in 'playing' state or cell is locked

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]) // Create a copy of the grid

      if (isTrashMode) {
        // If trash mode is active, remove the number if it's been edited and not zero
        if (edited[row][col] && newGrid[row][col] !== 0) {
          newGrid[row][col] = 0
          setMoveCount(prevCount => prevCount + 1) // Increment move count
        }
      } else {
        // Cycle the number in the cell between 1 and 6
        newGrid[row][col] = (newGrid[row][col] % 6) + 1
        setMoveCount(prevCount => prevCount + 1) // Increment move count
      }

      // Check if the new grid meets the win condition
      if (checkWin(newGrid)) {
        setGameState('won') // Update game state to 'won'
        setStartTime(null) // Stop the timer
      }

      return newGrid
    })

    setEdited(prevEdited => {
      const newEdited = prevEdited.map(r => [...r]) // Create a copy of the edited array
      // Update the edited status based on trash mode and cell value
      newEdited[row][col] = !isTrashMode || (isTrashMode && grid[row][col] !== 0)
      return newEdited
    })

    // Reset hints and visibility settings
    setHints(Array(6).fill(false).map(() => Array(6).fill(false)))
    setShowNumbers(false)
    setHintsActive(false)
    setIsTrashMode(false)
  }, [gameState, locked, isTrashMode, edited, grid])

  // Handler to select game difficulty and initialize the game
  const handleSelectDifficulty = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty) // Update difficulty state
    initializeGame(selectedDifficulty) // Initialize the game with the selected difficulty
  }, [])

  // Handler to start a new game with the current difficulty
  const handleNewGame = useCallback(() => {
    initializeGame(difficulty) // Initialize the game
  }, [difficulty])

  // Handler to provide hints to the player
  const handleHint = useCallback(() => {
    if (checkWin(grid)) {
      setGameState('won') // If already won, set game state to 'won'
      return
    }

    if (hintsActive) {
      // If hints are active, deactivate them
      setHints(Array(6).fill(false).map(() => Array(6).fill(false)))
      setHintsActive(false)
    } else {
      // Generate hints based on the current grid and edited cells
      const newHints = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!edited[rowIndex][colIndex] || cell === 0) return false // No hint for unedited or empty cells
          for (let i = 0; i < 6; i++) {
            if (i !== colIndex && grid[rowIndex][i] === cell) return true // Check row for duplicates
            if (i !== rowIndex && grid[i][colIndex] === cell) return true // Check column for duplicates
          }
          return false
        })
      )

      // If any hints are found, activate them and increment hint count
      if (newHints.some(row => row.some(cell => cell))) {
        setHints(newHints)
        setHintsActive(true)
        setHintCount(prevCount => prevCount + 1)
      }
    }
  }, [grid, edited, hintsActive])

  // Handler to reset the game to the initial state
  const handleReset = useCallback(() => {
    setGrid(initialGrid.map(row => [...row])) // Reset grid to initial state
    setEdited(Array(6).fill(false).map(() => Array(6).fill(false))) // Reset edited cells
    setHints(Array(6).fill(false).map(() => Array(6).fill(false))) // Reset hints
    setShowNumbers(false) // Hide numbers
    setIsTrashMode(false) // Deactivate trash mode
    setMoveCount(0) // Reset move count
    setHintCount(0) // Reset hint count
    setStartTime(Date.now()) // Restart the timer
    setElapsedTime(0) // Reset elapsed time
    setGameState('playing') // Set game state to 'playing'
    setHintsActive(false) // Deactivate hints

    // Check for win condition after resetting the game
    if (checkWin(initialGrid)) {
      setGameState('won') // If initial grid meets win condition, set game state to 'won'
      setStartTime(null) // Stop the timer
    }
  }, [initialGrid])

  // Handler to toggle trash mode
  const handleTrashToggle = useCallback(() => {
    setIsTrashMode(prevMode => !prevMode) // Toggle the trash mode state
  }, [])

  // Function to initialize the game with a selected difficulty
  const initializeGame = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    const newSolution = createLatinSquare() // Create a new Latin square solution
    setSolution(newSolution) // Set the solution state

    // Initialize a new empty grid
    const newGrid = Array(6).fill(0).map(() => Array(6).fill(0))
    const newLocked = Array(6).fill(false).map(() => Array(6).fill(false)) // Initialize locked cells as false
    const newEdited = Array(6).fill(false).map(() => Array(6).fill(false)) // Initialize edited cells as false

    prefillCells(newGrid, newLocked, selectedDifficulty) // Prefill cells based on difficulty
    setGrid(newGrid) // Set the new grid
    setInitialGrid(newGrid.map(row => [...row])) // Save the initial grid
    setLocked(newLocked) // Set the locked cells
    setEdited(newEdited) // Set the edited cells
    setHints(Array(6).fill(false).map(() => Array(6).fill(false))) // Reset hints
    setShowNumbers(false) // Hide numbers
    setIsTrashMode(false) // Deactivate trash mode
    setMoveCount(0) // Reset move count
    setHintCount(0) // Reset hint count
    setStartTime(Date.now()) // Start the timer
    setElapsedTime(0) // Reset elapsed time
    setGameState('playing') // Set game state to 'playing'
    setHintsActive(false) // Deactivate hints
    setDifficulty(selectedDifficulty) // Update difficulty state

    // Check for win condition after initializing the game
    if (checkWin(newGrid)) {
      setGameState('won') // If the new grid meets the win condition, set game state to 'won'
      setStartTime(null) // Stop the timer
    }
  }, [])

  // Function to reset the game with a new initial grid
  const resetGame = useCallback((newInitialGrid: number[][]) => {
    console.log("Resetting game with initial grid:", newInitialGrid) // Log the reset action
    setGrid(newInitialGrid.map(row => [...row])) // Set the grid to the new initial grid
    setInitialGrid(newInitialGrid) // Update the initial grid state
    setLocked(newInitialGrid.map(row => row.map(cell => cell !== 0))) // Lock cells that are non-zero
    setEdited(Array(6).fill(false).map(() => Array(6).fill(false))) // Reset edited cells
    setHints(Array(6).fill(false).map(() => Array(6).fill(false))) // Reset hints
    setShowNumbers(false) // Hide numbers
    setIsTrashMode(false) // Deactivate trash mode
    setMoveCount(0) // Reset move count
    setHintCount(0) // Reset hint count
    setStartTime(Date.now()) // Start the timer
    setElapsedTime(0) // Reset elapsed time
    setGameState('playing') // Set game state to 'playing'
    setHintsActive(false) // Deactivate hints

    // Check for win condition after resetting the game
    if (checkWin(newInitialGrid)) {
      setGameState('won') // If the new initial grid meets the win condition, set game state to 'won'
      setStartTime(null) // Stop the timer
    }
  }, [])

  // Effect to handle the game timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && startTime !== null) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1) // Increment elapsed time every second
      }, 1000)
    }
    return () => clearInterval(timer) // Clean up the timer on component unmount or when dependencies change
  }, [gameState, startTime])

  // Return all relevant state and handler functions for use in components
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
