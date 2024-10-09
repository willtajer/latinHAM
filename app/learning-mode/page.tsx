'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { LearningModeGame } from '@/components/LearningModeGame'
import { LearningGameHeader } from '@/components/LearningGameHeader'
import { WillTajerButton } from '@/components/WillTajerButton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LearningModePage() {
  const [isComplete, setIsComplete] = useState(false)
  const [key, setKey] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleCompletion = useCallback(() => {
    setIsComplete(true)
  }, [])

  const handleRestart = useCallback(() => {
    setIsComplete(false)
    setKey(prevKey => prevKey + 1)
  }, [])

  if (!isClient) {
    return null // or a loading spinner
  }

  return (
    <div className="relative min-h-screen bg-transparent text-foreground">
      <div className="flex flex-col items-center pt-8 min-h-screen">
        <div className="w-full max-w-6xl flex flex-col items-center">
          <LearningGameHeader isComplete={isComplete} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <Card className="md:col-span-1">
              <CardContent className="p-6 flex flex-col h-full">
                <h2 className="text-3xl font-bold mb-4 text-center text-blue-500">How to Play</h2>
                <ul className="list-disc pl-5 space-y-4 text-lg flex-grow">
                  <li>Click on a cell to cycle through numbers 1-3.</li>
                  <li>Each number must appear exactly once in each row and column.</li>
                  <li>Use logic to determine the correct placement of each number.</li>
                  <li>Once you&apos;ve filled the grid correctly, the numbers will transform into colors.</li>
                </ul>
              </CardContent>
            </Card>

            <div className="md:col-span-1 flex flex-col items-center">
              <LearningModeGame key={key} onComplete={handleCompletion} onRestart={handleRestart} />
              <div className="flex justify-center space-x-4 mt-6">
                <Button onClick={handleRestart} size="lg" className="text-lg">
                  {isComplete ? "Play Again" : "Restart"}
                </Button>
                <Link href="/" passHref>
                  <Button variant="outline" size="lg" className="text-lg">Back to Main Game</Button>
                </Link>
              </div>
            </div>

            <Card className="md:col-span-1">
              <CardContent className="p-6 flex flex-col h-full">
                <h2 className="text-3xl font-bold mb-4 text-center text-yellow-500">Tips</h2>
                <ul className="list-disc pl-5 space-y-4 text-lg flex-grow">
                  <li>Start with the rows or columns that have the most numbers filled in.</li>
                  <li>If a number appears twice in a row or column, one of them must be incorrect.</li>
                  <li>Remember, the same principles apply to the full 6x6 latinHAM game!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        <WillTajerButton />
      </div>
    </div>
  )
}