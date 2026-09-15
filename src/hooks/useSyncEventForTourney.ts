import { useEffect } from "react";
import getSupabaseTable from "./getSupabaseTable";
import { useCurrentEvent } from "../context/CurrentEventContext";

import type { Event } from "../types/Event";

/**
 * Keeps CurrentEventContext in sync with a tourney's parent event, so the Hero
 * banner shows the right event on any page reached directly by URL, not just
 * ones navigated to via the event/tourney pages themselves.
 */
export function useSyncEventForTourney(eventId: number | undefined) {
  const { setEvent } = useCurrentEvent();

  // eventId defaults to -1 (never a real id) so the query stays scoped to
  // nothing until it's known, instead of fetching every event
  const { data: queriedEvent } = getSupabaseTable<Event>(
    'events',
    { column: 'id', value: eventId ?? -1 }
  );

  useEffect(() => {
    if (queriedEvent?.length) {
      setEvent(queriedEvent[0]);
    }
  }, [queriedEvent, setEvent]);
}
