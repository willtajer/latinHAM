'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { BOARD_SIZE, createLatinSquare, prefillCells, checkWin } from '../utils/gameLogic'
import { GameBoard } from './GameBoard'
import { DifficultySelector } from './DifficultySelector'
import { Leaderboard, LeaderboardEntry } from './Leaderboard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Trash2, Download } from 'lucide-react'
import Confetti from 'react-confetti'

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

const colorMap: { [key: string]: string } = {
  'bg-red-500': '#ef4444',
  'bg-blue-500': '#3b82f6',
  'bg-yellow-500': '#eab308',
  'bg-green-500': '#22c55e',
  'bg-purple-500': '#a855f7',
  'bg-orange-500': '#f97316',
  'bg-white': '#ffffff',
}

const PreviewCell: React.FC<{ value: number }> = ({ value }) => {
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-transparent'
  return (
    <div className={`w-6 h-6 ${colorClass} transition-colors duration-300`}></div>
  )
}

const GamePreview: React.FC = () => {
  const [previewGrid, setPreviewGrid] = useState(() => createLatinSquare())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row])
        const randomRow = Math.floor(Math.random() * BOARD_SIZE)
        const randomCol = Math.floor(Math.random() * BOARD_SIZE)
        newGrid[randomRow][randomCol] = (newGrid[randomRow][randomCol] % BOARD_SIZE) + 1
        return newGrid
      })
    }, 420)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-6 bg-gray-200 p-2 rounded-lg shadow-inner mb-8">
      {previewGrid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <PreviewCell key={`${rowIndex}-${colIndex}`} value={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}

const ProgressBar: React.FC<{ grid: number[][] }> = ({ grid }) => {
  return (
    <div className="grid grid-cols-6 bg-gray-200 p-2 rounded-lg shadow-inner mb-4">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <PreviewCell key={`${rowIndex}-${colIndex}`} value={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}

const LatinHamGame: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>([])
  const [locked, setLocked] = useState<boolean[][]>([])
  const [edited, setEdited] = useState<boolean[][]>([])
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'viewing'>('start')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [hints, setHints] = useState<boolean[][]>([])
  const [showNumbers, setShowNumbers] = useState<boolean>(false)
  const [solution, setSolution] = useState<number[][]>([])
  const [initialGrid, setInitialGrid] = useState<number[][]>([])
  const [isTrashMode, setIsTrashMode] = useState<boolean>(false)
  const [moveCount, setMoveCount] = useState<number>(0)
  const [hintCount, setHintCount] = useState<number>(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [hintsActive, setHintsActive] = useState<boolean>(false)
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({
    easy: [],
    medium: [],
    hard: []
  })
  const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false)
  const [leaderboardUpdated, setLeaderboardUpdated] = useState<boolean>(false)
  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null)
  const [previousGameState, setPreviousGameState] = useState<'playing' | 'won' | null>(null)
  const [previousGrid, setPreviousGrid] = useState<number[][]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [showWinPopup, setShowWinPopup] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewedBoardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedState = localStorage.getItem('gameState')
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      setGrid(parsedState.grid)
      setLocked(parsedState.locked)
      setEdited(parsedState.edited)
      setGameState(parsedState.gameState)
      setDifficulty(parsedState.difficulty)
      setHints(parsedState.hints)
      setShowNumbers(parsedState.showNumbers)
      setSolution(parsedState.solution)
      setInitialGrid(parsedState.initialGrid)
      setMoveCount(parsedState.moveCount)
      setHintCount(parsedState.hintCount)
      setStartTime(parsedState.startTime)
      setElapsedTime(parsedState.elapsedTime)
      setHintsActive(parsedState.hintsActive)
      setLeaderboardUpdated(parsedState.leaderboardUpdated || false)
    } else {
      setGameState('start')
    }

    const savedLeaderboard = localStorage.getItem('leaderboard')
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard))
    }
  }, [])

  useEffect(() => {
    if (gameState === 'playing' || gameState === 'won') {
      const savedGameState = {
        grid,
        locked,
        edited,
        gameState,
        difficulty,
        hints,
        showNumbers,
        solution,
        initialGrid,
        moveCount,
        hintCount,
        startTime,
        elapsedTime,
        hintsActive,
        leaderboardUpdated
      }
      localStorage.setItem('gameState', JSON.stringify(savedGameState))
    }
  }, [grid, locked, edited, gameState, difficulty, hints, showNumbers, solution, initialGrid, moveCount, hintCount, startTime, elapsedTime, hintsActive, leaderboardUpdated])

  useEffect(() => {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
  }, [leaderboard])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && startTime !== null) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1
          localStorage.setItem('elapsedTime', newTime.toString())
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState, startTime])

  const handleWin = useCallback(() => {
    if (!leaderboardUpdated) {
      setGameState('won')
      const newEntry: LeaderboardEntry = {
        timestamp: new Date().toISOString(),
        moves: moveCount,
        time: elapsedTime,
        grid: grid.map(row => [...row]),
        initialGrid: initialGrid.map(row => [...row])
      }

      setLeaderboard(prevLeaderboard => {
        const updatedLeaderboard = {
          ...prevLeaderboard,
          [difficulty]: [...prevLeaderboard[difficulty], newEntry]
            .sort((a, b) => a.moves - b.moves)
            .slice(0, 12)
        }
        localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard))
        return updatedLeaderboard
      })
      setLeaderboardUpdated(true)
      setShowConfetti(true)
      
      setTimeout(() => {
        setShowWinPopup(true)
      }, 1000)
    }
  }, [difficulty, moveCount, elapsedTime, leaderboardUpdated, grid, initialGrid])

  useEffect(() => {
    if (gameState === 'playing' && checkWin(grid)) {
      handleWin()
    }
  }, [grid, gameState, handleWin])

  const initializeGame = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    const newSolution = createLatinSquare()
    setSolution(newSolution)
    const newGrid = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0))
    const newLocked = Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false))
    const newEdited = Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false))
    prefillCells(newGrid, newLocked, selectedDifficulty)
    setGrid(newGrid)
    setInitialGrid(newGrid.map(row => [...row]))
    setLocked(newLocked)
    setEdited(newEdited)
    setHints(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setShowNumbers(false)
    setIsTrashMode(false)
    setMoveCount(0)
    setHintCount(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setGameState('playing')
    setHintsActive(false)
    setDifficulty(selectedDifficulty)
    setLeaderboardUpdated(false)
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || locked[row][col]) return

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r])
      if (isTrashMode) {
        if (edited[row][col]) {
          newGrid[row][col] = 0
        }
      } else {
        newGrid[row][col] = (newGrid[row][col] % BOARD_SIZE) + 1
      }
      return newGrid
    })

    setEdited(prevEdited => {
      const newEdited = prevEdited.map(r => [...r])
      newEdited[row][col] = !isTrashMode
      return newEdited
    })

    setMoveCount(prevCount => prevCount + 1)
    setHints(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setShowNumbers(false)
    setHintsActive(false)
    setIsTrashMode(false)
  }, [gameState, locked, isTrashMode, edited])

  const handleSelectDifficulty = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    initializeGame(selectedDifficulty)
  }, [initializeGame])

  const handleNewGame = useCallback(() => {
    setShowNewGameConfirmation(true)
  }, [])

  const confirmNewGame = useCallback(() => {
    localStorage.removeItem('gameState')
    setGameState('start')
    setDifficulty('easy')
    setShowNewGameConfirmation(false)
    setLeaderboardUpdated(false)
  }, [])

  const handleHint = useCallback(() => {
    if (checkWin(grid)) {
      handleWin()
      return
    }

    const newHints = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (!edited[rowIndex][colIndex] || cell === 0) return false

        for (let i = 0; i < BOARD_SIZE; i++) {
          if (i !== colIndex && grid[rowIndex][i] === cell) return true
          if (i !== rowIndex && grid[i][colIndex] === cell) return true
        }

        return false
      })
    )

    if (newHints.some(row => row.some(cell => cell))) {
      setHints(newHints)
      setShowNumbers(true)
      setHintCount(prevCount => prevCount + 1)
      setHintsActive(true)
    }
  }, [grid, edited, handleWin])

  const handleReset = useCallback(() => {
    setGrid(initialGrid.map(row => [...row]))
    setEdited(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setHints(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
    setShowNumbers(false)
    setIsTrashMode(false)
    setMoveCount(0)
    setHintCount(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setGameState('playing')
    setHintsActive(false)
    setLeaderboardUpdated(false)
  }, [initialGrid])

  const handleTrashToggle = useCallback(() => {
    setIsTrashMode(prevMode => !prevMode)
    setMoveCount(prevCount => prevCount + 1)
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m${remainingSeconds.toString().padStart(2, '0')}s`
  }, [])

  const formatDateTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    return date.toISOString().split('.')[0].replace(/[-:]/g, '').replace('T', '_')
  }, [])

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    if (gameState === 'playing' || gameState === 'won') {
      setPreviousGameState(gameState)
      setPreviousGrid(grid.map(row => [...row]))
    }
    setViewingEntry(entry)
    setGrid(entry.grid)
    setGameState('viewing')
    setMoveCount(entry.moves)
    setElapsedTime(entry.time)

    // Smooth scroll to the viewed board
    setTimeout(() => {
      if (viewedBoardRef.current) {
        viewedBoardRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 100)
  }, [gameState, grid])

  const handleReturnFromViewingBoard = useCallback(() => {
    if (previousGameState) {
      setGameState(previousGameState)
      setGrid(previousGrid)
      setPreviousGameState(null)
      setPreviousGrid([])
      setViewingEntry(null)
    } else {
      handleNewGame()
    }
  }, [previousGameState, previousGrid, handleNewGame])

  const handleDownloadCompletedBoard = useCallback((entry: LeaderboardEntry, rank: number) => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('Canvas element not found')
      return
    }
  
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Unable to get 2D context from canvas')
      return
    }
  
    // Prompt user for text
    const userText = prompt("Enter text to add to the image (max 31 characters):", "")
    const displayText = userText ? `"${userText.slice(0, 31)}"` : ""
  
    const cellSize = 60
    const cellSpacing = 8
    const boardSize = BOARD_SIZE * cellSize + (BOARD_SIZE - 1) * cellSpacing
    const padding = 20
    const dateTimeHeight = 30
    const infoRowHeight = 40
    const progressBarHeight = 20
    const bottomPadding = 20
    const cornerRadius = 20
    const cardPadding = 10
    const cellCornerRadius = 10
    const userTextHeight = displayText ? 40 : 0
    const spaceBetweenBoardAndUserText = 30
    const spaceBetweenUserTextAndInfo = displayText ? spaceBetweenBoardAndUserText : 0
    const spaceBetweenElements = 10
  
    const contentWidth = boardSize + 2 * padding
    const contentHeight = boardSize + 2 * padding + spaceBetweenBoardAndUserText + userTextHeight + spaceBetweenUserTextAndInfo + infoRowHeight + dateTimeHeight + progressBarHeight + bottomPadding + 2 * spaceBetweenElements
  
    canvas.width = contentWidth + 2 * cardPadding
    canvas.height = contentHeight + 2 * cardPadding
  
    // Draw black background for the card
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  
    // Draw rounded rectangle for the main content
    ctx.fillStyle = '#f3f4f6'
    ctx.beginPath()
    ctx.moveTo(cardPadding + cornerRadius, cardPadding)
    ctx.lineTo(cardPadding + contentWidth - cornerRadius, cardPadding)
    ctx.arcTo(cardPadding + contentWidth, cardPadding, cardPadding + contentWidth, cardPadding + cornerRadius, cornerRadius)
    ctx.lineTo(cardPadding + contentWidth, cardPadding + contentHeight - cornerRadius)
    ctx.arcTo(cardPadding + contentWidth, cardPadding + contentHeight, cardPadding + contentWidth - cornerRadius, cardPadding + contentHeight, cornerRadius)
    ctx.lineTo(cardPadding + cornerRadius, cardPadding + contentHeight)
    ctx.arcTo(cardPadding, cardPadding + contentHeight, cardPadding, cardPadding + contentHeight - cornerRadius, cornerRadius)
    ctx.lineTo(cardPadding, cardPadding + cornerRadius)
    ctx.arcTo(cardPadding, cardPadding, cardPadding + cornerRadius, cardPadding, cornerRadius)
    ctx.closePath()
    ctx.fill()
  
    // Adjust the drawing coordinates to account for the card padding
    const adjustX = (x: number) => x + cardPadding
    const adjustY = (y: number) => y + cardPadding
  
    // Helper function to draw rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + width, y, x + width, y + height, radius)
      ctx.arcTo(x + width, y + height, x, y + height, radius)
      ctx.arcTo(x, y + height, x, y, radius)
      ctx.arcTo(x, y, x + width, y, radius)
      ctx.closePath()
    }
  
    // Draw cells
    entry.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = adjustX(padding + colIndex * (cellSize + cellSpacing))
        const y = adjustY(padding + rowIndex * (cellSize + cellSpacing))
  
        // Draw cell background
        const colorClass = colorClasses[cell - 1] || 'bg-white'
        ctx.fillStyle = colorMap[colorClass] || 'white'
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()
  
        // Draw contrasting border for preset tiles
        if (entry.initialGrid[rowIndex][colIndex] !== 0) {
          ctx.strokeStyle = '#000000' // Black color for the border
          ctx.lineWidth = 5
          drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
          ctx.stroke()
  
          // Draw a white inner border to create a double-border effect
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 1
          drawRoundedRect(x + 1, y + 1, cellSize - 2, cellSize - 2, cellCornerRadius - 1)
          ctx.stroke()
        }
  
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()
  
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
  
        // Draw cell border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.lineWidth = 1
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.stroke()
      })
    })
  
    let currentY = adjustY(boardSize + padding)
  
    // Draw user text if provided
    if (displayText) {
      currentY += spaceBetweenBoardAndUserText
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(displayText, canvas.width / 2, currentY + 25)
      currentY += userTextHeight
    }
  
    // Draw info row (moves, time, hints)
    currentY += spaceBetweenUserTextAndInfo
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`Moves: ${entry.moves}     Time: ${formatTime(entry.time)}     Hints: ${hintCount}`, canvas.width / 2, currentY + 25)
    currentY += infoRowHeight + spaceBetweenElements
  
    // Format and draw date and time of completion
    const completionDate = new Date(entry.timestamp)
    const formattedDateTime = `${completionDate.getFullYear().toString().slice(-2)}${(completionDate.getMonth() + 1).toString().padStart(2, '0')}${completionDate.getDate().toString().padStart(2, '0')}${completionDate.getHours().toString().padStart(2, '0')}${completionDate.getMinutes().toString().padStart(2, '0')}${completionDate.getSeconds().toString().padStart(2, '0')}`
    
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    
    // Draw "latinHAM" in bold
    ctx.font = 'bold 14px Arial'
    const latinHAMWidth = ctx.measureText('latinHAM').width
    ctx.fillText('latinHAM', canvas.width / 2 - latinHAMWidth / 2 - 5, currentY + 25)
    
    // Draw "#" and the timestamp in regular font
    ctx.font = '14px Arial'
    ctx.fillText(`#${formattedDateTime}`, canvas.width / 2 + latinHAMWidth / 2 + 5, currentY + 25)
    
    currentY += dateTimeHeight + spaceBetweenElements
  
    // Draw progress bar
    const progressCellWidth = (contentWidth - 2 * padding) / (BOARD_SIZE * BOARD_SIZE)
    const progressCellHeight = progressBarHeight
  
    entry.grid.flat().forEach((cell, index) => {
      const x = adjustX(padding + index * progressCellWidth)
      const y = currentY
      const colorClass = colorClasses[cell - 1] || 'bg-white'
      ctx.fillStyle = colorMap[colorClass] || 'white'
      ctx.fillRect(x, y, progressCellWidth, progressCellHeight)
      
      // Draw cell border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, progressCellWidth, progressCellHeight)
    })
  
    // Convert canvas to image and download
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas')
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const fileName = `latinHAM_${difficulty}_rank${rank}_${formattedDateTime}_moves${entry.moves}_time${formatTime(entry.time)}.png`
      link.download = fileName
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [difficulty, formatTime, formatDateTime, hintCount])

  const handleCloseWinPopup = useCallback(() => {
    setShowWinPopup(false)
    setShowConfetti(false)
    handleViewCompletedBoard({
      timestamp: new Date().toISOString(),
      moves: moveCount,
      time: elapsedTime,
      grid: grid.map(row => [...row]),
      initialGrid: initialGrid.map(row => [...row])
    })
  }, [handleViewCompletedBoard, moveCount, elapsedTime, grid, initialGrid])

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-[calc(6*3rem+6*0.75rem)]">
          <h1 className="text-6xl font-bold mb-6 text-center">latinHAM</h1>
          <GamePreview />
          <p className="text-center mt-4 mb-8">
            Fill the grid with colors so that each color appears exactly once in each row and column.
          </p>
          <DifficultySelector onSelectDifficulty={handleSelectDifficulty} />
        </div>
        <a
          href="https://willtajer.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
          aria-label="Visit Will Tajer's website"
        >
          Created by Will Tajer
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
        </div>
      )}
      <div className="w-[calc(6*3rem+6*0.75rem)] mt-8 mb-4">
        <h1 className="text-6xl font-bold mb-2 text-center">latinHAM</h1>
        <p className="text-center mt-4">
          {gameState === 'viewing' 
            ? "Viewing a completed puzzle from the leaderboard." 
            : "Click on a cell to cycle through colors. Each color should appear once per row and column."}
        </p>
      </div>
      <div 
        ref={viewedBoardRef}
        className={`transition-all duration-300 ${gameState === 'viewing' ? 'outline outline-4 outline-blue-500 rounded-lg p-2' : ''}`}
      >
        <GameBoard 
          grid={grid}
          locked={locked}
          edited={edited}
          hints={hints}
          showNumbers={showNumbers}
          onCellClick={handleCellClick}
          isTrashMode={isTrashMode}
        />
      </div>
      <div className="w-[calc(6*3rem+5*0.75rem)] mt-4 mb-2">
        <div className="flex justify-between font-bold text-md">
          <span>Moves: {moveCount}</span>
          <span>Time: {formatTime(elapsedTime)}</span>
          <span>Hints: {hintCount}</span>
        </div>
      </div>
      <div className="w-[calc(6*3rem+6*0.75rem)] mt-2">
        <ProgressBar grid={grid} />
      </div>
      <div className="flex space-x-4">
        {gameState === 'viewing' ? (
          <>
            <Button 
              onClick={handleReturnFromViewingBoard}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Return to Game
            </Button>
            <Button 
              onClick={handleNewGame}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              New Game
            </Button>
            <Button
              onClick={() => handleDownloadCompletedBoard(viewingEntry || {
                timestamp: new Date().toISOString(),
                moves: moveCount,
                time: elapsedTime,
                grid: grid,
                initialGrid: initialGrid
              }, 0)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Board
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={handleNewGame}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              New Game
            </Button>
            <Button 
              onClick={handleReset}
              disabled={gameState === 'won'}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Reset
            </Button>
            <Button 
              onClick={handleHint} 
              disabled={gameState === 'won' || hintsActive}
              className={hintsActive ? "bg-yellow-500 hover:bg-yellow-500 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-600 text-white"}
            >
              Hint
            </Button>
            <Button 
              onClick={handleTrashToggle} 
              disabled={gameState === 'won'}
              variant={isTrashMode ? "destructive" : "outline"}
              className={isTrashMode ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Trash2 className="w-4 h-4" />
              {isTrashMode ? "" : ""}
            </Button>
          </>
        )}
      </div>
      <div className="mt-8 w-full max-w-xxl">
        <Leaderboard 
          entries={leaderboard[difficulty]} 
          difficulty={difficulty}
          onViewCompletedBoard={handleViewCompletedBoard}
          onDownloadCompletedBoard={handleDownloadCompletedBoard}
        />
      </div>
      <Dialog open={showNewGameConfirmation} onOpenChange={setShowNewGameConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Game?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to start a new game? Your current progress will be lost.</p>
          <DialogFooter>
            <Button onClick={() => setShowNewGameConfirmation(false)} variant="outline">Cancel</Button>
            <Button onClick={confirmNewGame}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showWinPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="bg-white p-8 rounded-lg shadow-xl z-50">
            <h2 className="text-2xl font-bold mb-4">New latinHAM!</h2>
            <p className="mb-4">Congratulations! You&apos;ve completed the puzzle!</p>
            <Button onClick={handleCloseWinPopup}>View Completed Game</Button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <a
        href="https://willtajer.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
        aria-label="Visit Will Tajer's website"
      >
        Created by Will Tajer
      </a>
    </div>
  )
}

export default LatinHamGame