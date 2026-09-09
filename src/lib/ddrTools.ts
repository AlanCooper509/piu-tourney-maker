/**
 * Read-only client for a ddr.tools event room.
 *
 * ddr.tools keeps each event room's state in a PartyKit room and exposes it as
 * a plain JSON GET with `Access-Control-Allow-Origin: *`, so pulling results
 * needs no credentials and no cooperation from that side beyond the URL.
 *
 * Only the parts of its app state we actually read are typed here.
 */

const DEFAULT_HOST = "ddr-card-draw-party.noahm.partykit.dev";

/** where ddr.tools serves song jackets from */
const JACKET_BASE =
  import.meta.env.VITE_DDRTOOLS_JACKET_BASE || "https://ddr.tools/jackets";

/** Overridable so a local ddr.tools dev server can be pulled from. */
const HOST = import.meta.env.VITE_DDRTOOLS_PARTY_HOST || DEFAULT_HOST;
const PROTOCOL = HOST.startsWith("localhost") ? "http" : "https";

/**
 * A chart as ddr.tools drew it. Recorded as-is rather than resolved against our
 * charts table, so this stays true for any game ddr.tools supports.
 */
export interface DdrToolsChart {
  id: string;
  type: "DRAWN" | "PLACEHOLDER";
  name: string;
  nameTranslation?: string;
  /** difficulty abbreviation, e.g. "S" / "D" / "COOPx2" for Pump, "ESP" for DDR */
  diffAbbr: string;
  level: number;
  artist?: string;
  bpm?: string;
  /** app-relative jacket path, e.g. "pump/148.jpg" */
  jacket?: string;
}

interface DdrToolsSubDrawing {
  configId: string;
  charts: DdrToolsChart[];
}

/**
 * Draws that originated from this app carry `type: "piu"` plus the tourney and
 * round ids they were created for, which is what lets a pull attach results to
 * the right round without guessing.
 */
export interface DdrToolsDrawingMeta {
  type: "piu" | "startgg" | "simple";
  subtype?: "versus" | "gauntlet";
  title: string;
  players: Array<{ id: string; name: string }>;
  /** round id, for a piu draw */
  id?: string;
  tourneyId?: string;
  phaseName?: string;
  /** playerId -> chartId -> score */
  scoresByEntrant?: Record<string, Record<string, number | undefined>>;
}

/** a chart a player banned, or pocket-picked over */
interface DdrToolsChartAction {
  player: string;
  chartId: string;
}

export interface DdrToolsDrawing {
  id: string;
  configId: string;
  meta: DdrToolsDrawingMeta;
  /** chart id -> winning player id */
  winners: Record<string, string | null>;
  /** chart id -> the ban placed on it, so it was never played */
  bans?: Record<string, DdrToolsChartAction | null>;
  /** chart id -> the chart played in its place */
  pocketPicks?: Record<
    string,
    (DdrToolsChartAction & { pick: DdrToolsChart }) | null
  >;
  subDrawings: Record<string, DdrToolsSubDrawing>;
}

export interface DdrToolsState {
  drawings: { ids: string[]; entities: Record<string, DdrToolsDrawing> };
  config: {
    ids: string[];
    entities: Record<string, { id: string; name: string; gameKey: string }>;
  };
  event: { eventName?: string };
}

/** Accepts a ddr.tools event URL (…/e/<room>) or a bare room name. */
export function parseRoomName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const fromUrl = trimmed.match(/\/e\/([^/?#\s]+)/);
  const room = fromUrl ? fromUrl[1] : trimmed;
  // room names are path segments; reject anything that clearly isn't one
  return /^[\w.~-]+$/.test(room) ? room : null;
}

export function roomUrl(room: string) {
  return `${PROTOCOL}://${HOST}/parties/main/${room}`;
}

export async function fetchRoomState(room: string): Promise<DdrToolsState> {
  const res = await fetch(roomUrl(room));
  if (!res.ok) {
    throw new Error(`ddr.tools returned ${res.status} for room "${room}"`);
  }
  const state = (await res.json()) as DdrToolsState;
  if (!state?.drawings?.entities) {
    throw new Error(`"${room}" doesn't look like a ddr.tools event room`);
  }
  return state;
}

/**
 * The draws in a room that were created for this tournament. A room can hold
 * draws for several tournaments, or none of ours at all.
 */
export function drawingsForTourney(state: DdrToolsState, tourneyId: number) {
  return Object.values(state.drawings.entities).filter(
    (d) => d.meta.type === "piu" && d.meta.tourneyId === String(tourneyId),
  );
}

/**
 * The charts a drawing actually played, in play order.
 *
 * Beyond skipping unresolved player picks, this drops charts that were banned
 * — they were drawn but never played — and swaps in a pocket pick's
 * replacement where one was taken. The replacement keeps the original chart's
 * id, because that's the key the scores are recorded under.
 */
export function drawnCharts(drawing: DdrToolsDrawing): DdrToolsChart[] {
  return Object.values(drawing.subDrawings)
    .flatMap((sub) => sub.charts)
    .filter((c) => c.type === "DRAWN" && !drawing.bans?.[c.id])
    .map((c) => {
      const pick = drawing.pocketPicks?.[c.id]?.pick;
      return pick ? { ...pick, id: c.id, type: c.type } : c;
    });
}

/** How many drawn charts were banned, and so aren't being written as played. */
export function bannedChartCount(drawing: DdrToolsDrawing) {
  return Object.values(drawing.subDrawings)
    .flatMap((sub) => sub.charts)
    .filter((c) => c.type === "DRAWN" && !!drawing.bans?.[c.id]).length;
}

/**
 * The game key a drawing was made with, kept for provenance only. Nothing
 * branches on it — a stage records whatever the source called the game.
 */
export function gameKeyForDrawing(
  state: DdrToolsState,
  drawing: DdrToolsDrawing,
): string | null {
  const configIds = [
    ...Object.values(drawing.subDrawings).map((s) => s.configId),
    drawing.configId,
  ];
  for (const cid of configIds) {
    const key = state.config.entities[cid]?.gameKey;
    if (key) return key;
  }
  return null;
}

/**
 * ddr.tools serves jackets relative to its own origin, so a stored image URL
 * has to be absolute to render anywhere else.
 */
export function absoluteJacketUrl(jacket: string | undefined): string | null {
  if (!jacket) return null;
  if (/^https?:\/\//.test(jacket)) return jacket;
  // real jacket paths contain spaces and non-latin characters
  // ("ddr_2013/Right on time (Ryu☆Remix).png"), so each segment needs encoding
  const path = jacket
    .replace(/^\//, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${JACKET_BASE}/${path}`;
}
