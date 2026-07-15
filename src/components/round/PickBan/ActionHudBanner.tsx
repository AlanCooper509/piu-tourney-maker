import { Box, HStack, VStack, Text, Badge, Stack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import type { PickbanAction, PickbanRulesetSteps } from "../../../types/Pickban";
import type { PlayerRound } from "../../../types/PlayerRound";

interface ActionHudBannerProps {
  currentStepRule?: PickbanRulesetSteps;
  pbStep: number;
  totalSteps: number;
  playerLeft: PlayerRound | null;
  playerRight: PlayerRound | null;
  resolvedName: string;
  isDone?: boolean;
  isLockedIn?: boolean;
  onLockIn?: () => void;
}

const ACTION_THEMES: Record<PickbanAction | "COMPLETE", { bg: string, border: string; palette: string; instruction: string }> = {
  BAN: { bg: "red.900", border: "red.500", palette: "red", instruction: "BAN a chart" },
  PROTECT: { bg: "blue.900", border: "blue.500", palette: "blue", instruction: "PROTECT a chart" },
  PICK: { bg: "green.900", border: "green.500", palette: "green", instruction: "PICK a chart" },
  AUTOPICK: { bg: "teal.900", border: "teal.500", palette: "teal", instruction: "AUTOPICK a chart" },
  IGNORE: { bg: "gray.900", border: "gray.500", palette: "gray", instruction: "Processing choice..." },
  COMPLETE: { bg: "green.900/50", border: "green.700", palette: "green", instruction: "Click here to finalize the charts to be played." }
};

const lockInPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 4px 0px rgba(0, 0, 0, 0);
  }
  50% {
    box-shadow: 0 0 16px 4px var(--pulse-color);
  }
