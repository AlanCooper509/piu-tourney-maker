import { useEffect, useState } from "react";
import { VStack, StackSeparator, Heading, Link, Separator } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';

import { TourneyDetails } from "../components/tourney/TourneyDetails";
import { PlayersList } from "../components/tourney/PlayersList";
import { RoundsList } from "../components/tourney/RoundsList";
import { Toaster } from "../components/ui/toaster";
import { useCurrentTourney } from "../context/CurrentTourneyContext";

import type { Tourney } from '../types/Tourney';
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Round } from "../types/Round";
import RoundsNavbar from "../components/round/RoundsNavbar";

function TourneyPage() {
  const { tourneyId } = useParams();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  setTourneyIdContext();

  const [tourney, setTourney] = useState<Tourney | null>(null);
  const [players, setPlayers] = useState<PlayerTourney[]>([]);


  const { data: tourneys, loading: loadingTourney, error: errorTourney } = getSupabaseTable<Tourney>(
    'tourneys',
    { column: 'id', value: tourneyId }
  );
  const { data: playersData, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerTourney>(
    'player_tourneys',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: rounds, loading: loadingRounds, error: errorRounds } = getSupabaseTable<Round>(
    'rounds',
    { column: 'tourney_id', value: tourneyId }
  );

  // Stores tourney table details
  useEffect(() => {
    if (tourneys?.length) {
      setTourney(tourneys[0]);
    }
  }, [tourneys]);

  // Sync players when playersData changes
  useEffect(() => {
    if (playersData) {
      const sortedPlayers = [...playersData].sort(
        (b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlayers(sortedPlayers);
    }
  }, [playersData]);

  // sort rounds
  const sortedRounds = rounds?.slice().sort((a, b) => a.id - b.id);

  return (
    <>
      <Toaster />
      <Heading fontSize={["3xl", "3xl", "3xl", "4xl"]}>
        <Link
          href={`/tourney/${tourneyId}`}
          color="cyan.solid"
          variant="underline"
          _hover={{ color: 'cyan.focusRing' }}
          _focus={{ color: 'cyan.solid', boxShadow: 'none' }}
        >
          {tourney?.name}
        </Link>
      </Heading>
      <RoundsNavbar tourneyId={Number(tourneyId)} rounds={sortedRounds}></RoundsNavbar>
      <Separator mt={2} mb={4} />
      <VStack separator={<StackSeparator />}>
        <TourneyDetails
          tourney={tourney}
          setTourney={setTourney}
          players={players}
          rounds={sortedRounds}
          loading={loadingTourney}
          error={errorTourney}
        />
        <PlayersList
          tourney={tourney}
          players={players}
          setPlayers={setPlayers}
          loading={loadingPlayers}
          error={errorPlayers}
        />
        <RoundsList
          tourney={tourney}
          rounds={sortedRounds}
          loading={loadingRounds}
          error={errorRounds}
        />
      </VStack>
    </>
  );
}

function setTourneyIdContext() {
  // save the current tourney id into the TourneyPage's context
  const { tourneyId: tourneyIdStr } = useParams<{ tourneyId: string }>();
  const { setTourneyId } = useCurrentTourney();
  useEffect(() => {
    if (tourneyIdStr) {
      setTourneyId(Number(tourneyIdStr));
    }
  }, [tourneyIdStr, setTourneyId]);
}

export default TourneyPage;