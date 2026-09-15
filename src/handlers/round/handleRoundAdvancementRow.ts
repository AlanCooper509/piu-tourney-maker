import { supabaseClient } from '../../lib/supabaseClient';
import type { RoundAdvancement } from '../../types/RoundAdvancement';

export async function handleAddRoundAdvancement(
  roundId: number,
  rankStart: number,
  rankEnd: number | null,
  destinationRoundId: number,
  label: string | undefined
): Promise<RoundAdvancement> {
  const { data, error } = await supabaseClient
    .from('round_advancements')
    .insert({
      round_id: roundId,
      rank_start: rankStart,
      rank_end: rankEnd,
      destination_round_id: destinationRoundId,
      label: label || null
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function handleUpdateRoundAdvancement(
  advancementId: number,
  rankStart: number,
  rankEnd: number | null,
  destinationRoundId: number,
  label: string | undefined
): Promise<RoundAdvancement> {
  const { data, error } = await supabaseClient
    .from('round_advancements')
    .update({
      rank_start: rankStart,
      rank_end: rankEnd,
      destination_round_id: destinationRoundId,
      label: label || null
    })
    .eq('id', advancementId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function handleDeleteRoundAdvancement(advancementId: number): Promise<void> {
  const { error } = await supabaseClient
    .from('round_advancements')
    .delete()
    .eq('id', advancementId);

  if (error) throw error;
}
