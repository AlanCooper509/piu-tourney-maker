import { Fragment, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { useStreamMatch } from "../hooks/useStreamMatch";
import { useEventStreamCss } from "../hooks/useEventStreamCss";
import { useTransparentBackground } from "../hooks/useTransparentBackground";
import { chartBadgeLabel } from "../helpers/getStageChart";
import { chartBadgeColor } from "../helpers/chartSnapshot";
import { OutlinedText } from "../components/stream/OutlinedText";
import { FitToWidth } from "../components/stream/FitToWidth";
import { StreamCssContext } from "../components/stream/StreamCssContext";

import type { PlayerRound } from "../types/PlayerRound";

/**
 * Individual OBS Browser Sources, one element each, positioned in OBS rather
 * than on a fixed canvas:
 *
 *   source/round-title              the round name, or with ?pool its round
 *                                   pool name when it has one; ?trimmed cuts a
 *                                   round name after the last ": "
 *                                   ("WR1:M4: A vs. B" -> "WR1:M4")
 *   source/charts                   the round's charts
 *   source/player/:slot             one player, by on-stream position (1-4)
 *   source/score                    scores chained in on-screen order, e.g.
 *                                   "2 - 1"; ?leaderboard for ranked standings,
 *                                   ?round for the whole round, not the heat
 *
 * Player sources take flags: ?img shows the picture, ?score shows
 * "Name (3)", and ?flip mirrors the row (picture on the right).
 *
 * With nothing pushed to stream (or with ?placeholder), every source shows
 * stand-in content and the root gets a .placeholder class, for laying out
 * the OBS scene ahead of time.
 *
 * Markup is plain, class-named HTML with neutral defaults. The look comes
 * from the event's shared stylesheet (events.stream_css), edited in Stream
 * Helper and injected after the defaults so it always wins.
 */

const DEFAULT_CSS = `
.stream-source {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
  /* Room for outlines, rings and shadows, which draw outside their boxes
     and would otherwise be clipped at the page edge. */
  padding: 24px;
  box-sizing: border-box;
}
/* :where() keeps this at class-level specificity, so event CSS like
   .round-title { font-size: 45px } still wins. */
.stream-source :where(h1) { margin: 0; font-size: 1em; }
.player { display: flex; align-items: center; gap: 0.3em; flex-shrink: 0; }
.player.flipped { flex-direction: row-reverse; }
.player .label { display: flex; align-items: center; gap: 0.3em; }
.player .avatar {
  width: 2em; height: 2em; object-fit: cover;
  border-radius: 0.15em; background: #718096;
}
.match-score { display: flex; gap: 0.3em; }
/* Score with 3+ players: place / name / score columns that line up. */
.standings {
  display: grid; grid-template-columns: auto auto auto;
  column-gap: 0.6em; row-gap: 0.2em; align-items: center;
}
.standing { display: contents; }
.standings .place, .standings .name { justify-self: start; }
.standings .score { justify-self: end; }
/* The charts frame hugs its cards and stays centered in the source, so a
   3-card and a 5-card draw sit in the same place. Size the OBS source for
   the most cards you'll draw; past that, cards shrink rather than overflow. */
.source-charts { display: flex; justify-content: center; }
.charts { display: flex; gap: 16px; width: max-content; max-width: 100%; box-sizing: border-box; }
.charts .chart { flex: 0 1 auto; min-width: 0; }
/* ?frame=full: the frame fills the source so its edges never move between
   rounds; the cards center inside it. */
.frame-full .charts { width: 100%; justify-content: center; }
/* Mirrors the app's ChartCard: dark card, jacket on top, name + level bar. */
.chart {
  width: 280px; display: flex; flex-direction: column;
  background: #18181b; border-radius: 6px; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 15px; text-shadow: none;
}
.chart .jacket { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
.chart .jacket-empty { background: #3f3f46; }
/* Placeholder only: mark the frame's full extent (outside any rings the
   event CSS draws around it) while operators size the OBS source. */
.placeholder .charts { outline: 1px solid red; outline-offset: 10px; }
.chart .chart-info { display: flex; gap: 6px; align-items: center; padding: 6px 8px; }
.chart .chart-name { flex: 1; text-align: left; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chart .chart-level {
  padding: 0 6px; border-radius: 4px; font-size: 0.9em;
  color: var(--level-fg); background: var(--level-bg);
  border: 1px solid var(--level-border);
}
.chart { --level-fg: #e4e4e7; --level-bg: rgba(161, 161, 170, 0.15); --level-border: rgba(161, 161, 170, 0.4); }
.chart.color-red { --level-fg: #fca5a5; --level-bg: rgba(239, 68, 68, 0.15); --level-border: rgba(239, 68, 68, 0.45); }
.chart.color-green { --level-fg: #86efac; --level-bg: rgba(34, 197, 94, 0.15); --level-border: rgba(34, 197, 94, 0.45); }
.chart.color-purple { --level-fg: #d8b4fe; --level-bg: rgba(168, 85, 247, 0.15); --level-border: rgba(168, 85, 247, 0.45); }
.chart.color-yellow { --level-fg: #fde047; --level-bg: rgba(234, 179, 8, 0.15); --level-border: rgba(234, 179, 8, 0.45); }
.chart.color-cyan { --level-fg: #67e8f9; --level-bg: rgba(6, 182, 212, 0.15); --level-border: rgba(6, 182, 212, 0.45); }
.chart.color-teal { --level-fg: #5eead4; --level-bg: rgba(20, 184, 166, 0.15); --level-border: rgba(20, 184, 166, 0.45); }
.chart.color-pink { --level-fg: #f9a8d4; --level-bg: rgba(236, 72, 153, 0.15); --level-border: rgba(236, 72, 153, 0.45); }
`;

function Avatar({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  // Keep the box even without a picture so layouts don't jump around.
  if (!src || failed) return <div className="avatar avatar-empty" />;
  return <img className="avatar" src={src} alt={alt} onError={() => setFailed(true)} />;
}

interface PlayerDisplay {
  showImg: boolean;
  showScore: boolean;
  flipped: boolean;
}

function Player({
  pr,
  slot,
  score,
  display,
}: {
  pr: PlayerRound | undefined;
  slot: number;
  score: number;
  display: PlayerDisplay;
}) {
  const name = pr?.player_tourneys?.player_name ?? "TBD";

  return (
    <div className={`player player-${slot}${display.flipped ? " flipped" : ""}`}>
      {display.showImg && <Avatar src={pr?.player_tourneys?.player_img} alt={name} />}
      {/* Grouped so flipping moves the picture, while text still reads "Name (3)". */}
      <span className="label">
        <OutlinedText className="name" text={name} />
        {display.showScore && <OutlinedText className="score" text={`(${score.toLocaleString()})`} />}
      </span>
    </div>
  );
}

function Standings({
  entries,
}: {
  // Already ranked best first, with place resolved (ties share one).
  entries: Array<{ pr: PlayerRound; score: number; place: number }>;
}) {
  return (
    <div className="standings">
      {entries.map(({ pr, score, place }, idx) => {
        return (
          <div key={pr.id} className={`standing standing-${idx + 1}`}>
            <OutlinedText className="place" text={String(place)} />
            <OutlinedText className="name" text={pr.player_tourneys?.player_name ?? "TBD"} />
            <OutlinedText className="score" text={score.toLocaleString()} />
          </div>
        );
      })}
    </div>
  );
}

// Stand-ins shown while nothing is live: four covers player slots 1-4, a full
// leaderboard and an entire round.
const PLACEHOLDER_PLAYERS = [1, 2, 3, 4].map(
  (n) =>
    ({
      id: -n,
      player_tourneys: { player_name: `Player ${n}`, player_img: null },
    }) as unknown as PlayerRound,
);

interface ChartCardData {
  key: number | string;
  imageUrl: string | null;
  name: string;
  level: string | number;
  color: string;
}

const PLACEHOLDER_CHART_COUNTS = [3, 4, 5];
const PLACEHOLDER_CHART_CYCLE_MS = 2000;

const PLACEHOLDER_CHARTS: ChartCardData[] = [1, 2, 3, 4, 5].map((n) => ({
  key: `placeholder-${n}`,
  imageUrl: null,
  name: `Chart ${n}`,
  level: "??",
  color: "gray",
}));

/** Scores in on-screen order, chained: "3 - 1", or "3 - 1 - 2 - 0" for a full heat. */
// Bracket rounds are named "<match>: <player> vs. <player>"; the players are
// already on screen, so the round name keeps just "<match>". Greedy, so it cuts
// at the last ": " ("Top 8: Grand Finals: A vs. B" -> "Top 8: Grand Finals").
const MATCHUP_SUFFIX = /^(.+):\s+\S.*\svs\.?\s.+$/i;

function trimMatchup(roundName: string): string {
  return roundName.match(MATCHUP_SUFFIX)?.[1] ?? roundName;
}

function MatchScore({ scores }: { scores: number[] }) {
  return (
    <div className="match-score">
      {scores.map((score, idx) => (
        <Fragment key={idx}>
          {idx > 0 && <OutlinedText className="separator" text="-" />}
          <OutlinedText className={`score player-${idx + 1}`} text={score.toLocaleString()} />
        </Fragment>
      ))}
    </div>
  );
}

function StreamSource() {
  const { tourneyId = "", "*": sourcePath = "" } = useParams();
  const [searchParams] = useSearchParams();

  useTransparentBackground();

  const [kind, slotRaw] = sourcePath.split("/").filter(Boolean);
  const roundIdOverride = searchParams.get("roundId");
  const live = useStreamMatch(tourneyId, {
    roundIdOverride,
    heatOverride: searchParams.get("heat"),
    showAllInHeat: searchParams.has("all"),
    // Score ?round: rank everyone in the round, not just the live heat.
    wholeRound: kind === "score" && searchParams.has("round"),
  });
  const { tourney, currentRound } = live;

  const { css } = useEventStreamCss(tourney?.event_id);

  // Nothing pushed to stream (or ?placeholder): stand-in content, so OBS
  // operators can position and size every source before the event.
  const isPlaceholder =
    searchParams.has("placeholder") ||
    (tourney !== null && !tourney.stream_round_id && !roundIdOverride);
  // Chained heat-only Score previews a 1v1 "0 - 0"; leaderboard or entire
  // round previews all four, so each option looks different while setting up.
  const placeholderPlayers =
    kind === "score" && !searchParams.has("leaderboard") && !searchParams.has("round")
      ? PLACEHOLDER_PLAYERS.slice(0, 2)
      : PLACEHOLDER_PLAYERS;

  const { poolName, roundName, players, rankedPlayers, scoreFor, placeFor } = isPlaceholder
    ? {
        // Acts like a live round in a pool, so ?pool shows the pool name; the
        // round name is shaped so ?trimmed visibly works.
        poolName: "Round Pool Name",
        roundName: "Round Name: Player A vs. Player B",
        players: placeholderPlayers,
        rankedPlayers: placeholderPlayers,
        scoreFor: () => 0,
        placeFor: (pr: PlayerRound) => placeholderPlayers.indexOf(pr) + 1,
      }
    : live;

  // Placeholder charts cycle 3 -> 4 -> 5 cards so the frame's growth (or, with
  // a fixed frame, the cards re-centering) is visible while setting up.
  const cyclePlaceholderCharts = isPlaceholder && kind === "charts";
  const [placeholderChartCount, setPlaceholderChartCount] = useState(PLACEHOLDER_CHART_COUNTS[0]);
  useEffect(() => {
    if (!cyclePlaceholderCharts) return;
    const timer = setInterval(() => {
      setPlaceholderChartCount((count) => {
        const next = PLACEHOLDER_CHART_COUNTS.indexOf(count) + 1;
        return PLACEHOLDER_CHART_COUNTS[next % PLACEHOLDER_CHART_COUNTS.length];
      });
    }, PLACEHOLDER_CHART_CYCLE_MS);
    return () => clearInterval(timer);
  }, [cyclePlaceholderCharts]);

  const chartCards: ChartCardData[] = isPlaceholder
    ? PLACEHOLDER_CHARTS.slice(0, placeholderChartCount)
    : live.charts.map(({ stage, chart }) => ({
        key: stage.id,
        imageUrl: chart!.image_url ?? null,
        name: chart!.name_en,
        level: chartBadgeLabel(chart, chart!.level),
        color: chartBadgeColor(chart!),
      }));
  const display: PlayerDisplay = {
    showImg: searchParams.has("img"),
    showScore: searchParams.has("score"),
    flipped: searchParams.has("flip"),
  };

  let content: React.ReactNode = null;

  if (isPlaceholder || currentRound) {
    switch (kind) {
      case "round-title": {
        // ?pool prefers the round pool name when there is one; otherwise the
        // round name, which ?trimmed can cut down to the match ("WR1:M4").
        const name =
          poolName && searchParams.has("pool")
            ? poolName
            : searchParams.has("trimmed")
              ? trimMatchup(roundName)
              : roundName;
        content = <OutlinedText as="h1" className="round-title" text={name} />;
        break;
      }

      case "player": {
        const slot = Math.max(1, Number(slotRaw) || 1);
        const pr = players[slot - 1];
        content = <Player pr={pr} slot={slot} score={pr ? scoreFor(pr) : 0} display={display} />;
        break;
      }

      case "score": {
        // ?leaderboard: ranked place / name / score rows, best first.
        if (searchParams.has("leaderboard")) {
          content = (
            <FitToWidth>
              <Standings
                entries={rankedPlayers.map((pr) => ({ pr, score: scoreFor(pr), place: placeFor(pr) }))}
              />
            </FitToWidth>
          );
          break;
        }

        // Otherwise chained in on-screen order; always at least "0 - 0".
        const scores = players.map(scoreFor);
        while (scores.length < 2) scores.push(0);
        content = (
          <FitToWidth>
            <MatchScore scores={scores} />
          </FitToWidth>
        );
        break;
      }

      case "charts":
        content = (
          <div className="charts">
            {chartCards.map((card) => (
              <div key={card.key} className={`chart color-${card.color}`}>
                {card.imageUrl ? (
                  <img className="jacket" src={card.imageUrl} alt={card.name} />
                ) : (
                  <div className="jacket jacket-empty" />
                )}
                <div className="chart-info">
                  <span className="chart-name">{card.name}</span>
                  <span className="chart-level">{card.level}</span>
                </div>
              </div>
            ))}
          </div>
        );
        break;
    }
  }

  return (
    <>
      <style>{DEFAULT_CSS}</style>
      {css && <style>{css}</style>}
      <div
        className={`stream-source source-${kind ?? "unknown"}${
          searchParams.get("frame") === "full" ? " frame-full" : ""
        }${isPlaceholder ? " placeholder" : ""}`}
      >
        <StreamCssContext.Provider value={css}>{content}</StreamCssContext.Provider>
      </div>
    </>
  );
}

export default StreamSource;
