import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import StartRoundButton from "../StartRoundButton";
import SkipRoundButton from "../SkipRoundButton/SkipRoundButton";
import EndRoundButton from "../EndRoundButton/EndRoundButton";
import { StatusElement } from "../../StatusElement";
import LeaderboardLinkButton from "../LeaderboardLinkButton";
import PlayersAdvancingElement from "./PlayersAdvancingElement";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import DeleteRoundButton from "./DeleteRoundButton";
import EditRoundDetailsButton from "./EditRoundDetailsButton";
import ScoringDetailsText from "./ScoringDetailsText";

import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";
import type { Stage } from "../../../types/Stage";
import type { TourneyType } from "../../../types/Tourney";
import type { ChartdrawConfigWithSpecs } from "../../../types/ChartDrawConfig";
import type { PickbanRulesetWithSteps } from "../../../types/Pickban";
import type { ChartdrawEntryWithDetails } from "../../../types/ChartDrawEntry";
import DrawChartsButton from "../ChartDraw/DrawChartsButton";
import StartPickBanDialog from "../PickBan/StartPickBanDialog";

interface RoundDetailsProps {
  round: Round | null;
  setRound: (round: Round | null) => void;
  rounds: Round[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
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
  const navigate = useNavigate();

  const roundName = round?.name ?? "";
  const playersAdvancing = round?.players_advancing ?? -1;
  const nextRound = rounds.find((r) => r.id === round?.next_round_id);
  const nextLoserRound = rounds.find((r) => r.id === round?.lost_next_round_id);

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

              {tourneyType && tourneyType !== "Double Elimination" && (
                <PlayersAdvancingElement
                  playersAdvancing={playersAdvancing}
                  roundStatus={round?.status}
                />
              )}

              {tourneyType !== "Double Elimination" || round.parent_round_id !== null && (
                <ScoringDetailsText
                  pointsPerStage={round?.points_per_stage}
                />
              )}

              {round && round.next_round_id && nextRound && (
                <Text>
                  {tourneyType === "Double Elimination" ? "Next Round (Winner)" : "Next Round"}:{" "}
                  <Text
                    as="span"
                    color="cyan.solid"
                    cursor="pointer"
                    fontWeight="bold"
                    onClick={() => navigate(`/tourney/${tourneyId}/round/${nextRound.id}`)}
                  >
                    {nextRound.name}
                  </Text>
                </Text>
              )}

              {round && round.lost_next_round_id && nextLoserRound && (
                <Text>
                  {tourneyType === "Double Elimination" ? "Next Round (Loser)" : "Next Round (Redemption)"}:{" "}
                  <Text
                    as="span"
                    color="cyan.solid"
                    cursor="pointer"
                    fontWeight="bold"
                    onClick={() => navigate(`/tourney/${tourneyId}/round/${nextLoserRound.id}`)}
                  >
                    {nextLoserRound.name}
                  </Text>
                </Text>
              )}
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
                {!loadingTourneyAdminStatus && isTourneyAdmin && tourneyType == "Double Elimination" && round?.status === "Pick Ban" && (
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
                    tourneyId={tourneyId}
                    tourneyType={tourneyType}
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
