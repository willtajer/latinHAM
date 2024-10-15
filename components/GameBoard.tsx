import React from 'react'

// Define the props for the GameBoard component
interface GameBoardProps {
  grid: number[][]               // 2D array representing the game grid values
  locked: boolean[][]           // 2D array indicating which cells are locked
  edited: boolean[][]           // 2D array indicating which cells have been edited
  hints: boolean[][]            // 2D array indicating which cells have hints
  showNumbers: boolean          // Flag to determine if numbers should be displayed in cells
  onCellClick: (row: number, col: number) => void  // Callback when a cell is clicked
  isTrashMode: boolean          // Flag to determine if trash mode is active
}

// Array of CSS classes corresponding to different colors
const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

// Define the props for the Cell component
interface CellProps {
  value: number                 // The value of the cell (0 for empty)
  locked: boolean               // Indicates if the cell is locked (non-editable)
  edited: boolean               // Indicates if the cell has been edited by the user
  isHinted: boolean             // Indicates if the cell has a hint
  showNumber: boolean           // Flag to show or hide the cell's number
  onClick: () => void           // Callback when the cell is clicked
  isTrashMode: boolean          // Flag to determine if trash mode is active
}

// Cell component representing a single cell in the game grid
const Cell: React.FC<CellProps> = ({ value, locked, edited, isHinted, showNumber, onClick, isTrashMode }) => {
  // Base CSS classes for the cell
  const baseClasses = "w-12 h-12 flex items-center justify-center text-lg font-bold relative transition-all duration-150 ease-in-out rounded-md shadow-sm"
  
  // Determine the background color class based on the cell's value
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-white dark:bg-gray-600'
  
  // Determine the border style based on whether the cell is locked
  const borderClass = locked ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'
  
  // Determine the cursor style based on whether the cell is locked
  const cursorClass = locked ? 'cursor-not-allowed' : 'cursor-pointer'
  
  // Apply a ring effect if the cell has a hint
  const hintClass = isHinted ? 'ring-4 ring-yellow-400' : ''
  
  // Apply a red ring if trash mode is active and the cell is editable and not empty
  const trashModeClass = isTrashMode && edited && value !== 0 ? 'ring-2 ring-red-500' : ''
  
  // Add interactive styles if the cell is not locked
  const interactiveClasses = !locked ? 'hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-opacity-50' : ''

  return (
    <div
      // Combine all relevant CSS classes for the cell
      className={`${baseClasses} ${colorClass} ${borderClass} ${cursorClass} ${hintClass} ${trashModeClass} ${interactiveClasses}`}
      
      // Handle click events on the cell
      onClick={onClick}
      
      // Accessibility attributes
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={`Cell value ${value || 'Empty'}${locked ? ', locked' : ''}${isHinted ? ', hinted' : ''}${isTrashMode && edited && value !== 0 ? ', clearable' : ''}`}
    >
      {/* Conditionally render the cell's value if showNumber is true and the cell is not empty */}
      {showNumber && value !== 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
          {value}
        </span>
      )}
    </div>
  )
}

// GameBoard component representing the entire game grid
export function GameBoard({ grid, locked, edited, hints, showNumbers, onCellClick, isTrashMode }: GameBoardProps) {
  return (
    // Container div for the grid with responsive styling
    <div className="grid grid-cols-6 gap-3 bg-gray-200 dark:bg-gray-700 p-3 rounded-lg shadow-inner">
      {/* Iterate over each row in the grid */}
      {grid.map((row, rowIndex) =>
        // Iterate over each cell in the current row
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}  // Unique key for each cell based on its position
            value={cell}                     // Pass the cell's value
            locked={locked[rowIndex][colIndex]}    // Pass the locked status for the cell
            edited={edited[rowIndex][colIndex]}    // Pass the edited status for the cell
            isHinted={hints[rowIndex][colIndex]}    // Pass the hint status for the cell
            showNumber={showNumbers}                 // Pass the showNumber flag
            onClick={() => onCellClick(rowIndex, colIndex)} // Handle cell click with row and column indices
            isTrashMode={isTrashMode}                // Pass the trash mode flag
          />
        ))
      )}
    </div>
  )
}
