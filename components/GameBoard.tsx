import React from 'react'

interface GameBoardProps {
  grid: number[][]
  locked: boolean[][]
  edited: boolean[][]
  hints: boolean[][]
  showNumbers: boolean
  onCellClick: (row: number, col: number) => void
  isTrashMode: boolean
}

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

interface CellProps {
  value: number
  locked: boolean
  edited: boolean
  isHinted: boolean
  showNumber: boolean
  onClick: () => void
  isTrashMode: boolean
}

const Cell: React.FC<CellProps> = ({ value, locked, edited, isHinted, showNumber, onClick, isTrashMode }) => {
  const baseClasses = "w-12 h-12 flex items-center justify-center text-lg font-bold relative transition-all duration-150 ease-in-out rounded-md shadow-sm"
  const colorClass = value !== 0 ? colorClasses[value - 1] : 'bg-white'
  const borderClass = locked ? 'border-2 border-gray-600' : 'border border-gray-300'
  const cursorClass = locked ? 'cursor-not-allowed' : 'cursor-pointer'
  const hintClass = isHinted ? 'ring-4 ring-yellow-400' : ''
  const trashModeClass = isTrashMode && edited && value !== 0 ? 'ring-2 ring-red-500' : ''
  const interactiveClasses = !locked ? 'hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' : ''

  return (
    <div
      className={`${baseClasses} ${colorClass} ${borderClass} ${cursorClass} ${hintClass} ${trashModeClass} ${interactiveClasses}`}
      onClick={onClick}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={`Cell value ${value || 'Empty'}${locked ? ', locked' : ''}${isHinted ? ', hinted' : ''}${isTrashMode && edited && value !== 0 ? ', clearable' : ''}`}
    >
      {showNumber && value !== 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
          {value}
        </span>
      )}
    </div>
  )
}

export function GameBoard({ grid, locked, edited, hints, showNumbers, onCellClick, isTrashMode }: GameBoardProps) {
  return (
    <div className="grid grid-cols-6 gap-3 bg-gray-200 p-3 rounded-lg shadow-inner">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            locked={locked[rowIndex][colIndex]}
            edited={edited[rowIndex][colIndex]}
            isHinted={hints[rowIndex][colIndex]}
            showNumber={showNumbers}
            onClick={() => onCellClick(rowIndex, colIndex)}
            isTrashMode={isTrashMode}
          />
        ))
      )}
    </div>
  )
}