export interface UserProfile {
  user_id: string;             // uuid
  display_name: string | null; // user_profiles.display_name, null if the user has no profile row
  avatar_url: string | null;   // user_profiles.avatar_url, an external https link (nothing stored in supabase)
  tourney_id: number | null;   // null for event admins, set for tourney admins
}
