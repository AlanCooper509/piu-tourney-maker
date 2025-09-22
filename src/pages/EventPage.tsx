import { useParams } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { VStack, HStack, Box, Image, Text } from "@chakra-ui/react";

import type { Event } from "../types/Event";
import getSupabaseTable from "../hooks/getSupabaseTable";

function EventPage() {
  // get eventId from url path
  const { eventId } = useParams();
  console.log(eventId);

  // get event details from eventId
  const {
    data: event,
    loading,
    error,
  } = getSupabaseTable<Event>("events", {
    column: "id",
    value: eventId,
  });
  console.log(event);

  // get array check
  if (loading) return <Text fontSize="xl">Loading...</Text>;
  if (error) return <Text fontSize="xl">Error: {error.message}</Text>;

  // if eventId is INVALID
  if (event.length == 0) {
    return (
      <Text fontSize="xl">No Event found w/ associated eventId: {eventId}</Text>
    );
  }

  return (
    <Box
      bgImage={`url(${event[0].hero_img})`}
      bgPos="center"
      bgRepeat="no-repeat"
      bgSize="cover"
      minH={"1000px"}
      display="flex"
      justifyContent={"center"}
    >
      <Box w={{ base: "50px", sm: "70px", lg: "100px" }}>
        <IoMdCalendar size="100%" />
      </Box>
    </Box>
  );
}

export default EventPage;
