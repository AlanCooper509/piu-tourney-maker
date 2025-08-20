import { Text, HStack, IconButton, Input, Tag } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoMdSend } from 'react-icons/io';

import { handleAddScoreToStage } from '../../handlers/handleAddScoreToStage';
import { handleUpdateScoreOnStage } from '../../handlers/handleUpdateScoreOnStage';
import { getScoresForPlayer } from '../../helpers/getScoresForPlayer';
import { toaster } from '../ui/toaster';

import type { Stage } from '../../types/Stage';
import type { Score } from '../../types/Score';
import type { Chart } from '../../types/Chart';
import type { PlayerRound } from '../../types/PlayerRound';

interface ScoreMappingEntry {
  stage: Stage;
  score: Score | null;
  chart: Chart | null;
};

interface EditablePlayerScores {
  player: PlayerRound;
  stages: Stage[] | null;
  incrementStagesPlayed: Function
};

function isValidScore(score: number) {
  return !Number.isNaN(score) && score >= 0 && score <= 1000000;
}

export default function ({player, stages, incrementStagesPlayed}: EditablePlayerScores) {
  // store input values keyed by stage ID
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [localStages, setLocalStages] = useState<Stage[] | null>(stages);
  const scoreMapping = getScoresForPlayer(player, localStages);

  useEffect(() => {
    if (!stages) return;

    const initialValues: Record<number, string> = {};
    stages.forEach(stage => {
      const score = stage.scores?.find(s => s.player_round_id === player.id);
      if (score) initialValues[stage.id] = score.score?.toString() ?? "";
    });
    setInputValues(initialValues);
  }, [stages, player.id]);

  const handleChange = (stageId: number, value: string) => {
    setInputValues((prev: any) => ({ ...prev, [stageId]: value }));
  };

  async function makeInsertSupabaseCall(score: number, stageId: number) {
    try {
      let newScore = await handleAddScoreToStage(score, stageId, player.id, player.player_tourneys.player_name);
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
        title: "Score Added",
        description: `Score "${score}" was added successfully for ${player.player_tourneys.player_name}!`,
        type: "success",
        closable: true,
      });
      
    } catch (err: any) {
      setInputValues(prev => ({ ...prev, [stageId]: "" }));
      toaster.create({
        title: `Error Adding Score for ${player.player_tourneys.player_name}`,
        description: `${err.message}`,
        type: "error",
        closable: true,
      });
    }
  }

  async function makeUpdateSupabasecall(score: number, stageId: number) {
    try {
      let newScore = await handleUpdateScoreOnStage(score, stageId, player.id, player.player_tourneys.player_name);
      setInputValues(prev => ({ ...prev, [stageId]: newScore.score.toString() }));
      toaster.create({
        title: "Score Updated",
        description: `Score "${score}" was updated successfully for ${player.player_tourneys.player_name}!`,
        type: "success",
        closable: true,
      });
      
    } catch (err: any) {
      setInputValues(prev => ({ ...prev, [stageId]: "" }));
      toaster.create({
        title: `Error Updating Score for ${player.player_tourneys.player_name}`,
        description: `${err.message}`,
        type: "error",
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
        title: "Invalid score",
        description: `Invalid score submitted for ${player.player_tourneys.player_name}`,
        type: "error",
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
        title: "Invalid score",
        description: `Invalid score submitted for ${player.player_tourneys.player_name}`,
        type: "error",
        closable: true,
      });
      return;
    }

    makeUpdateSupabasecall(score, stageId);
  };

  return (
    stages?.map((stage) => {
      const chartName = stage.charts ? stage.charts.name_en ?? "No Name" : "No chart selected";
      const chartType = stage.charts ? stage.charts.type?.charAt(0) ?? "" : '';
      const chartLevel = stage.charts ? stage.charts.level ?? "" : '';

      const scoreEntry = scoreMapping?.find((fs: ScoreMappingEntry) =>
        fs.chart?.name_en === stage.charts?.name_en
      );

      return scoreEntry?.score === null ? (
        /* Render form to add score */
        <HStack key={stage.id}>
          <Tag.Root colorPalette={chartType === "D" ? "green" : chartType === "S" ? "red" : chartType === "C" ? "yellow" : "blue"}>
            <Tag.Label>{chartLevel}</Tag.Label>
          </Tag.Root>
          <Input
            placeholder={`${chartName}`}
            borderColor="white"
            size="xs"
            value={inputValues[stage.id] ?? ""}
            onChange={(e) => handleChange(stage.id, e.target.value)}
          />
          <IconButton
            colorPalette="green"
            size="sm"
            onClick={() => handleSubmitAddScore(stage.id)}
            px={2}
          >
            Add <IoMdSend />
          </IconButton>
        </HStack>
      ) : (
        /* Render form to edit existing score */
        <HStack key={stage.id}>
          <Tag.Root colorPalette={chartType === "D" ? "green" : chartType === "S" ? "red" : chartType === "C" ? "yellow" : "blue"}>
            <Tag.Label>{chartLevel}</Tag.Label>
          </Tag.Root>
          <Text w="5xl" truncate>{chartName}</Text>
          <Input
            size="xs"
            borderColor="white"
            minWidth="43px"
            value={inputValues[stage.id] ?? scoreEntry?.score.score?.toString() ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(stage.id, e.target.value)
            }
          />
          <IconButton
            colorPalette="blue"
            size="sm"
            onClick={() => handleSubmitEditScore(stage.id)}
            px={2}
          >
            Edit <IoMdSend />
          </IconButton>
        </HStack>
      );
    })
  );
}