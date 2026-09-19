import { supabaseClient } from "../../lib/supabaseClient";
import { formatRoundName } from "../../helpers/formatRoundName";

import type { PlayerTourney } from "../../types/PlayerTourney";
import type { TourneyType } from "../../types/Tourney";

/**
 * Orchestrator for the 3-pass bracket generation process
 */
export async function generateBracketFromTemplate(
  tourneyId: number,
  template: any,
  initialSeeding: (PlayerTourney | null)[][],
  tourneyType: TourneyType | null | undefined
) {
  // initialSeeding[i] is the group of players for the match with seedIndex === i;
  // a 1v1 match's group has length 2, but any group size is supported.
  try {
    // PASS 1: create the structure (Round Pools and Rounds shells)
    const idLookup = await createPoolsAndRounds(tourneyId, template);
    console.log("Pass 1 Complete. ID Map:", idLookup);

    // PASS 2: Link advancement paths (round_advancements rows)
    await linkAdvancementPaths(idLookup, template);
    console.log("Pass 2 Complete. Relationships linked.");

    // PASS 3: Seed initial players into WR1:M1, WR1:M2, etc.
    await seedInitialMatches(idLookup, template, initialSeeding, tourneyType);
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
      status: 'Not Started',
      points_per_stage: template.pointsPerStage
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
 * PASS 2: Inserts round_advancements rows from each match's `advancements` list,
 * resolving each entry's logical `destination` id through idLookup. Generic over any
 * rank-range shape, not just a fixed 1v1 winner/loser pair.
 */
async function linkAdvancementPaths(idLookup: Record<string, number>, template: any) {
  const rowsToInsert: {
    round_id: number;
    rank_start: number;
    rank_end?: number;
    destination_round_id: number;
    label?: string;
  }[] = [];

  for (const pool of template.pools) {
    for (const matchTemplate of pool.matches) {
      const currentDbId = idLookup[matchTemplate.id];

      for (const advancement of matchTemplate.advancements ?? []) {
        const destinationRoundId = idLookup[advancement.destination];
        if (!destinationRoundId) continue;

        rowsToInsert.push({
          round_id: currentDbId,
          rank_start: advancement.rankStart,
          rank_end: advancement.rankEnd,
          destination_round_id: destinationRoundId,
          label: advancement.label
        });
      }
    }
  }

  if (rowsToInsert.length === 0) return;

  const { error } = await supabaseClient
    .from("round_advancements")
    .insert(rowsToInsert);

  if (error) throw error;
}

/**
 * PASS 3: Inserts player_rounds records for the very first round of the bracket.
 * Uses the template's pools[]matches[].seedIndex property to determine which matches need initial seeding
 * Uses the initialSeeding array to get the player data (these should be in the same order as the seedIndex values)
 */
export async function seedInitialMatches(
  idLookup: Record<string, number>,
  template: any,
  initialSeeding: (PlayerTourney | null)[][],
  tourneyType: TourneyType | null | undefined
) {
  const seedInserts: { round_id: number; player_tourney_id: number }[] = [];
  const nameUpdatePromises = [];

  // Iterate through all matches in all pools
  for (const pool of template.pools) {
    for (const matchTemplate of pool.matches) {
      
      // Check if this match is marked for initial seeding
      if (typeof matchTemplate.seedIndex === 'number') {
        const roundId = idLookup[matchTemplate.id];
        const playerPair = initialSeeding[matchTemplate.seedIndex];

        if (roundId && playerPair) {
          const validPlayers = playerPair.filter((p): p is PlayerTourney => p !== null);
          validPlayers.forEach(player => {
            seedInserts.push({
              round_id: roundId,
              player_tourney_id: player.id
            });
          });
          const newName = formatRoundName(
            matchTemplate.id,
            validPlayers.map(p => p.player_name),
            tourneyType,
            true
          );
          nameUpdatePromises.push(
            supabaseClient
              .from("rounds")
              .update({ name: newName })
              .eq("id", roundId)
          );
        }
      }
    }
  }

  if (seedInserts.length > 0) {
    const { error: seedErr } = await supabaseClient
      .from("player_rounds")
      .insert(seedInserts);
    if (seedErr) throw seedErr;

    const results = await Promise.all(nameUpdatePromises);
    const firstError = results.find(r => r.error);
    if (firstError) throw firstError.error;
  }
}