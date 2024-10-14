import { useState, useCallback, useEffect } from 'react'

export const LEARNING_GRID_SIZE = 3
export type CellState = 0 | 1 | 2 | 3

interface LearningGameState {
  grid: CellState[][]
  locked: boolean[][]
  solution: number[][]
  isComplete: boolean
  moveCount: number
}

function createLatinSquare(): number[][] {
  const base = [1, 2, 3]
  const square = [
    [...base],
    [base[1], base[2], base[0]],
    [base[2], base[0], base[1]]
  ]
  
  // Shuffle rows
  for (let i = square.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [square[i], square[j]] = [square[j], square[i]]
  }

  return square
}

function prefillCells(grid: CellState[][], locked: boolean[][], solution: number[][]): void {
  const cellsToFill = 3
  const positions = Array.from({ length: LEARNING_GRID_SIZE * LEARNING_GRID_SIZE }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, cellsToFill)

  for (const pos of positions) {
    const row = Math.floor(pos / LEARNING_GRID_SIZE)
    const col = pos % LEARNING_GRID_SIZE
    grid[row][col] = solution[row][col] as CellState
    locked[row][col] = true
  }
}

function generateSolvableGrid(): [CellState[][], boolean[][], number[][]] {
  const solution = createLatinSquare()
  const grid: CellState[][] = Array(LEARNING_GRID_SIZE).fill(null).map(() => Array(LEARNING_GRID_SIZE).fill(0))
  const locked: boolean[][] = Array(LEARNING_GRID_SIZE).fill(null).map(() => Array(LEARNING_GRID_SIZE).fill(false))

  prefillCells(grid, locked, solution)

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

function checkWin(grid: CellState[][]): boolean {
  for (let i = 0; i < LEARNING_GRID_SIZE; i++) {
    const rowSet = new Set(grid[i])
    const colSet = new Set(grid.map(row => row[i]))
    if (rowSet.size !== LEARNING_GRID_SIZE || rowSet.has(0) || colSet.size !== LEARNING_GRID_SIZE || colSet.has(0)) {
      return false
    }
  }
  return true
}