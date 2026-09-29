import { Box, Heading, Text, VStack, HStack, Flex, Collapsible } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { IoChevronForward } from "react-icons/io5";

import type { ReactNode } from "react";

import type { Event } from "../../types/Event";
import type { Tourney } from "../../types/Tourney";
import type { Game } from "../../types/Game";

import TourneyCard from "../ui/TourneyCard";
import CreateTourneyButton from "./CreateTourneyButton/CreateTourneyButton";

function GameGroup({ gameName, count, children }: { gameName: string; count: number; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
      <Collapsible.Trigger asChild>
        <HStack justify="center" cursor="pointer" mb={4}>
          <IoChevronForward
            style={{
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
          <Heading size="xl">{gameName}</Heading>
          <Text color="fg.muted">({count})</Text>
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {/* padding rather than margin, so it's part of the height the collapse animates */}
        <VStack gap={4} align="stretch" pb={8}>
          {children}
        </VStack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

interface EventTourneysListProps {
  event: Event;
  tourneys: Tourney[];
  setTourneys: React.Dispatch<React.SetStateAction<Tourney[]>>;
  loading: boolean;
  error: Error | null;
  gameData: Game[] | null;
  isEventAdmin: boolean;
  adminTourneyIds: number[]; // tourneys the viewer administers, directly or as an event admin
  organizerNamesByTourney: Map<number, string[]>;
}

export default function EventTourneysList({
  event,
  tourneys,
  setTourneys,
  loading,
  error,
  gameData,
  isEventAdmin,
  adminTourneyIds,
  organizerNamesByTourney,
}: EventTourneysListProps) {
  // groups appear in the order of their earliest tourney, since tourneys are already sorted by start date
  const tourneysByGame = useMemo(() => {
    const groups = new Map<number, Tourney[]>();
    for (const tourney of tourneys) {
      const group = groups.get(tourney.game_id) ?? [];
      group.push(tourney);
      groups.set(tourney.game_id, group);
    }
    return [...groups].map(([gameId, gameTourneys]) => ({
      gameId,
      gameName: gameData?.find((g) => g.id === gameId)?.name ?? "Other",
      gameTourneys,
    }));
  }, [tourneys, gameData]);

  return (
    <>
      <Box maxW={{ base: "100%", md: "60%" }} mx="auto" w="100%">
        <Flex
          justify={isEventAdmin ? "space-between" : "center"}
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

          {isEventAdmin && (
            <CreateTourneyButton
              eventId={event.id}
              setTourneys={setTourneys}
              gameData={gameData}
            />
          )}
        </Flex>
      </Box>

      {loading && <Text>Loading tourneys...</Text>}
      {error && <Text color="red.400">Error loading tournaments.</Text>}

      {!loading && tourneys.length === 0 && (
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

      <VStack gap={0} align="stretch">
        {tourneysByGame.map(({ gameId, gameName, gameTourneys }) => {
          const cards = gameTourneys.map((tourney) => (
            <TourneyCard
              key={`event-page-${tourney.id}`}
              row={tourney}
              event={event}
              keyPrefix="event-page"
              isNested={false}
              adminTourneyIds={adminTourneyIds}
              organizerNames={
                adminTourneyIds.includes(tourney.id) ? organizerNamesByTourney.get(tourney.id) ?? [] : undefined
              }
            />
          ));

          // a single game needs no grouping, so it renders as the plain list
          return tourneysByGame.length > 1 ? (
            <GameGroup key={`event-page-game-${gameId}`} gameName={gameName} count={gameTourneys.length}>
              {cards}
            </GameGroup>
          ) : (
            <VStack key={`event-page-game-${gameId}`} gap={4} align="stretch">
              {cards}
            </VStack>
          );
        })}
      </VStack>
    </>
  );
}
