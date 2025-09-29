import { VStack, Flex, Box, Heading, Text } from "@chakra-ui/react";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { getAdminTourneyIds } from "../hooks/AdminTourneyHelpers";
import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";
import EventCard from "../components/ui/EventCard";

function HomePage() {
  const { data: events, loading, error } = getSupabaseTable<Event>("events");
  const { data: tourneys } = getSupabaseTable<Tourney>("tourneys");
  const { adminTourneyIds } = getAdminTourneyIds();

  if (loading) return <Text fontSize="xl">Loading...</Text>;
  if (error) return <Text fontSize="xl">Error: {error.message}</Text>;

  const renderSectionHeader = (title: string) => (
    <Box
      display="inline-block"
      bg="gray.900"
      px={4}
      py={2}
      borderRadius="md"
      mb={4}
    >
      <Heading as="h2" fontSize="32px" textAlign="center">
        {title}
      </Heading>
    </Box>
  );

  const now = new Date();
  const filteredEvents = {
    upcoming:
      events?.filter((e) => e.start_date && new Date(e.start_date) > now) || [],
    active:
      events?.filter(
        (e) =>
          e.start_date &&
          e.end_date &&
          new Date(e.start_date) <= now &&
          new Date(e.end_date) >= now
      ) || [],
    completed:
      events?.filter((e) => e.end_date && new Date(e.end_date) < now) || [],
  };

  const eventTourneyMap: Map<number, Tourney[]> = new Map();
  for (const tourney of tourneys) {
    if (!tourney.event_id) {
      console.warn(`Tourney with ID ${tourney.id} has no associated event_id.`);
    } else {
      if (!eventTourneyMap.has(tourney.event_id)) {
        eventTourneyMap.set(tourney.event_id, []);
      }
      eventTourneyMap.get(tourney.event_id)?.push(tourney);
    }
  }

  return (
    <>
      ~To Include: Spotlight tourney~
      {/* Sort by : ACTIVE EVENTS > UPCOMING EVENTS > COMPLETED EVENTS
          Each Spotlight Tourney will contain basic info for the event, tourney status, AND a see more btn at the bottom
       */}
      {console.log(filteredEvents)}
      {/* filteredEvents returns 3 arrays,
        active
        completed 
        and upcoming

      first, so into the active tourney event, upcoming event, and completed event 

      then, create carosel (look at rounds)
      */}
      {Object.entries(filteredEvents).map(([section, eventList]) =>
        eventList.length > 0 ? (
          <VStack key={section} align="stretch" w="100%" mb={8} gap={6}>
            <Flex justify="center" w="100%">
              {renderSectionHeader(
                `${section.charAt(0).toUpperCase() + section.slice(1)} Events`
              )}
            </Flex>
            {eventList.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tourneys={eventTourneyMap.get(event.id) || []}
                adminTourneyIds={adminTourneyIds}
              />
            ))}
          </VStack>
        ) : null
      )}
    </>
  );
}

export default HomePage;
