import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { supabaseClient } from '../lib/supabaseClient';

export interface MyProfile {
  displayName: string;
  avatarUrl: string | null;
}

// the signed-in user's user_profiles row; null when signed out or not loaded yet
export function useMyProfile() {
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<MyProfile | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    async function fetchProfile() {
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) console.error('Error fetching user profile:', error);
      setProfile(data ? { displayName: data.display_name, avatarUrl: data.avatar_url } : null);
    }

    fetchProfile();
  }, [userId]);

  return { profile, setProfile };
}
