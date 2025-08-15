import { Box, Heading, Text, HStack, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import CustomCarousel from '../carousel/CustomCarousel';
import { handleUpdateRoundName } from '../../handlers/handleUpdateRoundName'
import { LiveIndicator } from '../ui/LiveIndicator'
import EditableRoundName from './EditableRoundName';
import RoundLink from './RoundLink';

import type { Round } from '../../types/Round';
import type { CarouselCard } from '../../types/CarouselCard';

interface RoundListProps {
  rounds: Round[] | null;
  loading: boolean;
  error: Error | null;
  admin: boolean;
  loadingAdmin: boolean;
}

function roundsToCards(
  rounds: Round[],
  onRenameRound: (roundId: number, newName: string) => Promise<void>,
  updatingRoundId: number | null,
  admin: boolean,
  loadingAdmin: boolean
): CarouselCard[] {
  return rounds
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((round) => ({
      title: !loadingAdmin && admin ? (
        <EditableRoundName
          roundId={round.id}
          tourneyId={round.tourney_id}
          roundName={round.name}
          onRename={(newName) => onRenameRound(round.id, newName)}
          isLoading={updatingRoundId === round.id}
        />
      ) : (
        <RoundLink
          tourneyId={round.tourney_id}
          roundId={round.id}
          roundName={round.name}
        />
      ),
      content: (
        <VStack>
          <Text fontSize="md">Status: {round.status ?? 'Unknown'}</Text>
          <HStack style={{ gap: '0px' }}>
            {round.status === 'In Progress' && <LiveIndicator />}
          </HStack>
          <Text fontSize="md">Players Advancing: {round.players_advancing}</Text>
        </VStack>
      ),
    }));
}

export function RoundsList({ rounds, loading, error, admin, loadingAdmin }: RoundListProps) {
  const [updatingRoundId, setUpdatingRoundId] = useState<number | null>(null);
  const [roundsState, setRoundsState] = useState<Round[]>(rounds ?? []);

  useEffect(() => {
    if (!rounds) return;

    setRoundsState(prev => {
      const prevById = new Map(prev.map(r => [r.id, r]));
      const merged = rounds.map(r => {
        const existing = prevById.get(r.id);
        return existing ? { ...existing, ...r } : r;
      });
      return merged.sort((a, b) => a.id - b.id);
    });
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
      throw error;
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

  const carouselInput: CarouselCard[] = !loading && !error && roundsState?.length
    ? roundsToCards(roundsState, onRenameRound, updatingRoundId, admin, loadingAdmin)
    : [];

  return (
    <Box>
      <Heading mb={2}>Rounds</Heading>
      {loading && <Text>Loading rounds...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {adminText}
      {!loading && !error && roundsState?.length ? (
        <>
          <CustomCarousel cards={carouselInput} />
        </>
      ) : (
        !loading && !error && <Text>No rounds found.</Text>
      )}
    </Box>
  );
}