import React from 'react'

// Functional component for the Will Tajer Button
export const WillTajerButton: React.FC = () => {
  return (
    // Anchor tag styled as a button linking to Will Tajer's project
    <a
      href="https://willtajer.com/projects/latinham/" // URL to Will Tajer's latinHAM project
      target="_blank" // Opens the link in a new tab
      rel="noopener noreferrer" // Security measures for external links
      className="bg-transparent text-gray-400 hover:text-yellow-400 font-regular py-2 px-4" // Tailwind CSS classes for styling
      aria-label="Visit Will Tajer's website" // Accessibility label for screen readers
    >
      Created by Will Tajer {/* Button text */}
    </a>
  )
}
