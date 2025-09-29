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
import { useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

import TourneyCard from "./TourneyCard";

import type { Event } from "../../types/Event";
import type { Tourney } from "../../types/Tourney";

interface EventCardProps {
  event: Event;
  tourneys: Tourney[];
  adminTourneyIds: number[];
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  tourneys,
  adminTourneyIds,
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

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
    <Collapsible.Root open={expanded} onOpenChange={toggleExpanded}>
      <Box w="100%">
        <Collapsible.Trigger cursor="pointer" asChild onClick={() => {
          if (tourneys.length === 0) {
            window.location.href = `/event/${event.id}`;
          }
        }}>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          borderBottomRadius={tourneys.length > 0 && expanded ? "none" : "lg"}
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
            {/* Event Thumbnail Image */}
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
                {/* Event Name with Link to Event Page */}
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
              </HStack>
              <Box w="100%" mt={2}>
                {/* Dates of Event */}
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
                {/* Count of Tournaments */}
                <Text fontSize={{ base: "md", sm: "lg" }} color="gray.300">
                  {tourneys.length} tournament{tourneys.length !== 1 ? "s" : ""}
                </Text>
              </Flex>
            </Flex>

            {/* Button to Expand Collapsible */}
            {tourneys.length > 0 && (
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
                <IoChevronForward
                  style={{
                    transform: expanded ? "rotate(90deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </IconButton>
            )}
          </HStack>
        </Box>
        </Collapsible.Trigger>
        {/* Collapsible Content with List of Tournaments */}
        {tourneys.length > 0 && (
          <Collapsible.Content>
            <VStack align="stretch" gap={0}>
              {tourneys.map((tourney) => (
                <TourneyCard
                  key={`nested-${tourney.id}`}
                  row={tourney}
                  keyPrefix="nested"
                  isNested
                  adminTourneyIds={adminTourneyIds}
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
