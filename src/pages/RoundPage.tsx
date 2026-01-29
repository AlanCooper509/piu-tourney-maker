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
import { deleteChartPoolFromStages, deleteScoreFromStages, deleteStage, upsertChartPoolInStages, upsertScoreInStages, upsertStage } from "../helpers/state/stages";
import { deletePlayerFromRound, upsertPlayerInRound } from "../helpers/state/playerRounds";
import { deletePlayerTourney, upsertPlayerTourney } from "../helpers/state/playerTourney";
import { deleteRound, upsertRound } from "../helpers/state/rounds";
import { mergeAndFlattenRounds } from "../helpers/mergeAndFlattenRounds";

import type { ChartPool } from "../types/ChartPool";
import type { PlayerRound } from "../types/PlayerRound";
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Tourney } from "../types/Tourney";
import type { Round } from "../types/Round";
import type { Score } from "../types/Score";
import type { Stage } from "../types/Stage";

function RoundPage() {
  const { tourneyId, roundId } = useParams<{
    tourneyId: string;
    roundId: string;
  }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;
  if (!roundId) return <div>Invalid Round ID</div>;
  const activeRoundId = Number(roundId);

  const { tourney, setTourney } = useCurrentTourney();

  const [tourneyRounds, setTourneyRounds] = useState<Round[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tourneyPlayers, setTourneyPlayers] = useState<PlayerTourney[]>([]);

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
    error: errorRounds
  } = getSupabaseTable<Round>("rounds", {
    column: "tourney_id",
    value: tourneyId,
  });
  const {
    data: playersData,
    loading: loadingPlayers,
    error: errorPlayers
  } = getSupabaseTable<PlayerRound>(
    "player_rounds",
    { column: "round_id", value: roundId },
    "*, player_tourneys(player_name)"
  );
  const {
    data: stagesData,
    loading: loadingStages,
    error: errorStages
  } = getSupabaseTable<Stage>(
    "stages",
    { column: "round_id", value: roundId },
    "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)"
  );
  const {
    data: tourneyPlayersData,
    loading: loadingTourneyPlayers,
    error: errorTourneyPlayers
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
    if (!tourneyRounds?.length) return;
    const fresh = tourneyRounds.find(
      r => r.id === activeRoundId
    );
    setRound(fresh ?? null);
  }, [tourneyRounds, roundId]);

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

  useEffect(() => {
    setTourneyPlayers(tourneyPlayersData ?? []);
  }, [tourneyPlayersData]);

  // Subscribe to table changes (RealTime updates)
  useEffect(() => {
    const stagesChannel = supabaseClient
      .channel('stages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stages' },
        payload => {
          if (payload.eventType === 'DELETE') {
            setStages(prev => deleteStage(prev, payload.old.id));
            return;
          }
          const incoming = payload.new as Stage;
          if (!incoming || (incoming.round_id !== activeRoundId)) return;
          setStages(prev => upsertStage(prev, incoming));
        }
      )
      .subscribe();

    const scoresChannel = supabaseClient
      .channel('scores-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        payload => {
          if (payload.eventType === 'DELETE') {
            setStages(prev => deleteScoreFromStages(prev, payload.old.id));
            return;
          }
          const incoming = payload.new as Score;
          const stage = stages.find(s => s.id === incoming?.stage_id);
          if (!stage || (stage.round_id !== activeRoundId)) return;
          setStages(prev => upsertScoreInStages(prev, incoming));
        }
      )
      .subscribe();
        
    const chartPoolsChannel = supabaseClient
      .channel('chart-pools-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chart_pools' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setStages(prev => deleteChartPoolFromStages(prev, payload.old.id));
            return;
          }
          const incoming = payload.new as ChartPool;
          const stage = stages.find(s => s.id === incoming?.stage_id);
          if (!stage || (stage.round_id !== activeRoundId)) return;
          setStages(prev => upsertChartPoolInStages(prev, incoming));
        }
      )
      .subscribe();

    const playerRoundsChannel = supabaseClient
      .channel('player-rounds-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_rounds' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPlayers(prev => deletePlayerFromRound(prev, payload.old.id));
            return;
          }
          const incoming = payload.new as PlayerRound;
          if (incoming.round_id !== activeRoundId) return;
          setPlayers(prev => upsertPlayerInRound(prev, incoming, tourneyPlayersData ?? []));
        }
      )
      .subscribe();
    
    const roundsChannel = supabaseClient
      .channel('tourney-rounds-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds' },
        (payload) => {
          setTourneyRounds(prev => {
            if (payload.eventType === 'DELETE') {
              return deleteRound(prev, payload.old.id);
            }

            const incoming = payload.new as Round;
            if (incoming.tourney_id !== Number(tourneyId)) return prev;
            return upsertRound(prev, incoming);
          });
          setRound(prevRound => {
            if (payload.eventType === 'UPDATE' && prevRound && payload.new.id === prevRound.id) {
              return payload.new as Round;
            }
            return prevRound;
          });
        }
      )
      .subscribe();
    
    const playerTourneyChannel = supabaseClient
      .channel('tourney-players-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_tourneys' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTourneyPlayers(prev => deletePlayerTourney(prev, payload.old.id));
            return;
          }

          const incoming = payload.new as PlayerTourney;
          if (incoming.tourney_id !== Number(tourneyId)) return;
          setTourneyPlayers(prev => upsertPlayerTourney(prev, incoming));
        }
      )
      .subscribe();
    
    return () => {
      supabaseClient.removeChannel(scoresChannel);
      supabaseClient.removeChannel(stagesChannel);
      supabaseClient.removeChannel(chartPoolsChannel);
      supabaseClient.removeChannel(playerRoundsChannel);
      supabaseClient.removeChannel(roundsChannel);
      supabaseClient.removeChannel(playerTourneyChannel);
    };
  }, [roundId, tourney, tourneyPlayers, round, players, stages]);

  return (
    <Box mt={8}>
      <Toaster />
      <TourneyHeaderText
        rounds={tourneyRounds}
        setRounds={setTourneyRounds}
        currentRoundId={activeRoundId}
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