import { useState } from "react";
import { Box, Button, Center, Collapsible, Heading, HStack, Separator, Text } from "@chakra-ui/react";
import { IoAddCircleSharp, IoChevronForward } from "react-icons/io5";

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

// Above this many rules, the list starts collapsed by default so it doesn't dominate the page.
const COLLAPSE_THRESHOLD = 2;

export default function RoundAdvancementsSection({
  round,
  rounds,
  roundAdvancements,
  setRoundAdvancements,
  tourneyId,
}: RoundAdvancementsSectionProps) {
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourneyId);
  const [isOpen, setIsOpen] = useState(false);

  if (!round) return null;

  const isAdmin = !loadingTourneyAdminStatus && isTourneyAdmin;
  const advancementsForRound = roundAdvancements.filter(a => a.round_id === round.id);

  // Nothing to show a spectator and nothing for an admin to manage yet
  if (!isAdmin && advancementsForRound.length === 0) return null;

  const isCollapsible = advancementsForRound.length > COLLAPSE_THRESHOLD;

  const onSaved = (saved: RoundAdvancement) => {
    setRoundAdvancements(prev =>
      prev.some(a => a.id === saved.id)
        ? prev.map(a => a.id === saved.id ? saved : a)
        : [...prev, saved]
    );
  };

  const addRuleButton = isAdmin && (
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
  );

  const list = advancementsForRound.length === 0 ? (
    <Center w="100%" mt={2}>
      <Text>No advancement rules yet.</Text>
    </Center>
  ) : (
    <AdvancementRulesList
      round={round}
      rounds={rounds}
      roundAdvancements={advancementsForRound}
      setRoundAdvancements={setRoundAdvancements}
      onSaved={onSaved}
      tourneyId={tourneyId}
      isTourneyAdmin={isAdmin}
    />
  );

  return (
    <>
      <Separator mt={"24px"} mb={"24px"} />
      <Box w="100%" maxW={{ base: "100%", md: "700px" }} mx="auto">
        {isCollapsible ? (
          <Collapsible.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
            <HStack mb={isTourneyAdmin ? 2 : 1} justifyContent="center" gap={2}>
              <Collapsible.Trigger asChild cursor="pointer">
                <HStack gap={2}>
                  <IoChevronForward
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  <Heading>Advancements</Heading>
                </HStack>
              </Collapsible.Trigger>
              {addRuleButton}
            </HStack>
            <Collapsible.Content>{list}</Collapsible.Content>
          </Collapsible.Root>
        ) : (
          <>
            <HStack mb={isTourneyAdmin ? 2 : 1} justifyContent="center">
              <Heading mb={isTourneyAdmin ? 2 : 1}>Advancements</Heading>
              {addRuleButton}
            </HStack>
            {list}
          </>
        )}
      </Box>
    </>
  );
}
