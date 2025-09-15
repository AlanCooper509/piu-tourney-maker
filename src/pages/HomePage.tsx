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
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import getSupabaseTable from "../hooks/getSupabaseTable";
import { getAdminTourneyIds } from "../hooks/AdminTourneyHelpers";
import handleAddNewTourney from "../handlers/handleAddNewTourney";
import { useAuth } from "../context/AuthContext";

import type { Tourney } from "../types/Tourney";
import type { Event } from "../types/Event";

function HomePage() {
  const {
    data: events,
    loading: loadingEvents,
    error: errorEvents,
  } = getSupabaseTable<Event>("events");

  const {
    data: tourneys,
    loading: loading,
    error: error,
  } = getSupabaseTable<Tourney>("tourneys");
  const { adminTourneyIds, loading: adminLoading } = getAdminTourneyIds();
  const { user } = useAuth();

  if (loading) return <Text fontSize="xl">Loading...</Text>;
  if (error) return <Text fontSize="xl">Error: {error.message}</Text>;

  tourneys.sort((a, b) => a.id - b.id);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderTourneyCard = (row: Tourney | Event, keyPrefix: string) => (
    <LinkBox
      as="article"
      key={`${keyPrefix}-${row.id}`}
      borderWidth="1px"
      borderRadius="lg"
      p={{ base: 4, sm: 5 }}
      bg="gray.900"
      color="white"
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        shadow: "lg",
        bg: "gray.600",
        transform: "scale(1.02)",
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
                  fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                >
                  {row.name}
                </Heading>

                {/* Show admin badge only if user is an admin */}
                {keyPrefix === "active" &&
                  !adminLoading &&
                  adminTourneyIds.includes(row.id) && (
                    <Text fontSize={{ base: "md", sm: "lg" }} color="green.400">
                      (Admin)
                    </Text>
                  )}
              </HStack>

              <Box w="100%" mt={2}>
                <Text
                  fontSize={{ base: "md", sm: "lg" }}
                  color="gray.300"
                  textAlign="left"
                >
                  Dates: {formatDate(row.start_date)}
                  {row.end_date ? ` - ${formatDate(row.end_date)}` : ""}
                </Text>
              </Box>

              <Flex justify="flex-end" mt={2}>
                <Text fontSize={{ base: "md", sm: "lg" }} color="gray.300">
                  ID: {row.id}
                </Text>
              </Flex>
            </Flex>
          </HStack>
        </Link>
      </LinkOverlay>
    </LinkBox>
  );

  const renderAddTourneyCard = () => (
    <Flex
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="gray.400"
      borderRadius="lg"
      p={{ base: 4, sm: 5 }}
      minH={{ base: "110px", sm: "130px" }}
      shadow="sm"
      bg="gray.900"
      color="white"
      transition="all 0.2s"
      _hover={{
        shadow: "md",
        bg: "gray.600",
        transform: "scale(1.02)",
        cursor: "pointer",
      }}
      align="center"
      justify="center"
      w={{ base: "90%", md: "60%" }}
      mx="auto"
      onClick={() => {
        handleAddNewTourney(crypto.randomUUID(), "2025-08-24", "2025-08-26");
      }}
    >
      <Text fontSize={{ base: "3xl", sm: "4xl" }} color="gray.400">
        +
      </Text>
    </Flex>
  );

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

  // --- Filtering logic ---
  const activeTourneys = tourneys.filter((t) => {
    return (
      (t.status === "Not Started" || t.status === "In Progress") &&
      new Date(t.end_date) >= new Date()
    );
  });

  const archivedTourneys = tourneys.filter((t) => {
    return t.status === "Complete" || new Date(t.end_date) < new Date();
  });

  return (
    <>
      {/* My Tourneys section hidden */}
      {false && (
        <>
          <Flex justify="center" w="100%">
            {renderSectionHeader("My Tourneys")}
          </Flex>
          <VStack align="stretch" w="100%" maxW="100%" mb={8}>
            {tourneys.map((row) => renderTourneyCard(row, "my"))}
            {!adminLoading &&
              adminTourneyIds.length > 0 &&
              renderAddTourneyCard()}
          </VStack>
        </>
      )}

      {/* Events */}
      {user && !loadingEvents && !errorEvents && (
        <>
          <Flex justify="center" w="100%">
            {renderSectionHeader("Events")}
          </Flex>
          <VStack align="stretch" w="100%" mb={8}>
            {events.map((row) => renderTourneyCard(row, "active"))}
          </VStack>
        </>
      )}

      {/* Active Tourneys */}
      <Flex justify="center" w="100%">
        {renderSectionHeader("Active Tourneys")}
      </Flex>
      <VStack align="stretch" w="100%" mb={8}>
        {activeTourneys.map((row) => renderTourneyCard(row, "active"))}

        {/* Add Tourney card only if user is logged in ('user' exists) */}
        {/* Temporary: ALSO ensure they are already is assigned manually as a tourney admin somewhere*/}
        {/* - for BITE8 timeline; just to prevent any potential spammers for now */}
        {!adminLoading &&
          adminTourneyIds &&
          adminTourneyIds.length > 0 &&
          user &&
          renderAddTourneyCard()}
      </VStack>

      {/* Archived Tourneys */}
      <Flex justify="center" w="100%">
        {renderSectionHeader("Completed Tourneys")}
      </Flex>
      <VStack align="stretch" w="100%">
        {archivedTourneys.map((row) => renderTourneyCard(row, "archived"))}
      </VStack>
    </>
  );
}

export default HomePage;
