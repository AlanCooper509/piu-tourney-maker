import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

import type { UserProfile } from '../types/UserProfile';

export function useEventOrganizers(eventId: number, enabled: boolean, refreshKey?: string) {
  const [organizers, setOrganizers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setOrganizers([]);
      return;
    }

    async function fetchOrganizers() {
      setLoading(true);
      const { data, error } = await supabaseClient.rpc('get_event_organizers', { p_event_id: eventId });

      if (error) {
        console.error('Error fetching event organizers:', error);
        setOrganizers([]);
      } else {
        setOrganizers((data as UserProfile[]) ?? []);
      }
      setLoading(false);
    }

    fetchOrganizers();
  }, [eventId, enabled, refreshKey]);

  // lets callers show a newly added organizer without refetching the whole list
  const addOrganizer = useCallback((organizer: UserProfile) => {
    setOrganizers((prev) => [...prev, organizer]);
  }, []);

  return { organizers, loading, addOrganizer };
}
