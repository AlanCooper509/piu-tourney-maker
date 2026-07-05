// handlers/pickban/executePickBanFlow.ts
import { handlePickBanAction } from "./handlePickBanAction";
import sortPlayersBySeed from "../../helpers/sortPlayersBySeed";
import type { PickbanRulesetWithSteps, PickbanAction } from "../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../types/ChartDrawEntry";
import type { PlayerRound } from "../../types/PlayerRound";

interface HandleExecutePickBanFlowParams {
  initialEntryId: number;
  pickbanRuleset: PickbanRulesetWithSteps;
  chartdrawEntries: ChartdrawEntryWithDetails[];
  players: PlayerRound[];
  currentStepIndex: number; // current pbStep
}

const getActorPlayerId = (actor: string | null, players: PlayerRound[]): number | null => {
  if (!actor || actor === "Automation" || !players || players.length < 2) return null;
  const sorted = sortPlayersBySeed(players);
  if (actor === "Higher Seed") return sorted[0]?.id || null;
  if (actor === "Lower Seed") return sorted[1]?.id || null;
  return null;
};

export async function handleExecutePickBanFlow({
  initialEntryId,
  pickbanRuleset,
  chartdrawEntries,
  players,
  currentStepIndex,
}: HandleExecutePickBanFlowParams) {
  const steps = pickbanRuleset.pickban_ruleset_steps || [];
  let workingEntries = [...chartdrawEntries];
  let localStepIndex = currentStepIndex;

  // Track all modifications to return them back to local React state (including play_order)
  const updatedEntriesMap: Record<
    number,
    { action: PickbanAction; player_round_id: number | null; play_order: number | null }
  > = {};

  // 1. Process the manual user action first
  const currentRule = steps[localStepIndex];
  if (!currentRule) return updatedEntriesMap;

  // Calculate play_order if this is a pick action
  let initialPlayOrder: number | null = null;
  if (currentRule.action === "PICK" || currentRule.action === "AUTOPICK") {
    const currentPickedCount = workingEntries.filter(
      e => e.action === "PICK" || e.action === "AUTOPICK"
    ).length;
    initialPlayOrder = currentPickedCount + 1;
  }

  const targetPlayerId = getActorPlayerId(currentRule.actor, players);
  await handlePickBanAction({
    chartdrawEntriesId: initialEntryId,
    playerRoundId: targetPlayerId,
    action: currentRule.action,
    sequence: localStepIndex + 1,
    playOrder: initialPlayOrder,
  });

  // Save the state change locally for tracking
  updatedEntriesMap[initialEntryId] = {
    action: currentRule.action,
    player_round_id: targetPlayerId,
    play_order: initialPlayOrder
  };

  // Update working array so automation calculates counters and remaining charts accurately
  workingEntries = workingEntries.map(e =>
    e.id === initialEntryId
      ? { ...e, action: currentRule.action, play_order: initialPlayOrder }
      : e
  );
  localStepIndex++;

  // 2. Cascade loop through following AUTOPICK / IGNORE automation items
  while (localStepIndex < steps.length) {
    const nextRule = steps[localStepIndex];
    if (!nextRule || (nextRule.action !== "AUTOPICK" && nextRule.action !== "IGNORE")) {
      break;
    }

    const availableCard = workingEntries
      .filter(e => e.action === null)
      .sort((a, b) => a.draw_order - b.draw_order)[0];

    if (!availableCard) {
      console.warn("Automation step triggered, but no available charts are left!");
      break;
    }

    // Calculate play_order if the automation step is an autopick
    let autoPlayOrder: number | null = null;
    if (nextRule.action === "AUTOPICK") {
      const currentPickedCount = workingEntries.filter(
        e => e.action === "PICK" || e.action === "AUTOPICK"
      ).length;
      autoPlayOrder = currentPickedCount + 1;
    }

    const autoPlayerId = getActorPlayerId(nextRule.actor, players);

    await handlePickBanAction({
      chartdrawEntriesId: availableCard.id,
      playerRoundId: autoPlayerId,
      action: nextRule.action,
      sequence: localStepIndex + 1,
      playOrder: autoPlayOrder,
    });

    updatedEntriesMap[availableCard.id] = {
      action: nextRule.action,
      player_round_id: autoPlayerId,
      play_order: autoPlayOrder
    };

    workingEntries = workingEntries.map(e =>
      e.id === availableCard.id
        ? { ...e, action: nextRule.action, play_order: autoPlayOrder }
        : e
    );
    localStepIndex++;
  }

  return updatedEntriesMap;
}