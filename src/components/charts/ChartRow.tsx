import { Card, Badge, HStack, Text } from '@chakra-ui/react'
import type { Chart, ChartType } from '../../types/Chart'

interface ChartRowProps {
  chart: Chart,
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

export function ChartRow({ chart }: ChartRowProps) {
  return (
    <Card.Root width="100%" size="sm" variant="elevated" bgImage={`linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),url('${chart.image_url}')`} bgPos="center" bgSize="cover">
      <Card.Body>
        <HStack>
          <Badge colorPalette={color(chart.type)} variant="surface" size="lg" fontSize="lg">
            {chart.level}
          </Badge>
          <Text fontSize="xl" fontWeight="bold" truncate>
            {chart.name_en}
          </Text>
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}
