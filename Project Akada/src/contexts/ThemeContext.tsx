import React, { createContext, useContext } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

interface ThemeContextType {
  theme: 'light' | 'dark'
  mode: 'light' | 'dark' | 'system'
  isDark: boolean
  systemPrefersDark: boolean
  isLoaded: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setMode: (mode: 'light' | 'dark' | 'system') => void
  enable: () => void
  disable: () => void
  resetToSystem: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    // Return a default theme context instead of throwing
    console.warn('useTheme called outside ThemeProvider, using default theme')
    return {
      theme: 'light' as const,
      mode: 'light' as const,
      isDark: false,
      systemPrefersDark: false,
      isLoaded: true,
      toggleTheme: () => console.warn('Theme toggle called outside ThemeProvider'),
      setTheme: () => console.warn('Theme set called outside ThemeProvider'),
      setMode: () => console.warn('Theme setMode called outside ThemeProvider'),
      enable: () => console.warn('Theme enable called outside ThemeProvider'),
      disable: () => console.warn('Theme disable called outside ThemeProvider'),
      resetToSystem: () => console.warn('Theme resetToSystem called outside ThemeProvider')
    }
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const darkMode = useDarkMode()

  const value: ThemeContextType = {
    theme: darkMode.resolvedTheme,
    mode: darkMode.mode,
    isDark: darkMode.isDark,
    systemPrefersDark: darkMode.systemPrefersDark,
    isLoaded: darkMode.isLoaded,
    toggleTheme: darkMode.toggle,
    setTheme: (theme: 'light' | 'dark') => darkMode.setMode(theme),
    setMode: darkMode.setMode,
    enable: darkMode.enable,
    disable: darkMode.disable,
    resetToSystem: darkMode.resetToSystem
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}