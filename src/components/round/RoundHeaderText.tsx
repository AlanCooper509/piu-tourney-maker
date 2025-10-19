import { Box, Flex, Heading, Link, Stack, Text, useBreakpointValue } from "@chakra-ui/react";

import { useCurrentTourney } from "../../context/CurrentTourneyContext";

interface RoundHeaderTextProps {
  roundName: string;
}

export default function RoundHeaderText({ roundName }: RoundHeaderTextProps) {
  const { tourney } = useCurrentTourney();
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isMobile) {
    return (
      <Stack
        align="center"
        justify="center"
        direction="column"
        gap={2}
      >
        <Heading fontSize={["3xl", "3xl", "3xl", "4xl"]}>
          <Link
            href={`/tourney/${tourney?.id}`}
            color="cyan.solid"
            variant="underline"
            _hover={{ color: 'cyan.focusRing' }}
            _focus={{ color: 'cyan.solid', boxShadow: 'none' }}
          >
            {tourney?.name}
          </Link>
        </Heading>
        <Heading fontSize="2xl">
          <Text as="span">{roundName}</Text>
        </Heading>
      </Stack>
    );
  }

  return (
    <Flex
      align="baseline"
      justify="center"
      width="100%"
      maxWidth="container.lg"
      mx="auto"
    >
      {/* Left */}
      <Flex flex="1" justify="flex-end" pr={3}>
        <Heading fontSize={["3xl", "3xl", "3xl", "4xl"]} textAlign="right">
          <Link
            href={`/tourney/${tourney?.id}`}
            color="cyan.solid"
            variant="underline"
            _hover={{ color: 'cyan.focusRing' }}
            _focus={{ color: 'cyan.solid', boxShadow: 'none' }}
          >
            {tourney?.name}
          </Link>
        </Heading>
      </Flex>

      {/* Separator */}
      <Box px={3}>
        <Heading fontSize={["3xl", "3xl", "3xl", "4xl"]} textAlign="center">
          |
        </Heading>
      </Box>

      {/* Right */}
      <Flex flex="1" justify="flex-start" pl={3}>
        <Heading fontSize={["2xl", "2xl", "2xl", "3xl"]} textAlign="left">
          <Text as="span">{roundName}</Text>
        </Heading>
      </Flex>
    </Flex>
  );
}