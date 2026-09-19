import { supabaseClient } from '../../lib/supabaseClient';
import type { Round } from '../../types/Round';

export async function handleUpdateRoundDetails(
  roundId: number,
  newName: string,
  pointsPerStage: string | undefined,
  roundPoolId: number | null | undefined,
  carryOverRoundId: number | null | undefined
): Promise<Round> {
  if (!roundId) {
    throw new Error('Round ID is required');
  }
  if (!newName.trim()) {
    throw new Error('Round name cannot be empty');
  }

  const { data, error } = await supabaseClient
    .from('rounds')
    .update(
      {
        name: newName.trim(),
        points_per_stage: pointsPerStage ?? null,
        round_pool_id: roundPoolId ?? null,
        carry_over_round_id: carryOverRoundId ?? null
      }
    )
    .eq('id', roundId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Round "${newName.trim()}" already exists in this tournament.`);
    }
    throw error;
  }

  if (!data) {
    throw new Error('Round not found');
  }

  return data;
}

export async function handleAddRoundToTourney(
  tourneyId: number,
  roundName: string,
  pointsPerStage: string | undefined,
  roundPoolId: number | null | undefined,
  carryOverRoundId: number | null | undefined
) {
  const { data, error } = await supabaseClient
    .from("rounds")
    .insert([
      {
        tourney_id: tourneyId,
        name: roundName,
        points_per_stage: pointsPerStage ?? null,
        round_pool_id: roundPoolId ?? null,
        carry_over_round_id: carryOverRoundId ?? null
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Round "${roundName}" already exists in this tourney.`);
    }
    throw error;
  }

  return data;
}