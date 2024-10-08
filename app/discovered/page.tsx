// app/discovered/page.tsx
import React from 'react'
import { DiscoveredLatinHAMs } from '../../components/DiscoveredLatinHAMs' 
import { GamePreview } from '@/components/GamePreview'

export default function DiscoveredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-foreground">
      <div className="w-[calc(6*3rem+6*0.75rem)]">
        <h1 className="text-6xl font-bold mb-6 text-center">latinHAM</h1>
        <GamePreview />
        <p className="text-center mt-4 mb-8">
          Discover player dentified gameboard layouts.
        </p>
      </div>
      <DiscoveredLatinHAMs />
    </div>
  )
}
