import {
  Box,
  Text,
  VStack
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import { Autoplay, Navigation } from "swiper/modules";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import getSupabaseTable from "../hooks/getSupabaseTable";
import { useHomeEvents } from "../hooks/useHomeEvents";
import { getAdminTourneyIds } from "../hooks/AdminTourneyHelpers";
import { SpotlightEventItem } from "../components/home/SpotlightEventItem";

import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";
import { EventSection } from "../components/home/EventSection";

// Wrap Chakra components with motion
const MotionBox = motion.create(Box);

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
  const { filteredEvents, sortedSpotlightEvents, eventTourneyMap } = useHomeEvents(events, tourneys);

  if (loading) return <Text fontSize="xl" mt={8}>Loading...</Text>;
  if (error) return <Text fontSize="xl" mt={8}>Error: {error.message}</Text>;

  return (
    <MotionBox initial="hidden" animate="visible" variants={staggerContainer} width="100%" p={4}>
      
      {/* Spotlight Hero Swiper */}
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
              <SpotlightEventItem event={event} />
            </SwiperSlide>
          ))}
        </Swiper>
      </MotionBox>

      {/* 2. Categorized Event Lists */}
      <VStack mt={4} gap={10}>
        <EventSection 
          title="Active Events" 
          events={filteredEvents.active} 
          eventTourneyMap={eventTourneyMap}
          adminTourneyIds={adminTourneyIds}
        />
        <EventSection 
          title="Upcoming Events" 
          events={filteredEvents.upcoming} 
          eventTourneyMap={eventTourneyMap}
          adminTourneyIds={adminTourneyIds}
        />
        <EventSection 
          title="Completed Events" 
          events={filteredEvents.completed} 
          eventTourneyMap={eventTourneyMap}
          adminTourneyIds={adminTourneyIds}
        />
      </VStack>

    </MotionBox>
  );
}

export default HomePage;
