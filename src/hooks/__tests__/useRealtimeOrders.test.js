/**
 * Tests d'intégration pour les hooks realtime
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeClientOrders } from '../useRealtimeOrders';
import { supabase } from '../../services/supabase';

// Mock Supabase
vi.mock('../../services/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({})),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock useNotifications
vi.mock('../../contexts/NotificationContext', () => ({
  useNotifications: () => ({
    notifyOrderStatusChange: vi.fn(),
  }),
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('useRealtimeClientOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('devrait s\'abonner aux changements de commandes', () => {
    const userId = 'test-user-id';
    const { result } = renderHook(() => useRealtimeClientOrders(userId));
    
    expect(supabase.channel).toHaveBeenCalledWith(`orders:user:${userId}`);
  });

  it('ne devrait pas s\'abonner si userId est null', () => {
    renderHook(() => useRealtimeClientOrders(null));
    
    expect(supabase.channel).not.toHaveBeenCalled();
  });
});

