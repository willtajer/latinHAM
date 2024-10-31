// app/layout.tsx

import Script from 'next/script'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeBackground from "@/components/ThemeBackground"
import { LoginHandler } from '@/components/LoginHandler'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import './globals.css'

// Import the Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] })

// Metadata configuration for the application, used for SEO and social sharing
export const metadata: Metadata = {
  title: 'latinHAM',
  description: 'A challenging puzzle game based on Latin squares inspired by HAMMING codes.',
  keywords: ['puzzle game', 'Latin square', 'HAM problem', 'logic game'],
  openGraph: {
    title: 'latinHAM',
    description: 'Challenge yourself with this unique puzzle game!',
    type: 'website',
    url: 'https://latinham.willtajer.com',
    images: [
      {
        url: 'http://willtajer.com/wp-content/uploads/2024/10/latinHAM.png',
        width: 1200,
        height: 630,
        alt: '36latinHAM Game Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '36latinHAM',
    description: 'A challenging puzzle game based on Latin squares and the HAM problem',
    images: ['http://willtajer.com/wp-content/uploads/2024/10/latinHAMtwitter-e1727909000790.png'],
  },
}

// RootLayout component serves as the root layout for all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // ClerkProvider manages authentication state for the application
    <ClerkProvider>
      {/* Define the HTML structure and language */}
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-096WLXE239"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-096WLXE239');
              `,
            }}
          />
        </head>
        <body className={`bg-background text-foreground ${inter.className}`}>
          {/* ThemeProvider manages theming (light/dark) across the application */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header containing authentication buttons */}
            <header className="fixed left-0 right-0 z-50 w-full">
              <div className="flex justify-between items-center p-4">
                <div>
                  {/* Display Sign In button when user is signed out */}
                  <SignedOut>
                    <SignInButton>
                      {/* Styled Sign In button */}
                      <button className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  {/* Display UserButton when user is signed in */}
                  <SignedIn>
                    <UserButton 
                      afterSignOutUrl="/" // Redirect to home after sign out
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10" // Customize avatar size
                        }
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </header>
            {/* Main content area */}
            <main>
              <LoginHandler /> {/* Handles login-related logic */}
              <ThemeBackground /> {/* Renders themed background */}
              {children} {/* Render the child components/pages */}
            </main>
            {/* Vercel Analytics for tracking */}
            <Analytics />
            {/* Vercel Speed Insights for performance monitoring */}
            <SpeedInsights />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}