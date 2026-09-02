import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import "@fontsource/fredoka/700.css";

import { useRoundStreamData } from "../hooks/useRoundStreamData";
import { useTransparentBackground } from "../hooks/useTransparentBackground";
import { PlayerAvatar } from "../components/PlayerAvatar";

import type { PlayerRound } from "../types/PlayerRound";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const ROUND_TITLE_Y = 115;
const ROW_Y = 630;
const PICTURE_SIZE = 100;
const PICTURE_BORDER_RADIUS = "8px";
const ELEMENT_GAP = 56;
const MODULE_EDGE_PADDING = 56;
const MIN_SLOTS = 4;
const SLOT_WIDTH = CANVAS_WIDTH / MIN_SLOTS;
const MODULE_MAX_WIDTH = SLOT_WIDTH - 2 * MODULE_EDGE_PADDING;
const NAME_MAX_WIDTH = MODULE_MAX_WIDTH - PICTURE_SIZE - ELEMENT_GAP;

const STROKE_INNERMOST_COLOR = "#0C2DE8";
const STROKE_INNER_COLOR = "#F18DD8";
const STROKE_OUTER_COLOR = "#0C2DE8";
const STROKE_INNERMOST_WIDTH = 1;
const STROKE_INNER_WIDTH = 4;
const STROKE_OUTER_WIDTH = 6;

const PICTURE_STROKE_SHADOW = `0 0 0 ${STROKE_INNERMOST_WIDTH}px ${STROKE_INNERMOST_COLOR}, 0 0 0 ${STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH}px ${STROKE_INNER_COLOR}, 0 0 0 ${STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH + STROKE_OUTER_WIDTH}px ${STROKE_OUTER_COLOR}`;

const NAME_INNERMOST_STROKE_PX = STROKE_INNERMOST_WIDTH * 2;
const NAME_INNER_STROKE_PX = (STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH) * 2;
const NAME_OUTER_STROKE_PX =
  (STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH + STROKE_OUTER_WIDTH) * 2;

const NAME_BASE_FONT_PX = 85;
const NAME_MIN_FONT_PX = 24;
const NAME_FONT_WEIGHT = "700";
const NAME_FONT_FAMILY = "Fredoka, sans-serif";
const NAME_SIZE_MULTIPLIER = 1.25;

const NAME_SIZE_TIERS: Array<{
  maxLength: number;
  reference: string;
  extraPx?: number;
}> = [
    { maxLength: 4, reference: "W".repeat(4), extraPx: 10 },
    { maxLength: 7, reference: "W".repeat(7), extraPx: 10 },
    { maxLength: 10, reference: "W".repeat(10), extraPx: 10 },
    { maxLength: Infinity, reference: "cherry.cheesecake", extraPx: 10 },
  ];

function getNameSizeTierIndex(nameLength: number): number {
  return NAME_SIZE_TIERS.findIndex((tier) => nameLength <= tier.maxLength);
}

let measureCanvas: HTMLCanvasElement | null = null;
function measureTextWidthPx(text: string, fontPx: number): number {
  if (typeof document === "undefined") return 0;
  if (!measureCanvas) measureCanvas = document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = `${NAME_FONT_WEIGHT} ${fontPx}px ${NAME_FONT_FAMILY}`;
  return ctx.measureText(text).width;
}

function fitFontSizePx(reference: string, maxWidthPx: number): number {
  const measured = measureTextWidthPx(reference.toUpperCase(), NAME_BASE_FONT_PX);
  if (measured <= 0 || measured <= maxWidthPx) return NAME_BASE_FONT_PX;
  return Math.max(NAME_MIN_FONT_PX, NAME_BASE_FONT_PX * (maxWidthPx / measured));
}

function computeTierFontSizesPx(maxWidthPx: number): number[] {
  return NAME_SIZE_TIERS.map(
    (tier) =>
      (fitFontSizePx(tier.reference, maxWidthPx) + (tier.extraPx ?? 0)) *
      NAME_SIZE_MULTIPLIER,
  );
}

function useNameSizeTierFontSizesPx(maxWidthPx: number): number[] {
  const [fontSizesPx, setFontSizesPx] = useState<number[]>(() =>
    computeTierFontSizesPx(maxWidthPx),
  );

  useEffect(() => {
    let cancelled = false;

    document.fonts
      .load(`${NAME_FONT_WEIGHT} ${NAME_BASE_FONT_PX}px ${NAME_FONT_FAMILY}`)
      .then(() => document.fonts.ready)
      .then(() => {
        if (cancelled) return;
        setFontSizesPx(computeTierFontSizesPx(maxWidthPx));
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, [maxWidthPx]);

  return fontSizesPx;
}

function useFitScale(canvasWidth: number, canvasHeight: number) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      setScale(
        Math.min(
          window.innerWidth / canvasWidth,
          window.innerHeight / canvasHeight,
        ),
      );
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [canvasWidth, canvasHeight]);

  return scale;
}

function StrokedName({ name, fontSizePx }: { name: string; fontSizePx: number }) {
  const sidePadding = Math.ceil(NAME_OUTER_STROKE_PX / 2) + 4;
  const measuredWidth = measureTextWidthPx(name, fontSizePx);
  const svgWidth =
    (measuredWidth > 0 ? measuredWidth : fontSizePx * name.length * 0.6) +
    sidePadding * 2;
  const svgHeight = fontSizePx * 1.3 + NAME_OUTER_STROKE_PX;

  const textProps = {
    x: svgWidth / 2,
    y: svgHeight / 2,
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    style: {
      fontFamily: NAME_FONT_FAMILY,
      fontWeight: NAME_FONT_WEIGHT,
      fontSize: `${fontSizePx}px`,
    },
  };

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      style={{ overflow: "visible", display: "block", flexShrink: 0 }}
    >
      <text
        {...textProps}
        fill="none"
        stroke={STROKE_OUTER_COLOR}
        strokeWidth={NAME_OUTER_STROKE_PX}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {name}
      </text>
      <text
        {...textProps}
        fill="none"
        stroke={STROKE_INNER_COLOR}
        strokeWidth={NAME_INNER_STROKE_PX}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {name}
      </text>
      <text
        {...textProps}
        fill="none"
        stroke={STROKE_INNERMOST_COLOR}
        strokeWidth={NAME_INNERMOST_STROKE_PX}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {name}
      </text>
      <text {...textProps} fill="white">
        {name}
      </text>
    </svg>
  );
}

