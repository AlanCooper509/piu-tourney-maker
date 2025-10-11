import { createContext, useContext, useState, useEffect } from "react";
import { useAdminItems } from "./useAdminItems";
import type { ReactNode } from "react";

interface AdminTourneyContextValue {
  adminTourneyIds: number[];
  loadingTourneyAdminStatus: boolean;
  addTourneyAdminId: (id: number) => void; // new helper
}

const AdminTourneyContext = createContext<AdminTourneyContextValue | null>(null);

export function AdminTourneyProvider({ children }: { children: ReactNode }) {
  const { adminIds, loading } = useAdminItems("tourney_admins", "tourney_id");
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && adminIds) setIds(adminIds);
  }, [adminIds, loading]);

  const addTourneyAdminId = (id: number) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <AdminTourneyContext.Provider
      value={{ adminTourneyIds: ids, loadingTourneyAdminStatus: loading, addTourneyAdminId }}
    >
      {children}
    </AdminTourneyContext.Provider>
  );
}

export function useIsAdminForTourney(tourneyId: number) {
  const context = useContext(AdminTourneyContext);
  if (!context) throw new Error("useIsAdminForTourney must be used within AdminTourneyProvider");

  const { adminTourneyIds, loadingTourneyAdminStatus } = context;
  const isTourneyAdmin = !loadingTourneyAdminStatus && adminTourneyIds.includes(tourneyId);

  return { isTourneyAdmin, loadingTourneyAdminStatus, adminTourneyIds };
}

export function useAdminTourneyContext() {
  const context = useContext(AdminTourneyContext);
  if (!context) throw new Error("useAdminTourneyContext must be used within AdminTourneyProvider");
  return context;
}