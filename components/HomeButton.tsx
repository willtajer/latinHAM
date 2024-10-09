'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from 'next/navigation'

export default function HomeButton() {
  const { theme } = useTheme()
  const router = useRouter()

  const handleNewGame = () => {
    // Navigate to the difficulty selection page
    router.push('/')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleNewGame}
      className={`
        fixed bottom-4 left-4 rounded-full p-2 shadow-md transition-colors duration-200 z-10
        ${theme === 'light' 
          ? 'bg-red-500 hover:bg-gray-700 text-white hover:text-white-300' 
          : 'bg-red-500 hover:bg-gray-700 text-white hover:text-white-300'}
      `}
      aria-label="Start New Game"
    >
      <Play className="h-6 w-6" />
    </Button>
  )
}