export interface LatinHAM {
  id: string;
  initialGrid: number[][]
  difficulty: 'easy' | 'medium' | 'hard'
  solveCount: number
  bestMoves: number
  bestTime: number
}

export interface LeaderboardEntry {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][]; // Changed from initial_grid to initialGrid
  quote: string;
  hints: number;
  timestamp: string;
}

export interface CompletedPuzzle {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][];
  hints: number;
  quote: string;
}