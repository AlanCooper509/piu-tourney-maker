import { Box, Flex, Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu/ProfileMenu";

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
