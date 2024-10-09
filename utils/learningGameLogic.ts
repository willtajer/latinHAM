export const LEARNING_GRID_SIZE = 3

export type CellState = 0 | 1 | 2 | 3

export function createLatinSquare(): number[][] {
  const square: number[][] = [
    [1, 2, 3],
    [2, 3, 1],
    [3, 1, 2],
  ]
  return shuffleSquare(square)
}

function shuffleSquare(square: number[][]): number[][] {
  const shuffled = square.map(row => [...row])
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.map(row => {
    for (let i = row.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [row[i], row[j]] = [row[j], row[i]]
    }
    return row
  })
}

export function createPartiallyFilledGrid(solution: number[][]): { grid: CellState[][], locked: boolean[][] } {
  const grid: CellState[][] = Array(LEARNING_GRID_SIZE).fill(0).map(() => Array(LEARNING_GRID_SIZE).fill(0))
  const locked: boolean[][] = Array(LEARNING_GRID_SIZE).fill(false).map(() => Array(LEARNING_GRID_SIZE).fill(false))

  const cellsToFill = 3
  let filledCells = 0

  while (filledCells < cellsToFill) {
    const row = Math.floor(Math.random() * LEARNING_GRID_SIZE)
    const col = Math.floor(Math.random() * LEARNING_GRID_SIZE)
    if (!locked[row][col] && isValidPlacement(grid, row, col, solution[row][col])) {
      grid[row][col] = solution[row][col] as CellState
      locked[row][col] = true
      filledCells++
    }
  }

  return { grid, locked }
}

function isValidPlacement(grid: CellState[][], row: number, col: number, value: number): boolean {
  // Check row
  for (let i = 0; i < LEARNING_GRID_SIZE; i++) {
    if (grid[row][i] === value) return false
  }

  // Check column
  for (let i = 0; i < LEARNING_GRID_SIZE; i++) {
    if (grid[i][col] === value) return false
  }

  return true
}

export function checkWin(grid: CellState[][]): boolean {
  for (let i = 0; i < LEARNING_GRID_SIZE; i++) {
    const rowSet = new Set(grid[i])
    const colSet = new Set(grid.map(row => row[i]))
    if (rowSet.size < LEARNING_GRID_SIZE || rowSet.has(0) || colSet.size < LEARNING_GRID_SIZE || colSet.has(0)) {
      return false
    }
  }
  return true
}