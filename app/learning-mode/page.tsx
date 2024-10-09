'use client'

import React, { useState, useCallback } from 'react'
import { LearningModeGame } from '@/components/LearningModeGame'
import { LearningGameHeader } from '@/components/LearningGameHeader'
import { WillTajerButton } from '@/components/WillTajerButton'
import { Card, CardContent } from '@/components/ui/card'

export default function LearningModePage() {
  const [isComplete, setIsComplete] = useState(false)
  const [key, setKey] = useState(0)

  const handleCompletion = useCallback(() => {
    setIsComplete(true)
  }, [])

  const handleRestart = useCallback(() => {
    setIsComplete(false)
    setKey(prevKey => prevKey + 1)
  }, [])

  return (
    <div className="flex flex-col items-center pt-24 min-h-screen bg-transparent text-foreground p-4">
      <div className="w-full max-w-6xl">
        <LearningGameHeader isComplete={isComplete} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 order-2 md:order-1">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-4 text-center text-blue-500">How to Play</h2>
              <ul className="list-disc pl-5 space-y-2 text-lg">
                <li>Click on a cell to cycle through numbers 1-3.</li>
                <li>Each number must appear exactly once in each row and column.</li>
                <li>Use logic to determine the correct placement of each number.</li>
                <li>Once you've filled the grid correctly, the numbers will transform into colors.</li>
              </ul>
            </CardContent>
          </Card>

          <div className="md:col-span-1 flex justify-center order-1 md:order-2">
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
      <WillTajerButton />
    </div>
  )
}