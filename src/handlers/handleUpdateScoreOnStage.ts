import { supabaseClient } from "../lib/supabaseClient";

export async function handleUpdateScoreOnStage(
  newScore: number,
  stageId: number,
  playerRoundId: number,
  playerName: string
) {
  if (newScore == null || Number.isNaN(newScore)) {
    throw new Error("Invalid score");
  }

  const { data, error } = await supabaseClient
    .from("scores")
    .update({ score: newScore })
    .eq("stage_id", stageId)
    .eq("player_round_id", playerRoundId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update score for ${playerName}: ${error.message}`);
  }

  if (!data) {
    throw new Error(`${playerName} does not have a score on this stage yet.`);
  }

  return data;
}