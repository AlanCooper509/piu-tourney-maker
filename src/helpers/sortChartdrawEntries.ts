import type { ChartdrawEntryWithDetails } from "../types/ChartDrawEntry";

const STATE_SORT_WEIGHTS: Record<string, number> = {
  PICK: 1,
  AUTOPICK: 2,
  PROTECT: 3,
  available: 4,
  BAN: 5,
  IGNORE: 6,
};

export const comparePlayableOrder = (a: ChartdrawEntryWithDetails, b: ChartdrawEntryWithDetails) => {
  if (a.group !== b.group) {
    if (a.group === null || a.group === undefined) return -1;
    if (b.group === null || b.group === undefined) return 1;
    return Number(a.group) - Number(b.group);
  }
  return (Number(a.play_order) ?? 0) - (Number(b.play_order) ?? 0);
};

export const comparePoolOrder = (a: ChartdrawEntryWithDetails, b: ChartdrawEntryWithDetails) => {
  if (a.group !== b.group) {
    if (a.group === null || a.group === undefined) return -1;
    if (b.group === null || b.group === undefined) return 1;
    return Number(a.group) - Number(b.group);
  }
  return Number(a.draw_order) - Number(b.draw_order);
};

export function sortChartdrawEntries(entries: ChartdrawEntryWithDetails[]): ChartdrawEntryWithDetails[] {
  return [...entries].sort((a, b) => {
    const stateA = a.action || "available";
    const stateB = b.action || "available";

    const isPickedA = stateA === "PICK" || stateA === "AUTOPICK";
    const isPickedB = stateB === "PICK" || stateB === "AUTOPICK";

    if (isPickedA && isPickedB) {
      return comparePlayableOrder(a, b);
    }

    const diff = (STATE_SORT_WEIGHTS[stateA] ?? 4) - (STATE_SORT_WEIGHTS[stateB] ?? 4);
    if (diff !== 0) return diff;

    return comparePoolOrder(a, b);
  });
}