import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import pool from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const gameData = await request.json()

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO leaderboard_entries 
        (user_id, difficulty, moves, time, grid, initial_grid, quote, hints) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [
          userId,
          gameData.difficulty,
          gameData.moves,
          gameData.time,
          JSON.stringify(gameData.grid),
          JSON.stringify(gameData.initialGrid),
          gameData.quote,
          gameData.hints
        ]
      )
      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to save game:', error)
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 })
  }
}