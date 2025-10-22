import { Flex, Box, Container, Separator, Heading } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import getSupabaseTable from "../hooks/getSupabaseTable";
import { RoundDetails } from "../components/round/details/RoundDetails";
import { PlayersList } from "../components/round/PlayersList";
import { StagesList } from "../components/round/StagesList";
import RoundHeaderText from "../components/round/RoundHeaderText";
import RoundsSidebar from "../components/round/RoundsSidebar/RoundsSidebar";
import { Toaster } from "../components/ui/toaster";
import { useCurrentTourney } from "../context/CurrentTourneyContext";

import type { Tourney } from "../types/Tourney";
import type { Round } from "../types/Round";
import type { Stage } from "../types/Stage";
import type { PlayerRound } from "../types/PlayerRound";

function RoundPage() {
  const { tourneyId, roundId } = useParams<{
    tourneyId: string;
    roundId: string;
  }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;
  if (!roundId) return <div>Invalid Round ID</div>;

  const { tourney, setTourney } = useCurrentTourney();

  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  const { data: tourneys } = getSupabaseTable<Tourney>("tourneys", {
    column: "id",
    value: tourneyId,
  });
  const {
    data: rounds,
    loading: loadingRound,
    error: errorRound,
  } = getSupabaseTable<Round>("rounds", { column: "id", value: roundId });
  const {
    data: playersData,
    loading: loadingPlayers,
    error: errorPlayers,
  } = getSupabaseTable<PlayerRound>(
    "player_rounds",
    { column: "round_id", value: roundId },
    "*, player_tourneys(player_name)"
  );
  const {
    data: stagesData,
    loading: loadingStages,
    error: errorStages,
  } = getSupabaseTable<Stage>(
    "stages",
    { column: "round_id", value: roundId },
    "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)"
  );
  const { data: allRoundsInTourney } = getSupabaseTable<Round>("rounds", {
    column: "tourney_id",
    value: tourneyId,
  });

  // Stores tourney table details
  useEffect(() => {
    if (tourneys?.length && tourneys[0].id !== tourney?.id) {
      setTourney(tourneys[0]);
    }
  }, [tourneys, tourney?.id, setTourney]);

  // Stores round table details
  useEffect(() => {
    if (rounds?.length) {
      setRound(rounds[0]);
    }
  }, [rounds]);

  // Sync players when playersData changes
  useEffect(() => {
    if (playersData) {
      const sortedPlayers = [...playersData].sort(
        (b, a) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlayers(sortedPlayers);
    }
  }, [playersData]);

  // Sync stages when stagesData changes
  useEffect(() => {
    if (stagesData) {
      const sortedStages = [...stagesData].sort((a, b) => a.id - b.id);
      setStages(sortedStages);
    }
  }, [stagesData]);

  // sort rounds for navbar
  const sortedRounds = allRoundsInTourney?.slice().sort((a, b) => a.id - b.id);

  return (
    <Box mt={8}>
      <Toaster />
      <RoundHeaderText roundName={rounds[0]?.name}></RoundHeaderText>

      <Separator mt={2} mb={4} />
      <RoundDetails
        round={round}
        setRound={setRound}
        rounds={sortedRounds}
        players={players}
        stages={stages}
        loading={loadingRound}
        error={errorRound}
        tourneyId={Number(tourneyId)}
      />
      <Separator mt={"24px"} mb={"24px"} />
      <Container maxW="4xl">
        <Flex direction={["column", "column", "column", "row"]} gap={4}>
          {/* Rounds List Code */}
          <Box
            flex="1"
            width={["100%", "100%", "100%", "50%"]}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Heading mb={2}>Rounds</Heading>
            <RoundsSidebar
              tourneyId={Number(tourneyId)}
              rounds={sortedRounds}
              currentRound={round}
            />
          </Box>
          {/* Players List Code */}
          <Box
            flex="1"
            width={["100%", "100%", "100%", "50%"]}
            display="flex"
            justifyContent="center"
          >
            <PlayersList
              round={round}
              players={players}
              setPlayers={setPlayers}
              stages={stages}
              loading={loadingPlayers}
              error={errorPlayers}
            />
          </Box>

          {/* Stages List Code */}
          <Box
            flex="1"
            width={["100%", "100%", "100%", "50%"]}
            display="flex"
            justifyContent="center"
          >
            <StagesList
              round={round}
              stages={stages}
              setStages={setStages}
              loading={loadingStages}
              error={errorStages}
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}

export default RoundPage;
