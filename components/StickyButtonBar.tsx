'use client'

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Play, Grid, Trophy, HelpCircle, User, X, BadgeCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import DiscoveredLatinHAMs from './DiscoveredLatinHAMs'
import { GamePreview } from './GamePreview'
import Leaderboard from './Leaderboard'
import { LearningModeGame } from './LearningModeGame'
import { UserProfile } from './UserProfile'
import Patterns from './Patterns'

interface StickyButtonBarProps {
  onStartNewGame: (initialGrid?: number[][]) => void;
}

export default function StickyButtonBar({ onStartNewGame }: StickyButtonBarProps) {
  const { theme } = useTheme()
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'discovered' | 'leaderboard' | 'learning' | 'profile' | 'patterns'>('none')
  const [isLearningComplete, setIsLearningComplete] = useState(false)
  const [learningKey, setLearningKey] = useState(0)

  const handleNewGame = (initialGrid?: number[][]) => {
    onStartNewGame(initialGrid)
  }

  const toggleOverlay = (overlay: 'discovered' | 'leaderboard' | 'learning' | 'profile' | 'patterns') => {
    setActiveOverlay(prev => prev === overlay ? 'none' : overlay)
  }

  const closeOverlays = useCallback(() => {
    setActiveOverlay('none')
  }, [])

  const handlePlayAgain = useCallback((initialGrid: number[][]) => {
    closeOverlays()
    handleNewGame(initialGrid)
  }, [closeOverlays])

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

  const getOverlayStyle = (overlayType: 'discovered' | 'leaderboard' | 'learning' | 'profile' | 'patterns') => {
    const colors = {
      discovered: { light: 'bg-orange-500', dark: 'bg-slate-950' },
      leaderboard: { light: 'bg-green-500', dark: 'bg-slate-950' },
      learning: { light: 'bg-blue-500', dark: 'bg-slate-950' },
      profile: { light: 'bg-purple-500', dark: 'bg-slate-950' },
      patterns: { light: 'bg-yellow-400', dark: 'bg-slate-950' },
    }

    const color = colors[overlayType]
    const bgColor = theme === 'dark' ? color.dark : color.light

    return `${bgColor} bg-[radial-gradient(#ffffff33_5px,transparent_2px)] dark:bg-[radial-gradient(#ffffff33_2px,transparent_2px)] bg-[size:40px_40px]`
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full sm:bottom-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:w-auto z-[60]">
        <div className="bg-gray-200 dark:bg-gray-900 bg-opacity-70 backdrop-blur-md text-white py-4 px-4 sm:py-2 sm:px-4 sm:rounded-full shadow-lg flex justify-center items-center w-full sm:w-auto">
          <div className="flex justify-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                closeOverlays()
                handleNewGame()
              }}
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-red-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-red-500"
              aria-label="Start New Game"
            >
              <Play className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-orange-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-orange-500"
              onClick={() => toggleOverlay('discovered')}
              aria-label="View Discovered LatinHAMs"
            >
              <Grid className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-yellow-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-yellow-500"
              onClick={() => toggleOverlay('patterns')}
              aria-label="Patterns"
            >
              <BadgeCheck className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-green-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-green-500"
              onClick={() => toggleOverlay('leaderboard')}
              aria-label="View Leaderboard"
            >
              <Trophy className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-blue-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-blue-500"
              onClick={() => toggleOverlay('learning')}
              aria-label="Go to Learning Mode"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-purple-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-purple-500"
              onClick={() => toggleOverlay('profile')}
              aria-label="View User Profile"
            >
              <User className="h-6 w-6" />
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
            className={`fixed inset-0 z-50 overflow-y-auto ${getOverlayStyle(activeOverlay)}`}
          >
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white hover:text-gray-100"
                onClick={closeOverlays}
                aria-label="Close Overlay"
              >
                <X className="h-6 w-6" />
              </Button>

              {activeOverlay === 'discovered' && (
                <div className="max-w-6xl mx-auto pt-16 pb-20">
                  <DiscoveredLatinHAMs onPlayAgain={handlePlayAgain} onCloseOverlays={closeOverlays} />
                </div>
              )}

              {activeOverlay === 'leaderboard' && (
                <div className="max-w-6xl mx-auto pt-16 pb-20">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-center text-white">
                    LatinHAM Leaderboard
                  </h1>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-[calc(6*3rem+6*0.75rem)] mt-2">
                      <GamePreview />
                    </div>
                  </div>
                  <Leaderboard 
                    initialDifficulty="all"
                    onDifficultyChange={(newDifficulty) => console.log(`Difficulty changed to: ${newDifficulty}`)}
                  />
                </div>
              )}

              {activeOverlay === 'learning' && (
                <div className="w-full max-w-6xl mx-auto pt-16 pb-20">
                  <div className="flex flex-col items-center justify-center w-full mb-8">
                    <div className="w-[calc(6*3rem+6*0.75rem)]">
                      <Link href="/" passHref>
                        <h1 className="text-6xl font-bold mb-6 text-center text-white cursor-pointer hover:text-primary transition-colors duration-200">
                          Learn LatinHAM
                        </h1>
                      </Link>
                      <GamePreview />
                      <h2 className="text-2xl font-semibold text-center text-white sm:mt-8 md:mt-8 mb-4">Learning Mode</h2>
                      <p className="text-center text-white mt-4">
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
                          <li>Remember, the same principles apply to the full 6x6 LatinHAM game!</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeOverlay === 'profile' && (
                <div className="max-w-6xl mx-auto pt-16 pb-20">
                  <UserProfile />
                </div>
              )}

              {activeOverlay === 'patterns' && (
                <div className="max-w-6xl mx-auto pt-16 pb-20">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center text-white">
                    LatinHAM Patterns
                  </h1>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-[calc(6*3rem+6*0.75rem)]">
                      <GamePreview />
                    </div>
                  </div>
                  <Patterns />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}