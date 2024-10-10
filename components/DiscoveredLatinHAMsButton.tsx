'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Grid, X } from "lucide-react"
import { DiscoveredLatinHAMs } from './DiscoveredLatinHAMs'
import { motion, AnimatePresence } from 'framer-motion'
import { GamePreview } from './GamePreview'

export default function DiscoveredLatinHAMsButton() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOverlay = () => setIsOpen(!isOpen)

  const overlayVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full p-2 shadow-md transition-colors duration-200 z-10 bg-yellow-500 text-white hover:bg-gray-700 hover:text-yellow-500"
        onClick={toggleOverlay}
        aria-label="View Discovered LatinHAMs"
      >
        <Grid className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-background z-50 overflow-y-auto pt-16" // Added pt-16 here
          >
            <div className="min-h-screen p-4 sm:p-6 lg:p-8">
              <Button
                variant="ghost"
                size="icon"
                className="fixed top-20 right-4 z-50 bg-red-500 hover:bg-red-600 text-white" // Changed top-4 to top-20
                onClick={toggleOverlay}
                aria-label="Close Discovered LatinHAMs"
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center">
                  Discovered LatinHAMs
                </h1>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-[calc(6*3rem+6*0.75rem)] mb-6">
                    <GamePreview />
                  </div>
                </div>
                <p className="text-center mb-8 text-muted-foreground">
                  Explore player-identified gameboard layouts.
                </p>
                <DiscoveredLatinHAMs />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}