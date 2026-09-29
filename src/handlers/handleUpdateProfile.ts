import { supabaseClient } from '../lib/supabaseClient';

import type { MyProfile } from '../hooks/useMyProfile';

export const MAX_DISPLAY_NAME_LENGTH = 32;

// returns the saved profile; throws with a user-facing message on failure
export default async function handleUpdateProfile(
  userId: string,
  displayName: string,
  avatarUrl: string
): Promise<MyProfile> {
  const name = displayName.trim();
  const url = avatarUrl.trim();

  if (!name) throw new Error('Enter a display name.');
  if (name.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new Error(`Display names can be at most ${MAX_DISPLAY_NAME_LENGTH} characters.`);
  }
  if (url && !isHttpsUrl(url)) {
    throw new Error('Profile picture must be an https:// link to an image.');
  }

  const { data, error } = await supabaseClient
    .from('user_profiles')
    .update({ display_name: name, avatar_url: url || null })
    .eq('id', userId)
    .select('display_name, avatar_url')
    .maybeSingle();

  // 23505 = unique_violation on the case-insensitive display name index
  if (error?.code === '23505') throw new Error(`"${name}" is already taken.`);
  if (error) throw error;
  // RLS blocks silently (zero rows, no error), so treat a missing row as a failure
  if (!data) throw new Error('Could not update your profile.');

  return { displayName: data.display_name, avatarUrl: data.avatar_url };
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
