import { supabaseClient } from "../../lib/supabaseClient";
import type { PlayerTourney } from "../../types/PlayerTourney";

/**
 * Orchestrator for the 3-pass bracket generation process
 */
export async function generateBracketFromTemplate(
  tourneyId: number,
  template: any,
  initialSeeding: (PlayerTourney | null)[][]
) {
  try {
    // PASS 1: create the structure (Round Pools and Rounds shells)
    const idLookup = await createPoolsAndRounds(tourneyId, template);
    console.log("Pass 1 Complete. ID Map:", idLookup);

    // PASS 2: Link advancement paths (rounds.next_round_id, rounds.lost_next_round_id)
    await linkAdvancementPaths(idLookup, template);
    console.log("Pass 2 Complete. Relationships linked.");

    // PASS 3: Seed initial players into WR1:M1, WR1:M2, etc.
    await seedInitialMatches(idLookup, template, initialSeeding as [PlayerTourney | null, PlayerTourney | null][]);
    console.log("Pass 3 Complete. Players seeded.");

    return true;
  } catch (error) {
    console.error("Bracket Generation Failed:", error);
    throw error; // Re-throw so the UI handler can catch it and show a toast
  }
}

/**
 * PASS 1: Creates round_pools and rounds.
 * Returns a lookup map connecting Template IDs (e.g. "WR1:M1") to Database IDs.
 */
async function createPoolsAndRounds(tourneyId: number, template: any): Promise<Record<string, number>> {
  const idLookup: Record<string, number> = {};

  for (const poolTemplate of template.pools) {
    // 1. Create the Round Pool
    const { data: pool, error: poolErr } = await supabaseClient
      .from("round_pools")
      .insert({
        tourney_id: tourneyId,
        name: poolTemplate.name,
      })
      .select()
      .single();

    if (poolErr) throw poolErr;

    // 2. Prepare the rounds (matches) for this pool
    const roundsToInsert = poolTemplate.matches.map((m: any) => ({
      tourney_id: tourneyId,
      round_pool_id: pool.id,
      name: m.id, // Using the Logical ID as the initial name for mapping
      players_advancing: 1,
      status: 'Not Started'
    }));

    // 3. Insert all matches for this pool at once
    const { data: createdRounds, error: roundErr } = await supabaseClient
      .from("rounds")
      .insert(roundsToInsert)
      .select();

    if (roundErr) throw roundErr;

    // 4. Map returned DB IDs back to the Logical IDs
    createdRounds.forEach((dbRound) => {
      idLookup[dbRound.name] = dbRound.id;
    });
  }

  return idLookup;
}

/**
 * PASS 2: Updates the rounds with their next_round_id and lost_next_round_id links.
 */
async function linkAdvancementPaths(idLookup: Record<string, number>, template: any) {
  const updatePromises = [];

  for (const pool of template.pools) {
    for (const matchTemplate of pool.matches) {
      const currentDbId = idLookup[matchTemplate.id];
      const updates: any = {};

      if (matchTemplate.next) {
        updates.next_round_id = idLookup[matchTemplate.next] || null;
      }

      if (matchTemplate.loser) {
        updates.lost_next_round_id = idLookup[matchTemplate.loser] || null;
      }

      if (Object.keys(updates).length > 0) {
        updatePromises.push(
          supabaseClient
            .from("rounds")
            .update(updates)
            .eq("id", currentDbId)
        );
      }
    }
  }

  const results = await Promise.all(updatePromises);
  const firstError = results.find(r => r.error);
  if (firstError) throw firstError.error;
}

/**
 * PASS 3: Inserts player_rounds records for the very first round of the bracket.
 * Uses the template's pools[]matches[].seedIndex property to determine which matches need initial seeding
 * Uses the initialSeeding array to get the player data (these should be in the same order as the seedIndex values)
 */
export async function seedInitialMatches(
  idLookup: Record<string, number>, 
  template: any,
  initialSeeding: [PlayerTourney | null, PlayerTourney | null][]
) {
  const seedInserts: { round_id: number; player_tourney_id: number }[] = [];

  // Iterate through all matches in all pools
  for (const pool of template.pools) {
    for (const matchTemplate of pool.matches) {
      
      // Check if this match is marked for initial seeding
      if (typeof matchTemplate.seedIndex === 'number') {
        const roundId = idLookup[matchTemplate.id];
        const playerPair = initialSeeding[matchTemplate.seedIndex];

        if (roundId && playerPair) {
          playerPair.forEach(player => {
            if (player) {
              seedInserts.push({
                round_id: roundId,
                player_tourney_id: player.id
              });
            }
          });
        }
      }
    }
  }

  if (seedInserts.length > 0) {
    const { error } = await supabaseClient
      .from("player_rounds")
      .insert(seedInserts);
    
    if (error) throw error;
  }
}