import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // your auth hook
import { supabaseClient } from "../lib/supabaseClient";

import type { ReactNode } from "react";

interface AdminTourneyContextValue {
  adminTourneyIds: number[];
  loadingTourneyAdminStatus: boolean;
}

const AdminTourneyContext = createContext<AdminTourneyContextValue | undefined>(undefined);

export function AdminTourneyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [adminTourneyIds, setAdminTourneyIds] = useState<number[]>([]);
  const [loadingTourneyAdminStatus, setLoadingTourneyAdminStatus] = useState(true);

  useEffect(() => {
    async function fetchAdminTourneyIds() {
      if (!user) {
        setAdminTourneyIds([]);
        setLoadingTourneyAdminStatus(false);
        return;
      }

      setLoadingTourneyAdminStatus(true);
      const { data, error } = await supabaseClient
        .from("tourney_admins")
        .select("tourney_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching admin tourney IDs:", error);
        setAdminTourneyIds([]);
      } else {
        setAdminTourneyIds(data?.map(row => row.tourney_id) ?? []);
      }
      setLoadingTourneyAdminStatus(false);
    }

    fetchAdminTourneyIds();
  }, [user?.id]);

  return (
    <AdminTourneyContext.Provider value={{ adminTourneyIds, loadingTourneyAdminStatus }}>
      {children}
    </AdminTourneyContext.Provider>
  );
}

export function useIsAdminForTourney(tourneyId: number) {
  const context = useContext(AdminTourneyContext);
  if (!context) throw new Error("useIsAdminForTourney must be used within AdminTourneyProvider");

  const { adminTourneyIds, loadingTourneyAdminStatus } = context;
  const isTourneyAdmin = !loadingTourneyAdminStatus && adminTourneyIds.includes(tourneyId);

  return { isTourneyAdmin, loadingTourneyAdminStatus };
}