import { Box, HStack, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

import getActorName from "../../../helpers/getActorName";

import type { PickbanRulesetSteps, PickbanAction } from "../../../types/Pickban";

interface TimelinePipsProps {
  sequence: PickbanRulesetSteps[];
  pbStep: number;
}

const BORDER_COLORS: Record<PickbanAction, string> = {
  BAN: "red.600",
  PICK: "green.600",
  PROTECT: "blue.600",
  AUTOPICK: "teal.600",
  IGNORE: "gray.600",
};

const BG_COLORS: Record<PickbanAction, string> = {
  BAN: "red.800/20",
  PICK: "green.800/20",
  PROTECT: "blue.800/20",
  AUTOPICK: "teal.800/20",
  IGNORE: "gray.800/20",
};

const timelinePulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 4px 0px rgba(0, 0, 0, 0);
  }
  50% {
    box-shadow: 0 0 14px 3px var(--pulse-color);
  }
`;

export function TimelinePips({ sequence, pbStep }: TimelinePipsProps) {
  return (
    <HStack gap={1.5} justify="center" my={1} width="100%">
      {sequence.map((step, idx) => {
        const isPast = idx < pbStep;
        const isCurrent = idx === pbStep;

        return (
          <Box
            key={idx}
            w="100%"
            h="24px"
            minW={0}
            px={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="sm"
            bg={BG_COLORS[step.action]}
            border={isPast ? "1px solid" : "0px"}
            borderColor={BORDER_COLORS[step.action]}
            title={`Step ${idx + 1}: ${step.actor || "Automation"} [${step.action}]`}
            userSelect="none"
            css={{
              "--pulse-color": `colors.${BORDER_COLORS[step.action]}`,
            }}
            animation={
              isCurrent
                ? `${timelinePulse} 1.5s ease-in-out infinite`
                : undefined
            }
            willChange={isCurrent ? "box-shadow, transform" : undefined}
            transformOrigin="center"
          >
          <Text
            fontSize="2xs"
            fontWeight="bold"
            color={BORDER_COLORS[step.action]}
            truncate
            textAlign="center"
          >
            {/* Render the short version on small screens, full version on md and up */}
            <Box as="span" display={{ base: "inline", "2xl": "none" }}>
              {getActorName(step.actor, "short")}
            </Box>
            <Box as="span" display={{ base: "none", "2xl": "inline" }}>
              {getActorName(step.actor, "first")}
            </Box>
          </Text>
          </Box>
        );
      })}
    </HStack>
  );
}