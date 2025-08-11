import { Box, Separator, Heading, Text } from '@chakra-ui/react';
import type { Stage } from '../../types/Stage';

interface StageListProps {
  stages: Stage[] | null;
  loading: boolean;
  error: Error | null;
  admin: boolean;
  loadingAdmin: boolean;
}

export function StagesList({ stages, loading, error, admin, loadingAdmin }: StageListProps) {
  const adminText = (
    <>
      {loadingAdmin && <Text>Loading admin status...</Text>}
      {admin ?
        <Text>(You are an admin for this tournament, you can add/modify stages)</Text> :
        <Text>(You are not an admin for this tournament, you cannot add/modify stages)</Text>
      }
    </>
  );

  return (
    <Box>
      <Heading mb={2}>Stages</Heading>
      {loading && <Text>Loading stages...</Text>}
      {error && <Text color="red">Error: {error.message}</Text>}
      {adminText}
      {!loading && !error && stages?.length ? (
        stages.map((stage) => (
          <Box key={stage.id} mb={2} borderWidth="1px" borderRadius="md" p={2}>
            <Text fontWeight="bold">(ID: {stage.id})</Text>
            {stage.chart_pools && stage.chart_pools.length > 0 ? (
              stage.chart_pools.map(pool => (
                <Box key={pool.id} mb={1}>
                  <Text>Chart Pool ID: {pool.id}</Text>
                  <Text>Chart Name: {pool.charts?.name_en ?? 'No Chart Name'}</Text>
                </Box>
              ))
            ) : (
              <Text>No Chart Pools</Text>
            )}
            <Separator size='lg'/>
            <Text>Chart ID: {stage.chart_id ? stage.chart_id : 'Not Selected Yet'}</Text>
          </Box>
        ))
      ) : (
        !loading && !error && <Text>No rounds found.</Text>
      )}
    </Box>
  );

}