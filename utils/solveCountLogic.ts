// solveCountLogic.ts

export const BOARD_SIZE = 6;

export function calculateSolveCount(grid: number[][]): number {
  function isValid(row: number, col: number, num: number): boolean {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (grid[row][x] === num || grid[x][col] === num) {
        return false;
      }
    }
    return true;
  }

  function backtrack(row: number, col: number): number {
    if (col === BOARD_SIZE) {
      return backtrack(row + 1, 0);
    }
    
    if (row === BOARD_SIZE) {
      return 1; // Found a valid solution
    }
    
    if (grid[row][col] !== 0) {
      return backtrack(row, col + 1);
    }
    
    let count = 0;
    for (let num = 1; num <= BOARD_SIZE; num++) {
      if (isValid(row, col, num)) {
        grid[row][col] = num;
        count += backtrack(row, col + 1);
        grid[row][col] = 0; // Backtrack
      }
    }
    return count;
  }

  return backtrack(0, 0);
}