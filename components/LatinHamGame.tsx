'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useGameLogic } from '../hooks/useGameLogic'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { GameBoard } from './GameBoard'
import { GamePreview } from './GamePreview'
import { ProgressBar } from './ProgressBar'
import { GameHeader } from './GameHeader'
import { GameControls } from './GameControls'
import { GameStats } from './GameStats'
import { WinDialog } from './WinDialog'
import { NewGameDialog } from './NewGameDialog'
import { ViewCompletedPuzzleDialog } from './ViewCompletedPuzzleDialog'
import { DifficultySelector } from './DifficultySelector'
import { Leaderboard } from './Leaderboard'
import Confetti from 'react-confetti'
import { LeaderboardEntry } from '../types'
import { WillTajerButton } from './WillTajerButton'
import DiscoveredLatinHAMsButton from './DiscoveredLatinHAMsButton'
import LearningGameButton from './LearningGameButton'

export default function LatinHamGame() {
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
    resetGame,
  } = useGameLogic()

  const {
    leaderboard,
    handleQuoteSubmit: leaderboardHandleQuoteSubmit,
  } = useLeaderboard(difficulty)

  const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false)
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [showViewPopup, setShowViewPopup] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null)
  const [winQuote, setWinQuote] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [showDifficultySelector, setShowDifficultySelector] = useState(true)
  const [hasSubmittedQuote, setHasSubmittedQuote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewedBoardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedWinQuote = localStorage.getItem('latinHamWinQuote')
    if (savedWinQuote) setWinQuote(savedWinQuote)

    const savedGameState = localStorage.getItem('latinHamGameState')
    setShowDifficultySelector(savedGameState ? savedGameState === 'start' : true)

    const savedHasSubmittedQuote = localStorage.getItem('latinHamHasSubmittedQuote')
    setHasSubmittedQuote(savedHasSubmittedQuote ? JSON.parse(savedHasSubmittedQuote) : false)
  }, [])

  const handleWin = useCallback(async () => {
    if (!hasSubmittedQuote) {
      setShowQuoteDialog(true)
      setShowConfetti(true)
    }
  }, [hasSubmittedQuote])

  const handleCloseWinPopup = useCallback(() => {
    setShowConfetti(false)
    setShowQuoteDialog(false)
  }, [])

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

  const confirmNewGame = useCallback(() => {
    setShowDifficultySelector(true)
    setShowNewGameConfirmation(false)
    setShowQuoteDialog(false)
    setShowConfetti(false)
    setHasSubmittedQuote(false)
    setWinQuote("")
    clearGameState()
  }, [clearGameState])

  const handleDifficultySelect = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    handleSelectDifficulty(selectedDifficulty)
    setShowDifficultySelector(false)
    setHasSubmittedQuote(false)
    setShowQuoteDialog(false)
    setShowConfetti(false)
    setWinQuote("")
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(false))
  }, [handleSelectDifficulty])

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

  const handleQuoteSubmit = useCallback(async (quote: string) => {
    if (hasSubmittedQuote || isSubmitting) return

    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }

    // Set a new timeout
    submitTimeoutRef.current = setTimeout(async () => {
      setIsSubmitting(true)

      const entry = createLeaderboardEntry()
      const updatedEntry = { ...entry, quote }
      
      try {
        const response = await fetch('/api/save-game', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedEntry),
        })

        if (!response.ok) {
          throw new Error('Failed to save game')
        }

        const savedGame = await response.json()
        console.log('Game saved successfully:', savedGame)

        await leaderboardHandleQuoteSubmit(quote, savedGame)
        setShowQuoteDialog(false)
        setWinQuote(quote)
        setHasSubmittedQuote(true)
        localStorage.setItem('latinHamWinQuote', quote)
        localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(true))
        
        setViewingEntry(savedGame)
        setShowViewPopup(true)
      } catch (error) {
        console.error('Error saving game:', error)
      } finally {
        setIsSubmitting(false)
      }
    }, 300) // 300ms debounce time
  }, [createLeaderboardEntry, leaderboardHandleQuoteSubmit, hasSubmittedQuote, isSubmitting])

  const isGameWon = gameState === 'won' || (gameState === 'playing' && checkWin(grid))

  useEffect(() => {
    if (isGameWon && !hasSubmittedQuote && !showQuoteDialog) {
      handleWin()
    }
  }, [isGameWon, hasSubmittedQuote, showQuoteDialog, handleWin])

  const handleViewCompletedBoardWrapper = useCallback((entry: LeaderboardEntry) => {
    setViewingEntry(entry)
    setShowViewPopup(true)
  }, [])

  const handleStartNewGame = useCallback(() => {
    setShowConfetti(false)
    setShowDifficultySelector(true)
    setHasSubmittedQuote(false)
    setShowQuoteDialog(false)
    setWinQuote("")
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(false))
    clearGameState()
  }, [clearGameState])

  const handleResetGame = useCallback((newInitialGrid: number[][]) => {
    console.log("Received Initial Grid in LatinHamGame:", newInitialGrid);
    resetGame(newInitialGrid)
    setHasSubmittedQuote(false)
    setShowQuoteDialog(false)
    setShowConfetti(false)
    setWinQuote("")
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(false))
    
    if (checkWin(newInitialGrid)) {
      handleWin()
    }
  }, [resetGame, checkWin, handleWin])

  const handleNewGame = useCallback(() => {
    setShowNewGameConfirmation(true)
  }, [])

  if (showDifficultySelector) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-foreground">
        <div className="w-[calc(6*3rem+6*0.75rem)] mb-32">
          <h1 className="text-6xl font-bold mb-6 text-center">latinHAM</h1>
          <GamePreview />
          <p className="text-center mt-4 mb-8">
            Fill the grid with colors so that each color appears exactly once in each row and column.
          </p>
          <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
          <div className="p-6">
            <LearningGameButton />
          </div>
        </div>
        <WillTajerButton />
        <DiscoveredLatinHAMsButton />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-foreground">
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
        </div>
      )}
      <GameHeader 
        gameState={gameState} 
        isGameWon={isGameWon} 
        onNewGame={handleNewGame}
      />
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
      <GameStats 
        gameState={gameState}
        viewingEntry={viewingEntry}
        moveCount={moveCount}
        elapsedTime={elapsedTime}
        hintCount={hintCount}
      />
      <div className="w-[calc(6*3rem+6*0.75rem)] mt-2">
        <ProgressBar grid={grid} />
      </div>
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
      
      <Leaderboard 
        entries={leaderboard[difficulty]}
        difficulty={difficulty}
        onViewCompletedBoard={handleViewCompletedBoardWrapper}
      />
      <NewGameDialog 
        open={showNewGameConfirmation}
        onOpenChange={setShowNewGameConfirmation}
        onConfirm={confirmNewGame}
      />
      <WinDialog 
        open={showQuoteDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseWinPopup()
          }
        }}
        onSubmit={handleQuoteSubmit}
        quote={winQuote}
        setQuote={setWinQuote}
        entry={hasSubmittedQuote ? createLeaderboardEntry() : undefined}
        gameNumber={leaderboard[difficulty].length + 1}
        difficulty={difficulty}
        onStartNewGame={handleStartNewGame}
        showQuoteInput={!hasSubmittedQuote}
        onResetGame={handleResetGame}
        isSubmitting={isSubmitting}
      />
      <ViewCompletedPuzzleDialog 
        open={showViewPopup}
        onOpenChange={setShowViewPopup}
        entry={viewingEntry}
        difficulty={difficulty}
        onResetGame={handleResetGame}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}