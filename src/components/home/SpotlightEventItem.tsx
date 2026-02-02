import { Box, Flex, Heading, HStack, Text, VStack, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { CiLocationOn } from "react-icons/ci";
import type { Event } from "../../types/Event";

interface Props {
  event: Event;
  showButton?: boolean;
}

const formatEventDateRange = (startStr: string, endStr?: string) => {
  const optionsShort: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const optionsWithYear: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

  const startDate = new Date(startStr);
  const startFormatted = startDate.toLocaleDateString(undefined, optionsShort);
  const startWithYear = startDate.toLocaleDateString(undefined, optionsWithYear);
  if (!endStr) { return startWithYear; }

  const endDate = new Date(endStr);
  const endWithYear = endDate.toLocaleDateString(undefined, optionsWithYear);
  if (startWithYear === endWithYear) { return startWithYear; }
  return `${startFormatted} - ${endWithYear}`;
};

export function SpotlightEventItem({ event, showButton = true }: Props) {
  return (
    <Box pb={showButton ? 10 : 0}>
      <Flex
        direction={{ base: "column", lg: "row" }}
        align={{ base: "center", lg: "stretch" }} 
        justify="center"
        minH={showButton ? "400px" : "300px"}
        width="100%"
        position="relative"
        bgImage={`url(${event.hero_img})`}
        bgPos="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        overflow="hidden"
        borderRadius="2xl"
      >
        {/* Shared Overlay */}
        <Box
          position="absolute"
          inset={0}
          bg="rgba(0,0,0,0.75)"
          backdropFilter="brightness(0.85) contrast(1.1)"
        />

        {/* Title Section */}
        <Heading
          as="h2"
          fontSize={{ base: "30px", md: "48px" }}
          fontWeight="bold"
          textAlign="center"
          zIndex="1"
          p={4}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex="1"
          ml={{ base: 0, lg: 14 }}
          lineHeight="1.2"
          minH={{ base: "120px", lg: "auto" }}
        >
          {event.name}
        </Heading>

        {/* Info Section */}

        <VStack
          align="start"
          justify="center"
          gap={4}
          zIndex="1"
          p={12}
          py={{ base: 5, lg: 12 }}
          w={{ base: "100%", lg: "600px" }}
          flex="1"
          bg={{ base: "gray.800", lg: "transparent" }}
          borderRadius={{ base: "2xl", lg: "none" }}
        >
          <HStack align="center" gap={1}>
            <Box as={IoMdCalendar} boxSize={{ base: "25px", lg: "30px" }} />
            <Text
              fontSize={{ base: "20px", lg: "26px" }}
              fontWeight="bold"
              textAlign="left"
            >
              {formatEventDateRange(event.start_date, event.end_date)}
            </Text>
          </HStack>

          <HStack align="center" gap={1}>
            <Box as={CiLocationOn} boxSize={{ base: "25px", lg: "30px" }} />
            <Text 
              fontSize={{ base: "14px", lg: "16px" }} 
              fontWeight="bold"
              textAlign="left"
              flex="1"
            >
              {event.location}
            </Text>
          </HStack>

          <Text 
            fontSize={{ base: "14px", lg: "16px" }} 
            textAlign="left" 
            color="gray.200"
            maxW={{ base: "100%", lg: "500px" }}
            lineHeight="tall"
            lineClamp={{ base: 3, lg: 4 }}
          >
            {event.description}
          </Text>

          {showButton && (
            <Link to={`/event/${event.id}`}>
              <Button
                colorPalette="blue"
                size="md"
                borderRadius="lg"
                mt={2}
                _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
              >
                 View Event
               </Button>
            </Link>
          )}
        </VStack>
      </Flex>
    </Box>
  );
}