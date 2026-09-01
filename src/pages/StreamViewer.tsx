import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";

// Self-hosted so the OBS Browser Source never depends on an external font
// CDN being reachable at render time. Run `npm install @fontsource/fredoka`
// if this import ever errors (e.g. after a fresh clone before node_modules
// exists) — see the LAYOUT note below for the full setup.
import "@fontsource/fredoka/700.css";

import { useRoundStreamData } from "../hooks/useRoundStreamData";
import { useTransparentBackground } from "../hooks/useTransparentBackground";
import { PlayerAvatar } from "../components/PlayerAvatar";

import type { PlayerRound } from "../types/PlayerRound";

/**
 * Stream Viewer — the stylized, fully-transparent overlay meant to actually
 * be broadcast: add it as an OBS Browser Source and it composites the
 * current round's player names directly over your scene, no background box.
 *
 * URL:
 *   /tourney/:tourneyId/StreamViewer
 *   /tourney/:tourneyId/StreamViewer?roundId=123   (pin a specific round)
 *
 * Renders nothing while no round is "In Progress" so the source stays
 * invisible until there's something worth showing. For the operator-facing
 * raw-data view (used to sanity-check what's live before pointing OBS at
 * it), see StreamHelper.tsx instead — this page shares its data logic via
 * useRoundStreamData.
 *
 * LAYOUT: designed pixel-for-pixel against a 1920x1080 (16:9) canvas — the
 * round's name is centered horizontally at Y=115 in the same font styling
 * as the player names below it. The screen is split into 4 equal 480px-wide
 * quarters, and each displayed player gets one quarter, centered as a group
 * of 4, so 2 players (e.g. a Double Elimination round) land in the middle
 * two quarters and 4 players (e.g. a Gauntlet round) fill all four. Every
 * player's module is a horizontal row — a 100x100 placeholder picture, a
 * 56px gap, then their name — centered on its quarter's center X, vertical
 * center at Y=630. Since the browser source can be sized to anything, the
 * whole 1920x1080 canvas is uniformly scaled (letterboxed) to fit whatever
 * window/source dimensions OBS actually gives it, so set the Browser Source
 * to any 16:9 resolution (1920x1080 recommended) and it lines up.
 *
 * Only 4 slots exist on stream, so if a round has more than 4 players this
 * takes the bottom 4 by sort_order. That's an interim stand-in for letting
 * the operator pick which player profiles go on stream from StreamHelper —
 * for now, "bottom 4" illustrates the idea until that picker exists.
 *
 * Each module keeps a 56px gutter on both sides within its quarter, so long
 * names never bleed into the next module or off the edge of the canvas.
 * Rather than each name fitting itself independently (inconsistent sizes
 * everywhere) or all sharing one size (long names force tiny text on short
 * names too), names fall into 3 discrete size tiers by character count —
 * short/medium/long — each tier's size fixed to fit the longest NAME that
 * could land in that tier (a repeated-"W" worst case for the two shorter
 * tiers, and "cherry.cheesecake" for the long tier, since that's the actual
 * longest name this was tuned against). So names in the same tier always
 * match each other exactly, and short names get to be noticeably bigger.
 *
 * FONT: Fredoka Bold, self-hosted via `@fontsource/fredoka` (already an npm
 * dependency here — see package.json). To set this page up on a fresh
 * checkout: `npm install` pulls it in automatically like any other
 * dependency; the `import "@fontsource/fredoka/700.css"` above is what
 * actually registers the @font-face and only needs to exist once.
 *
 * STROKES: both the picture and the name carry a three-ring outline — a
 * hairline 1px blue (#0C2DE8) ring right at the edge, then a 4px pink
 * (#F18DD8) ring, then a 6px blue ring beyond that. For the picture (a
 * plain box) that's an exact effect via layered box-shadow rings. The name
 * is rendered as SVG <text> (see StrokedName) rather than HTML specifically
 * for stroke-linejoin="round" support — CSS -webkit-text-stroke has no
 * line-join control, so sharp glyph corners (the elbow of a "k", etc.)
 * miter out into spiky triangles once a stroke gets this thick. SVG text
 * strokes still straddle the glyph outline the same way CSS ones do, so
 * the same doubled-width "outside" approximation applies, drawn as 3
 * stacked stroke passes (wide blue, narrower pink, hairline blue) behind a
 * solid white fill.
 */
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

// Named by ring position (innermost/inner/outer), not color, since which
// color goes in which ring is just a style choice — currently a hairline
// 1px blue ring right at the edge, then 4px pink, then 6px blue.
const STROKE_INNERMOST_COLOR = "#0C2DE8"; // blue
const STROKE_INNER_COLOR = "#F18DD8"; // pink
const STROKE_OUTER_COLOR = "#0C2DE8"; // blue
const STROKE_INNERMOST_WIDTH = 1;
const STROKE_INNER_WIDTH = 4;
const STROKE_OUTER_WIDTH = 6;
// box-shadow rings are purely outward, so this is exact for the picture.
const PICTURE_STROKE_SHADOW = `0 0 0 ${STROKE_INNERMOST_WIDTH}px ${STROKE_INNERMOST_COLOR}, 0 0 0 ${STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH}px ${STROKE_INNER_COLOR}, 0 0 0 ${STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH + STROKE_OUTER_WIDTH}px ${STROKE_OUTER_COLOR}`;
// -webkit-text-stroke-width straddles the glyph outline rather than only
// extending outward, so doubling each target width approximates "N px
// outside" — tweak these multipliers if the rings read as too thick.
const NAME_INNERMOST_STROKE_PX = STROKE_INNERMOST_WIDTH * 2;
const NAME_INNER_STROKE_PX = (STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH) * 2;
const NAME_OUTER_STROKE_PX =
  (STROKE_INNERMOST_WIDTH + STROKE_INNER_WIDTH + STROKE_OUTER_WIDTH) * 2;

