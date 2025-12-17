import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { mockProfile } from '../../test/mocks';
import type { UserProfile } from '../../lib/types';

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, signOut, profile, updateProfile } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <div data-testid="profile">{profile ? JSON.stringify(profile) : 'no-profile'}</div>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => updateProfile({ full_name: 'Updated Name' })}>Update Profile</button>
    </div>
  );
}

describe('AuthContext', () => {
  const mockUser: User = { 
    id: '123', 
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };

  const mockSession: Session = {
    user: mockUser,
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null
    });
  });

  it('should provide initial auth state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state should show loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');

    // Wait for auth initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 5000 });
  });

  it('should handle sign out', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText('Sign Out'));
    });

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should handle auth state changes', async () => {
    let authStateCallback: ((event: string, session: Session | null) => void) | undefined;

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 5000 });

    // Simulate auth state change
    expect(authStateCallback).toBeDefined();
    
    await act(async () => {
      authStateCallback?.('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    }, { timeout: 5000 });

    // Profile should be fetched after sign in
    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent(JSON.stringify(mockProfile));
    }, { timeout: 5000 });
  });

  it('should handle profile updates', async () => {
    // Setup initial authenticated state
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });

    const updatedProfile: typeof mockProfile = {
      ...mockProfile,
      full_name: 'Updated Name',
      updated_at: new Date().toISOString()
    };

    // Mock the profile update response
    (supabase.from as jest.Mock).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: updatedProfile,
            error: null
          })
        })
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial profile load
    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent(JSON.stringify(mockProfile));
    }, { timeout: 5000 });

    // Trigger profile update
    await act(async () => {
      fireEvent.click(screen.getByText('Update Profile'));
    });

    // Wait for profile update
    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent(JSON.stringify(updatedProfile));
    }, { timeout: 5000 });
  });

  it('should handle auth errors', async () => {
    const error = new Error('Invalid credentials');
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }, { timeout: 5000 });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  });

  it('should handle profile update errors', async () => {
    // Setup initial authenticated state
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });

    // Mock profile update to fail
    (supabase.from as jest.Mock).mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to update profile')
          })
        })
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial profile load
    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent(JSON.stringify(mockProfile));
    }, { timeout: 5000 });

    // Trigger profile update
    await act(async () => {
      fireEvent.click(screen.getByText('Update Profile'));
    });

    // Profile should remain unchanged after failed update
    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent(JSON.stringify(mockProfile));
    }, { timeout: 5000 });
  });
}); 