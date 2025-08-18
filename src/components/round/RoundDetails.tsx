import { useState } from 'react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'

import { StatusElement } from '../StatusElement'

import type { Round } from '../../types/Round'
import type { PlayerRound } from '../../types/PlayerRound'
import type { Stage } from '../../types/Stage'
import EditableRoundName from '../tourney/EditableRoundName'
import { handleUpdateRoundName } from '../../handlers/handleUpdateRoundName'
import StartRoundButton from './StartRoundButton'


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
        <Text>{round?.name ?? ''}</Text>
      }
    </>
  );
  return (
    <>
      <title>{round && round.name ? round.name : 'Round Details'}</title>
      <Heading mb={2}>{roundNameText}</Heading>
      <Box>
        <VStack style={{gap: '0px'}}>
        {loading && <Text>Loading round...</Text>}
        {error && <Text color="red">Error: {error.message}</Text>}
        {!loading && !error && !round && <Text>Round ID not found.</Text>}
        {!loading && !error && round && (
          <>
            <StatusElement element={round} />
            <Text>Players Advancing: {round.players_advancing}</Text>
            {!loadingAdmin && admin && round?.status === "Not Started" && (
              <StartRoundButton
                round={round}
                setRound={setRound}
                players={players}
                stages={stages}
              />
            )}
          </>
        )}
        </VStack>
      </Box>
    </>
  )
}