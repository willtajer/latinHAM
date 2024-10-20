'use client'

import React from 'react'
import { DiscoveredLatinHAM } from '@/types'
import { calculateSolveCount } from '../utils/solveCountLogic';
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface LatinHAMGridProps {
  latinHAMs: DiscoveredLatinHAM[]
  onLatinHAMClick: (latinHAM: DiscoveredLatinHAM) => void
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard'
}

const LatinHAMGrid: React.FC<LatinHAMGridProps> = ({ 
  latinHAMs, 
  onLatinHAMClick,
  difficultyFilter
}) => {
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m${remainingSeconds}s`
  }

  const formatDiscoveryDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }

  const MiniGameBoard: React.FC<{ initialGrid: number[][] }> = ({ initialGrid }) => {
    if (!initialGrid || initialGrid.length === 0) {
      return <div className="text-red-500">Error: Invalid grid data</div>;
    }

    return (
      <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner aspect-square">
        {initialGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center
                relative transition-all duration-150 ease-in-out rounded-sm shadow-sm
                ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600'}
                ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'}
              `}
              role="cell"
              aria-label={`Cell ${cell !== 0 ? 'filled' : 'empty'}`}
            />
          ))
        )}
      </div>
    )
  }

  const filteredLatinHAMs = latinHAMs.filter(
    latinHAM => difficultyFilter === 'all' || latinHAM.difficulty === difficultyFilter
  );

  if (filteredLatinHAMs.length === 0) {
    return (
      <div className="text-center py-8 text-white">
        No {difficultyFilter !== 'all' ? `${difficultyFilter} ` : ''}LatinHAMs found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">        
      {filteredLatinHAMs.map((latinHAM, index) => (
        <div 
          key={`latinHAM-${index}`}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-[400px]"
        >
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => onLatinHAMClick(latinHAM)}
          >
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-300 text-center">
              Discovered on {latinHAM.createdAt ? formatDiscoveryDateTime(latinHAM.createdAt) : 'Unknown Date'}
            </div>
            <MiniGameBoard initialGrid={latinHAM.initialGrid} />
            <div className="mt-4 text-sm text-gray-800 dark:text-gray-300">
              <p>
                <strong>Difficulty: </strong>{`${latinHAM.difficulty.charAt(0).toUpperCase() + latinHAM.difficulty.slice(1)}`}
              </p>
              <p>
                <strong>Total Plays: </strong>{latinHAM.solveCount}
              </p>
              <p>
                <strong>Solved: </strong>{latinHAM.uniqueSolves} / {calculateSolveCount(latinHAM.initialGrid)}
              </p>
              <p>
                <strong>Best Moves: </strong>{latinHAM.bestMoves}
              </p>
              <p>
                <strong>Best Time: </strong>{formatTime(latinHAM.bestTime)}
              </p>
            </div>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onLatinHAMClick(latinHAM);
            }}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Eye className="mr-2 h-4 w-4" /> View
          </Button>
        </div>
      ))}
    </div>
  )
}

export default LatinHAMGrid