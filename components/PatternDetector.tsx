import React from 'react'

type Board = number[][]

interface PatternDetectorProps {
  board: Board
  type: 'solid' | 'rainbow'
  highlightedCells?: number[]
}

interface PatternDetectorComponent extends React.FC<PatternDetectorProps> {
  detectPatterns: (board: Board, type: 'solid' | 'rainbow', rainbowSubsection?: 'row' | 'column' | 'diagonal') => number[][]
}

const PatternDetector: PatternDetectorComponent = ({ board, highlightedCells = [] }) => {
  return (
    <div className="grid grid-cols-6 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-inner aspect-square">
      {board.flat().map((cell, index) => (
        <div
          key={index}
          className={`
            aspect-square flex items-center justify-center
            relative transition-all duration-150 ease-in-out rounded-sm shadow-sm
            ${cell !== 0 ? `bg-${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][cell - 1]}-500` : 'bg-white dark:bg-gray-600'}
            ${cell !== 0 ? 'border-2 border-gray-600 dark:border-gray-300' : 'border border-gray-300 dark:border-gray-500'}
            ${highlightedCells.includes(index) ? 'ring-2 ring-yellow-500' : ''}
          `}
          role="cell"
          aria-label={`Cell ${cell !== 0 ? 'filled' : 'empty'}`}
        />
      ))}
    </div>
  )
}

PatternDetector.detectPatterns = (board: Board, type: 'solid' | 'rainbow', rainbowSubsection?: 'row' | 'column' | 'diagonal'): number[][] => {
  const size = board.length

  const detectSolidDiagonals = (board: Board): number[][] => {
    const diagonals = [
      Array(size).fill(0).map((_, i) => board[i][i]),
      Array(size).fill(0).map((_, i) => board[i][size - 1 - i])
    ]

    return diagonals.map((diagonal, i) => {
      const isSolid = diagonal.every(cell => cell !== 0 && cell === diagonal[0])
      if (isSolid) {
        return Array(size).fill(0).map((_, j) => {
          return i === 0 ? j * size + j : j * size + (size - 1 - j)
        })
      }
      return []
    }).filter(pattern => pattern.length > 0)
  }

  const detectRainbowLines = (board: Board, subsection?: 'row' | 'column' | 'diagonal'): number[][] => {
    let lines: number[][] = []

    if (subsection === 'row' || !subsection) {
      lines.push(...board)
    }

    if (subsection === 'column' || !subsection) {
      lines.push(...Array(size).fill(0).map((_, i) => board.map(row => row[i])))
    }

    if (subsection === 'diagonal' || !subsection) {
      lines.push(
        Array(size).fill(0).map((_, i) => board[i][i]),
        Array(size).fill(0).map((_, i) => board[i][size - 1 - i])
      )
    }

    const isRainbowOrder = (line: number[]) => {
      const nonZeroLine = line.filter(cell => cell !== 0)
      return (
        nonZeroLine.length === size &&
        (nonZeroLine.every((cell, index) => cell === index + 1) ||
         nonZeroLine.every((cell, index) => cell === size - index))
      )
    }

    return lines.map((line, i) => {
      if (isRainbowOrder(line)) {
        if (subsection === 'row' || (!subsection && i < size)) {
          // Row
          return Array(size).fill(0).map((_, j) => i * size + j)
        } else if (subsection === 'column' || (!subsection && i < size * 2)) {
          // Column
          return Array(size).fill(0).map((_, j) => (i - size) + j * size)
        } else {
          // Diagonal
          return Array(size).fill(0).map((_, j) => i === lines.length - 2 ? j * size + j : j * size + (size - 1 - j))
        }
      }
      return []
    }).filter(pattern => pattern.length > 0)
  }

  return type === 'solid' ? detectSolidDiagonals(board) : detectRainbowLines(board, rainbowSubsection)
}

export default PatternDetector