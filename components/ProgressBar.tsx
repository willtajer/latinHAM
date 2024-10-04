import React from 'react'

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

const PreviewCell: React.FC<{ value: number }> = ({ value }) => {
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-transparent'
  return (
    <div className={`w-6 h-6 ${colorClass} transition-colors duration-300`}></div>
  )
}

interface ProgressBarProps {
  grid: number[][]
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ grid }) => {
  return (
    <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner mb-4">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <PreviewCell key={`${rowIndex}-${colIndex}`} value={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}