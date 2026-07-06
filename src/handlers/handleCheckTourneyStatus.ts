import { supabaseClient } from '../lib/supabaseClient';

export default async function handleCheckTourneyStatus(
  roundId?: number, 
  tourneyId?: number
) {
  if (!roundId && !tourneyId) {
    throw new Error('Either Round ID or Tournament ID is required');
  }

  try {
    // 1. Efficient Path: If we have the tourneyId, query it directly
    if (tourneyId) {
      const { data: tourney, error } = await supabaseClient
        .from('tourneys')
        .select('id, status')
        .eq('id', tourneyId)
        .single();

      if (error || !tourney) throw error || new Error('Tournament not found');

      // Normalized to match the relational join structure
      return { 
        data: { 
          tourneys: { 
            status: tourney.status 
          } 
        } 
      };
    }

    // 2. Fallback Path: If only roundId is passed, use the relational join
    const { data: roundData, error } = await supabaseClient
      .from('rounds')
      .select('id, tourney_id, tourneys(id, status)')
      .eq('id', roundId)
      .single();

    if (error || !roundData) throw error || new Error('Round not found');

    // Type casting/formatting helper to match structural expectations
    const tourneysData = Array.isArray(roundData.tourneys) 
      ? roundData.tourneys[0] 
      : roundData.tourneys;

    return { 
      data: { 
        tourneys: { 
          status: tourneysData?.status 
        } 
      } 
    };
    
  } catch (error) {
    console.error('Error fetching tournament status:', error);
    throw new Error('Could not fetch tournament status data');
  }
}