import {
  Box,
  createListCollection,
  Heading,
  HStack,
  Link,
  Portal,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BiSolidMedal } from "react-icons/bi";
import { RiSwordLine } from "react-icons/ri";

import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import type { Round } from "../../../types/Round";

interface TourneyHeaderTextProps {
  rounds: Round[],
  currentRoundId: Number
}

export default function TourneyHeaderText({ rounds, currentRoundId }: TourneyHeaderTextProps) {
  const navigate = useNavigate();
  const { tourney } = useCurrentTourney();
  const roundOptions = createListCollection({
    items: rounds.sort((r1, r2) => r1.id - r2.id).map((round) => ({
      label: round.name,
      value: `/tourney/${tourney?.id}/round/${round.id}`,
      parent: round.parent_round_id,
      status: round.status
    }))
  });

  const currentValue = currentRoundId
    ? `/tourney/${tourney?.id}/round/${currentRoundId}`
    : undefined;

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
      <HStack>
        <Text>
          Round:
        </Text>
        <Select.Root
          collection={roundOptions}
          size="sm"
          width="280px"
          onValueChange={(details) => {
            const href = details.value[0];
            if (href) navigate(href);
          }}
          value={currentValue ? [currentValue] : []}
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
                        item.value === currentValue ? "fg" :
                        item.status === "Complete" ? "fg.muted" : 
                        item.status === "In Progress" ? "fg" :
                        item.status === "Not Started" ? "fg.muted" : ""
                      }
                    >
                      <HStack>
                        {item.parent && <Box w={2} />}
                        {item.status === "Complete" && <BiSolidMedal />}
                        {item.status === "In Progress" && <RiSwordLine />}
                        {item.status === "Not Started" && <></>}
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
      </HStack>
    </Stack>
  );
}
