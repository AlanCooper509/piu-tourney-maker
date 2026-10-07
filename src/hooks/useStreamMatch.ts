import { useMemo } from "react";

import { useRoundStreamData } from "./useRoundStreamData";
import { calculateH2HScoring } from "../helpers/calculateH2HScoring";
import { calculateCombinedRoundRankings } from "../helpers/calculateCombinedRoundRankings";
import { getStageChart } from "../helpers/getStageChart";

import type { PlayerRound } from "../types/PlayerRound";

interface UseStreamMatchOptions {
  roundIdOverride?: string | null;
  heatOverride?: string | null;
  // Ignore the pushed lane pairing and show every player in the heat.
  showAllInHeat?: boolean;
  // Every player in the round, across all heats, instead of the live heat.
  wholeRound?: boolean;
  channelIdPrefix?: string;
}

/**
 * Everything an OBS source needs to know about the match currently on
 * stream: the round's display name, the players in the pushed heat/lanes
 * (in on-screen order), each player's running score, and the round's charts.
 * Follows tourney.stream_round_id and round.active_stream_state live, the
 * same state Stream Helper pushes.
 */
export function useStreamMatch(
  tourneyId: string,
  {
    roundIdOverride = null,
    heatOverride = null,
    showAllInHeat = false,
    wholeRound = false,
    channelIdPrefix = "stream-source",
  }: UseStreamMatchOptions = {},
) {
  const { tourney, rounds, roundPools, currentRound, playerRounds, stages, carryOverStages } =
    useRoundStreamData(tourneyId, roundIdOverride, channelIdPrefix);

  const activeStreamState = currentRound?.active_stream_state;

  // The round's round pool name ("Winners Round 1 (Top 16)"), when it has one.
  const poolName = useMemo(() => {
    if (!currentRound) return null;
    const matchedPool = roundPools.find(
      (pool) => Number(pool.id) === Number(currentRound.round_pool_id),
    );
    return matchedPool?.name || null;
  }, [currentRound, roundPools]);

  const roundName = currentRound?.name ?? "";

  const players = useMemo(() => {
    if (!currentRound) return [];

    const roundPlayers = playerRounds.filter(
      (pr) => Number(pr.round_id) === Number(currentRound.id),
    );

    // Whole round: everyone, in heat then lane order (unseated players last).
    if (wholeRound) {
      const order = (n: number | null | undefined) => (n == null ? Infinity : Number(n));
      return [...roundPlayers].sort(
        (a, b) => order(a.heat) - order(b.heat) || order(a.lane) - order(b.lane),
      );
    }

    const activeHeat = activeStreamState?.heat
      ? Number(activeStreamState.heat)
      : heatOverride
        ? Number(heatOverride)
        : 1;

    const heatPlayers = roundPlayers.filter((pr) => Number(pr.heat) === activeHeat);

    const lanes = activeStreamState?.lanes?.map(Number) ?? [];
    const selected =
      !showAllInHeat && lanes.length > 0
        ? heatPlayers.filter((pr) => lanes.includes(Number(pr.lane)))
        : heatPlayers;

    const isFlipped = activeStreamState?.reverse_order ?? false;

    return [...selected].sort((a, b) => {
      const laneA = Number(a.lane ?? 0);
      const laneB = Number(b.lane ?? 0);
      return isFlipped ? laneB - laneA : laneA - laneB;
    });
  }, [playerRounds, currentRound, activeStreamState, heatOverride, showAllInHeat, wholeRound]);

  const scoring = useMemo(
    () => calculateH2HScoring({ players, stages, round: currentRound }),
    [players, stages, currentRound],
  );

  // The carry-over round, its players and stages, shaped the way
  // calculateCombinedRoundRankings (and the round page / leaderboard) take it.
  const carryOverData = useMemo(() => {
    const carryOverId = currentRound?.carry_over_round_id;
    if (!carryOverId) return null;
    const round = rounds.find((r) => Number(r.id) === Number(carryOverId));
    const carryOverPlayers = playerRounds.filter((pr) => Number(pr.round_id) === Number(carryOverId));
    if (!round || !carryOverPlayers.length || !carryOverStages.length) return null;
    return { round, players: carryOverPlayers, stages: carryOverStages };
  }, [currentRound?.carry_over_round_id, rounds, playerRounds, carryOverStages]);

  // 3+ players, or any carry-over round, rank the way the round page and
  // leaderboard do: points or cumulative per the round's scoring, carry-over
  // totals folded in, ties broken on raw cumulative score. A plain head to
  // head keeps calculateH2HScoring, matching the round's H2H view.
  const ranking = useMemo(() => {
    if (!currentRound || (players.length <= 2 && !carryOverData)) return null;
    return calculateCombinedRoundRankings(currentRound, players, stages, carryOverData);
  }, [players, stages, currentRound, carryOverData]);

  const scoreFor = (pr: PlayerRound) => {
    if (ranking) return ranking.rankings.find(([id]) => id === pr.id)?.[1] ?? 0;
    return scoring.hasScoresMap[pr.id] ? scoring.totalsMap[pr.id] : 0;
  };

  // Best first. Head to head, the H2H totals decide it (stable, so a tie keeps
  // lane order); otherwise the ranking helper's own order, tiebreak included.
  const rankedPlayers = useMemo(() => {
    if (!ranking) {
      const total = (pr: PlayerRound) =>
        scoring.hasScoresMap[pr.id] ? scoring.totalsMap[pr.id] : 0;
      return [...players].sort((a, b) => total(b) - total(a));
    }
    const byId = new Map(players.map((pr) => [pr.id, pr]));
    return ranking.rankings.flatMap(([id]) => byId.get(id) ?? []);
  }, [ranking, players, scoring]);

  // Shared place for a true tie (same total and, when ranked, same tiebreak).
  const placeFor = (pr: PlayerRound) => {
    const key = (p: PlayerRound) =>
      `${scoreFor(p)}|${ranking?.cumulativeScores[p.id] ?? ""}`;
    return rankedPlayers.findIndex((p) => key(p) === key(pr)) + 1;
  };

  const charts = useMemo(
    () =>
      [...stages]
        .sort((a, b) => Number(a.play_order ?? a.id) - Number(b.play_order ?? b.id))
        .map((stage) => ({ stage, chart: getStageChart(stage) }))
        .filter((entry) => entry.chart !== null),
    [stages],
  );

  return {
    tourney,
    currentRound,
    poolName,
    roundName,
    players,
    rankedPlayers,
    scoreFor,
    placeFor,
    charts,
  };
}
