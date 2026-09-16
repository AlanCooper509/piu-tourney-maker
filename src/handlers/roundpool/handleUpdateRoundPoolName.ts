import { updateSupabaseTable } from "../../helpers/updateSupabaseTable";

import type { RoundPool } from "../../types/RoundPool";

export async function handleUpdateRoundPoolName(poolId: number, newName: string): Promise<RoundPool> {
  if (!poolId) throw new Error("Round pool ID is required");
  if (!newName.trim()) throw new Error("Pool name cannot be empty");

  const updated = await updateSupabaseTable<RoundPool>(
    "round_pools",
    { name: newName.trim() },
    [{ column: "id", value: poolId }]
  );

  return updated[0];
}
