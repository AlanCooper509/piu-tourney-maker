import { supabaseClient } from '../lib/supabaseClient';

export async function updateSupabaseTable<T>(
  tableName: string,
  values: Partial<T>,
  filters: { column: string; value: any }[] = []
) {
  let query = supabaseClient.from(tableName).update(values);

  for (const f of filters) {
    query = query.eq(f.column, f.value);
  }

  // select() returns updated rows
  const { data, error } = await query.select();
  if (error) throw error;
  return data as T[];
}