import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request)
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get current time in Bangkok
    const now = new Date()
    const bangkokOffset = 7 * 60 * 60 * 1000 // 7 hours in milliseconds
    const bangkokTime = new Date(now.getTime() + bangkokOffset)

    // Calculate the start of the current week (Sunday)
    const startOfWeek = new Date(bangkokTime)
    startOfWeek.setUTCHours(0, 0, 0, 0)
    startOfWeek.setUTCDate(bangkokTime.getUTCDate() - bangkokTime.getUTCDay())

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
        AND le.timestamp >= ${startOfWeek.toISOString()}
      ORDER BY 
        le.timestamp DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    if (result.rows.length === 0 && offset === 0) {
      return NextResponse.json({ error: 'No games played this week' }, { status: 404 })
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

    // Get total count of games for pagination (only for the current week)
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM leaderboard_entries
      WHERE user_id = ${userId}
        AND timestamp >= ${startOfWeek.toISOString()}
    `

    const totalGames = parseInt(countResult.rows[0].total, 10)

    return NextResponse.json({ ...userData, totalGames })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}