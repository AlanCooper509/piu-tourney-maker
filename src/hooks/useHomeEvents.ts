import { useMemo } from "react";
import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";

export function useHomeEvents(events: Event[] | null, tourneys: Tourney[] | null) {
  return useMemo(() => {
    const now = new Date();

    // 1. Filtered Events logic
    const filtered = {
      upcoming: events?.filter((e) => e.start_date && new Date(e.start_date) > now) || [],
      active: events?.filter((e) => 
        e.start_date && e.end_date && 
        new Date(e.start_date) <= now && new Date(e.end_date) >= now
      ) || [],
      completed: events?.filter((e) => e.end_date && new Date(e.end_date) < now)
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()) || [],
    };

    // 2. Spotlight Logic
    const allEvents = [...filtered.active, ...filtered.upcoming, ...filtered.completed];
    const sortedSpotlight = [...allEvents].sort((a, b) => {
      const getStatus = (event: any) => {
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        if (now >= start && now <= end) return 0;
        if (now < start) return 1;
        return 2;
      };
      const statusA = getStatus(a);
      const statusB = getStatus(b);
      if (statusA !== statusB) return statusA - statusB;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    // 3. Tourney Mapping Logic
    const tourneyMap: Map<number, Tourney[]> = new Map();
    tourneys?.forEach((tourney) => {
      if (tourney.event_id) {
        if (!tourneyMap.has(tourney.event_id)) tourneyMap.set(tourney.event_id, []);
        tourneyMap.get(tourney.event_id)?.push(tourney);
      }
    });

    return {
      filteredEvents: filtered,
      sortedSpotlightEvents: sortedSpotlight,
      eventTourneyMap: tourneyMap,
    };
  }, [events, tourneys]);
}