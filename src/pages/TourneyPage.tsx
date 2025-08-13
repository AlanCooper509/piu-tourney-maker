import { useEffect, useState } from "react";
import { VStack, StackSeparator, Button, Input } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';
import { isAdminForTourney } from "../hooks/AdminTourneyHelpers";
import { handleStartTourney } from "../handlers/handleStartTourney";

import { TourneyDetails } from "../components/tourney/TourneyDetails";
import { PlayersList } from "../components/tourney/PlayersList";
import { RoundsList } from "../components/tourney/RoundsList";

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

  // Stores tourney table details and sets isAdmin
  const [tourney, setTourney] = useState<Tourney | null>(null);
  useEffect(() => {
    if (tourneys?.length) {
      setTourney(tourneys[0]);
    }
  }, [tourneys]);
  const { isAdmin, loading: loadingAdmin } = isAdminForTourney(tourney && tourney.id ? tourney.id : 0);

  // Start tourney logic
  const handleStartClick = async () => {
    if (!tourney) return;
    try {
      const updated = await handleStartTourney(tourney.id);
      setTourney(updated[0]);
    } catch (err) {
      console.error("Failed to start tourney:", err);
    }
  };

  return (
    <>
      <VStack separator={<StackSeparator />}>
        <TourneyDetails
          tourney={tourney}
          setTourney={setTourney}
          loading={loadingTourney}
          error={errorTourney}
          admin={isAdmin}
          loadingAdmin={loadingAdmin}
        />
        <PlayersList
          players={players}
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
        {isAdmin && tourney?.status !== "In Progress" && (
          <Button colorPalette="green" onClick={handleStartClick}>
            Start Tourney
          </Button>
        )}
      </VStack>
    </>
  );
}

export default TourneyPage;