'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from 'next/link'
import { useTheme } from "next-themes"

export default function HomeButton() {
  const { theme } = useTheme()

  return (
    <Link href="/" passHref>
      <Button
        variant="ghost"
        size="icon"
        className={`
          rounded-full p-2 shadow-md transition-colors duration-200
          ${theme === 'dark' 
            ? 'bg-yellow-900 hover:bg-yellow-800 text-yellow-400 hover:text-yellow-300' 
            : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-600 hover:text-yellow-700'}
        `}
        aria-label="Return to Home"
      >
        <Home className="h-6 w-6" />
      </Button>
    </Link>
  )
}