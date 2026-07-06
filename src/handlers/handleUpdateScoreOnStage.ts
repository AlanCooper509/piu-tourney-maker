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

  // 1. Fetch the current status of the round this stage belongs to
  const { data: stageData, error: stageError } = await supabaseClient
    .from("stages")
    .select(`
      id,
      round_id,
      rounds (
        status
      )
    `)
    .eq("id", stageId)
    .single();

  if (stageError || !stageData) {
    throw stageError || new Error("Stage or associated round not found.");
  }

  // Handle the Postgres join nesting structure
  const round = Array.isArray(stageData.rounds) ? stageData.rounds[0] : stageData.rounds;
  const roundId = stageData.round_id;
  const currentStatus = round?.status;

  // 2. Safeguard: Prevent changes if the round is already complete
  if (currentStatus === "Complete") {
    throw new Error("Completed rounds cannot be modified.");
  }

  // 3. Update the existing score
  const { data: scoreData, error: updateError } = await supabaseClient
    .from("scores")
    .update({ score: newScore })
    .eq("stage_id", stageId)
    .eq("player_round_id", playerRoundId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update score for ${playerName}: ${updateError.message}`);
  }

  if (!scoreData) {
    throw new Error(`${playerName} does not have a score on this stage yet.`);
  }

  // 4. Update the round to "In Progress" if it isn't already there
  if (currentStatus !== "In Progress") {
    const { error: roundUpdateError } = await supabaseClient
      .from("rounds")
      .update({ status: "In Progress" })
      .eq("id", roundId);

    if (roundUpdateError) {
      // "soft error" (score update was successful, round status update was not)
      console.error("Failed to update round status to In Progress:", roundUpdateError);
    }
  }

  return scoreData;
}