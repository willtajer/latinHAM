// SolveCountCalculator.tsx
"use client"

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BOARD_SIZE, calculateSolveCount } from '../utils/solveCountLogic'

export default function SolveCountCalculator() {
  const [grid, setGrid] = useState<number[][]>(Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0)))
  const [solveCount, setSolveCount] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    const newValue = parseInt(value) || 0
    setGrid(prevGrid => 
      prevGrid.map((row, i) => 
        i === rowIndex ? row.map((cell, j) => j === colIndex ? newValue : cell) : [...row]
      )
    )
  }, [])

  const calculateSolutions = useCallback(() => {
    setIsCalculating(true)
    // Use setTimeout to allow the UI to update before starting the calculation
    setTimeout(() => {
      const count = calculateSolveCount(grid)
      setSolveCount(count)
      setIsCalculating(false)
    }, 0)
  }, [grid])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Solve Count Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-${BOARD_SIZE} gap-2 mb-4`}>
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <Input
                key={`${rowIndex}-${colIndex}`}
                type="number"
                min="0"
                max={BOARD_SIZE}
                value={cell || ''}
                onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                className="w-12 h-12 text-center"
              />
            ))
          ))}
        </div>
        <Button onClick={calculateSolutions} className="mb-4" disabled={isCalculating}>
          {isCalculating ? 'Calculating...' : 'Calculate Solve Count'}
        </Button>
        {solveCount !== null && (
          <div>
            <Label>Number of possible solutions:</Label>
            <div className="text-2xl font-bold">{solveCount}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}