type Id = number | string;

/**
 * Tourney URLs are event-scoped (/event/:eventId/tourney/...) when the event is known, so a page
 * can resolve its event straight from the URL. The older /tourney/... form is still routed, and is
 * the fallback while the event isn't known yet.
 */
export function tourneyPath(tourneyId: Id, eventId?: Id | null): string {
  const base = `/tourney/${tourneyId}`;
  return eventId != null ? `/event/${eventId}${base}` : base;
}

export function roundPath(tourneyId: Id, roundId: Id, eventId?: Id | null): string {
  return `${tourneyPath(tourneyId, eventId)}/round/${roundId}`;
}

export function leaderboardPath(tourneyId: Id, roundId: Id, eventId?: Id | null): string {
  return `${roundPath(tourneyId, roundId, eventId)}/leaderboard`;
}

export function stageRollPath(tourneyId: Id, roundId: Id, stageId: Id, eventId?: Id | null): string {
  return `${roundPath(tourneyId, roundId, eventId)}/stage/${stageId}/roll`;
}

/** True for any tourney page, under either URL form. */
export function isTourneyPath(pathname: string): boolean {
  return /^\/(event\/[^/]+\/)?tourney\//.test(pathname);
}
