import { supabaseClient } from '../lib/supabaseClient';

import { handleUpdateRoundName } from './round/handleUpdateRoundName';
import { formatRoundName } from '../helpers/formatRoundName';

import type { PlayerTourney } from '../types/PlayerTourney';

export async function handleUpdatePlayerInTourney(
  id: number,
  newName: string,
  newSeed: number | null,
  tourneyType?: string
): Promise<PlayerTourney> {
  if (!newName.trim()) {
    throw new Error('Player name cannot be empty');
  }

  // 1. Update the base player record
  const { data: updatedPlayer, error } = await supabaseClient
    .from('player_tourneys')
    .update({ player_name: newName.trim(), seed: newSeed })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Player "${newName.trim()}" already exists in this tourney.`);
    }
    throw error;
  }

  if (!updatedPlayer) {
    throw new Error('Player not found in this tournament');
  }

  // 2. Renaming dynamically named rounds with the updated player name (for Double Elimination tournaments only currently)
  if (tourneyType === "Double Elimination") {
    await cascadePlayerNameChangeToRounds(id, newName.trim());
  }

  return updatedPlayer;
}

async function cascadePlayerNameChangeToRounds(playerTourneyId: number, newName: string): Promise<void> {
  try {
    // Fetch all round ids that this player is in
    const { data: playerRounds, error: fetchRoundsError } = await supabaseClient
      .from('player_rounds')
      .select('round_id')
      .eq('player_tourney_id', playerTourneyId);

    if (fetchRoundsError) throw fetchRoundsError;
    if (!playerRounds || playerRounds.length === 0) return;

    // Isolate unique round IDs that need renaming
    const uniqueRoundIds = Array.from(new Set(playerRounds.map((pr) => pr.round_id)));

    // Rename all relevant round IDs concurrently
    await Promise.all(
      uniqueRoundIds.map(async (roundId) => {
        // Concurrently fetch the base round name and all current sibling players assigned to it
        const [roundResponse, allPlayersInRoundResponse] = await Promise.all([
          supabaseClient.from('rounds').select('name').eq('id', roundId).single(),
          supabaseClient
            .from('player_rounds')
            .select('player_tourney_id, player_tourneys(player_name)')
            .eq('round_id', roundId)
        ]);

        const roundMeta = roundResponse.data;
        const siblingPlayers = allPlayersInRoundResponse.data;

        if (!roundMeta || !siblingPlayers) return;

        // Map out the updated names array for formatRoundName
        const playerNames = siblingPlayers
          .map((p: any) => {
            // If it's the player being modified, inject the new name immediately in memory
            if (p.player_tourney_id === playerTourneyId) {
              return newName;
            }
            
            const tourneyInfo = Array.isArray(p.player_tourneys)
              ? p.player_tourneys[0]
              : p.player_tourneys;

            return tourneyInfo?.player_name;
          })
          .filter(Boolean) as string[];

        // Re-generate the round name
        const updatedRoundTitle = formatRoundName(roundMeta.name, playerNames);
        
        // Push the update to Supabase only if the title structure actually changed
        if (updatedRoundTitle && updatedRoundTitle !== roundMeta.name) {
          await handleUpdateRoundName(roundId, updatedRoundTitle);
        }
      })
    );
  } catch (cascadeError) {
    console.error('Failed to cascade player name change to match rounds:', cascadeError);
  }
}