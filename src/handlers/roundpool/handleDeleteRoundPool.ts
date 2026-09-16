import { supabaseClient } from "../../lib/supabaseClient";

export async function handleDeleteRoundPool(poolId: number): Promise<void> {
  const { error } = await supabaseClient
    .from("round_pools")
    .delete()
    .eq("id", poolId);

  if (error) {
    throw error;
  }
}
