import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT 
        le.id, le.difficulty, le.moves, le.time, le.grid, le.initial_grid, le.quote, le.hints, le.timestamp,
        up.username,
        up.created_at AS user_created_at
      FROM 
        leaderboard_entries le
      LEFT JOIN 
        user_profiles up ON le.user_id = up.clerk_user_id
      WHERE
        le.user_id = ${userId}
      ORDER BY 
        le.timestamp DESC
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found or no games played' }, { status: 404 })
    }

    const userData = {
      username: result.rows[0]?.username,
      user_created_at: result.rows[0]?.user_created_at,
      games: result.rows.map(row => ({
        id: row.id,
        difficulty: row.difficulty,
        moves: row.moves,
        time: row.time,
        hints: row.hints,
        created_at: row.timestamp,
        grid: Array.isArray(row.grid) ? row.grid : JSON.parse(row.grid),
        initialGrid: Array.isArray(row.initial_grid) ? row.initial_grid : JSON.parse(row.initial_grid),
        quote: row.quote
      }))
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}