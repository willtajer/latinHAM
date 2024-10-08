'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeBackground() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <div className="fixed inset-0 -z-10">
        {/* Light mode background */}
        <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-0 transition-opacity duration-300"></div>
        
        {/* Dark mode background */}
        <div className="absolute inset-0 h-full w-full bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] opacity-0 dark:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Theme toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  )
}