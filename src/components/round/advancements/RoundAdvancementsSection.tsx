import { Box, Heading } from "@chakra-ui/react";

import AdvancementRulesList from "./AdvancementRulesList";
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

  return (
    <Box>
      <Heading mb={2}>Advancements</Heading>
      <AdvancementRulesList
        round={round}
        rounds={rounds}
        roundAdvancements={advancementsForRound}
        setRoundAdvancements={setRoundAdvancements}
        tourneyId={tourneyId}
        isTourneyAdmin={!loadingTourneyAdminStatus && isTourneyAdmin}
      />
    </Box>
  );
}
