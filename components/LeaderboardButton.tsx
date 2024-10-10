'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Trophy, X } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { Leaderboard } from './Leaderboard'
import { useLeaderboard } from './LeaderboardWrapper'

export default function LeaderboardButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const { leaderboard, handleViewCompletedBoard } = useLeaderboard(difficulty)

  const toggleOverlay = () => setIsOpen(!isOpen)

  const overlayVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' }
  }

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-16 rounded-full p-2 shadow-md transition-colors duration-200 z-10 bg-red-500 text-white hover:bg-red-400"
        onClick={toggleOverlay}
        aria-label="View Leaderboard"
      >
        <Trophy className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-background z-50 overflow-y-auto"
          >
            <div className="min-h-screen p-4 sm:p-6 lg:p-8">
              <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white"
                onClick={toggleOverlay}
                aria-label="Close Leaderboard"
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="max-w-6xl mx-auto pt-16">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center">
                  LatinHAM Leaderboard
                </h1>
                <div className="flex justify-center space-x-4 mb-6">
                  <Button
                    onClick={() => handleDifficultyChange('easy')}
                    variant={difficulty === 'easy' ? 'default' : 'outline'}
                  >
                    Easy
                  </Button>
                  <Button
                    onClick={() => handleDifficultyChange('medium')}
                    variant={difficulty === 'medium' ? 'default' : 'outline'}
                  >
                    Medium
                  </Button>
                  <Button
                    onClick={() => handleDifficultyChange('hard')}
                    variant={difficulty === 'hard' ? 'default' : 'outline'}
                  >
                    Hard
                  </Button>
                </div>
                <Leaderboard
                  entries={leaderboard[difficulty]}
                  difficulty={difficulty}
                  onViewCompletedBoard={handleViewCompletedBoard}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}