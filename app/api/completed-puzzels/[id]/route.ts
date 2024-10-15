// pages/api/leaderboard/[id].ts

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Interface representing the structure of a completed puzzle to be returned
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

// Interface representing the structure of a database entry
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

/**
 * Parses a JSON field that may be a string or a number[][].
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
 * GET handler to fetch a completed puzzle from the leaderboard based on the provided ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the puzzle ID.
 * @returns A JSON response containing the completed puzzle or an error message.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  // Split the ID to extract difficulty, moves, time, and the initial grid in JSON format
  const [difficulty, moves, time, initialGridJson] = id.split('-')

  try {
    // Decode and parse the initial grid JSON
    const initialGrid = JSON.parse(decodeURIComponent(initialGridJson))
    
    // Query the database for an exact match based on difficulty, moves, time, and initial grid
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
      // If no exact match is found, attempt to find the closest match based on difficulty and initial grid
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
        // If no match is found, return a 404 error
        return NextResponse.json({ error: 'Completed puzzle not found' }, { status: 404 })
      }

      // Return the closest matching puzzle
      return formatAndReturnPuzzle(closestResult.rows[0])
    }

    // Return the exact matching puzzle
    return formatAndReturnPuzzle(result.rows[0])

  } catch (error) {
    // Log and return a 500 error if an exception occurs
    console.error('Error fetching completed puzzle:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * Formats a database entry into a CompletedPuzzle object and returns it as a JSON response.
 * @param entry - The database entry to format.
 * @returns A JSON response containing the formatted completed puzzle.
 */
function formatAndReturnPuzzle(entry: DatabaseEntry): NextResponse {
  try {
    // Construct the CompletedPuzzle object by parsing and formatting the database entry
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

    // Return the formatted puzzle as a JSON response
    return NextResponse.json(formattedPuzzle)
  } catch (parseError) {
    // Log and return a 500 error if parsing fails
    console.error('Error parsing entry:', entry, parseError)
    return NextResponse.json({ error: 'Error parsing completed puzzle' }, { status: 500 })
  }
}
