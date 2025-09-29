import { Box, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { IoMdCalendar } from "react-icons/io";
import { CiLocationOn } from "react-icons/ci";

import type { Event } from "../../types/Event";

interface EventOverviewProps {
  event: Event;
}

export default function EventOverview({ event }: EventOverviewProps) {
  return (
    <>
      {/* Section 1: Hero IMG with Event Name */}
      <Box
        bgImage={`url(${event.hero_img})`}
        bgPos="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        minH={"400px"}
        width="100%"
        display={{ base: "flex", lg: "none" }}
        justifyContent={"center"}
        overflow="hidden"
        position="relative"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.700"
        />

        <Heading
          as="h2"
          fontSize={{ base: "32px", md: "48px" }}
          fontWeight="bold"
          textAlign="center"
          mt="160px"
          zIndex="1"
          p={4}
        >
          {event.name}
        </Heading>
      </Box>

      {/* Section 2: Basic Info (default below image for small screens) */}
      <Flex
        justify="center"
        align="center"
        mt="50px"
        display={{ base: "flex", lg: "none" }}
      >
        <VStack align="start" p={2}>
          {/* Date row */}
          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={IoMdCalendar} boxSize={["25px", "30px", "40px"]} />
            </Box>
            <Text fontSize="18px" fontWeight="bold">
              {formatDate(event.start_date)}
              {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
            </Text>
          </HStack>

          {/* Location row */}
          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={CiLocationOn} boxSize={["25px", "30px", "40px"]} />
            </Box>
            <Text fontSize="18px" fontWeight="bold">
              {event.location}
            </Text>
          </HStack>

          <Text fontSize="16px" maxW="400px" textAlign="left" mt="20px">
            {event.description}
          </Text>
        </VStack>
      </Flex>

      {/* Combined Section 1+2 layout for large screens */}
      <Flex
        direction="row"
        align="center"
        justify="center"
        minH="400px"
        width="100%"
        position="relative"
        bgImage={`url(${event.hero_img})`}
        bgPos="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        overflow="hidden"
        display={{ base: "none", lg: "flex" }}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.700"
        />

        <Heading
          as="h2"
          fontSize="48px"
          fontWeight="bold"
          textAlign="left"
          zIndex="1"
          p={4}
          flexShrink={0}
        >
          {event.name}
        </Heading>

        <VStack align="start" gap={4} zIndex="1" p={4} maxW="400px">
          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={IoMdCalendar} boxSize="40px" />
            </Box>
            <Text fontSize="18px" fontWeight="bold">
              {formatDate(event.start_date)}
              {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
            </Text>
          </HStack>

          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={CiLocationOn} boxSize="40px" />
            </Box>
            <Text fontSize="18px" textAlign="left" fontWeight="bold">
              {event.location}
            </Text>
          </HStack>

          <Text fontSize="16px" textAlign="left" mt="20px">
            {event.description}
          </Text>
        </VStack>
      </Flex>
    </>
  );
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};