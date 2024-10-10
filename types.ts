// src/types.ts

export interface LeaderboardEntry {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  moves: number
  time: number
  grid: number[][]
  initialGrid: number[][]
  quote: string
  hints: number
  timestamp: string
}

export interface LatinHAM {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  initialGrid: number[][]
  solveCount: number
  bestMoves: number
  bestTime: number
}