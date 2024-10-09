// app/discovered/page.tsx
import React from 'react'
import { DiscoveredLatinHAMs } from '../../components/DiscoveredLatinHAMs' 
import { GamePreview } from '@/components/GamePreview'
import HomeButton from '@/components/HomeButton'
import LearningModeButton from '@/components/LearningModeButton'
import Link from 'next/link'

export default function DiscoveredPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-transparent text-foreground">
      <div className="w-[calc(6*3rem+6*0.75rem)]">
        <HomeButton />
        <Link href="/" passHref>
          <h1 className="text-6xl font-bold mb-6 text-center cursor-pointer hover:text-primary transition-colors duration-200">
            latinHAM
          </h1>
        </Link>
        <GamePreview />
        <p className="text-center mt-4 mb-8">
          Discover player dentified gameboard layouts.
        </p>
      </div>
      <DiscoveredLatinHAMs />
      <LearningModeButton />
    </div>
  )
}
