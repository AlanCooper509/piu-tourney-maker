import { supabaseClient } from "../lib/supabaseClient";

export async function handleDeleteStage(stageId: number): Promise<void> {
  const { error } = await supabaseClient
    .from("stages")
    .delete()
    .eq("id", stageId);

  if (error) {
    throw error;
  }
}