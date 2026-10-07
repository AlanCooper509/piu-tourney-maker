import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";

/**
 * The event's shared OBS source stylesheet (events.stream_css), kept live
 * so edits saved from Stream Helper restyle open sources without a refresh.
 */
export function useEventStreamCss(eventId: number | null | undefined) {
  const [css, setCss] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    let cancelled = false;

    supabaseClient
      .from("events")
      .select("stream_css")
      .eq("id", eventId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Error fetching event stream CSS:", error);
        setCss(data?.stream_css ?? null);
        setLoading(false);
      });

    const channel = supabaseClient
      .channel(`event-stream-css-${eventId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          setCss((payload.new as { stream_css?: string | null }).stream_css ?? null);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabaseClient.removeChannel(channel);
    };
  }, [eventId]);

  return { css, setCss, loading };
}
