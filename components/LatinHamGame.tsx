'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { BOARD_SIZE, createLatinSquare, prefillCells, checkWin } from '../utils/gameLogic'
import { GameBoard } from './GameBoard'
import { DifficultySelector } from './DifficultySelector'
import { Leaderboard, LeaderboardEntry } from './Leaderboard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Trash2, Download, X } from 'lucide-react'
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
    <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner mb-8">
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
    <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner mb-4">
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
  const [winQuote, setWinQuote] = useState<string>("")
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [showViewPopup, setShowViewPopup] = useState(false)
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
      setWinQuote(parsedState.winQuote || "")
    } else {
      setGameState('start')
    }

    const savedLeaderboard = localStorage.getItem('leaderboard')
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard))
    }
  }, [])

  useEffect(() => {
    if (gameState !== 'start') {
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
        leaderboardUpdated,
        winQuote
      }
      localStorage.setItem('gameState', JSON.stringify(savedGameState))
    }
  }, [grid, locked, edited, gameState, difficulty, hints, showNumbers, solution, initialGrid, moveCount, hintCount, startTime, elapsedTime, hintsActive, leaderboardUpdated, winQuote])

  useEffect(() => {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
  }, [leaderboard])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && startTime !== null) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState, startTime])

  const handleWin = useCallback(() => {
    if (!leaderboardUpdated) {
      setGameState('won')
      setShowQuoteDialog(true)
    }
  }, [leaderboardUpdated])

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
    setWinQuote("")
    setShowWinPopup(false)
    setShowConfetti(false)
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
    setShowWinPopup(false)
    setShowConfetti(false)
  }, [])

  const confirmNewGame = useCallback(() => {
    localStorage.removeItem('gameState')
    setGameState('start')
    setDifficulty('easy')
    setShowNewGameConfirmation(false)
    setLeaderboardUpdated(false)
    setWinQuote("")
    setShowWinPopup(false)
    setShowConfetti(false)
  }, [])

  const handleHint = useCallback(() => {
    if (checkWin(grid)) {
      handleWin()
      return
    }

    if (hintsActive) {
      setHints(Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false)))
      setHintsActive(false)
    } else {
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
        setHintsActive(true)
        setHintCount(prevCount => prevCount + 1)
      }
    }
  }, [grid, edited, handleWin, hintsActive])

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
    setWinQuote("")
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

  const handleViewCompletedBoard = useCallback((entry: LeaderboardEntry) => {
    setViewingEntry(entry)
    setShowViewPopup(true)
  }, [])

  const handleCloseViewPopup = useCallback(() => {
    setShowViewPopup(false)
    setViewingEntry(null)
  }, [])

  const handleDownloadCompletedBoard = useCallback((entry: LeaderboardEntry) => {
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

    const cellSize = 60
    const cellSpacing = 8
    const boardSize = BOARD_SIZE * cellSize + (BOARD_SIZE - 1) * cellSpacing
    const padding = 20
    const dateTimeHeight = 30
    const infoRowHeight = 40
    const quoteHeight = entry.quote ? 40 : 0
    const progressBarHeight = 20
    const bottomPadding = 5
    const cornerRadius = 20
    const cardPadding = 10
    const cellCornerRadius = 10
    const spaceBetweenBoardAndInfo = 10
    const spaceBetweenInfoAndQuote = entry.quote ? 20 : 0
    const spaceBetweenElements = 10

    const contentWidth = boardSize + 2 * padding
    const contentHeight = boardSize + 2 * padding + spaceBetweenBoardAndInfo + infoRowHeight + spaceBetweenInfoAndQuote + quoteHeight + dateTimeHeight + progressBarHeight + bottomPadding + 2 * spaceBetweenElements

    canvas.width = contentWidth + 2 * cardPadding
    canvas.height = contentHeight + 2 * cardPadding

    ctx.clearRect(0, 0, canvas.width, canvas.height)  

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

    const adjustX = (x: number) => x + cardPadding
    const adjustY = (y: number) => y + cardPadding

    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + width, y, x + width, y + height, radius)
      ctx.arcTo(x + width, y + height, x, y + height, radius)
      ctx.arcTo(x, y + height, x, y, radius)
      ctx.arcTo(x, y, x + width, y, radius)
      ctx.closePath()
    }

    entry.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = adjustX(padding + colIndex * (cellSize + cellSpacing))
        const y = adjustY(padding + rowIndex * (cellSize + cellSpacing))

        const colorClass = colorClasses[cell - 1] || 'bg-white'
        ctx.fillStyle = colorMap[colorClass] || 'white'
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()

        if (entry.initialGrid[rowIndex][colIndex] !== 0) {
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 5
          drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
          ctx.stroke()

          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 1
          drawRoundedRect(x + 2.5, y + 2.5, cellSize - 5, cellSize - 5, cellCornerRadius - 2.5)
          ctx.stroke()
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.lineWidth = 1
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.stroke()
      })
    })

    let currentY = adjustY(boardSize + padding)

    currentY += spaceBetweenBoardAndInfo
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`Moves: ${entry.moves}     Time: ${formatTime(entry.time)}     Hints: ${entry.hints}`, canvas.width / 2, currentY + 25)
    currentY += infoRowHeight + spaceBetweenInfoAndQuote

    if (entry.quote) {
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`"${entry.quote}"`, canvas.width / 2, currentY + 25)
      currentY += quoteHeight + spaceBetweenElements
    }

    const completionDate = new Date(entry.timestamp)
    const formattedDateTime = `${completionDate.getFullYear().toString().slice(-2)}${(completionDate.getMonth() + 1).toString().padStart(2, '0')}${completionDate.getDate().toString().padStart(2, '0')}${completionDate.getHours().toString().padStart(2, '0')}${completionDate.getMinutes().toString().padStart(2, '0')}${completionDate.getSeconds().toString().padStart(2, '0')}`
    
    const difficultyIndicator = difficulty.charAt(0).toUpperCase()
    
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    
    ctx.font = 'bold 14px Arial'
    const latinHAMText = 'latinHAM'
    const latinHAMWidth = ctx.measureText(latinHAMText).width
    
    ctx.font = '14px Arial'
    const timestampText = `#${formattedDateTime}${difficultyIndicator}`
    const timestampWidth = ctx.measureText(timestampText).width
    
    const totalWidth = latinHAMWidth + timestampWidth + 10
    const startX = (canvas.width - totalWidth) / 2
    
    ctx.font = 'bold 14px Arial'
    ctx.fillText(latinHAMText, startX + latinHAMWidth / 2, currentY + 25)
    
    ctx.font = '14px Arial'
    ctx.fillText(timestampText, startX + latinHAMWidth + 10 + timestampWidth / 2, currentY + 25)
    
    currentY += dateTimeHeight + spaceBetweenElements

    const progressCellWidth = (contentWidth - 2 * padding) / (BOARD_SIZE * BOARD_SIZE)
    const progressCellHeight = progressBarHeight

    entry.grid.flat().forEach((cell, index) => {
      const x = adjustX(padding + index * progressCellWidth)
      const y = currentY
      const colorClass = colorClasses[cell - 1] || 'bg-white'
      ctx.fillStyle = colorMap[colorClass] || 'white'
      ctx.fillRect(x, y, progressCellWidth, progressCellHeight)
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, progressCellWidth, progressCellHeight)
    })

    return canvas.toDataURL('image/png')
  }, [difficulty, formatTime])

  const handleQuoteSubmit = useCallback((quote: string) => {
    setWinQuote(quote)
    setShowQuoteDialog(false)
    
    const newEntry: LeaderboardEntry = {
      timestamp: new Date().toISOString(),
      moves: moveCount,
      time: elapsedTime,
      grid: grid.map(row => [...row]),
      initialGrid: initialGrid.map(row => [...row]),
      quote: quote,
      hints: hintCount
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
    
    const completedCardImage = handleDownloadCompletedBoard(newEntry)
    setShowWinPopup(true)
    return completedCardImage
  }, [difficulty, moveCount, elapsedTime, grid, initialGrid, hintCount, handleDownloadCompletedBoard])

  const handleCloseWinPopup = useCallback(() => {
    setShowWinPopup(false)
    setShowConfetti(false)
  }, [])

  const handleDownload = useCallback((entry: LeaderboardEntry) => {
    const imageDataUrl = handleDownloadCompletedBoard(entry)
    if (imageDataUrl) {
      const link = document.createElement('a')
      link.href = imageDataUrl
      link.download = `latinHAM_${difficulty}_moves${entry.moves}_time${formatTime(entry.time)}.png`
      link.click()
    }
  }, [difficulty, handleDownloadCompletedBoard, formatTime])

  const isGameWon = gameState === 'won' || (gameState === 'playing' && checkWin(grid))

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
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
            : isGameWon
            ? "Congratulations! You've completed the puzzle."
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
          <span>Moves: {gameState === 'viewing' ? viewingEntry?.moves : moveCount}</span>
          <span>Time: {formatTime(gameState === 'viewing' ? viewingEntry?.time || 0 : elapsedTime)}</span>
          <span>Hints: {gameState === 'viewing' ? viewingEntry?.hints : hintCount}</span>
        </div>
      </div>
      <div className="w-[calc(6*3rem+6*0.75rem)] mt-2 mb-2">
        <ProgressBar grid={grid} />
      </div>
      {gameState !== 'viewing' && (
        <div className="flex space-x-2 mb-8">
          <Button onClick={handleNewGame} variant="ghost" className="hover:bg-transparent focus:bg-transparent">New Game</Button>
          <Button onClick={handleHint} variant="ghost" className="hover:bg-transparent focus:bg-transparent" disabled={isGameWon}>
            {hintsActive ? 'Hide Hints' : 'Hint'}
          </Button>
          <Button onClick={handleReset} variant="ghost" className="hover:bg-transparent focus:bg-transparent" disabled={isGameWon}>Reset</Button>
          <Button onClick={handleTrashToggle} variant={isTrashMode ? "destructive" : "ghost"} className="hover:bg-transparent focus:bg-transparent" disabled={isGameWon}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <Leaderboard 
        entries={leaderboard[difficulty]}
        difficulty={difficulty}
        onViewCompletedBoard={handleViewCompletedBoard}
        onDownloadCompletedBoard={handleDownloadCompletedBoard}
      />
      <Dialog open={showNewGameConfirmation} onOpenChange={setShowNewGameConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Game?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to start a new game? Your current progress will be lost.</p>
          <DialogFooter className="sm:space-x-2">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button onClick={() => setShowNewGameConfirmation(false)} variant="outline" className="sm:w-auto">Cancel</Button>
              <Button onClick={confirmNewGame} className="sm:w-auto">Confirm</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations! You won!</DialogTitle>
          </DialogHeader>
          <p>Enter a quote to commemorate your victory:</p>
          <Input
            placeholder="Enter your quote here"
            value={winQuote}
            onChange={(e) => setWinQuote(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={() => handleQuoteSubmit(winQuote)}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showWinPopup} onOpenChange={(open) => {
          if (!open) handleCloseWinPopup();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
          </DialogHeader>
          <p>You've completed the puzzle!</p>
          <img src={handleDownloadCompletedBoard({
            timestamp: new Date().toISOString(),
            moves: moveCount,
            time: elapsedTime,
            grid: grid,
            initialGrid: initialGrid,
            quote: winQuote,
            hints: hintCount
          })} alt="Completed Game Card" className="w-full h-auto" />
          <DialogFooter>
            <div className="flex justify-center gap-2 w-full">
              <Button onClick={handleNewGame}>Start New Game</Button>
              <Button onClick={() => handleDownload({
                timestamp: new Date().toISOString(),
                moves: moveCount,
                time: elapsedTime,
                grid: grid,
                initialGrid: initialGrid,
                quote: winQuote,
                hints: hintCount
              })} variant="outline"> 
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showViewPopup} onOpenChange={setShowViewPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completed Puzzle</DialogTitle>
          </DialogHeader>
          {viewingEntry && (
            <>
              <img 
                src={handleDownloadCompletedBoard(viewingEntry)} 
                alt="Completed Game Card" 
                className="w-full h-auto"
              />
              <DialogFooter>
                <div className="flex justify-between w-full">
                  <Button onClick={handleCloseViewPopup}>Close</Button>
                  <Button onClick={() => handleDownload(viewingEntry)} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default LatinHamGame