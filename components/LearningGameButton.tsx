import React from 'react'
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import Link from 'next/link'
import { useTheme } from "next-themes"

export default function LearningGameButton() {
  const { theme } = useTheme()

  return (
    <Link href="/learning-mode" passHref className="flex justify-center mt-4">
      <Button
        variant="outline"
        size="lg"
        className={`
          rounded-full px-6 py-3 shadow-md transition-colors duration-200
          bg-transparent
          ${theme === 'light' 
            ? 'text-blue-700 hover:text-white hover:bg-blue-700' 
            : 'text-blue-400 hover:text-white hover:bg-blue-700'}
        `}
        aria-label="Go to Learning Mode"
      >
        <HelpCircle className="h-6 w-6 mr-2" />
        Learning Mode
      </Button>
    </Link>
  )
}