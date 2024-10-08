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
          fixed bottom-4 left-4 rounded-full p-2 shadow-md transition-colors duration-200
          ${theme === 'dark' 
            ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300' 
            : 'bg-white hover:bg-gray-100 text-blue-600 hover:text-blue-700'}
            `}
            aria-label="View Discovered LatinHAMs"
          >
        <Grid className="h-6 w-6" />
      </Button>
    </Link>
  )
}