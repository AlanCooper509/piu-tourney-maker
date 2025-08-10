export type TourneyStatus = "Not Started" | "In Progress" | "Complete";
export type TourneyType = "Gauntlet" | "Double Elimination";
export interface Tourney {
  id: number;                    // bigint -> number
  created_at: string;            // ISO timestamp string
  name: string;                  // text
  start_date: string;            // ISO date string (yyyy-mm-dd)
  end_date: string;              // ISO date string (yyyy-mm-dd)
  status?: TourneyStatus | null; // enum type
  type?: TourneyType | null;     // enum type
}