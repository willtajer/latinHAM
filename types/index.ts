export interface LeaderboardEntry {
    id: string;
    timestamp: string;
    moves: number;
    time: number;
    grid: number[][];
    initialGrid: number[][];
    quote: string;
    hints: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }