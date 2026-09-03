import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import "@fontsource/fredoka/700.css";

import { useRoundStreamData } from "../hooks/useRoundStreamData";
import { useTransparentBackground } from "../hooks/useTransparentBackground";
import { calculateH2HScoring } from "../helpers/calculateH2HScoring";
import { PlayerAvatar } from "../components/PlayerAvatar";

import type { PlayerRound } from "../types/PlayerRound";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const ROUND_TITLE_Y = 115;
const ROW_Y = 663;
const PICTURE_SIZE = 100;
const PICTURE_BORDER_RADIUS = "8px";
const ELEMENT_GAP = 56;
const MODULE_EDGE_PADDING = 56;
const MIN_SLOTS = 4;
const SLOT_WIDTH = CANVAS_WIDTH / MIN_SLOTS;
const MODULE_MAX_WIDTH = SLOT_WIDTH - 2 * MODULE_EDGE_PADDING;
const NAME_MAX_WIDTH = MODULE_MAX_WIDTH - PICTURE_SIZE - ELEMENT_GAP;

const SINGLE_CAB_ROW_OFFSET_X = -345;
const SINGLE_CAB_ROW_OFFSET_Y = 34;
const SINGLE_CAB_PICTURE_SIZE = 64;
const SINGLE_CAB_NAME_WIDTH = 170;
const SINGLE_CAB_AVATAR_NAME_GAP = 12;
const SINGLE_CAB_NAME_SCORE_GAP = 20;

const STROKE_INNERMOST_COLOR = "#0C2DE8";
const STROKE_INNER_COLOR = "#F18DD8";
const STROKE_WHITE_COLOR = "#FFFFFF";
const STROKE_OUTER_COLOR = "#0C2DE8";
const STROKE_INNERMOST_WIDTH = 1;
const STROKE_INNER_WIDTH = 4;
const STROKE_WHITE_WIDTH = 3;
const STROKE_OUTER_WIDTH = 6;

const PICTURE_STROKE_SHADOW = `0 0 0 ${STROKE_INNERMOST_WIDTH}px ${STROKE_INNERMOST_COLOR}, 0 0 0 ${STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH}px ${STROKE_INNER_COLOR}, 0 0 0 ${STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH + STROKE_OUTER_WIDTH}px ${STROKE_OUTER_COLOR}`;

const NAME_BASE_FONT_PX = 85;
const NAME_MIN_FONT_PX = 24;
const NAME_FONT_WEIGHT = "700";
const NAME_FONT_FAMILY = "Fredoka, sans-serif";
const NAME_SIZE_MULTIPLIER = 1.25;

const ROUND_TITLE_FONT_PX = 45;

const SCORE_FONT_REFERENCE_NAME_LENGTH = 4;

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

function StrokedName({
  name,
  fontSizePx,
  withWhiteRing = false,
}: {
  name: string;
  fontSizePx: number;
  withWhiteRing?: boolean;
}) {
  const innerRadiusPx = STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH;
  const whiteRadiusPx = innerRadiusPx + (withWhiteRing ? STROKE_WHITE_WIDTH : 0);
  const outerRadiusPx = whiteRadiusPx + STROKE_OUTER_WIDTH;

  const innermostStrokeWidth = STROKE_INNERMOST_WIDTH * 2;
  const whiteStrokeWidth = whiteRadiusPx * 2;
  const innerStrokeWidth = innerRadiusPx * 2;
  const outerStrokeWidth = outerRadiusPx * 2;

  // Generous on purpose: a canvas text measurement that runs even slightly
  // narrow leaves harmless empty space wherever the text ISN'T anchored,
  // but bleeds toward whichever side it IS measuring for. Extra padding
  // here is just a safety margin on top of that.
  const sidePadding = outerStrokeWidth + 12;
  const measuredWidth = measureTextWidthPx(name, fontSizePx);
  const svgWidth =
    (measuredWidth > 0 ? measuredWidth : fontSizePx * name.length * 0.6) +
    sidePadding * 2;
  const svgHeight = fontSizePx * 1.3 + outerStrokeWidth;

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
        strokeWidth={outerStrokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {name}
      </text>
      {withWhiteRing && (
        <text
          {...textProps}
          fill="none"
          stroke={STROKE_WHITE_COLOR}
          strokeWidth={whiteStrokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {name}
        </text>
      )}
      <text
        {...textProps}
        fill="none"
        stroke={STROKE_INNER_COLOR}
        strokeWidth={innerStrokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {name}
      </text>
      <text
        {...textProps}
        fill="none"
        stroke={STROKE_INNERMOST_COLOR}
        strokeWidth={innermostStrokeWidth}
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
  alignRight?: boolean;
}

function PlayerModule({ pr, centerX, tierFontSizesPx, alignRight = false }: PlayerModuleProps) {
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
      // Mirrors the 1-cab (SingleCabPairRow) right player: picture on the
      // right, name immediately to its left. Same maxW/gap/sizes as the
      // normal (left) orientation — just the element order is reversed, so
      // flexbox's own non-overlap guarantee (which already keeps the left
      // side safe) applies here too.
      flexDirection={alignRight ? "row-reverse" : "row"}
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

interface SingleCabPairRowProps {
  player1: PlayerRound;
  player2: PlayerRound;
  tierFontSizesPx: number[];
  scoreText: string | null;
  scoreFontSizePx: number;
}

function SingleCabPairRow({
  player1,
  player2,
  tierFontSizesPx,
  scoreText,
  scoreFontSizePx,
}: SingleCabPairRowProps) {
  const name1 = player1.player_tourneys?.player_name ?? "TBD";
  const name2 = player2.player_tourneys?.player_name ?? "TBD";
  const fontSizePx1 = tierFontSizesPx[getNameSizeTierIndex(name1.length)];
  const fontSizePx2 = tierFontSizesPx[getNameSizeTierIndex(name2.length)];

  return (
    <Box
      position="absolute"
      left={`calc(50% + ${SINGLE_CAB_ROW_OFFSET_X}px)`}
      top={`${ROW_Y + SINGLE_CAB_ROW_OFFSET_Y}px`}
      style={{ transform: "translate(-50%, -50%)" }}
      display="flex"
      flexDirection="row"
      alignItems="center"
      // Per-pair spacing via margins instead of a shared flex `gap`, since
      // the avatar<->name gap and the name<->score gap need to differ.
    >
      <PlayerAvatar
        src={player1.player_tourneys?.player_img}
        alt={name1}
        size={`${SINGLE_CAB_PICTURE_SIZE}px`}
        borderRadius={PICTURE_BORDER_RADIUS}
        boxShadow={PICTURE_STROKE_SHADOW}
      />
      <Box
        ml={`${SINGLE_CAB_AVATAR_NAME_GAP}px`}
        mr={`${SINGLE_CAB_NAME_SCORE_GAP}px`}
        flexShrink={0}
      >
        <StrokedName name={name1.toUpperCase()} fontSizePx={fontSizePx1} />
      </Box>
      {scoreText && (
        <Box flexShrink={0}>
          <StrokedName name={scoreText} fontSizePx={scoreFontSizePx} />
        </Box>
      )}
      <Box
        ml={`${SINGLE_CAB_NAME_SCORE_GAP}px`}
        mr={`${SINGLE_CAB_AVATAR_NAME_GAP}px`}
        flexShrink={0}
      >
        <StrokedName name={name2.toUpperCase()} fontSizePx={fontSizePx2} />
      </Box>
      <PlayerAvatar
        src={player2.player_tourneys?.player_img}
        alt={name2}
        size={`${SINGLE_CAB_PICTURE_SIZE}px`}
        borderRadius={PICTURE_BORDER_RADIUS}
        boxShadow={PICTURE_STROKE_SHADOW}
      />
    </Box>
  );
}

function StreamViewer() {
  const { tourneyId } = useParams();
  const [searchParams] = useSearchParams();

  const roundIdOverride = searchParams.get("roundId");
  const heatOverride = searchParams.get("heat");
  const layoutMode = searchParams.get("layout") ?? "active";
  const isSingleCab = (searchParams.get("cabs") ?? "2") === "1";

  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  useTransparentBackground();
  const scale = useFitScale(CANVAS_WIDTH, CANVAS_HEIGHT);
  const tierFontSizesPx = useNameSizeTierFontSizesPx(NAME_MAX_WIDTH);
  const singleCabTierFontSizesPx = useNameSizeTierFontSizesPx(SINGLE_CAB_NAME_WIDTH);

  const { tourney, currentRound, playerRounds, stages } = useRoundStreamData(
    tourneyId,
    roundIdOverride,
    "stream-viewer",
  );

  const isDoubleElimination = tourney?.type === "Double Elimination";

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

  const isPairedTwo = displayedPlayers.length === 2;

  // Center slots evenly based on displayed player count. A 1v1 pairing on a
  // 2-cab (dual-system) view gets its players centered under each half of
  // the canvas (quarter marks). A 1-cab (single machine) pairing is instead
  // rendered as one combined, self-centering row (see SingleCabPairRow) so
  // its avatar/name/score widths never collide.
  const slots = useMemo(() => {
    if (isPairedTwo) {
      if (isSingleCab) return [];

      return [
        { pr: displayedPlayers[0], centerX: CANVAS_WIDTH / 4 },
        { pr: displayedPlayers[1], centerX: (CANVAS_WIDTH * 3) / 4 },
      ];
    }

    const startSlot = Math.floor((MIN_SLOTS - displayedPlayers.length) / 2);

    return displayedPlayers.map((pr, idx) => ({
      pr,
      centerX: SLOT_WIDTH * (startSlot + idx + 0.5),
    }));
  }, [displayedPlayers, isPairedTwo, isSingleCab]);

  // Head-to-head match score: only shown for a 1v1 pairing in a Double
  // Elimination tourney. A 4-player free-for-all never shows a score.
  const showScore = isPairedTwo && isDoubleElimination;

  const scoring = useMemo(
    () => calculateH2HScoring({ players: displayedPlayers, stages, round: currentRound }),
    [displayedPlayers, stages, currentRound],
  );

  const scoreText = useMemo(() => {
    if (!showScore) return null;

    const [p1, p2] = displayedPlayers;
    const display = (pr: PlayerRound) =>
      scoring.hasScoresMap[pr.id] ? String(scoring.totalsMap[pr.id]) : "-";

    return `${display(p1)} - ${display(p2)}`;
  }, [showScore, displayedPlayers, scoring]);

  const scoreCenterX =
    showScore && slots.length === 2 ? (slots[0].centerX + slots[1].centerX) / 2 : 0;
  const scoreFontSizePx =
    tierFontSizesPx[getNameSizeTierIndex(SCORE_FONT_REFERENCE_NAME_LENGTH)];
  const singleCabScoreFontSizePx =
    singleCabTierFontSizesPx[getNameSizeTierIndex(SCORE_FONT_REFERENCE_NAME_LENGTH)];

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
            fontSizePx={ROUND_TITLE_FONT_PX}
            withWhiteRing
          />
        </Box>

        {isPairedTwo && isSingleCab ? (
          <SingleCabPairRow
            player1={displayedPlayers[0]}
            player2={displayedPlayers[1]}
            tierFontSizesPx={singleCabTierFontSizesPx}
            scoreText={scoreText}
            scoreFontSizePx={singleCabScoreFontSizePx}
          />
        ) : (
          <>
            {slots.map(({ pr, centerX }, idx) => (
              <PlayerModule
                key={pr.id}
                pr={pr}
                centerX={centerX}
                tierFontSizesPx={tierFontSizesPx}
                alignRight={isPairedTwo && idx === 1}
              />
            ))}

            {scoreText && (
              <Box
                position="absolute"
                left={`${scoreCenterX}px`}
                top={`${ROW_Y}px`}
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <StrokedName name={scoreText} fontSizePx={scoreFontSizePx} />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default StreamViewer;