import React from 'react'
import { Button } from "@/components/ui/button"
import { Grid } from "lucide-react"
import Link from 'next/link'
import { useTheme } from "next-themes"

export default function DiscoveredLatinHAMsButton() {
  const { theme } = useTheme()

  return (
    <Link href="/discovered" passHref>
      <Button
        variant="ghost"
        size="icon"
        className={`
          fixed bottom-4 right-4 rounded-full p-2 shadow-md transition-colors duration-200 z-10
          ${theme === 'light' 
            ? 'bg-blue-700 hover:bg-gray-700 text-white hover:text-white-300' 
            : 'bg-blue-700 hover:bg-gray-700 text-white hover:text-white-300'}
            `}
            aria-label="View Discovered LatinHAMs"
          >
        <Grid className="h-6 w-6" />
      </Button>
    </Link>
  )
}