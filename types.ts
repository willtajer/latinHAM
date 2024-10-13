export interface LeaderboardEntry {
  id: string;
  username: string; // Make sure this line is present
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: string;
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][];
  quote: string;
  hints: number;
}

// Keep other interfaces unchanged
export interface LatinHAM {
  id: string;
  initialGrid: number[][]
  difficulty: 'easy' | 'medium' | 'hard'
  solveCount: number
  bestMoves: number
  bestTime: number
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