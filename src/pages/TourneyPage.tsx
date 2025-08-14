import { useEffect, useState } from "react";
import { VStack, StackSeparator } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';
import { isAdminForTourney } from "../hooks/AdminTourneyHelpers";

import { TourneyDetails } from "../components/tourney/TourneyDetails";
import { PlayersList } from "../components/tourney/PlayersList";
import { RoundsList } from "../components/tourney/RoundsList";
import { Toaster } from "../components/ui/toaster";

import type { Tourney } from '../types/Tourney';
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Round } from "../types/Round";

function TourneyPage() {
  const { tourneyId } = useParams();

  const [tourney, setTourney] = useState<Tourney | null>(null);
  const [players, setPlayers] = useState<PlayerTourney[]>([]);


  const { data: tourneys, loading: loadingTourney, error: errorTourney } = getSupabaseTable<Tourney>(
    'tourneys',
    { column: 'id', value: tourneyId }
  );
  const { data: playersData, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerTourney>(
    'player_tourneys',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: rounds, loading: loadingRounds, error: errorRounds } = getSupabaseTable<Round>(
    'rounds',
    { column: 'tourney_id', value: tourneyId }
  );

  // Stores tourney table details and sets isAdmin
  useEffect(() => {
    if (tourneys?.length) {
      setTourney(tourneys[0]);
    }
  }, [tourneys]);
  const { isAdmin, loading: loadingAdmin } = isAdminForTourney(tourney && tourney.id ? tourney.id : 0);

  // Sync players when playersData changes
  useEffect(() => {
    if (playersData) {
      const sortedPlayers = [...playersData].sort(
        (b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlayers(sortedPlayers);
    }
  }, [playersData]);

  return (
    <>
      <Toaster />
      <VStack separator={<StackSeparator />}>
        <TourneyDetails
          tourney={tourney}
          setTourney={setTourney}
          players={players}
          rounds={rounds}
          loading={loadingTourney}
          error={errorTourney}
          admin={isAdmin}
          loadingAdmin={loadingAdmin}
        />
        <PlayersList
          tourney={tourney}
          players={players}
          setPlayers={setPlayers}
          loading={loadingPlayers}
          error={errorPlayers}
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