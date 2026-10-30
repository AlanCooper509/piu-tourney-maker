import { Box, Heading, HStack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import { useCurrentEvent } from "../../../context/CurrentEventContext";
import { tourneyPath } from "../../../helpers/paths";

import type { Tourney } from "../../../types/Tourney";

interface TourneyHeroBannerProps {
  tourney: Tourney | null;
}

const HERO_TEXT_SHADOW = "0 1px 2px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.75)";
const DEFAULT_BANNER = "https://pbs.twimg.com/media/HHI5IPebQAAJnjf?format=webp&name=large";

export function TourneyHeroBanner({ tourney }: TourneyHeroBannerProps) {
  const { event } = useCurrentEvent();

  // context can still hold a previously visited event until the sync hook catches up
  const parentEvent = tourney && event?.id === tourney.event_id ? event : null;

  // hold off on the default until the parent event has loaded, otherwise it flashes before the event's image
  const bannerImg = tourney?.thumbnail_img || (parentEvent ? parentEvent.hero_img || DEFAULT_BANNER : null);

  return (
    <Box
      position="relative"
      overflow="hidden"
      minH={{ base: "110px", md: "130px" }}
      w="100%"
      bg="gray.800"
      bgImage={bannerImg ? `url(${bannerImg})` : undefined}
      bgSize="cover"
      bgPos="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
      pt={{ base: 12, md: 0 }}
      pb={{ base: 4, md: 0 }}
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="to-b"
        gradientFrom="blackAlpha.400"
        gradientTo="gray.900"
      />

      {tourney && (
        <>
          <Box position="absolute" top={3} left={0} right={0} zIndex={1} pointerEvents="none">
            <Box maxW="1200px" mx="auto" px={4} textAlign="left">
              <RouterLink to={`/event/${tourney.event_id}`} style={{ pointerEvents: "auto" }}>
                <HStack
                  display="inline-flex"
                  gap={1}
                  color="whiteAlpha.800"
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="medium"
                  textShadow={HERO_TEXT_SHADOW}
                  css={{ "& svg": { filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.9))" } }}
                  _hover={{ color: "cyan.200" }}
                  transition="color 0.2s"
                >
                  <IoChevronBack />
                  <Text>Event</Text>
                </HStack>
              </RouterLink>
            </Box>
          </Box>

          <RouterLink to={tourneyPath(tourney.id, tourney.event_id)}>
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
        </>
      )}
    </Box>
  );
}
