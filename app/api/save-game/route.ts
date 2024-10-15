// app/api/save-game/route.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@vercel/postgres'
import { getAuth } from '@clerk/nextjs/server'

/**
 * POST handler to save a completed game to the leaderboard.
 * @param request - The incoming POST request containing game data.
 * @returns A JSON response with the saved game entry or an error message.
 */
export async function POST(request: NextRequest) {
  // Authenticate the user making the request
  const { userId } = getAuth(request)
  
  // If no userId is found, return an unauthorized error
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse the incoming JSON game data from the request body
  const gameData = await request.json()

  // Log the received gameData for debugging purposes
  console.log('Received game data:', JSON.stringify(gameData, null, 2))

  try {
    // Insert the game data into the leaderboard_entries table
    const result = await sql`
      INSERT INTO leaderboard_entries 
      (user_id, difficulty, moves, time, grid, initial_grid, quote, hints) 
      VALUES (
        ${userId}, 
        ${gameData.difficulty}, 
        ${gameData.moves}, 
        ${gameData.time}, 
        ${JSON.stringify(gameData.grid)}, 
        ${JSON.stringify(gameData.initialGrid)}, 
        ${gameData.quote}, 
        ${gameData.hints}
      ) 
      RETURNING *
    `
    
    // Log the successfully saved game entry
    console.log('Game saved successfully:', result.rows[0])
    
    // Return the saved game entry as a JSON response
    return NextResponse.json(result.rows[0])
  } catch (error) {
    // Log any errors that occur during the save process
    console.error('Failed to save game:', error)
    
    // Return a 500 Internal Server Error response with an error message
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 })
  }
}
