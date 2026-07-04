import { Image, Card, Badge, Text, HStack } from '@chakra-ui/react'
import type { Chart } from '../../types/Chart'
import type { ChartType } from '../../types/ChartType'

interface ChartCardProps {
  chart: Chart
  shorten?: Boolean
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

export function ChartCard({ chart, shorten = false }: ChartCardProps) {
  return (
    <Card.Root variant="elevated">
      {chart.image_url && <Image src={chart.image_url} alt={chart.name_en} filter="auto" />}
      <Card.Body py={shorten ? 2 : 6} px={shorten ? 3 : 6}>
        <Card.Title truncate m={0} lineHeight="shorter">
          <HStack>
            <Badge size="md" colorPalette={color(chart.type)} variant="surface">
              {chart.level}
            </Badge>
            <Text fontSize="sm" fontWeight="bold" truncate flex="1">
              {chart.name_en}
            </Text>
          </HStack>

        </Card.Title>
        <Card.Description>
        </Card.Description>
      </Card.Body>
    </Card.Root>
  )
}
