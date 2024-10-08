// app/api/discovered-latinhams/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

interface DiscoveredLatinHAM {
  preset: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  solveCount: number;
  bestMoves: number;
  bestTime: number;
}

interface DatabaseEntry {
  initial_grid: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solve_count: number | string;
  best_moves: number | string;
  best_time: number | string;
}

function parseJsonField(field: string): number[][] {
  try {
    return JSON.parse(field);
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await sql<DatabaseEntry>`
      WITH distinct_grids AS (
        SELECT DISTINCT initial_grid, difficulty
        FROM leaderboard_entries
      ),
      grid_stats AS (
        SELECT 
          initial_grid,
          difficulty,
          COUNT(*) as solve_count,
          MIN(moves) as best_moves,
          MIN(time) as best_time
        FROM leaderboard_entries
        GROUP BY initial_grid, difficulty
      )
      SELECT 
        dg.initial_grid,
        dg.difficulty,
        gs.solve_count,
        gs.best_moves,
        gs.best_time
      FROM distinct_grids dg
      JOIN grid_stats gs ON dg.initial_grid = gs.initial_grid AND dg.difficulty = gs.difficulty
      ORDER BY gs.solve_count DESC, gs.best_moves ASC, gs.best_time ASC
    `

    const formattedLatinHAMs = result.rows.map(entry => {
      try {
        return {
          preset: parseJsonField(entry.initial_grid),
          difficulty: entry.difficulty,
          solveCount: Number(entry.solve_count),
          bestMoves: Number(entry.best_moves),
          bestTime: Number(entry.best_time)
        } as DiscoveredLatinHAM
      } catch (parseError) {
        console.error('Error parsing entry:', entry, parseError)
        return null
      }
    }).filter((entry): entry is DiscoveredLatinHAM => entry !== null)

    console.log('Fetched discovered latinHAMs:', JSON.stringify(formattedLatinHAMs))

    return NextResponse.json(formattedLatinHAMs)
  } catch (error) {
    console.error('Failed to fetch discovered latinHAMs:', error)
    return NextResponse.json({ error: 'Failed to fetch discovered latinHAMs' }, { status: 500 })
  }
}