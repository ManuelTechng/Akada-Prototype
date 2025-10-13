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
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme && savedTheme !== "[object Object]" && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setThemeState(prefersDark ? 'dark' : 'light')
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 