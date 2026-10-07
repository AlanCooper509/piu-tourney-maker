import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAdminItems } from "./useAdminItems";
import { useAdminEventContext } from "./AdminEventContext";
import { useAuth } from "../AuthContext";
import { supabaseClient } from "../../lib/supabaseClient";
import type { ReactNode } from "react";

interface AdminTourneyContextValue {
  adminTourneyIds: number[]; // tourneys the user is a TO of, directly or as an admin of the tourney's event
  loadingTourneyAdminStatus: boolean;
  addTourneyAdminId: (id: number) => void;
}

const AdminTourneyContext = createContext<AdminTourneyContextValue | null>(null);

// ids of every tourney in the events the user is an event admin of
function useEventAdminTourneyIds() {
  const { adminEventIds, loadingEventAdminStatus } = useAdminEventContext();
  const [tourneyIds, setTourneyIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingEventAdminStatus) return;
    if (adminEventIds.length === 0) {
      setTourneyIds([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    supabaseClient
      .from("tourneys")
      .select("id")
      .in("event_id", adminEventIds)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Error fetching event admin tourney IDs:", error);
          setTourneyIds([]);
        } else {
          setTourneyIds(data?.map((row) => row.id) ?? []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminEventIds, loadingEventAdminStatus]);

  return { tourneyIds, loading: loading || loadingEventAdminStatus };
}

export function AdminTourneyProvider({ children }: { children: ReactNode }) {
  const { adminIds, loading: loadingDirect } = useAdminItems("tourney_admins", "tourney_id");
  const { tourneyIds: eventTourneyIds, loading: loadingEvent } = useEventAdminTourneyIds();
  const loading = loadingDirect || loadingEvent;
  const { user } = useAuth();
  // tourneys created this session, so their admin controls show without a refetch
  const [createdIds, setCreatedIds] = useState<number[]>([]);

  useEffect(() => {
    setCreatedIds([]);
  }, [user?.id]);

  const adminTourneyIds = useMemo(
    () => [...new Set([...adminIds, ...eventTourneyIds, ...createdIds])],
    [adminIds, eventTourneyIds, createdIds]
  );

  const addTourneyAdminId = (id: number) => {
    setCreatedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <AdminTourneyContext.Provider
      value={{ adminTourneyIds, loadingTourneyAdminStatus: loading, addTourneyAdminId }}
    >
      {children}
    </AdminTourneyContext.Provider>
  );
}

export function useIsAdminForTourney(tourneyId?: number) {
  const context = useContext(AdminTourneyContext);
  if (!context) throw new Error("useIsAdminForTourney must be used within AdminTourneyProvider");

  const { adminTourneyIds, loadingTourneyAdminStatus } = context;

  if (!tourneyId)
    return { isTourneyAdmin: false, loadingTourneyAdminStatus };

  const isTourneyAdmin = !loadingTourneyAdminStatus && adminTourneyIds.includes(tourneyId);
  return { isTourneyAdmin, loadingTourneyAdminStatus };
}

export function useAdminTourneyContext() {
  const context = useContext(AdminTourneyContext);
  if (!context) throw new Error("useAdminTourneyContext must be used within AdminTourneyProvider");
  return context;
}