import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Tourney } from "../types/Tourney";

interface CurrentTourneyContextValue {
  tourney: Tourney | null;
  setTourney: (tourney: Tourney | null) => void;
}

const CurrentTourneyContext = createContext<CurrentTourneyContextValue | null>(null);

export function CurrentTourneyProvider({ children }: { children: ReactNode }) {
  const [tourney, setTourney] = useState<Tourney | null>(null);

  return (
    <CurrentTourneyContext.Provider value={{ tourney, setTourney }}>
      {children}
    </CurrentTourneyContext.Provider>
  );
}

export function useCurrentTourney() {
  const context = useContext(CurrentTourneyContext);
  if (!context) throw new Error("useCurrentTourney must be used within a CurrentTourneyProvider");
  return context;
}