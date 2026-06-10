import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { getReservations } from '../lib/reservations.js';

export function useReservations({ branchId, date, status = 'all', search = '' }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!branchId) {
      setReservations([]);
      return Promise.resolve([]);
    }

    setIsLoading(true);
    setError(null);

    return getReservations({ branchId, date, status, search })
      .then((data) => {
        setReservations(data);
        return data;
      })
      .catch((requestError) => {
        setError(requestError.message);
        throw requestError;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [branchId, date, search, status]);

  useEffect(() => {
    let isMounted = true;

    refetch().catch(() => null);

    if (!branchId) {
      return () => {
        isMounted = false;
      };
    }

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const channel = supabase
      .channel(`reservations:${branchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `branch_id=eq.${branchId}`,
        },
        () => {
          if (isMounted) {
            refetch().catch(() => null);
          }
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [branchId, refetch]);

  return { reservations, isLoading, error, refetch };
}
