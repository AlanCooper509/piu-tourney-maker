export interface BulkPlayerEntry {
  name: string;
  seed: number | null;
  line: number; // 1-based line number in the original input, for error reporting
}

export interface ParsedBulkPlayers {
  entries: BulkPlayerEntry[]; // valid, deduped (within input) entries in input order
  duplicateLines: { line: number; name: string }[]; // lines skipped for repeating an earlier name
}

// Accepts one player per line, optionally followed by a seed: "Name" or "Name, Seed" / "Name<TAB>Seed"
export function parseBulkPlayerInput(raw: string): ParsedBulkPlayers {
  const seen = new Set<string>();
  const entries: BulkPlayerEntry[] = [];
  const duplicateLines: { line: number; name: string }[] = [];

  raw.split(/\r?\n/).forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return;

    const match = line.match(/^(.*?)[,\t]\s*(\d+)\s*$/);
    const name = (match ? match[1] : line).trim();
    const seed = match ? Number(match[2]) : null;

    if (!name) return;

    const key = name.toLowerCase();
    if (seen.has(key)) {
      duplicateLines.push({ line: idx + 1, name });
      return;
    }
    seen.add(key);
    entries.push({ name, seed, line: idx + 1 });
  });

  return { entries, duplicateLines };
}
