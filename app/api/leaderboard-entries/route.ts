// app/api/leaderboard-entries/route.ts
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const initialGrid = searchParams.get('initialGrid')
  const difficulty = searchParams.get('difficulty')

  if (!initialGrid || !difficulty) {
    return NextResponse.json({ error: 'initialGrid and difficulty parameters are required' }, { status: 400 })
  }

  try {
    const result = await sql`
      WITH ranked_entries AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (
            PARTITION BY grid
            ORDER BY moves ASC, time ASC
          ) as row_num
        FROM leaderboard_entries
        WHERE initial_grid = ${initialGrid} AND difficulty = ${difficulty}
      )
      SELECT *
      FROM ranked_entries
      WHERE row_num = 1
      ORDER BY moves ASC, time ASC
    `
    
    const entries = result.rows.map(entry => ({
      ...entry,
      grid: JSON.parse(entry.grid),
      initialGrid: JSON.parse(entry.initial_grid)
    }))

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching leaderboard entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}