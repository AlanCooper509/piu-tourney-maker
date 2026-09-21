export type SmxStyle = 'solo' | 'team';

/**
 * SMX's difficulty tiers, widened with `(string & {})` rather than closed —
 * known values still autocomplete, but the type doesn't reject a tier the
 * source data adds later (it's refreshed periodically, and stays
 * unchecked at runtime since the import is cast, not validated, so a closed
 * union here would only be false confidence). Same free-form reasoning as
 * Stage.chart_type/ChartPool.chart_type, which this ultimately flows into.
 */
export type SmxDiffClass =
  | 'beginner' | 'easy' | 'hard' | 'wild' | 'dual' | 'full' | 'team'
  | (string & {});

/** One playable chart, flattened out of a song. */
export interface SmxChart {
  name: string;
  artist: string;
  bpm: string;
  image_url: string | null;
  style: SmxStyle;
  diffClass: SmxDiffClass;
  level: number;
  flags: string[]; // e.g. ['plus']
}
