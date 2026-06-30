import { useEffect, useState, useMemo } from "react";
import { VStack, StackSeparator, Separator, Box, Stack } from "@chakra-ui/react"
import { useParams } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";

import getSupabaseTable from '../hooks/getSupabaseTable';

import TourneyHeaderText from "../components/tourney/TourneyHeader/TourneyHeaderText";
import { TourneyDetails } from "../components/tourney/TourneyDetails";
import { ColumnarTourneyPlayersList } from "../components/tourney/PlayersList/ColumnarTourneyPlayersList";
import { Toaster } from "../components/ui/toaster";
import ChartRulesList from "../components/tourney/ChartRulesList/ChartRulesList";
import { SidebarTourneyPlayersList } from "../components/tourney/PlayersList/SidebarTourneyPlayersList";
import { useCurrentTourney } from "../context/CurrentTourneyContext";
import { mergeAndFlattenRounds } from "../helpers/mergeAndFlattenRounds";
import { deleteRound, upsertRound } from "../helpers/state/rounds";
import { deletePlayerTourney, upsertPlayerTourney } from "../helpers/state/playerTourney";

import type { Tourney } from '../types/Tourney';
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Round } from "../types/Round";
import type { RoundPool } from "../types/RoundPool";
import type { ChartdrawConfig, ChartdrawConfigSpec, ChartdrawConfigWithSpecs } from "../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps, PickbanRulesetSteps } from "../types/Pickban";

