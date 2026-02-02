import { Box, Heading, Flex, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import EventCard from "..//ui/EventCard";
import type { Event } from "../../types/Event";
import type { Tourney } from "../../types/Tourney";

const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);
const MotionFlex = motion.create(Flex);

const fadeIn = {
  hidden: { opacity: 0, y: 33 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

interface EventSectionProps {
  title: string;
  events: Event[];
  eventTourneyMap: Map<number, Tourney[]>;
  adminTourneyIds: number[];
}

export function EventSection({ title, events, eventTourneyMap, adminTourneyIds }: EventSectionProps) {
  if (events.length === 0) return null;

  return (
    <MotionVStack align="stretch" w="100%" mb={8} gap={6} variants={fadeIn}>
      <MotionFlex justify="center" w="100%" variants={fadeIn}>
        <Box display="inline-block" bg="gray.900" px={4} py={2} borderRadius="md" mb={4}>
          <Heading as="h2" fontSize="32px" textAlign="center">
            {title}
          </Heading>
        </Box>
      </MotionFlex>

      {events.map((event) => {
        const tourneysForEvent = [...(eventTourneyMap.get(event.id) || [])].sort((a, b) =>
          a.start_date.localeCompare(b.start_date)
        );

        return (
          <MotionBox key={event.id} variants={fadeIn}>
            <EventCard
              event={event}
              tourneys={tourneysForEvent}
              adminTourneyIds={adminTourneyIds}
            />
          </MotionBox>
        );
      })}
    </MotionVStack>
  );
}