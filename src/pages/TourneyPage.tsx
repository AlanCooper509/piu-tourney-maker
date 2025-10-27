import { useEffect, useState } from "react";
import { VStack, StackSeparator, Separator, Box } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';

import TourneyHeaderText from "../components/tourney/TourneyHeader/TourneyHeaderText";
import { TourneyDetails } from "../components/tourney/TourneyDetails";
import { PlayersList } from "../components/tourney/PlayersList";
import { Toaster } from "../components/ui/toaster";
import { useCurrentTourney } from "../context/CurrentTourneyContext";
import { mergeAndFlattenRounds } from "../helpers/mergeAndFlattenRounds";

import type { Tourney } from '../types/Tourney';
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Round } from "../types/Round";

function TourneyPage() {
  const { tourneyId } = useParams();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  const { tourney, setTourney } = useCurrentTourney();
  const [tourneyRounds, setTourneyRounds] = useState<Round[]>([]);
  const [players, setPlayers] = useState<PlayerTourney[]>([]);

  const { data: tourneys, loading: loadingTourney, error: errorTourney } = getSupabaseTable<Tourney>(
    'tourneys',
    { column: 'id', value: tourneyId }
  );
  const { data: playersData, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerTourney>(
    'player_tourneys',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: allRoundsInTourney } = getSupabaseTable<Round>(
    'rounds',
    { column: 'tourney_id', value: tourneyId }
  );

  // Stores tourney table details
  useEffect(() => {
    if (tourneys?.length && tourneys[0].id !== tourney?.id) {
      setTourney(tourneys[0]);
    }
  }, [tourneys, tourney?.id, setTourney]);

  // Sync players when playersData changes
  useEffect(() => {
    if (playersData) {
      const sortedPlayers = [...playersData].sort(
        (b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlayers(sortedPlayers);
    }
  }, [playersData]);

  // Store rounds details
  useEffect(() => {
    if (allRoundsInTourney?.length) {
       setTourneyRounds(prev => {
         const { sorted } = mergeAndFlattenRounds(prev, allRoundsInTourney);
         return sorted;
       });
    }
  }, [allRoundsInTourney]);

  return (
    <Box mt={8}>
      <Toaster />
      <TourneyHeaderText rounds={tourneyRounds} setRounds={setTourneyRounds} currentRoundId={NaN} />
      <Separator mt={2} mb={4} />
      <VStack separator={<StackSeparator />}>
        <TourneyDetails
          players={players}
          rounds={tourneyRounds}
          loading={loadingTourney}
          error={errorTourney}
        />
        <PlayersList
          players={players}
          setPlayers={setPlayers}
          loading={loadingPlayers}
          error={errorPlayers}
        />
      </VStack>
    </Box>
  );
}

export default TourneyPage;