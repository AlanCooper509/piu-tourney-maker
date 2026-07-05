import { Box, HStack, VStack, Text, Badge } from "@chakra-ui/react";
import type { PickbanAction, PickbanRulesetSteps } from "../../../types/Pickban";
import type { PlayerRound } from "../../../types/PlayerRound";

interface ActionHudBannerProps {
  currentStepRule: PickbanRulesetSteps;
  pbStep: number;
  totalSteps: number;
  playerLeft: PlayerRound | null;
  playerRight: PlayerRound | null;
  resolvedName: string;
}

const ACTION_THEMES: Record<PickbanAction, { bg: string, border: string; palette: string; instruction: string }> = {
  BAN: { bg: "red.900", border: "red.500", palette: "red", instruction: "BAN a chart" },
  PROTECT: { bg: "blue.900", border: "blue.500", palette: "blue", instruction: "PROTECT a chart" },
  PICK: { bg: "green.900", border: "green.500", palette: "green", instruction: "PICK a chart" },
  AUTOPICK: { bg: "teal.900", border: "teal.500", palette: "teal", instruction: "AUTOPICK a chart" },
  IGNORE: { bg: "gray.900", border: "gray.500", palette: "gray", instruction: "Processing choice..." },
};

export function ActionHudBanner({ 
  currentStepRule, 
  pbStep, 
  totalSteps, 
  playerLeft, 
  playerRight,
  resolvedName 
}: ActionHudBannerProps) {
  const activeActor = currentStepRule?.actor || "Automation";
  const activeAction: PickbanAction = currentStepRule?.action || "IGNORE";
  const actionTheme = ACTION_THEMES[activeAction] || ACTION_THEMES["IGNORE"];

  const p1Seed = playerLeft?.player_tourneys?.seed ?? 999;
  const p2Seed = playerRight?.player_tourneys?.seed ?? 999;
  const isP1HigherSeed = p1Seed < p2Seed;

  const isLeftPlayerTurn = activeActor === "Higher Seed" ? isP1HigherSeed : !isP1HigherSeed;
  const isAutomation = activeActor === "Automation" || !["Higher Seed", "Lower Seed"].includes(activeActor);

  return (
    <Box
      p={4}
      borderRadius="md"
      borderWidth="2px"
      bg={actionTheme.bg}
      borderColor={actionTheme.border}
      transition="border-color 0.2s ease, background-color 0.2s ease"
    >
      <HStack width="100%" justify="space-between" align="center" gap={4}>

        {/* Left Section */}
        <Box flex="1" flexBasis={0} minW={0}>
          <Text fontSize="2xs" fontWeight="bold" letterSpacing="wider" color="fg.muted" textTransform="uppercase">
            Current Step
          </Text>
          <Badge colorPalette={actionTheme.palette} size="lg" mt={1} variant="solid">
            {activeAction}
          </Badge>
        </Box>

        {/* Center Section: Responsive alignment based on turn active position */}
        <VStack
          gap={0}
          px={2}
          flex="2"
          minW={0}
          maxW={{ base: "100%", lg: "550px" }}
          mx="auto"
          alignItems={isAutomation ? "center" : { base: "center", lg: isLeftPlayerTurn ? "flex-start" : "flex-end" }}
        >
          <Text fontSize="2xs" fontWeight="bold" letterSpacing="2px" color="fg.muted" textTransform="uppercase" width="100%" textAlign="center">
            {isAutomation ? "SYSTEM STEP" : "YOUR TURN"}
          </Text>
          <Text
            fontSize={{ base: "lg", sm: "xl", md: "3xl" }}
            fontWeight="black"
            lineHeight="normal"
            pb="4px"
            color="gray.200"
            width="100%"
            textAlign={isAutomation ? "center" : { base: "center", lg: isLeftPlayerTurn ? "left" : "right" }}
            truncate
          >
            {resolvedName}
          </Text>
        </VStack>

        {/* Right Section */}
        <VStack
          align="flex-end"
          gap={0}
          flex="1"
          flexBasis={0}
          minW={0}
          textAlign="end"
        >
          <Text fontSize="2xs" fontWeight="bold" letterSpacing="wider" color="fg.muted" textTransform="uppercase">
            Step {pbStep + 1} of {totalSteps}
          </Text>
          <Text fontSize="xs" fontWeight="bold">
            {actionTheme.instruction}
          </Text>
        </VStack>

      </HStack>
    </Box>
  );
}