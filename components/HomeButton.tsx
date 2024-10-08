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
          fixed bottom-4 left-4 rounded-full p-2 shadow-md transition-colors duration-200 z-10
          ${theme === 'light' 
            ? 'bg-gray-100 hover:bg-gray-700 text-yellow-400 hover:text-yellow-300' 
            : 'bg-gray-900 hover:bg-gray-100 text-yellow-600 hover:text-yellow-700'}
            `}
            aria-label="View Discovered LatinHAMs"
          >
        <Home className="h-6 w-6" />
      </Button>
    </Link>
  )
}