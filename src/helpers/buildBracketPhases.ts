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
  isLosers: boolean; // derived from advancements, not the pool name (TOs can rename pools)
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

  const winnerRuleFor = (roundId: number) =>
    resolveAdvancementRule(1, advancementsByRoundId.get(roundId) ?? []);
  // rank 2's destination, unless rank 2 just shares the winner's rule (then it isn't a drop-down)
  const loserRuleFor = (roundId: number) => {
    const rule = resolveAdvancementRule(2, advancementsByRoundId.get(roundId) ?? []);
    return rule && rule !== winnerRuleFor(roundId) ? rule : undefined;
  };

  // every round reachable from the given rounds by following winner advancements only
  const followWinners = (startRoundIds: number[]): Set<number> => {
    const reached = new Set<number>();
    const stack = [...startRoundIds];
    while (stack.length) {
      const roundId = stack.pop()!;
      if (reached.has(roundId)) continue;
      reached.add(roundId);
      const next = winnerRuleFor(roundId)?.destination_round_id;
      if (next != null) stack.push(next);
    }
    return reached;
  };

  // Winners side: winners-only paths from the opening rounds (nothing advances into them).
  // Losers side: winners-only paths from wherever a loser drops down to, minus anything the
  // Winners side also reaches (Grand Finals is fed by both). Single Elim has no drop-downs,
  // so nothing lands on the Losers side.
  const roundIdsWithIncoming = new Set(roundAdvancements.map((a) => a.destination_round_id));
  const winnersSideRoundIds = followWinners(
    rounds.filter((r) => !roundIdsWithIncoming.has(r.id)).map((r) => r.id),
  );
  const losersSideRoundIds = followWinners(
    rounds.flatMap((r) => loserRuleFor(r.id)?.destination_round_id ?? []),
  );
  const isLosersRound = (roundId: number) =>
    losersSideRoundIds.has(roundId) && !winnersSideRoundIds.has(roundId);

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

      const winnerRule = winnerRuleFor(round.id);
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
      const loserRule = loserRuleFor(round.id);
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
      isLosers: poolRounds.some((r) => isLosersRound(r.id)),
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
