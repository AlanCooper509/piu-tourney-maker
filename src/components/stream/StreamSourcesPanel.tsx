import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Code,
  Heading,
  HStack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";

import { supabaseClient } from "../../lib/supabaseClient";
import { useEventStreamCss } from "../../hooks/useEventStreamCss";
import { useIsAdminForEvent } from "../../context/admin/AdminEventContext";
import { toaster } from "../ui/toaster";
import { StreamSourceRow } from "./StreamSourceRow";

import type { ReactNode } from "react";
import type { Tourney } from "../../types/Tourney";

interface SourceFlag {
  // Query param; "key" alone becomes a bare flag (?img), "key=value" stays as is.
  param: string;
  label: string;
  // Starts checked, so the param is in the URL until unticked.
  defaultOn?: boolean;
}

const IMG_FLAG: SourceFlag = { param: "img", label: "Show image" };
const SCORE_FLAG: SourceFlag = { param: "score", label: "Show score" };

const ALL_HINT = (
  <>
    Add <Code fontSize="xs">?all</Code> to include everyone in the heat, not only the pushed lanes.
  </>
);

const SOURCES: Array<{
  label: string;
  path: string;
  slots?: boolean;
  flags?: SourceFlag[];
  hint?: ReactNode;
}> = [
  {
    label: "Round Title",
    path: "round-title",
    flags: [
      { param: "pool", label: "Prioritize round pool name", defaultOn: true },
      { param: "trimmed", label: "Trim after last ': ' (WR1:M4: A vs. B shows as WR1:M4)", defaultOn: true },
    ],
  },
  {
    label: "Charts",
    path: "charts",
    flags: [{ param: "frame=full", label: "Keep frame fixed width (fills the OBS source, cards centered inside)" }],
  },
  {
    label: "Player",
    path: "player",
    slots: true,
    flags: [{ param: "flip", label: "Flipped" }, SCORE_FLAG, IMG_FLAG],
    hint: (
      <>
        Picks by on-stream position, after any Flip pushed from Broadcast: 1st is whoever shows
        first, whatever lane they're in. {ALL_HINT}
      </>
    ),
  },
  {
    label: "Score",
    path: "score",
    flags: [
      { param: "leaderboard", label: "Leaderboard view (ranked rows instead of 3 - 1 - 2 - 0)" },
      { param: "round", label: "Entire round (all heats, not just the live one)" },
    ],
    hint: ALL_HINT,
  },
];

const PLAYER_SLOTS = [
  { slot: 1, label: "1st" },
  { slot: 2, label: "2nd" },
  { slot: 3, label: "3rd" },
  { slot: 4, label: "4th" },
];

const CSS_PLACEHOLDER = `/* Applies to every OBS source in this event. */
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap");

.stream-source { font-family: Fredoka, sans-serif; color: #fff; }
.round-title { font-size: 45px; }
.player .name { text-transform: uppercase; }`;

interface StreamSourcesPanelProps {
  tourney: Tourney | null;
  roundIdOverride: string | null;
}

