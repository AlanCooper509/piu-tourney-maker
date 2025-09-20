// src/components/ui/TourneyCard.tsx
import { LinkBox, LinkOverlay, HStack, Box, Flex, Image, Heading, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import type { Tourney } from "../../types/Tourney";

interface TourneyCardProps {
  row: Tourney;
  keyPrefix: string;
  isNested?: boolean;
  adminTourneyIds: number[];
}

const TourneyCard: React.FC<TourneyCardProps> = ({ row, keyPrefix, isNested = false, adminTourneyIds }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <LinkBox
      as="article"
      key={`${keyPrefix}-${row.id}`}
      borderWidth="1px"
      borderRadius={isNested ? "none" : "lg"}
      borderTopWidth={isNested ? "0" : "1px"}
      p={{ base: 4, sm: 5 }}
      bg={isNested ? "gray.800" : "gray.900"}
      color="white"
      shadow={isNested ? "none" : "sm"}
      transition="all 0.2s"
      _hover={{
        shadow: isNested ? "none" : "lg",
        bg: isNested ? "gray.700" : "gray.600",
        transform: isNested ? "none" : "scale(1.02)",
        cursor: "pointer",
      }}
      w={{ base: "90%", md: "60%" }}
      mx="auto"
    >
      <LinkOverlay asChild>
        <Link to={`/tourney/${row.id}`}>
          <HStack align="center" w="100%">
            {/* Tourney Thumbnail Image */}
            <Box minW={{ base: "60px", sm: "80px", md: "90px" }} minH={{ base: "60px", sm: "80px", md: "90px" }}>
              <Image
                src={row.thumbnail_img ?? "/trophy.png"}
                alt={`${row.name} image`}
                boxSize={{ base: "60px", sm: "80px", md: "90px" }}
                objectFit="cover"
                borderRadius="md"
              />
            </Box>
            <Flex direction="column" flex="1" justify="space-between" minH={{ base: "70px", sm: "90px" }}>
              <HStack justify="space-between" w="100%" align="start">

                {/* Tourney Name */}
                <Heading as="h3" fontSize={{ base: "lg", sm: "xl", md: isNested ? "xl" : "3xl" }}>
                  {row.name}
                </Heading>

                {/* Tourney Admin Badge */}
                {adminTourneyIds.includes(row.id) && (
                  <Text fontSize={{ base: "md", sm: "lg" }} color="green.400">
                    (Admin)
                  </Text>
                )}
              </HStack>

              {/* Tourney Dates */}
              <Box w="100%" mt={2}>
                <Text fontSize={{ base: "sm", sm: "md" }} color="gray.300" textAlign="left">
                  Dates: {formatDate(row.start_date)}
                  {row.end_date ? ` - ${formatDate(row.end_date)}` : ""}
                </Text>
              </Box>

              {/* Tourney Status */}
              <Box w="100%" mt={1}>
                <Text
                  fontSize={{ base: "sm", sm: "md" }}
                  color={
                    row.status === "In Progress" ? "yellow.300"
                      : row.status === "Not Started" ? "blue.300"
                      : /* assume it's "Complete" */ "green.400"
                  }
                  fontWeight="bold"
                  textAlign="left"
                >
                  {row.status}
                </Text>
              </Box>

              {/* Tourney ID */}
              {userId && (
                <Flex justify="flex-end" mt={2}>
                  <Text fontSize={{ base: "sm", sm: "md" }} color="gray.300">
                    ID: {row.id}
                  </Text>
                </Flex>
              )}
            </Flex>
          </HStack>
        </Link>
      </LinkOverlay>
    </LinkBox>
  );
};

export default TourneyCard;
