import { Image, Card, Badge } from '@chakra-ui/react'
import type { Chart, ChartType } from '../../types/Chart'

interface ChartCardProps {
  chart: Chart,
  width?: string,
}

function color(type: ChartType | null): string {
  switch (type) {
    case "Single": return "red"
    case "Double": return "green"
    case "UCS": return "purple"
    case "Co-Op": return "yellow"
    case null: return "black"
  }
}

export function ChartCard({ chart, width = "300px" }: ChartCardProps) {
  return (
    <Card.Root width={width} size="sm" variant="elevated">
      {chart.image_url && <Image src={chart.image_url} alt={chart.name_en} filter="auto" />}
      <Card.Body>
        <Card.Title truncate>
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
