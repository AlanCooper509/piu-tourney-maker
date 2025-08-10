import { VStack, StackSeparator } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';
import { TourneyDetails } from "../components/TourneyDetails";
import { PlayersList } from "../components/PlayersList";
import { RoundsList } from "../components/RoundsList";
import type { Tourney } from '../types/Tourney';
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Round } from "../types/Round";

function TourneyPage() {
  const { tourneyId } = useParams();
  const { data: tourneys, loading: loadingTourney, error: errorTourney } = getSupabaseTable<Tourney>(
    'tourneys',
    { column: 'id', value: tourneyId }
  );
  const { data: players, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerTourney>(
    'player_tourneys',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: rounds, loading: loadingRounds, error: errorRounds } = getSupabaseTable<Round>(
    'rounds',
    { column: 'tourney_id', value: tourneyId }
  );

  let tourney = null;
  if (!loadingTourney && !errorTourney) {
    tourney = tourneys[0];
  }
  return (
    <>
      <VStack separator={<StackSeparator />}>
        <TourneyDetails tourney={tourney} loading={loadingTourney} error={errorTourney} />
        <PlayersList players={players} loading={loadingPlayers} error={errorPlayers} />
        <RoundsList rounds={rounds} loading={loadingRounds} error={errorRounds} />
      </VStack>
    </>
  )
}

export default TourneyPage;