"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    
    if (storedTheme) {
      setTheme(storedTheme)
    } else {
      setTheme(defaultTheme)
    }
  }, [defaultTheme, storageKey])

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  useEffect(() => {
    // Resolve the theme based on system preferences when set to "system"
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      const newResolvedTheme = mediaQuery.matches ? "dark" : "light"
      setResolvedTheme(newResolvedTheme)
      
      if (theme === "system") {
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(newResolvedTheme)
      }
    }
    
    handleChange() // Initial call
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      root.classList.add(resolvedTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, resolvedTheme])

  const value = {
    theme,
    setTheme,
    resolvedTheme: theme === "system" ? resolvedTheme : theme as "light" | "dark",
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}

// Add a function to toggle between light and dark themes
export function useThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "light" ? "dark" : "light")
    } else {
      setTheme(theme === "light" ? "dark" : "light")
    }
  }
  
  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme,
    isLight: resolvedTheme === "light",
    isDark: resolvedTheme === "dark",
  }
} 