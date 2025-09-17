import {
  Heading,
  Text,
  Box,
  VStack,
  HStack,
  Image,
  Flex,
  LinkBox,
  LinkOverlay,
  Collapsible,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { getAdminTourneyIds } from "../hooks/AdminTourneyHelpers";
import { useAuth } from "../context/AuthContext";
import type { Tourney } from "../types/Tourney";
import type { Event } from "../types/Event";

// Simple chevron icons as SVG components
const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 10l5 5 5-5z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 17l5-5-5-5v10z" />
  </svg>
);

function HomePage() {
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  const { data: events, loading: loadingEvents, error: errorEvents } =
    getSupabaseTable<Event>("events");
  const { data: tourneys, loading: loading, error: error } =
    getSupabaseTable<Tourney>("tourneys");

  const { adminTourneyIds } = getAdminTourneyIds();
  const { user } = useAuth();

  if (loading) return <Text fontSize="xl">Loading...</Text>;
  if (error) return <Text fontSize="xl">Error: {error.message}</Text>;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleEventExpansion = (eventId: number) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const renderTourneyCard = (
    row: Tourney,
    keyPrefix: string,
    isNested = false
  ) => (
    <LinkBox
      as="article"
      key={`${keyPrefix}-${row.id}`}
      borderWidth="1px"
      borderRadius={isNested ? "none" : "lg"}
      borderTopWidth={isNested ? "0" : "1px"}
      p={{ base: 4, sm: 5 }}
      bg={isNested ? "gray.800" : "gray.900"}
      color="white"
      shadow={isNested ? "none" : "sm"}
      transition="all 0.2s"
      _hover={{
        shadow: isNested ? "none" : "lg",
        bg: isNested ? "gray.700" : "gray.600",
        transform: isNested ? "none" : "scale(1.02)",
        cursor: "pointer",
      }}
      w={{ base: "90%", md: "60%" }}
      mx="auto"
    >
      <LinkOverlay asChild>
        <Link to={`/tourney/${row.id}`}>
          <HStack align="center" w="100%">
            <Box
              minW={{ base: "60px", sm: "80px", md: "90px" }}
              minH={{ base: "60px", sm: "80px", md: "90px" }}
            >
              <Image
                src={row.thumbnail_img ?? "/trophy.png"}
                alt={`${row.name} image`}
                boxSize={{ base: "60px", sm: "80px", md: "90px" }}
                objectFit="cover"
                borderRadius="md"
              />
            </Box>
            <Flex
              direction="column"
              flex="1"
              justify="space-between"
              minH={{ base: "70px", sm: "90px" }}
            >
              <HStack justify="space-between" w="100%" align="start">
                <Heading
                  as="h3"
                  fontSize={{ base: "lg", sm: "xl", md: isNested ? "xl" : "3xl" }}
                >
                  {row.name}
                </Heading>
                {keyPrefix === "active" &&
                  adminTourneyIds.includes(row.id) && (
                    <Text fontSize={{ base: "md", sm: "lg" }} color="green.400">
                      (Admin)
                    </Text>
                  )}
              </HStack>
              <Box w="100%" mt={2}>
                <Text
                  fontSize={{ base: "sm", sm: "md" }}
                  color="gray.300"
                  textAlign="left"
                >
                  Dates: {formatDate(row.start_date)}
                  {row.end_date ? ` - ${formatDate(row.end_date)}` : ""}
                </Text>
              </Box>
              {/* Status Moniker Left-Aligned */}
              <Box w="100%" mt={1}>
                <Text
                  fontSize={{ base: "sm", sm: "md" }}
                  color={
                    row.status === "In Progress"
                      ? "yellow.300"
                      : row.status === "Not Started"
                      ? "blue.300"
                      : "green.400"
                  }
                  fontWeight="bold"
                  textAlign="left"
                >
                  {row.status}
                </Text>
              </Box>
              {/* Show ID for any logged-in user */}
              {user && (
                <Flex justify="flex-end" mt={2}>
                  <Text fontSize={{ base: "sm", sm: "md" }} color="gray.300">
                    ID: {row.id}
                  </Text>
                </Flex>
              )}
            </Flex>
          </HStack>
        </Link>
      </LinkOverlay>
    </LinkBox>
  );

  const renderEventCard = (event: Event, keyPrefix: string) => {
    const eventTourneys = tourneys?.filter((t) => t.event_id === event.id) || [];
    const isExpanded = expandedEvents.has(event.id);

    return (
      <Collapsible.Root
        key={`${keyPrefix}-${event.id}`}
        open={isExpanded}
        onOpenChange={() => toggleEventExpansion(event.id)}
      >
        <Box w="100%">
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderBottomRadius={
              eventTourneys.length > 0 && isExpanded ? "none" : "lg"
            }
            p={{ base: 4, sm: 5 }}
            bg="gray.900"
            color="white"
            shadow="sm"
            transition="all 0.2s"
            _hover={{
              shadow: "lg",
              bg: "gray.600",
              transform: "scale(1.02)",
            }}
            w={{ base: "90%", md: "60%" }}
            mx="auto"
            position="relative"
          >
            <HStack align="center" w="100%">
              <Box
                minW={{ base: "60px", sm: "80px", md: "90px" }}
                minH={{ base: "60px", sm: "80px", md: "90px" }}
              >
                <Image
                  src={event.thumbnail_img ?? "/trophy.png"}
                  alt={`${event.name} image`}
                  boxSize={{ base: "60px", sm: "80px", md: "90px" }}
                  objectFit="cover"
                  borderRadius="md"
                />
              </Box>
              <Flex
                direction="column"
                flex="1"
                justify="space-between"
                minH={{ base: "70px", sm: "90px" }}
              >
                <HStack justify="space-between" w="100%" align="start">
                  <Link to={`/event/${event.id}`}>
                    <Heading
                      as="h3"
                      fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                      _hover={{ textDecoration: "underline", color: "blue.300" }}
                      transition="color 0.2s"
                    >
                      {event.name}
                    </Heading>
                  </Link>
                  {eventTourneys.length > 0 && (
                    <Collapsible.Trigger asChild>
                      <IconButton
                        aria-label={isExpanded ? "Collapse event" : "Expand event"}
                        size="md"
                        variant="ghost"
                        color="white"
                        minW={{ base: "40px", sm: "44px" }}
                        h={{ base: "40px", sm: "44px" }}
                        _hover={{ bg: "gray.700", transform: "scale(1.1)" }}
                        transition="all 0.2s"
                      >
                        {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      </IconButton>
                    </Collapsible.Trigger>
                  )}
                </HStack>
                <Box w="100%" mt={2}>
                  <Text
                    fontSize={{ base: "md", sm: "lg" }}
                    color="gray.300"
                    textAlign="left"
                  >
                    Dates: {formatDate(event.start_date)}
                    {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
                  </Text>
                </Box>
                <Flex justify="space-between" mt={2}>
                  <Text fontSize={{ base: "md", sm: "lg" }} color="gray.300">
                    {eventTourneys.length} tournament
                    {eventTourneys.length !== 1 ? "s" : ""}
                  </Text>
                  {user && (
                    <Text fontSize={{ base: "md", sm: "lg" }} color="gray.300">
                      ID: {event.id}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </HStack>
          </Box>

          {eventTourneys.length > 0 && (
            <Collapsible.Content>
              <VStack align="stretch" gap={0}>
                {eventTourneys.map((tourney) =>
                  renderTourneyCard(tourney, `${keyPrefix}-nested`, true)
                )}
              </VStack>
            </Collapsible.Content>
          )}
        </Box>
      </Collapsible.Root>
    );
  };

  const renderSectionHeader = (title: string) => (
    <Box display="inline-block" bg="gray.900" px={4} py={2} borderRadius="md" mb={4}>
      <Heading as="h2" fontSize="32px" textAlign="center">
        {title}
      </Heading>
    </Box>
  );

  const now = new Date();
  const upcomingEvents = events?.filter((e) => e.start_date && new Date(e.start_date) > now) || [];
  const activeEvents =
    events?.filter(
      (e) =>
        e.start_date &&
        e.end_date &&
        new Date(e.start_date) <= now &&
        new Date(e.end_date) >= now
    ) || [];
  const completedEvents =
    events?.filter((e) => e.end_date && new Date(e.end_date) < now) || [];

  return (
    <>
      {!loadingEvents && !errorEvents && upcomingEvents.length > 0 && (
        <>
          <Flex justify="center" w="100%">
            {renderSectionHeader("Upcoming Events")}
          </Flex>
          <VStack align="stretch" w="100%" mb={8} gap={6}>
            {upcomingEvents.map((event) => renderEventCard(event, "upcoming"))}
          </VStack>
        </>
      )}

      {!loadingEvents && !errorEvents && activeEvents.length > 0 && (
        <>
          <Flex justify="center" w="100%">
            {renderSectionHeader("Active Events")}
          </Flex>
          <VStack align="stretch" w="100%" mb={8} gap={6}>
            {activeEvents.map((event) => renderEventCard(event, "active"))}
          </VStack>
        </>
      )}

      {!loadingEvents && !errorEvents && completedEvents.length > 0 && (
        <>
          <Flex justify="center" w="100%">
            {renderSectionHeader("Completed Events")}
          </Flex>
          <VStack align="stretch" w="100%" mb={8} gap={6}>
            {completedEvents.map((event) => renderEventCard(event, "completed"))}
          </VStack>
        </>
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
