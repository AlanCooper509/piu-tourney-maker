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
import type { Tourney } from "../../types/Tourney";
import { StatusElement } from "../StatusElement"; // Import StatusElement

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
      w={{ base: "90%", md: "60%" }}
      mx="auto"
      p={{ base: 4, sm: 5 }}
      bg={isNested ? "gray.800" : "gray.900"}
      borderWidth="1px"
      borderTopWidth={isNested ? "0" : "1px"}
      borderRadius={isNested ? "none" : "lg"}
      borderBottomRadius={isNested ? "none" : "lg"}
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
            <Flex direction="column" flex="1" justify="center" align="flex-start">
              {/* Header Row */}
              <Flex align="center" gap={2} w="100%" justify="space-between">
                <Heading
                  as="h4"
                  fontSize={{
                    base: "md",
                    sm: "lg",
                    md: isNested ? "xl" : "xl",
                    xl: isNested ? "xl" : "2xl"
                  }}
                  color="white"
                  textAlign="left"
                  m={0}
                >
                  {row.name}
                </Heading>

                {isAdmin && (
                  <Badge colorPalette="green" variant="outline" fontSize="xs" ml="auto">
                    Admin
                  </Badge>
                )}
              </Flex>

              {/* Status & Date Metadata Row */}
              <HStack justify="space-between" align="center" w="100%" mt={3} wrap="wrap">
                {/* Unified Status Component */}
                <StatusElement element={row} shorten={true} />

                <Text fontSize="sm" color="gray.500" textAlign="left">
                  {formatDate(row.start_date)}
                  {row.end_date && ` - ${formatDate(row.end_date)}`}
                </Text>
              </HStack>
            </Flex>
          </HStack>
        </Link>
      </LinkOverlay>
    </LinkBox>
  );
};

export default TourneyCard;