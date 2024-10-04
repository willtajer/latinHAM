import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { difficulty, moves, time, grid, initialGrid, quote, hints } = req.body

  try {
    await sql`
      INSERT INTO leaderboard_entries (user_id, difficulty, moves, time, grid, initial_grid, quote, hints)
      VALUES (${userId}, ${difficulty}, ${moves}, ${time}, ${JSON.stringify(grid)}, ${JSON.stringify(initialGrid)}, ${quote}, ${hints})
    `
    res.status(200).json({ message: 'Game saved successfully' })
  } catch (error) {
    console.error('Failed to save game:', error)
    res.status(500).json({ error: 'Failed to save game' })
  }
}