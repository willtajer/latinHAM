// components/LatinHamGame.tsx
'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useGameLogic } from '../hooks/useGameLogic' // Custom hook for game logic
import { useLeaderboard } from '../hooks/useLeaderboard' // Custom hook for leaderboard management
import { GameBoard } from './GameBoard' // Component to display the game board
import { GamePreview } from './GamePreview' // Component to display a preview of the game
import { ProgressBar } from './ProgressBar' // Component to display game progress
import { GameHeader } from './GameHeader' // Component to display the game header
import { GameControls } from './GameControls' // Component for game control buttons
import { GameStats } from './GameStats' // Component to display game statistics
import { WinDialog } from './WinDialog' // Component to display a win dialog
import { NewGameDialog } from './NewGameDialog' // Component to confirm starting a new game
import { DifficultySelector } from './DifficultySelector' // Component to select game difficulty
import Confetti from 'react-confetti' // Library for confetti animation
import { LeaderboardEntry } from '../types' // Type definition for leaderboard entries

// Define the props for the LatinHamGame component
interface LatinHamGameProps {
  onTriggerNewGame: (trigger: () => void) => void // Function to trigger a new game
}

// Main component for the LatinHam game
export default function LatinHamGame({ onTriggerNewGame }: LatinHamGameProps) {
  // Destructure values and functions from the custom game logic hook
  const {
    grid,
    locked,
    edited,
    gameState,
    difficulty,
    hints,
    showNumbers,
    moveCount,
    hintCount,
    elapsedTime,
    hintsActive,
    isTrashMode,
    initialGrid,
    handleCellClick,
    handleSelectDifficulty,
    handleHint,
    handleReset,
    handleTrashToggle,
    checkWin,
  } = useGameLogic()

  // Memoize the difficulty to prevent unnecessary recalculations
  const memoizedDifficulty = useMemo(() => difficulty, [difficulty])

  // Destructure values and functions from the custom leaderboard hook
  const {
    leaderboard,
    handleQuoteSubmit: leaderboardHandleQuoteSubmit,
  } = useLeaderboard(memoizedDifficulty)

  // State variables for managing various UI elements and game data
  const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false)
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [winQuote, setWinQuote] = useState(() => {
    const savedWinQuote = localStorage.getItem('latinHamWinQuote')
    return savedWinQuote || ""
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [showDifficultySelector, setShowDifficultySelector] = useState(true)
  const [showWinCard, setShowWinCard] = useState(false)
  const [hasSubmittedQuote, setHasSubmittedQuote] = useState(() => {
    const savedHasSubmittedQuote = localStorage.getItem('latinHamHasSubmittedQuote')
    return savedHasSubmittedQuote ? JSON.parse(savedHasSubmittedQuote) : false
  })

  // References to DOM elements for potential future use
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewedBoardRef = useRef<HTMLDivElement>(null)

  // useEffect to initialize state from localStorage when the component mounts
  useEffect(() => {
    const savedWinQuote = localStorage.getItem('latinHamWinQuote')
    if (savedWinQuote) setWinQuote(savedWinQuote)

    const savedGameState = localStorage.getItem('latinHamGameState')
    setShowDifficultySelector(savedGameState ? savedGameState === 'start' : true)

    const savedHasSubmittedQuote = localStorage.getItem('latinHamHasSubmittedQuote')
    setHasSubmittedQuote(savedHasSubmittedQuote ? JSON.parse(savedHasSubmittedQuote) : false)
  }, [])

  // Callback function to handle game win events
  const handleWin = useCallback(async () => {
    if (!hasSubmittedQuote) {
      setShowQuoteDialog(true) // Show dialog to submit a quote
      setShowConfetti(true) // Trigger confetti animation
    }
  }, [hasSubmittedQuote])

  // useEffect to check for a win condition whenever the game state or grid changes
  useEffect(() => {
    if (gameState === 'won' || (gameState === 'playing' && checkWin(grid))) {
      handleWin()
    }
  }, [gameState, grid, checkWin, handleWin])

  // Callback to handle closing the win popup
  const handleCloseWinPopup = useCallback(() => {
    setShowConfetti(false)
    setShowQuoteDialog(false)
  }, [])

  // Function to clear saved game state from localStorage
  const clearGameState = useCallback(() => {
    localStorage.removeItem('latinHamGrid')
    localStorage.removeItem('latinHamLocked')
    localStorage.removeItem('latinHamEdited')
    localStorage.removeItem('latinHamGameState')
    localStorage.removeItem('latinHamDifficulty')
    localStorage.removeItem('latinHamHints')
    localStorage.removeItem('latinHamSolution')
    localStorage.removeItem('latinHamInitialGrid')
    localStorage.removeItem('latinHamMoveCount')
    localStorage.removeItem('latinHamHintCount')
    localStorage.removeItem('latinHamStartTime')
    localStorage.removeItem('latinHamElapsedTime')
    localStorage.removeItem('latinHamWinQuote')
    localStorage.removeItem('latinHamHasSubmittedQuote')
  }, [])

  // Callback to confirm starting a new game
  const confirmNewGame = useCallback(() => {
    setShowNewGameConfirmation(false)
    setShowDifficultySelector(true)
    setShowQuoteDialog(false)
    setShowConfetti(false)
    setShowWinCard(false)
    setHasSubmittedQuote(false)
    setWinQuote("")
    clearGameState()
  }, [clearGameState])

  // Callback to handle difficulty selection
  const handleDifficultySelect = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    handleSelectDifficulty(selectedDifficulty)
    setShowDifficultySelector(false)
    setHasSubmittedQuote(false)
    setShowQuoteDialog(false)
    setShowConfetti(false)
    setShowWinCard(false)
    setWinQuote("")
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(false))
  }, [handleSelectDifficulty])

  // Function to create a new leaderboard entry
  const createLeaderboardEntry = useCallback((): LeaderboardEntry => {
    return {
      id: Date.now().toString(),
      difficulty,
      moves: moveCount,
      time: elapsedTime,
      grid: grid,
      initialGrid: initialGrid,
      quote: winQuote,
      hints: hintCount,
      timestamp: new Date().toISOString()
    }
  }, [difficulty, moveCount, elapsedTime, grid, initialGrid, winQuote, hintCount])

  // Determine if the game has been won
  const isGameWon = gameState === 'won' || (gameState === 'playing' && checkWin(grid))

  // Callback to handle quote submission after winning
  const handleQuoteSubmit = useCallback(async (quote: string) => {
    const entry = createLeaderboardEntry()
    const updatedEntry = { ...entry, quote }
    await leaderboardHandleQuoteSubmit(quote, updatedEntry) // Submit the quote to the leaderboard
    setShowQuoteDialog(false)
    setWinQuote(quote)
    setShowWinCard(true)
    setHasSubmittedQuote(true)
    localStorage.setItem('latinHamWinQuote', quote)
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(true))
  }, [createLeaderboardEntry, leaderboardHandleQuoteSubmit])

  // Callback to start a new game
  const handleStartNewGame = useCallback(() => {
    setShowWinCard(false)
    setShowConfetti(false)
    setShowDifficultySelector(true)
    setHasSubmittedQuote(false)
    setShowQuoteDialog(false)
    setWinQuote("")
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(false))
    clearGameState()
  }, [clearGameState])

  // Callback to handle the new game button click
  const handleNewGame = useCallback(() => {
    if (gameState === 'playing' && !showDifficultySelector) {
      setShowNewGameConfirmation(true) // Show confirmation dialog if a game is in progress
    } else {
      confirmNewGame() // Start a new game directly
    }
  }, [gameState, showDifficultySelector, confirmNewGame])

  // useEffect to register the new game handler
  useEffect(() => {
    onTriggerNewGame(handleNewGame)
  }, [handleNewGame, onTriggerNewGame])

  // Conditional rendering to show the difficulty selector at the start
  if (showDifficultySelector) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-foreground">
        <div className="w-[calc(6*3rem+6*0.75rem)] mb-32">
          <h1 className="text-6xl font-bold mb-6 text-center">latinHAM</h1>
          <GamePreview /> {/* Display a game preview */}
          <p className="text-center mt-4 mb-8">
            Fill the grid with colors so that each color appears exactly once in each row and column.
          </p>
          <DifficultySelector onSelectDifficulty={handleDifficultySelect} /> {/* Difficulty selection buttons */}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-foreground">
      {/* Display confetti animation when winning */}
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
        </div>
      )}
      {/* Game header displaying game state and controls */}
      <GameHeader 
        gameState={gameState} 
        isGameWon={isGameWon} 
        onNewGame={handleNewGame}
      />
      {/* Container for the game board with conditional styling */}
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
      {/* Display game statistics */}
      <GameStats 
        gameState={gameState}
        viewingEntry={null}
        moveCount={moveCount}
        elapsedTime={elapsedTime}
        hintCount={hintCount}
      />
      {/* Display progress bar */}
      <div className="w-[calc(6*3rem+6*0.75rem)] mt-2">
        <ProgressBar grid={grid} />
      </div>
      {/* Display game controls unless viewing a leaderboard entry */}
      {gameState !== 'viewing' && (
        <GameControls 
          handleNewGame={handleNewGame}
          handleHint={handleHint}
          handleReset={handleReset}
          handleTrashToggle={handleTrashToggle}
          isGameWon={isGameWon}
          isTrashMode={isTrashMode}
          hintsActive={hintsActive}
        />
      )}
      {/* Dialog for confirming a new game */}
      <NewGameDialog 
        open={showNewGameConfirmation}
        onOpenChange={setShowNewGameConfirmation}
        onConfirm={confirmNewGame}
      />
      {/* Dialog for submitting a quote upon winning */}
      <WinDialog 
        open={showQuoteDialog || showWinCard}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseWinPopup()
          }
        }}
        onSubmit={handleQuoteSubmit}
        quote={winQuote}
        setQuote={setWinQuote}
        entry={hasSubmittedQuote ? createLeaderboardEntry() : undefined}
        gameNumber={leaderboard[memoizedDifficulty].length + 1}
        difficulty={memoizedDifficulty}
        onStartNewGame={handleStartNewGame}
        showQuoteInput={!hasSubmittedQuote}
      />
      {/* Hidden canvas element for potential future use */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
