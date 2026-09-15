import { useState, useMemo } from "react";
import { IconButton, Text, VStack, Box } from "@chakra-ui/react";
import { MdSkipNext } from "react-icons/md";

import handleSkipRound from "../../../handlers/round/transition/handleSkipRound";
import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import sortPlayersBySeed from "../../../helpers/sortPlayersBySeed";
import { resolveAdvancementDestination } from "../../../helpers/resolveAdvancementDestination";

import type { TourneyType } from "../../../types/Tourney";
import type { Round } from "../../../types/Round";
import type { RoundAdvancement } from "../../../types/RoundAdvancement";
import type { PlayerRound } from "../../../types/PlayerRound";

const toasterErrorTitleText = 'Failed to Skip Round';

interface SkipRoundButtonProps {
  tourneyId: number;
  tourneyType: TourneyType | null;
  round: Round | null;
  setRound: (round: Round | null) => void;
  players: PlayerRound[] | null;
  rounds: Round[];
  roundAdvancements: RoundAdvancement[];
}

export default function SkipRoundButton({ tourneyId, tourneyType, round, setRound, players, rounds, roundAdvancements }: SkipRoundButtonProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { destinationGroups, eliminatedPlayers } = useMemo(() => {
    if (!round || !players || players.length === 0) {
      return { destinationGroups: [], eliminatedPlayers: [] };
    }

    const sortedPlayers = sortPlayersBySeed(players);
    const groupsByDestination = new Map<number, PlayerRound[]>();
    const eliminated: PlayerRound[] = [];

    sortedPlayers.forEach((player, index) => {
      const rank = index + 1;
      const destinationRoundId = resolveAdvancementDestination(rank, roundAdvancements);
      if (destinationRoundId == null) {
        eliminated.push(player);
        return;
      }
      const group = groupsByDestination.get(destinationRoundId) ?? [];
      group.push(player);
      groupsByDestination.set(destinationRoundId, group);
    });

    const groups = Array.from(groupsByDestination.entries()).map(([destinationRoundId, groupPlayers]) => ({
      title: `To ${rounds.find(r => r.id === destinationRoundId)?.name ?? "Next Round"}`,
      players: groupPlayers
    }));

    return { destinationGroups: groups, eliminatedPlayers: eliminated };
  }, [players, round, rounds, roundAdvancements]);

  const handleConfirmSkip = async (): Promise<boolean> => {
    if (!round) return false;

    try {
      setIsEnding(true);
      const { updatedRound } = await handleSkipRound({ tourneyId, round, tourneyType });
      
      setRound({ ...updatedRound[0] });
      toaster.create({ 
        title: "Round Skipped", 
        description: `Round "${round.name}" has been skipped.`, 
        type: "success" 
      });
      return true;
    } catch (err: any) {
      toaster.create({ 
        title: toasterErrorTitleText, 
        description: err.message || "Unknown error", 
        type: "error" 
      });
      return false;
    } finally {
      setIsEnding(false);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!round) return e.preventDefault();

    if (round.status !== "Not Started") {
      e.preventDefault();
      toaster.create({ 
        title: toasterErrorTitleText, 
        description: 'Round has already been started', 
        type: 'error' 
      });
    }
  };

  const previewBody = (
    <VStack align="stretch" gap={4}>
      <Text>Are you sure you want to skip this round? Players will automatically advance based on their seeding.</Text>
      
      <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50" _dark={{ bg: "whiteAlpha.50" }}>
        <VStack align="stretch" gap={3}>
          {destinationGroups.map(group => (
            <PlayerPreviewList
              key={group.title}
              title={group.title}
              players={group.players}
              colorScheme="green"
            />
          ))}
          <PlayerPreviewList
            title="Eliminated"
            players={eliminatedPlayers}
            colorScheme="red"
          />
        </VStack>
      </Box>
    </VStack>
  );

  return (
    <DialogForm
      title="Skip Round"
      trigger={
        <IconButton px={2} variant="outline" borderWidth={2} size="sm" colorPalette="orange" onClick={handleTriggerClick}>
          Skip Round <MdSkipNext />
        </IconButton>
      }
      formBody={previewBody}
      loading={isEnding}
      open={isDialogOpen}
      setOpen={setIsDialogOpen}
      onSubmit={handleConfirmSkip}
      onCancel={() => {}}
    />
  );
}

interface PlayerPreviewListProps {
  title: string;
  players: PlayerRound[];
  colorScheme: "green" | "red";
}

function PlayerPreviewList({ title, players, colorScheme }: PlayerPreviewListProps) {
  return (
    <Box>
      <Text fontWeight="bold" color={`${colorScheme}.600`} _dark={{ color: `${colorScheme}.300` }} mb={1}>
        {title} ({players.length})
      </Text>
      {players.length > 0 ? (
        players.map((p) => (
          <Text key={p.id} fontSize="sm">
            • {p.player_tourneys?.player_name} (Seed: {p.player_tourneys?.seed ?? 'Unseeded'})
          </Text>
        ))
      ) : (
        <Text fontSize="sm" color="gray.500">None</Text>
      )}
    </Box>
  );
}