import { supabaseClient } from "../../lib/supabaseClient";

export interface SequenceStepInput {
  action: "PICK" | "BAN" | "PROTECT" | "AUTOPICK" | "IGNORE";
  actor: "Higher Seed" | "Lower Seed" | "Automation";
}

export async function handleAddPickBanFlow(
  tourneyId: number,
  rulesetName: string,
  steps: SequenceStepInput[],
  chartdrawConfigId?: number
) {
  // 1. Insert the parent record to get the generated ruleset ID
  const { data: rulesetData, error: rulesetError } = await supabaseClient
    .from("pickban_rulesets")
    .insert({
      tourney_id: tourneyId,
      name: rulesetName.trim(),
    })
    .select("id")
    .single();

  if (rulesetError) {
    if (rulesetError.code === "23505") {
      throw new Error(`A ruleset named "${rulesetName}" already exists for this tournament.`);
    }
    throw rulesetError;
  }

  const newRulesetId = rulesetData.id;

  // 2. Map steps & replace non-seed actors with null
  const sequencePayload = steps.map((step, idx) => ({
    pickban_ruleset_id: newRulesetId,
    action: step.action,
    // if it's not a seed type, normalize it to null (to match ENUM type on db layer)
    actor: ["Higher Seed", "Lower Seed"].includes(step.actor) ? step.actor : null,
    sequence: idx + 1,
  }));

  // 3. Bulk insert the steps into your child sequence table
  const { data: stepsData, error: stepsError } = await supabaseClient
    .from("pickban_ruleset_steps")
    .insert(sequencePayload)
    .select();

  if (stepsError) {
    throw stepsError;
  }

  // 4. Link the new ruleset back to the chartdraw configuration if an ID was passed
  let updatedConfig = null;
  if (chartdrawConfigId) {
    const { data: configData, error: configError } = await supabaseClient
      .from("chartdraw_configs")
      .update({ pickban_ruleset_id: newRulesetId })
      .eq("id", chartdrawConfigId)
      .select()
      .single();

    if (configError) {
      throw configError;
    }
    updatedConfig = configData;
  }

  return { ruleset: rulesetData, steps: stepsData };
}