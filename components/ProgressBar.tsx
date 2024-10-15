import React from 'react' // Importing React to utilize JSX and React functionalities

// Array of CSS classes corresponding to different cell colors
const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

// PreviewCell component to display an individual cell with appropriate color
const PreviewCell: React.FC<{ value: number }> = ({ value }) => {
  // Determine the color class based on the cell value
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-transparent'
  
  return (
    // Render a div with width and height of 6 units, the determined background color,
    // and transition effects for smooth color changes
    <div className={`w-6 h-6 ${colorClass} transition-colors duration-300`}></div>
  )
}

// Define the props for the ProgressBar component
interface ProgressBarProps {
  grid: number[][] // 2D array representing the grid layout
}

// ProgressBar component to display a grid of PreviewCell components
export const ProgressBar: React.FC<ProgressBarProps> = ({ grid }) => {
  return (
    // Container div with a grid layout of 6 columns, background colors for light and dark modes,
    // padding, rounded corners, inner shadow, and bottom margin
    <div className="grid grid-cols-6 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner mb-4">
      {/* Iterate over each row in the grid */}
      {grid.map((row, rowIndex) => (
        // For each row, create a flex container
        <div key={rowIndex} className="flex">
          {/* Iterate over each cell in the current row */}
          {row.map((cell, colIndex) => (
            // Render a PreviewCell for each cell, assigning a unique key based on row and column indices
            <PreviewCell key={`${rowIndex}-${colIndex}`} value={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}
