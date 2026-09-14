import { useParams } from "react-router-dom";
import { Box, Heading, Text, VStack, Container, Spinner, Center, Flex } from "@chakra-ui/react";
import { useEffect } from "react";

import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";
import type { Game } from "../types/Game";

import { Toaster } from "../components/ui/toaster";
import getSupabaseTable from "../hooks/getSupabaseTable";
import TourneyCard from "../components/ui/TourneyCard";
import { SpotlightEventItem } from "../components/home/SpotlightEventItem";
import CreateTourneyButton from "../components/event/CreateTourneyButton/CreateTourneyButton";
import { useIsAdminForEvent } from "../context/admin/AdminEventContext";
import { useCurrentEvent } from "../context/CurrentEventContext";

function EventPage() {
  const { eventId } = useParams();
  const { isEventAdmin, loadingEventAdminStatus } = useIsAdminForEvent(Number(eventId));
  const { event, tourneys, setEvent, setTourneys } = useCurrentEvent();

  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
  } = getSupabaseTable<Event>("events", { column: "id", value: eventId });

  const {
    data: tourneysData,
    loading: tourneysLoading,
    error: tourneysError,
  } = getSupabaseTable<Tourney>("tourneys", { column: "event_id", value: eventId });

  const { data: queriedGameData } = getSupabaseTable<Game>("games");

  useEffect(() => {
    if (eventData && eventData.length > 0) {
      setEvent(eventData[0]);
    } else {
      setEvent(null);
    }
  }, [eventData, setEvent]);

  useEffect(() => {
    if (tourneysData) {
      const sorted = [...tourneysData].sort((a, b) => 
        a.start_date.localeCompare(b.start_date)
      );
      setTourneys(sorted);
    } else {
      setTourneys([]);
    }
  }, [tourneysData, setTourneys]);

  if (eventLoading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="teal.500" />
        <Text ml={4}>Loading Event...</Text>
      </Center>
    );
  }

  if (eventError || !event) {
    return (
      <Center h="60vh">
        <Text fontSize="xl" color="red.400">Event not found.</Text>
      </Center>
    );
  }

  return (
    <Box>
      <Toaster />

      {/* SECTION 1: HERO */}
      <SpotlightEventItem event={event} showButton={false} />

      {/* SECTION 2: TOURNAMENTS LIST */}
      <Container maxW="container.lg" mt={12} pb={20}>
        <VStack gap={8} align="stretch">
          <Box maxW={{ base: "100%", md: "60%" }} mx="auto" w="100%">
            <Flex
              justify={!loadingEventAdminStatus && isEventAdmin ? "space-between" : "center"}
              align="center"
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <Heading
                fontWeight="bold"
                fontSize={{ base: "32px", md: "40px" }}
                textAlign={{ base: "center", sm: "left" }}
              >
                Tournaments
              </Heading>

              {!loadingEventAdminStatus && isEventAdmin && (
                <CreateTourneyButton
                  eventId={event.id}
                  setTourneys={setTourneys}
                  gameData={queriedGameData ?? null}
                />
              )}
            </Flex>
          </Box>

          {tourneysLoading && <Text>Loading tourneys...</Text>}
          {tourneysError && <Text color="red.400">Error loading tournaments.</Text>}

          {!tourneysLoading && tourneys.length === 0 && (
            <Box
              p={10}
              textAlign="center"
              bg="gray.900"
              borderRadius="xl"
              border="1px dashed"
              borderColor="gray.600"
            >
              <Text color="gray.400">No tournaments scheduled for this event yet.</Text>
            </Box>
          )}

          <VStack gap={4} align="stretch">
            {tourneys.map((tourney) => (
              <TourneyCard
                key={`event-page-${tourney.id}`}
                row={tourney}
                event={event}
                keyPrefix="event-page"
                isNested={false}
                adminTourneyIds={isEventAdmin ? [tourney.id] : []}
              />
            ))}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default EventPage;