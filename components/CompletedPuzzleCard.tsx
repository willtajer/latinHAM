import React, { useEffect, useRef } from 'react'

// Define the size of the puzzle board
const BOARD_SIZE = 6

// Array of CSS classes for different colors
const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

// Mapping from color classes to their hex color codes
const colorMap: { [key: string]: string } = {
  'bg-red-500': '#ef4444',
  'bg-blue-500': '#3b82f6',
  'bg-yellow-500': '#eab308',
  'bg-green-500': '#22c55e',
  'bg-purple-500': '#a855f7',
  'bg-orange-500': '#f97316',
  'bg-white': '#ffffff',
}

// Define the props for the CompletedPuzzleCard component
interface CompletedPuzzleCardProps {
  entry: {
    timestamp: string
    id: string
    difficulty: 'easy' | 'medium' | 'hard'
    moves: number
    time: number
    hints: number
    grid: number[][]
    initialGrid: number[][]
    quote: string
  }
  difficulty: 'easy' | 'medium' | 'hard'
  gameNumber: number
  onImageReady: (file: File) => void
}

// CompletedPuzzleCard component definition
export const CompletedPuzzleCard: React.FC<CompletedPuzzleCardProps> = ({ entry, difficulty, gameNumber, onImageReady }) => {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Function to format time from seconds to "Xm Ys"
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // useEffect hook to draw on the canvas when component mounts or dependencies change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Determine scaling based on device pixel ratio
    const scale = window.devicePixelRatio || 1
    const cellSize = 40 * scale
    const cellSpacing = 6 * scale
    const boardSize = BOARD_SIZE * cellSize + (BOARD_SIZE - 1) * cellSpacing
    const padding = 15 * scale
    const dateTimeHeight = 20 * scale
    const infoRowHeight = 30 * scale
    const quoteHeight = entry.quote ? 30 * scale : 0
    const progressBarHeight = 15 * scale
    const bottomPadding = 5 * scale
    const cornerRadius = 15 * scale
    const cardPadding = 10 * scale
    const cellCornerRadius = 8 * scale
    const spaceBetweenBoardAndInfo = 10 * scale
    const spaceBetweenInfoAndQuote = entry.quote ? 15 * scale : 0
    const spaceBetweenElements = 8 * scale

    // Calculate the overall content dimensions
    const contentWidth = boardSize + 2 * padding
    const contentHeight = boardSize + 2 * padding + spaceBetweenBoardAndInfo + infoRowHeight + spaceBetweenInfoAndQuote + quoteHeight + dateTimeHeight + progressBarHeight + bottomPadding + 2 * spaceBetweenElements

    // Set canvas dimensions and apply scaling
    canvas.width = (contentWidth + 2 * cardPadding) * scale
    canvas.height = (contentHeight + 2 * cardPadding) * scale
    canvas.style.width = `${(contentWidth + 2 * cardPadding) / scale}px`
    canvas.style.height = `${(contentHeight + 2 * cardPadding) / scale}px`

    ctx.scale(scale, scale)
    ctx.clearRect(0, 0, canvas.width, canvas.height)  

    // Draw the card background with rounded corners
    ctx.fillStyle = '#f3f4f6'
    ctx.beginPath()
    ctx.moveTo(cardPadding + cornerRadius, cardPadding)
    ctx.lineTo(cardPadding + contentWidth - cornerRadius, cardPadding)
    ctx.arcTo(cardPadding + contentWidth, cardPadding, cardPadding + contentWidth, cardPadding + cornerRadius, cornerRadius)
    ctx.lineTo(cardPadding + contentWidth, cardPadding + contentHeight - cornerRadius)
    ctx.arcTo(cardPadding + contentWidth, cardPadding + contentHeight, cardPadding + contentWidth - cornerRadius, cardPadding + contentHeight, cornerRadius)
    ctx.lineTo(cardPadding + cornerRadius, cardPadding + contentHeight)
    ctx.arcTo(cardPadding, cardPadding + contentHeight, cardPadding, cardPadding + contentHeight - cornerRadius, cornerRadius)
    ctx.lineTo(cardPadding, cardPadding + cornerRadius)
    ctx.arcTo(cardPadding, cardPadding, cardPadding + cornerRadius, cardPadding, cornerRadius)
    ctx.closePath()
    ctx.fill()

    // Helper functions to adjust coordinates based on padding
    const adjustX = (x: number) => x + cardPadding
    const adjustY = (y: number) => y + cardPadding

    // Function to draw a rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + width, y, x + width, y + height, radius)
      ctx.arcTo(x + width, y + height, x, y + height, radius)
      ctx.arcTo(x, y + height, x, y, radius)
      ctx.arcTo(x, y, x + width, y, radius)
      ctx.closePath()
    }

    // Draw each cell of the puzzle grid
    entry.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = adjustX(padding + colIndex * (cellSize + cellSpacing))
        const y = adjustY(padding + rowIndex * (cellSize + cellSpacing))

        // Determine the cell color
        const colorClass = colorClasses[cell - 1] || 'bg-white'
        ctx.fillStyle = colorMap[colorClass] || 'white'
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()

        // If the cell is part of the initial grid, add borders
        if (entry.initialGrid && entry.initialGrid[rowIndex] && entry.initialGrid[rowIndex][colIndex] !== 0) {
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 3 * scale
          drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
          ctx.stroke()

          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 2 * scale
          drawRoundedRect(x + 2, y + 2, cellSize - 4, cellSize - 4, cellCornerRadius - 2)
          ctx.stroke()
        }

        // Add shadow effects to the cells
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 4 * scale
        ctx.shadowOffsetX = 2 * scale
        ctx.shadowOffsetY = 2 * scale
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()

        // Reset shadow settings
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Add a subtle border to each cell
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.lineWidth = 1 * scale
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.stroke()
      })
    })

    // Initialize Y position for drawing text and other elements below the board
    let currentY = adjustY(boardSize + padding)

    // Add space between the board and the info row
    currentY += spaceBetweenBoardAndInfo

    // Set text styles and draw the moves, time, and hints information
    ctx.fillStyle = '#000000'
    ctx.font = `bold ${12 * scale}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(`Moves: ${entry.moves}     Time: ${formatTime(entry.time)}     Hints: ${entry.hints}`, canvas.width / (2 * scale), currentY + 18 * scale)
    currentY += infoRowHeight + spaceBetweenInfoAndQuote

    // If there's a quote, draw it below the info row
    if (entry.quote) {
      ctx.fillStyle = '#000000'
      ctx.font = `bold ${14 * scale}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(`"${entry.quote}"`, canvas.width / (2 * scale), currentY + 18 * scale)
      currentY += quoteHeight + spaceBetweenElements
    }

    // Format the completion timestamp
    const completionDate = new Date(entry.timestamp)
    const formattedDateTime = `${completionDate.getFullYear().toString().slice(-2)}${(completionDate.getMonth() + 1).toString().padStart(2, '0')}${completionDate.getDate().toString().padStart(2, '0')}${completionDate.getHours().toString().padStart(2, '0')}${completionDate.getMinutes().toString().padStart(2, '0')}${completionDate.getSeconds().toString().padStart(2, '0')}`
    
    // Create a filename based on difficulty and game number
    const difficultyIndicator = difficulty.charAt(0).toUpperCase()
    const fileName = `latinHAM.com-latinHAM_${difficulty}_game${gameNumber}.png`
    
    // Set text alignment and styles for the footer
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    
    // Draw "latinHAM" text
    ctx.font = `bold ${11 * scale}px Arial`
    const latinHAMText = 'latinHAM'
    const latinHAMWidth = ctx.measureText(latinHAMText).width
    
    // Draw the timestamp with difficulty indicator
    ctx.font = `${11 * scale}px Arial`
    const timestampText = `#${formattedDateTime}${difficultyIndicator}`
    const timestampWidth = ctx.measureText(timestampText).width
    
    // Calculate positions to center the footer text
    const totalWidth = latinHAMWidth + timestampWidth + 10 * scale
    const startX = (canvas.width / scale - totalWidth) / 2
    
    // Draw "latinHAM" text
    ctx.font = `bold ${11 * scale}px Arial`
    ctx.fillText(latinHAMText, startX + latinHAMWidth / 2, currentY + 18 * scale)
    
    // Draw the timestamp text next to "latinHAM"
    ctx.font = `${11 * scale}px Arial`
    ctx.fillText(timestampText, startX + latinHAMWidth + 10 * scale + timestampWidth / 2, currentY + 18 * scale)
    
    // Update Y position for the next element
    currentY += dateTimeHeight + spaceBetweenElements

    // Calculate dimensions for the progress bar
    const progressCellWidth = (contentWidth - 2 * padding) / (BOARD_SIZE * BOARD_SIZE)
    const progressCellHeight = progressBarHeight

    // Draw the progress bar based on the puzzle grid
    entry.grid.flat().forEach((cell, index) => {
      const x = adjustX(padding + index * progressCellWidth)
      const y = currentY
      const colorClass = colorClasses[cell - 1] || 'bg-white'
      ctx.fillStyle = colorMap[colorClass] || 'white'
      ctx.fillRect(x, y, progressCellWidth, progressCellHeight)
      
      // Add a subtle border to each progress cell
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1 * scale
      ctx.strokeRect(x, y, progressCellWidth, progressCellHeight)
    })

    // Convert the canvas to a Blob and handle the image with metadata
    canvas.toBlob(async (blob) => {
      if (blob && onImageReady) {
        // Create metadata object
        const metadata = {
          difficulty: difficulty,
          moves: entry.moves,
          time: entry.time,
          hints: entry.hints,
          quote: entry.quote,
          timestamp: entry.timestamp,
          url: 'https://www.latinham.com',
        }

        // Convert metadata to a Uint8Array
        const metadataString = JSON.stringify(metadata)
        const encoder = new TextEncoder()
        const metadataArray = encoder.encode(metadataString)

        // Combine the original image data with metadata
        const originalArray = new Uint8Array(await blob.arrayBuffer())
        const newArrayBuffer = new ArrayBuffer(originalArray.byteLength + metadataArray.length + 4)
        const newUint8Array = new Uint8Array(newArrayBuffer)

        // Set the original image data
        newUint8Array.set(originalArray)

        // Append the length of the metadata and the metadata itself
        const dataView = new DataView(newArrayBuffer)
        dataView.setUint32(originalArray.byteLength, metadataArray.length, false)
        newUint8Array.set(metadataArray, originalArray.byteLength + 4)

        // Create a new Blob with the combined data
        const newBlob = new Blob([newArrayBuffer], { type: 'image/png' })

        // Create a File object from the Blob
        const fileWithMetadata = new File([newBlob], fileName, {
          type: 'image/png',
          lastModified: new Date().getTime(),
        })

        // Callback with the new file
        onImageReady(fileWithMetadata)
      }
    }, 'image/png')
  }, [entry, difficulty, gameNumber, onImageReady]) // Dependencies for the useEffect

  // Render the canvas inside a centered div
  return (
    <div className="flex justify-center items-center w-full h-full">
      <canvas ref={canvasRef} aria-label="Completed Puzzle Card" role="img" />
    </div>
  )
}
