import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

interface LeaderboardEntry {
  timestamp: string;
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][];
  quote: string;
  hints: number;
}

interface DatabaseEntry {
  timestamp: Date;
  moves: number | string;
  time: number | string;
  grid: string | number[][];
  initial_grid: string | number[][];
  quote: string | null;
  hints: number | string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const difficulty = searchParams.get('difficulty')

  if (!difficulty) {
    return NextResponse.json({ error: 'Difficulty parameter is required' }, { status: 400 })
  }

  try {
    const result = await sql<DatabaseEntry>`
      SELECT * FROM leaderboard_entries 
      WHERE difficulty = ${difficulty} 
      ORDER BY moves ASC 
      LIMIT 12
    `

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
        } as LeaderboardEntry
      } catch (parseError) {
        console.error('Error parsing entry:', entry, parseError)
        return null
      }
    }).filter((entry): entry is LeaderboardEntry => entry !== null)

    console.log('Fetched leaderboard:', JSON.stringify(formattedLeaderboard))

    return NextResponse.json(formattedLeaderboard)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

function parseJsonField(field: string | number[][]): number[][] {
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