function TourneyPage() {
  const { tourneyId } = useParams();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  const { tourney, setTourney } = useCurrentTourney();
  const [players, setPlayers] = useState<PlayerTourney[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundPools, setRoundPools] = useState<RoundPool[]>([]);
  const [chartdrawConfigs, setChartdrawConfigs] = useState<ChartdrawConfigWithSpecs[]>([]);
  const [pickbanRulesets, setPickbanRulesets] = useState<PickbanRulesetWithSteps[]>([]);


  // Initial Supabase Network Fetches
  const { data: tourneys, loading: loadingTourney, error: errorTourney } = getSupabaseTable<Tourney>(
    'tourneys',
    { column: 'id', value: tourneyId }
  );
  const { data: queriedTourneyPlayers, loading: loadingPlayers, error: errorPlayers } = getSupabaseTable<PlayerTourney>(
    'player_tourneys',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: queriedRoundsInTourney } = getSupabaseTable<Round>(
    'rounds',
    { column: 'tourney_id', value: tourneyId }
  );
  const { data: queriedRoundPools } = getSupabaseTable<RoundPool>(
    'round_pools',
    { column: "tourney_id", value: tourneyId }
  );
  const { data: queriedChartdrawConfigs } = getSupabaseTable<ChartdrawConfigWithSpecs>(
    'chartdraw_configs',
    { column: "tourney_id", value: tourneyId },
    "*, chartdraw_config_specs(*)"
  );
  const { data: queriedPickbanRulesets } = getSupabaseTable<PickbanRulesetWithSteps>(
    'pickban_rulesets',
    { column: "tourney_id", value: tourneyId },
    "*, pickban_ruleset_steps(*)"
  );

  // Seed Initial Data From Database Fetches
  useEffect(() => {
    if (tourneys?.length && tourneys[0].id !== tourney?.id) {
      setTourney(tourneys[0]);
    }
  }, [tourneys, tourney?.id, setTourney]);

  useEffect(() => {
    if (queriedTourneyPlayers) {
      const sortedPlayers = [...queriedTourneyPlayers].sort(
        (b, a) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlayers(sortedPlayers);
    }
  }, [queriedTourneyPlayers]);

  useEffect(() => {
    if (queriedRoundsInTourney) setRounds(queriedRoundsInTourney);
  }, [queriedRoundsInTourney]);

  useEffect(() => {
    if (queriedRoundPools) setRoundPools(queriedRoundPools);
  }, [queriedRoundPools]);

  useEffect(() => {
    if (queriedChartdrawConfigs) setChartdrawConfigs(queriedChartdrawConfigs);
  }, [queriedChartdrawConfigs]);

  useEffect(() => {
    if (queriedPickbanRulesets) setPickbanRulesets(queriedPickbanRulesets);
  }, [queriedPickbanRulesets]);

  const tourneyRounds = useMemo(() => {
    if (!rounds.length) return [];
    const { sorted } = mergeAndFlattenRounds([], rounds, roundPools);
    return sorted;
  }, [rounds, roundPools]);

  // Realtime Subscriptions
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

    const chartdrawConfigChannel = supabaseClient
      .channel('tourney-page-chartdraw-configs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chartdraw_configs' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setChartdrawConfigs(prev => prev.filter(c => c.id !== payload.old.id));
            return;
          }

          const incoming = payload.new as ChartdrawConfig;
          if (String(incoming.tourney_id) !== String(tourneyId)) return;

          setChartdrawConfigs(prev => {
            const currentConfig = prev.find(c => c.id === incoming.id);
            if (currentConfig) {
              return prev.map(c => c.id === incoming.id ? { ...incoming, chartdraw_config_specs: c.chartdraw_config_specs } : c);
            }
            return [...prev, { ...incoming, chartdraw_config_specs: [] }];
          });
        }
      )
      .subscribe();

    const chartdrawConfigSpecsChannel = supabaseClient
      .channel('tourney-page-chartdraw-config-specs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chartdraw_config_specs' },
        (payload) => {
          setChartdrawConfigs((prev: ChartdrawConfigWithSpecs[]) => {
            if (payload.eventType === 'DELETE') {
              return prev.map(config => ({
                ...config,
                chartdraw_config_specs: config.chartdraw_config_specs.filter(s => s.id !== payload.old.id)
              }));
            }

            const incomingSpec = payload.new as ChartdrawConfigSpec;

            return prev.map(config => {
              if (config.id !== incomingSpec.chartdraw_config_id) return config;

              const specExists = config.chartdraw_config_specs?.some(s => s.id === incomingSpec.id) || false;
              const updatedSpecs = specExists
                ? config.chartdraw_config_specs.map(s => s.id === incomingSpec.id ? incomingSpec : s)
                : [...(config.chartdraw_config_specs || []), incomingSpec];

              return { ...config, chartdraw_config_specs: updatedSpecs };
            });
          });
        }
      )
      .subscribe();

    const pickbanRulesetChannel = supabaseClient
      .channel('tourney-page-pickban-rulesets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickban_rulesets' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPickbanRulesets(prev => prev.filter(r => r.id !== payload.old.id));
            return;
          }

          const incoming = payload.new as PickbanRulesetWithSteps;
          if (String(incoming.tourney_id) !== String(tourneyId)) return;

          setPickbanRulesets(prev => {
            const exists = prev.find(r => r.id === incoming.id);
            if (exists) {
              return prev.map(r => r.id === incoming.id ? { ...incoming, pickban_ruleset_steps: r.pickban_ruleset_steps } : r);
            }
            return [...prev, { ...incoming, pickban_ruleset_steps: [] }];
          });
        }
      )
      .subscribe();

    const pickbanSequenceChannel = supabaseClient
      .channel('tourney-page-pickban-sequences-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickban_ruleset_steps' },
        (payload) => {
          setPickbanRulesets((prev: PickbanRulesetWithSteps[]) => {
            if (payload.eventType === 'DELETE') {
              return prev.map(ruleset => ({
                ...ruleset,
                pickban_ruleset_steps: ruleset.pickban_ruleset_steps.filter(s => s.id !== payload.old.id)
              }));
            }

            const incomingSeq = payload.new as PickbanRulesetSteps;

            return prev.map(ruleset => {
              if (ruleset.id !== incomingSeq.pickban_ruleset_id) return ruleset;

              const seqExists = ruleset.pickban_ruleset_steps.some(s => s.id === incomingSeq.id);
              const updatedSequences = seqExists
                ? ruleset.pickban_ruleset_steps.map(s => s.id === incomingSeq.id ? incomingSeq : s)
                : [...ruleset.pickban_ruleset_steps, incomingSeq];

              // Keeps the steps cleanly ordered whenever a realtime broadcast arrives
              updatedSequences.sort((a, b) => Number(a.sequence) - Number(b.sequence));

              return { ...ruleset, pickban_ruleset_steps: updatedSequences };
            });
          });
        }
      )
      .subscribe();


    return () => {
      supabaseClient.removeChannel(roundsChannel);
      supabaseClient.removeChannel(roundPoolsChannel);
      supabaseClient.removeChannel(playerTourneyChannel);
      supabaseClient.removeChannel(chartdrawConfigChannel);
      supabaseClient.removeChannel(chartdrawConfigSpecsChannel);
      supabaseClient.removeChannel(pickbanRulesetChannel);
      supabaseClient.removeChannel(pickbanSequenceChannel);
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
        {tourney?.type === "Double Elimination" ? (
          <Stack 
            direction={{ base: "column", md: "row" }}
            alignItems={{ base: "stretch", md: "start" }}
            gap={4}
          >
            <SidebarTourneyPlayersList
              players={players}
              setPlayers={setPlayers}
              loading={loadingPlayers}
              error={errorPlayers}
            />
            <ChartRulesList
              chartdrawConfigs={chartdrawConfigs || []}
              setChartdrawConfigs={setChartdrawConfigs}
              pickbanRulesets={pickbanRulesets || []}
              roundPools={roundPools || []}
              setRoundPools={setRoundPools}
            />
          </Stack>
        ) : (
          <ColumnarTourneyPlayersList
            players={players}
            setPlayers={setPlayers}
            loading={loadingPlayers}
            error={errorPlayers}
          />
        )}
      </VStack>
    </Box>
  );
}

export default TourneyPage;