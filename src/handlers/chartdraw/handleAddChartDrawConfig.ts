import { supabaseClient } from "../../lib/supabaseClient";
import type { ChartdrawConfig } from "../../types/ChartDrawConfig";

export async function handleAddChartDrawConfig(
  tourneyId: number,
  name: string,
  containsArcade: boolean = true,
  containsShortcut: boolean = true,
  containsRemix: boolean = true,
  containsFull: boolean = true,
  pickbanRulesetId: number | null = null
): Promise<ChartdrawConfig> {  
  if (!name || !name.trim()) {
    throw new Error("Configuration name cannot be blank.");
  }

  if (!containsArcade && !containsShortcut && !containsRemix && !containsFull) {
    throw new Error("A ruleset configuration must include at least one song category.");
  }

  const { data, error } = await supabaseClient
    .from("chartdraw_configs")
    .insert({
      tourney_id: tourneyId,
      name: name,
      contains_arcade: containsArcade,
      contains_shortcut: containsShortcut,
      contains_remix: containsRemix,
      contains_full: containsFull,
      pickban_ruleset_id: pickbanRulesetId,
    })
    .select()
    .single();

  if (error) {
    // Catch unique_tourney_config_name violation (error code 23505)
    if (error.code === "23505") {
      throw new Error(`A ruleset configuration named "${name}" already exists in this tournament.`);
    }
    throw error;
  }

  return data;
}