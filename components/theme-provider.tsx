"use client" // Indicates that this component should be rendered on the client side

import * as React from "react" // Importing all exports from React
import { ThemeProvider as NextThemesProvider } from "next-themes" // Importing ThemeProvider from next-themes and renaming it to NextThemesProvider
import { type ThemeProviderProps } from "next-themes/dist/types" // Importing the ThemeProviderProps type for TypeScript

// ThemeProvider component definition
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Renders the NextThemesProvider with all received props and wraps the children components
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
