import { Box, Card, Heading, Separator, Text, VStack, HStack, Grid, Input, IconButton, Center } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaSeedling } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { CiEdit } from "react-icons/ci";

import { toaster } from "../ui/toaster";
import { ChartRow } from "../charts/ChartRow";
import { handleAddScoreToStage } from "../../handlers/handleAddScoreToStage";
import { handleUpdateScoreOnStage } from "../../handlers/handleUpdateScoreOnStage";
import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";

import type { Stage } from "../../types/Stage";
import type { PlayerRound } from "../../types/PlayerRound";

interface ChosenStagesContainerProps {
  stages: Stage[];
  players: PlayerRound[];
}

function isValidScore(score: number) {
  return !Number.isNaN(score) && score >= 0 && score <= 1000000;
}

export default function ChosenStagesContainer({
  stages,
  players,
}: ChosenStagesContainerProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);

  const [localStages, setLocalStages] = useState<Stage[]>(stages);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalStages(stages);

    const initialValues: Record<string, string> = {};
    stages.forEach(stage => {
      players.forEach(player => {
        const score = stage.scores?.find(s => s.player_round_id === player.id);
        if (score) {
          initialValues[`${stage.id}-${player.id}`] = score.score?.toString() ?? "";
        }
      });
    });
    setInputValues(initialValues);
  }, [stages, players]);

  const sortedStages = [...localStages].sort((a, b) => {
    const orderA = a.play_order ?? Infinity;
    const orderB = b.play_order ?? Infinity;
    return orderA - orderB;
  });

  const player1 = players[0];
  const player2 = players[1];

  const handleInputChange = (stageId: number, playerId: number, value: string) => {
    setInputValues(prev => ({ ...prev, [`${stageId}-${playerId}`]: value }));
  };

  const handleScoreSubmit = async (stageId: number, player: PlayerRound, isAdding: boolean) => {
    const key = `${stageId}-${player.id}`;
    const value = inputValues[key]?.trim().replace(/,/g, "");
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

    try {
      if (isAdding) {
        const newScore = await handleAddScoreToStage(score, stageId, player.id, player.player_tourneys.player_name);
        setLocalStages(prev =>
          prev.map(stage =>
            stage.id === stageId
              ? { ...stage, scores: [...(stage.scores ?? []), newScore] }
              : stage
          )
        );
        toaster.create({
          title: "Score Added",
          description: `Score "${score}" added successfully for ${player.player_tourneys.player_name}!`,
          type: "success",
          closable: true,
        });
      } else {
        const updatedScore = await handleUpdateScoreOnStage(score, stageId, player.id, player.player_tourneys.player_name);
        setLocalStages(prev =>
          prev.map(stage =>
            stage.id === stageId
              ? {
                ...stage,
                scores: stage.scores?.map(s => (s.player_round_id === player.id ? updatedScore : s)),
              }
              : stage
          )
        );
        toaster.create({
          title: "Score Updated",
          description: `Score "${score}" updated successfully for ${player.player_tourneys.player_name}!`,
          type: "success",
          closable: true,
        });
      }
    } catch (err: any) {
      toaster.create({
        title: `Error saving score`,
        description: err.message,
        type: "error",
        closable: true,
      });
    }
  };

  const getScoreColors = (score: number | null | undefined, opponentScore: number | null | undefined) => {
    if (score == null) return "fg.muted";
    if (opponentScore == null) return "fg.default";
    if (score > opponentScore) return "green.400";
    if (score < opponentScore) return "red.700";
    return "fg.default";
  };

  const renderPlayerScoreColumn = (stage: Stage, player: PlayerRound | undefined, opponent: PlayerRound | undefined) => {
    if (!player) return <Text textAlign="center">—</Text>;

    const pScore = stage.scores?.find(s => s.player_round_id === player.id)?.score;
    const oppScore = opponent ? stage.scores?.find(s => s.player_round_id === opponent.id)?.score : undefined;

    const isAdding = pScore == null;
    const showAdminControls = !loadingTourneyAdminStatus && isTourneyAdmin;
    const inputKey = `${stage.id}-${player.id}`;

    if (showAdminControls) {
      const semanticColor = getScoreColors(pScore, oppScore);

      // Match the precise return strings from getScoreColors ("green.400" and "red.700")
      let inputBorderColor = "gray.600";
      if (semanticColor === "green.400") inputBorderColor = "green.400/50";
      if (semanticColor === "red.700") inputBorderColor = "red.700/60";

      return (
        <HStack justify="center" gap={1.5} w="100%">
          <Input
            size="xs"
            bg="gray.900"
            borderColor={inputBorderColor}
            _focus={{
              borderColor: semanticColor !== "fg.muted" && semanticColor !== "fg.default"
                ? semanticColor
                : "blue.500",
              boxShadow: semanticColor !== "fg.muted" && semanticColor !== "fg.default"
                ? `0 0 0 1px var(--chakra-colors-${semanticColor.replace('.', '-')})`
                : "focusRing",
            }}
            textAlign="center"
            maxW="120px"
            placeholder={isAdding ? "Score..." : ""}
            value={inputValues[inputKey] ?? ""}
            onChange={e => handleInputChange(stage.id, player.id, e.target.value)}
          />
          <IconButton
            colorPalette={isAdding ? "green" : "blue"}
            variant="outline"
            size="xs"
            borderRadius="sm"
            onClick={() => handleScoreSubmit(stage.id, player, isAdding)}
            title={isAdding ? "Add Score" : "Update Score"}
          >
            {isAdding ? <IoMdSend /> : <CiEdit />}
          </IconButton>
        </HStack>
      );
    }

    return (
      <Center w="full" justifySelf="center">
        <Box
          px={3}
          py={1}
          minW="100px"
          textAlign="center"
          borderRadius="md"
          borderWidth="1px"
          borderTopWidth="0px"
          borderBottomWidth="0px"
          borderStyle="solid"
          borderColor={
            pScore != null && oppScore != null
              ? pScore > oppScore ? "green.500/30" : "red.500/30"
              : "border.muted/40"
          }
          bg={
            pScore != null && oppScore != null
              ? pScore > oppScore ? "green.800/10" : "red.800/10"
              : "transparent"
          }
        >
          <Text
            fontSize="md"
            fontWeight={pScore != null && oppScore != null && pScore > oppScore ? "bold" : "medium"}
            fontFamily="mono"
            letterSpacing="tighter"
            color={getScoreColors(pScore, oppScore)}
          >
            {pScore != null ? pScore.toLocaleString() : "—"}
          </Text>
        </Box>
      </Center>
    );
  };

  return (
    <Box w={{ base: "100%", md: "750px" }} h="fit-content">
      <Heading mb={2}>Match Results</Heading>

      <Card.Root variant="outline" size="sm">
        <Card.Body>
          <VStack align="stretch" gap={3}>

            {/* Header row */}
            <Grid templateColumns="1.8fr 1.3fr 1.3fr" px={2} gap={2} fontWeight="bold" fontSize="xs" alignItems="center">
              <Text color="fg.muted">Chart / Stage</Text>

              {/* Player 1 Header */}
              <HStack justify="center" gap={1} minW={0}>
                {player1?.player_tourneys?.seed != null && (
                  <HStack gap={0.5} fontSize="xs" color="green.600" marginEnd={1}>
                    <FaSeedling size={12} />
                    <Text as="span">{player1.player_tourneys.seed}</Text>
                  </HStack>
                )}
                <Text textAlign="center" textTransform="uppercase" truncate>
                  {player1?.player_tourneys?.player_name ?? "Player 1"}
                </Text>
              </HStack>

              {/* Player 2 Header */}
              <HStack justify="center" gap={1} minW={0}>
                {player2?.player_tourneys?.seed != null && (
                  <HStack gap={0.5} fontSize="xs" color="green.600" marginEnd={1}>
                    <FaSeedling size={12} />
                    <Text as="span">{player2.player_tourneys.seed}</Text>
                  </HStack>
                )}
                <Text textAlign="center" textTransform="uppercase" truncate>
                  {player2?.player_tourneys?.player_name ?? "Player 2"}
                </Text>
              </HStack>
            </Grid>

            <Separator />

            {sortedStages.length === 0 ? (
              <Text color="fg.muted" fontSize="sm" fontStyle="italic" textAlign="center" py={4}>
                No stages have been generated or played yet!
              </Text>
            ) : (
              sortedStages.map((stage) => {
                const currentChart = stage.charts;

                return (
                  <React.Fragment key={stage.id}>
                    <Grid templateColumns="1.8fr 1.3fr 1.3fr" alignItems="center" gap={2} px={2} py={0}>

                      {/* Column 1: Chart Metadata */}
                      <Box minW={0}>
                        {currentChart ? (
                          <ChartRow chart={currentChart} />
                        ) : (
                          <Text fontWeight="medium" fontSize="sm" color="fg.muted" fontStyle="italic">
                            {`Unknown Chart (ID: ${stage.chart_id})`}
                          </Text>
                        )}
                      </Box>

                      {/* Column 2: Player 1 Content */}
                      {renderPlayerScoreColumn(stage, player1, player2)}

                      {/* Column 3: Player 2 Content */}
                      {renderPlayerScoreColumn(stage, player2, player1)}
                    </Grid>
                  </React.Fragment>
                );
              })
            )}

          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}