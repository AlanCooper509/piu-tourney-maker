import type { PlayerTourney } from "../../types/PlayerTourney";

export interface SingleStreamTemplateOptions {
  players: PlayerTourney[];
  groupSize: number;
  directAdvancers: number;
  redemptionAdvancers: number; // 0 disables redemption entirely (Gauntlet)
}

interface TemplateMatch {
  id: string;
  seedIndex?: number;
  advancements?: { rankStart: number; rankEnd?: number; destination: string; label: string }[];
}

interface TemplatePool {
  name: string;
  matches: TemplateMatch[];
}

export interface SingleStreamTemplateResult {
  template: { pools: TemplatePool[] };
  initialSeeding: (PlayerTourney | null)[][];
}

function sortBySeed(players: PlayerTourney[]): PlayerTourney[] {
  const seeded = players
    .filter(p => typeof p.seed === "number")
    .sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0));
  const unseeded = players.filter(p => typeof p.seed !== "number");
  // Worst seed (and any unseeded player, treated as worse than the lowest
  // seed) enters Round 1 first; the best seeds enter last, in later stages.
  return [...seeded, ...unseeded].reverse();
}

/**
 * Builds a single-stream Gauntlet/Waterfall template: a linear chain of "stages," each
 * a group of `groupSize` players. The top `directAdvancers` advance straight to the next
 * stage. If `redemptionAdvancers > 0`, everyone else in the group instead plays a
 * redemption round together, and the top `redemptionAdvancers` of THAT round also
 * advance -- otherwise (Gauntlet) they're simply eliminated. Each stage after the first
 * is topped back up to `groupSize` with fresh players; the carried-over survivors from
 * the previous stage aren't known until it's actually played, so only the fresh portion
 * of each stage is pre-seeded (via the same seedIndex mechanism used for round 1) --
 * the rest fills in naturally through normal round-advancement routing during play.
 */
export function generateSingleStreamTemplate({
  players,
  groupSize,
  directAdvancers,
  redemptionAdvancers,
}: SingleStreamTemplateOptions): SingleStreamTemplateResult {
  if (groupSize < 2) throw new Error("Group size must be at least 2.");
  if (directAdvancers < 1) throw new Error("At least 1 player must advance from each group.");
  if (directAdvancers + redemptionAdvancers >= groupSize) {
    throw new Error("Advancers per group (direct + redemption) must be fewer than the group size.");
  }
  if (players.length < groupSize) {
    throw new Error(`Need at least ${groupSize} players to fill a single group.`);
  }

  const queue = sortBySeed(players);
  const pools: TemplatePool[] = [];
  const initialSeeding: (PlayerTourney | null)[][] = [];

  let stageNumber = 1;
  let carryOverCount = 0;
  let previousMainId: string | null = null;
  let previousRedemptionId: string | null = null;

  while (queue.length > 0) {
    const freshNeeded = Math.max(groupSize - carryOverCount, 0);
    const freshPlayers = queue.splice(0, freshNeeded);

    const mainId = `Round ${stageNumber}`;
    const mainMatch: TemplateMatch = { id: mainId };

    if (freshPlayers.length > 0) {
      mainMatch.seedIndex = initialSeeding.length;
      initialSeeding.push(freshPlayers);
    }

    if (previousMainId) {
      linkStage(pools, previousMainId, previousRedemptionId, mainId, directAdvancers, redemptionAdvancers);
    }

    const matches: TemplateMatch[] = [mainMatch];
    const redemptionId = redemptionAdvancers > 0 ? `${mainId} Redemption` : null;
    if (redemptionId) {
      matches.push({ id: redemptionId });
    }

    pools.push({ name: mainId, matches });

    previousMainId = mainId;
    previousRedemptionId = redemptionId;
    carryOverCount = directAdvancers + redemptionAdvancers;
    stageNumber++;
  }

  // No fresh players remain, but more than one survivor still needs a decider round
  if (carryOverCount > 1 && previousMainId) {
    const finalId = "Final";
    linkStage(pools, previousMainId, previousRedemptionId, finalId, directAdvancers, redemptionAdvancers);
    pools.push({ name: finalId, matches: [{ id: finalId }] });
  }

  return { template: { pools }, initialSeeding };
}

function linkStage(
  pools: TemplatePool[],
  mainId: string,
  redemptionId: string | null,
  destinationId: string,
  directAdvancers: number,
  redemptionAdvancers: number
) {
  const pool = pools.find(p => p.matches.some(m => m.id === mainId))!;

  const winnerLabel = directAdvancers > 1 ? "Winners" : "Winner";
  const mainAdvancements: NonNullable<TemplateMatch["advancements"]> = [
    { rankStart: 1, rankEnd: directAdvancers, destination: destinationId, label: winnerLabel },
  ];

  // Everyone who doesn't advance directly falls to the redemption round
  // instead of being silently eliminated, when this format has one.
  if (redemptionId) {
    mainAdvancements.push({
      rankStart: directAdvancers + 1,
      destination: redemptionId,
      label: "Redemption",
    });
  }

  pool.matches.find(m => m.id === mainId)!.advancements = mainAdvancements;

  if (redemptionId) {
    const redemptionWinnerLabel = redemptionAdvancers > 1 ? "Winners" : "Winner";
    pool.matches.find(m => m.id === redemptionId)!.advancements = [
      { rankStart: 1, rankEnd: redemptionAdvancers, destination: destinationId, label: redemptionWinnerLabel },
    ];
  }
}
