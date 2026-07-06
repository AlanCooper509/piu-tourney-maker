import {
  Box,
  Heading,
  Stack,
  Text,
  HStack,
  Badge,
  Separator,
  Center,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import type { RoundPool } from "../../../types/RoundPool";
import type { Round, RoundStatus } from "../../../types/Round";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { PlayerRound } from "../../../types/PlayerRound";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";

interface RoundsListProps {
  chartdrawConfigs: ChartdrawConfigWithSpecs[];
  pickbanRulesets: PickbanRulesetWithSteps[];
  roundPools: RoundPool[];
  rounds: Round[];
  playerRounds: PlayerRound[];
}

const getStatusColor = (status: RoundStatus | null): string => {
  switch (status) {
    case "Complete": return "green";
    case "In Progress": return "blue";
    case "Ready": return "blue";
    case "Pick Ban": return "purple";
    case "Not Started": return "gray";
    default: return "gray";
  }
};

export default function RoundsList({
  chartdrawConfigs,
  pickbanRulesets,
  roundPools,
  rounds,
  playerRounds,
}: RoundsListProps) {
  const { tourney } = useCurrentTourney();
  const navigate = useNavigate();

  const renderRoundCard = (round: Round) => {
    const currentRoundPlayers = playerRounds.filter((pr) => pr.round_id === round.id);
    const roundUrl = `/tourney/${tourney?.id}/round/${round.id}`;

    return (
      <LinkBox
        key={round.id}
        as="article"
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg="bg.panel"
        boxShadow="sm"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ 
          transform: "translateY(-2px)", 
          boxShadow: "md",
          borderColor: "cyan.muted" 
        }}
      >
        <HStack justifyContent="space-between" align="center" mb={2}>
          <Text fontWeight="bold" fontSize="md">
            {/* LinkOverlay captures the click action for the whole card */}
            <LinkOverlay 
              onClick={(e) => {
                e.preventDefault();
                navigate(roundUrl);
              }}
              href={roundUrl}
              color="fg"
              _hover={{ color: "cyan.solid" }}
            >
              {round.name}
            </LinkOverlay>
          </Text>
          <Badge colorPalette={getStatusColor(round.status)}>{round.status ?? "Not Started"}</Badge>
        </HStack>

        <Box mb={3}>
          <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">
            Players ({currentRoundPlayers.length})
          </Text>
          {currentRoundPlayers.length === 0 ? (
            <Text fontSize="xs" color="fg.subtle" fontStyle="italic">No players assigned yet</Text>
          ) : (
            <Text fontSize="xs" maxLines={1} color="fg.info">
              {currentRoundPlayers.map((pr) => pr.player_tourneys?.player_name ?? "Unknown").join(", ")}
            </Text>
          )}
        </Box>

        <Separator my={2} />
        <Text fontSize="xs" color="fg.muted">
          Advancing: <Text as="span" fontWeight="bold">{round.players_advancing}</Text>
        </Text>
      </LinkBox>
    );
  };

  return (
    <Box w="100%" px={4}>
      <Stack>
        {rounds.map((round, index) => {
          const currentPool = roundPools?.find(p => p.id === round.round_pool_id);
          const prevRound = rounds[index - 1];
          const prevPool = roundPools?.find(p => p.id === prevRound?.round_pool_id);

          const config = chartdrawConfigs.find((c) => c.id === currentPool?.chartdraw_config_id);
          const ruleset = pickbanRulesets.find((r) => r.id === config?.pickban_ruleset_id);

          const showPoolHeader = currentPool && currentPool.id !== prevPool?.id;
          const isFirstUngrouped = !currentPool && prevPool;

          return (
            <Box key={round.id}>
              {showPoolHeader && (
                <Box mb={4} mt={index > 0 ? 6 : 0}>
                  <HStack justifyContent="space-between" alignItems="baseline">
                    <Heading size="md" letterSpacing="tight" color="cyan.solid">
                      {currentPool.name.toUpperCase()}
                    </Heading>
                    {config && (
                      <Text fontSize="xs" color="fg.muted">
                        Ruleset: <Text as="span" fontWeight="semibold">{config.name}</Text>
                        {ruleset && ` (${ruleset.name})`}
                      </Text>
                    )}
                  </HStack>
                  <Separator mt={2} />
                </Box>
              )}

              {isFirstUngrouped && (
                <Box mb={4} mt={6}>
                  <Heading size="md" letterSpacing="tight" color="fg.muted">
                    UNGROUPED BRACKETS
                  </Heading>
                  <Separator mt={2} />
                </Box>
              )}

              <Box>
                {renderRoundCard(round)}
              </Box>
            </Box>
          );
        })}

        {rounds.length === 0 && (
          <Center py={10}>
            <Text color="fg.muted" fontStyle="italic">No rounds match the current criteria.</Text>
          </Center>
        )}
      </Stack>
    </Box>
  );
}