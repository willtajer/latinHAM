import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    const result = await sql`
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
    
    const latinHAMs = result.rows.map(row => ({
      preset: JSON.parse(row.initial_grid),
      difficulty: row.difficulty,
      solveCount: parseInt(row.solve_count),
      bestMoves: parseInt(row.best_moves),
      bestTime: parseInt(row.best_time)
    }))

    return NextResponse.json(latinHAMs)
  } catch (error) {
    console.error('Error fetching discovered latinHAMs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}