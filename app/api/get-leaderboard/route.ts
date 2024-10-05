import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const difficulty = searchParams.get('difficulty')

  if (!difficulty) {
    return NextResponse.json({ error: 'Difficulty parameter is required' }, { status: 400 })
  }

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM leaderboard_entries WHERE difficulty = $1 ORDER BY moves ASC LIMIT 12',
        [difficulty]
      )
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}