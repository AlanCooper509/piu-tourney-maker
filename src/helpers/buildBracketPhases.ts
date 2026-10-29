import { resolveAdvancementRule } from "./resolveAdvancementDestination";

import type { Round } from "../types/Round";
import type { RoundPool } from "../types/RoundPool";
import type { PlayerRound } from "../types/PlayerRound";
import type { RoundAdvancement } from "../types/RoundAdvancement";

export interface BracketMatch {
  round: Round;
  matchIndex: number; // 1-based position within the pool, for "Match N"
  players: PlayerRound[]; // sorted by sort_order ascending
  advanceToPhaseName?: string; // winner's destination pool name, if resolvable
  advanceToRoundId?: number; // winner's destination ROUND id, used to group matches that feed the same next match
}

export interface BracketPhase {
  pool: RoundPool;
  matches: BracketMatch[];
  switchTargetPoolId?: number; // paired Losers pool (from a Winners phase) or paired Winners pool (from a Losers phase)
  switchLabel?: "Losers" | "Winners";
}

/** Heuristic, not a stored flag: bracket pool names are hand-authored,
 * literal strings ("Winners Round 1", "Losers Round 1", ...), so a
 * case-insensitive "loser" match reliably identifies the losers side. */
export function isLosersPhase(phase: BracketPhase): boolean {
  return /loser/i.test(phase.pool.name);
}

/**
 * Groups rounds into their round_pool "phases" (Winners Round 1, Losers
 * Semis, etc.) in bracket order, each carrying its matches (one per round)
 * with player names and a winner's "advance to" phase name already
 * resolved — and, where derivable, a Winners<->Losers switch target.
 *
 * There's no stored Winners<->Losers pool link, so the pairing is derived
 * from round_advancements: a pool's "switch to Losers" target is whichever
 * pool the first resolvable rank-2 (loser) advancement in that pool points
 * into. Every match in one Winners pool sends its loser into the same
 * Losers pool in this app's bracket templates, so the first resolvable
 * match is representative. Single Elimination brackets have no rank-2 rows
 * at all, so this naturally stays unset and no switch button renders.
 */
export function buildBracketPhases(
  rounds: Round[],
  roundPools: RoundPool[],
  playerRounds: PlayerRound[],
  roundAdvancements: RoundAdvancement[],
): BracketPhase[] {
  const roundsById = new Map(rounds.map((r) => [r.id, r]));
  const poolsById = new Map(roundPools.map((p) => [p.id, p]));
  const advancementsByRoundId = new Map<number, RoundAdvancement[]>();
  for (const advancement of roundAdvancements) {
    const existing = advancementsByRoundId.get(advancement.round_id);
    if (existing) existing.push(advancement);
    else advancementsByRoundId.set(advancement.round_id, [advancement]);
  }

  const sortedPools = [...roundPools].sort(
    (a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id),
  );

  const phases: BracketPhase[] = sortedPools.map((pool) => {
    const poolRounds = rounds
      .filter((r) => r.round_pool_id === pool.id)
      .sort((a, b) => a.id - b.id);

    const matches: BracketMatch[] = poolRounds.map((round, idx) => {
      const players = playerRounds
        .filter((pr) => pr.round_id === round.id)
        .sort((a, b) => a.sort_order - b.sort_order);

      const roundAdvancementsForRound = advancementsByRoundId.get(round.id) ?? [];
      const winnerRule = resolveAdvancementRule(1, roundAdvancementsForRound);
      const destinationRound = winnerRule
        ? roundsById.get(winnerRule.destination_round_id)
        : undefined;
      const destinationPool = destinationRound?.round_pool_id
        ? poolsById.get(destinationRound.round_pool_id)
        : undefined;

      return {
        round,
        matchIndex: idx + 1,
        players,
        advanceToPhaseName: destinationPool?.name,
        advanceToRoundId: destinationRound?.id,
      };
    });

    // First match in the pool whose loser (rank 2) advances somewhere tells
    // us the paired Losers pool for this whole phase.
    let switchTargetPoolId: number | undefined;
    for (const round of poolRounds) {
      const loserRule = resolveAdvancementRule(2, advancementsByRoundId.get(round.id) ?? []);
      if (!loserRule) continue;
      const destinationRound = roundsById.get(loserRule.destination_round_id);
      if (destinationRound?.round_pool_id != null) {
        switchTargetPoolId = destinationRound.round_pool_id;
        break;
      }
    }

    return {
      pool,
      matches,
      switchTargetPoolId,
      switchLabel: switchTargetPoolId != null ? "Losers" : undefined,
    };
  });

  // Reverse map: wherever a Winners phase points at a Losers phase, give
  // that Losers phase a "Switch to Winners" pointing back.
  const phasesByPoolId = new Map(phases.map((phase) => [phase.pool.id, phase]));
  for (const phase of phases) {
    if (phase.switchLabel !== "Losers" || phase.switchTargetPoolId == null) continue;
    const targetPhase = phasesByPoolId.get(phase.switchTargetPoolId);
    if (targetPhase && targetPhase.switchTargetPoolId == null) {
      targetPhase.switchTargetPoolId = phase.pool.id;
      targetPhase.switchLabel = "Winners";
    }
  }

  return phases;
}
