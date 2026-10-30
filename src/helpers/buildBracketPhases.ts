import { resolveAdvancementRule } from "./resolveAdvancementDestination";

import type { Round } from "../types/Round";
import type { RoundPool } from "../types/RoundPool";
import type { PlayerRound } from "../types/PlayerRound";
import type { RoundAdvancement } from "../types/RoundAdvancement";

/** Points at another match in the bracket, for quick-nav between rounds. */
export interface BracketMatchRef {
  roundId: number;
  matchIndex: number;
  phaseName: string;
}

export interface BracketMatch {
  round: Round;
  matchIndex: number; // 1-based position within the pool, for "Match N"
  players: PlayerRound[]; // sorted by sort_order ascending
  advanceToPhaseName?: string; // winner's destination pool name, if resolvable
  advanceToRoundId?: number; // winner's destination ROUND id, used to group matches that feed the same next match
  winnerTo?: BracketMatchRef; // where the winner goes
  loserTo?: BracketMatchRef; // where the loser drops down to (Winners side of Double Elim only)
  loserFrom: BracketMatchRef[]; // Winners matches whose losers drop into this one, in bracket order
}

export interface BracketPhase {
  pool: RoundPool;
  matches: BracketMatch[];
  pairedPoolId?: number; // paired Losers pool (from a Winners phase) or paired Winners pool (from a Losers phase)
  isLosers: boolean; // derived from advancements, not the pool name (TOs can rename pools)
}

/**
 * Groups rounds into their round_pool "phases" (Winners Round 1, Losers
 * Semis, etc.) in bracket order, each carrying its matches (one per round)
 * with player names and a winner's "advance to" phase name already
 * resolved — and, where derivable, the paired phase on the other side
 * (used by the carousel's Winners | Losers toggle).
 *
 * There's no stored Winners<->Losers pool link, so the pairing is derived
 * from round_advancements: a Winners pool pairs with whichever pool the
 * first resolvable rank-2 (loser) advancement in that pool points into, and
 * that Losers pool pairs back. Every match in one Winners pool sends its
 * loser into the same Losers pool in this app's bracket templates, so the
 * first resolvable match is representative. Losers pools with no drop-ins,
 * and all of Single Elimination (no rank-2 rows), stay unpaired.
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

  const roundsInPool = (poolId: number) =>
    rounds.filter((r) => r.round_pool_id === poolId).sort((a, b) => a.id - b.id);

  // every pooled round's "Match N" + phase name, so a match can point at any other one
  const matchRefsByRoundId = new Map<number, BracketMatchRef>();
  for (const pool of sortedPools) {
    roundsInPool(pool.id).forEach((round, idx) => {
      matchRefsByRoundId.set(round.id, { roundId: round.id, matchIndex: idx + 1, phaseName: pool.name });
    });
  }
  const matchRefFor = (roundId: number | undefined) =>
    roundId != null ? matchRefsByRoundId.get(roundId) : undefined;

  // reverse of loserTo; built in bracket order since the map above was filled in that order
  const loserFromByRoundId = new Map<number, BracketMatchRef[]>();
  for (const ref of matchRefsByRoundId.values()) {
    const dropTo = loserRuleFor(ref.roundId)?.destination_round_id;
    if (dropTo == null) continue;
    const existing = loserFromByRoundId.get(dropTo);
    if (existing) existing.push(ref);
    else loserFromByRoundId.set(dropTo, [ref]);
  }

  const phases: BracketPhase[] = sortedPools.map((pool) => {
    const poolRounds = roundsInPool(pool.id);

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
        winnerTo: matchRefFor(winnerRule?.destination_round_id),
        loserTo: matchRefFor(loserRuleFor(round.id)?.destination_round_id),
        loserFrom: loserFromByRoundId.get(round.id) ?? [],
      };
    });

    // First match in the pool whose loser (rank 2) advances somewhere tells
    // us the paired Losers pool for this whole phase.
    let pairedPoolId: number | undefined;
    for (const round of poolRounds) {
      const loserRule = loserRuleFor(round.id);
      if (!loserRule) continue;
      const destinationRound = roundsById.get(loserRule.destination_round_id);
      if (destinationRound?.round_pool_id != null) {
        pairedPoolId = destinationRound.round_pool_id;
        break;
      }
    }

    return {
      pool,
      matches,
      pairedPoolId,
      isLosers: poolRounds.some((r) => isLosersRound(r.id)),
    };
  });

  // Reverse map: wherever a Winners phase points at a Losers phase, pair that
  // Losers phase back. Snapshot the forward pairs first so pairs set here
  // aren't mistaken for forward ones later in the loop.
  const phasesByPoolId = new Map(phases.map((phase) => [phase.pool.id, phase]));
  const forwardPairs = phases.filter((phase) => phase.pairedPoolId != null);
  for (const phase of forwardPairs) {
    const targetPhase = phasesByPoolId.get(phase.pairedPoolId!);
    if (targetPhase && targetPhase.pairedPoolId == null) {
      targetPhase.pairedPoolId = phase.pool.id;
    }
  }

  return phases;
}
