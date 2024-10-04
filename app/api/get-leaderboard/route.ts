import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const difficulty = Array.isArray(req.query.difficulty) 
    ? req.query.difficulty[0] 
    : req.query.difficulty || ''

  try {
    const { rows } = await sql`
      SELECT * FROM leaderboard_entries
      WHERE user_id = ${userId} AND difficulty = ${difficulty}
      ORDER BY moves ASC, time ASC
      LIMIT 12
    `
    res.status(200).json(rows)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
}