interface PlayerModuleProps {
  pr: PlayerRound;
  centerX: number;
  tierFontSizesPx: number[];
}

function PlayerModule({ pr, centerX, tierFontSizesPx }: PlayerModuleProps) {
  const name = pr.player_tourneys?.player_name ?? "TBD";
  const fontSizePx = tierFontSizesPx[getNameSizeTierIndex(name.length)];

  return (
    <Box
      position="absolute"
      left={`${centerX}px`}
      top={`${ROW_Y}px`}
      maxW={`${MODULE_MAX_WIDTH}px`}
      style={{ transform: "translate(-50%, -50%)" }}
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap={`${ELEMENT_GAP}px`}
    >
      <PlayerAvatar
        src={pr.player_tourneys?.player_img}
        alt={name}
        size={`${PICTURE_SIZE}px`}
        borderRadius={PICTURE_BORDER_RADIUS}
        boxShadow={PICTURE_STROKE_SHADOW}
      />
      <StrokedName name={name.toUpperCase()} fontSizePx={fontSizePx} />
    </Box>
  );
}

function StreamViewer() {
  const { tourneyId } = useParams();
  const [searchParams] = useSearchParams();

  const roundIdOverride = searchParams.get("roundId");
  const heatOverride = searchParams.get("heat");
  const layoutMode = searchParams.get("layout") ?? "active";

  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  useTransparentBackground();
  const scale = useFitScale(CANVAS_WIDTH, CANVAS_HEIGHT);
  const tierFontSizesPx = useNameSizeTierFontSizesPx(NAME_MAX_WIDTH);

  const { currentRound, playerRounds } = useRoundStreamData(
    tourneyId,
    roundIdOverride,
    "stream-viewer",
  );

  // 1. Resolve Active Broadcast State with Fallbacks
  const activeStreamState = currentRound?.active_stream_state;

  // Resolve Heat Number:
  // Stream state -> URL query param -> Default to Heat 1
  const activeHeat = useMemo(() => {
    if (activeStreamState?.heat) return Number(activeStreamState.heat);
    if (heatOverride) return Number(heatOverride);
    return 1; // Fallback to Heat 1 for completed/archived tourneys
  }, [activeStreamState, heatOverride]);

  // Resolve Active Lanes:
  // Stream state -> Fallback to all assigned lanes (1..4)
  const activeLanes = useMemo(() => {
    if (activeStreamState?.lanes && activeStreamState.lanes.length > 0) {
      return activeStreamState.lanes.map(Number);
    }
    return [1, 2, 3, 4]; // Fallback to all lanes
  }, [activeStreamState]);

  const isFlipped = activeStreamState?.reverse_order ?? false;

  // 2. Filter & Sort Players
  const displayedPlayers = useMemo(() => {
    if (!currentRound || !playerRounds.length) {
      return [];
    }

    const roundPlayers = playerRounds.filter(
      (pr) => Number(pr.round_id) === Number(currentRound.id),
    );

    const heatPlayers = roundPlayers.filter(
      (pr) => Number(pr.heat) === activeHeat,
    );

    // If layout is "full" OR there's no explicit live stream state,
    // show all players in this round/heat.
    const isExplicitPairing =
      activeStreamState?.lanes &&
      activeStreamState.lanes.length > 0;

    const shouldFilterLanes =
      layoutMode === "active" && isExplicitPairing;

    const selectedPlayers = shouldFilterLanes
      ? heatPlayers.filter((pr) =>
        activeLanes.includes(Number(pr.lane)),
      )
      : heatPlayers;

    return [...selectedPlayers].sort((a, b) => {
      const laneA = Number(a.lane ?? 0);
      const laneB = Number(b.lane ?? 0);

      return isFlipped
        ? laneB - laneA
        : laneA - laneB;
    });
  }, [
    playerRounds,
    currentRound,
    activeHeat,
    activeLanes,
    isFlipped,
    layoutMode,
    activeStreamState,
  ]);

  // Center slots evenly based on displayed player count
  const slots = useMemo(() => {
    const startSlot = Math.floor((MIN_SLOTS - displayedPlayers.length) / 2);

    return displayedPlayers.map((pr, idx) => ({
      pr,
      centerX: SLOT_WIDTH * (startSlot + idx + 0.5),
    }));
  }, [displayedPlayers]);

  if (!currentRound) return null;

  return (
    <Box position="fixed" inset={0} overflow="hidden" bg="transparent">
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width={`${CANVAS_WIDTH}px`}
        height={`${CANVAS_HEIGHT}px`}
        style={{
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Box
          position="absolute"
          left="50%"
          top={`${ROUND_TITLE_Y}px`}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <StrokedName
            name={currentRound.name.toUpperCase()}
            fontSizePx={NAME_BASE_FONT_PX}
          />
        </Box>

        {slots.map(({ pr, centerX }) => (
          <PlayerModule
            key={pr.id}
            pr={pr}
            centerX={centerX}
            tierFontSizesPx={tierFontSizesPx}
          />
        ))}
      </Box>
    </Box>
  );
}

export default StreamViewer;