import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

interface Game {
  id: string;
  difficulty: string;
  moves: number;
  time: number;
  grid: number[][];
  initialGrid: number[][];
  quote: string;
  hints: number;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { games }: { games: Game[] } = await req.json();

  try {
    // Fetch existing games for the user
    const { rows: existingGames } = await sql`
      SELECT id FROM leaderboard_entries WHERE user_id = ${userId}
    `;
    const existingIds = new Set(existingGames.map(game => game.id));

    // Filter out games that already exist in the database
    const newGames = games.filter(game => !existingIds.has(game.id));

    // Insert new games into the database
    for (const game of newGames) {
      await sql`
        INSERT INTO leaderboard_entries (id, user_id, difficulty, moves, time, grid, initial_grid, quote, hints, timestamp)
        VALUES (${game.id}, ${userId}, ${game.difficulty}, ${game.moves}, ${game.time}, ${JSON.stringify(game.grid)}, ${JSON.stringify(game.initialGrid)}, ${game.quote}, ${game.hints}, ${game.timestamp})
      `;
    }

    // Fetch all games for the user (including newly inserted ones)
    const { rows: allGames } = await sql`
      SELECT * FROM leaderboard_entries WHERE user_id = ${userId}
      ORDER BY timestamp DESC
    `;

    return NextResponse.json({ syncedGames: allGames });
  } catch (error) {
    console.error('Failed to sync game history:', error);
    return NextResponse.json({ error: 'Failed to sync game history' }, { status: 500 });
  }
}