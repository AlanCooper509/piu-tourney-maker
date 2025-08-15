import { Image, Card, Badge } from '@chakra-ui/react'
import type { Chart, ChartType } from '../../types/Chart'

interface ChartCardProps {
  chart: Chart,
  width?: string,
}

function color(type?: ChartType): string {
  switch (type) {
    case "Single": return "red"
    case "Double": return "green"
    case "UCS": return "purple"
    case "Co-Op": return "yellow"
    case undefined: return "black"
  }
}

export function ChartCard({ chart, width = "300px" }: ChartCardProps) {
  return (
    <Card.Root width={width} size="sm" variant="elevated">
      <Image src={chart.image_url} alt={chart.name_en} filter="auto"></Image>
      <Card.Body>
        <Card.Title>
          {chart.name_en}
        </Card.Title>
        <Card.Description>
          <Badge size="md" colorPalette={color(chart.type)} variant="surface">
            {chart.level}
          </Badge>
        </Card.Description>
      </Card.Body>
    </Card.Root>
  )
}
