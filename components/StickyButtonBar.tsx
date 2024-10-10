'use client'

import React from 'react'
import DiscoveredLatinHAMsButton from './DiscoveredLatinHAMsButton'
import HomeButton from './HomeButton'
import LeaderboardButton from './LeaderboardButton'
import LearningModeButton from './LearningModeButton'

export default function StickyButtonBar() {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md text-white py-2 px-4 rounded-full shadow-lg">
        <div className="flex space-x-2">
          <HomeButton />
          <DiscoveredLatinHAMsButton />
          <LeaderboardButton />
          <LearningModeButton />
        </div>
      </div>
    </div>
  )
}