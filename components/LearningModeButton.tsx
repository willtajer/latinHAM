'use client'

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { HelpCircle, X } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { LearningModeGame } from './LearningModeGame'
import { GamePreview } from './GamePreview'

export default function LearningModeOverlayButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [key, setKey] = useState(0)

  const toggleOverlay = () => setIsOpen(!isOpen)

  const handleCompletion = useCallback(() => {
    setIsComplete(true)
  }, [])

  const handleRestart = useCallback(() => {
    setIsComplete(false)
    setKey(prevKey => prevKey + 1)
  }, [])

  const overlayVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full p-2 shadow-md transition-colors duration-200 z-10 bg-blue-500 text-white hover:bg-blue-600"
        onClick={toggleOverlay}
        aria-label="Go to Learning Mode"
      >
        <HelpCircle className="h-6 w-6" />
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
                aria-label="Close Learning Mode"
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="w-full max-w-6xl mx-auto pt-16">
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
                      {isComplete
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
                      key={key} 
                      onComplete={handleCompletion} 
                      onRestart={handleRestart}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}