import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, HStack } from '@chakra-ui/react';

import getSupabaseTable from '../hooks/getSupabaseTable';
import type { Stage } from '../types/Stage';
import { useEffect, useState } from 'react';
import ChartSpinner from '../components/charts/ChartSpinner';

import "./ChartRollPage.css"
import { IoArrowBack, IoPlay } from 'react-icons/io5';


function ChartRollPage() {
  const navigate = useNavigate();
  const { stageId } = useParams<{ stageId: string }>();
  const [stage, setStage] = useState<Stage | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  if (!stageId) return <div>Invalid Stage ID</div>;

  const { data: stageData } =
    getSupabaseTable<Stage>(
      'stages',
      { column: 'id', value: stageId },
      '*, chart_pools(*, charts(*)), charts:chart_id(*)'
    );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (stageData && stageData.length !== 0) {
      setStage(stageData[0]);
    }
  }, [stageData]);

  async function onBack() {
    await navigate(-1);
  }

  async function onPlay() {
    setPlaying(true);
  }

  const charts = stage?.chart_pools?.map(chartPool => chartPool.charts).filter(charts => charts !== null);
  const pick = stage?.charts;

  return <>
    <Box position="absolute" width="100%" height="100%" top="0" left="0" zIndex="9998" backgroundColor="gray.900" />
    {charts && pick && playing && <ChartSpinner charts={charts} pick={pick} />}
    <HStack position="absolute" left="1em" bottom="1em" zIndex="10000">
      <Button variant="ghost" colorPalette="black" onClick={onBack}><IoArrowBack /></Button>
      {charts && pick && <Button variant="ghost" colorPalette="black" onClick={onPlay}><IoPlay /></Button>}
    </HStack>
  </>
}

export default ChartRollPage;
