import { Card, Badge, HStack, Text, Box } from '@chakra-ui/react'
import { LuCheck } from "react-icons/lu";
import { IoBan } from "react-icons/io5";
import { MdShield } from "react-icons/md";

import type { Chart } from '../../types/Chart'
import type { ChartType } from '../../types/ChartType'
import type { PickbanAction } from '../../types/Pickban'

interface ChartRowProps {
  chart: Chart,
  action?: PickbanAction
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

function getActionStyles(action: PickbanAction | undefined) {
  switch (action) {
    case "PICK": return { bg: "green.600", text: <LuCheck strokeWidth={4} />, color: "gray.100" }
    case "BAN": return { bg: "red.700", text: <IoBan />, color: "gray.400" }
    case "PROTECT": return { bg: "blue.700", text: <MdShield />, color: "gray.100" }
    case "AUTOPICK": return { bg: "teal.700", text: <LuCheck />, color: "gray.100" }
    case "IGNORE": return { bg: "gray.700", text: "SKIP", color: "gray.100" }
    default: return null
  }
}

const paddingOffset = 65

export function ChartRow({ chart, action }: ChartRowProps) {
  const actionStyles = getActionStyles(action);

  return (
    <Card.Root 
      width="100%" 
      size="sm" 
      variant="elevated" 
      bgImage={`linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url('${chart.image_url}')`} 
      bgPos="center" 
      bgSize="cover"
      position="relative"
      overflow="hidden"
    >
      <Card.Body>
        <HStack justifyContent="space-between" width="100%" pr={actionStyles ? `${paddingOffset - 20}px` : 0}>
          <HStack flex="1" minW={0}>
            <Badge
              colorPalette={color(chart.type)}
              variant="surface"
              size="lg"
              fontSize="lg"
              flexShrink={0}
            >
              {chart.level}
            </Badge>

            <Text
              fontSize="md"
              fontWeight="bold"
              color="white"
              truncate
              flex="1"
              minW={0}
            >
              {chart.name_en}
            </Text>
          </HStack>
        </HStack>
      </Card.Body>

      {/* Absolute Slanted Overlay Ribbon */}
      {actionStyles && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          width={`${paddingOffset}px`}
          bg={`${actionStyles.bg}/70`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pl={5}
          clipPath="polygon(45% 0%, 100% 0%, 100% 100%, 0% 100%)"
        >
          <Text 
            color={actionStyles.color} 
            fontWeight="black" 
            letterSpacing="wider"
            display="flex"
            alignItems="center"
          >
            {actionStyles.text}
          </Text>
        </Box>
      )}
    </Card.Root>
  )
}