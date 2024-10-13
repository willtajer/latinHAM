import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface LatinHAMStats {
  initialGrid: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  solveCount: number;
  uniqueSolveCount: number;
  bestMoves: number;
  bestMovesPlayer: string;
  bestTime: number;
  bestTimePlayer: string;
}

interface DatabaseEntry {
  initial_grid: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solve_count: number;
  unique_solve_count: number;
  best_moves: number;
  best_moves_player: string;
  best_time: number;
  best_time_player: string;
}

function parseJsonField(field: string): number[][] {
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed) && parsed.every(row => Array.isArray(row))) {
      return parsed;
    }
    throw new Error('Parsed value is not a 2D array');
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return [];
  }
}

export async function GET() {
  try {
    const result = await sql<DatabaseEntry>`
      WITH ranked_entries AS (
        SELECT 
          initial_grid,
          difficulty,
          moves,
          time,
          username,
          ROW_NUMBER() OVER (PARTITION BY initial_grid, difficulty ORDER BY moves ASC) as move_rank,
          ROW_NUMBER() OVER (PARTITION BY initial_grid, difficulty ORDER BY time ASC) as time_rank
        FROM leaderboard_entries
        WHERE grid IS NOT NULL AND grid != 'null'
      )
      SELECT 
        e.initial_grid,
        e.difficulty,
        COUNT(*) as solve_count,
        COUNT(DISTINCT e.grid) as unique_solve_count,
        MIN(e.moves) as best_moves,
        bm.username as best_moves_player,
        MIN(e.time) as best_time,
        bt.username as best_time_player
      FROM leaderboard_entries e
      LEFT JOIN ranked_entries bm ON e.initial_grid = bm.initial_grid AND e.difficulty = bm.difficulty AND bm.move_rank = 1
      LEFT JOIN ranked_entries bt ON e.initial_grid = bt.initial_grid AND e.difficulty = bt.difficulty AND bt.time_rank = 1
      WHERE e.grid IS NOT NULL AND e.grid != 'null'
      GROUP BY e.initial_grid, e.difficulty, bm.username, bt.username
      ORDER BY solve_count DESC, best_moves ASC, best_time ASC
    `

    const formattedLatinHAMStats = result.rows.map(entry => {
      try {
        const initialGrid = parseJsonField(entry.initial_grid);
        if (initialGrid.length === 0) {
          console.error('Invalid initial_grid:', entry.initial_grid);
          return null;
        }
        return {
          initialGrid: initialGrid,
          difficulty: entry.difficulty,
          solveCount: Number(entry.solve_count),
          uniqueSolveCount: Number(entry.unique_solve_count),
          bestMoves: Number(entry.best_moves),
          bestMovesPlayer: entry.best_moves_player || 'Anonymous',
          bestTime: Number(entry.best_time),
          bestTimePlayer: entry.best_time_player || 'Anonymous'
        } as LatinHAMStats
      } catch (parseError) {
        console.error('Error parsing entry:', entry, parseError)
        return null
      }
    }).filter((entry): entry is LatinHAMStats => entry !== null)

    console.log('Fetched latinHAM stats:', JSON.stringify(formattedLatinHAMStats))

    return NextResponse.json(formattedLatinHAMStats)
  } catch (error) {
    console.error('Failed to fetch latinHAM stats:', error)
    return NextResponse.json({ error: 'Failed to fetch latinHAM stats' }, { status: 500 })
  }
}