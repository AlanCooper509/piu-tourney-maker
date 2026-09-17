-- Let a stage describe its chart directly instead of only pointing at one.
--
-- `stages.chart_id` works well for charts this app drew itself: the `charts`
-- table is what `handleDrawChartsFromConfig` queries by type, level range and
-- game, and what chart pools and pick/ban reference. That value is all spent
-- *before* a chart is chosen.
--
-- After selection the app only ever reads four fields off a chart — name_en,
-- type, level, image_url — and never aggregates or reports by chart_id. So a
-- chart chosen somewhere else (an imported ddr.tools draw) has no need of a
-- catalog row, and forcing one means matching song names between two catalogs
-- that disagree about punctuation, localization and duration suffixes.
--
-- These columns let such a stage carry its own description. A stage uses
-- whichever it has: the joined `charts` row when `chart_id` is set, else this
-- snapshot. Both stay nullable, because a stage legitimately has neither until
-- a chart is assigned to it.
--
-- Side benefit: nothing here is Pump-specific, so an imported round can come
-- from any game the source supports.

alter table public.stages
  add column if not exists chart_source     text,
  add column if not exists chart_name       text,
  add column if not exists chart_type       text,
  add column if not exists chart_level      bigint,
  add column if not exists chart_image_url  text,
  add column if not exists chart_meta       jsonb;

comment on column public.stages.chart_source is
  'Where a snapshot chart came from, e.g. ''ddrtools''. Null for charts chosen from the charts table.';
comment on column public.stages.chart_name is
  'Song name as the source recorded it. Display only; not matched against charts.name_en.';
comment on column public.stages.chart_type is
  'Free-text chart type/class label from the source (''S'', ''D'', ''COOPx2'', ''ESP''…). This app''s own charts use the chart_types enum (Single/Double/Co-Op/UCS); free text here because some sources express type and difficulty as one combined label (e.g. DDR''s ''ESP'') that does not cleanly split.';
comment on column public.stages.chart_level is
  'Numeric level as the source recorded it.';
comment on column public.stages.chart_image_url is
  'Absolute jacket URL, or null when the source has no shareable image.';
comment on column public.stages.chart_meta is
  'Everything else the source offered (artist, bpm, game, and provenance ids), kept so data is not discarded before we know we need it.';

-- A stage should not claim to be two different charts at once.
alter table public.stages
  drop constraint if exists stages_chart_id_xor_snapshot;
alter table public.stages
  add constraint stages_chart_id_xor_snapshot
  check (chart_id is null or chart_name is null);