`;

export function ActionHudBanner({
  currentStepRule,
  pbStep,
  totalSteps,
  playerLeft,
  playerRight,
  resolvedName,
  isDone = false,
  isLockedIn = false,
  onLockIn
}: ActionHudBannerProps) {
  const activeActor = currentStepRule?.actor || "Automation";
  const activeAction: PickbanAction | "COMPLETE" = isDone ? "COMPLETE" : (currentStepRule?.action || "IGNORE");
  const actionTheme = ACTION_THEMES[activeAction] || ACTION_THEMES["IGNORE"];

  const p1Seed = playerLeft?.player_tourneys?.seed ?? 999;
  const p2Seed = playerRight?.player_tourneys?.seed ?? 999;
  const isP1HigherSeed = p1Seed < p2Seed;

  const isLeftPlayerTurn = activeActor === "Higher Seed" ? isP1HigherSeed : !isP1HigherSeed;
  const isAutomation = activeActor === "Automation" || !["Higher Seed", "Lower Seed"].includes(activeActor);

  // "Ready to Submit Pick/Bans" OR Already Completed & Saved
  if (isDone) {
    return (
      <Box
        p={4}
        borderRadius="md"
        borderWidth="2px"
        bg={isLockedIn ? "gray.900/60" : actionTheme.bg}
        borderColor={actionTheme.border}
        cursor={isLockedIn ? "default" : "pointer"}
        onClick={isLockedIn ? undefined : onLockIn}
        userSelect="none"
        transition="border-color 0.2s ease, background-color 0.2s ease"
        css={{
          "--pulse-color": "colors.green.500",
        }}
        // Only run animation if NOT locked in already
        animation={isLockedIn ? undefined : `${lockInPulse} 1.8s ease-in-out infinite`}
        willChange="box-shadow, transform"
        _hover={isLockedIn ? undefined : {
          bg: "green.900/70",
          borderColor: "green.400"
        }}
      >
        <VStack gap={0} width="100%" textAlign="center" py={1}>
          <Text
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="2px"
            color="green.400"
            textTransform="uppercase"
          >
            {isLockedIn ? "Stages Confirmed" : "Pick/Ban Complete"}
          </Text>
          <Text fontSize={{ base: "lg", sm: "xl", md: "2xl" }} fontWeight="black" my={1} color={isLockedIn ? "gray.300" : "white"}>
            {isLockedIn ? "PICK/BANS HAVE BEEN FINALIZED" : "LOCK IN THE PICK/BANS"}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {isLockedIn ? "These stages have already been saved onto the round." : actionTheme.instruction}
          </Text>
        </VStack>
      </Box>
    );
  }

  // Active Workflow View
  return (
    <Box
      p={4}
      borderRadius="md"
      borderWidth="2px"
      bg={actionTheme.bg}
      borderColor={actionTheme.border}
      transition="border-color 0.2s ease, background-color 0.2s ease"
      width="100%"
    >
      <Stack
        direction={{ base: "column", sm: "row" }}
        width="100%"
        justify="space-between"
        align="center"
        gap={4}
      >

        {/* 1. Left Section: Given a reliable fixed layout footprint */}
        <VStack
          display={{ base: "none", md: "inline" }}
          width={{ base: "100%", sm: "90px" }}
          flexShrink={0}
          align={{ base: "center", sm: "flex-start" }}
          gap={0}
        >
          <Text fontSize="2xs" fontWeight="bold" letterSpacing="wider" color="fg.muted" textTransform="uppercase">
            Current Step
          </Text>
          <Badge colorPalette={actionTheme.palette} size="lg" mt={1} variant="solid">
            {activeAction}
          </Badge>
        </VStack>

        {/* 2. Center Section: Stretches to fill space in row mode, stays centered in column mode */}
        <VStack
          gap={0}
          px={2}
          flex="1"
          width="100%"
          minW={0}
          mx="auto"
          alignItems="center"
        >
          <Text fontSize="2xs" fontWeight="bold" letterSpacing="2px" color="fg.muted" textTransform="uppercase" width="100%" textAlign="center" mb={1}>
            {isAutomation ? "SYSTEM STEP" : "CURRENT TURN"}
          </Text>

          <Box width="100%">
            {isAutomation ? (
              <Text
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
                fontWeight="black"
                color="gray.200"
                textAlign="center"
                lineHeight="shorter"
                py={0.5}
                truncate
              >
                {resolvedName}
              </Text>
            ) : (
              <>
                {/* Mobile View */}
                <Text
                  display={{ base: "block", sm: "none" }}
                  fontSize={{ base: "lg", sm: "xl" }}
                  fontWeight="black"
                  color="white"
                  textAlign="center"
                  lineHeight="shorter"
                  py={0.5}
                  truncate
                >
                  {resolvedName}
                </Text>

                {/* Large Screen View */}
                <HStack
                  display={{ base: "none", sm: "flex" }}
                  width="100%"
                  justify="space-between"
                  gap={4}
                  align="center"
                >
                  <Text
                    fontSize={{ base: "xl", xl: "2xl" }}
                    fontWeight={isLeftPlayerTurn ? "black" : "medium"}
                    color={isLeftPlayerTurn ? "white" : "gray.600"}
                    opacity={isLeftPlayerTurn ? 1 : 0.5}
                    textAlign="right"
                    flex="1"
                    lineHeight="shorter"
                    py={0.5}
                    truncate
                    transition="all 0.2s ease"
                  >
                    {playerLeft?.player_tourneys?.player_name ?? "PLAYER 1"}
                  </Text>

                  <Text fontSize="xs" fontWeight="bold" color="gray.500" px={2} flexShrink={0}>
                    VS
                  </Text>

                  <Text
                    fontSize="xl"
                    fontWeight={!isLeftPlayerTurn ? "black" : "medium"}
                    color={!isLeftPlayerTurn ? "white" : "gray.600"}
                    opacity={!isLeftPlayerTurn ? 1 : 0.5}
                    textAlign="left"
                    flex="1"
                    lineHeight="shorter"
                    py={0.5}
                    truncate
                    transition="all 0.2s ease"
                  >
                    {playerRight?.player_tourneys?.player_name ?? "PLAYER 2"}
                  </Text>
                </HStack>
              </>
            )}
          </Box>
        </VStack>

        {/* 3. Right Section: Stretches full width on mobile to center-align the steps */}
        <VStack
          align={{ base: "center", sm: "flex-end" }}
          gap={0}
          width={{ base: "100%", sm: "90px" }}
          flexShrink={0}
          textAlign={{ base: "center", sm: "end" }}
        >
          <Text fontSize="2xs" fontWeight="bold" letterSpacing="wider" color="fg.muted" textTransform="uppercase">
            Step {pbStep + 1} of {totalSteps}
          </Text>
          <Text fontSize="xs" fontWeight="bold" truncate width="100%">
            {actionTheme.instruction}
          </Text>
        </VStack>

      </Stack>
    </Box>
  );
}