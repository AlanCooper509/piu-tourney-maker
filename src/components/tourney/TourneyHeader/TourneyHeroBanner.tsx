import { Box, Heading } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { useCurrentEvent } from "../../../context/CurrentEventContext";

import type { Tourney } from "../../../types/Tourney";

interface TourneyHeroBannerProps {
  tourney: Tourney | null;
}

// Same crisp-edge-plus-soft-glow shadow SpotlightEventItem uses, so hero
// text reads clearly over any photo, bright or busy.
const HERO_TEXT_SHADOW = "0 1px 2px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.75)";

// Last-resort image when neither the tourney nor its parent event has one set
const DEFAULT_BANNER = "https://pbs.twimg.com/media/HHI5IPebQAAJnjf?format=webp&name=large";

/**
 * The tournament page's own "you are here" graphic — background art behind
 * a single clickable title, fading into the breadcrumb/round-nav below it.
 * The title is the tourney name, but links UP to the parent event's page
 * (same target the breadcrumb's event link already uses) rather than back
 * to this same tourney page — this is the "go up a level" control, not a
 * self-link; the breadcrumb right below it still covers getting back to
 * this specific tourney. Image falls back from the tourney's own
 * thumbnail, to its parent event's hero image, to the site's generic
 * default banner.
 */
export function TourneyHeroBanner({ tourney }: TourneyHeroBannerProps) {
  const { event } = useCurrentEvent();

  if (!tourney) return null;

  const bannerImg = tourney.thumbnail_img || event?.hero_img || DEFAULT_BANNER;

  return (
    <Box
      position="relative"
      overflow="hidden"
      minH={{ base: "90px", md: "130px" }}
      w="100%"
      bgImage={`url(${bannerImg})`}
      bgSize="cover"
      bgPos="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="to-b"
        gradientFrom="blackAlpha.400"
        gradientTo="gray.900"
      />

      <RouterLink to={`/event/${tourney.event_id}`}>
        <Heading
          as="h2"
          position="relative"
          zIndex={1}
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="bold"
          letterSpacing="tight"
          color="white"
          textAlign="center"
          px={4}
          textShadow={HERO_TEXT_SHADOW}
          _hover={{ color: "cyan.200" }}
          transition="color 0.2s"
        >
          {tourney.name}
        </Heading>
      </RouterLink>
    </Box>
  );
}
