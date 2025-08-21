import { supabaseClient } from "../lib/supabaseClient";

export async function handleAddScoreToStage(
  score: number,
  stageId: number,
  playerRoundId: number,
  playerName: string
) {
  const { data, error } = await supabaseClient
    .from("scores")
    .insert([
      {
        stage_id: stageId,
        player_round_id: playerRoundId,
        score: score
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`${playerName} already has a score on this stage.`);
    }
    throw error;
  }

  return data;
}