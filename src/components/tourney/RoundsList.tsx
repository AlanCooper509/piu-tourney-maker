import { Box, Heading, Text, HStack, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import CustomCarousel from '../carousel/CustomCarousel';
import { handleUpdateRoundName } from '../../handlers/handleUpdateRoundName'
import { LiveIndicator } from '../ui/LiveIndicator'
import EditableRoundName from './EditableRoundName';

import type { Round } from '../../types/Round';
import type { CarouselCard } from '../../types/CarouselCard';

interface RoundListProps {
  rounds: Round[] | null;
  loading: boolean;
  error: Error | null;
  admin: boolean;
  loadingAdmin: boolean;
}

function roundsToCards(rounds: Round[], onRenameRound: (roundId: number, newName: string) => Promise<void>): CarouselCard[] {
  return rounds
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((round) => ({
      title: (
        <EditableRoundName
          roundId={round.id}
          tourneyId={round.tourney_id}
          roundName={round.name}
          onRename={(newName) => onRenameRound(round.id, newName)}
        />
      ),
      content: (
          <VStack>
            <Text fontSize={"md"}>Status: {round.status ?? 'Unknown'}</Text>
            <HStack style={{gap: '0px'}}>
              {round.status === 'In Progress' && <LiveIndicator />}
            </HStack>
            <Text fontSize={"md"}>Players Advancing: {round.players_advancing}</Text>
          </VStack>
      ),
    }));
}

export function RoundsList({ rounds, loading, error, admin, loadingAdmin }: RoundListProps) {
  const [updatingRoundId, setUpdatingRoundId] = useState<number | null>(null);
  const [roundsState, setRoundsState] = useState<Round[]>(rounds ?? []);
  console.log(updatingRoundId) // TODO: remove after using (TS complaining)

  useEffect(() => {
    if (rounds) setRoundsState(rounds);
  }, [rounds]);

  const onRenameRound = async (roundId: number, newName: string) => {
    const round = roundsState.find(r => r.id === roundId);
    if (!round) return;

    try {
      setUpdatingRoundId(roundId);
      const updatedRound = await handleUpdateRoundName(roundId, newName);
      setRoundsState(prev =>
        prev.map(r => (r.id === roundId ? updatedRound : r))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingRoundId(null);
    }
  };

  const adminText = (
    <>
      {loadingAdmin && <Text>Loading admin status...</Text>}
      {admin ?
        <Text>(You are an admin for this tournament, you can add/modify rounds)</Text> :
        <></>
      }
    </>
  );

  const carouselInput: CarouselCard[] = !loading && !error && rounds?.length
    ? roundsToCards(rounds, onRenameRound)
    : [];

  return (
    <Box>
      <Heading mb={2}>Rounds</Heading>
      {loading && <Text>Loading rounds...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {adminText}
      {!loading && !error && rounds?.length ? (
        <>
          <CustomCarousel cards={carouselInput} />
        </>
      ) : (
        !loading && !error && <Text>No rounds found.</Text>
      )}
    </Box>
  );
}