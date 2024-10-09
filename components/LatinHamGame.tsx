'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
import DiscoveredLatinHAMsButton from '@/components/DiscoveredLatinHAMsButton'
import { useSearchParams } from 'next/navigation'
import LearningGameButton from './LearningGameButton'
import { WillTajerButton } from './WillTajerButton'

const LatinHamGame: React.FC = () => {
  const searchParams = useSearchParams()
  const [initialGrid, setInitialGrid] = useState<number[][] | null>(null)

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
    handleCellClick,
    handleSelectDifficulty,
    handleHint,
    handleReset,
    handleTrashToggle,
    checkWin,
    resetGame,
  } = useGameLogic(initialGrid)

  const memoizedDifficulty = useMemo(() => difficulty, [difficulty])

  const {
    leaderboard,
    handleQuoteSubmit: leaderboardHandleQuoteSubmit,
  } = useLeaderboard(memoizedDifficulty)

  useEffect(() => {
    console.log('Leaderboard fetched for difficulty:', memoizedDifficulty)
  }, [leaderboard, memoizedDifficulty])

  const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false)
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

  useEffect(() => {
    const preset = searchParams.get('preset')
    if (preset) {
      try {
        const decodedGrid = JSON.parse(decodeURIComponent(preset))
        setInitialGrid(decodedGrid)
        resetGame(decodedGrid)
      } catch (error) {
        console.error('Error parsing preset grid:', error)
      }
    }
  }, [searchParams, resetGame])

  const handleWin = useCallback(() => {
    if (!hasSubmittedQuote) {
      setShowQuoteDialog(true)
      setShowConfetti(true)
    }
  }, [hasSubmittedQuote])

  const handleCloseWinPopup = useCallback(() => {
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
      difficulty: memoizedDifficulty,
      moves: moveCount,
      time: elapsedTime,
      grid: grid,
      initialGrid: initialGrid || [],
      quote: winQuote,
      hints: hintCount,
      timestamp: new Date().toISOString()
    }
  }, [memoizedDifficulty, moveCount, elapsedTime, grid, initialGrid, winQuote, hintCount])

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
    setShowViewPopup(true)
  }, [])

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

  const handleResetGame = useCallback((newInitialGrid: number[][]) => {
    console.log("Received Initial Grid in LatinHamGame:", newInitialGrid);
    setInitialGrid(newInitialGrid);
    resetGame(newInitialGrid);
    setHasSubmittedQuote(false);
    setShowQuoteDialog(false);
    setShowConfetti(false);
    setShowWinCard(false);
    setWinQuote("");
    localStorage.setItem('latinHamHasSubmittedQuote', JSON.stringify(false));
    
    if (checkWin(newInitialGrid)) {
      handleWin();
    }
  }, [resetGame, checkWin, handleWin]);

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
        </div>
        <WillTajerButton />
        <DiscoveredLatinHAMsButton />
        <LearningGameButton />
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
      <GameHeader gameState={gameState} isGameWon={isGameWon} onNewGame={handleNewGame} />
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
        entries={leaderboard[memoizedDifficulty]}
        difficulty={memoizedDifficulty}
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
        gameNumber={leaderboard[memoizedDifficulty].length + 1}
        difficulty={memoizedDifficulty}
        onStartNewGame={handleStartNewGame}
        showQuoteInput={!hasSubmittedQuote}
        onResetGame={handleResetGame}
      />
      <ViewCompletedPuzzleDialog 
        open={showViewPopup}
        onOpenChange={setShowViewPopup}
        entry={viewingEntry}
        difficulty={memoizedDifficulty}
        onResetGame={handleResetGame}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default React.memo(LatinHamGame)