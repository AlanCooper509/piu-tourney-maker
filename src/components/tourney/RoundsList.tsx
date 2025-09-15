import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import CustomCarousel from '../carousel/CustomCarousel';
import { handleUpdateRoundName } from '../../handlers/handleUpdateRoundName'
import { handleAddRoundToTourney } from '../../handlers/handleAddRoundToTourney';
import EditableRoundName from './EditableRoundName';
import RoundLink from './RoundLink';
import { toaster } from '../ui/toaster';
import { useIsAdminForTourney } from '../../context/TourneyAdminContext';
import { useCurrentTourney } from '../../context/CurrentTourneyContext';

import type { Tourney } from '../../types/Tourney';
import type { Round } from '../../types/Round';
import type { CarouselCard } from '../../types/CarouselCard';
import { StatusElement } from '../StatusElement';
import PlayersAdvancingElement from '../round/details/PlayersAdvancingElement';

interface RoundListProps {
  tourney: Tourney | null;
  rounds: Round[] | null;
  loading: boolean;
  error: Error | null;
}

export function RoundsList({ tourney, rounds, loading, error }: RoundListProps) {
  const { tourneyId, setTourneyId: _setTourneyId } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(Number(tourneyId));

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

  function onAddRound(name: string, advancing: number, nextRoundId: number | undefined) {
    if (!tourney) return;
    addRoundToTourney(
      tourney.id,
      name,
      advancing,
      nextRoundId,
      setRoundsState,
      setAddingRound
    );
  }

  const carouselInput: CarouselCard[] = !loading && !error && roundsState?.length
    ? roundsToCards(roundsState, onRenameRound, updatingRoundId)
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
        {!loadingTourneyAdminStatus && isTourneyAdmin ? (
          <CustomCarousel
            cards={carouselInput}
            isAdmin={true}
            adminClick={onAddRound}
            adminLoading={addingRound}
            newRoundName={newRoundName}
            setNewRoundName={setNewRoundName}
            newPlayersAdvancing={newPlayersAdvancing}
            setNewPlayersAdvancing={setNewPlayersAdvancing}
            rounds={rounds ?? undefined}
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

function roundsToCards(
  rounds: Round[],
  onRenameRound: (roundId: number, newName: string) => Promise<void>,
  updatingRoundId: number | null,
): CarouselCard[] {
  const { tourneyId, setTourneyId: _setTourneyId } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(Number(tourneyId));

  return rounds
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((round) => ({
      title: !loadingTourneyAdminStatus && isTourneyAdmin ? (
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
          <PlayersAdvancingElement playersAdvancing={round.players_advancing} roundStatus={round.status}></PlayersAdvancingElement>
        </VStack>
      ),
    }));
}

async function addRoundToTourney(
  tourneyId: number,
  name: string,
  players_advancing: number,
  nextRoundId: number | undefined,
  setRoundsState: React.Dispatch<React.SetStateAction<Round[]>>,
  setAddingRound: (val: boolean) => void
) {
  try {
    setAddingRound(true);

    const newRound = await handleAddRoundToTourney(
      tourneyId,
      name,
      players_advancing,
      nextRoundId
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
