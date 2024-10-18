'use client'

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SignInButton } from '@clerk/nextjs'
import { X } from 'lucide-react'

interface SignInOverlayProps {
  onDismiss: () => void;
}

export function SignInOverlay({ onDismiss }: SignInOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Join the Leaderboard</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">Sign in to submit your scores and compete on the leaderboard!</p>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </CardContent>
      </Card>
    </div>
  )
}