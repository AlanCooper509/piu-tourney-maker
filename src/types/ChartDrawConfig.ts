import type { ChartType } from "./ChartType";

export interface ChartdrawConfig {
  id: number;
  tourney_id: number;
  pickban_ruleset_id: number | null;
  name: string;
  contains_arcade: boolean;
  contains_shortcut: boolean;
  contains_remix: boolean;
  contains_full: boolean;
  created_at: string;
}

export interface ChartdrawConfigSpec {
  id: number;
  chartdraw_config_id: number;
  chart_type: ChartType;
  level: number;
  quantity: number;
  group: number | null;
  created_at: string;
}

export interface ChartdrawConfigWithSpecs extends ChartdrawConfig {
  chartdraw_config_specs: ChartdrawConfigSpec[];
}