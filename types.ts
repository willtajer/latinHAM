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
  initialGrid: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  totalSolves: number;
  solveCount: number;
  uniqueSolves: number;
  bestMoves: number;
  bestMovesPlayer: string;
  bestTime: number;
  bestTimePlayer: string;
}

export interface DiscoveredLatinHAM {
  initialGrid: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  solveCount: number;
  uniqueSolves: number;
  bestMoves: number;
  bestTime: number;
  bestMovesPlayer: string | null;
  bestTimePlayer: string | null;
  possibleSolveCount: number;
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

export interface CompletedPuzzleCardProps {
  entry: LeaderboardEntry;
  difficulty: 'easy' | 'medium' | 'hard';
  gameNumber: number;
  onImageReady?: (imageFile: File) => void;
}