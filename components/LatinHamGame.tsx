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

const LatinHamGame: React.FC = () => {
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
    setGameState,
    initializeGame,
  } = useGameLogic()

  const {
    leaderboard,
    handleQuoteSubmit: leaderboardHandleQuoteSubmit,
    handleViewCompletedBoard,
    handleDownloadCompletedBoard,
  } = useLeaderboard(difficulty)

  const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false)
  const [showWinPopup, setShowWinPopup] = useState(false)
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [showViewPopup, setShowViewPopup] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null)
  const [winQuote, setWinQuote] = useState(() => {
    const savedWinQuote = localStorage.getItem('latinHamWinQuote')
    return savedWinQuote || ""
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [showDifficultySelector, setShowDifficultySelector] = useState(() => {
    const savedGameState = localStorage.getItem('latinHamGameState')
    return savedGameState ? savedGameState === 'start' : true
  })
  const [showWinCard, setShowWinCard] = useState(false)
  const [hasSubmittedQuote, setHasSubmittedQuote] = useState(() => {
    const savedHasSubmittedQuote = localStorage.getItem('latinHamHasSubmittedQuote')
    return savedHasSubmittedQuote ? JSON.parse(savedHasSubmittedQuote) : false
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewedBoardRef = useRef<HTMLDivElement>(null)

  const handleWin = useCallback(() => {
    if (!hasSubmittedQuote) {
      setShowQuoteDialog(true)
      setShowConfetti(true)
    }
  }, [hasSubmittedQuote])

  const handleCloseWinPopup = useCallback(() => {
    setShowWinPopup(false)
    setShowConfetti(false)
    setShowWinCard(false)
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
    setShowWinCard(false)
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
    setShowWinCard(false)
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
    const entry = createLeaderboardEntry()
    const updatedEntry = { ...entry, quote }
    await leaderboardHandleQuoteSubmit(quote, updatedEntry)
    setShowQuoteDialog(false)
    setWinQuote(quote)
    setShowWinCard(true)
    setHasSubmittedQuote(true)
    localStorage.setItem('latinHamWinQuote', quote)
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(true))
  }, [createLeaderboardEntry, leaderboardHandleQuoteSubmit])

  const isGameWon = gameState === 'won' || (gameState === 'playing' && checkWin(grid))

  useEffect(() => {
    if (isGameWon && !hasSubmittedQuote && !showQuoteDialog) {
      handleWin()
    }
  }, [isGameWon, hasSubmittedQuote, showQuoteDialog, handleWin])

  const handleViewCompletedBoardWrapper = useCallback((entry: LeaderboardEntry) => {
    setViewingEntry(entry)
    handleViewCompletedBoard(entry)
  }, [handleViewCompletedBoard])

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

  if (showDifficultySelector) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="w-[calc(6*3rem+6*0.75rem)] mb-32">
          <h1 className="text-6xl font-bold mb-6 text-center">latinHAM</h1>
          <GamePreview />
          <p className="text-center mt-4 mb-8">
            Fill the grid with colors so that each color appears exactly once in each row and column.
          </p>
          <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
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
      <GameHeader gameState={gameState} isGameWon={isGameWon} />
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
          handleNewGame={() => setShowNewGameConfirmation(true)}
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
        gameNumber={leaderboard[difficulty].length + 1}
        difficulty={difficulty}
        onStartNewGame={handleStartNewGame}
        showQuoteInput={!hasSubmittedQuote}
      />
      <ViewCompletedPuzzleDialog 
        open={showViewPopup}
        onOpenChange={setShowViewPopup}
        entry={viewingEntry}
        difficulty={difficulty}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default LatinHamGame