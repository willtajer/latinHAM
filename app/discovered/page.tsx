// app/discovered/page.tsx
import React from 'react'
import { DiscoveredLatinHAMs } from '../../components/DiscoveredLatinHAMs'
import { HomeButton } from '../../components/HomeButton'

export default function DiscoveredPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">latinHAMs</h1>
          <HomeButton />
        </div>
        <DiscoveredLatinHAMs />
      </div>
    </div>
  )
}