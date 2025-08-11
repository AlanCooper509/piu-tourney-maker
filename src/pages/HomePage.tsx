import { Link } from 'react-router-dom';
import { Heading, Text } from '@chakra-ui/react';

import getSupabaseTable from '../hooks/getSupabaseTable';
import type { Tourney } from '../types/Tourney';
import { getAdminTourneyIds } from '../hooks/AdminTourneyHelpers';


function HomePage() {
  const { data: tourneys, loading, error } = getSupabaseTable<Tourney>('tourneys');
  const { adminTourneyIds, loading: adminLoading } = getAdminTourneyIds();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // (temporarily) sorting Tournaments by ID;
  // TODO: eventually display in some sort of table and split active/inactive and "admin" member tourneys
  tourneys.sort((a, b) => a.id - b.id);

  return (
    <>
      <title>Tourneys</title>
      <Heading as="h2">Tourneys</Heading>
      <ul>
        {tourneys.map((row: any) => (
          <li key={row.id}>
            {row.id}: <Link to={`/tourney/${row.id}`}>{row.name} ({row.type})</Link>
            {adminLoading ? (
              <Text as="span">Loading...</Text>
            ) : adminTourneyIds.includes(row.id) ? (
              <Text as="span"> (Admin)</Text>
            ) : (
              <Text as="span"> (Not Admin)</Text>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default HomePage;