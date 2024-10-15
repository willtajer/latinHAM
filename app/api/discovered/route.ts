// pages/api/discovered-latinham.ts

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Interface representing the structure of a discovered LatinHAM entry to be returned
interface DiscoveredLatinHAM {
  initialGrid: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  solveCount: number;
  bestMoves: number;
  bestTime: number;
  bestMovesPlayer: string | null;
  bestTimePlayer: string | null;
}

// Interface representing the structure of a database entry
interface DatabaseEntry {
  initial_grid: string | number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  solve_count: number | string;
  best_moves: number | string;
  best_time: number | string;
  best_moves_player: string | null;
  best_time_player: string | null;
}

/**
 * Parses a JSON field that may be a string or a number[][].
 * @param field - The field to parse.
 * @returns A number[][] if parsing is successful, otherwise an empty array.
 */
function parseJsonField(field: string | number[][]): number[][] {
  if (Array.isArray(field)) {
    return field; // Return the array directly if it's already a number[][]
  }
  try {
    const parsed = JSON.parse(field);
    // Ensure the parsed result is a 2D array
    if (Array.isArray(parsed) && parsed.every(row => Array.isArray(row))) {
      return parsed;
    }
    throw new Error('Parsed value is not a 2D array');
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return []; // Return an empty array if parsing fails
  }
}

/**
 * Formats a database entry into a DiscoveredLatinHAM object and returns it as a JSON response.
 * @param entry - The database entry to format.
 * @returns A JSON response containing the formatted DiscoveredLatinHAM object.
 */
function formatAndReturnPuzzle(entry: DatabaseEntry): NextResponse {
  try {
    // Construct the DiscoveredLatinHAM object by parsing and formatting the database entry
    const formattedPuzzle: DiscoveredLatinHAM = {
      initialGrid: parseJsonField(entry.initial_grid),
      difficulty: entry.difficulty,
      solveCount: Number(entry.solve_count),
      bestMoves: Number(entry.best_moves),
      bestTime: Number(entry.best_time),
      bestMovesPlayer: entry.best_moves_player,
      bestTimePlayer: entry.best_time_player
    }

    console.log('Fetched discovered LatinHAM:', JSON.stringify(formattedPuzzle))

    // Return the formatted puzzle as a JSON response
    return NextResponse.json(formattedPuzzle)
  } catch (parseError) {
    // Log and return a 500 error if parsing fails
    console.error('Error parsing entry:', entry, parseError)
    return NextResponse.json({ error: 'Error parsing discovered LatinHAM' }, { status: 500 })
  }
}

/**
 * GET handler to fetch discovered LatinHAM entries from the leaderboard.
 * @returns A JSON response containing an array of DiscoveredLatinHAM objects or an error message.
 */
export async function GET() {
  try {
    // Execute a SQL query to retrieve distinct initial grids and their statistics
    const result = await sql<DatabaseEntry>`
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
          MIN(time) as best_time,
          -- Fetch usernames for best moves and best time
          (SELECT up.username FROM leaderboard_entries le
           LEFT JOIN user_profiles up ON le.user_id = up.clerk_user_id 
           WHERE le.moves = MIN(leaderboard_entries.moves) LIMIT 1) AS best_moves_player,
          (SELECT up.username FROM leaderboard_entries le
           LEFT JOIN user_profiles up ON le.user_id = up.clerk_user_id 
           WHERE le.time = MIN(leaderboard_entries.time) LIMIT 1) AS best_time_player
        FROM leaderboard_entries
        GROUP BY initial_grid, difficulty
      )
      SELECT 
        dg.initial_grid,
        dg.difficulty,
        gs.solve_count,
        gs.best_moves,
        gs.best_time,
        gs.best_moves_player,
        gs.best_time_player
      FROM distinct_grids dg
      JOIN grid_stats gs ON dg.initial_grid = gs.initial_grid AND dg.difficulty = gs.difficulty
      ORDER BY gs.solve_count DESC, gs.best_moves ASC, gs.best_time ASC
    `

    // Map the database entries to DiscoveredLatinHAM objects, filtering out any invalid entries
    const formattedLatinHAMs = result.rows.map(entry => {
      try {
        const initialGrid = parseJsonField(entry.initial_grid);
        if (initialGrid.length === 0) {
          console.error('Invalid initial_grid:', entry.initial_grid);
          return null; // Skip entries with invalid initial grids
        }
        return {
          initialGrid: initialGrid,
          difficulty: entry.difficulty,
          solveCount: Number(entry.solve_count),
          bestMoves: Number(entry.best_moves),
          bestTime: Number(entry.best_time),
          bestMovesPlayer: entry.best_moves_player,
          bestTimePlayer: entry.best_time_player
        } as DiscoveredLatinHAM
      } catch (parseError) {
        console.error('Error parsing entry:', entry, parseError)
        return null; // Skip entries that cause parsing errors
      }
    }).filter((entry): entry is DiscoveredLatinHAM => entry !== null) // Remove null entries

    console.log('Fetched discovered LatinHAMs:', JSON.stringify(formattedLatinHAMs))

    // Return the array of DiscoveredLatinHAM objects as a JSON response
    return NextResponse.json(formattedLatinHAMs)
  } catch (error) {
    // Log and return a 500 error if the SQL query fails
    console.error('Failed to fetch discovered LatinHAMs:', error)
    return NextResponse.json({ error: 'Failed to fetch discovered LatinHAMs' }, { status: 500 })
  }
}
