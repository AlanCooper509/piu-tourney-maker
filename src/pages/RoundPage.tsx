import { Flex, Box, Container, Separator } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { supabaseClient } from "../lib/supabaseClient";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { RoundDetails } from "../components/round/details/RoundDetails";
import { PlayersList } from "../components/round/PlayersList";
import { StagesList } from "../components/stages/StagesList";
import TourneyHeaderText from "../components/tourney/TourneyHeader/TourneyHeaderText";
import { Toaster } from "../components/ui/toaster";
import { useCurrentTourney } from "../context/CurrentTourneyContext";
import { deleteScoreFromStages, upsertScoreInStages } from "../helpers/state/stages";
import { mergeAndFlattenRounds } from "../helpers/mergeAndFlattenRounds";

import type { Tourney } from "../types/Tourney";
import type { Round } from "../types/Round";
import type { Stage } from "../types/Stage";
import type { PlayerRound } from "../types/PlayerRound";
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Score } from "../types/Score";

function RoundPage() {
  const { tourneyId, roundId } = useParams<{
    tourneyId: string;
    roundId: string;
  }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;
  if (!roundId) return <div>Invalid Round ID</div>;

  const { tourney, setTourney } = useCurrentTourney();

  const [tourneyRounds, setTourneyRounds] = useState<Round[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    // Clear state whenever round changes, before new data arrives
    setRound(null);
    setPlayers([]);
    setStages([]);
  }, [roundId]);

  const { data: tourneys } = getSupabaseTable<Tourney>("tourneys", {
    column: "id",
    value: tourneyId,
  });
  const {
    data: allRoundsInTourney,
    loading: loadingRounds,
    error: errorRounds,
    refetch: refetchRounds
  } = getSupabaseTable<Round>("rounds", {
    column: "tourney_id",
    value: tourneyId,
  });
  const {
    data: playersData,
    loading: loadingPlayers,
    error: errorPlayers,
    refetch: refetchPlayers
  } = getSupabaseTable<PlayerRound>(
    "player_rounds",
    { column: "round_id", value: roundId },
    "*, player_tourneys(player_name)"
  );
  const {
    data: stagesData,
    loading: loadingStages,
    error: errorStages,
    refetch: refetchStages
  } = getSupabaseTable<Stage>(
    "stages",
    { column: "round_id", value: roundId },
    "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)"
  );
  const {
    data: tourneyPlayers,
    loading: loadingTourneyPlayers,
    error: errorTourneyPlayers,
    refetch: refetchTourneyPlayers
  } = getSupabaseTable<PlayerTourney>(
    "player_tourneys",
    { column: "tourney_id", value: tourneyId }
  );

  // Stores tourney table details
  useEffect(() => {
    if (tourneys?.length && tourneys[0].id !== tourney?.id) {
      setTourney(tourneys[0]);
    }
  }, [tourneys, tourney?.id, setTourney]);

  // Store rounds to state variable
  useEffect(() => {
    if (allRoundsInTourney?.length) {
      setTourneyRounds(prev => {
        const { sorted } = mergeAndFlattenRounds(prev, allRoundsInTourney);
        return sorted;
      });
    }
  }, [allRoundsInTourney]);

  // Stores current round based on tourneyRounds
  useEffect(() => {
    if (!allRoundsInTourney?.length) return;
    const fresh = allRoundsInTourney.find(
      r => r.id === Number(roundId)
    );
    setRound(fresh ?? null);
  }, [allRoundsInTourney, roundId]);

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

  // Subscribe to scores table changes (to update player scores in real-time)
  useEffect(() => {
    const channel = supabaseClient
      .channel('round-changes')
      .on(
        // Listen to all changes on scores table
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        (payload) => {
          setStages(prev => {
            if (payload.eventType === 'DELETE') {
              return deleteScoreFromStages(prev, payload.old.id);
            }

            const incoming = payload.new as Score;
            return upsertScoreInStages(prev, incoming);
          });
        }
      )
      .on(
        // Listen to all changes on stages table
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stages' },
        (payload) => {
          const newRow = payload.new as { round_id?: number };
          const eventType = payload.eventType;
          if (eventType === 'DELETE' || (newRow?.round_id && round?.id === newRow.round_id)) {
            refetchStages();
          }
        }
      )
      .on(
        // Listen to all changes on chart_pools table
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chart_pools' },
        (payload) => {
          const newRow = payload.new as { stage_id?: number };
          const eventType = payload.eventType;
          if (eventType === 'DELETE' || (newRow?.stage_id && stages.map(s => s.id).includes(newRow.stage_id))) {
            refetchStages();
          }
        }
      )
      .on(
        // Listen to all changes on player_rounds table
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_rounds' },
        (payload) => {
          const newRow = payload.new as { round_id?: number };
          const eventType = payload.eventType;
          if (eventType === 'DELETE' || (newRow?.round_id && round?.id === newRow.round_id)) {
            refetchPlayers();
          }
        }
      )
      .on(
        // Listen to all changes on rounds table
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds' },
        (payload) => {
          const newRow = payload.new as { tourney_id?: number };
          const eventType = payload.eventType;
          if (eventType === 'DELETE' || (newRow?.tourney_id && Number(tourneyId) === newRow.tourney_id)) {
            refetchRounds();
          }
        }
      )
      .on(
        // Listen to all changes on player_tourneys table
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_tourneys' },
        (payload) => {
          const newRow = payload.new as { tourney_id?: number };
          const eventType = payload.eventType;
          if (eventType === 'DELETE' || (newRow?.tourney_id && Number(tourneyId) === newRow.tourney_id)) {
            refetchTourneyPlayers();
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [roundId, tourney, tourneyPlayers, round, stages, players]);

  return (
    <Box mt={8}>
      <Toaster />
      <TourneyHeaderText
        rounds={tourneyRounds}
        setRounds={setTourneyRounds}
        currentRoundId={Number(roundId)}
      />

      <Separator mt={2} mb={4} />
      <RoundDetails
        round={round}
        setRound={setRound}
        rounds={tourneyRounds}
        setRounds={setTourneyRounds}
        players={players}
        stages={stages}
        loading={loadingRounds}
        error={errorRounds}
        tourneyId={Number(tourneyId)}
      />
      <Separator mt={"24px"} mb={"24px"} />
      <Container maxW="4xl">
        <Flex direction={["column", "column", "column", "row"]} gap={4}>
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
              tourneyPlayers={tourneyPlayers}
              loading={loadingPlayers || loadingTourneyPlayers}
              error={errorPlayers || errorTourneyPlayers}
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