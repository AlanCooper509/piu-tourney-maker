import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { supabaseClient } from '../lib/supabaseClient';

export function getAdminTourneyIds() {
  const { user } = useAuth();
  const [adminTourneyIds, setAdminTourneyIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminTourneyIds() {
      if (!user) {
        setAdminTourneyIds([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabaseClient
        .from('tourney_admins')
        .select('tourney_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching admin tourney IDs:', error);
        setAdminTourneyIds([]);
      } else {
        setAdminTourneyIds(data?.map(row => row.tourney_id) ?? []);
      }
      setLoading(false);
    }

    fetchAdminTourneyIds();
  }, [user]);

  return { adminTourneyIds, loading };
}

export function isAdminForTourney(tourneyId: number) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!user || !tourneyId) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('tourney_admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('tourney_id', tourneyId)
        .maybeSingle();

      setIsAdmin(!!data && !error);
      setLoading(false);
    }

    checkAdmin();
  }, [user, tourneyId]);

  return { isAdmin, loading };
}