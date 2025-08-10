import { Heading } from "@chakra-ui/react"
import type { Chart } from "../types/Chart"

const charts: Chart[] = [
  { id: 1, created_at: "", name_en: "1950", level: 27, type: "Double" },
  { id: 2, created_at: "", name_en: "1949", level: 28, type: "Double" },
  { id: 3, created_at: "", name_en: "1948", level: 29, type: "Double" },
  { id: 4, created_at: "", name_en: "1947", level: 30, type: "Double" },
  { id: 5, created_at: "", name_en: "1946", level: 31, type: "Double" },
  { id: 6, created_at: "", name_en: "1945", level: 32, type: "Double" },
  { id: 7, created_at: "", name_en: "1944", level: 33, type: "Double" },
  { id: 8, created_at: "", name_en: "1943", level: 34, type: "Double" },
  { id: 9, created_at: "", name_en: "1942", level: 35, type: "Double" },
  { id: 10, created_at: "", name_en: "1941", level: 36, type: "Double" },
  { id: 11, created_at: "", name_en: "1940", level: 37, type: "Double" },
  { id: 12, created_at: "", name_en: "1939", level: 38, type: "Double" },
  { id: 13, created_at: "", name_en: "1938", level: 39, type: "Double" },
  { id: 14, created_at: "", name_en: "1937", level: 40, type: "Double" },
  { id: 15, created_at: "", name_en: "1936", level: 41, type: "Double" },
  { id: 16, created_at: "", name_en: "1935", level: 42, type: "Double" },
  { id: 17, created_at: "", name_en: "1934", level: 43, type: "Double" },
  { id: 18, created_at: "", name_en: "1933", level: 44, type: "Double" },
  { id: 19, created_at: "", name_en: "1932", level: 45, type: "Double" },
  { id: 20, created_at: "", name_en: "1931", level: 46, type: "Double" },
]

function ChartsPage() {
  // const { data: charts, loading, error } = getSupabaseTable<Chart>('charts');

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <Heading size="2xl">All Charts</Heading>
      <ul>
        {charts.map((chart: Chart) => (
          <li key={chart.id}>
            {chart.id}: {chart.name_en} ({chart.type} {chart.level})
          </li>
        ))}
      </ul>
    </>
  )
}

export default ChartsPage
