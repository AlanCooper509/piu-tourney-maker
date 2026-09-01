import { useEffect, useMemo, useRef, useState } from "react";

import { supabaseClient } from "../lib/supabaseClient";
import getSupabaseTable from "./getSupabaseTable";
import { mergeAndFlattenRounds } from "../helpers/mergeAndFlattenRounds";
import { deleteRound, upsertRound } from "../helpers/state/rounds";
import {
  deletePlayerFromRound,
  upsertPlayerInRound,
} from "../helpers/state/playerRounds";
import { useCurrentTourney } from "../context/CurrentTourneyContext";

import type { Round } from "../types/Round";
import type { RoundPool } from "../types/RoundPool";
import type { PlayerRound } from "../types/PlayerRound";
import type { PlayerTourney } from "../types/PlayerTourney";
import type { Tourney } from "../types/Tourney";

/**
 * Shared data-fetching + realtime wiring for the OBS-facing stream pages
 * (StreamHelper, StreamViewer): the current tourney, its sorted rounds, and
 * whichever round is "In Progress" (or pinned via roundIdOverride) along
 * with its players.
 *
 * `channelPrefix` keeps each page's Supabase realtime channel names unique
 * so two stream pages open at once don't collide on the same channel.
 */
export function useRoundStreamData(
  tourneyId: string,
  roundIdOverride: string | null,
  channelPrefix: string,
) {
  const { tourney, setTourney } = useCurrentTourney();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundPools, setRoundPools] = useState<RoundPool[]>([]);
  const [tourneyPlayers, setTourneyPlayers] = useState<PlayerTourney[]>([]);
  const tourneyPlayersRef = useRef<PlayerTourney[]>([]);
  const [playerRounds, setPlayerRounds] = useState<PlayerRound[]>([]);

  // --- Initial fetches -----------------------------------------------
  const { data: tourneys } = getSupabaseTable<Tourney>("tourneys", {
    column: "id",
    value: tourneyId,
  });
  const { data: queriedRounds } = getSupabaseTable<Round>("rounds", {
    column: "tourney_id",
    value: tourneyId,
  });
  const { data: queriedRoundPools } = getSupabaseTable<RoundPool>(
    "round_pools",
    {
      column: "tourney_id",
      value: tourneyId,
    },
  );
  const { data: queriedTourneyPlayers } = getSupabaseTable<PlayerTourney>(
    "player_tourneys",
    { column: "tourney_id", value: tourneyId },
  );

  useEffect(() => {
    if (tourneys?.length && tourneys[0].id !== tourney?.id) {
      setTourney(tourneys[0]);
    }
  }, [tourneys, tourney?.id, setTourney]);

  useEffect(() => {
    if (queriedRounds) setRounds(queriedRounds);
  }, [queriedRounds]);

  useEffect(() => {
    if (queriedRoundPools) setRoundPools(queriedRoundPools);
  }, [queriedRoundPools]);

  useEffect(() => {
    if (queriedTourneyPlayers) setTourneyPlayers(queriedTourneyPlayers);
  }, [queriedTourneyPlayers]);

  useEffect(() => {
    tourneyPlayersRef.current = tourneyPlayers;
  }, [tourneyPlayers]);

  const sortedRounds = useMemo(() => {
    if (!rounds.length) return [];
    const { sorted } = mergeAndFlattenRounds([], rounds, roundPools);
    return sorted;
  }, [rounds, roundPools]);

  // --- Which round are we showing ---
  const currentRound: Round | null = useMemo(() => {
    if (!rounds.length) return null;
    if (roundIdOverride) {
      return rounds.find((r) => String(r.id) === roundIdOverride) ?? null;
    }
    return rounds.find((r) => r.status === "In Progress") ?? null;
  }, [rounds, roundIdOverride]);

  // --- Participants for the current round ------------------------------
  // Fetched directly (not via getSupabaseTable) since the filter value
  // (currentRound.id) isn't known until the rounds query above resolves.
  async function loadPlayerRounds(roundId: number) {
    const { data, error } = await supabaseClient
      .from("player_rounds")
      .select("*, player_tourneys(player_name, seed, player_img)")
      .eq("round_id", roundId)
      .order("sort_order", { ascending: true });

    if (!error) setPlayerRounds((data as PlayerRound[]) ?? []);
  }

  useEffect(() => {
    if (!currentRound) {
      setPlayerRounds([]);
      return;
    }
    loadPlayerRounds(currentRound.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound?.id]);

  // --- Realtime: rounds (so the page swaps matches automatically) -----
  useEffect(() => {
    const roundsChannel = supabaseClient
      .channel(`${channelPrefix}-rounds-${tourneyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds" },
        (payload) => {
          setRounds((prev) => {
            if (payload.eventType === "DELETE") {
              return deleteRound(prev, payload.old.id);
            }
            const incoming = payload.new as Round;
            if (String(incoming.tourney_id) !== String(tourneyId)) return prev;
            return upsertRound(prev, incoming);
          });
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(roundsChannel);
    };
  }, [tourneyId, channelPrefix]);

  // --- Realtime: round_pools (needed to keep sortedRounds/header correct) ---
  useEffect(() => {
    const roundPoolsChannel = supabaseClient
      .channel(`${channelPrefix}-pools-${tourneyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "round_pools" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setRoundPools((prev) =>
              prev.filter((p) => p.id !== payload.old.id),
            );
            return;
          }
          const incoming = payload.new as RoundPool;
          if (String(incoming.tourney_id) !== String(tourneyId)) return;
          setRoundPools((prev) => {
            const exists = prev.find((p) => p.id === incoming.id);
            if (exists)
              return prev.map((p) => (p.id === incoming.id ? incoming : p));
            return [...prev, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(roundPoolsChannel);
    };
  }, [tourneyId, channelPrefix]);

  // --- Realtime: player_rounds for the current round -------------------
  useEffect(() => {
    if (!currentRound) return;
    const roundId = currentRound.id;

    const playerRoundsChannel = supabaseClient
      .channel(`${channelPrefix}-player-rounds-${roundId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player_rounds" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setPlayerRounds((prev) =>
              deletePlayerFromRound(prev, payload.old.id),
            );
            return;
          }
          const incoming = payload.new as PlayerRound;
          if (String(incoming.round_id) !== String(roundId)) return;
          setPlayerRounds((prev) =>
            upsertPlayerInRound(
              prev,
              incoming,
              tourneyPlayersRef.current ?? [],
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(playerRoundsChannel);
    };
  }, [currentRound?.id, channelPrefix]);

  return { tourney, sortedRounds, roundPools, setRounds, currentRound, playerRounds };
}
