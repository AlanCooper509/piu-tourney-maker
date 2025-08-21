import { Box, Flex, Heading, Link, Stack, Text, useBreakpointValue } from "@chakra-ui/react";

interface RoundHeaderTextProps {
  tourneyName: string;
  tourneyId: number;
  roundName: string;
}

export default function RoundHeaderText({ tourneyName, tourneyId, roundName }: RoundHeaderTextProps) {
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
            href={`/tourney/${tourneyId}`}
            color="cyan.solid"
            variant="underline"
            _hover={{ color: 'cyan.focusRing' }}
            _focus={{ color: 'cyan.solid', boxShadow: 'none' }}
          >
            {tourneyName}
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
            href={`/tourney/${tourneyId}`}
            color="cyan.solid"
            variant="underline"
            _hover={{ color: 'cyan.focusRing' }}
            _focus={{ color: 'cyan.solid', boxShadow: 'none' }}
          >
            {tourneyName}
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