import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import StartRoundButton from "../StartRoundButton";
import EndRoundButton from "../EndRoundButton/EndRoundButton";
import EditRoundDetailsButton from "./EditRoundDetailsButton";
import { StatusElement } from "../../StatusElement";
import LeaderboardLinkButton from "../LeaderboardLinkButton";
import PlayersAdvancingElement from "./PlayersAdvancingElement";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";

import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";
import type { Stage } from "../../../types/Stage";

interface RoundDetailsProps {
  round: Round | null;
  setRound: (round: Round | null) => void;
  rounds: Round[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
  players: PlayerRound[] | null;
  stages: Stage[] | null;
  loading: boolean;
  error: Error | null;
  tourneyId: number;
}

export function RoundDetails({
  round,
  setRound,
  rounds,
  setRounds,
  players,
  stages,
  loading,
  error,
  tourneyId,
}: RoundDetailsProps) {
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourneyId);
  const navigate = useNavigate();

  const roundName = round?.name ?? "";
  const playersAdvancing = round?.players_advancing ?? -1;
  const nextRound = rounds.find((r) => r.id === round?.next_round_id);

  return (
    <>
      <title>{roundName}</title>
      <Box>
        <VStack style={{ gap: "0px" }}>
          {loading && <Text>Loading round...</Text>}
          {error && <Text color="red">Error: {error.message}</Text>}
          {!loading && !error && !round && <Text>Round ID not found.</Text>}
          {!loading && !error && round && (
            <>
              {!loadingTourneyAdminStatus && isTourneyAdmin && (
                <Box my={2}>
                  <EditRoundDetailsButton
                    round={round}
                    setRound={setRound}
                    rounds={rounds}
                    setRounds={setRounds}
                  />
                </Box>
              )}

              <StatusElement element={round} />
              <PlayersAdvancingElement
                playersAdvancing={playersAdvancing}
                roundStatus={round?.status}
              />
              <Text>Scoring: {round.points_per_stage ? `Points (${round.points_per_stage.replaceAll(',', ', ')})` : "Cumulative"}</Text>
              {round && round.next_round_id && nextRound && (
                <Text>
                  Next Round:{" "}
                  <Text
                    as="span"
                    color="cyan.solid"
                    cursor="pointer"
                    fontWeight="bold"
                    onClick={() => navigate(`/tourney/${tourneyId}/round/${nextRound.id}`)}
                  >
                    {nextRound.name}
                  </Text>
                </Text>
              )}
              <HStack mt={2}>
                <LeaderboardLinkButton
                  tourneyId={tourneyId}
                  roundId={round?.id ?? 0}
                />
                {!loadingTourneyAdminStatus && isTourneyAdmin && round?.status === "Not Started" && (
                    <StartRoundButton
                      round={round}
                      setRound={setRound}
                      players={players}
                      stages={stages}
                    />
                  )}
                {!loadingTourneyAdminStatus && isTourneyAdmin && round?.status === "In Progress" && (
                    <EndRoundButton
                      tourneyId={tourneyId}
                      round={round}
                      setRound={setRound}
                    />
                  )}
              </HStack>
            </>
          )}
        </VStack>
      </Box>
    </>
  );
}
