// Jaenotes:
// Used
//  npm install swiper in order to create the slideshow for spotlight tourneys
//  npm install framer-motion the create a more impactful first impression on load

import {
  VStack,
  Flex,
  Box,
  Heading,
  Text,
  HStack,
  Button,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { getAdminTourneyIds } from "../hooks/AdminTourneyHelpers";
import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";
import EventCard from "../components/ui/EventCard";

// jaekim: Installed a swiper for "Spotlight Tourneys" Function
// to install: use 'npm install swiper'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import modules from swiper/modules
import { Autoplay, Navigation } from "swiper/modules";
import { Pagination } from "swiper/modules";
import { IoMdCalendar } from "react-icons/io";
import { CiLocationOn } from "react-icons/ci";

import { motion } from "framer-motion";

// Wrap Chakra components with motion
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);

const fadeIn = {
  hidden: { opacity: 0, y: 33 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

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
      events?.filter((e) => e.end_date && new Date(e.end_date) < now).sort((a, b) => {
        // Sort by start_date descending
        const aDate = new Date(a.start_date);
        const bDate = new Date(b.start_date);
        return bDate.getTime() - aDate.getTime();
      }) || [],
  };

  // optional utility
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const allEvents = [
    ...(filteredEvents.active || []),
    ...(filteredEvents.upcoming || []),
    ...(filteredEvents.completed || []),
  ];

  const sortedSpotlightEvents = allEvents.sort((a, b) => {
    const getStatus = (event: any) => {
      if (now >= new Date(event.start_date) && now <= new Date(event.end_date))
        return 0; // active
      if (now < new Date(event.start_date)) return 1; // upcoming
      return 2; // completed
    };

    const statusA = getStatus(a);
    const statusB = getStatus(b);

    if (statusA !== statusB) return statusA - statusB; // group order
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime(); // most recent first
  });

  const renderSpotlightTourney = (event: any) => (
    <Box key={event.id} mb={10}>
      {/* Mobile layout */}
      <Box
        bgImage={`url(${event.hero_img})`}
        bgPos="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        minH="400px"
        width="100%"
        display={{ base: "flex", lg: "none" }}
        justifyContent="center"
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.700"
        />
        <Heading
          as="h2"
          fontSize={{ base: "32px", md: "48px" }}
          fontWeight="bold"
          textAlign="center"
          mt="160px"
          zIndex="1"
          p={4}
        >
          {event.name}
        </Heading>
      </Box>

      {/* Mobile info section */}
      <Flex
        justify="center"
        align="center"
        pt="70px"
        mt="-40px"
        display={{ base: "flex", lg: "none" }}
        backgroundColor="gray.800"
        borderRadius="2xl"
        boxShadow="md"
        overflow="hidden"
      >
        <VStack align="start" p={4}>
          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={IoMdCalendar} boxSize={["25px", "30px", "35px"]} />
            </Box>
            <Text fontSize="22px" fontWeight="bold">
              {formatDate(event.start_date)}
              {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
            </Text>
          </HStack>

          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={CiLocationOn} boxSize={["25px", "30px", "35px"]} />
            </Box>
            <Text fontSize="16px" fontWeight="bold" textAlign="left">
              {event.location}
            </Text>
          </HStack>

          <Text fontSize="16px" maxW="400px" textAlign="left" mt="20px">
            {event.description}
          </Text>

          <Link to={`/event/${event.id}`}>
            <Button
              colorScheme="teal"
              size="md"
              borderRadius="lg"
              mt={2}
              _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
            >
              View Event
            </Button>
          </Link>
        </VStack>
      </Flex>

      {/* Desktop layout */}
      <Flex
        direction="row"
        align="center"
        justify="center"
        minH="400px"
        width="100%"
        position="relative"
        bgImage={`url(${event.hero_img})`}
        bgPos="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        overflow="hidden"
        display={{ base: "none", lg: "flex" }}
        borderRadius="2xl"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.700"
        />

        <Heading
          as="h2"
          fontSize="48px"
          fontWeight="bold"
          textAlign="left"
          zIndex="1"
          p={4}
          flexShrink={0}
        >
          {event.name}
        </Heading>

        <VStack align="start" gap={4} zIndex="1" p={4} maxW="600px">
          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={IoMdCalendar} boxSize="40px" />
            </Box>
            <Text fontSize="26px" fontWeight="bold">
              {formatDate(event.start_date)}
              {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
            </Text>
          </HStack>

          <HStack align="center">
            <Box w="40px" display="flex" justifyContent="center">
              <Box as={CiLocationOn} boxSize="30px" />
            </Box>
            <Text fontSize="16px" textAlign="left" fontWeight="bold">
              {event.location}
            </Text>
          </HStack>

          <Text fontSize="16px" textAlign="left" mt="20px">
            {event.description}
          </Text>

          <Link to={`/event/${event.id}`}>
            <Button
              colorScheme="teal"
              size="md"
              borderRadius="lg"
              mt={2}
              _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
            >
              View Event
            </Button>
          </Link>
        </VStack>
      </Flex>
    </Box>
  );

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
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        width="100%"
        p={4}
      >
        {/* Spotlight Swiper */}
        <MotionBox variants={fadeIn}>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={50}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
          >
            {sortedSpotlightEvents.map((event) => (
              <SwiperSlide key={event.id}>
                {renderSpotlightTourney(event)}
              </SwiperSlide>
            ))}
          </Swiper>
        </MotionBox>

        {/* Event sections */}
        {Object.entries(filteredEvents).map(([section, eventList]) =>
          eventList.length > 0 ? (
            <MotionVStack
              key={section}
              align="stretch"
              w="100%"
              mb={8}
              gap={6}
              variants={fadeIn}
            >
              <MotionFlex justify="center" w="100%" variants={fadeIn}>
                {renderSectionHeader(
                  `${section.charAt(0).toUpperCase() + section.slice(1)} Events`
                )}
              </MotionFlex>
              {eventList.map((event) => {
                const tourneysForEvent =
                  eventTourneyMap
                    .get(event.id)
                    ?.sort((a, b) =>
                      a.start_date.localeCompare(b.start_date)
                    ) || [];
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
          ) : null
        )}
      </MotionBox>
    </>
  );
}

export default HomePage;
