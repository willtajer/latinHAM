import React, { useEffect, useRef } from 'react'

const BOARD_SIZE = 6

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
]

const colorMap: { [key: string]: string } = {
  'bg-red-500': '#ef4444',
  'bg-blue-500': '#3b82f6',
  'bg-yellow-500': '#eab308',
  'bg-green-500': '#22c55e',
  'bg-purple-500': '#a855f7',
  'bg-orange-500': '#f97316',
  'bg-white': '#ffffff',
}

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

export const CompletedPuzzleCard: React.FC<CompletedPuzzleCardProps> = ({ entry, difficulty, gameNumber, onImageReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

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

    const contentWidth = boardSize + 2 * padding
    const contentHeight = boardSize + 2 * padding + spaceBetweenBoardAndInfo + infoRowHeight + spaceBetweenInfoAndQuote + quoteHeight + dateTimeHeight + progressBarHeight + bottomPadding + 2 * spaceBetweenElements

    canvas.width = (contentWidth + 2 * cardPadding) * scale
    canvas.height = (contentHeight + 2 * cardPadding) * scale
    canvas.style.width = `${(contentWidth + 2 * cardPadding) / scale}px`
    canvas.style.height = `${(contentHeight + 2 * cardPadding) / scale}px`

    ctx.scale(scale, scale)
    ctx.clearRect(0, 0, canvas.width, canvas.height)  

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

    const adjustX = (x: number) => x + cardPadding
    const adjustY = (y: number) => y + cardPadding

    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + width, y, x + width, y + height, radius)
      ctx.arcTo(x + width, y + height, x, y + height, radius)
      ctx.arcTo(x, y + height, x, y, radius)
      ctx.arcTo(x, y, x + width, y, radius)
      ctx.closePath()
    }

    entry.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = adjustX(padding + colIndex * (cellSize + cellSpacing))
        const y = adjustY(padding + rowIndex * (cellSize + cellSpacing))

        const colorClass = colorClasses[cell - 1] || 'bg-white'
        ctx.fillStyle = colorMap[colorClass] || 'white'
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()

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

        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 4 * scale
        ctx.shadowOffsetX = 2 * scale
        ctx.shadowOffsetY = 2 * scale
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.fill()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.lineWidth = 1 * scale
        drawRoundedRect(x, y, cellSize, cellSize, cellCornerRadius)
        ctx.stroke()
      })
    })

    let currentY = adjustY(boardSize + padding)

    currentY += spaceBetweenBoardAndInfo
    ctx.fillStyle = '#000000'
    ctx.font = `bold ${12 * scale}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(`Moves: ${entry.moves}     Time: ${formatTime(entry.time)}     Hints: ${entry.hints}`, canvas.width / (2 * scale), currentY + 18 * scale)
    currentY += infoRowHeight + spaceBetweenInfoAndQuote

    if (entry.quote) {
      ctx.fillStyle = '#000000'
      ctx.font = `bold ${14 * scale}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(`"${entry.quote}"`, canvas.width / (2 * scale), currentY + 18 * scale)
      currentY += quoteHeight + spaceBetweenElements
    }

    const completionDate = new Date(entry.timestamp)
    const formattedDateTime = `${completionDate.getFullYear().toString().slice(-2)}${(completionDate.getMonth() + 1).toString().padStart(2, '0')}${completionDate.getDate().toString().padStart(2, '0')}${completionDate.getHours().toString().padStart(2, '0')}${completionDate.getMinutes().toString().padStart(2, '0')}${completionDate.getSeconds().toString().padStart(2, '0')}`
    
    const difficultyIndicator = difficulty.charAt(0).toUpperCase()
    const fileName = `latinHAM_${difficulty}_game${gameNumber}.png`
    
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    
    ctx.font = `bold ${11 * scale}px Arial`
    const latinHAMText = 'latinHAM'
    const latinHAMWidth = ctx.measureText(latinHAMText).width
    
    ctx.font = `${11 * scale}px Arial`
    const timestampText = `#${formattedDateTime}${difficultyIndicator}`
    const timestampWidth = ctx.measureText(timestampText).width
    
    const totalWidth = latinHAMWidth + timestampWidth + 10 * scale
    const startX = (canvas.width / scale - totalWidth) / 2
    
    ctx.font = `bold ${11 * scale}px Arial`
    ctx.fillText(latinHAMText, startX + latinHAMWidth / 2, currentY + 18 * scale)
    
    ctx.font = `${11 * scale}px Arial`
    ctx.fillText(timestampText, startX + latinHAMWidth + 10 * scale + timestampWidth / 2, currentY + 18 * scale)
    
    currentY += dateTimeHeight + spaceBetweenElements

    const progressCellWidth = (contentWidth - 2 * padding) / (BOARD_SIZE * BOARD_SIZE)
    const progressCellHeight = progressBarHeight

    entry.grid.flat().forEach((cell, index) => {
      const x = adjustX(padding + index * progressCellWidth)
      const y = currentY
      const colorClass = colorClasses[cell - 1] || 'bg-white'
      ctx.fillStyle = colorMap[colorClass] || 'white'
      ctx.fillRect(x, y, progressCellWidth, progressCellHeight)
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1 * scale
      ctx.strokeRect(x, y, progressCellWidth, progressCellHeight)
    })

    canvas.toBlob(async (blob) => {
      if (blob && onImageReady) {
        const metadata = {
          difficulty: difficulty,
          moves: entry.moves,
          time: entry.time,
          hints: entry.hints,
          quote: entry.quote,
          timestamp: entry.timestamp,
          url: 'https://www.latinham.com',
        }

        const metadataString = JSON.stringify(metadata)
        const encoder = new TextEncoder()
        const metadataArray = encoder.encode(metadataString)

        const originalArray = new Uint8Array(await blob.arrayBuffer())
        const newArrayBuffer = new ArrayBuffer(originalArray.byteLength + metadataArray.length + 4)
        const newUint8Array = new Uint8Array(newArrayBuffer)

        newUint8Array.set(originalArray)

        const dataView = new DataView(newArrayBuffer)
        dataView.setUint32(originalArray.byteLength, metadataArray.length, false)
        newUint8Array.set(metadataArray, originalArray.byteLength + 4)

        const newBlob = new Blob([newArrayBuffer], { type: 'image/png' })

        const fileWithMetadata = new File([newBlob], fileName, {
          type: 'image/png',
          lastModified: new Date().getTime(),
        })

        onImageReady(fileWithMetadata)
      }
    }, 'image/png')
  }, [entry, difficulty, gameNumber, onImageReady])

  return (
    <div className="flex justify-center items-center w-full h-full">
      <canvas ref={canvasRef} aria-label="Completed Puzzle Card" role="img" />
    </div>
  )
}