import { VStack, StackSeparator } from "@chakra-ui/react"
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import getSupabaseTable from '../hooks/getSupabaseTable';
import { isAdminForTourney } from "../hooks/AdminTourneyHelpers";
import { RoundDetails } from "../components/round/RoundDetails";
import { PlayersList } from "../components/round/PlayersList";
import { StagesList } from "../components/round/StagesList";
import { Toaster } from "../components/ui/toaster";

import type { Round } from "../types/Round";
import type { Stage } from "../types/Stage";
import type { PlayerRound } from "../types/PlayerRound";
import type { ChartPool } from "../types/ChartPool";

function RoundPage() {
  const { tourneyId, roundId } = useParams<{ tourneyId: string; roundId: string }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;
  if (!roundId) return <div>Invalid Round ID</div>;

  const [round, setRound] = useState<Round | null>(null);

  const { data: rounds, loading: loadingRound, error: errorRound } = getSupabaseTable<Round>(
    'rounds',
    { column: 'id', value: roundId }
  );
  const { data: players, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerRound>(
    'player_rounds',
    { column: 'round_id', value: roundId },
    '*, player_tourneys(player_name)'
  );
  const { data: stages, loading: loadingStages, error: errorStages } =
    getSupabaseTable<Stage & { chart_pools: ChartPool[] }>(
      'stages',
      { column: 'round_id', value: roundId },
      '*, chart_pools(*, charts(*))'
    );

  // Stores round table details and sets isAdmin
    useEffect(() => {
      if (rounds?.length) {
        setRound(rounds[0]);
      }
    }, [rounds]);
    const { isAdmin, loading: loadingAdmin } = isAdminForTourney(Number(tourneyId));

  return (
    <>
      <Toaster />
      <VStack separator={<StackSeparator />}>
        <RoundDetails round={round} setRound={setRound} players={players} stages={stages} loading={loadingRound} error={errorRound} tourneyId={Number(tourneyId)} admin={isAdmin} loadingAdmin={loadingAdmin} />
        <PlayersList players={players} loading={loadingPlayers} error={errorPlayers} admin={isAdmin} loadingAdmin={loadingAdmin} />
        <StagesList stages={stages} loading={loadingStages} error={errorStages} admin={isAdmin} loadingAdmin={loadingAdmin} />
      </VStack>
    </>
  );
};

export default RoundPage;
