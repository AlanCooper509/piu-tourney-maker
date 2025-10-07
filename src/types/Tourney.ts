export type TourneyStatus = "Not Started" | "In Progress" | "Complete";
export type TourneyType = "Gauntlet" | "Double Elimination" | "Waterfall (Redemption)";
export const tourneyTypes: TourneyType[] = [
  "Gauntlet",
  "Double Elimination",
  "Waterfall (Redemption)",
] as const;

export interface Tourney {
  id: number;                    // bigint -> number
  event_id: number;              // bigint -> number
  created_at: string;            // ISO timestamp string
  name: string;                  // text
  start_date: string;            // ISO date string (yyyy-mm-dd)
  end_date: string;              // ISO date string (yyyy-mm-dd)
  status?: TourneyStatus | null; // enum type
  type?: TourneyType | null;     // enum type
  thumbnail_img?: string;        // text
}