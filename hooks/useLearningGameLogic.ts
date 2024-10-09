import { useState, useCallback, useEffect } from 'react'
import { LEARNING_GRID_SIZE, CellState, createLatinSquare, createPartiallyFilledGrid, checkWin } from '@/utils/learningGameLogic'

interface LearningGameState {
  grid: CellState[][]
  locked: boolean[][]
  solution: number[][]
  isComplete: boolean
  moveCount: number
}

export function useLearningGameLogic() {
  const [gameState, setGameState] = useState<LearningGameState>(() => initializeGame())

  function initializeGame(): LearningGameState {
    const solution = createLatinSquare()
    const { grid, locked } = createPartiallyFilledGrid(solution)
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
      newGrid[row][col] = ((newGrid[row][col] % 3) + 1) as CellState
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