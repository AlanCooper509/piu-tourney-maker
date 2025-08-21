import { supabaseClient } from "../lib/supabaseClient";

export default async function handleAddNewTourney(name: string, startDate: string, endDate: string) {
  // 1. Insert new tourney
  const { data, error } = await supabaseClient
    .from("tourneys")
    .insert([
      {
        name,
        start_date: startDate,
        end_date: endDate,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Tourney "${name}" already exists.`);
    }
    throw error;
  }

  // 2. Get current user
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error("Could not determine authenticated user.");
  }

  // 3. Insert into tourney_admins
  const { error: adminError } = await supabaseClient
    .from("tourney_admins")
    .insert([
      {
        tourney_id: data.id,
        user_id: user.id,
      },
    ]);

  if (adminError) {
    throw adminError;
  }

  // lazy solution
  window.location.reload();
  // (eventually, we want to return the new tourney)
  return data;
}