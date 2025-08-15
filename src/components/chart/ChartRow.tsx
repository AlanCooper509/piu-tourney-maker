import { Card, Badge } from '@chakra-ui/react'
import type { Chart, ChartType } from '../../types/Chart'

interface ChartRowProps {
  chart: Chart,
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

export function ChartRow({ chart }: ChartRowProps) {
  return (
    <Card.Root width="100%" size="sm" variant="elevated" bgImage={`url('${chart.image_url}')`} bgPos="center" bgBlendMode="soft-light">
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
