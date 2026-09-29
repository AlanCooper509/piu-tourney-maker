import { supabaseClient } from '../lib/supabaseClient';

import type { UserProfile } from '../types/UserProfile';

// all guard clauses (caller is an event admin, name exists, not already an admin) are enforced
// by the add_event_admin database function; its error messages are meant to be shown to the user
export default async function handleAddEventAdmin(eventId: number, displayName: string): Promise<UserProfile> {
  const { data, error } = await supabaseClient.rpc('add_event_admin', {
    p_event_id: eventId,
    p_display_name: displayName.trim(),
  });

  if (error) throw error;

  const rows = data as UserProfile[] | null;
  if (!rows || rows.length === 0) throw new Error('Could not add event admin.');

  return rows[0];
}
