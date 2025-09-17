import {
  Box,
  VStack,
  HStack,
  Flex,
  Image,
  Heading,
  Text,
  IconButton,
  Collapsible,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { Event } from "../../types/Event";
import type { Tourney } from "../../types/Tourney";
import TourneyCard from "./TourneyCard";

// Simple chevron icons
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

interface EventCardProps {
  event: Event;
  tourneys: Tourney[];
  expanded: boolean;
  toggleExpanded: (id: number) => void;
  adminTourneyIds: number[];
  userId?: string | null;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  tourneys,
  expanded,
  toggleExpanded,
  adminTourneyIds,
  userId,
}) => {
  const eventTourneys = tourneys.filter((t) => t.event_id === event.id);

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
    <Collapsible.Root open={expanded} onOpenChange={() => toggleExpanded(event.id)}>
      <Box w="100%">
        <Box
          borderWidth="1px"
          borderRadius="lg"
          borderBottomRadius={eventTourneys.length > 0 && expanded ? "none" : "lg"}
          p={{ base: 4, sm: 5 }}
          bg="gray.900"
          color="white"
          shadow="sm"
          transition="all 0.2s"
          _hover={{ shadow: "lg", bg: "gray.600", transform: "scale(1.02)" }}
          w={{ base: "90%", md: "60%" }}
          mx="auto"
          position="relative"
        >
          <HStack align="center" w="100%">
            <Box minW={{ base: "60px", sm: "80px", md: "90px" }} minH={{ base: "60px", sm: "80px", md: "90px" }}>
              <Image
                src={event.thumbnail_img ?? "/trophy.png"}
                alt={`${event.name} image`}
                boxSize={{ base: "60px", sm: "80px", md: "90px" }}
                objectFit="cover"
                borderRadius="md"
              />
            </Box>
            <Flex direction="column" flex="1" justify="space-between" minH={{ base: "70px", sm: "90px" }}>
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
                      aria-label={expanded ? "Collapse event" : "Expand event"}
                      size="md"
                      variant="ghost"
                      color="white"
                      minW={{ base: "40px", sm: "44px" }}
                      h={{ base: "40px", sm: "44px" }}
                      _hover={{ bg: "gray.700", transform: "scale(1.1)" }}
                      transition="all 0.2s"
                    >
                      {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </IconButton>
                  </Collapsible.Trigger>
                )}
              </HStack>
              <Box w="100%" mt={2}>
                <Text fontSize={{ base: "md", sm: "lg" }} color="gray.300" textAlign="left">
                  Dates: {formatDate(event.start_date)}
                  {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
                </Text>
              </Box>
              <Flex justify="space-between" mt={2}>
                <Text fontSize={{ base: "md", sm: "lg" }} color="gray.300">
                  {eventTourneys.length} tournament{eventTourneys.length !== 1 ? "s" : ""}
                </Text>
                {userId && (
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
              {eventTourneys.map((tourney) => (
                <TourneyCard
                  key={`nested-${tourney.id}`}
                  row={tourney}
                  keyPrefix="nested"
                  isNested
                  adminTourneyIds={adminTourneyIds}
                  userId={userId}
                />
              ))}
            </VStack>
          </Collapsible.Content>
        )}
      </Box>
    </Collapsible.Root>
  );
};

export default EventCard;
