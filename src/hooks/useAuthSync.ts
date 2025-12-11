/**
 * useAuthSync Hook
 * 
 * Ensures the current Clerk user is synced to the Prisma database.
 * Should be used in dashboard layouts to trigger JIT sync on first load.
 * 
 * @module hooks/useAuthSync
 */

"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

interface SyncState {
  isSynced: boolean;
  isSyncing: boolean;
  error: string | null;
  isNewUser: boolean;
}

/**
 * Hook to sync Clerk user to Prisma database
 * 
 * @returns SyncState with syncing status
 * 
 * @example
 * function DashboardLayout({ children }) {
 *   const { isSynced, isSyncing, error } = useAuthSync();
 *   
 *   if (isSyncing) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return <>{children}</>;
 * }
 */
export function useAuthSync(): SyncState {
  const { user, isLoaded } = useUser();
  const [state, setState] = useState<SyncState>({
    isSynced: false,
    isSyncing: false,
    error: null,
    isNewUser: false,
  });
  
  // Use ref to prevent double-sync in strict mode
  const hasSynced = useRef(false);

  useEffect(() => {
    async function syncUser() {
      // Skip if no user or already synced
      if (!isLoaded || !user || hasSynced.current) {
        return;
      }

      // Mark as syncing attempt
      hasSynced.current = true;
      setState(prev => ({ ...prev, isSyncing: true }));

      try {
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setState({
            isSynced: true,
            isSyncing: false,
            error: null,
            isNewUser: data.data?.isNewUser || false,
          });
          
          if (data.data?.isNewUser) {
            console.log('[AUTH SYNC] New user created in database');
          }
        } else {
          setState({
            isSynced: false,
            isSyncing: false,
            error: data.message || 'Failed to sync user',
            isNewUser: false,
          });
        }
      } catch (error) {
        console.error('[AUTH SYNC] Error:', error);
        setState({
          isSynced: false,
          isSyncing: false,
          error: 'Network error during sync',
          isNewUser: false,
        });
      }
    }

    syncUser();
  }, [user, isLoaded]);

  return state;
}
