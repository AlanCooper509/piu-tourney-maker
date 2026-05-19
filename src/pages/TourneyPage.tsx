import { useEffect, useState, useMemo } from "react";
import { VStack, StackSeparator, Separator, Box } from "@chakra-ui/react"
import { useParams } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";

import getSupabaseTable from '../hooks/getSupabaseTable';

import TourneyHeaderText from "../components/tourney/TourneyHeader/TourneyHeaderText";
import { TourneyDetails } from "../components/tourney/TourneyDetails";
import { ColumnarTourneyPlayersList } from "../components/tourney/PlayersList/ColumnarTourneyPlayersList";
import { Toaster } from "../components/ui/toaster";
import { useCurrentTourney } from "../context/CurrentTourneyContext";
import { mergeAndFlattenRounds } from "../helpers/mergeAndFlattenRounds";
import { deleteRound, upsertRound } from "../helpers/state/rounds";
import { deletePlayerTourney, upsertPlayerTourney } from "../helpers/state/playerTourney";

import type { Tourney } from '../types/Tourney';
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Round } from "../types/Round";
import type { RoundPool } from "../types/RoundPool";

function TourneyPage() {
  const { tourneyId } = useParams();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  const { tourney, setTourney } = useCurrentTourney();
  const [players, setPlayers] = useState<PlayerTourney[]>([]);
  
  // Track the raw data rows locally so realtime can update them
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundPools, setRoundPools] = useState<RoundPool[]>([]);

  // Initial Supabase Network Fetches
  const { data: tourneys, loading: loadingTourney, error: errorTourney } = getSupabaseTable<Tourney>(
    'tourneys',
    { column: 'id', value: tourneyId }
  );
  const { data: playersData, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerTourney>(
    'player_tourneys',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: allRoundsInTourney } = getSupabaseTable<Round>(
    'rounds',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: allRoundPoolsInTourney } = getSupabaseTable<RoundPool>(
    'round_pools',
    { column: "tourney_id", value: tourneyId }
  );

  // 1. Seed Initial Data From Database Fetches
  useEffect(() => {
    if (tourneys?.length && tourneys[0].id !== tourney?.id) {
      setTourney(tourneys[0]);
    }
  }, [tourneys, tourney?.id, setTourney]);

  useEffect(() => {
    if (playersData) {
      const sortedPlayers = [...playersData].sort(
        (b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlayers(sortedPlayers);
    }
  }, [playersData]);

  useEffect(() => {
    if (allRoundsInTourney) setRounds(allRoundsInTourney);
  }, [allRoundsInTourney]);

  useEffect(() => {
    if (allRoundPoolsInTourney) setRoundPools(allRoundPoolsInTourney);
  }, [allRoundPoolsInTourney]);

  const tourneyRounds = useMemo(() => {
    if (!rounds.length) return [];
    const { sorted } = mergeAndFlattenRounds([], rounds, roundPools);
    return sorted;
  }, [rounds, roundPools]);

  // 3. Realtime Subscriptions
  useEffect(() => {
    const roundsChannel = supabaseClient
      .channel('tourney-page-rounds-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds' },
        (payload) => {
          setRounds(prev => {
            if (payload.eventType === 'DELETE') {
              return deleteRound(prev, payload.old.id);
            }

            const incoming = payload.new as Round;
            if (String(incoming.tourney_id) !== String(tourneyId)) return prev;
            return upsertRound(prev, incoming);
          });
        }
      )
      .subscribe();

    const roundPoolsChannel = supabaseClient
      .channel('tourney-page-pools-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'round_pools' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setRoundPools(prev => prev.filter(p => p.id !== payload.old.id));
            return;
          }

          const incoming = payload.new as RoundPool;
          if (String(incoming.tourney_id) !== String(tourneyId)) return;
          setRoundPools(prev => {
            const exists = prev.find(p => p.id === incoming.id);
            if (exists) return prev.map(p => p.id === incoming.id ? incoming : p);
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    const playerTourneyChannel = supabaseClient
      .channel('tourney-page-players-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_tourneys' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPlayers(prev => deletePlayerTourney(prev, payload.old.id));
            return;
          }

          const incoming = payload.new as PlayerTourney;
          if (String(incoming.tourney_id) !== String(tourneyId)) return;
          setPlayers(prev => upsertPlayerTourney(prev, incoming));
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(roundsChannel);
      supabaseClient.removeChannel(roundPoolsChannel);
      supabaseClient.removeChannel(playerTourneyChannel);
    };
  }, [tourneyId]);

  return (
    <Box mt={8}>
      <Toaster />
      <TourneyHeaderText 
        rounds={tourneyRounds} 
        setRounds={setRounds}
        currentRoundId={NaN} 
        roundPools={roundPools} 
      />
      <Separator mt={2} mb={4} />
      <VStack separator={<StackSeparator />}>
        <TourneyDetails
          players={players}
          rounds={tourneyRounds}
          loading={loadingTourney}
          error={errorTourney}
        />
        <ColumnarTourneyPlayersList
          players={players}
          setPlayers={setPlayers}
          loading={loadingPlayers}
          error={errorPlayers}
        />
      </VStack>
    </Box>
  );
}

export default TourneyPage;