const NAME_BASE_FONT_PX = 85; // ~64pt starting point before fitting
const NAME_MIN_FONT_PX = 24;
const NAME_FONT_WEIGHT = "700";
const NAME_FONT_FAMILY = "Fredoka, sans-serif";
// Applied to every tier's (fitted + extraPx) size, player names only —
// the round title doesn't go through this tier system, so it's unaffected.
// Was 1.5, dialed back to 1.25 — the 1.5x + full +20px bump looked nice
// but ran big enough to clip a mid-length name like "s0lost"; this splits
// the difference between the unboosted fit and that.
const NAME_SIZE_MULTIPLIER = 1.25;

// 4 discrete size tiers by name length, so names of similar length always
// match exactly instead of each auto-fitting to a slightly different size.
// Boundaries: <=4 chars, 5-7 chars, 8-10 chars, 11+ chars. Each tier's font
// size is fixed to fit the worst case for that tier — a repeated "W" (a
// wide uppercase letter) at the tier's max length for the three shorter
// tiers, and the real longest name this was tuned against for the long
// tier. Every tier additionally gets a flat +10px bump on top of its
// fitted size (the round title is unaffected — it's not part of this tier
// system).
//
// This used to be 3 tiers with the first spanning <=8 chars, which lumped
// e.g. "sel" (3 chars) in with "redviper" (8 chars) at the identical
// boosted size. That boost (extraPx + NAME_SIZE_MULTIPLIER) is a flat
// bump applied on top of each name's own fitted size — a short name has
// lots of width to spare, so it absorbs the bump fine, but a name near the
// top of a wide bucket has much less slack and overflows its module by a
// lot more, bleeding into a neighboring player's picture. Narrower buckets
// keep names within a tier close enough in length that the boost doesn't
// hit them so unevenly.
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

// Computes each size tier's font size (see NAME_SIZE_TIERS above) right
// away using whatever font is currently available, then recomputes once
// Fredoka is confirmed loaded so the canvas measurements it's based on
// reflect Fredoka's actual metrics rather than a fallback font's. Doing an
// immediate computation first (rather than only inside the async
// doc.fonts.ready chain) means the sizing still applies even if that
// promise never resolves — Font Loading API support/behavior can be
// inconsistent in OBS's embedded Chromium.
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
      .catch(() => {
        // Font Loading API failed/unsupported here — the initial
        // (possibly fallback-font) measurement above already applied, so
        // sizing still reflects extraPx/NAME_SIZE_MULTIPLIER either way.
      });

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

// CSS -webkit-text-stroke has no line-join control, so sharp/acute corners
// in a glyph (the elbow of a "k", crossbars, etc.) miter out into spiky
// triangles once the stroke gets thick. SVG <text> strokes support
// stroke-linejoin="round", which rounds those corners instead — so this
// renders the name as SVG text purely to get that join control; layering
// (3 stroke passes behind a solid fill) and the doubled "outside"
// approximation are otherwise identical to the CSS version.
//
// IMPORTANT: fontFamily/fontWeight/fontSize are all set via `style`, not
// as plain SVG attributes. Chakra's global reset includes `* { font:
// inherit }`, and a plain presentation attribute loses to ANY stylesheet
// rule — even a bare `*` selector — so `fontSize={n}` here would silently
// get overridden back down to an inherited ~16px. Inline `style` always
// wins that fight, which is what actually keeps the intended size.
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

function StreamViewerPage() {
  const { tourneyId } = useParams();
  const [searchParams] = useSearchParams();
  const roundIdOverride = searchParams.get("roundId");

  if (!tourneyId) return <div>Invalid Tourney ID</div>;

  useTransparentBackground();
  const scale = useFitScale(CANVAS_WIDTH, CANVAS_HEIGHT);
  const tierFontSizesPx = useNameSizeTierFontSizesPx(NAME_MAX_WIDTH);

  const { currentRound, playerRounds } = useRoundStreamData(
    tourneyId,
    roundIdOverride,
    "stream-viewer",
  );

  // Cap the stream to the 4 fixed quarters, taking the bottom 4 players by
  // sort_order when a round has more than that.
  const displayedPlayers = useMemo(
    () => playerRounds.slice(-MIN_SLOTS),
    [playerRounds],
  );

  // Hand out one of the MIN_SLOTS (4) equal-width quarters to each
  // displayed player, centered as a block within that grid — 2 players
  // take the middle two quarters, 4 players fill all of them. Every
  // quarter's center X is fixed regardless of how many players are live,
  // so a given slot always lands in the same spot.
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

export default StreamViewerPage;
