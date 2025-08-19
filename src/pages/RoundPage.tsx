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

function RoundPage() {
  const { tourneyId, roundId } = useParams<{ tourneyId: string; roundId: string }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;
  if (!roundId) return <div>Invalid Round ID</div>;

  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  const { data: rounds, loading: loadingRound, error: errorRound } = getSupabaseTable<Round>(
    'rounds',
    { column: 'id', value: roundId }
  );
  const { data: playersData, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerRound>(
    'player_rounds',
    { column: 'round_id', value: roundId },
    '*, player_tourneys(player_name)'
  );
  const { data: stagesData, loading: loadingStages, error: errorStages } =
    getSupabaseTable<Stage>(
      'stages',
      { column: 'round_id', value: roundId },
      '*, chart_pools(*, charts(*)), charts:chart_id(*)'
    );

  // Sync players when playersData changes
  useEffect(() => {
    if (playersData) {
      const sortedPlayers = [...playersData].sort(
        (b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
        <PlayersList round={round} players={players} setPlayers={setPlayers} tourneyId={Number(tourneyId)} loading={loadingPlayers} error={errorPlayers} admin={isAdmin} loadingAdmin={loadingAdmin} />
        <StagesList round={round} stages={stages} setStages={setStages} loading={loadingStages} error={errorStages} admin={isAdmin} loadingAdmin={loadingAdmin} />
      </VStack>
    </>
  );
};

export default RoundPage;
