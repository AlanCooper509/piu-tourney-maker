import { supabaseClient } from "../../lib/supabaseClient";

import type { RoundPool } from "../../types/RoundPool";

export async function handleAddRoundPool(
  tourneyId: number,
  name: string,
  sortOrder: number
): Promise<RoundPool> {
  if (!name.trim()) {
    throw new Error("Pool name cannot be empty");
  }

  const { data, error } = await supabaseClient
    .from("round_pools")
    .insert({
      tourney_id: tourneyId,
      name: name.trim(),
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Round pool "${name.trim()}" already exists in this tourney.`);
    }
    throw error;
  }

  return data;
}
