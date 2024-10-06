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