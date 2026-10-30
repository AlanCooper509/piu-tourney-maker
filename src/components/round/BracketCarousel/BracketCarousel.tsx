import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Card, Center, Collapsible, Heading, HStack, IconButton, SegmentGroup, Text } from "@chakra-ui/react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";

import { buildBracketPhases } from "../../../helpers/buildBracketPhases";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { useIsAdminForTourney } from "../../../context/admin/AdminTourneyContext";
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
  const [highlightedRoundId, setHighlightedRoundId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const lastIndexBySide = useRef<{ winners?: number; losers?: number }>({});
  const { tourney } = useCurrentTourney();
  const { isTourneyAdmin, loadingTourneyAdminStatus } = useIsAdminForTourney(tourney?.id ?? undefined);
  const showsAdminControls = !loadingTourneyAdminStatus && isTourneyAdmin;

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

  const hasLosersSide = phases.some((p) => p.isLosers);

  // Winners | Losers toggle: go to the paired phase if there is one, else wherever you last were on that
  // side, else that side's first phase
  const handleSelectSide = (side: "winners" | "losers") => {
    const current = phases[activeIndex];
    const wantLosers = side === "losers";
    if (!current || current.isLosers === wantLosers) return;
    const pairedIdx = current.pairedPoolId != null
      ? phases.findIndex((p) => p.pool.id === current.pairedPoolId)
      : -1;
    const idx = pairedIdx >= 0
      ? pairedIdx
      : lastIndexBySide.current[side] ?? phases.findIndex((p) => p.isLosers === wantLosers);
    if (idx >= 0) swiperRef.current?.slideTo(idx);
  };

  const handleSlideChange = (index: number) => {
    setActiveIndex(index);
    const phase = phases[index];
    if (phase) lastIndexBySide.current[phase.isLosers ? "losers" : "winners"] = index;
  };

  // quick-nav from a match card: slide to the target's phase, bring its card into view, pulse it once
  const handleJumpToMatch = (roundId: number) => {
    const idx = phases.findIndex((p) => p.matches.some((m) => m.round.id === roundId));
    if (idx < 0) return;
    swiperRef.current?.slideTo(idx);
    // after the slide transition + autoHeight resize settle, center the card by scrolling the page only;
    // scrollIntoView would also scroll Swiper's overflow-hidden container sideways and misalign the slides
    window.setTimeout(() => {
      const card = document.querySelector(`[data-round-id="${roundId}"]`);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2, behavior: "smooth" });
      setHighlightedRoundId(roundId); // pulse as the card arrives, not while it's still off-screen
    }, 350);
  };

  // the jumped-to card keeps its hover look until the next click or keypress anywhere (another quick-nav
  // click clears it on press, then sets the new target on click, so a repeat jump re-pulses too)
  useEffect(() => {
    if (highlightedRoundId == null) return;
    const clear = () => setHighlightedRoundId(null);
    document.addEventListener("pointerdown", clear);
    document.addEventListener("keydown", clear);
    return () => {
      document.removeEventListener("pointerdown", clear);
      document.removeEventListener("keydown", clear);
    };
  }, [highlightedRoundId]);

  const activeSide = phases[activeIndex]?.isLosers ? "losers" : "winners";

  // same header layout as the Players / Rulesets columns beside it (heading left for admins, centered otherwise)
  // Swiper measured 0 width while collapsed, so re-measure on reopen (now, and once the open animation ends)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) return;
    requestAnimationFrame(() => swiperRef.current?.update());
    window.setTimeout(() => swiperRef.current?.update(), 300);
  };

  const header = (
    <HStack
      mb={isOpen ? 3 : 0}
      justifyContent={showsAdminControls ? "flex-start" : "center"}
      alignItems="center"
      px={1}
      minHeight={showsAdminControls ? "36px" : "24px"}
    >
      {/* same chevron toggle as the Players / Rulesets / Round Pools sections */}
      <Collapsible.Trigger asChild cursor="pointer">
        <HStack gap={2}>
          <IoChevronForward
            style={{
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
          <Heading size="md" color="gray.200">Bracket</Heading>
        </HStack>
      </Collapsible.Trigger>
    </HStack>
  );

  const collapsibleSection = (body: React.ReactNode) => (
    <Box w="100%" maxW="md" mx="auto" position="relative">
      <Collapsible.Root open={isOpen} onOpenChange={(details) => handleOpenChange(details.open)}>
        {header}
        <Collapsible.Content>{body}</Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );

  const sideToggle = hasLosersSide && (
    <Center>
      <SegmentGroup.Root
        size="sm"
        value={activeSide}
        onValueChange={(e) => e.value && handleSelectSide(e.value as "winners" | "losers")}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Item value="winners" px={4} _checked={{ color: "cyan.solid" }}>
          <SegmentGroup.ItemText>Winners</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
        <SegmentGroup.Item value="losers" px={4} _checked={{ color: "red.400" }}>
          <SegmentGroup.ItemText>Losers</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      </SegmentGroup.Root>
    </Center>
  );

  // phase title + prev/next sit outside the carousel and follow the active slide, so only the matches slide
  const activePhase = phases[activeIndex];
  const phaseNav = activePhase && (
    <HStack justifyContent="space-between" alignItems="center" gap={2}>
      <IconButton
        aria-label="Previous phase"
        size="sm"
        variant="outline"
        colorPalette="blue"
        flexShrink={0}
        visibility={activeIndex > 0 ? "visible" : "hidden"}
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <IoChevronBack />
      </IconButton>

      <Heading
        flex="1"
        minW={0}
        size="md"
        letterSpacing="tight"
        color={activePhase.isLosers ? "red.400" : "cyan.solid"}
        textAlign="center"
      >
        {activePhase.pool.name.toUpperCase()}
      </Heading>

      <IconButton
        aria-label="Next phase"
        size="sm"
        variant="outline"
        colorPalette="blue"
        flexShrink={0}
        visibility={activeIndex < phases.length - 1 ? "visible" : "hidden"}
        onClick={() => swiperRef.current?.slideNext()}
      >
        <IoChevronForward />
      </IconButton>
    </HStack>
  );

  if (loadingAdvancements || phases.length === 0) {
    return collapsibleSection(
      <Center py={10} w="100%">
        <Text color="fg.muted" fontStyle="italic">
          {loadingAdvancements ? "Loading bracket..." : "No bracket rounds yet."}
        </Text>
      </Center>
    );
  }

  return collapsibleSection(
    <>
      {/* same card style as the Players list and Rulesets cards, so all three columns start at the same line */}
      <Card.Root variant="outline" size="sm" mb={1}>
        <Card.Body gap={3}>
          {sideToggle}
          {phaseNav}
        </Card.Body>
      </Card.Root>
      <Swiper
        autoHeight
        // slide content keeps changing after mount (players, advancements), so re-measure autoHeight on
        // changes to the swiper's own content. Not observeParents: sibling updates re-measured at bad moments
        // and left a big blank gap
        observer
        initialSlide={initialSlide}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          handleSlideChange(swiper.activeIndex);
        }}
        onSlideChange={(swiper) => handleSlideChange(swiper.activeIndex)}
      >
        {phases.map((phase) => (
          <SwiperSlide key={phase.pool.id}>
            <BracketPhaseSlide
              phase={phase}
              onJumpToMatch={handleJumpToMatch}
              highlightedRoundId={highlightedRoundId}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
