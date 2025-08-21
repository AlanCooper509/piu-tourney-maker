import { useEffect, useState } from 'react'
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react'

import StartRoundButton from './StartRoundButton'
import EndRoundButton from './EndRoundButton'
import EditRoundDetailsButton from './EditRoundDetailsButton'
import { StatusElement } from '../StatusElement'
import EditableRoundName from '../tourney/EditableRoundName'
import { handleUpdateRoundName } from '../../handlers/handleUpdateRoundName'
import LeaderboardLinkButton from './LeaderboardLinkButton'

import type { Round } from '../../types/Round'
import type { PlayerRound } from '../../types/PlayerRound'
import type { Stage } from '../../types/Stage'
import PlayersAdvancingElement from './PlayersAdvancingElement'

interface RoundDetailsProps {
  round: Round | null
  setRound: (round: Round | null) => void
  players: PlayerRound[] | null
  stages: Stage[] | null
  loading: boolean
  error: Error | null
  tourneyId: number
  admin: boolean
  loadingAdmin: boolean
}

export function RoundDetails({ round, setRound, players, stages, loading, error, tourneyId, admin, loadingAdmin }: RoundDetailsProps) {
  // Edit round logic
  const [roundName, setRoundName] = useState(round?.name ?? '');
  const [playersAdvancing, setPlayersAdvancing] = useState(round?.players_advancing ?? -1);

  // Rename round logic
  const [updatingName, setUpdatingName] = useState(false);
  const onRenameRound = async (newName: string) => {
    if (!round) return;
    try {
      setUpdatingName(true);
      const updatedRound = await handleUpdateRoundName(round.id, newName);
      setRound(updatedRound);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingName(false);
    }
  };
  const roundNameText = (
    <>
      {!loadingAdmin && admin ?
        <EditableRoundName
          roundId={round?.id ?? 0}
          tourneyId={tourneyId}
          roundName={round?.name ?? ''}
          onRename={onRenameRound}
          isLoading={updatingName}
        /> :
        <></>
      }
    </>
  );

  useEffect(() => {
    setPlayersAdvancing(round?.players_advancing ?? -1);
    setRoundName(round?.name ?? '');
  }, [round]);

  return (
    <>
      <title>{roundName}</title>
      <Heading mb={2}>{roundNameText}</Heading>
      <Box>
        <VStack style={{gap: '0px'}}>
        {loading && <Text>Loading round...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        {!loading && !error && !round && <Text>Round ID not found.</Text>}
        {!loading && !error && round && (
          <>
          <StatusElement element={round} />
          <PlayersAdvancingElement playersAdvancing={playersAdvancing} roundStatus={round?.status} />
          <Text>Scoring: Cumulative</Text> {/* TODO: eventually make this a db param, etc.*/}
          <HStack mt={2}>
            <LeaderboardLinkButton tourneyId={tourneyId} roundId={round?.id ?? 0} />
            <EditRoundDetailsButton
              round={round}
              setRound={setRound}
              roundName={roundName}
              setRoundName={setRoundName}
              playersAdvancing={playersAdvancing}
              setPlayersAdvancing={setPlayersAdvancing}
              admin={admin}
              loadingAdmin={loadingAdmin}
            />
            {!loadingAdmin && admin && round?.status === "Not Started" && (
              <StartRoundButton
                round={round}
                setRound={setRound}
                players={players}
                stages={stages}
              />
            )}
            {!loadingAdmin && admin && round?.status === "In Progress" && (
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
  )
}