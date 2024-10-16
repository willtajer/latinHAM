// app/api/unique-solves/route.ts

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface LatinHAM {
  initialGrid: number[][];
  difficulty: 'easy' | 'medium' | 'hard';
  totalSolves: number;
  uniqueSolves: number;
  bestMoves: number;
  bestMovesPlayer: string;
  bestTime: number;
  bestTimePlayer: string;
}

interface DatabaseEntry {
  id: string;
  username: string;
  timestamp: Date;
  moves: number | string;
  time: number | string;
  grid: string | number[][];
  initial_grid: string | number[][];
  quote: string | null;
  hints: number | string;
}

function parseJsonField(field: string): number[][] {
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed) && parsed.every(row => Array.isArray(row))) {
      return parsed;
    }
    throw new Error('Parsed value is not a 2D array');
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return [];
  }
}

export async function GET() {
  try {
    console.log('Fetching leaderboard entries...');
    const result = await sql<DatabaseEntry>`
      SELECT 
        id,
        username,
        initial_grid,
        grid,
        moves,
        time
      FROM leaderboard_entries
      WHERE grid IS NOT NULL AND grid != 'null'
    `;
    console.log(`Fetched ${result.rows.length} leaderboard entries.`);

    const latinHAMMap = new Map<string, LatinHAM>();
    const uniqueGridsMap = new Map<string, Set<string>>();

    result.rows.forEach((entry, index) => {
      console.log(`Processing entry ${index + 1}:`, JSON.stringify(entry));
      const initialGrid = parseJsonField(entry.initial_grid as string);
      const initialGridKey = JSON.stringify(initialGrid);

      if (!latinHAMMap.has(initialGridKey)) {
        console.log(`Creating new LatinHAM for initial grid: ${initialGridKey}`);
        latinHAMMap.set(initialGridKey, {
          initialGrid,
          difficulty: 'easy', // You may need to determine this based on your logic
          totalSolves: 0,
          uniqueSolves: 0,
          bestMoves: Infinity,
          bestMovesPlayer: '',
          bestTime: Infinity,
          bestTimePlayer: '',
        });
        uniqueGridsMap.set(initialGridKey, new Set<string>());
      }

      const latinHAM = latinHAMMap.get(initialGridKey)!;
      const uniqueGrids = uniqueGridsMap.get(initialGridKey)!;

      latinHAM.totalSolves++;
      console.log(`Total solves for ${initialGridKey}: ${latinHAM.totalSolves}`);

      const grid = parseJsonField(entry.grid as string);
      const gridKey = JSON.stringify(grid);
      
      if (!uniqueGrids.has(gridKey)) {
        uniqueGrids.add(gridKey);
        latinHAM.uniqueSolves++;
        console.log(`Unique solves for ${initialGridKey}: ${latinHAM.uniqueSolves}`);
      }

      const moves = Number(entry.moves);
      if (moves < latinHAM.bestMoves) {
        latinHAM.bestMoves = moves;
        latinHAM.bestMovesPlayer = entry.username;
        console.log(`New best moves for ${initialGridKey}: ${moves} by ${entry.username}`);
      }

      const time = Number(entry.time);
      if (time < latinHAM.bestTime) {
        latinHAM.bestTime = time;
        latinHAM.bestTimePlayer = entry.username;
        console.log(`New best time for ${initialGridKey}: ${time} by ${entry.username}`);
      }
    });

    const formattedLatinHAMs = Array.from(latinHAMMap.values());

    console.log('Formatted LatinHAMs:');
    formattedLatinHAMs.forEach((latinHAM, index) => {
      console.log(`LatinHAM ${index + 1}:`, JSON.stringify(latinHAM));
    });

    return NextResponse.json(formattedLatinHAMs);
  } catch (error) {
    console.error('Failed to fetch latinHAM stats:', error);
    return NextResponse.json({ error: 'Failed to fetch latinHAM stats' }, { status: 500 });
  }
}