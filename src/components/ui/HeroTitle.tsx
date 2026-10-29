import { Box, Flex, Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu/ProfileMenu";

// Exported so page-specific heroes (e.g. TourneyHeroBanner) can fall back to
// the same image as a last resort instead of duplicating the literal URL.
export const DEFAULT_BANNER = "https://pbs.twimg.com/media/HHI5IPebQAAJnjf?format=webp&name=large";

// Deliberately just a slim, basic bar — a big photo-hero here never
// actually said anything about which page you were on, since it looked
// the same everywhere. Pages that benefit from their own "you are here"
// graphic (e.g. TourneyPage via TourneyHeroBanner) carry that themselves,
// right below this constant, site-wide landmark.
export function HeroTitle() {
  return (
    <Box
      as="header"
      w="100%"
      bg="gray.800"
      borderBottom="1px solid"
      borderColor="gray.700"
      py={3}
      px={4}
      position="relative"
    >
      {/* Title centered on the bar itself (not just the space left over
          after ProfileMenu) — ProfileMenu sits absolutely in its own
          corner instead of sharing a flex row with it, same trick the
          original hero used before this bar was slimmed down. */}
      <Flex justify="center" maxW="1200px" mx="auto">
        <Link to="/">
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            letterSpacing="tight"
            color="cyan.solid"
            _hover={{ color: "cyan.focusRing" }}
            transition="color 0.2s"
          >
            Blame The Pads
          </Heading>
        </Link>
      </Flex>

      <Flex position="absolute" top={0} bottom={0} right={4} align="center">
        <ProfileMenu />
      </Flex>
    </Box>
  );
}
