import { updateSupabaseTable } from "../../helpers/updateSupabaseTable";

import type { RoundPool } from "../../types/RoundPool";

export async function handleUpdateRoundPoolSortOrder(poolId: number, sortOrder: number): Promise<RoundPool> {
  if (!poolId) throw new Error("Round pool ID is required");

  const updated = await updateSupabaseTable<RoundPool>(
    "round_pools",
    { sort_order: sortOrder },
    [{ column: "id", value: poolId }]
  );

  return updated[0];
}
