import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

function getSupabaseTable<T>(
  tableName: string,
  filter?: { column: string; value: any },
  selectClause: string = '*'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTable = async () => {
    setLoading(true);

    let query = supabaseClient.from(tableName).select(selectClause);

    if (filter?.column && filter.value !== undefined) {
      query = query.eq(filter.column, filter.value);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      setError(error);
    } else {
      setData(data as T[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTable();
  }, [tableName, filter?.column, filter?.value, selectClause]);

  return { data, loading, error, refetch: fetchTable };
}

export default getSupabaseTable;