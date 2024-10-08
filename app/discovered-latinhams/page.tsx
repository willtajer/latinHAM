// app/discovered-latinhams/page.tsx
import React from 'react'
import { DiscoveredLatinHAMs } from '../../components/DiscoveredLatinHAMs'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function DiscoveredLatinHAMsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Discovered latinHAMs</h1>
          <Link href="/" passHref>
            <Button
              variant="ghost"
              size="icon"
              className="bg-red-200 hover:bg-red-300 rounded-full p-2 shadow-md transition-colors duration-200"
              aria-label="Return to Home"
            >
              <Home className="h-6 w-6 text-red-600" />
            </Button>
          </Link>
        </div>
        <DiscoveredLatinHAMs />
      </div>
    </div>
  )
}