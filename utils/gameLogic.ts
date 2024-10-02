export const BOARD_SIZE = 6;

export function createLatinSquare(): number[][] {
  const square: number[][] = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
  solveLatinSquare(square);
  return square;
}

function isSafe(square: number[][], row: number, col: number, num: number): boolean {
  return !square[row].includes(num) && !square.map(r => r[col]).includes(num);
}

function solveLatinSquare(square: number[][], row: number = 0, col: number = 0): boolean {
  if (row === BOARD_SIZE) return true;
  if (col === BOARD_SIZE) return solveLatinSquare(square, row + 1, 0);

  const nums = shuffleArray([...Array(BOARD_SIZE)].map((_, i) => i + 1));
  for (const num of nums) {
    if (isSafe(square, row, col, num)) {
      square[row][col] = num;
      if (solveLatinSquare(square, row, col + 1)) return true;
      square[row][col] = 0;
    }
  }
  return false;
}

export function prefillCells(grid: number[][], locked: boolean[][], level: 'easy' | 'medium' | 'hard'): void {
  const solvedSquare = createLatinSquare();
  const prefillNum = { easy: 18, medium: 12, hard: 8 }[level];
  let filled = 0;

  while (filled < prefillNum) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (!locked[row][col]) {
      grid[row][col] = solvedSquare[row][col];
      locked[row][col] = true;
      filled++;
    }
  }
}

export function checkWin(grid: number[][]): boolean {
  for (let i = 0; i < BOARD_SIZE; i++) {
    const rowSet = new Set(grid[i]);
    const colSet = new Set(grid.map(row => row[i]));
    if (rowSet.size < BOARD_SIZE || rowSet.has(0) || colSet.size < BOARD_SIZE || colSet.has(0)) {
      return false;
    }
  }
  return true;
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}