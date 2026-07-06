import { supabaseClient } from "../lib/supabaseClient";

export async function handleAddScoreToStage(
  score: number,
  stageId: number,
  playerRoundId: number,
  playerName: string
) {
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

  // 3. Insert the new score
  const { data: scoreData, error: insertError } = await supabaseClient
    .from("scores")
    .insert([
      {
        stage_id: stageId,
        player_round_id: playerRoundId,
        score: score,
      },
    ])
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error(`${playerName} already has a score on this stage.`);
    }
    throw insertError;
  }

  // 4. Update the round to "In Progress" if it isn't already there
  if (currentStatus !== "In Progress") {
    const { error: roundUpdateError } = await supabaseClient
      .from("rounds")
      .update({ status: "In Progress" })
      .eq("id", roundId);

    if (roundUpdateError) {
      // "soft error" (score submission was successful, round status update was not)
      console.error("Failed to update round status to In Progress:", roundUpdateError);
    }
  }

  return scoreData;
}