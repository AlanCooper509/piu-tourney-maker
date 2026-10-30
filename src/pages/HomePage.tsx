import { useRef } from "react";
import {
  Box,
  Text,
  VStack
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import { motion } from "framer-motion";
import { Autoplay } from "swiper/modules";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import getSupabaseTable from "../hooks/getSupabaseTable";
import { useHomeEvents } from "../hooks/useHomeEvents";
import { useAdminTourneyContext } from "../context/admin/AdminTourneyContext";
import { SpotlightEventItem } from "../components/home/SpotlightEventItem";
import { SpotlightNavButton } from "../components/home/SpotlightNavButton";

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
  const swiperRef = useRef<SwiperClass | null>(null);
  const { data: events, loading, error } = getSupabaseTable<Event>("events");
  const { data: tourneys } = getSupabaseTable<Tourney>("tourneys");
  const { adminTourneyIds } = useAdminTourneyContext();
  const { filteredEvents, sortedSpotlightEvents, eventTourneyMap } = useHomeEvents(events, tourneys);

  if (loading) return <Text fontSize="xl" mt={8}>Loading...</Text>;
  if (error) return <Text fontSize="xl" mt={8}>Error: {error.message}</Text>;

  return (
    <MotionBox initial="hidden" animate="visible" variants={staggerContainer} width="100%" p={4}>
      
      {/* Spotlight Hero Swiper */}
      <MotionBox variants={fadeIn} position="relative">
        <Swiper
          modules={[Pagination, Autoplay]}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          pagination={{ clickable: true }}
          style={{
            "--swiper-pagination-color": "var(--chakra-colors-cyan-400)",
            "--swiper-pagination-bullet-inactive-color": "var(--chakra-colors-gray-400)",
          } as React.CSSProperties}
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

        <SpotlightNavButton side="left" onClick={() => swiperRef.current?.slidePrev()} />
        <SpotlightNavButton side="right" onClick={() => swiperRef.current?.slideNext()} />
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