export function StreamSourcesPanel({ tourney, roundIdOverride }: StreamSourcesPanelProps) {
  const eventId = tourney?.event_id;
  const { isEventAdmin } = useIsAdminForEvent(eventId ?? NaN);
  const { css } = useEventStreamCss(eventId);

  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  // Which flags are ticked, per source path; not saved, they only build URLs.
  const [flagsByPath, setFlagsByPath] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      SOURCES.map(({ path, flags }) => [
        path,
        (flags ?? []).filter((f) => f.defaultOn).map((f) => f.param),
      ]),
    ),
  );
  const [playerSlot, setPlayerSlot] = useState(1);

  // Textareas normalize line endings to \n, so compare against the same form
  // or CSS pasted with \r\n (e.g. in the dashboard) always looks unsaved.
  const savedCss = (css ?? "").replace(/\r\n/g, "\n");

  useEffect(() => {
    setDraft(savedCss);
  }, [savedCss]);

  if (!tourney) return null;

  const toggleFlag = (path: string, param: string, on: boolean) =>
    setFlagsByPath((prev) => {
      const current = prev[path] ?? [];
      return {
        ...prev,
        [path]: on ? [...current, param] : current.filter((p) => p !== param),
      };
    });

  const sourceUrl = (path: string, slots?: boolean) => {
    const params = [
      ...(roundIdOverride ? [`roundId=${encodeURIComponent(roundIdOverride)}`] : []),
      // Keep the order flags are listed in, so URLs read the same every time.
      ...(SOURCES.find((s) => s.path === path)?.flags ?? [])
        .map((f) => f.param)
        .filter((param) => flagsByPath[path]?.includes(param)),
    ];
    const fullPath = slots ? `${path}/${playerSlot}` : path;
    return `${window.location.origin}/tourney/${tourney.id}/source/${fullPath}${
      params.length ? `?${params.join("&")}` : ""
    }`;
  };

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toaster.create({ title: "Copied source URL", type: "success", duration: 1500 });
    } catch {
      toaster.create({ title: "Couldn't copy, select the URL instead", type: "error" });
    }
  }

  async function saveCss() {
    setSaving(true);
    const { data, error } = await supabaseClient
      .from("events")
      .update({ stream_css: draft.trim() ? draft : null })
      .eq("id", eventId!)
      .select("id");
    setSaving(false);

    if (error || !data?.length) {
      toaster.create({
        title: "Couldn't save styles",
        description: error?.message ?? "You may not have permission to edit this event.",
        type: "error",
      });
      return;
    }
    toaster.create({ title: "Stream styles saved", type: "success" });
  }

  return (
    <VStack align="stretch" gap={4} mb={6}>
      <Box>
        <Heading size="md">OBS Sources</Heading>
        <Text fontSize="sm" color="whiteAlpha.700">
          Add each as its own Browser Source and position it in OBS. They follow
          whichever round and heat you push from the Broadcast tab.
        </Text>
      </Box>

      <VStack align="stretch" gap={1}>
        {SOURCES.map(({ label, path, slots, flags, hint }) => (
          <StreamSourceRow key={path} label={label} url={sourceUrl(path, slots)} onCopy={copy}>
            {hint && (
              <Text fontSize="xs" color="whiteAlpha.600" mb={1}>
                {hint}
              </Text>
            )}
            {(slots || flags) && (
              <HStack gap={3} wrap="wrap" mb={1}>
                {slots && (
                  <HStack gap={1}>
                    <Text>Position:</Text>
                    {PLAYER_SLOTS.map(({ slot, label: slotLabel }) => (
                      <Button
                        key={slot}
                        size="2xs"
                        variant={playerSlot === slot ? "solid" : "outline"}
                        colorPalette="purple"
                        onClick={() => setPlayerSlot(slot)}
                      >
                        {slotLabel}
                      </Button>
                    ))}
                  </HStack>
                )}
                {flags?.map(({ param, label: flagLabel }) => (
                  <Checkbox.Root
                    key={param}
                    size="sm"
                    checked={flagsByPath[path]?.includes(param) ?? false}
                    onCheckedChange={(e) => toggleFlag(path, param, !!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label fontSize="xs" color="whiteAlpha.700">
                      {flagLabel}
                    </Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </HStack>
            )}
          </StreamSourceRow>
        ))}
      </VStack>

      <Box>
        <Heading size="sm" mb={1}>
          Source styles
        </Heading>
        <Text fontSize="xs" color="whiteAlpha.600" mb={2}>
          Shared by every tourney in this event. Classes: <Code fontSize="xs">.stream-source</Code>,{" "}
          <Code fontSize="xs">.round-title</Code>, <Code fontSize="xs">.player</Code> /{" "}
          <Code fontSize="xs">.player-1</Code>, <Code fontSize="xs">.avatar</Code>,{" "}
          <Code fontSize="xs">.name</Code>, <Code fontSize="xs">.score</Code>,{" "}
          <Code fontSize="xs">.match-score</Code>, <Code fontSize="xs">.chart</Code>,{" "}
          <Code fontSize="xs">.jacket</Code>, <Code fontSize="xs">.chart-name</Code>,{" "}
          <Code fontSize="xs">.chart-level</Code>.
        </Text>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={CSS_PLACEHOLDER}
          fontFamily="mono"
          fontSize="xs"
          rows={10}
          readOnly={!isEventAdmin}
          spellCheck={false}
        />
        {isEventAdmin ? (
          <Button
            mt={2}
            size="sm"
            colorPalette="purple"
            onClick={saveCss}
            loading={saving}
            disabled={draft === savedCss}
          >
            Save styles
          </Button>
        ) : (
          <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
            Only event admins can edit these styles.
          </Text>
        )}
      </Box>
    </VStack>
  );
}
