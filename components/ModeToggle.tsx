// components/ModeToggle.tsx
"use client"

import * as React from "react" // Importing React and all its exports
import { Moon, Sun } from "lucide-react" // Importing Moon and Sun icons from lucide-react library
import { useTheme } from "next-themes" // Importing useTheme hook from next-themes for theme management
import { Button } from "@/components/ui/button" // Importing Button component from your UI library
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu" // Importing DropdownMenu components from your UI library

// ModeToggle component allows users to switch between light, dark, and system themes
export function ModeToggle() {
  const { setTheme } = useTheme() // Destructuring setTheme function from useTheme hook to change themes

  return (
    <DropdownMenu> {/* DropdownMenu component wraps the toggle button and the dropdown items */}
      <DropdownMenuTrigger asChild> {/* DropdownMenuTrigger defines the element that toggles the menu */}
        <Button variant="outline" size="icon"> {/* Button styled as an outline and sized as an icon */}
          {/* Sun icon is visible in light mode */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* Moon icon is visible in dark mode */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/* Accessible label for screen readers */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end"> {/* DropdownMenuContent contains the dropdown items, aligned to the end */}
        {/* DropdownMenuItem to switch to light theme */}
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        {/* DropdownMenuItem to switch to dark theme */}
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        {/* DropdownMenuItem to switch to system default theme */}
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
