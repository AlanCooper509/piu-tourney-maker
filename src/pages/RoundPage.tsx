import { Flex, Box, Container, Separator, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { supabaseClient } from "../lib/supabaseClient";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { RoundDetails } from "../components/round/details/RoundDetails";
import { PlayersH2H } from "../components/round/PlayersH2H";
import { PlayersList } from "../components/round/PlayersList";
import { StagesList } from "../components/stages/StagesList";
import TourneyHeaderText from "../components/tourney/TourneyHeader/TourneyHeaderText";
import { Toaster } from "../components/ui/toaster";
import { useCurrentTourney } from "../context/CurrentTourneyContext";
import { deleteChartPoolFromStages, deleteScoreFromStages, deleteStage, upsertChartPoolInStages, upsertScoreInStages, upsertStage } from "../helpers/state/stages";
import { deletePlayerFromRound, upsertPlayerInRound } from "../helpers/state/playerRounds";
import { deletePlayerTourney, upsertPlayerTourney } from "../helpers/state/playerTourney";
import { deleteRound, upsertRound } from "../helpers/state/rounds";
import { mergeAndFlattenRounds } from "../helpers/mergeAndFlattenRounds";
import RulesetContainer from "../components/round/Ruleset/RulesetContainer";
import ChartDrawContainer from "../components/round/ChartDraw/ChartDrawContainer";
import ChosenStagesContainer from "../components/round/ChosenStagesContainer";

import type { ChartPool } from "../types/ChartPool";
import type { RoundPool } from "../types/RoundPool";
import type { PlayerRound } from "../types/PlayerRound";
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Tourney } from "../types/Tourney";
import type { Round } from "../types/Round";
import type { Score } from "../types/Score";
import type { Stage } from "../types/Stage";
import type { ChartdrawConfig, ChartdrawConfigSpec, ChartdrawConfigWithSpecs } from "../types/ChartDrawConfig";
import type { PickbanRulesetSteps, PickbanRulesetWithSteps } from "../types/Pickban";
import type { ChartdrawEntry, ChartdrawEntryWithDetails } from "../types/ChartDrawEntry";

