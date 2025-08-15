import { Box, Button, Center, Flex, Heading } from "@chakra-ui/react"
import type { Chart } from "../types/Chart"
import { ChartRow } from "../components/chart/ChartRow"
import { useState } from "react"
import { ChartCard } from "../components/chart/ChartCard"

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


function CardDrawPage() {
  const [pick, setPick] = useState<Chart | undefined>(undefined);

  function onClick() {
    const index = Math.floor(Math.random() * charts.length);
    setPick(charts[index]);
  }


  if (pick === undefined) {
    return <>
      <Button onClick={onClick} variant="surface" colorPalette="pink" size="2xl">
        Draw
      </Button>
    </>
  } else {
    // very clean code!
    const numSide = 50;
    const rollOrder = [];
    for (let i = 0; i < numSide; i++) {
      const random_index = Math.floor(Math.random() * charts.length);
      const chart = charts[random_index];
      rollOrder.push(chart);
    }
    rollOrder.push(pick);
    for (let i = 0; i < numSide; i++) {
      const random_index = Math.floor(Math.random() * charts.length);
      const chart = charts[random_index];
      rollOrder.push(chart);
    }

    return <>
      <Heading>Picked {pick.name_en}</Heading>
      <Center overflow="visible" data-state="open" _open={{ animation: "slide-in 12000ms ease-in-out, fade-in 1000ms ease-out" }}>
        {rollOrder.map((chart: Chart) => {
          return <Box display="inline-block" zIndex="100" marginRight="1em" >
            <ChartCard width="300px" chart={chart} />
          </Box>
        })}
      </Center >
    </>
  }
}

export default CardDrawPage
