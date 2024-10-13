export interface LeaderboardEntry {
  id: string;
  username?: string; // Username is optional
  difficulty: 'easy' | 'medium' | 'hard';
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][];
  quote: string;
  hints: number;
  timestamp: string;
}

export interface LatinHAM {
  id: string;
  initialGrid: number[][]
  difficulty: 'easy' | 'medium' | 'hard'
  solveCount: number
  bestMoves: number
  bestMovesPlayer?: string // New field
  bestTime: number
  bestTimePlayer?: string // New field
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