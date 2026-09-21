import { useState } from "react";
import {
  Box,
  VStack,
  Text,
  IconButton,
  HStack,
  Heading,
} from "@chakra-ui/react";

import { useCurrentTourney } from "../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../context/admin/AdminTourneyContext";
import EditTourneyDetails from "./EditTourneyDetails";
import GenerateBracketButton from "./GenerateBracketButton/GenerateBracketButton";
import GenerateSingleStreamBracketButton from "./GenerateSingleStreamBracket/GenerateSingleStreamBracketButton";
import PullFromDdrToolsButton from "./PullFromDdrToolsButton/PullFromDdrToolsButton";
import { handleUpdateTourneyDetails } from "../../handlers/handleUpdateTourneyDetails";
import { handleDeleteRoundsInTourney } from "../../handlers/round/handleDeleteRoundsInTourney";
import { handleDeleteRoundPoolsInTourney } from "../../handlers/round/handleDeleteRoundPoolsInTourney";
import getSupabaseTable from "../../hooks/getSupabaseTable";

import type { TourneyDetailsUpdate } from "../../handlers/handleUpdateTourneyDetails";
import { isBracketFormat } from "../../helpers/isBracketFormat";
import { StatusElement } from "../StatusElement";
import { toaster } from "../ui/toaster";
import { handleStartTourney } from "../../handlers/handleStartTourney";

import type { Round } from "../../types/Round";
import type { PlayerTourney } from "../../types/PlayerTourney";
import type { Game } from "../../types/Game";

interface TourneyDetailsProps {
  players: PlayerTourney[] | null;
  rounds: Round[] | null;
  loading: boolean;
  error: Error | null;
}

export function TourneyDetails({
  players,
  rounds,
  loading,
  error,
}: TourneyDetailsProps) {
  const { tourney, setTourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(
    tourney?.id ?? undefined,
  );
  const { data: gamesData } = getSupabaseTable<Game>("games");
  const gameName = gamesData.find((g) => g.id === tourney?.game_id)?.name;
  // const navigate = useNavigate(); // for StreamHelper, currently disabled
  const [updatingName, setUpdatingName] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Edit tourney details logic
  const onSaveTourneyDetails = async (details: TourneyDetailsUpdate) => {
    if (!tourney) return;
    setUpdatingName(true);
    try {
      // A format change invalidates any rounds already built for the old one
      // (same as Regenerate Bracket, which deletes-and-recreates) - db cascades
      // take care of everything hanging off those rounds (stages, scores, etc).
      const formatChanged = details.type !== undefined && details.type !== tourney.type;
      if (formatChanged && rounds && rounds.length > 0) {
        await handleDeleteRoundsInTourney(tourney.id);
        await handleDeleteRoundPoolsInTourney(tourney.id);
      }
      const updatedTourney = await handleUpdateTourneyDetails(tourney.id, details);
      setTourney(updatedTourney); // Update local tourney state
    } finally {
      setUpdatingName(false);
    }
  };

  const handleStartTourneyClick = async () => {
    if (!tourney) return;
    if (!players || players.length < 2) {
      toaster.create({
        title: "Error",
        description: "Need at least 2 players",
        type: "error",
        closable: true,
      });
      return;
    }

    if (!rounds || rounds.length < 1) {
      toaster.create({
        title: "Error",
        description: "Need at least 1 round",
        type: "error",
        closable: true,
      });
      return;
    }
    try {
      setIsStarting(true);
      const { updatedTourney } = await handleStartTourney({
        tourneyId: tourney.id,
      });
      setTourney(updatedTourney[0]);
      toaster.create({
        title: "Tournament Started",
        description: `Tournament "${tourney.name}" is now in progress.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to Start Tournament",
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <title>
        {tourney && tourney.name ? tourney.name : "Tournament Details"}
      </title>
      <Box>
        <VStack style={{ gap: "0px" }}>
          {loading && <Text>Loading tournament...</Text>}
          {error && <Text color="red">Error: {error.message}</Text>}
          {!loading && !error && tourney && (
            <>
              {!loadingTourneyAdminStatus && isTourneyAdmin && (
                <HStack mb={4}>
                  {tourney?.status === "Not Started" && (
                    <>
                      {isBracketFormat(tourney.type) ? (
                        <GenerateBracketButton
                          players={players}
                          buttonText={
                            rounds && rounds.length > 0
                              ? "Regenerate Bracket"
                              : "Generate Bracket"
                          }
                        />
                      ) : (
                        <GenerateSingleStreamBracketButton
                          players={players}
                          buttonText={
                            rounds && rounds.length > 0
                              ? "Regenerate Bracket"
                              : "Generate Bracket"
                          }
                        />
                      )}
                    </>
                  )}
                  {/*
                    <Button
                      colorPalette="purple"
                      variant="outline"
                      borderWidth={2}
                      size="sm"
                      onClick={() =>
                        navigate(`/tourney/${tourney.id}/StreamHelper`)
                      }
                    >
                      Stream Helper
                    </Button>
                  */}
                  {tourney?.status === "In Progress" && tourney?.ddrtools_room && (
                    <PullFromDdrToolsButton rounds={rounds} />
                  )}
                  <EditTourneyDetails
                    tourneyName={tourney?.name ?? ""}
                    tourneyType={tourney?.type ?? null}
                    tourneyStatus={tourney?.status}
                    rounds={rounds}
                    ddrToolsRoom={tourney?.ddrtools_room ?? null}
                    onSave={onSaveTourneyDetails}
                    isLoading={updatingName}
                  />

                  {tourney?.status === "Not Started" && (
                    <IconButton
                      colorPalette="green"
                      variant="outline"
                      borderWidth={2}
                      size="sm"
                      onClick={handleStartTourneyClick}
                      px={2}
                      loading={isStarting}
                    >
                      Start Tourney
                    </IconButton>
                  )}
                </HStack>
              )}
              <Heading>{gameName ?? ""}</Heading>
              <Text color="fg.muted">Format: {tourney.type}</Text>
              <StatusElement element={tourney} />
            </>
          )}
        </VStack>
      </Box>
    </>
  );
}
