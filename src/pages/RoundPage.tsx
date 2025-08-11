import { VStack, StackSeparator } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';
import { RoundDetails } from "../components/round/RoundDetails";
import { PlayersList } from "../components/round/PlayersList";
import { StagesList } from "../components/round/StagesList";
import { isAdminForTourney } from "../hooks/AdminTourneyHelpers";

import type { Round } from "../types/Round";
import type { Stage } from "../types/Stage";
import type { PlayerRound } from "../types/PlayerRound";
import type { ChartPool } from "../types/ChartPool";

const RoundPage: React.FC = () => {
  const { tourneyId, roundId } = useParams<{ tourneyId: string; roundId: string }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;

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

  const round: Round | null = (!loadingRound && !errorRound && rounds?.length > 0) ? rounds[0] : null;
  const { isAdmin, loading: loadingAdmin } = isAdminForTourney(Number(tourneyId));

  return (
    <>
      <VStack separator={<StackSeparator />}>
        <RoundDetails round={round} loading={loadingRound} error={errorRound} admin={isAdmin} loadingAdmin={loadingAdmin} />
        <PlayersList players={players} loading={loadingPlayers} error={errorPlayers} admin={isAdmin} loadingAdmin={loadingAdmin} />
        <StagesList stages={stages} loading={loadingStages} error={errorStages} admin={isAdmin} loadingAdmin={loadingAdmin} />
      </VStack>
    </>
  );
};

export default RoundPage;
