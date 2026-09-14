import { Box, Heading, Image, Flex } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { useCurrentEvent } from "../../context/CurrentEventContext";

export function HeroTitle() {
  const location = useLocation();
  const { event } = useCurrentEvent();

  // EventPage already renders the event's own hero via SpotlightEventItem,
  // so this bar only takes on the event's identity for tourney sub-pages —
  // on the event page itself it stays the default, linking back home.
  const isTourneySubRoute = location.pathname.startsWith("/tourney/");
  const activeBanner = isTourneySubRoute ? event?.hero_img : "https://preview.redd.it/pump-it-up-phoenix-2024-v0-wingd1wryw0d1.jpeg?auto=webp&s=00bf42c49d7b475464de9f65df97374e4ebbfd49";
  const activeTitle = isTourneySubRoute ? event?.name : "Pump It Up Tourney Maker";
  const heroLinkTo = isTourneySubRoute && event ? `/event/${event.id}` : "/";

  return (
    <Box
      as="header"
      w="100%"
      bg="gray.800"
      borderBottom="1px solid"
      borderColor="gray.700"
      py={6}
      px={4}
      mb={6}
      position="relative"
      overflow="hidden"
    >
      {/* Background Banner Image with Gradient Overlay */}
      {activeBanner && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
        >
          <Image
            src={activeBanner}
            alt="Hero Banner"
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={0.3}
          />
          <Box
            position="absolute"
            inset={0}
            bgGradient="to-b"
            gradientFrom="transparent"
            gradientTo="gray.900"
          />
        </Box>
      )}

      {/* Hero Content */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        maxW="1200px"
        mx="auto"
        textAlign="center"
      >
        <Link to={heroLinkTo}>
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            letterSpacing="tight"
            color="white"
            _hover={{ color: "blue.400" }}
            transition="color 0.2s"
          >
            {activeTitle || "PIU Tourney Maker"}
          </Heading>
        </Link>
      </Flex>
    </Box>
  );
}
