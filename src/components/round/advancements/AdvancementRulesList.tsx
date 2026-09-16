import { HStack, IconButton, VStack } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import { FaTrash } from "react-icons/fa";

import { NextRoundIndicator } from "../details/NextRoundIndicator";
import AdvancementRuleModal from "./AdvancementRuleModal";
import { formatAdvancementLabel } from "../../../helpers/resolveAdvancementDestination";
import { toaster } from "../../ui/toaster";
import { handleDeleteRoundAdvancement } from "../../../handlers/round/handleRoundAdvancementRow";

import type { Round } from "../../../types/Round";
import type { RoundAdvancement } from "../../../types/RoundAdvancement";

interface AdvancementRulesListProps {
  round: Round;
  rounds: Round[];
  roundAdvancements: RoundAdvancement[]; // already filtered to this round
  setRoundAdvancements: React.Dispatch<React.SetStateAction<RoundAdvancement[]>>;
  onSaved: (rule: RoundAdvancement) => void;
  tourneyId: number;
  isTourneyAdmin: boolean;
}

export default function AdvancementRulesList({
  round,
  rounds,
  roundAdvancements,
  setRoundAdvancements,
  onSaved,
  tourneyId,
  isTourneyAdmin,
}: AdvancementRulesListProps) {
  const onDelete = async (advancementId: number) => {
    try {
      await handleDeleteRoundAdvancement(advancementId);
      setRoundAdvancements(prev => prev.filter(a => a.id !== advancementId));
      toaster.create({
        title: "Rule Removed",
        description: "Advancement rule removed successfully.",
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to Remove Rule",
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
    }
  };

  const sortedAdvancements = [...roundAdvancements].sort((a, b) => a.rank_start - b.rank_start);

  return (
    <VStack align="stretch" gap={1}>
      {sortedAdvancements.map(advancement => {
        const destinationRound = rounds.find(r => r.id === advancement.destination_round_id);
        if (!destinationRound) return null;
        return (
          <HStack
            key={advancement.id}
            justify={isTourneyAdmin ? "space-between" : "center"}
            borderWidth={isTourneyAdmin ? 1 : 0}
            borderRadius="md"
            px={isTourneyAdmin ? 3 : 0}
            py={isTourneyAdmin ? 2 : 0}
          >
            <NextRoundIndicator
              label={formatAdvancementLabel(advancement)}
              tourneyId={tourneyId}
              nextRound={destinationRound}
              centered={!isTourneyAdmin}
            />
            {isTourneyAdmin && (
              <HStack gap={1} flexShrink={0}>
                <AdvancementRuleModal
                  round={round}
                  rounds={rounds}
                  existingRules={roundAdvancements}
                  rule={advancement}
                  onSaved={onSaved}
                  trigger={
                    <IconButton aria-label="Edit advancement rule" size="xs" variant="outline" colorPalette="blue">
                      <CiEdit />
                    </IconButton>
                  }
                />
                <IconButton
                  aria-label="Delete advancement rule"
                  size="xs"
                  variant="outline"
                  colorPalette="red"
                  onClick={() => onDelete(advancement.id)}
                >
                  <FaTrash />
                </IconButton>
              </HStack>
            )}
          </HStack>
        );
      })}
    </VStack>
  );
}
