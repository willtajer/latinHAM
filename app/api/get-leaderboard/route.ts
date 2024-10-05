import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const difficulty = searchParams.get('difficulty')

  if (!difficulty) {
    return NextResponse.json({ error: 'Difficulty parameter is required' }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT * FROM leaderboard_entries 
      WHERE difficulty = ${difficulty} 
      ORDER BY moves ASC 
      LIMIT 12
    `

    // Ensure the returned data matches the LeaderboardEntry type
    const formattedLeaderboard = result.rows.map(entry => {
      try {
        return {
          timestamp: new Date(entry.timestamp).toISOString(),
          moves: Number(entry.moves),
          time: Number(entry.time),
          grid: parseJsonField(entry.grid),
          initialGrid: parseJsonField(entry.initial_grid),
          quote: entry.quote || '',
          hints: Number(entry.hints)
        }
      } catch (parseError) {
        console.error('Error parsing entry:', entry, parseError)
        return null
      }
    }).filter(Boolean)

    console.log('Fetched leaderboard:', JSON.stringify(formattedLeaderboard))

    return NextResponse.json(formattedLeaderboard)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

function parseJsonField(field: any): any[] {
  if (Array.isArray(field)) {
    return field
  }
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing JSON field:', field, error)
      return []
    }
  }
  console.error('Invalid field type:', typeof field)
  return []
}