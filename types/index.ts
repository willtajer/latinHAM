// types/index.ts

export interface LeaderboardEntry {
    id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    moves: number;
    time: number;
    grid: number[][];
    initialGrid: number[][];
    quote: string;
    hints: number;
    timestamp: string;
  }