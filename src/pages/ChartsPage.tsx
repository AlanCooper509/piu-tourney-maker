import { Flex } from "@chakra-ui/react"
import type { Chart } from "../types/Chart"
import { ChartCard } from "../components/chart/ChartCard"
import { ChartRow } from "../components/chart/ChartRow";

const charts: Chart[] = [
  { id: 1, created_at: "", name_en: "1948", name_kr: undefined, level: 29, type: "Double", image_url: "art/1948.png" },
  { id: 2, created_at: "", name_en: "Appassionata", name_kr: undefined, level: 27, type: "Double", image_url: "art/appassionata.png" },
  { id: 3, created_at: "", name_en: "BOOOM!!", name_kr: undefined, level: 22, type: "Double", image_url: "art/booom.png" },
  { id: 4, created_at: "", name_en: "Crimson hood", name_kr: undefined, level: 26, type: "Double", image_url: "art/crimson-hood.png" },
  { id: 5, created_at: "", name_en: "Doppelganger", name_kr: undefined, level: 26, type: "Double", image_url: "art/doppelganger.png" },
  { id: 6, created_at: "", name_en: "Hercules", name_kr: undefined, level: 26, type: "Double", image_url: "art/hercules.png" },
  { id: 7, created_at: "", name_en: "KUGUTSU", name_kr: undefined, level: 27, type: "Double", image_url: "art/kugutsu.png" },
  { id: 8, created_at: "", name_en: "Murdoch", name_kr: undefined, level: 24, type: "Double", image_url: "art/murdoch.png" },
  { id: 9, created_at: "", name_en: "Neo Catharsis", name_kr: undefined, level: 27, type: "Double", image_url: "art/neo-catharsis.png" },
  { id: 10, created_at: "", name_en: "wither garden", name_kr: undefined, level: 22, type: "Double", image_url: "art/wither-garden.png" },
]

type Variant = "card" | "row";
interface ChartPageProps {
  variant: Variant,
}

function ChartsPage({ variant }: ChartPageProps) {
  return (
    <>
      <Flex wrap="wrap" gap="4" justify="center">
        {charts.map((chart: Chart) => (
          variant == "card" ?
            <ChartCard chart={chart}></ChartCard>
            :
            <ChartRow chart={chart}></ChartRow>
        ))}
      </Flex>
    </>
  )
}

export default ChartsPage
