import { useMemo, useRef, useState } from "react";
import { Box, Center, Text } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";

import { buildBracketPhases } from "../../../helpers/buildBracketPhases";
import BracketPhaseSlide from "./BracketPhaseSlide";

import type { Round } from "../../../types/Round";
import type { RoundPool } from "../../../types/RoundPool";
import type { PlayerRound } from "../../../types/PlayerRound";
import type { RoundAdvancement } from "../../../types/RoundAdvancement";

interface BracketCarouselProps {
  roundPools: RoundPool[];
  rounds: Round[];
  playerRounds: PlayerRound[];
  roundAdvancements: RoundAdvancement[];
  loadingAdvancements: boolean;
}

export default function BracketCarousel({
  roundPools,
  rounds,
  playerRounds,
  roundAdvancements,
  loadingAdvancements,
}: BracketCarouselProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const phases = useMemo(
    () => buildBracketPhases(rounds, roundPools, playerRounds, roundAdvancements),
    [rounds, roundPools, playerRounds, roundAdvancements],
  );

  // open on the first phase still in play (falls back to the first phase once everything is Complete);
  // only read on mount, since Swiper ignores later initialSlide changes
  const initialSlide = Math.max(
    0,
    phases.findIndex((phase) => phase.matches.some((m) => m.round.status !== "Complete")),
  );

  const handleSwitchToPool = (poolId: number) => {
    const idx = phases.findIndex((p) => p.pool.id === poolId);
    if (idx >= 0) swiperRef.current?.slideTo(idx);
  };

  if (loadingAdvancements) {
    return (
      <Center py={10} w="100%">
        <Text color="fg.muted" fontStyle="italic">Loading bracket...</Text>
      </Center>
    );
  }

  if (phases.length === 0) {
    return (
      <Center py={10} w="100%">
        <Text color="fg.muted" fontStyle="italic">No bracket rounds yet.</Text>
      </Center>
    );
  }

  return (
    <Box w="100%" maxW="md" position="relative">
      <Swiper
        autoHeight
        // slide content keeps changing after mount (players, advancements), so re-measure autoHeight on
        // changes to the swiper's own content. Not observeParents: sibling updates re-measured at bad moments
        // and left a big blank gap
        observer
        initialSlide={initialSlide}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setActiveIndex(swiper.activeIndex);
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {phases.map((phase) => (
          <SwiperSlide key={phase.pool.id}>
            <BracketPhaseSlide
              phase={phase}
              onSwitchToPool={handleSwitchToPool}
              onPrevPhase={() => swiperRef.current?.slidePrev()}
              onNextPhase={() => swiperRef.current?.slideNext()}
              canGoPrevPhase={activeIndex > 0}
              canGoNextPhase={activeIndex < phases.length - 1}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
