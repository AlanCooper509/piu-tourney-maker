import { Box, Button, Heading, HStack } from "@chakra-ui/react";
import { IoAddCircleSharp } from "react-icons/io5";

import AdvancementRulesList from "./AdvancementRulesList";
import AdvancementRuleModal from "./AdvancementRuleModal";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";

import type { Round } from "../../../types/Round";
import type { RoundAdvancement } from "../../../types/RoundAdvancement";

interface RoundAdvancementsSectionProps {
  round: Round | null;
  rounds: Round[];
  roundAdvancements: RoundAdvancement[];
  setRoundAdvancements: React.Dispatch<React.SetStateAction<RoundAdvancement[]>>;
  tourneyId: number;
}

export default function RoundAdvancementsSection({
  round,
  rounds,
  roundAdvancements,
  setRoundAdvancements,
  tourneyId,
}: RoundAdvancementsSectionProps) {
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourneyId);

  if (!round) return null;

  const advancementsForRound = roundAdvancements.filter(a => a.round_id === round.id);

  const onSaved = (saved: RoundAdvancement) => {
    setRoundAdvancements(prev =>
      prev.some(a => a.id === saved.id)
        ? prev.map(a => a.id === saved.id ? saved : a)
        : [...prev, saved]
    );
  };

  return (
    <Box>
      <HStack mb={2} justifyContent="center">
        <Heading mb={2}>Advancements</Heading>
        {!loadingTourneyAdminStatus && isTourneyAdmin && (
          <AdvancementRuleModal
            round={round}
            rounds={rounds}
            existingRules={advancementsForRound}
            onSaved={onSaved}
            trigger={
              <Button size="sm" variant="outline" borderWidth={2} colorPalette="green" px={2}>
                Add Rule <IoAddCircleSharp />
              </Button>
            }
          />
        )}
      </HStack>
      <AdvancementRulesList
        round={round}
        rounds={rounds}
        roundAdvancements={advancementsForRound}
        setRoundAdvancements={setRoundAdvancements}
        onSaved={onSaved}
        tourneyId={tourneyId}
        isTourneyAdmin={!loadingTourneyAdminStatus && isTourneyAdmin}
      />
    </Box>
  );
}
