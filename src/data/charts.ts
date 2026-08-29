import phoenix_v2_12_0 from "./charts/phoenix/charts-v2_12_0.json"
import phoenix2_v1_03_0 from "./charts/phoenix2/charts-v1_03_0.json"
import type { Chart } from "../types/Chart";

export const CHARTS_BY_GAME_ID: Record<number, Chart[]> = {
  1: phoenix_v2_12_0 as Chart[],
  2: phoenix2_v1_03_0 as Chart[],
};