import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

interface LeaderboardEntry {
  id: string;
  username: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: string;
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][];
  quote: string;
  hints: number;
}

interface DatabaseEntry {
  id: string;
  username: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: Date;
  moves: number | string;
  time: number | string;
  grid: string | number[][];
  initial_grid: string | number[][];
  quote: string | null;
  hints: number | string;
}

function parseJsonField(field: string | number[][]): number[][] {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.error('Error parsing JSON field:', error);
      return [];
    }
  }
  return field;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const difficulty = searchParams.get('difficulty')

  if (!difficulty) {
    return NextResponse.json({ error: 'Difficulty parameter is required' }, { status: 400 })
  }

  try {
    const result = await sql<DatabaseEntry>`
      SELECT 
        le.id, le.difficulty, le.moves, le.time, le.grid, le.initial_grid, le.quote, le.hints, le.timestamp,
        COALESCE(up.username, 'Anonymous') as username
      FROM 
        leaderboard_entries le
      LEFT JOIN 
        user_profiles up ON le.user_id = up.clerk_user_id
      WHERE 
        le.difficulty = ${difficulty}
      ORDER BY 
        le.moves ASC, le.time ASC
      LIMIT 100
    `

    const formattedLeaderboard = result.rows.map(entry => {
      try {
        return {
          id: entry.id,
          username: entry.username,
          difficulty: entry.difficulty,
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