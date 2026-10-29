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
        <Text color="fg.muted" fontStyle="italic">No rounds match the current criteria.</Text>
      </Center>
    );
  }

  return (
    // One constant maxW instead of a {base, md} breakpoint switch — that
    // switch is what broke below the md breakpoint (768px); a flat cap
    // naturally fits any viewport since maxW is only ever a ceiling, so a
    // true phone width just shrinks to fit without needing its own case.
    <Box w="100%" maxW="md" position="relative">
      <Swiper
        autoHeight
        // Phase data (players, advancements) streams in asynchronously
        // after this mounts, so the DOM inside each slide keeps changing
        // after Swiper's first height measurement. Without watching for
        // that, autoHeight stayed stuck on a stale (too-short) height,
        // clipping the last match card. `observer` re-runs that
        // measurement via MutationObserver whenever the swiper's OWN
        // content changes. Deliberately not `observeParents` — that
        // widens the watch to the entire ancestor tree (the players
        // sidebar, round pools manager, etc.), and unrelated sibling
        // updates were triggering autoHeight recalculations at bad
        // moments, landing on a wrong height and leaving a large blank
        // gap instead of the actual content.
        observer
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
