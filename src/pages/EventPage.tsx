import { useParams } from "react-router-dom";
import { Heading, HStack, VStack, Box, Text, Flex } from "@chakra-ui/react";
import { IoMdCalendar } from "react-icons/io";
import { CiLocationOn } from "react-icons/ci";

import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";

import getSupabaseTable from "../hooks/getSupabaseTable";
import TourneyCard from "../components/ui/TourneyCard";

function EventPage() {
  // get eventId from url path
  const { eventId } = useParams();
  console.log(eventId);

  // get event details from eventId
  const {
    data: event,
    loading: event_loading,
    error: event_error,
  } = getSupabaseTable<Event>("events", {
    column: "id",
    value: eventId,
  });

  // get tourneys to render @ section 3
  const {
    data: tourneys,
    loading: tourneys_loading,
    error: tourneys_error,
  } = getSupabaseTable<Tourney>("tourneys", {
    column: "event_id",
    value: eventId,
  });

  console.log(tourneys);

  console.log(event);

  // get array check
  if (event_loading) return <Text fontSize="xl">Loading...</Text>;
  if (event_error)
    return <Text fontSize="xl">Error: {event_error.message}</Text>;

  // if eventId is INVALID
  if (event.length == 0) {
    return (
      <Text fontSize="xl">No Event found w/ associated eventId: {eventId}</Text>
    );
  }

  // Copied date format
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    // Section 1: Hero IMG
    <>
      <Box
        bgImage={`url(${event[0].hero_img})`}
        bgPos="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        minH={"400px"}
        width="100%"
        display="flex"
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
          bg="blackAlpha.700" // Adjust opacity with blackAlpha.X, e.g., .600 for 60% opacity
        />

        <Heading
          as="h2"
          fontSize={["48px", "52px", "56px"]}
          fontWeight="bold"
          textAlign="center"
          mt="160px"
          zIndex="1"
          p={4}
        >
          {event[0].name}
        </Heading>
      </Box>
      {/* // Section 2: Basic Info */}
      <Flex
        justify="center" // horizontal center
        align="center" // vertical center
        mt="50px"
      >
        <VStack align="start" p={2}>
          {/* Date row */}
          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={IoMdCalendar} boxSize={["22px", "26px", "30px"]} />
            </Box>
            <Text
              fontSize={["14px", "18px", "22px"]}
              fontWeight="bold"
              textAlign="left"
            >
              {formatDate(event[0].start_date)}
              {event[0].end_date ? ` - ${formatDate(event[0].end_date)}` : ""}
            </Text>
          </HStack>

          {/* Location row */}
          <HStack align="center" mt="50px">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={CiLocationOn} boxSize={["22px", "26px", "30px"]} />
            </Box>
            <Text
              fontSize={["14px", "18px", "22px"]}
              fontWeight="bold"
              textAlign="left"
            >
              {event[0].location}
            </Text>
          </HStack>

          {/* Quick Description */}
          <Text fontSize="16px" maxW="600px" textAlign="left" mt="50px">
            {event[0].description}
          </Text>
        </VStack>
      </Flex>

      {/* Section 3: Associated Tourneys */}
      <Text fontSize="30px" fontWeight="bold" mt="50px" mb="50px">
        Tourneys
      </Text>

      {/* Check if associated event has <= 1 tourneys */}
      {tourneys_loading && <Text>Loading tourneys...</Text>}
      {tourneys_error && (
        <Text color="red">Error: {tourneys_error.message}</Text>
      )}

      {/* Render Tourney Cards */}
      {!tourneys_loading &&
        !tourneys_error &&
        tourneys.map((tourney) => (
          <TourneyCard
            key={`nested-${tourney.id}`}
            row={tourney}
            keyPrefix="nested"
            isNested={false}
            adminTourneyIds={[]}
          />
        ))}
    </>
  );
}

export default EventPage;

{
  /* Spotlight Code
      <HStack>
        <h1> Title </h1>
        <VStack>
          <Box> Info 1</Box>
          <Box> Info 2</Box>
        </VStack>
      </HStack> */
}
