"use client" // Ensures this component is rendered on the client side

import * as React from "react" // Importing React for JSX and component functionalities
import { useTheme } from "next-themes" // Importing useTheme hook for theme management
import { Moon, Sun } from "lucide-react" // Importing Moon and Sun icons from lucide-react
import { Button } from "@/components/ui/button" // Importing a custom Button component

// ThemeBackground component manages background styling based on the current theme and provides a toggle button
export default function ThemeBackground() {
  const { theme, setTheme } = useTheme() // Destructure theme and setTheme from useTheme hook

  return (
    <>
      {/* 
        Fixed container covering the entire viewport, placed behind other elements using -z-10.
        Contains two divs for light and dark mode backgrounds with radial gradients.
      */}
      <div className="fixed inset-0 -z-10">
        {/* Light mode background with radial gradient, hidden in dark mode */}
        <div className="absolute inset-0 h-full w-full bg-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-0 transition-opacity duration-300"></div>
        
        {/* Dark mode background with radial gradient, visible in dark mode */}
        <div className="absolute inset-0 h-full w-full bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] opacity-0 dark:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* 
        Theme toggle button fixed at the top-right corner.
        Clicking toggles between 'light' and 'dark' themes.
      */}
      <Button
        variant="outline" // Outline style for the button
        size="icon" // Icon size variant
        className="fixed top-4 right-4 z-50" // Fixed positioning with high z-index
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} // Toggle theme on click
      >
        {/* Sun icon visible in light mode */}
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        {/* Moon icon visible in dark mode */}
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        {/* Accessible label for screen readers */}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  )
}
