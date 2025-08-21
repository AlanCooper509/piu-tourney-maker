import { Text, HStack, IconButton, Input, Tag } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoMdSend } from 'react-icons/io';

import { handleAddScoreToStage } from '../../handlers/handleAddScoreToStage';
import { handleUpdateScoreOnStage } from '../../handlers/handleUpdateScoreOnStage';
import { toaster } from '../ui/toaster';

import type { Stage } from '../../types/Stage';
import type { PlayerRound } from '../../types/PlayerRound';

interface EditablePlayerScoresProps {
  player: PlayerRound;
  stages: Stage[] | null;
  incrementStagesPlayed: () => void;
}

function isValidScore(score: number) {
  return !Number.isNaN(score) && score >= 0 && score <= 1000000;
}

export default function EditablePlayerScores({ player, stages, incrementStagesPlayed }: EditablePlayerScoresProps) {
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [localStages, setLocalStages] = useState<Stage[] | null>(stages);

  useEffect(() => {
    if (!stages) return;

    const initialValues: Record<number, string> = {};
    stages.forEach(stage => {
      const score = stage.scores?.find(s => s.player_round_id === player.id);
      if (score) initialValues[stage.id] = score.score?.toString() ?? '';
    });
    setInputValues(initialValues);
    setLocalStages(stages);
  }, [stages, player.id]);

  const handleChange = (stageId: number, value: string) => {
    setInputValues(prev => ({ ...prev, [stageId]: value }));
  };

  async function makeInsertSupabaseCall(score: number, stageId: number) {
    try {
      const newScore = await handleAddScoreToStage(score, stageId, player.id, player.player_tourneys.player_name);

      setLocalStages(prev =>
        prev
          ? prev.map(stage =>
              stage.id === stageId
                ? { ...stage, scores: [...(stage.scores ?? []), newScore] }
                : stage
            )
          : null
      );

      setInputValues(prev => ({ ...prev, [stageId]: newScore.score.toString() }));
      incrementStagesPlayed();

      toaster.create({
        title: 'Score Added',
        description: `Score "${score}" was added successfully for ${player.player_tourneys.player_name}!`,
        type: 'success',
        closable: true,
      });
    } catch (err: any) {
      setInputValues(prev => ({ ...prev, [stageId]: '' }));
      toaster.create({
        title: `Error Adding Score for ${player.player_tourneys.player_name}`,
        description: err.message,
        type: 'error',
        closable: true,
      });
    }
  }

  async function makeUpdateSupabaseCall(score: number, stageId: number) {
    try {
      const updatedScore = await handleUpdateScoreOnStage(score, stageId, player.id, player.player_tourneys.player_name);

      setLocalStages(prev =>
        prev
          ? prev.map(stage =>
              stage.id === stageId
                ? {
                    ...stage,
                    scores: stage.scores?.map(s =>
                      s.player_round_id === player.id ? updatedScore : s
                    ),
                  }
                : stage
            )
          : null
      );

      setInputValues(prev => ({ ...prev, [stageId]: updatedScore.score.toString() }));

      toaster.create({
        title: 'Score Updated',
        description: `Score "${score}" was updated successfully for ${player.player_tourneys.player_name}!`,
        type: 'success',
        closable: true,
      });
    } catch (err: any) {
      setInputValues(prev => ({ ...prev, [stageId]: '' }));
      toaster.create({
        title: `Error Updating Score for ${player.player_tourneys.player_name}`,
        description: err.message,
        type: 'error',
        closable: true,
      });
    }
  }

  const handleSubmitAddScore = async (stageId: number) => {
    const value = inputValues[stageId]?.trim().replace(/,/g, '');
    if (!value) return;

    const score = Number(value);
    if (!isValidScore(score)) {
      toaster.create({
        title: 'Invalid score',
        description: `Invalid score submitted for ${player.player_tourneys.player_name}`,
        type: 'error',
        closable: true,
      });
      return;
    }

    makeInsertSupabaseCall(score, stageId);
  };

  const handleSubmitEditScore = (stageId: number) => {
    const value = inputValues[stageId]?.trim().replace(/,/g, '');
    if (!value) return;

    const score = Number(value);
    if (!isValidScore(score)) {
      toaster.create({
        title: 'Invalid score',
        description: `Invalid score submitted for ${player.player_tourneys.player_name}`,
        type: 'error',
        closable: true,
      });
      return;
    }

    makeUpdateSupabaseCall(score, stageId);
  };

  return (
    localStages?.map(stage => {
      const chartName = stage.charts?.name_en ?? 'No Name';
      const chartType = stage.charts?.type?.charAt(0) ?? '';
      const chartLevel = stage.charts?.level ?? '';

      const playerScore = stage.scores?.find(s => s.player_round_id === player.id);

      const isAdding = !playerScore;

      return (
        <HStack key={stage.id} my={1}>
          <Tag.Root
            colorPalette={chartType === 'D' ? 'green' : chartType === 'S' ? 'red' : chartType === 'C' ? 'yellow' : 'blue'}
          >
            <Tag.Label>{chartLevel}</Tag.Label>
          </Tag.Root>

          {isAdding ? (
            <Input
              placeholder={chartName}
              borderColor="white"
              size="xs"
              value={inputValues[stage.id] ?? ''}
              onChange={e => handleChange(stage.id, e.target.value)}
            />
          ) : (
            <>
              <Text w="5xl" truncate>
                {chartName}
              </Text>
              <Input
                size="xs"
                borderColor="white"
                minWidth="69px"
                value={inputValues[stage.id] ?? playerScore?.score?.toString() ?? ''}
                onChange={e => handleChange(stage.id, e.target.value)}
              />
            </>
          )}

          <IconButton
            colorPalette={isAdding ? 'green' : 'blue'}
            variant="outline"
            borderRadius={5}
            size="xs"
            onClick={() => (isAdding ? handleSubmitAddScore(stage.id) : handleSubmitEditScore(stage.id))}
            px={2}
          >
            {isAdding ? 'Add' : 'Edit'} <IoMdSend />
          </IconButton>
        </HStack>
      );
    })
  );
}