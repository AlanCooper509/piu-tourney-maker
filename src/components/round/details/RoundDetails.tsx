import { Box, HStack, Separator, Text, VStack } from "@chakra-ui/react";

import StartRoundButton from "../StartRoundButton";
import SkipRoundButton from "../SkipRoundButton/SkipRoundButton";
import EndRoundButton from "../EndRoundButton/EndRoundButton";
import { StatusElement } from "../../StatusElement";
import { NextRoundIndicator } from "./NextRoundIndicator";
import { formatRankRangeLabel } from "../../../helpers/resolveAdvancementDestination";
import LeaderboardLinkButton from "../LeaderboardLinkButton";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import DeleteRoundButton from "./DeleteRoundButton";
import EditRoundDetailsButton from "./EditRoundDetailsButton";
import ScoringDetailsText from "./ScoringDetailsText";
import DrawChartsButton from "../ChartDraw/DrawChartsButton";
import StartPickBanDialog from "../PickBan/StartPickBanDialog";

import type { Round } from "../../../types/Round";
import type { RoundAdvancement } from "../../../types/RoundAdvancement";
import type { PlayerRound } from "../../../types/PlayerRound";
import type { Stage } from "../../../types/Stage";
import type { TourneyType } from "../../../types/Tourney";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";

interface RoundDetailsProps {
  round: Round | null;
  setRound: (round: Round | null) => void;
  rounds: Round[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
  roundAdvancements: RoundAdvancement[];
  players: PlayerRound[] | null;
  stages: Stage[] | null;
  loading: boolean;
  error: Error | null;
  tourneyId: number;
  tourneyType: TourneyType | null;
  activeConfig?: ChartdrawConfigWithSpecs | null;
  pickbanRulesets?: PickbanRulesetWithSteps[];
  chartdrawEntries?: ChartdrawEntryWithDetails[];
  setChartdrawEntries?: React.Dispatch<React.SetStateAction<ChartdrawEntryWithDetails[]>>;
}

export function RoundDetails({
  round,
  setRound,
  rounds,
  setRounds,
  roundAdvancements,
  players,
  stages,
  loading,
  error,
  tourneyId,
  tourneyType,
  activeConfig,
  pickbanRulesets = [],
  chartdrawEntries = [],
  setChartdrawEntries

}: RoundDetailsProps) {
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourneyId);

  const roundName = round?.name ?? "";
  const advancementsForRound = round
    ? roundAdvancements.filter(a => a.round_id === round.id)
    : [];

  const linkedPickbanRuleset = pickbanRulesets.find(
    (ruleset) => ruleset.id === activeConfig?.pickban_ruleset_id
  );
  const readyToStartPickBan =
    round &&
    players &&
    players.length === 2 &&
    chartdrawEntries.length > 0 &&
    linkedPickbanRuleset &&
    linkedPickbanRuleset.pickban_ruleset_steps.length > 0;

  return (
    <>
      <title>{roundName}</title>
      <Box>
        <VStack style={{ gap: "0px" }}>
          {loading && <Text>Loading round...</Text>}
          {error && <Text color="red">Error: {error.message}</Text>}
          {!loading && !error && !round && <Text>Round ID not found.</Text>}
          {!loading && !error && round && (
            <>
              {!loadingTourneyAdminStatus && isTourneyAdmin && (
                <Box my={2}>
                  <HStack gap={2}>
                    {!loadingTourneyAdminStatus && isTourneyAdmin && round?.status === "Not Started" && (
                      <SkipRoundButton
                        tourneyId={tourneyId}
                        tourneyType={tourneyType}
                        round={round}
                        setRound={setRound}
                        players={players}
                        rounds={rounds}
                        roundAdvancements={advancementsForRound}
                      />
                    )}

                    <EditRoundDetailsButton
                      round={round}
                      rounds={rounds}
                      setRound={setRound}
                      setRounds={setRounds}
                    />
                    <DeleteRoundButton
                      round={round}
                      setRounds={setRounds}
                    />
                  </HStack>
                </Box>
              )}

              <StatusElement element={round} />

              {tourneyType !== "Double Elimination" && (
                <ScoringDetailsText
                  pointsPerStage={round?.points_per_stage}
                />
              )}

              <Separator mt={2}></Separator>
              {advancementsForRound.map(advancement => {
                const destinationRound = rounds.find(r => r.id === advancement.destination_round_id);
                if (!destinationRound) return null;
                return (
                  <NextRoundIndicator
                    key={advancement.id}
                    label={advancement.label ?? formatRankRangeLabel(advancement)}
                    tourneyId={tourneyId}
                    nextRound={destinationRound}
                  />
                );
              })}

              <HStack mt={2}>
                {tourneyType !== "Double Elimination" && (
                  <LeaderboardLinkButton
                    tourneyId={tourneyId}
                    roundId={round?.id ?? 0}
                  />
                )}
                {!loadingTourneyAdminStatus && isTourneyAdmin && tourneyType !== "Double Elimination" && round?.status === "Not Started" && (
                  <StartRoundButton
                    round={round}
                    setRound={setRound}
                    players={players}
                    stages={stages}
                  />
                )}
                {!loadingTourneyAdminStatus && isTourneyAdmin && tourneyType == "Double Elimination" && round?.status === "Not Started" && (
                  <>
                    {activeConfig && chartdrawEntries.length === 0 && (
                      <DrawChartsButton round={round} activeConfig={activeConfig} />
                    )}
                  </>
                )}
                {!loadingTourneyAdminStatus && isTourneyAdmin && tourneyType == "Double Elimination" && round?.status !== "Not Started" && (
                  <>
                    {readyToStartPickBan && setChartdrawEntries && (
                      <StartPickBanDialog
                        pickbanRuleset={linkedPickbanRuleset}
                        chartdrawEntries={chartdrawEntries}
                        setChartdrawEntries={setChartdrawEntries}
                        round={round}
                        players={players}
                        stages={stages ?? []}
                      />
                    )}
                  </>
                )}
                {!loadingTourneyAdminStatus && isTourneyAdmin && round?.status === "In Progress" && (
                  <EndRoundButton
                    round={round}
                    setRound={setRound}
                  />
                )}
              </HStack>
            </>
          )}
        </VStack>
      </Box>
    </>
  );
}
