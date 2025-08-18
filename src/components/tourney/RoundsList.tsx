import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import CustomCarousel from '../carousel/CustomCarousel';
import { handleUpdateRoundName } from '../../handlers/handleUpdateRoundName'
import { handleAddRoundToTourney } from '../../handlers/handleAddRoundToTourney';
import EditableRoundName from './EditableRoundName';
import RoundLink from './RoundLink';
import { toaster } from '../ui/toaster';

import type { Tourney } from '../../types/Tourney';
import type { Round } from '../../types/Round';
import type { CarouselCard } from '../../types/CarouselCard';
import { StatusElement } from '../StatusElement';

interface RoundListProps {
  tourney: Tourney | null;
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
          <StatusElement element={round} />
          <Text fontSize="md">Players Advancing: {round.players_advancing}</Text>
        </VStack>
      ),
    }));
}

async function addRoundToTourney(
  tourneyId: number,
  name: string,
  players_advancing: number,
  setRoundsState: React.Dispatch<React.SetStateAction<Round[]>>,
  setAddingRound: (val: boolean) => void
) {
  try {
    setAddingRound(true);

    const newRound = await handleAddRoundToTourney(
      tourneyId,
      name,
      players_advancing
    );

    setRoundsState((prev: Round[]) => [...(prev ?? []), newRound]);

    toaster.create({
      title: "Round Added",
      description: `Round "${newRound.name}" was added successfully.`,
      type: "success",
      closable: true,
    });
  } catch (err: any) {
    toaster.create({
      title: err.message.includes("already exists")
        ? "Duplicate Round"
        : "Failed to add round",
      description: err.message,
      type: "error",
      closable: true,
    });
  } finally {
    setAddingRound(false);
  }
}

export function RoundsList({ tourney, rounds, loading, error, admin, loadingAdmin }: RoundListProps) {
  const [updatingRoundId, setUpdatingRoundId] = useState<number | null>(null);
  const [roundsState, setRoundsState] = useState<Round[]>(rounds ?? []);
  const [newRoundName, setNewRoundName] = useState('');
  const [newPlayersAdvancing, setNewPlayersAdvancing] = useState(0);
  const [addingRound, setAddingRound] = useState(false);

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

  const onAddRound = () => {
    if (!tourney) return;
    if (!newRoundName.trim()) {
      toaster.create({
        title: "Invalid Round Name",
        description: "Round name cannot be empty.",
        type: "error",
        closable: true,
      });
      return;
    }
    if (newPlayersAdvancing < 1) {
      toaster.create({
        title: "Invalid Players Advancing",
        description: "Players advancing must be at least 1.",
        type: "error",
        closable: true,
      });
      return;
    }
    addRoundToTourney(
      tourney.id,
      newRoundName,
      newPlayersAdvancing,
      setRoundsState,
      setAddingRound
    );
  };

  const carouselInput: CarouselCard[] = !loading && !error && roundsState?.length
    ? roundsToCards(roundsState, onRenameRound, updatingRoundId, admin, loadingAdmin)
    : [];

  return (
    <Box>
      <Heading mb={2}>Rounds</Heading>
      {loading && <Text>Loading rounds...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {!loading && !error && !roundsState?.length && (
        <Text mb={4}>No rounds found.</Text>
      )}
      {!loading && !error ? (
        <>
        {admin ? (
          <CustomCarousel
            cards={carouselInput}
            isAdmin={true}
            adminClick={onAddRound}
            adminLoading={addingRound}
            newRoundName={newRoundName}
            setNewRoundName={setNewRoundName}
            newPlayersAdvancing={newPlayersAdvancing}
            setNewPlayersAdvancing={setNewPlayersAdvancing}
          />
        ) : (
          <CustomCarousel cards={carouselInput} />
        )}
        </>
      ) : (
        <></>
      )}
    </Box>
  );
}