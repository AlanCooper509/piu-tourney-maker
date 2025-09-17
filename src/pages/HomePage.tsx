import { VStack, Flex, Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { useAuth } from "../context/AuthContext";
import { getAdminTourneyIds } from "../hooks/AdminTourneyHelpers";
import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";
import EventCard from "../components/ui/EventCard";

function HomePage() {
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const { data: events, loading, error } = getSupabaseTable<Event>("events");
  const { data: tourneys } = getSupabaseTable<Tourney>("tourneys");
  const { user } = useAuth();
  const { adminTourneyIds } = getAdminTourneyIds();

  if (loading) return <Text fontSize="xl">Loading...</Text>;
  if (error) return <Text fontSize="xl">Error: {error.message}</Text>;

  const toggleEventExpansion = (eventId: number) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      newSet.has(eventId) ? newSet.delete(eventId) : newSet.add(eventId);
      return newSet;
    });
  };

  const renderSectionHeader = (title: string) => (
    <Box display="inline-block" bg="gray.900" px={4} py={2} borderRadius="md" mb={4}>
      <Heading as="h2" fontSize="32px" textAlign="center">
        {title}
      </Heading>
    </Box>
  );

  const now = new Date();
  const filteredEvents = {
    upcoming: events?.filter((e) => e.start_date && new Date(e.start_date) > now) || [],
    active: events?.filter(
      (e) =>
        e.start_date &&
        e.end_date &&
        new Date(e.start_date) <= now &&
        new Date(e.end_date) >= now
    ) || [],
    completed: events?.filter((e) => e.end_date && new Date(e.end_date) < now) || [],
  };

  return (
    <>
      {Object.entries(filteredEvents).map(([section, eventList]) =>
        eventList.length > 0 ? (
          <VStack key={section} align="stretch" w="100%" mb={8} gap={6}>
            <Flex justify="center" w="100%">
              {renderSectionHeader(`${section.charAt(0).toUpperCase() + section.slice(1)} Events`)}
            </Flex>
            {eventList.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tourneys={tourneys ?? []}
                expanded={expandedEvents.has(event.id)}
                toggleExpanded={toggleEventExpansion}
                adminTourneyIds={adminTourneyIds}
                userId={user?.id ?? null}
              />
            ))}
          </VStack>
        ) : null
      )}

      {/* Sticky Login Button */}
      <Box position="fixed" bottom="4" right="4" zIndex="1000">
        <Link to="/login">
          <Button size="sm" colorScheme="blue" borderRadius="full">
            Login
          </Button>
        </Link>
      </Box>
    </>
  );
}

export default HomePage;
