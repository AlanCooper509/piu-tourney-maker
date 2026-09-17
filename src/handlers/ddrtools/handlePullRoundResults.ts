import { supabaseClient } from "../../lib/supabaseClient";
import { absoluteJacketUrl } from "../../lib/ddrTools";
import getPlayersInRound from "../../helpers/getPlayersInRound";
import getStagesInRound from "../../helpers/getstagesInRound";
import handleEndRound from "../round/transition/handleEndRound";

import type { Round } from "../../types/Round";
import type { TourneyType } from "../../types/Tourney";
import type { PulledRound } from "./buildPullPlan";

export interface PullCommitResult {
  roundId: number;
  roundName: string;
  stagesCreated: number;
  scoresRecorded: number;
  advanced: boolean;
  /** why the round wasn't ended, when ending it was asked for */
  advanceSkipped?: string;
}

/**
 * Writes one ddr.tools match into a round: the charts it played become stages
 * that describe themselves, and the scores recorded against them become score
 * rows.
 *
 * Deliberately refuses a round that already has stages. Re-running a pull would
 * otherwise duplicate the charts, leaving the round double counted.
 */
export async function handlePullRoundResults(
  pulled: PulledRound,
  round: Round,
  tourneyId: number,
  tourneyType: TourneyType | null,
  { advance, sourceRoom }: { advance: boolean; sourceRoom?: string },
): Promise<PullCommitResult> {
  const existingStages = await getStagesInRound(round.id);
  if (existingStages.length) {
    throw new Error(
      `"${round.name}" already has ${existingStages.length} stage(s). Clear them before pulling, so results can't be double counted.`,
    );
  }

  // 1. each chart played becomes a stage carrying its own description, so no
  //    catalog lookup is needed and any game the source supports works
  const { data: stageRows, error: stageError } = await supabaseClient
    .from("stages")
    .insert(
      pulled.charts.map((chart, index) => ({
        round_id: round.id,
        chart_id: null,
        play_order: index + 1,
        chart_source: "ddrtools",
        chart_name: chart.name,
        chart_type: chart.diffAbbr,
        chart_level: chart.level,
        chart_image_url: absoluteJacketUrl(chart.jacket),
        chart_meta: {
          artist: chart.artist,
          bpm: chart.bpm,
          game: pulled.gameKey ?? undefined,
          sourceRoom,
          sourceDrawingId: pulled.drawingId,
          sourceChartId: chart.id,
        },
      })),
    )
    .select();
  if (stageError) throw stageError;

  // stage ids line up with the chart order just inserted
  const ordered = [...(stageRows ?? [])].sort(
    (a, b) => (a.play_order ?? 0) - (b.play_order ?? 0),
  );
  const stageIdByChartId = new Map<string, number>();
  pulled.charts.forEach((chart, index) => {
    const stage = ordered[index];
    if (stage) stageIdByChartId.set(chart.id, stage.id);
  });

  // 2. scores are keyed by player_round, not by the tournament-wide player
  const playerRounds = await getPlayersInRound(round.id);
  const playerRoundIdByTourneyId = new Map<string, number>(
    playerRounds.map((pr) => [String(pr.player_tourney_id), pr.id]),
  );

  const scoreRows: Array<{
    stage_id: number;
    player_round_id: number;
    score: number;
  }> = [];
  const unmapped: string[] = [];
  for (const [playerId, byChart] of Object.entries(pulled.scoresByPlayer)) {
    const playerRoundId = playerRoundIdByTourneyId.get(playerId);
    // a player who isn't in this round any more (removed since the draw) is
    // skipped rather than failing the whole pull, but their missing scores are
    // enough to make any ranking built from this round wrong
    if (!playerRoundId) {
      unmapped.push(playerId);
      continue;
    }
    for (const [chartId, score] of Object.entries(byChart)) {
      const stageId = stageIdByChartId.get(chartId);
      if (!stageId || typeof score !== "number") continue;
      scoreRows.push({ stage_id: stageId, player_round_id: playerRoundId, score });
    }
  }

  if (scoreRows.length) {
    const { error: scoreError } = await supabaseClient
      .from("scores")
      .insert(scoreRows);
    if (scoreError) throw scoreError;
  }

  // 3. a round with scores on it is underway, matching what entering a score
  //    by hand does
  const nextStatus = scoreRows.length ? "In Progress" : "Ready";
  if (round.status !== nextStatus) {
    const { error: statusError } = await supabaseClient
      .from("rounds")
      .update({ status: nextStatus })
      .eq("id", round.id);
    if (statusError) {
      // the results landed; a stale status is recoverable from the UI
      console.error("Failed to update round status after pull:", statusError);
    }
  }

  // Advancing decides who is still in the tournament and can't be undone from
  // the UI, while `handleEndRound` only checks that stages and players exist.
  // Scores that didn't land would rank those players last on an empty set, so
  // the round is left open for a human instead.
  let advanced = false;
  let advanceSkipped: string | undefined;
  if (advance) {
    if (!scoreRows.length) {
      advanceSkipped = "no scores landed on this round";
    } else if (unmapped.length) {
      advanceSkipped = `${unmapped.length} player(s) in the draw have no entry in this round`;
    } else {
      await handleEndRound({
        tourneyId,
        round: { ...round, status: nextStatus },
        tourneyType,
      });
      advanced = true;
    }
  }

  return {
    roundId: round.id,
    roundName: round.name,
    stagesCreated: pulled.charts.length,
    scoresRecorded: scoreRows.length,
    advanced,
    advanceSkipped,
  };
}
