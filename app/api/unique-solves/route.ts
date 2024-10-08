import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface LatinHAMStats {
  initialGrid: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  solveCount: number;
  uniqueSolveCount: number;
  bestMoves: number;
  bestTime: number;
}

interface DatabaseEntry {
  initial_grid: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solve_count: number;
  unique_solve_count: number;
  best_moves: number;
  best_time: number;
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
      SELECT 
        initial_grid,
        difficulty,
        COUNT(*) as solve_count,
        COUNT(DISTINCT grid) as unique_solve_count,
        MIN(moves) as best_moves,
        MIN(time) as best_time
      FROM leaderboard_entries
      WHERE grid IS NOT NULL AND grid != 'null'
      GROUP BY initial_grid, difficulty
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
          bestTime: Number(entry.best_time)
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