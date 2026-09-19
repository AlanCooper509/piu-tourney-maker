import { Box, HStack, Separator, Text, VStack } from "@chakra-ui/react";

import StartRoundButton from "../StartRoundButton";
import SkipRoundButton from "../SkipRoundButton/SkipRoundButton";
import EndRoundButton from "../EndRoundButton/EndRoundButton";
import { StatusElement } from "../../StatusElement";
import LeaderboardLinkButton from "../LeaderboardLinkButton";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import DeleteRoundButton from "./DeleteRoundButton";
import EditRoundDetailsButton from "./EditRoundDetailsButton";
import ScoringDetailsText from "./ScoringDetailsText";
import DrawChartsButton from "../ChartDraw/DrawChartsButton";
import StartPickBanDialog from "../PickBan/StartPickBanDialog";
import { isBracketFormat } from "../../../helpers/isBracketFormat";

import type { Round } from "../../../types/Round";
import type { RoundPool } from "../../../types/RoundPool";
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
  roundPools?: RoundPool[];
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
  roundPools,
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
  const carryOverRoundName = round?.carry_over_round_id
    ? rounds.find(r => r.id === round.carry_over_round_id)?.name ?? null
    : null;
  const advancementsForRound = round
    ? roundAdvancements.filter(a => a.round_id === round.id)
    : [];

  const hasScores = !!stages?.some(stage => (stage.scores?.length ?? 0) > 0);
  const showLeaderboardLink =
    round?.status !== "Not Started" &&
    !!players?.length &&
    hasScores;

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

  const showSkipRoundButton =
    !loadingTourneyAdminStatus && isTourneyAdmin && round?.status === "Not Started";
  const showStartRoundButton =
    !loadingTourneyAdminStatus && isTourneyAdmin && !isBracketFormat(tourneyType) && round?.status === "Not Started";
  const showDrawChartsButton =
    !loadingTourneyAdminStatus && isTourneyAdmin && isBracketFormat(tourneyType) && round?.status === "Not Started" &&
    !!activeConfig && chartdrawEntries.length === 0;
  const showStartPickBanDialog =
    !loadingTourneyAdminStatus && isTourneyAdmin && isBracketFormat(tourneyType) && round?.status !== "Not Started" &&
    !!readyToStartPickBan && !!setChartdrawEntries;
  const showEndRoundButton =
    !loadingTourneyAdminStatus && isTourneyAdmin && round?.status === "In Progress";

  const hasRoundActionButtons =
    (!isBracketFormat(tourneyType) && showLeaderboardLink) ||
    showSkipRoundButton ||
    showStartRoundButton ||
    showDrawChartsButton ||
    showStartPickBanDialog ||
    showEndRoundButton;

  return (
    <>
      <title>{roundName}</title>
      <Box>
        <VStack gap={0}>
          {loading && <Text>Loading round...</Text>}
          {error && <Text color="red">Error: {error.message}</Text>}
          {!loading && !error && !round && <Text>Round ID not found.</Text>}
          {!loading && !error && round && (
            <>
              {!loadingTourneyAdminStatus && isTourneyAdmin && (
                <Box my={2}>
                  <HStack gap={2}>
                    <EditRoundDetailsButton
                      round={round}
                      rounds={rounds}
                      roundPools={roundPools}
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

              {!isBracketFormat(tourneyType) && (
                <ScoringDetailsText
                  pointsPerStage={round?.points_per_stage}
                  tourneyId={tourneyId}
                  carryOverRoundId={round?.carry_over_round_id}
                  carryOverRoundName={carryOverRoundName}
                />
              )}

              {hasRoundActionButtons && (
                <>
                  <Separator></Separator>

                  <HStack mt={4}>
                    {!isBracketFormat(tourneyType) && showLeaderboardLink && (
                      <LeaderboardLinkButton
                        tourneyId={tourneyId}
                        roundId={round?.id ?? 0}
                      />
                    )}
                    {showSkipRoundButton && (
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
                    {showStartRoundButton && (
                      <StartRoundButton
                        round={round}
                        setRound={setRound}
                        players={players}
                        stages={stages}
                      />
                    )}
                    {showDrawChartsButton && activeConfig && (
                      <DrawChartsButton round={round} activeConfig={activeConfig} />
                    )}
                    {showStartPickBanDialog && setChartdrawEntries && (
                      <StartPickBanDialog
                        pickbanRuleset={linkedPickbanRuleset}
                        chartdrawEntries={chartdrawEntries}
                        setChartdrawEntries={setChartdrawEntries}
                        round={round}
                        players={players}
                        stages={stages ?? []}
                      />
                    )}
                    {showEndRoundButton && (
                      <EndRoundButton
                        round={round}
                        setRound={setRound}
                      />
                    )}
                  </HStack>
                </>
              )}
            </>
          )}
        </VStack>
      </Box>
    </>
  );
}
