import { Box, Flex, Heading, HStack, Image, Text, VStack, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { CiLocationOn } from "react-icons/ci";
import { IoArrowForward } from "react-icons/io5";
import type { Event } from "../../types/Event";

interface Props {
  event: Event;
  showButton?: boolean;
}

// tight shadow for crisp edges plus a wide soft one, so text holds up on bright and busy banners alike
const HERO_TEXT_SHADOW = "0 1px 2px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.75)";

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
        overflow="hidden"
        borderRadius={showButton ? "2xl" : "none"}
      >
        {/* Blurred bg image behind text for readability while maintaining stylistic consistency */}
        <Box
          position="absolute"
          inset="-40px"
          bgImage={`url(${event.hero_img})`}
          bgPos="center"
          bgRepeat="no-repeat"
          bgSize="cover"
          filter="blur(24px) brightness(0.45) saturate(1.2)"
        />

        {/* Sharp bg image copy: fixed 16:9 strip on top for mobile, left 2/3 of the card for desktop */}
        <Box
          position="relative"
          flex={{ lg: "2" }}
          w="100%"
          aspectRatio={{ base: "16 / 9", lg: "auto" }}
          zIndex="1"
        >
          <Image
            src={event.hero_img}
            alt=""
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        </Box>

        {/* Info Section */}
        <VStack
          align="start"
          justify="center"
          gap={4}
          zIndex="1"
          p={{ base: 6, lg: 8, xl: 12 }}
          pl={{ lg: 6, xl: 8 }}
          w="100%"
          flex={{ lg: "1" }}
          minW={{ lg: "380px" }}
          textShadow={HERO_TEXT_SHADOW}
        >
          <Heading
            as="h2"
            fontSize={{ base: "28px", lg: "30px", xl: "38px" }}
            fontWeight="bold"
            lineHeight="1.2"
            textAlign="left"
          >
            {event.name}
          </Heading>

          <HStack align="center" gap={1}>
            <Box as={IoMdCalendar} boxSize={{ base: "25px", lg: "24px", xl: "30px" }} />
            <Text
              fontSize={{ base: "20px", lg: "21px", xl: "26px" }}
              fontWeight="bold"
              textAlign="left"
            >
              {formatEventDateRange(event.start_date, event.end_date)}
            </Text>
          </HStack>

          <HStack align="center" gap={1}>
            <Box as={CiLocationOn} boxSize={{ base: "25px", lg: "24px", xl: "30px" }} />
            <Text 
              fontSize={{ base: "14px", lg: "14px", xl: "16px" }} 
              fontWeight="bold"
              textAlign="left"
              flex="1"
            >
              {event.location}
            </Text>
          </HStack>

          <Text 
            fontSize={{ base: "14px", lg: "14px", xl: "16px" }} 
            textAlign="left" 
            color="gray.50"
            maxW={{ base: "100%", lg: "500px" }}
            lineHeight="tall"
            lineClamp={showButton ? { base: 3, lg: 4 } : undefined}
          >
            {event.description}
          </Text>

          {showButton && (
            <Button
              asChild // render as the Link itself, rather than a <button> nested inside an <a>
              colorPalette="cyan"
              size="md"
              borderRadius="full"
              px={5}
              mt={2}
              textShadow="none"
              boxShadow="0 4px 14px rgba(0,0,0,0.45)"
              css={{
                "& svg": { transition: "transform 0.2s" },
                "&:hover svg": { transform: "translateX(3px)" },
              }}
            >
              <Link to={`/event/${event.id}`}>
                View Event <IoArrowForward />
              </Link>
            </Button>
          )}
        </VStack>
      </Flex>
    </Box>
  );
}