'use client'

import React, { useState, useCallback } from 'react' // Importing React and necessary hooks
import { Button } from "@/components/ui/button" // Importing Button component for user interactions
import { Play, Grid, Trophy, HelpCircle, User, X, Award } from "lucide-react" // Importing icons from lucide-react library
import { useTheme } from "next-themes" // Importing useTheme hook for theme management
import { motion, AnimatePresence } from 'framer-motion' // Importing motion and AnimatePresence for animations
import { Card, CardContent } from '@/components/ui/card' // Importing Card components for layout
import Link from 'next/link' // Importing Link component for client-side navigation
import { DiscoveredLatinHAMs } from './DiscoveredLatinHAMs' // Importing DiscoveredLatinHAMs component
import { GamePreview } from './GamePreview' // Importing GamePreview component
import Leaderboard from './Leaderboard' // Importing Leaderboard component
import { LearningModeGame } from './LearningModeGame' // Importing LearningModeGame component
import { UserProfile } from './UserProfile' // Importing UserProfile component

// Define the props interface for StickyButtonBar component
interface StickyButtonBarProps {
  onStartNewGame: () => void // Callback function to handle starting a new game
}

// StickyButtonBar component definition
export default function StickyButtonBar({ onStartNewGame }: StickyButtonBarProps) {
  const { theme } = useTheme() // Destructure theme from useTheme hook to access current theme
  // State to manage which overlay is currently active ('none' means no overlay is active)
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'discovered' | 'leaderboard' | 'learning' | 'profile' | 'quests'>('none')
  // State to track if the learning mode has been completed
  const [isLearningComplete, setIsLearningComplete] = useState(false)
  // State to manage the key for LearningModeGame component to force re-mount on restart
  const [learningKey, setLearningKey] = useState(0)

  // Handler to initiate a new game by invoking the onStartNewGame prop
  const handleNewGame = () => {
    onStartNewGame()
  }

  // Function to toggle overlays based on the overlay type passed
  const toggleOverlay = (overlay: 'discovered' | 'leaderboard' | 'learning' | 'profile' | 'quests') => {
    setActiveOverlay(prev => prev === overlay ? 'none' : overlay) // Toggle between the selected overlay and 'none'
  }

  // useCallback hook to memoize the closeOverlays function to prevent unnecessary re-renders
  const closeOverlays = useCallback(() => {
    setActiveOverlay('none') // Set activeOverlay to 'none' to close any open overlay
  }, [])

  // useCallback hook to handle completion of learning mode
  const handleLearningCompletion = useCallback(() => {
    setIsLearningComplete(true) // Set isLearningComplete to true upon completion
  }, [])

  // useCallback hook to handle restarting of learning mode
  const handleLearningRestart = useCallback(() => {
    setIsLearningComplete(false) // Reset isLearningComplete to false
    setLearningKey(prevKey => prevKey + 1) // Increment learningKey to force re-mount LearningModeGame
  }, [])

  // Variants for overlay animations using framer-motion
  const overlayVariants = {
    hidden: { opacity: 0, y: '100%' }, // Initial hidden state: fully transparent and positioned below the viewport
    visible: { opacity: 1, y: 0 }, // Visible state: fully opaque and in place
    exit: { opacity: 0, y: '100%' } // Exit state: transitions back to hidden state
  }

  // Function to determine the styling of the overlay based on its type and the current theme
  const getOverlayStyle = (overlayType: 'discovered' | 'leaderboard' | 'learning' | 'profile' | 'quests') => {
    // Define background colors for each overlay type in light and dark themes
    const colors = {
      discovered: { light: 'bg-orange-500', dark: 'bg-slate-950' },
      leaderboard: { light: 'bg-green-500', dark: 'bg-slate-950' },
      learning: { light: 'bg-purple-500', dark: 'bg-slate-950' },
      profile: { light: 'bg-blue-500', dark: 'bg-slate-950' },
      quests: { light: 'bg-yellow-400', dark: 'bg-slate-950' },
    }

    const color = colors[overlayType] // Get the color configuration for the current overlay type
    const bgColor = theme === 'dark' ? color.dark : color.light // Choose the appropriate color based on the current theme

    // Return the complete background style with radial gradients and sizing
    return `${bgColor} bg-[radial-gradient(#ffffff33_5px,transparent_2px)] dark:bg-[radial-gradient(#ffffff33_2px,transparent_2px)] bg-[size:40px_40px]`
  }

  return (
    <>
      {/* Fixed container for the sticky button bar at the bottom of the screen */}
      <div className="fixed bottom-0 left-0 w-full sm:bottom-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:w-auto z-[60]">
        {/* Inner container with background, padding, rounded corners, shadow, and flex layout */}
        <div className="bg-gray-200 dark:bg-gray-900 bg-opacity-70 backdrop-blur-md text-white py-4 px-4 sm:py-2 sm:px-4 sm:rounded-full shadow-lg flex justify-center items-center w-full sm:w-auto">
          {/* Flex container to arrange buttons horizontally with spacing */}
          <div className="flex justify-center space-x-2">
            {/* Button to start a new game */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                closeOverlays() // Close any open overlays
                handleNewGame() // Trigger new game start
              }}
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-red-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-red-500"
              aria-label="Start New Game" // Accessibility label
            >
              <Play className="h-6 w-6" /> {/* Play icon */}
            </Button>
            
            {/* Button to view discovered LatinHAMs */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-orange-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-orange-500"
              onClick={() => toggleOverlay('discovered')} // Toggle the 'discovered' overlay
              aria-label="View Discovered LatinHAMs" // Accessibility label
            >
              <Grid className="h-6 w-6" /> {/* Grid icon */}
            </Button>
            
            {/* Button for Achievements */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-yellow-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-yellow-500"
              onClick={() => toggleOverlay('quests')} // Toggle the 'quests' overlay
              aria-label="Achievements" // Accessibility label
            >
              <Award className="h-6 w-6" /> {/* Award icon */}
            </Button>
            
            {/* Button to view the leaderboard */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-green-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-green-500"
              onClick={() => toggleOverlay('leaderboard')} // Toggle the 'leaderboard' overlay
              aria-label="View Leaderboard" // Accessibility label
            >
              <Trophy className="h-6 w-6" /> {/* Trophy icon */}
            </Button>
            
            {/* Button to view the user profile */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-blue-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-blue-500"
              onClick={() => toggleOverlay('profile')} // Toggle the 'profile' overlay
              aria-label="View User Profile" // Accessibility label
            >
              <User className="h-6 w-6" /> {/* User icon */}
            </Button>
            
            {/* Button to access Learning Mode */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 shadow-md transition-colors duration-200 bg-purple-500 hover:bg-white dark:hover:bg-gray-700 text-white hover:text-purple-500"
              onClick={() => toggleOverlay('learning')} // Toggle the 'learning' overlay
              aria-label="Go to Learning Mode" // Accessibility label
            >
              <HelpCircle className="h-6 w-6" /> {/* HelpCircle icon */}
            </Button>
          </div>
        </div>
      </div>

      {/* AnimatePresence component to handle the mounting and unmounting of overlays with animations */}
      <AnimatePresence>
        {/* Conditionally render the overlay if activeOverlay is not 'none' */}
        {activeOverlay !== 'none' && (
          <motion.div
            variants={overlayVariants} // Animation variants for the overlay
            initial="hidden" // Initial animation state
            animate="visible" // Animate to visible state
            exit="exit" // Animate to exit state on unmount
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Define the transition properties
            className={`fixed inset-0 z-50 overflow-y-auto ${getOverlayStyle(activeOverlay)}`} // Fixed positioning and dynamic styling based on overlay type
          >
            {/* Container for the overlay content with padding and relative positioning */}
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
              {/* Close button positioned at the top-right corner */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white"
                onClick={closeOverlays} // Close the overlay when clicked
                aria-label="Close Overlay" // Accessibility label
              >
                <X className="h-6 w-6" /> {/* X icon for closing */}
              </Button>

              {/* Conditionally render content based on the activeOverlay state */}

              {/* Discovered LatinHAMs Overlay */}
              {activeOverlay === 'discovered' && (
                <div className="max-w-6xl mx-auto pt-16 pb-20">
                  <DiscoveredLatinHAMs /> {/* Render the DiscoveredLatinHAMs component */}
                </div>
              )}

              {/* Leaderboard Overlay */}
              {activeOverlay === 'leaderboard' && (
                <div className="max-w-6xl mx-auto pt-16 pb-20">
                  {/* Leaderboard Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center text-white">
                    LatinHAM Leaderboard
                  </h1>
                  {/* Game Preview Section */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-[calc(6*3rem+6*0.75rem)] mt-2">
                      <GamePreview /> {/* Render the GamePreview component */}
                    </div>
                  </div>
                  {/* Leaderboard Component */}
                  <Leaderboard 
                    initialDifficulty="all" // Set initial difficulty to 'all'
                    onDifficultyChange={(newDifficulty) => console.log(`Difficulty changed to: ${newDifficulty}`)} // Handle difficulty changes
                  />
                </div>
              )}

              {/* Learning Mode Overlay */}
              {activeOverlay === 'learning' && (
                <div className="w-full max-w-6xl mx-auto pt-16 pb-20">
                  {/* Learning Mode Header Section */}
                  <div className="flex flex-col items-center justify-center w-full mb-8">
                    <div className="w-[calc(6*3rem+6*0.75rem)]">
                      {/* Link to home with the latinHAM title */}
                      <Link href="/" passHref>
                        <h1 className="text-6xl font-bold mb-6 text-center text-white cursor-pointer hover:text-primary transition-colors duration-200">
                          LATINham
                        </h1>
                      </Link>
                      <GamePreview /> {/* Render the GamePreview component */}
                      {/* Learning Mode Subtitle */}
                      <h2 className="text-2xl font-semibold text-center text-white sm:mt-8 md:mt-8 mb-4">Learning Mode</h2>
                      {/* Learning Mode Description */}
                      <p className="text-center text-white mt-4">
                        {isLearningComplete
                          ? "Great job! You've mastered the basics of Latin squares."
                          : "Fill the grid so that each number (1-3) appears exactly once in each row and column."}
                      </p>
                    </div>
                  </div>

                  {/* Learning Mode Content Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* How to Play Card */}
                    <Card className="md:col-span-1 order-2 md:order-1">
                      <CardContent className="p-6">
                        <h2 className="text-3xl font-bold mb-4 text-center text-blue-500">How to Play</h2>
                        {/* List of instructions */}
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                          <li>Click on a cell to cycle through numbers 1-3.</li>
                          <li>Each number must appear exactly once in each row and column.</li>
                          <li>Use logic to determine the correct placement of each number.</li>
                          <li>Once you&apos;ve filled the grid correctly, the numbers will transform into colors.</li>
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Learning Mode Game Preview */}
                    <div className="md:col-span-1 flex justify-center order-1 md:order-2 pb-8 md:pb-0">
                      <LearningModeGame 
                        key={learningKey} // Unique key to force re-mounting on restart
                        onComplete={handleLearningCompletion} // Callback when learning mode is completed
                        onRestart={handleLearningRestart} // Callback to handle restarting learning mode
                      />
                    </div>

                    {/* Tips Card */}
                    <Card className="md:col-span-1 order-3">
                      <CardContent className="p-6">
                        <h2 className="text-3xl font-bold mb-4 text-center text-yellow-500">Tips</h2>
                        {/* List of tips */}
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                          <li>Start with the rows or columns that have the most numbers filled in.</li>
                          <li>If a number appears twice in a row or column, one of them must be incorrect.</li>
                          <li>Remember, the same principles apply to the full 6x6 LATINham game!</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* User Profile Overlay */}
              {activeOverlay === 'profile' && (
                <div className="max-w-6xl mx-auto pt-16 pb-20">
                  <UserProfile /> {/* Render the UserProfile component */}
                </div>
              )}

              {/* Achievements (Quests) Overlay */}
              {activeOverlay === 'quests' && (
                <div className="max-w-6xl mx-auto pt-16">
                  {/* Achievements Title */}
                  <h1 className="text-6xl font-bold mb-6 text-center text-white">
                    Achievements
                  </h1>
                  {/* Placeholder for Achievements Content */}
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-2xl text-white">Coming Soon</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
