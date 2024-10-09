import React from 'react'

export const WillTajerButton: React.FC = () => {
  return (
    <a
      href="https://willtajer.com/projects/latinham/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 bg-gray-700 hover:bg-yellow-400 text-white hover:text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
      aria-label="Visit Will Tajer's website"
    >
      Created by Will Tajer
    </a>
  )
}