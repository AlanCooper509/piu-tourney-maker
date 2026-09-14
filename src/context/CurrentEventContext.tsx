import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";

interface CurrentEventContextValue {
  event: Event | null;
  tourneys: Tourney[];
  setEvent: (event: Event | null) => void;
  setTourneys: React.Dispatch<React.SetStateAction<Tourney[]>>;
  setCurrentEventData: (event: Event | null, tourneys: Tourney[]) => void;
}

const CurrentEventContext = createContext<CurrentEventContextValue | null>(null);

export function CurrentEventProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [tourneys, setTourneys] = useState<Tourney[]>([]);

  const setCurrentEventData = (
    nextEvent: Event | null,
    nextTourneys: Tourney[]
  ) => {
    setEvent(nextEvent);
    setTourneys(nextTourneys);
  };

  return (
    <CurrentEventContext.Provider
      value={{ event, tourneys, setEvent, setTourneys, setCurrentEventData }}
    >
      {children}
    </CurrentEventContext.Provider>
  );
}

export function useCurrentEvent() {
  const context = useContext(CurrentEventContext);
  if (!context) {
    throw new Error("useCurrentEvent must be used within a CurrentEventProvider");
  }
  return context;
}