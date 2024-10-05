import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const difficulty = searchParams.get('difficulty')

  if (!difficulty) {
    return NextResponse.json({ error: 'Difficulty parameter is required' }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT * FROM leaderboard_entries 
      WHERE difficulty = ${difficulty} 
      ORDER BY moves ASC 
      LIMIT 12
    `
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}