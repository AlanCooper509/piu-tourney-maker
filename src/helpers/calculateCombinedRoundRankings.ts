import calculatePlayerRankingsInRound from "./calculatePlayerRankingsInRound";

import type { PlayerRound } from "../types/PlayerRound";
import type { Stage } from "../types/Stage";
import type { Round } from "../types/Round";

/** One round's own ranking data - the exact shape calculatePlayerRankingsInRound returns. */
export interface RoundRankingBreakdown {
  round: Round;
  players: PlayerRound[];
  stages: Stage[];
  rankings: [number, number][]; // [player_round_id, total]
  pointsMap: Map<string, number>; // `${player_round_id}-${stageId}` -> points
  cumulativeScores: Record<number, number>; // player_round_id -> raw cumulative score
}

export interface CombinedRoundRanking {
  /** Final [player_round_id, total] pairs for this round's own players, sorted best-first. */
  rankings: [number, number][];
  /** player_round_id (this round) -> combined raw cumulative score, for tiebreaking. */
  cumulativeScores: Record<number, number>;
  /** This round's own breakdown, unchanged - use for its own section of a grouped display. */
  own: RoundRankingBreakdown;
  /** The carry-over round's breakdown, present only when round.carry_over_round_id was set
   * and that round actually has data. Its player_round_ids belong to a DIFFERENT round than
   * `own` - use carryOverPlayerRoundId to relate a player across the two. */
  carryOver: RoundRankingBreakdown | null;
  /** This round's player_round_id -> the same person's player_round_id in the carry-over
   * round, for players who appear in both. */
  carryOverPlayerRoundId: Record<number, number>;
}

/**
 * Ranks a round's players, folding in score history from another round when the round
 * carries over from one (e.g. a Waterfall redemption round whose final placement should
 * reflect all charts played, not just its own).
 *
 * calculatePlayerRankingsInRound itself is never taught about cross-round IDs: each round
 * is ranked independently against its own real player pool (so points-based scoring stays
 * correct per stage), and the two totals are summed afterward by matching players on
 * player_tourney_id, since the same person has a different player_round_id in each round.
 */
export function calculateCombinedRoundRankings(
  round: Round,
  players: PlayerRound[],
  stages: Stage[],
  carryOverData: { round: Round; players: PlayerRound[]; stages: Stage[] } | null
): CombinedRoundRanking {
  const own = calculatePlayerRankingsInRound({ players, stages, round });
  const ownBreakdown: RoundRankingBreakdown = { round, players, stages, ...own };

  if (!carryOverData) {
    return {
      rankings: own.rankings,
      cumulativeScores: own.cumulativeScores,
      own: ownBreakdown,
      carryOver: null,
      carryOverPlayerRoundId: {},
    };
  }

  const carryOverResult = calculatePlayerRankingsInRound({
    players: carryOverData.players,
    stages: carryOverData.stages,
    round: carryOverData.round,
  });
  const carryOverBreakdown: RoundRankingBreakdown = {
    round: carryOverData.round,
    players: carryOverData.players,
    stages: carryOverData.stages,
    ...carryOverResult,
  };

  // this round's player_round_id -> carry-over round's player_round_id, matched by the
  // stable player_tourney_id (a player_round_id is only ever valid within its own round)
  const carryOverIdByTourneyId = new Map(
    carryOverData.players.map((p) => [p.player_tourney_id, p.id])
  );
  const carryOverPlayerRoundId: Record<number, number> = {};
  for (const p of players) {
    const matchId = carryOverIdByTourneyId.get(p.player_tourney_id);
    if (matchId != null) carryOverPlayerRoundId[p.id] = matchId;
  }

  const carryOverTotalById = new Map(carryOverResult.rankings);

  const combinedTotals: Record<number, number> = {};
  const combinedCumulative: Record<number, number> = {};
  for (const [playerRoundId, total] of own.rankings) {
    const carryOverId = carryOverPlayerRoundId[playerRoundId];
    const carryOverTotal = carryOverId != null ? carryOverTotalById.get(carryOverId) ?? 0 : 0;
    const carryOverCumulative = carryOverId != null ? carryOverResult.cumulativeScores[carryOverId] ?? 0 : 0;

    combinedTotals[playerRoundId] = total + carryOverTotal;
    combinedCumulative[playerRoundId] = (own.cumulativeScores[playerRoundId] ?? 0) + carryOverCumulative;
  }

  const rankings: [number, number][] = Object.entries(combinedTotals)
    .map(([id, total]) => [Number(id), total] as [number, number])
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]; // primary: combined total
      return combinedCumulative[b[0]] - combinedCumulative[a[0]]; // tiebreaker: combined raw cumulative
    });

  return {
    rankings,
    cumulativeScores: combinedCumulative,
    own: ownBreakdown,
    carryOver: carryOverBreakdown,
    carryOverPlayerRoundId,
  };
}
