import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtime } from '../hooks/useRealtime';

// Mock Supabase
vi.mock('../lib/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockReturnThis(),
  };

  return {
    supabase: {
      channel: vi.fn().mockReturnValue(mockChannel),
      removeChannel: vi.fn(),
    },
  };
});

describe('useRealtime', () => {
  let mockChannel: any;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Get the mocked instances
    const { supabase } = require('../lib/supabase');
    mockSupabase = supabase;
    mockChannel = supabase.channel();
  });

  it('should set up real-time subscription when enabled', () => {
    const onInsert = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    renderHook(() =>
      useRealtime({
        table: 'test_table',
        onInsert,
        onUpdate,
        onDelete,
        enabled: true,
      })
    );

    expect(mockSupabase.channel).toHaveBeenCalledWith('test_table');
    expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', expect.any(Object), onInsert);
    expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', expect.any(Object), onUpdate);
    expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', expect.any(Object), onDelete);
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should not set up subscription when disabled', () => {
    renderHook(() =>
      useRealtime({
        table: 'test_table',
        onInsert: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        enabled: false,
      })
    );

    expect(mockSupabase.channel).not.toHaveBeenCalled();
  });

  it('should clean up subscription on unmount', () => {
    const { unmount } = renderHook(() =>
      useRealtime({
        table: 'test_table',
        onInsert: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        enabled: true,
      })
    );

    unmount();

    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });
});
