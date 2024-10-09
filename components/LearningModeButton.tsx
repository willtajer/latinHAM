import React from 'react'
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import Link from 'next/link'
import { useTheme } from "next-themes"

export default function LearningModeButton() {
  const { theme } = useTheme()

  return (
    <Link href="/learning-mode" passHref>
      <Button
        variant="ghost"
        size="icon"
        className={`
          fixed bottom-4 right-4 rounded-full p-2 shadow-md transition-colors duration-200 z-10
          ${theme === 'light' 
            ? 'bg-yellow-300 hover:bg-yellow-200 text-white hover:text-white' 
            : 'bg-yellow-400 hover:bg-yellow-300 text-white hover:text-white'}
        `}
        aria-label="Go to Learning Mode"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </Link>
  )
}