'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { useTheme } from 'next-themes'

export function HomeButton() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 rounded-full p-2 shadow-md transition-colors duration-200"
  
  const themeClasses = mounted && theme === 'dark'
    ? "bg-white-900 hover:bg-white-800 text-white-400 hover:text-white-300"
    : "bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-700"

  return (
    <Button asChild className={`${baseClasses} ${mounted ? themeClasses : ''}`}>
      <Link href="/">
        <Home className="h-5 w-5" />
      </Link>
    </Button>
  )
}