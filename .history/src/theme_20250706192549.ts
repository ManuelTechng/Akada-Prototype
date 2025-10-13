import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // Indigo 600
      light: '#818CF8',
      dark: '#3730A3'
    },
    secondary: {
      main: '#10B981', // Emerald 500
      light: '#34D399',
      dark: '#059669'
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626'
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706'
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB'
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669'
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: [
      'Open Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      fontFamily: 'Poppins, Arial, sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          textTransform: 'none',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }
      }
    }
  },
});