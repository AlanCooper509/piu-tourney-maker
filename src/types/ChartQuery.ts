import type { SmxDiffClass, SmxStyle } from "./SmxChart";

export type ChartQuery =
  | { kind: 'piu'; name: string; level: number; type: 'Single' | 'Double' | 'Co-Op' | 'UCS' }
  | {
      kind: 'smx';
      name: string;
      artist: string;
      bpm: string;
      image_url: string | null;
      style: SmxStyle;
      diffClass: SmxDiffClass;
      level: number;
      flags: string[];
    };
