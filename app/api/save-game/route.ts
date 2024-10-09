// app/api/save-game/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@vercel/postgres'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const gameData = await request.json()

  // Log the received gameData for debugging
  console.log('Received game data:', JSON.stringify(gameData, null, 2))

  try {
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
    console.log('Game saved successfully:', result.rows[0])
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to save game:', error)
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 })
  }
}