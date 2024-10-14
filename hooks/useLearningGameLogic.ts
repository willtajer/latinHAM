import { useState, useCallback, useEffect } from 'react'
import { LEARNING_GRID_SIZE, CellState, checkWin } from '@/utils/learningGameLogic'

interface LearningGameState {
  grid: CellState[][]
  locked: boolean[][]
  solution: number[][]
  isComplete: boolean
  moveCount: number
}

function generateSolvableGrid(): [CellState[][], boolean[][], number[][]] {
  const solution = Array(LEARNING_GRID_SIZE).fill(null).map(() => Array(LEARNING_GRID_SIZE).fill(0))
  const grid: CellState[][] = Array(LEARNING_GRID_SIZE).fill(null).map(() => Array(LEARNING_GRID_SIZE).fill(0))
  const locked: boolean[][] = Array(LEARNING_GRID_SIZE).fill(null).map(() => Array(LEARNING_GRID_SIZE).fill(false))

  // Fill the diagonal
  for (let i = 0; i < LEARNING_GRID_SIZE; i++) {
    const value = Math.floor(Math.random() * LEARNING_GRID_SIZE) + 1
    solution[i][i] = value
    grid[i][i] = value as CellState
    locked[i][i] = true
  }

  // Fill one more random cell
  let row: number, col: number
  do {
    row = Math.floor(Math.random() * LEARNING_GRID_SIZE)
    col = Math.floor(Math.random() * LEARNING_GRID_SIZE)
  } while (locked[row][col])

  let value: number
  do {
    value = Math.floor(Math.random() * LEARNING_GRID_SIZE) + 1
  } while (solution[row].includes(value) || solution.map(r => r[col]).includes(value))

  solution[row][col] = value
  grid[row][col] = value as CellState
  locked[row][col] = true

  // Complete the solution
  for (let i = 0; i < LEARNING_GRID_SIZE; i++) {
    for (let j = 0; j < LEARNING_GRID_SIZE; j++) {
      if (solution[i][j] === 0) {
        for (let num = 1; num <= LEARNING_GRID_SIZE; num++) {
          if (!solution[i].includes(num) && !solution.map(r => r[j]).includes(num)) {
            solution[i][j] = num
            break
          }
        }
      }
    }
  }

  return [grid, locked, solution]
}

export function useLearningGameLogic() {
  const [gameState, setGameState] = useState<LearningGameState>(() => initializeGame())

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

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.locked[row][col] || gameState.isComplete) return

    setGameState(prevState => {
      const newGrid = prevState.grid.map(r => [...r])
      newGrid[row][col] = ((newGrid[row][col] % LEARNING_GRID_SIZE) + 1) as CellState
      const isComplete = checkWin(newGrid)
      return {
        ...prevState,
        grid: newGrid,
        isComplete,
        moveCount: prevState.moveCount + 1,
      }
    })
  }, [gameState.locked, gameState.isComplete])

  const resetGame = useCallback(() => {
    setGameState(initializeGame())
  }, [])

  useEffect(() => {
    if (gameState.isComplete) {
      console.log('Congratulations! You completed the learning game!')
    }
  }, [gameState.isComplete])

  return {
    grid: gameState.grid,
    locked: gameState.locked,
    isComplete: gameState.isComplete,
    moveCount: gameState.moveCount,
    handleCellClick,
    resetGame,
  }
}