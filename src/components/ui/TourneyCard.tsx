import {
  LinkBox,
  LinkOverlay,
  HStack,
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Tourney } from "../../types/Tourney";

interface TourneyCardProps {
  row: Tourney;
  keyPrefix: string;
  isNested?: boolean;
  adminTourneyIds: number[];
}

const TourneyCard: React.FC<TourneyCardProps> = ({
  row,
  keyPrefix,
  isNested = false,
  adminTourneyIds,
}) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const isAdmin = adminTourneyIds.includes(row.id);

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
      // Layout Adjustments
      w={{ base: "90%", md: "60%" }}
      mx="auto"
      p={{ base: 4, sm: 5 }}
      // Nested vs. Standalone Styling
      bg={isNested ? "gray.800" : "gray.900"}
      borderWidth="1px"
      borderTopWidth={isNested ? "0" : "1px"}
      borderRadius={isNested ? "none" : "lg"}
      borderBottomRadius={isNested ? "none" : "lg"} // Keep it flat if nested
      mb={isNested ? "0px" : "15px"}
      // Interaction
      shadow={isNested ? "none" : "sm"}
      transition="all 0.2s"
      _hover={{
        bg: isNested ? "gray.700" : "gray.600",
        transform: isNested ? "none" : "scale(1.02)",
        shadow: isNested ? "none" : "lg",
      }}
    >
      <LinkOverlay asChild>
        <Link to={`/tourney/${row.id}`}>
          <HStack align="center" gap={4} w="100%">
            {/* Image Section */}
            <Box
              minW={{ base: "50px", sm: "70px" }}
              minH={{ base: "50px", sm: "70px" }}
            >
              <Image
                src={row.thumbnail_img ?? "/trophy.png"}
                alt={row.name}
                boxSize={{ base: "50px", sm: "70px" }}
                objectFit="cover"
                borderRadius="md"
                opacity={isNested ? 0.8 : 1}
              />
            </Box>

            {/* Content Section */}
            <Flex direction="column" flex="1" justify="center">
              <HStack justify="space-between" align="baseline">
                <Heading
                  as="h4"
                  fontSize={{
                    base: "md",
                    sm: "lg",
                    md: isNested ? "xl" : "2xl",
                  }}
                  color="white"
                >
                  {row.name}
                </Heading>

                {isAdmin && (
                  <Badge colorPalette="green" variant="outline" fontSize="xs">
                    Admin
                  </Badge>
                )}
              </HStack>

              <HStack gap={4} mt={1} wrap="wrap">
                <Text fontSize="sm" color="gray.400">
                  {formatDate(row.start_date)}
                  {row.end_date && ` - ${formatDate(row.end_date)}`}
                </Text>

                <Badge
                  variant="subtle"
                  colorPalette={
                    row.status === "In Progress"
                      ? "yellow"
                      : row.status === "Not Started"
                      ? "blue"
                      : "green"
                  }
                  fontSize="2xs"
                  px={2}
                  borderRadius="full"
                >
                  {row.status}
                </Badge>
              </HStack>
            </Flex>

            {/* Subtle ID for logged in users */}
            {userId && !isNested && (
              <Text fontSize="xs" color="gray.600" alignSelf="flex-end">
                #{row.id}
              </Text>
            )}
          </HStack>
        </Link>
      </LinkOverlay>
    </LinkBox>
  );
};

export default TourneyCard;