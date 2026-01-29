import {
  Box,
  Button,
  createListCollection,
  Heading,
  HStack,
  Link,
  Portal,
  Select,
  Stack
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BiSolidMedal } from "react-icons/bi";
import { RiSwordLine } from "react-icons/ri";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { IoAddCircleSharp } from "react-icons/io5";

import RoundModal from "../../round/details/RoundModal";
import { handleAddRoundToTourney } from "../../../handlers/round/handleRoundRow";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
import { toaster } from "../../ui/toaster";

import type { Round } from "../../../types/Round";

interface TourneyHeaderTextProps {
  rounds: Round[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
  currentRoundId: number;
}

export default function TourneyHeaderText({
  rounds,
  setRounds,
  currentRoundId
}: TourneyHeaderTextProps) {
  const navigate = useNavigate();
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney( tourney?.id ?? undefined );
  // values for Select dropdown
  const roundOptions = createListCollection({
    items: rounds
    .map((round) => ({
      label: round.name,
      value: `/tourney/${tourney?.id}/round/${round.id}`,
      parent: round.parent_round_id,
      status: round.status,
    })),
  });
  const currentSelectValue = currentRoundId && `/tourney/${tourney?.id}/round/${currentRoundId}`;

  // setup for previous and next round navigation
  const currentRoundIndex = rounds.findIndex(r => r.id === currentRoundId) ?? null;
  const prevRoundInList = Number.isInteger(currentRoundId) ? rounds[currentRoundIndex - 1] : null;
  const nextRoundInList = Number.isInteger(currentRoundId) ? rounds[currentRoundIndex + 1] : null;

  // Button for admin to add Round on the TourneyPage
  const addRoundButton = (
    <Button
      size="sm"
      colorPalette="green"
      variant="outline"
      display={!nextRoundInList && !loadingTourneyAdminStatus && isTourneyAdmin ? "inline-block" : "none"}
    >
      <IoAddCircleSharp />
    </Button>
  );

  async function onAdminClick(
    name: string,
    advancing: number,
    nextRoundId: number | undefined,
    parentRoundId: number | undefined,
    pointsPerStage: string | undefined
  ) {
    if (!tourney) return;
    const updatedRound = await handleAddRoundToTourney(
      tourney.id,
      name,
      advancing,
      nextRoundId,
      parentRoundId,
      pointsPerStage
    );

    setRounds((prev) =>
      prev.some(r => r.id === updatedRound.id)
        ? prev.map(r => r.id === updatedRound.id ? updatedRound : r) // update
        : [...prev, updatedRound] // add new
    );
    toaster.create({
      title: "Round Added",
      description: `Round "${updatedRound.name}" was added successfully.`,
      type: "success",
      closable: true,
    });
  }

  // logic to show either the Add Round or Next Round button (never both at the same time)
  const showAddRoundButton = tourney && tourney.status !="Complete" && !loadingTourneyAdminStatus && isTourneyAdmin && !nextRoundInList;
  const showNextRoundButton = !showAddRoundButton;

  return (
    <Stack align="center" justify="center" direction="column" gap={6}>
      <Heading fontSize={["3xl", "3xl", "3xl", "4xl"]}>
        <Link
          href={`/tourney/${tourney?.id}`}
          color="cyan.solid"
          variant="underline"
          _hover={{ color: "cyan.focusRing" }}
          _focus={{ color: "cyan.solid", boxShadow: "none" }}
        >
          {tourney?.name}
        </Link>
      </Heading>

      <HStack w={"full"} align="center" justify="center"> 
        {/* Previous Round Navigation */}
        <Button
          size="sm"
          colorPalette="blue"
          variant="outline"
          visibility={prevRoundInList ? "visible" : "hidden"}
          onClick={() => navigate(`/tourney/${tourney?.id}/round/${prevRoundInList?.id}`)}
        >
          <IoChevronBack />
        </Button>

        {/* Round Dropdown Navigation */}
        <Select.Root
          collection={roundOptions}
          size="sm"
          flex="1"
          minWidth="150px"
          maxWidth="xs"
          onValueChange={(details) => {
            const href = details.value[0];
            if (href) navigate(href);
          }}
          value={currentSelectValue ? [currentSelectValue] : []}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select round" />
            </Select.Trigger>

            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {roundOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Box
                      color={
                        item.value === currentSelectValue ? "fg"
                        : item.status === "Not Started" ? "fg.muted"
                        : item.status === "In Progress" ? "fg"
                        : item.status === "Complete" ? "fg.muted"
                        : ""
                      }
                    >
                      <HStack>
                        {item.parent && <Box w={2} />}
                        {item.status === "Not Started" && <></>}
                        {item.status === "In Progress" && <RiSwordLine />}
                        {item.status === "Complete" && <BiSolidMedal />}
                        {item.label}
                      </HStack>
                    </Box>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
        </Portal>
        </Select.Root>

        {/* Next Round Navigation */}
        <Button
          size="sm"
          colorPalette="blue"
          variant="outline"
          visibility={nextRoundInList ? "visible" : "hidden"}
          display={showNextRoundButton ? "inline-block" : "none"}
          onClick={() => navigate(`/tourney/${tourney?.id}/round/${nextRoundInList?.id}`)}
        >
          <IoChevronForward />
        </Button>

        {/* Add Round Trigger and Form */}
        {showAddRoundButton && (
          <RoundModal
            rounds={rounds}
            trigger={addRoundButton}
            onSubmitForm={onAdminClick}
            />
        )}
      </HStack>
    </Stack>
  );
}
