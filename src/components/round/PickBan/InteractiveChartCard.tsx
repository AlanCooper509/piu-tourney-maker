import { Box, Stack, HStack, Badge, Text, VStack, Spinner } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import { IoBan } from "react-icons/io5";
import { MdShield } from "react-icons/md";

import { ChartCard } from "../../charts/ChartCard";

import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import type { UIChartState } from "./PickBanDialogContent";
import type { PickbanAction, PickbanRulesetSteps } from "../../../types/Pickban";

interface InteractiveChartCardProps {
  entry: ChartdrawEntryWithDetails;
  state: UIChartState;
  currentStepRule?: PickbanRulesetSteps;
  resolvedActorName: string;
  isDone: boolean;
  isSelecting: boolean;
  onClick: () => void;
}

const STATE_THEMES: Record<
  UIChartState,
  { bg: string; border: string; opacity: number; label: string; icon: React.ReactNode | null; palette: string }
> = {
  available: { bg: "bg.muted", border: "border", opacity: 1, label: "AVAILABLE", icon: null, palette: "gray" },
  BAN: { bg: "red.800", border: "red.500", opacity: 0.4, label: "BANNED", icon: <IoBan />, palette: "red" },
  PROTECT: { bg: "blue.900", border: "blue.500", opacity: 1, label: "PROTECTED", icon: <MdShield />, palette: "blue" },
  PICK: { bg: "green.900", border: "green.500", opacity: 1, label: "PICKED", icon: <LuCheck />, palette: "green" },
  AUTOPICK: { bg: "teal.900", border: "teal.500", opacity: 1, label: "AUTO-PICKED", icon: <LuCheck />, palette: "teal" },
  IGNORE: { bg: "black.400", border: "border", opacity: 0.5, label: "IGNORED", icon: null, palette: "gray" },
};

const HOVER_THEMES: Record<PickbanAction, { bg: string; border: string; actionLabel: string, actionColor: string }> = {
  BAN: { bg: "red.950", border: "red.600", actionLabel: "BANNING", actionColor: "red.500" },
  PROTECT: { bg: "blue.950", border: "blue.600", actionLabel: "PROTECTING", actionColor: "blue.500" },
  PICK: { bg: "green.950", border: "green.600", actionLabel: "PICK THIS CHART", actionColor: "green.500" },
  AUTOPICK: { bg: "teal.950", border: "teal.600", actionLabel: "AUTOPICKING", actionColor: "teal.500" },
  IGNORE: { bg: "bg.emphasized", border: "red.600", actionLabel: "SELECTING", actionColor: "red.500" },
};

export function InteractiveChartCard({ entry, state, currentStepRule, resolvedActorName, isDone, isSelecting, onClick }: InteractiveChartCardProps) {
  const isIdle = state === "available";
  const isInteractive = isIdle && !isDone && !isSelecting;
  const theme = STATE_THEMES[state];

  const activeAction: PickbanAction = currentStepRule?.action || "IGNORE";
  const hoverTheme = HOVER_THEMES[activeAction] || HOVER_THEMES["IGNORE"];

  return (
    <Box
      pb={1}
      borderWidth="2px"
      borderColor={theme.border}
      bg={theme.bg}
      borderRadius="md"
      cursor={isSelecting ? "wait" : isInteractive ? "pointer" : "not-allowed"}
      opacity={theme.opacity}
      position="relative"
      overflow="hidden"
      transition="all 0.2s ease-in-out"
      className="group"
      _hover={
        isInteractive
          ? {
            transform: "translateY(-2px)",
            borderColor: hoverTheme.border,
            bg: hoverTheme.bg,
            boxShadow: "md",
          }
          : undefined
      }
      onClick={isInteractive ? onClick : undefined}
    >
      {/* 2. HOVER CENTERING OVERLAY */}
      {isIdle && !isDone && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={isSelecting ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.70)"}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          opacity={isSelecting ? 1 : 0}
          zIndex={5}
          transition="opacity 0.2s ease-in-out"
          px={3}
          pointerEvents="none"
          css={
            !isSelecting
              ? {
                ".group:hover &": {
                  opacity: 1,
                },
              }
              : undefined
          }
        >
          {isSelecting ? (
            <VStack gap={2}>
              <Spinner size="md" color={hoverTheme.border} />
              <Text fontSize="2xs" fontWeight="bold" color="white" letterSpacing="wider">
                LOCKING CHOICE...
              </Text>
            </VStack>
          ) : (
            <>
              <Text
                fontSize="xl"
                fontWeight="black"
                color="white"
                width="100%"
                textAlign="center"
                lineHeight="tight"
                truncate
              >
                {resolvedActorName}
              </Text>
              <Text
                fontSize="2xs"
                fontWeight="bold"
                color={hoverTheme.actionColor}
                letterSpacing="wider"
                textTransform="uppercase"
              >
                {hoverTheme.actionLabel}
              </Text>
            </>
          )}
        </Box>
      )}

      {/* Main card body structural stack */}
      <Stack direction="column" justify="space-between" align="stretch" width="100%" gap={2}>
        {entry?.charts && <ChartCard chart={entry.charts} shorten />}

        <HStack justify="flex-end" flexShrink={0} width="100%">
          <Badge colorPalette={theme.palette} variant="subtle">
            {theme.icon} {theme.label}
          </Badge>
        </HStack>
      </Stack>
    </Box>
  );
}