function RoundPage() {
  const { tourneyId, roundId } = useParams<{
    tourneyId: string;
    roundId: string;
  }>();
  if (!tourneyId) return <div>Invalid Tourney ID</div>;
  if (!roundId) return <div>Invalid Round ID</div>;

  const { tourney, setTourney } = useCurrentTourney();

  const [tourneyRounds, setTourneyRounds] = useState<Round[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [roundPools, setRoundPools] = useState<RoundPool[]>([]);
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tourneyPlayers, setTourneyPlayers] = useState<PlayerTourney[]>([]);
  const [chartdrawConfigs, setChartdrawConfigs] = useState<ChartdrawConfigWithSpecs[]>([]);
  const [pickbanRulesets, setPickbanRulesets] = useState<PickbanRulesetWithSteps[]>([]);
  const [chartdrawEntries, setChartdrawEntries] = useState<ChartdrawEntryWithDetails[]>([]);

  // Clear state whenever round changes, before new data arrives
  useEffect(() => {
    setRound(null);
    setPlayers([]);
    setStages([]);
    setChartdrawEntries([]);
  }, [roundId]);

  const activeRoundId = Number(roundId);
  const activeRoundPool = useMemo(() => {
    if (!round || !roundPools.length) return null;
    return roundPools.find((pool) => pool.id === round.round_pool_id) || null;
  }, [round, roundPools]);
  const activeConfig = useMemo(() => {
    if (!activeRoundPool?.chartdraw_config_id) return null;
    return chartdrawConfigs.find(c => c.id === activeRoundPool.chartdraw_config_id) || null;
  }, [activeRoundPool, chartdrawConfigs]);

  // Supabase queries to fetch data on initial page load
  const { data: tourneys } = getSupabaseTable<Tourney>(
    "tourneys",
    { column: "id", value: tourneyId }
  );
  const { data: queriedRoundsInTourney, loading: loadingRounds, error: errorRounds } = getSupabaseTable<Round>(
    "rounds",
    { column: "tourney_id", value: tourneyId }
  );
  const { data: queriedRoundPools } = getSupabaseTable<RoundPool>(
    "round_pools",
    { column: "tourney_id", value: tourneyId }
  );
  const { data: queriedPlayersInRound, loading: loadingPlayersInRound, error: errorPlayersInRound } = getSupabaseTable<PlayerRound>(
    "player_rounds",
    { column: "round_id", value: roundId },
    "*, player_tourneys(player_name, seed)"
  );
  const { data: queriedStagesInRound, loading: loadingStagesInRound, error: errorStagesInRound } = getSupabaseTable<Stage>(
    "stages",
    { column: "round_id", value: roundId },
    "*, chart_pools(*, charts(*)), charts:chart_id(*), scores(*)"
  );
  const { data: queriedPlayersInTourney, loading: loadingPlayersInTourney, error: errorPlayersInTourney } = getSupabaseTable<PlayerTourney>(
    "player_tourneys",
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
  const { data: queriedChartdrawEntries } = getSupabaseTable<ChartdrawEntryWithDetails>(
    'chartdraw_entries',
    { column: "round_id", value: roundId },
    "*, charts(*), player_rounds(*, player_tourneys(player_name))"
  );

  // Stores tourney table details
  useEffect(() => {
    if (tourneys?.length && tourneys[0].id !== tourney?.id) {
      setTourney(tourneys[0]);
    }
  }, [tourneys, tourney?.id, setTourney]);

  // Stores current round based on tourneyRounds
  useEffect(() => {
    if (!tourneyRounds?.length) return;
    const fresh = tourneyRounds.find(
      r => r.id === activeRoundId
    );
    setRound(fresh ?? null);
  }, [tourneyRounds, roundId]);

  // Seed Initial Data From Database Fetches
  useEffect(() => {
    if (queriedRoundsInTourney?.length) {
      setTourneyRounds(prev => {
        const { sorted } = mergeAndFlattenRounds(prev, queriedRoundsInTourney, roundPools);
        return sorted;
      });
    }
  }, [queriedRoundsInTourney, roundPools]);

  useEffect(() => {
    if (queriedRoundPools) {
      const sorted = [...queriedRoundPools].sort((a, b) =>
        (a.sort_order ?? a.id) - (b.sort_order ?? b.id)
      );
      setRoundPools(sorted);
    }
  }, [queriedRoundPools]);

  // Sync players when playersData changes
  useEffect(() => {
    if (queriedPlayersInRound) {
      const sortedPlayers = [...queriedPlayersInRound].sort(
        (b, a) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlayers(sortedPlayers);
    }
  }, [queriedPlayersInRound]);

  const stagesRef = useRef(stages);
  useEffect(() => {
    stagesRef.current = stages;
  }, [stages]);
  useEffect(() => {
    if (queriedStagesInRound) {
      const sortedStages = [...queriedStagesInRound].sort((a, b) => a.id - b.id);
      setStages(sortedStages);
    }
  }, [queriedStagesInRound]);

  useEffect(() => {
    setTourneyPlayers(queriedPlayersInTourney ?? []);
  }, [queriedPlayersInTourney]);

  const tourneyPlayersRef = useRef(tourneyPlayers);
  useEffect(() => {
    tourneyPlayersRef.current = tourneyPlayers;
  }, [tourneyPlayers]);

  useEffect(() => {
    if (queriedChartdrawConfigs) setChartdrawConfigs(queriedChartdrawConfigs);
  }, [queriedChartdrawConfigs]);

  useEffect(() => {
    if (queriedPickbanRulesets) setPickbanRulesets(queriedPickbanRulesets);
  }, [queriedPickbanRulesets]);

  useEffect(() => {
    if (queriedChartdrawEntries) setChartdrawEntries(queriedChartdrawEntries);
  }, [queriedChartdrawEntries]);

  const roundPlayersRef = useRef(players);
  useEffect(() => {
    roundPlayersRef.current = players;
  }, [players]);

  // Subscribe to table changes (RealTime updates)
  useEffect(() => {
    const roundsChannel = supabaseClient
      .channel('tourney-rounds-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds' },
        (payload) => {
          setTourneyRounds(prev => {
            if (payload.eventType === 'DELETE') {
              return deleteRound(prev, payload.old.id);
            }

            const incoming = payload.new as Round;
            if (incoming.tourney_id !== Number(tourneyId)) return prev;
            return upsertRound(prev, incoming);
          });
          setRound(prevRound => {
            if (payload.eventType === 'UPDATE' && prevRound && payload.new.id === prevRound.id) {
              return payload.new as Round;
            }
            return prevRound;
          });
        }
      )
      .subscribe();

    const roundPoolsChannel = supabaseClient
      .channel('round-pools-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'round_pools' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setRoundPools(prev => prev.filter(p => p.id !== payload.old.id));
            return;
          }

          const incoming = payload.new as RoundPool;
          if (incoming.tourney_id !== Number(tourneyId)) return;
          setRoundPools(prev => {
            const exists = prev.find(p => p.id === incoming.id);
            if (exists) return prev.map(p => p.id === incoming.id ? incoming : p);
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    const playerRoundsChannel = supabaseClient
      .channel('player-rounds-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_rounds' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPlayers(prev => deletePlayerFromRound(prev, payload.old.id));
            return;
          }
          const incoming = payload.new as PlayerRound;
          if (incoming.round_id !== activeRoundId) return;
          // mutable ref is used here to protect the socket boundary
          setPlayers(prev => upsertPlayerInRound(prev, incoming, tourneyPlayersRef.current ?? []));
        }
      )
      .subscribe();

    const stagesChannel = supabaseClient
      .channel('stages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stages' },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            setStages(prev => deleteStage(prev, payload.old.id));
            return;
          }

          const incoming = payload.new as Stage;
          if (!incoming || (incoming.round_id !== activeRoundId)) return;

          try {
            const existingStage = stagesRef.current.find(s => s.id === incoming.id);
            const alreadyHasChart = existingStage?.charts?.id === incoming.chart_id;

            let fetchedChart = null;

            if (incoming.chart_id && !alreadyHasChart) {
              const { data, error } = await supabaseClient
                .from("charts")
                .select("*")
                .eq("id", incoming.chart_id)
                .single();
              fetchedChart = data;
              if (error) {
                console.error(`Failed to hydrate chart ${incoming.chart_id} for chartdraw entry ${incoming.id}:`, error);
              }
            }

            setStages(prev => {
              // Get the most up-to-date version of this stage at the exact moment of state update
              const currentStage = prev.find(s => s.id === incoming.id);

              const stageWithDetails = {
                ...incoming,
                // Fallback chain: New Fetch -> Existing State -> Null
                charts: incoming.chart_id ? (fetchedChart ?? currentStage?.charts ?? null) : null,
                scores: currentStage?.scores ?? incoming.scores ?? [],
                chart_pools: currentStage?.chart_pools ?? incoming.chart_pools ?? undefined
              };

              return upsertStage(prev, stageWithDetails as Stage);
            });

          } catch (err) {
            console.error("Error processing real-time stage hydration:", err);
          }
        }
      )
      .subscribe();

    const scoresChannel = supabaseClient
      .channel('scores-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        payload => {
          if (payload.eventType === 'DELETE') {
            setStages(prev => deleteScoreFromStages(prev, payload.old.id));
            return;
          }
          const incoming = payload.new as Score;
          setStages(prev => {
            const stage = prev.find(s => s.id === incoming?.stage_id);
            if (!stage || stage.round_id !== activeRoundId) return prev;
            return upsertScoreInStages(prev, incoming);
          });
        }
      )
      .subscribe();

    const chartPoolsChannel = supabaseClient
      .channel('chart-pools-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chart_pools' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setStages(prev => deleteChartPoolFromStages(prev, payload.old.id));
            return;
          }
          const incoming = payload.new as ChartPool;
          setStages(prev => {
            const stage = prev.find(s => s.id === incoming?.stage_id);
            if (!stage || stage.round_id !== activeRoundId) return prev;
            return upsertChartPoolInStages(prev, incoming);
          });
        }
      )
      .subscribe();

    const playerTourneyChannel = supabaseClient
      .channel('tourney-players-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_tourneys' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTourneyPlayers(prev => deletePlayerTourney(prev, payload.old.id));
            return;
          }

          const incoming = payload.new as PlayerTourney;
          if (incoming.tourney_id !== Number(tourneyId)) return;
          setTourneyPlayers(prev => upsertPlayerTourney(prev, incoming));
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

    const chartdrawEntriesChannel = supabaseClient
      .channel('round-page-chartdraw-entries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chartdraw_entries' },
        async (payload) => {
          // handle Deletions
          if (payload.eventType === 'DELETE') {
            setChartdrawEntries(prev => prev.filter(entry => entry.id !== payload.old.id));
            return;
          }

          const incoming = payload.new as ChartdrawEntry;

          // filter out updates belonging to a different round
          if (String(incoming.round_id) !== String(roundId)) return;

          // hydrate info pulled from charts table
          let linkedChart = null;
          if (incoming.chart_id) {
            const { data, error } = await supabaseClient
              .from("charts")
              .select("*")
              .eq("id", incoming.chart_id)
              .single();

            if (error) {
              console.error(`Failed to hydrate chart ${incoming.chart_id} for chartdraw entry ${incoming.id}:`, error);
            }

            linkedChart = data;
          }

          // Re-map the structure of the matched player_round
          const matchedPlayerRound = roundPlayersRef.current?.find(pr => pr.id === incoming.player_round_id);
          const linkedPlayerRound = matchedPlayerRound
            ? {
              ...matchedPlayerRound,
              player_tourneys: matchedPlayerRound.player_tourneys || null
            }
            : null;

          // Combine into your full unified type
          const entryWithDetails: ChartdrawEntryWithDetails = {
            ...incoming,
            charts: linkedChart,
            player_rounds: linkedPlayerRound
          };

          // 3. Update State
          setChartdrawEntries(prev => {
            const entryExists = prev.some(entry => entry.id === incoming.id);
            if (entryExists) {
              return prev.map(entry => entry.id === incoming.id ? entryWithDetails : entry);
            }
            return [...prev, entryWithDetails];
          });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(roundsChannel);
      supabaseClient.removeChannel(roundPoolsChannel);
      supabaseClient.removeChannel(playerRoundsChannel);
      supabaseClient.removeChannel(stagesChannel);
      supabaseClient.removeChannel(scoresChannel);
      supabaseClient.removeChannel(chartPoolsChannel);
      supabaseClient.removeChannel(playerTourneyChannel);
      supabaseClient.removeChannel(chartdrawConfigChannel);
      supabaseClient.removeChannel(chartdrawConfigSpecsChannel);
      supabaseClient.removeChannel(pickbanRulesetChannel);
      supabaseClient.removeChannel(pickbanSequenceChannel);
      supabaseClient.removeChannel(chartdrawEntriesChannel);
    };
  }, [activeRoundId, tourneyId]);

  return (
    <Box mt={8}>
      <Toaster />
      <TourneyHeaderText
        rounds={tourneyRounds}
        setRounds={setTourneyRounds}
        currentRoundId={activeRoundId}
        roundPools={roundPools}
      />

      <Separator mt={2} mb={4} />
      <RoundDetails
        round={round}
        setRound={setRound}
        rounds={tourneyRounds}
        setRounds={setTourneyRounds}
        players={players}
        stages={stages}
        loading={loadingRounds}
        error={errorRounds}
        tourneyId={Number(tourneyId)}
        tourneyType={tourney?.type ?? null}
        activeConfig={activeConfig}
        pickbanRulesets={pickbanRulesets}
        chartdrawEntries={chartdrawEntries}
        setChartdrawEntries={setChartdrawEntries}
      />
      {tourney?.type === 'Double Elimination' ? (
        <VStack gap={4}>
          <PlayersH2H
            round={round}
            players={players}
            setPlayers={setPlayers}
            stages={stages}
            tourneyPlayers={tourneyPlayers}
            loading={loadingPlayersInRound || loadingPlayersInTourney}
            error={errorPlayersInRound || errorPlayersInTourney}
          />
          {stages.length > 0 &&
            <ChosenStagesContainer
              stages={stages}
              players={players}
            />
          }
          {activeConfig && (
            <>
              <ChartDrawContainer
                round={round}
                activeConfig={activeConfig}
                chartdrawEntries={chartdrawEntries}
              />
              <RulesetContainer
                activeConfig={activeConfig}
                setChartdrawConfigs={setChartdrawConfigs}
                pickbanRulesets={pickbanRulesets}
                roundPools={roundPools}
                setRoundPools={setRoundPools}
              />
            </>
          )}
        </VStack>
      ) : (
        <>
          <Separator mt={"24px"} mb={"24px"} />
          <Container maxW="4xl">
            <Flex direction={["column", "column", "column", "row"]} gap={4}>
              {/* Players List Code */}
              <Box
                flex="1"
                width={["100%", "100%", "100%", "50%"]}
                display="flex"
                justifyContent="center"
              >
                <PlayersList
                  round={round}
                  players={players}
                  setPlayers={setPlayers}
                  stages={stages}
                  tourneyPlayers={tourneyPlayers}
                  loading={loadingPlayersInRound || loadingPlayersInTourney}
                  error={errorPlayersInRound || errorPlayersInTourney}
                />
              </Box>

              {/* Stages List Code */}
              <Box
                flex="1"
                width={["100%", "100%", "100%", "50%"]}
                display="flex"
                justifyContent="center"
              >
                <StagesList
                  round={round}
                  stages={stages}
                  setStages={setStages}
                  loading={loadingStagesInRound}
                  error={errorStagesInRound}
                />
              </Box>
            </Flex>
          </Container>
        </>
      )}
    </Box>
  );
}

export default RoundPage;