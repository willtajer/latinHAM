import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface CompletedPuzzle {
  id: string;
  timestamp: string;
  difficulty: 'easy' | 'medium' | 'hard';
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][];
  quote: string;
  hints: number;
}

interface DatabaseEntry {
  id: string;
  timestamp: Date;
  difficulty: 'easy' | 'medium' | 'hard';
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  const [difficulty, moves, time, initialGridJson] = id.split('-')

  try {
    const initialGrid = JSON.parse(decodeURIComponent(initialGridJson))
    const result = await sql<DatabaseEntry>`
      SELECT *
      FROM leaderboard_entries
      WHERE difficulty = ${difficulty}
        AND moves = ${parseInt(moves)}
        AND time = ${parseInt(time)}
        AND initial_grid = ${JSON.stringify(initialGrid)}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      // If no exact match is found, try to find the closest match
      const closestResult = await sql<DatabaseEntry>`
        SELECT *
        FROM leaderboard_entries
        WHERE difficulty = ${difficulty}
          AND initial_grid = ${JSON.stringify(initialGrid)}
        ORDER BY 
          ABS(moves - ${parseInt(moves)}) + ABS(time - ${parseInt(time)})
        LIMIT 1
      `

      if (closestResult.rows.length === 0) {
        return NextResponse.json({ error: 'Completed puzzle not found' }, { status: 404 })
      }

      return formatAndReturnPuzzle(closestResult.rows[0])
    }

    return formatAndReturnPuzzle(result.rows[0])

  } catch (error) {
    console.error('Error fetching completed puzzle:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function formatAndReturnPuzzle(entry: DatabaseEntry): NextResponse {
  try {
    const formattedPuzzle: CompletedPuzzle = {
      id: entry.id,
      timestamp: new Date(entry.timestamp).toISOString(),
      difficulty: entry.difficulty,
      moves: Number(entry.moves),
      time: Number(entry.time),
      grid: parseJsonField(entry.grid),
      initialGrid: parseJsonField(entry.initial_grid),
      quote: entry.quote || '',
      hints: Number(entry.hints)
    }

    console.log('Fetched completed puzzle:', JSON.stringify(formattedPuzzle))

    return NextResponse.json(formattedPuzzle)
  } catch (parseError) {
    console.error('Error parsing entry:', entry, parseError)
    return NextResponse.json({ error: 'Error parsing completed puzzle' }, { status: 500 })
  }
}