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
 * (StreamHelper, StreamViewer): the current tourney, its sorted rounds, all
 * tournament player_rounds, and whichever round is active/pinned.
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
  const { data: tourneys } = getSupabaseTable<Tourney>(
    "tourneys",
    { column: "id", value: tourneyId }
  );
  const { data: queriedRounds } = getSupabaseTable<Round>(
    "rounds",
    { column: "tourney_id", value: tourneyId }
  );
  const { data: queriedRoundPools } = getSupabaseTable<RoundPool>(
    "round_pools",
    { column: "tourney_id", value: tourneyId }
  );
  const { data: queriedTourneyPlayers } = getSupabaseTable<PlayerTourney>(
    "player_tourneys",
    { column: "tourney_id", value: tourneyId }
  );
  // Fetch ALL player_rounds for this tournament via inner join on player_tourneys
  const { data: queriedPlayersInRound } = getSupabaseTable<PlayerRound>(
    "player_rounds",
    { column: "player_tourneys.tourney_id", value: tourneyId },
    "*, player_tourneys!inner(player_name, seed, player_img, tourney_id)"
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

  useEffect(() => {
    if (queriedPlayersInRound) {
      const sorted = [...queriedPlayersInRound].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setPlayerRounds(sorted);
    }
  }, [queriedPlayersInRound]);

  const sortedRounds = useMemo(() => {
    if (!rounds.length) return [];
    const { sorted } = mergeAndFlattenRounds([], rounds, roundPools);
    return sorted;
  }, [rounds, roundPools]);

  // --- Active/Pinned Round helper ------------------------------------
  const currentRound: Round | null = useMemo(() => {
    if (!rounds.length) return null;
    if (roundIdOverride) {
      return rounds.find((r) => String(r.id) === roundIdOverride) ?? null;
    }
    return rounds.find((r) => r.status === "In Progress") ?? null;
  }, [rounds, roundIdOverride]);

  // --- Realtime Subscriptions ----------------------------------------
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
        }
      )
      .subscribe();

    const roundPoolsChannel = supabaseClient
      .channel(`${channelPrefix}-pools-${tourneyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "round_pools" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setRoundPools((prev) =>
              prev.filter((p) => p.id !== payload.old.id)
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
        }
      )
      .subscribe();

    const playerRoundsChannel = supabaseClient
      .channel(`${channelPrefix}-player-rounds-${tourneyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player_rounds" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setPlayerRounds((prev) =>
              deletePlayerFromRound(prev, payload.old.id)
            );
            return;
          }
          const incoming = payload.new as PlayerRound;
          setPlayerRounds((prev) =>
            upsertPlayerInRound(
              prev,
              incoming,
              tourneyPlayersRef.current ?? []
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(roundsChannel);
      supabaseClient.removeChannel(roundPoolsChannel);
      supabaseClient.removeChannel(playerRoundsChannel);
    };
  }, [tourneyId, channelPrefix]);

  return {
    tourney,
    sortedRounds,
    roundPools,
    setRounds,
    currentRound,
    playerRounds,
  };
}