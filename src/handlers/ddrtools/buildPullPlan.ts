import {
  bannedChartCount,
  drawingsForTourney,
  drawnCharts,
  gameKeyForDrawing,
} from "../../lib/ddrTools";

import type { Round } from "../../types/Round";
import type { DdrToolsChart, DdrToolsDrawing, DdrToolsState } from "../../lib/ddrTools";

export interface PulledRound {
  /** the ddr.tools drawing this came from */
  drawingId: string;
  title: string;
  roundId: number;
  round: Round | null;
  charts: DdrToolsChart[];
  /** ids of charts above that replaced the one originally drawn */
  pocketPickIds: string[];
  /** drawn charts left out because they were banned, and so never played */
  bannedCount: number;
  /** the source's name for the game these charts came from, for provenance */
  gameKey: string | null;
  /** playerTourneyId -> ddr.tools chart id -> score */
  scoresByPlayer: Record<string, Record<string, number | undefined>>;
  players: Array<{ id: string; name: string }>;
  /** why this round can't be committed, if it can't */
  blocker?: string;
}

export interface PullPlan {
  eventName?: string;
  rounds: PulledRound[];
  /** draws in the room that belong to some other tournament, or none */
  skipped: number;
}

/**
 * Turns a ddr.tools room into a reviewable set of proposed writes: which round
 * each draw maps to, the charts it played, and the scores that came back.
 * Nothing is written here — this lands in a live tournament, so a human looks
 * first.
 *
 * Charts are carried through as the source recorded them rather than resolved
 * against our `charts` table. A stage stores what it played; only the draw
 * itself ever needed a queryable catalog, and ddr.tools already did that part.
 */
export function buildPullPlan(
  state: DdrToolsState,
  tourneyId: number,
  rounds: Round[],
): PullPlan {
  const mine = drawingsForTourney(state, tourneyId);
  const skipped = Object.keys(state.drawings.entities).length - mine.length;
  const roundsById = new Map(rounds.map((r) => [r.id, r]));

  const pulled = mine.map((drawing) =>
    buildRound(state, drawing, roundsById),
  );

  // committable rounds first, then in bracket order
  pulled.sort(
    (a, b) => Number(!!a.blocker) - Number(!!b.blocker) || a.roundId - b.roundId,
  );

  return { eventName: state.event?.eventName, rounds: pulled, skipped };
}

function buildRound(
  state: DdrToolsState,
  drawing: DdrToolsDrawing,
  roundsById: Map<number, Round>,
): PulledRound {
  const roundId = Number(drawing.meta.id);
  const round = roundsById.get(roundId) ?? null;
  const charts = drawnCharts(drawing);

  const pulled: PulledRound = {
    drawingId: drawing.id,
    title: drawing.meta.title,
    roundId,
    round,
    charts,
    pocketPickIds: charts
      .filter((c) => drawing.pocketPicks?.[c.id])
      .map((c) => c.id),
    bannedCount: bannedChartCount(drawing),
    gameKey: gameKeyForDrawing(state, drawing),
    players: drawing.meta.players,
    scoresByPlayer: drawing.meta.scoresByEntrant ?? {},
  };

  if (!round) {
    pulled.blocker = `round ${roundId} is no longer part of this tournament`;
  } else if (!charts.length) {
    pulled.blocker = "no charts were drawn yet";
  } else if (round.status === "Complete") {
    pulled.blocker = "this round is already complete";
  } else if (!Object.keys(pulled.scoresByPlayer).length) {
    pulled.blocker = "no scores were recorded for this match in ddr.tools yet";
  }

  return pulled;
}

export function isCommittable(pulled: PulledRound) {
  return !pulled.blocker && !!pulled.round && pulled.charts.length > 0;
}

/** Scores for one chart, in the order the players are listed. */
export function scoresForChart(pulled: PulledRound, chartId: string) {
  return pulled.players.map((p) => ({
    name: p.name,
    score: pulled.scoresByPlayer[p.id]?.[chartId],
  }));
}
