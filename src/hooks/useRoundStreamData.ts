import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";

import type { Tourney } from "../types/Tourney";
import type { Round } from "../types/Round";
import type { RoundPool } from "../types/RoundPool";
import type { PlayerRound } from "../types/PlayerRound";

export function useRoundStreamData(
  tourneyId: string,
  roundIdOverride?: string | null,
  channelIdPrefix = "stream-data",
) {
  const [tourney, setTourney] = useState<Tourney | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundPools, setRoundPools] = useState<RoundPool[]>([]);
  const [playerRounds, setPlayerRounds] = useState<PlayerRound[]>([]);

  async function fetchPlayerRounds() {
    const { data: playerTourneys, error: playerTourneysError } =
      await supabaseClient
        .from("player_tourneys")
        .select("id")
        .eq("tourney_id", tourneyId);

    if (playerTourneysError) {
      console.error(
        "Error fetching player tourneys:",
        playerTourneysError,
      );
      return;
    }

    if (!playerTourneys || playerTourneys.length === 0) {
      setPlayerRounds([]);
      return;
    }

    const playerTourneyIds = playerTourneys.map(
      (pt) => pt.id,
    );

    const { data, error } = await supabaseClient
      .from("player_rounds")
      .select(`
        *,
        player_tourneys(
          player_name,
          seed,
          player_img
        )
      `)
      .in("player_tourney_id", playerTourneyIds);

    if (error) {
      console.error(
        "Error fetching player rounds:",
        error,
      );
      return;
    }

    if (data) {
      setPlayerRounds(data as PlayerRound[]);
    }
  }

  useEffect(() => {
    async function fetchTourney() {
      const { data, error } = await supabaseClient
        .from("tourneys")
        .select("*")
        .eq("id", tourneyId)
        .single();

      if (error) {
        console.error(
          "Error fetching tourney:",
          error,
        );
        return;
      }

      if (data) {
        setTourney(data);
      }
    }

    fetchTourney();

    const channel = supabaseClient
      .channel(
        `${channelIdPrefix}-tourney-${tourneyId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tourneys",
          filter: `id=eq.${tourneyId}`,
        },
        (payload) => {
          setTourney((prev) =>
            prev
              ? { ...prev, ...payload.new }
              : (payload.new as Tourney),
          );
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [tourneyId, channelIdPrefix]);

  useEffect(() => {
    async function fetchRoundsAndPlayers() {
      const {
        data: roundsData,
        error: roundsError,
      } = await supabaseClient
        .from("rounds")
        .select("*")
        .eq("tourney_id", tourneyId);

      if (roundsError) {
        console.error(
          "Error fetching rounds:",
          roundsError,
        );
      } else if (roundsData) {
        setRounds(roundsData);
      }

      const {
        data: roundPoolsData,
        error: roundPoolsError,
      } = await supabaseClient
        .from("round_pools")
        .select("*")
        .eq("tourney_id", tourneyId)
        .order("sort_order", {
          ascending: true,
          nullsFirst: false,
        });

      if (roundPoolsError) {
        console.error(
          "Error fetching round pools:",
          roundPoolsError,
        );
      } else if (roundPoolsData) {
        setRoundPools(roundPoolsData);
      }

      await fetchPlayerRounds();
    }

    fetchRoundsAndPlayers();

    const roundsChannel = supabaseClient
      .channel(
        `${channelIdPrefix}-rounds-${tourneyId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rounds",
          filter: `tourney_id=eq.${tourneyId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setRounds((prev) =>
              prev.map((round) =>
                round.id === payload.new.id
                  ? (payload.new as Round)
                  : round,
              ),
            );
          } else if (payload.eventType === "INSERT") {
            setRounds((prev) => [
              ...prev,
              payload.new as Round,
            ]);
          } else if (payload.eventType === "DELETE") {
            setRounds((prev) =>
              prev.filter(
                (round) =>
                  round.id !== payload.old.id,
              ),
            );
          }
        },
      )
      .subscribe();

    const roundPoolsChannel = supabaseClient
      .channel(
        `${channelIdPrefix}-round-pools-${tourneyId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "round_pools",
          filter: `tourney_id=eq.${tourneyId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRoundPools((prev) =>
              [...prev, payload.new as RoundPool].sort(
                (a, b) =>
                  (a.sort_order ??
                    Number.MAX_SAFE_INTEGER) -
                  (b.sort_order ??
                    Number.MAX_SAFE_INTEGER),
              ),
            );
          } else if (payload.eventType === "UPDATE") {
            setRoundPools((prev) =>
              prev
                .map((pool) =>
                  pool.id === payload.new.id
                    ? (payload.new as RoundPool)
                    : pool,
                )
                .sort(
                  (a, b) =>
                    (a.sort_order ??
                      Number.MAX_SAFE_INTEGER) -
                    (b.sort_order ??
                      Number.MAX_SAFE_INTEGER),
                ),
            );
          } else if (payload.eventType === "DELETE") {
            setRoundPools((prev) =>
              prev.filter(
                (pool) =>
                  pool.id !== payload.old.id,
              ),
            );
          }
        },
      )
      .subscribe();

    const playersChannel = supabaseClient
      .channel(
        `${channelIdPrefix}-players-${tourneyId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_rounds",
        },
        () => {
          fetchPlayerRounds();
        },
      )
      .subscribe();

    const playerTourneysChannel = supabaseClient
      .channel(
        `${channelIdPrefix}-player-tourneys-${tourneyId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_tourneys",
          filter: `tourney_id=eq.${tourneyId}`,
        },
        () => {
          fetchPlayerRounds();
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(roundsChannel);
      supabaseClient.removeChannel(roundPoolsChannel);
      supabaseClient.removeChannel(playersChannel);
      supabaseClient.removeChannel(
        playerTourneysChannel,
      );
    };
  }, [tourneyId, channelIdPrefix]);

  const currentRound = useMemo(() => {
    if (!rounds.length) {
      return null;
    }

    // Explicit URL parameter takes highest priority.
    if (roundIdOverride) {
      return (
        rounds.find(
          (round) =>
            String(round.id) ===
            String(roundIdOverride),
        ) ?? null
      );
    }

    // Follow tourney.stream_round_id.
    if (tourney?.stream_round_id) {
      return (
        rounds.find(
          (round) =>
            String(round.id) ===
            String(tourney.stream_round_id),
        ) ?? null
      );
    }

    // Fallback: first round in progress or first available round.
    return (
      rounds.find(
        (round) =>
          round.status === "In Progress",
      ) ??
      rounds[0] ??
      null
    );
  }, [
    rounds,
    tourney?.stream_round_id,
    roundIdOverride,
  ]);

  const sortedRounds = useMemo(() => {
    return [...rounds].sort(
      (a, b) => (a.id ?? 0) - (b.id ?? 0),
    );
  }, [rounds]);

  return {
    tourney,
    rounds,
    sortedRounds,
    roundPools,
    currentRound,
    playerRounds,
    setRounds,
  };
}