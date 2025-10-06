// AdminTourneyContext.tsx
import { createContext, useContext } from "react";
import { useAdminItems } from "./useAdminItems";

import type { ReactNode } from "react";

interface AdminTourneyContextValue {
  adminTourneyIds: number[];
  loadingTourneyAdminStatus: boolean;
}

const AdminTourneyContext = createContext<AdminTourneyContextValue | null>(null);


export function AdminTourneyProvider({ children }: { children: ReactNode }) {
  const { adminIds, loading } = useAdminItems("tourney_admins", "tourney_id");
  return (
    <AdminTourneyContext.Provider
      value={{ adminTourneyIds: adminIds, loadingTourneyAdminStatus: loading }}
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

  return { isTourneyAdmin, loadingTourneyAdminStatus };
}