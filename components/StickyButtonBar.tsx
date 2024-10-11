'use client'

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Play, Grid, Trophy, HelpCircle, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { DiscoveredLatinHAMs } from './DiscoveredLatinHAMs'
import { GamePreview } from './GamePreview'
import { Leaderboard } from './Leaderboard'
import { useLeaderboard } from './LeaderboardWrapper'
import { LearningModeGame } from './LearningModeGame'

interface StickyButtonBarProps {
  onStartNewGame: () => void
}

export default function StickyButtonBar({ onStartNewGame }: StickyButtonBarProps) {
  const { theme } = useTheme()
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'discovered' | 'leaderboard' | 'learning'>('none')
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const { leaderboard, handleViewCompletedBoard } = useLeaderboard(leaderboardDifficulty)
  const [isLearningComplete, setIsLearningComplete] = useState(false)
  const [learningKey, setLearningKey] = useState(0)

  const handleNewGame = () => {
    onStartNewGame()
  }

  const toggleOverlay = (overlay: 'discovered' | 'leaderboard' | 'learning') => {
    setActiveOverlay(prev => prev === overlay ? 'none' : overlay)
  }

  const handleLeaderboardDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setLeaderboardDifficulty(newDifficulty)
  }

  const handleLearningCompletion = useCallback(() => {
    setIsLearningComplete(true)
  }, [])

  const handleLearningRestart = useCallback(() => {
    setIsLearningComplete(false)
    setLearningKey(prevKey => prevKey + 1)
  }, [])

  const overlayVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' }
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md text-white py-2 px-4 rounded-full shadow-lg">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewGame}
              className={`
                rounded-full p-2 shadow-md transition-colors duration-200 z-10
                ${theme === 'light' 
                  ? 'bg-red-500 hover:bg-gray-700 text-white hover:text-red-500' 
                  : 'bg-red-500 hover:bg-gray-700 text-white hover:text-red-500'}
              `}
              aria-label="Start New Game"
            >
              <Play className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 z-10 bg-yellow-500 text-white hover:bg-gray-700 hover:text-yellow-500"
              onClick={() => toggleOverlay('discovered')}
              aria-label="View Discovered LatinHAMs"
            >
              <Grid className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 z-10 bg-green-500 text-white hover:bg-gray-700 hover:text-green-500"
              onClick={() => toggleOverlay('leaderboard')}
              aria-label="View Leaderboard"
            >
              <Trophy className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 z-10 bg-blue-500 text-white hover:bg-gray-700 hover:text-blue-500"
              onClick={() => toggleOverlay('learning')}
              aria-label="Go to Learning Mode"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeOverlay !== 'none' && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-background z-50 overflow-y-auto"
          >
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white"
                onClick={() => setActiveOverlay('none')}
                aria-label="Close Overlay"
              >
                <X className="h-6 w-6" />
              </Button>

              {activeOverlay === 'discovered' && (
                <div className="max-w-6xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center">
                    Discovered LatinHAMs
                  </h1>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-[calc(6*3rem+6*0.75rem)] mb-6">
                      <GamePreview />
                    </div>
                  </div>
                  <p className="text-center mb-8 text-muted-foreground">
                    Explore player-identified gameboard layouts.
                  </p>
                  <DiscoveredLatinHAMs />
                </div>
              )}

              {activeOverlay === 'leaderboard' && (
                <div className="max-w-6xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center">
                    LatinHAM Leaderboard
                  </h1>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-[calc(6*3rem+6*0.75rem)] mt-4 mb-4">
                      <GamePreview />
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mb-6">
                    <Button
                      onClick={() => handleLeaderboardDifficultyChange('easy')}
                      variant={leaderboardDifficulty === 'easy' ? 'default' : 'outline'}
                    >
                      Easy
                    </Button>
                    <Button
                      onClick={() => handleLeaderboardDifficultyChange('medium')}
                      variant={leaderboardDifficulty === 'medium' ? 'default' : 'outline'}
                    >
                      Medium
                    </Button>
                    <Button
                      onClick={() => handleLeaderboardDifficultyChange('hard')}
                      variant={leaderboardDifficulty === 'hard' ? 'default' : 'outline'}
                    >
                      Hard
                    </Button>
                  </div>
                  <Leaderboard
                    entries={leaderboard[leaderboardDifficulty]}
                    difficulty={leaderboardDifficulty}
                    onViewCompletedBoard={handleViewCompletedBoard}
                  />
                </div>
              )}

              {activeOverlay === 'learning' && (
                <div className="w-full max-w-6xl mx-auto">
                  <div className="flex flex-col items-center justify-center w-full mb-8">
                    <div className="w-[calc(6*3rem+6*0.75rem)]">
                      <Link href="/" passHref>
                        <h1 className="text-6xl font-bold mb-6 text-center cursor-pointer hover:text-primary transition-colors duration-200">
                          latinHAM
                        </h1>
                      </Link>
                      <GamePreview />
                      <h2 className="text-2xl font-semibold text-center sm:mt-8 md:mt-12 mb-4">Learning Mode</h2>
                      <p className="text-center mt-4">
                        {isLearningComplete
                          ? "Great job! You've mastered the basics of Latin squares."
                          : "Fill the grid so that each number (1-3) appears exactly once in each row and column."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="md:col-span-1 order-2 md:order-1">
                      <CardContent className="p-6">
                        <h2 className="text-3xl font-bold mb-4 text-center text-blue-500">How to Play</h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                          <li>Click on a cell to cycle through numbers 1-3.</li>
                          <li>Each number must appear exactly once in each row and column.</li>
                          <li>Use logic to determine the correct placement of each number.</li>
                          <li>Once you&apos;ve filled the grid correctly, the numbers will transform into colors.</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="md:col-span-1 flex justify-center order-1 md:order-2 pb-8 md:pb-0">
                      <LearningModeGame 
                        key={learningKey} 
                        onComplete={handleLearningCompletion} 
                        onRestart={handleLearningRestart}
                      />
                    </div>

                    <Card className="md:col-span-1 order-3">
                      <CardContent className="p-6">
                        <h2 className="text-3xl font-bold mb-4 text-center text-yellow-500">Tips</h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                          <li>Start with the rows or columns that have the most numbers filled in.</li>
                          <li>If a number appears twice in a row or column, one of them must be incorrect.</li>
                          <li>Remember, the same principles apply to the full 6x6 latinHAM game!</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}