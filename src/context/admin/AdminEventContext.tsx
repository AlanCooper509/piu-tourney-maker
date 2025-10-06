import { createContext, useContext } from "react";
import { useAdminItems } from "./useAdminItems";

import type { ReactNode } from "react";

interface AdminEventContextValue {
  adminEventIds: number[];
  loadingEventAdminStatus: boolean;
}

const AdminEventContext = createContext<AdminEventContextValue | undefined>(undefined);

export function AdminEventProvider({ children }: { children: ReactNode }) {
  const { adminIds, loading } = useAdminItems("event_admins", "event_id");

  return (
    <AdminEventContext.Provider
      value={{ adminEventIds: adminIds, loadingEventAdminStatus: loading }}
    >
      {children}
    </AdminEventContext.Provider>
  );
}

export function useIsAdminForEvent(eventId: number) {
  const context = useContext(AdminEventContext);
  if (!context) throw new Error("useIsAdminForEvent must be used within AdminEventProvider");

  const { adminEventIds, loadingEventAdminStatus } = context;
  const isEventAdmin = !loadingEventAdminStatus && adminEventIds.includes(eventId);

  return { isEventAdmin, loadingEventAdminStatus };
}