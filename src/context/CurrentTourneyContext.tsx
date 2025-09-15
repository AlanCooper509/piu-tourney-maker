import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface CurrentTourneyContextValue {
  tourneyId: number | null;
  setTourneyId: (id: number) => void;
}

const CurrentTourneyContext = createContext<CurrentTourneyContextValue | undefined>(undefined);

interface CurrentTourneyProviderProps {
  children: ReactNode;
}

export function CurrentTourneyProvider({ children }: CurrentTourneyProviderProps) {
  const [tourneyId, setTourneyId] = useState<number | null>(null);

  return (
    <CurrentTourneyContext.Provider value={{ tourneyId, setTourneyId }}>
      {children}
    </CurrentTourneyContext.Provider>
  );
}

export function useCurrentTourney() {
  const context = useContext(CurrentTourneyContext);
  if (!context) {
    throw new Error("useCurrentTourney must be used within a CurrentTourneyProvider");
  }
  return context;
}