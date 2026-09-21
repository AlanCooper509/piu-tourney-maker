import phoenix_v2_12_0 from "./charts/phoenix/charts-v2_12_0.json"
import phoenix2_v1_01_0 from "./charts/phoenix2/charts-v1_01_0.json"
import smxCharts from "./charts/smx/charts.json"
import type { Chart } from "../types/Chart";
import type { SmxChart } from "../types/SmxChart";

export const CHARTS_BY_GAME_ID: Record<number, Chart[]> = {
  1: phoenix_v2_12_0 as Chart[],
  2: phoenix2_v1_01_0 as Chart[],
};

export const CHART_SOURCE_BY_GAME_ID: Record<
  number,
  { kind: 'piu'; charts: Chart[] } | { kind: 'smx'; charts: SmxChart[] }
> = {
  1: { kind: 'piu', charts: phoenix_v2_12_0 as Chart[] },
  2: { kind: 'piu', charts: phoenix2_v1_01_0 as Chart[] },
  3: { kind: 'smx', charts: smxCharts as SmxChart[] },
};