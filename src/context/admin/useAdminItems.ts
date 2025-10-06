// useAdminItems.ts
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { supabaseClient } from "../../lib/supabaseClient";

export function useAdminItems(table: string, field: string) {
  const { user } = useAuth();
  const [adminIds, setAdminIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminIds() {
      if (!user) {
        setAdminIds([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabaseClient
        .from(table)
        .select(field)
        .eq("user_id", user.id);

      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        setAdminIds([]);
      } else {
        setAdminIds(data?.map((row: any) => row[field]) ?? []);
      }
      setLoading(false);
    }

    fetchAdminIds();
  }, [user?.id, table, field]);

  return { adminIds, loading };
}