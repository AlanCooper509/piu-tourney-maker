import { supabaseClient } from "../../lib/supabaseClient";
import type { ChartdrawConfig } from "../../types/ChartDrawConfig";

export async function handleEditChartDrawConfig(
  configId: number,
  name: string,
  containsArcade: boolean,
  containsShortcut: boolean,
  containsRemix: boolean,
  containsFull: boolean
): Promise<ChartdrawConfig> {
  
  if (!name || !name.trim()) {
    throw new Error("Configuration name cannot be blank.");
  }

  if (!containsArcade && !containsShortcut && !containsRemix && !containsFull) {
    throw new Error("A ruleset configuration must include at least one song category.");
  }

  const { data, error } = await supabaseClient
    .from("chartdraw_configs")
    .update({
      name: name,
      contains_arcade: containsArcade,
      contains_shortcut: containsShortcut,
      contains_remix: containsRemix,
      contains_full: containsFull,
    })
    .eq("id", configId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`A ruleset configuration named "${name}" already exists.`);
    }
    throw error;
  }

  return data;
}