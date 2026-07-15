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
      {shorten ? (
        <Card.Body py={2} px={2}>
          <Card.Title truncate m={0} lineHeight="shorter">
            <HStack gap={1.5}>
              <Text fontSize={{ base: "2xs", sm: "sm" }} fontWeight="bold" truncate flex="1">
                {chart.name_en}
              </Text>
              <Badge size={{ base: "sm", md: "md" }} colorPalette={color(chart.type)} variant="surface">
                {chart.level}
              </Badge>
            </HStack>
          </Card.Title>
          <Card.Description>
          </Card.Description>
        </Card.Body>
      ) : (
        <Card.Body py={6} px={6}>
          <Card.Title truncate m={0} lineHeight="shorter">
            <HStack gap={2}>
              <Badge size={{ base: "sm", md: "md" }} colorPalette={color(chart.type)} variant="surface">
                {chart.level}
              </Badge>
              <Text fontSize={{ base: "2xs", sm: "sm" }} fontWeight="bold" truncate flex="1">
                {chart.name_en}
              </Text>
            </HStack>
          </Card.Title>
          <Card.Description>
          </Card.Description>
        </Card.Body>
      )}
    </Card.Root>
  )
}
