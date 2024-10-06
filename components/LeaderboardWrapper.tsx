import { useLeaderboard } from '../hooks/useLeaderboard'
import { Leaderboard } from './Leaderboard'

export function LeaderboardWrapper({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const { leaderboard, handleViewCompletedBoard } = useLeaderboard(difficulty)

  return (
    <Leaderboard
      entries={leaderboard[difficulty] || []}
      difficulty={difficulty}
      onViewCompletedBoard={handleViewCompletedBoard}
    />
  )
}