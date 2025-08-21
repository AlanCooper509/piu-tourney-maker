import { Image, Card, Badge, Text, HStack } from '@chakra-ui/react'
import type { Chart, ChartType } from '../../types/Chart'

interface ChartCardProps {
  chart: Chart
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

export function ChartCard({ chart }: ChartCardProps) {
  return (
    <Card.Root variant="elevated">
      {chart.image_url && <Image src={chart.image_url} alt={chart.name_en} filter="auto" />}
      <Card.Body>
        <Card.Title truncate>
          <HStack>
            <Badge size="md" colorPalette={color(chart.type)} variant="surface">
              {chart.level}
            </Badge>
            <Text truncate>{chart.name_en}</Text>
          </HStack>

        </Card.Title>
        <Card.Description>
        </Card.Description>
      </Card.Body>
    </Card.Root>
  )
}
