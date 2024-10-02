import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '36latinHAM',
  description: 'A challenging puzzle game based on Latin squares inspired by HAMMING codes.',
  keywords: ['puzzle game', 'Latin square', 'HAM problem', 'logic game'],
  openGraph: {
    title: '36latinHAM',
    description: 'Challenge yourself with this unique puzzle game!',
    type: 'website',
    url: 'https://latinham.willtajer.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'latinHAM',
    description: 'A challenging puzzle game based on Latin squares and the HAM problem',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}