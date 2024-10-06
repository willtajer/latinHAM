// utils/leaderboardUtils.ts

import { LeaderboardEntry } from '../types';

interface CreateLeaderboardEntryParams {
  difficulty: 'easy' | 'medium' | 'hard';
  moveCount: number;
  elapsedTime: number;
  grid: number[][];
  initialGrid: number[][];
  hintCount: number;
  quote: string;
}

export function createLeaderboardEntry(params: CreateLeaderboardEntryParams): LeaderboardEntry {
  const {
    difficulty,
    moveCount,
    elapsedTime,
    grid,
    initialGrid,
    hintCount,
    quote
  } = params;

  return {
    id: generateUniqueId(), // You need to implement this function
    timestamp: new Date().toISOString(),
    moves: moveCount,
    time: elapsedTime,
    grid: grid.map(row => [...row]), // Create a deep copy of the grid
    initialGrid: initialGrid.map(row => [...row]), // Create a deep copy of the initialGrid
    quote: quote,
    hints: hintCount,
    difficulty: difficulty
  };
}

// Implement a function to generate a unique ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}