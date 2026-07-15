import { Box, Card, Heading, Separator, Text, VStack, HStack, Grid, Input, IconButton, Center } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { FaSeedling } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { CiEdit } from "react-icons/ci";

import { toaster } from "../ui/toaster";
import { ChartRow } from "../charts/ChartRow";
import { handleAddScoreToStage } from "../../handlers/handleAddScoreToStage";
import { handleUpdateScoreOnStage } from "../../handlers/handleUpdateScoreOnStage";
import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";

import type { Round } from "../../types/Round";
import type { Stage } from "../../types/Stage";
import type { PlayerRound } from "../../types/PlayerRound";
import { isValidScore1mil } from "../../helpers/isValidScore1mil";
import { LuLock, LuLockOpen } from "react-icons/lu";
import DeleteStageButton from "../stages/DeleteStageButton";

interface ChosenStagesContainerProps {
  round: Round | null;
  stages: Stage[];
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  players: PlayerRound[];
}

export default function ChosenStagesContainer({
  round,
  stages,
  setStages,
  players,
}: ChosenStagesContainerProps) {
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [overrideLock, setOverrideLock] = useState<boolean>(false);

  useEffect(() => {
    setOverrideLock(round?.status !== "Complete");
  }, [round?.id]);

  // sync form inputs when incoming data updates
  useEffect(() => {
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

  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => {
      const orderA = a.play_order ?? Infinity;
      const orderB = b.play_order ?? Infinity;
      return orderA - orderB;
    });
  }, [stages]);

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
    if (!isValidScore1mil(score)) {
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
        await handleAddScoreToStage(score, stageId, player.id, player.player_tourneys.player_name);
        toaster.create({
          title: "Score Added",
          description: `Score "${score}" added successfully for ${player.player_tourneys.player_name}!`,
          type: "success",
          closable: true,
        });
      } else {
        await handleUpdateScoreOnStage(score, stageId, player.id, player.player_tourneys.player_name);
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
    const isRoundComplete = round?.status === "Complete";
    const showAdminControls = !loadingTourneyAdminStatus && isTourneyAdmin;
    const isFieldDisabled = isRoundComplete && !overrideLock;

    const inputKey = `${stage.id}-${player.id}`;

    if (showAdminControls) {
      const semanticColor = getScoreColors(pScore, oppScore);
      let inputBorderColor = "gray.600";
      if (semanticColor === "green.400") inputBorderColor = "green.400/50";
      if (semanticColor === "red.700") inputBorderColor = "red.700/60";

      return (
        <HStack justify="center" gap={1.5} w="100%">
          <Input
            size="xs"
            bg="gray.900"
            disabled={isFieldDisabled}
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
            onBlur={() => !isFieldDisabled && handleScoreSubmit(stage.id, player, isAdding)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isFieldDisabled) {
                e.currentTarget.blur();
              }
            }}
          />
          <IconButton
            colorPalette={isAdding ? "green" : "blue"}
            variant="outline"
            size="xs"
            borderRadius="sm"
            disabled={isFieldDisabled}
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
    <Box w={{ base: "90%", md: "750px" }} h="fit-content">
      <HStack justify="space-between" align="center" mb={2}>
        <Heading>Match Results</Heading>

        {!loadingTourneyAdminStatus && isTourneyAdmin && round?.status === "Complete" && (
          <HStack
            gap={2}
            bg={overrideLock ? "green.900/20" : "red.900/20"}
            borderColor={overrideLock ? "green.700/30" : "red.700/30"}
            borderWidth="1px"
            borderRadius="md"
            px={2}
            py={1}
          >
            <Text fontSize="xs" color={overrideLock ? "green.500" : "red.500"} fontWeight="medium">
              {overrideLock ? "Unlocked" : "Locked"}
            </Text>
            <IconButton
              size="2xs"
              variant={overrideLock ? "solid" : "surface"}
              colorPalette={overrideLock ? "green" : "red"}
              onClick={() => setOverrideLock(!overrideLock)}
              aria-label={overrideLock ? "Lock Inputs" : "Unlock Inputs"}
              title={overrideLock ? "Lock Score Inputs" : "Enable Score Amendments"}
            >
              {overrideLock ? <LuLockOpen size={12} /> : <LuLock size={12} />}
            </IconButton>
          </HStack>
        )}
      </HStack>

      <Card.Root variant="outline" size="sm">
        <Card.Body>
          <VStack align="stretch" gap={3}>

            {/* Header row */}
            <Grid
              templateColumns={{ base: "1fr", sm: "1.8fr 1.3fr 1.3fr" }}
              px={2}
              gap={2}
              fontWeight="bold"
              fontSize="xs"
              alignItems="center"
            >
              <Text color="fg.muted" textAlign={{ base: "center", sm: "left" }} ps={!loadingTourneyAdminStatus && isTourneyAdmin ? 10 : 0}>
                Chart / Stage
              </Text>

              <HStack width="100%" display={{ base: "flex", sm: "contents" }} justify="space-between" gap={2}>
                <Box flex={1} minW={0} mt={{ base: 2, sm: 0 }}>
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
                </Box>

                <Box flex={1} minW={0} mt={{ base: 2, sm: 0 }}>
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
                </Box>
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
                const showAdminControls = !loadingTourneyAdminStatus && isTourneyAdmin;
                const isRoundComplete = round?.status === "Complete";
                const isDeleteDisabled = isRoundComplete && !overrideLock;

                return (
                  <React.Fragment key={stage.id}>
                    <Grid
                      templateColumns={{ base: "1fr", sm: "1.8fr 1.3fr 1.3fr" }}
                      alignItems="center"
                      gap={{ base: 3, sm: 2 }}
                      px={2}
                      py={{ base: 2, sm: 0 }}
                      borderBottom={{ base: "1px solid", sm: "none" }}
                      borderColor="border.muted/20"
                    >
                      {/* Column 1: Trash Icon + Chart Metadata Row Layout */}
                      <Box minW={0} width="100%">
                        {showAdminControls && !isDeleteDisabled ? (
                          <HStack gap={2} w="100%">
                            <DeleteStageButton
                              round={round}
                              stage={stage}
                              setStages={setStages}
                            />
                            <Box flex="1" minW={0}>
                              {currentChart ? (
                                <ChartRow chart={currentChart} darken={false} />
                              ) : (
                                <Text fontWeight="medium" fontSize="sm" color="fg.muted" fontStyle="italic" textAlign={{ base: "center", sm: "left" }}>
                                  {`Unknown Chart (ID: ${stage.chart_id})`}
                                </Text>
                              )}
                            </Box>
                          </HStack>
                        ) : (
                          currentChart ? (
                            <ChartRow chart={currentChart} darken={false} />
                          ) : (
                            <Text fontWeight="medium" fontSize="sm" color="fg.muted" fontStyle="italic" textAlign={{ base: "center", sm: "left" }}>
                              {`Unknown Chart (ID: ${stage.chart_id})`}
                            </Text>
                          )
                        )}
                      </Box>

                      {/* Column 2 & 3: Player Content */}
                      <HStack width="100%" display={{ base: "flex", sm: "contents" }} justify="space-between" gap={2}>
                        <Box flex={1}>{renderPlayerScoreColumn(stage, player1, player2)}</Box>
                        <Box flex={1}>{renderPlayerScoreColumn(stage, player2, player1)}</Box>
                      </HStack>
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