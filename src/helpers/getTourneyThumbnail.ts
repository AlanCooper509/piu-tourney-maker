import type { Tourney } from "../types/Tourney";
import type { Event } from "../types/Event";

export function getTourneyThumbnail(
  tourney: Tourney,
  event?: Event | null
): string {
  return (
    tourney.thumbnail_img ||
    event?.thumbnail_img ||
    "/trophy.png" // Fallback image path in public folder
  );
}