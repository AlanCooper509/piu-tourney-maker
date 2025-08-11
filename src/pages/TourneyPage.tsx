import { VStack, StackSeparator } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';
import { isAdminForTourney } from "../hooks/AdminTourneyHelpers";

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

  const tourney = (!loadingTourney && !errorTourney && tourneys?.length > 0) ? tourneys[0] : null;
  const { isAdmin, loading: loadingAdmin } = isAdminForTourney(tourney && tourney.id ? tourney.id : 0);

  return (
    <>
      <VStack separator={<StackSeparator />}>
        <TourneyDetails
          tourney={tourney}
          loading={loadingTourney}
          error={errorTourney}
          admin={isAdmin}
          loadingAdmin={loadingAdmin}
        />
        <PlayersList
          players={players}
          loading={loadingTourney}
          error={errorTourney}
          admin={isAdmin} 
          loadingAdmin={loadingAdmin}
        />
        <RoundsList
          rounds={rounds}
          loading={loadingRounds}
          error={errorRounds}
          admin={isAdmin}
          loadingAdmin={loadingAdmin}
        />
      </VStack>
    </>
  );
}

export default TourneyPage;