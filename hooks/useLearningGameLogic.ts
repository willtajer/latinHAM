import { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '../types'
import { useUser } from '@clerk/nextjs'

// Constant defining the size of the learning grid
export const LEARNING_GRID_SIZE = 3

// Type definition for the state of each cell in the grid
export type CellState = 0 | 1 | 2 | 3

// Interface defining the structure of the game's state
interface LearningGameState {
  grid: CellState[][]          // Current state of the game grid
  locked: boolean[][]          // Indicates which cells are locked and cannot be changed
  solution: number[][]         // The correct solution grid
  isComplete: boolean          // Flag to indicate if the game is completed
  moveCount: number            // Number of moves made by the player
}

// Function to create a randomized Latin square
function createLatinSquare(): number[][] {
  const base = [1, 2, 3]
  const square = [
    [...base],
    [base[1], base[2], base[0]],
    [base[2], base[0], base[1]]
  ]
  
  // Shuffle rows to randomize the Latin square
  for (let i = square.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [square[i], square[j]] = [square[j], square[i]]
  }

  return square
}

// Function to prefill a certain number of cells in the grid based on difficulty
function prefillCells(grid: CellState[][], locked: boolean[][], solution: number[][]): void {
  const cellsToFill = 3 // Number of cells to prefill
  const positions = Array.from({ length: LEARNING_GRID_SIZE * LEARNING_GRID_SIZE }, (_, i) => i)
    .sort(() => Math.random() - 0.5) // Shuffle positions
    .slice(0, cellsToFill)             // Select positions to fill

  // Prefill selected cells with the solution and lock them
  for (const pos of positions) {
    const row = Math.floor(pos / LEARNING_GRID_SIZE)
    const col = pos % LEARNING_GRID_SIZE
    grid[row][col] = solution[row][col] as CellState
    locked[row][col] = true
  }
}

// Function to generate a solvable grid by creating a Latin square and prefilling cells
function generateSolvableGrid(): [CellState[][], boolean[][], number[][]] {
  const solution = createLatinSquare() // Generate the solution
  const grid: CellState[][] = Array(LEARNING_GRID_SIZE).fill(null).map(() => Array(LEARNING_GRID_SIZE).fill(0)) // Initialize empty grid
  const locked: boolean[][] = Array(LEARNING_GRID_SIZE).fill(null).map(() => Array(LEARNING_GRID_SIZE).fill(false)) // Initialize all cells as unlocked

  prefillCells(grid, locked, solution) // Prefill cells based on the solution

  return [grid, locked, solution] // Return the initialized grid, locked cells, and solution
}

// Custom hook to manage the learning game's logic
export function useLearningGameLogic() {
  // Initialize game state using the generated solvable grid
  const [gameState, setGameState] = useState<LearningGameState>(() => initializeGame())

  // Function to initialize the game state
  function initializeGame(): LearningGameState {
    const [grid, locked, solution] = generateSolvableGrid()
    return {
      grid,
      locked,
      solution,
      isComplete: false,
      moveCount: 0,
    }
  }

  // Handler for when a cell is clicked
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.locked[row][col] || gameState.isComplete) return // Ignore clicks on locked cells or if the game is complete

    setGameState(prevState => {
      const newGrid = prevState.grid.map(r => [...r]) // Create a copy of the grid

      // Cycle the cell's value between 1 and grid size
      newGrid[row][col] = ((newGrid[row][col] % LEARNING_GRID_SIZE) + 1) as CellState

      // Check if the new grid satisfies the win condition
      const isComplete = checkWin(newGrid)

      return {
        ...prevState,
        grid: newGrid,
        isComplete,
        moveCount: prevState.moveCount + 1, // Increment move count
      }
    })
  }, [gameState.locked, gameState.isComplete])

  // Handler to reset the game to its initial state
  const resetGame = useCallback(() => {
    setGameState(initializeGame()) // Re-initialize the game state
  }, [])

  // Effect to log a message when the game is completed
  useEffect(() => {
    if (gameState.isComplete) {
      console.log('Congratulations! You completed the learning game!')
    }
  }, [gameState.isComplete])

  // Return the game state and handler functions for use in components
  return {
    grid: gameState.grid,
    locked: gameState.locked,
    isComplete: gameState.isComplete,
    moveCount: gameState.moveCount,
    handleCellClick,
    resetGame,
  }
}

// Function to check if the current grid satisfies the win condition
function checkWin(grid: CellState[][]): boolean {
  for (let i = 0; i < LEARNING_GRID_SIZE; i++) {
    const rowSet = new Set(grid[i]) // Check for unique values in the row
    const colSet = new Set(grid.map(row => row[i])) // Check for unique values in the column
    if (rowSet.size !== LEARNING_GRID_SIZE || rowSet.has(0) || colSet.size !== LEARNING_GRID_SIZE || colSet.has(0)) {
      return false // Return false if duplicates or empty cells are found
    }
  }
  return true // Return true if all rows and columns are valid
}
