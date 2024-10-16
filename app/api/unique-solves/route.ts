// app/api/latinham-stats/route.ts

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * Interface representing the structure of LatinHAM statistics to be returned.
 */
interface LatinHAMStats {
  initialGrid: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  solveCount: number;
  uniqueSolveCount: number;
  bestMoves: number;
  bestMovesPlayer: string;
  bestTime: number;
  bestTimePlayer: string;
}

/**
 * Interface representing the structure of a database entry from the leaderboard_entries table.
 */
interface DatabaseEntry {
  initial_grid: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solve_count: number;
  unique_solve_count: number;
  best_moves: number;
  best_moves_player: string;
  best_time: number;
  best_time_player: string;
}

/**
 * Parses a JSON field that is expected to be a 2D array of numbers.
 * @param field - The field to parse, either a JSON string or a number[][].
 * @returns A number[][] if parsing is successful, otherwise an empty array.
 */
function parseJsonField(field: string): number[][] {
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
 * GET handler to fetch LatinHAM statistics from the leaderboard.
 * @returns A JSON response containing an array of LatinHAMStats objects or an error message.
 */
export async function GET() {
  try {
    // Execute SQL query to aggregate statistics for each unique initial grid and difficulty
    const result = await sql<DatabaseEntry>`
      WITH ranked_entries AS (
        SELECT 
          initial_grid,
          difficulty,
          moves,
          time,
          username,
          ROW_NUMBER() OVER (PARTITION BY initial_grid, difficulty ORDER BY moves ASC) as move_rank,
          ROW_NUMBER() OVER (PARTITION BY initial_grid, difficulty ORDER BY time ASC) as time_rank
        FROM leaderboard_entries
        WHERE grid IS NOT NULL AND grid != 'null'
      )
      SELECT 
        e.initial_grid,
        e.difficulty,
        COUNT(*) as solve_count,
        COUNT(DISTINCT e.grid) as unique_solve_count,
        MIN(e.moves) as best_moves,
        MIN(bm.username) as best_moves_player,
        MIN(e.time) as best_time,
        MIN(bt.username) as best_time_player
      FROM leaderboard_entries e
      LEFT JOIN ranked_entries bm ON e.initial_grid = bm.initial_grid AND e.difficulty = bm.difficulty AND bm.move_rank = 1
      LEFT JOIN ranked_entries bt ON e.initial_grid = bt.initial_grid AND e.difficulty = bt.difficulty AND bt.time_rank = 1
      WHERE e.grid IS NOT NULL AND e.grid != 'null'
      GROUP BY e.initial_grid, e.difficulty
      ORDER BY COUNT(*) DESC, MIN(e.moves) ASC, MIN(e.time) ASC
    `

    // Map the database entries to LatinHAMStats objects, filtering out any invalid entries
    const formattedLatinHAMStats = result.rows.map(entry => {
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
          uniqueSolveCount: Number(entry.unique_solve_count),
          bestMoves: Number(entry.best_moves),
          bestMovesPlayer: entry.best_moves_player || 'Anonymous',
          bestTime: Number(entry.best_time),
          bestTimePlayer: entry.best_time_player || 'Anonymous'
        } as LatinHAMStats
      } catch (parseError) {
        console.error('Error parsing entry:', entry, parseError)
        return null // Return null if there's an error parsing the entry
      }
    }).filter((entry): entry is LatinHAMStats => entry !== null) // Filter out any null entries resulting from parsing errors

    console.log('Fetched LatinHAM stats:', JSON.stringify(formattedLatinHAMStats))

    // Return the formatted LatinHAM statistics as a JSON response
    return NextResponse.json(formattedLatinHAMStats)
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('Failed to fetch LatinHAM stats:', error)
    // Return a 500 Internal Server Error response with an error message
    return NextResponse.json({ error: 'Failed to fetch LatinHAM stats' }, { status: 500 })
  }
}