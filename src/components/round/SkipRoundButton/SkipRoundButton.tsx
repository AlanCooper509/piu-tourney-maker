import { useState, useMemo } from "react";
import { IconButton, Text, VStack, Box } from "@chakra-ui/react";
import { MdSkipNext } from "react-icons/md";

import handleSkipRound from "../../../handlers/round/transition/handleSkipRound";
import DialogForm from "../../ui/DialogForm";
import { toaster } from "../../ui/toaster";
import sortPlayersBySeed from "../../../helpers/sortPlayersBySeed";

import type { TourneyType } from "../../../types/Tourney";
import type { Round } from "../../../types/Round";
import type { PlayerRound } from "../../../types/PlayerRound";

const toasterErrorTitleText = 'Failed to Skip Round';

interface SkipRoundButtonProps {
  tourneyId: number;
  tourneyType: TourneyType | null;
  round: Round | null;
  setRound: (round: Round | null) => void;
  players: PlayerRound[] | null;
}

export default function SkipRoundButton({ tourneyId, tourneyType, round, setRound, players }: SkipRoundButtonProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { advancingPlayers, eliminatedPlayers, nonAdvancingTitle } = useMemo(() => {
    if (!round || !players || players.length === 0) {
      return { advancingPlayers: [], eliminatedPlayers: [], nonAdvancingTitle: "Eliminated" };
    }

    const sortedPlayers = sortPlayersBySeed(players);
    const cutoff = Math.min(round.players_advancing, sortedPlayers.length);

    // Determine the label dynamically based on the round configuration
    let title = "Eliminated";
    if (round.lost_next_round_id != null) {
      title = "To Losers";
    } else if (round.parent_round_id != null) {
      title = "To Redemption";
    }

    return {
      advancingPlayers: sortedPlayers.slice(0, cutoff),
      eliminatedPlayers: sortedPlayers.slice(cutoff),
      nonAdvancingTitle: title
    };
  }, [players, round]);

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
          <PlayerPreviewList 
            title="Advancing" 
            players={advancingPlayers} 
            colorScheme="green" 
          />
          <PlayerPreviewList 
            title={nonAdvancingTitle} // <-- Now dynamic!
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