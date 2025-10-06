import { useState } from 'react'
import { Box, HStack, Link, Text, VStack } from '@chakra-ui/react'

import StartRoundButton from '../StartRoundButton'
import EndRoundButton from '../EndRoundButton'
import EditRoundDetailsButton from './EditRoundDetailsButton'
import { StatusElement } from '../../StatusElement'
import LeaderboardLinkButton from '../LeaderboardLinkButton'
import PlayersAdvancingElement from './PlayersAdvancingElement'
import { useIsAdminForTourney } from '../../../context/admin/AdminTourneyContext'

import type { Round } from '../../../types/Round'
import type { PlayerRound } from '../../../types/PlayerRound'
import type { Stage } from '../../../types/Stage'

interface RoundDetailsProps {
  round: Round | null
  setRound: (round: Round | null) => void
  rounds?: Round[]
  players: PlayerRound[] | null
  stages: Stage[] | null
  loading: boolean
  error: Error | null
  tourneyId: number
}

export function RoundDetails({ 
  round, 
  setRound,
  rounds, 
  players, 
  stages, 
  loading, 
  error, 
  tourneyId
}: RoundDetailsProps) {
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourneyId);

  // Local edit state only
  const [roundNameDraft, setRoundNameDraft] = useState<string | null>(null);
  const [playersAdvancingDraft, setPlayersAdvancingDraft] = useState<number | null>(null);

  // If not editing, fall back to props
  const roundName = roundNameDraft ?? round?.name ?? '';
  const playersAdvancing = playersAdvancingDraft ?? round?.players_advancing ?? -1;

  const nextRound = rounds?.find(r => r.id === round?.next_round_id);

  return (
    <>
      <title>{roundName}</title>
      <Box>
        <VStack style={{ gap: '0px' }}>
          {loading && <Text>Loading round...</Text>}
          {error && <Text color="red">Error: {error.message}</Text>}
          {!loading && !error && !round && <Text>Round ID not found.</Text>}
          {!loading && !error && round && (
            <>
              {!loadingTourneyAdminStatus && isTourneyAdmin && (
                <Box my={2}>
                    <EditRoundDetailsButton
                      round={round}
                      setRound={setRound}
                      rounds={rounds}
                      roundName={roundName}
                      setRoundName={setRoundNameDraft}
                      playersAdvancing={playersAdvancing}
                      setPlayersAdvancing={setPlayersAdvancingDraft}
                    />
                </Box>
              )}

              <StatusElement element={round} />
              <PlayersAdvancingElement
                playersAdvancing={playersAdvancing}
                roundStatus={round?.status}
              />
              <Text>Scoring: Cumulative</Text>
              {round && round.next_round_id && nextRound && (
                <Text>Next Round: <Link href={`/tourney/${tourneyId}/round/${nextRound.id}`}>{nextRound.name}</Link></Text>
              )}
              <HStack mt={2}>
                <LeaderboardLinkButton
                  tourneyId={tourneyId}
                  roundId={round?.id ?? 0}
                />
                {!loadingTourneyAdminStatus && isTourneyAdmin && round?.status === 'Not Started' && (
                  <StartRoundButton
                    round={round}
                    setRound={setRound}
                    players={players}
                    stages={stages}
                  />
                )}
                {!loadingTourneyAdminStatus && isTourneyAdmin && round?.status === 'In Progress' && (
                  <EndRoundButton
                    tourneyId={tourneyId}
                    round={round}
                    setRound={setRound}
                  />
                )}
              </HStack>
            </>
          )}
        </VStack>
      </Box>
    </>
  );
}