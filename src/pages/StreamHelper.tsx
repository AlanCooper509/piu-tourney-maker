import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Button, Center, Flex, VStack, Separator, Text } from "@chakra-ui/react";

import TourneyHeaderText from "../components/tourney/TourneyHeader/TourneyHeaderText";
import { useRoundStreamData } from "../hooks/useRoundStreamData";
import { useTransparentBackground } from "../hooks/useTransparentBackground";
import { useIsAdminForTourney } from "../context/admin/AdminTourneyContext";
import { PlayerAvatar } from "../components/PlayerAvatar";

/**
 * Stream Helper — a lightweight, transparent-background page meant to be
 * added as an OBS Browser Source rather than viewed in a normal tab.
 *
 * URL:
 *   /tourney/:tourneyId/StreamHelper
 *   /tourney/:tourneyId/StreamHelper?roundId=123   (pin a specific round)
 *
 * Shows your existing TourneyHeaderText (same as TourneyPage) plus whichever
 * round has status "In Progress" for this tourney: the round name and the
 * players in it (name + seed, in sort_order). If more than one round is
 * "In Progress" at once (parallel pools), the first match found is used —
 * add ?roundId= to the OBS source URL to pin a specific one instead.
 *
 * This is the operator-facing raw-data view. For a stylized, transparent
 * overlay meant to actually be broadcast, see StreamViewer.tsx instead.
 */
function StreamHelperPage() {
  const { tourneyId } = useParams();
  const [searchParams] = useSearchParams();
  const roundIdOverride = searchParams.get("roundId");
  const navigate = useNavigate();

  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  useTransparentBackground();

  const { tourney, sortedRounds, roundPools, setRounds, currentRound, playerRounds } =
    useRoundStreamData(tourneyId, roundIdOverride, "stream-helper");

  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    tourney?.id ?? undefined,
  );

  if (!loadingTourneyAdminStatus && !isTourneyAdmin) {
    return (
      <Center h="60vh">
        <Text fontSize="xl" color="red.400">
          You must be a tournament admin to view Stream Helper.
        </Text>
      </Center>
    );
  }

  return (
    <Box mt={8}>
      <TourneyHeaderText
        rounds={sortedRounds}
        setRounds={setRounds}
        currentRoundId={NaN}
        roundPools={roundPools}
      />
      <Separator mt={2} mb={4} />

      <Button
        colorPalette="purple"
        variant="outline"
        borderWidth={2}
        size="sm"
        mb={4}
        onClick={() =>
          navigate(
            `/tourney/${tourneyId}/StreamViewer${roundIdOverride ? `?roundId=${roundIdOverride}` : ""}`,
          )
        }
      >
        Open Stream Viewer
      </Button>

      <Flex
        direction="column"
        align="center"
        justify="flex-end"
        h="100%"
        pb={10}
        gap={3}
      >
        {!currentRound ? (
          <Text
            position="fixed"
            bottom={4}
            left={4}
            color="whiteAlpha.500"
            fontSize="sm"
          >
            Stream Helper: waiting for a round to go "In Progress"…
          </Text>
        ) : (
          <>
            <Box
              bg="blackAlpha.700"
              px={5}
              py={1.5}
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
              fontWeight="bold"
              fontSize="lg"
            >
              {currentRound.name}
            </Box>

            <VStack gap={4} align="center">
              {playerRounds.map((pr, idx) => (
                <Box key={pr.id}>
                  {idx > 0 && (
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      opacity={0.6}
                      my={2}
                      textAlign="center"
                    >
                      VS
                    </Text>
                  )}
                  <Box
                    display="inline-flex"
                    flexDirection="column"
                    alignItems="center"
                    bg="blackAlpha.700"
                    borderRadius="lg"
                    px={8}
                    py={4}
                    minW="220px"
                  >
                    <PlayerAvatar
                      src={pr.player_tourneys?.player_img}
                      alt={pr.player_tourneys?.player_name ?? "TBD"}
                      size="64px"
                      borderRadius="md"
                      mb={2}
                    />
                    {pr.player_tourneys?.seed != null && (
                      <Text fontSize="sm" opacity={0.7} mb={1}>
                        Seed #{pr.player_tourneys.seed}
                      </Text>
                    )}
                    <Text fontSize="2xl" fontWeight="bold" lineHeight="1.1">
                      {pr.player_tourneys?.player_name ?? "TBD"}
                    </Text>
                  </Box>
                </Box>
              ))}
            </VStack>
          </>
        )}
      </Flex>
    </Box>
  );
}

export default StreamHelperPage;
