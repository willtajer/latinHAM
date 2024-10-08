// components/DiscoveredLatinHAMsButton.tsx
import React from 'react'
import { Button } from "@/components/ui/button"
import { Grid } from "lucide-react"
import Link from 'next/link'

export default function DiscoveredLatinHAMsButton() {
  return (
    <Link href="/discovered" passHref>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 bg-red-200 hover:bg-red-300 rounded-full p-2 shadow-md transition-colors duration-200"
        aria-label="View Discovered LatinHAMs"
      >
        <Grid className="h-6 w-6 text-red-600" />
      </Button>
    </Link>
  )
}