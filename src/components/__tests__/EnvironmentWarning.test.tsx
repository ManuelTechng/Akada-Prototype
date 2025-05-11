import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnvironmentWarning } from '../../App';
import { checkEnvironmentVariables } from '../../utils/envCheck';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';

// Mock the environment check utility
vi.mock('../../utils/envCheck', () => ({
  checkEnvironmentVariables: vi.fn()
}));

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    initialized: true
  })
}));

// Mock the notification context
vi.mock('../../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
  useNotifications: () => ({
    unreadCount: 0
  })
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      <NotificationProvider>
        {component}
      </NotificationProvider>
    </AuthProvider>
  );
};

describe('EnvironmentWarning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when all environment variables are valid', () => {
    vi.mocked(checkEnvironmentVariables).mockReturnValue({
      allValid: true,
      supabase: { valid: true, issues: [], url: 'https://test...', keyPresent: true },
      openai: { valid: true, issues: [], keyPresent: true }
    });

    const { container } = renderWithProviders(<EnvironmentWarning />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render warning when environment variables are invalid', () => {
    vi.mocked(checkEnvironmentVariables).mockReturnValue({
      allValid: false,
      supabase: {
        valid: false,
        issues: ['VITE_SUPABASE_URL is missing'],
        url: 'missing',
        keyPresent: false
      },
      openai: {
        valid: false,
        issues: ['VITE_OPENAI_API_KEY is missing'],
        keyPresent: false
      }
    });

    renderWithProviders(<EnvironmentWarning />);
    
    expect(screen.getByText('Environment Configuration Warning')).toBeInTheDocument();
    expect(screen.getByText('VITE_SUPABASE_URL is missing')).toBeInTheDocument();
    expect(screen.getByText('VITE_OPENAI_API_KEY is missing')).toBeInTheDocument();
  });
}); 