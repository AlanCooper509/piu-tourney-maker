import { useParams } from "react-router-dom";
// import getSupabaseTable from "../hooks/getSupabaseTable";
import type { Chart } from "../types/Chart"
import type { ChartPool } from "../types/ChartPool"
import { Heading, Button } from "@chakra-ui/react";
import { useState } from "react";

// 1948.png
// Appassionata.png
// BOOOM!!.png
// Crimson hood.png
// Doppelganger.png
// Hercules.png
// KUGUTSU.png
// Murdoch.png
// Neo Catharsis.png
// wither garden.png

const charts: Chart[] = [
  { id: 1, created_at: "", name_en: "1948", name_kr: null, level: 29, type: "Double", image_url: "art/1948.png" },
]

const chartPools: ChartPool[] = [
  { id: 1, created_at: "", stage_id: 1234, chart_id: 1 },
  { id: 2, created_at: "", stage_id: 1234, chart_id: 2 },
  { id: 3, created_at: "", stage_id: 1234, chart_id: 4 },
  { id: 4, created_at: "", stage_id: 1234, chart_id: 8 },
  { id: 5, created_at: "", stage_id: 1234, chart_id: 16 },
  { id: 6, created_at: "", stage_id: 1234, chart_id: 32 },
]

function ChartPoolPage() {
  const { tourneyId, roundId, stageId } = useParams();

  // TODO: how to initialize as undefined? can't get conditional rendering working
  const [pickedChart, setPickedChart] = useState<Chart>(
    { id: -1, created_at: "", name_en: "", level: 0, type: "Single" },
  );

  // const { data: chart_pools, loading, error } = getSupabaseTable<ChartPool>('chart_pools',
  //   { column: 'stage_id', value: stageId }
  // );
  //
  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error.message}</p>;

  const pooledCharts: Chart[] = chartPools.map((row: ChartPool) => {
    const chart = charts.find((chart: Chart) => chart.id == row.chart_id)
    return chart
  }).filter((chart: Chart | undefined) => chart !== undefined);

  function pickChart() {
    const index = Math.floor(Math.random() * pooledCharts.length);
    setPickedChart(pooledCharts[index]);
  }

  return (
    <>
      <Heading size="2xl">Chart Pool</Heading>
      <Heading size="lg" mb="6">(Tournament Name for {tourneyId}) | (Round Name for {roundId}) | (Stage Name for {stageId})</Heading>
      <ul>
        {pooledCharts.map((chart: Chart) =>
          <li key={chart.id}>
            {chart.id}: {chart.name_en} ({chart.type} {chart.level})
          </li>
        )}
      </ul>

      <Button onClick={pickChart} variant="subtle">Pick Chart</Button>

      <Heading>
        {
          pickedChart.id >= 0
            ? <>*really cool animation* Picked {pickedChart.name_en} ({pickedChart.type} {pickedChart.level})!</>
            : <></>
        }
      </Heading>

    </>
  )
}

export default ChartPoolPage
