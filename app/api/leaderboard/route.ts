// pages/api/leaderboard.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

/**
 * Interface representing the structure of a leaderboard entry to be returned.
 */
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

/**
 * Interface representing the structure of a database entry retrieved from the leaderboard_entries table.
 */
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

/**
 * Parses a field that can either be a JSON string or a number[][].
 * @param field - The field to parse.
 * @returns A number[][] if parsing is successful, otherwise an empty array.
 */
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

/**
 * GET handler to fetch leaderboard entries based on difficulty.
 * @param request - The incoming request object.
 * @returns A JSON response containing an array of LeaderboardEntry objects or an error message.
 */
export async function GET(request: NextRequest) {
  // Extract search parameters from the request URL
  const searchParams = request.nextUrl.searchParams
  const difficulty = searchParams.get('difficulty')

  // Validate that the difficulty parameter is provided
  if (!difficulty) {
    return NextResponse.json({ error: 'Difficulty parameter is required' }, { status: 400 })
  }

  try {
    // Execute SQL query to retrieve leaderboard entries matching the specified difficulty
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

    // Map the database entries to LeaderboardEntry objects, parsing necessary fields
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
    }).filter((entry): entry is LeaderboardEntry => entry !== null) // Filter out any null entries resulting from parsing errors

    console.log('Fetched leaderboard:', JSON.stringify(formattedLeaderboard))

    // Return the formatted leaderboard as a JSON response
    return NextResponse.json(formattedLeaderboard)
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('Failed to fetch leaderboard:', error)
    // Return a 500 Internal Server Error response
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
