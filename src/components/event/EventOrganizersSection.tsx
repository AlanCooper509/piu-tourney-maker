import { Avatar, Badge, Box, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";

import AddEventAdminButton from "./AddEventAdminButton/AddEventAdminButton";

import type { UserProfile } from "../../types/UserProfile";

interface EventOrganizersSectionProps {
  organizers: UserProfile[];
  loading: boolean;
  currentUserId?: string;
  eventId: number;
  onAdminAdded: (organizer: UserProfile) => void;
}

// mirrors EventTourneysList: same heading treatment, and each organizer gets a card styled like TourneyCard
export default function EventOrganizersSection({ organizers, loading, currentUserId, eventId, onAdminAdded }: EventOrganizersSectionProps) {
  return (
    <>
      {/* only event admins see this section, so the add button is always shown */}
      <Box maxW={{ base: "100%", md: "60%" }} mx="auto" w="100%">
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: "column", sm: "row" }}
          gap={4}
        >
          <Heading
            fontWeight="bold"
            fontSize={{ base: "32px", md: "40px" }}
            textAlign={{ base: "center", sm: "left" }}
          >
            Event Organizers
          </Heading>

          <AddEventAdminButton eventId={eventId} onAdded={onAdminAdded} />
        </Flex>
      </Box>

      {loading && <Text>Loading organizers...</Text>}

      {!loading && organizers.length === 0 && (
        <Box
          p={10}
          textAlign="center"
          bg="gray.900"
          borderRadius="xl"
          border="1px dashed"
          borderColor="gray.600"
        >
          <Text color="gray.400">No event organizers found.</Text>
        </Box>
      )}

      <VStack gap={2} align="stretch">
        {organizers.map((organizer) => {
          const name = organizer.display_name ?? "Unknown user";

          return (
            <HStack
              key={organizer.user_id}
              w={{ base: "90%", md: "60%" }}
              mx="auto"
              p={{ base: 3, sm: 4 }}
              gap={4}
              bg="gray.900"
              borderWidth="1px"
              borderRadius="lg"
              shadow="sm"
            >
              <Avatar.Root size={{ base: "sm", sm: "md" }}>
                <Avatar.Fallback name={name} />
                {organizer.avatar_url && <Avatar.Image src={organizer.avatar_url} />}
              </Avatar.Root>

              <Heading as="h4" fontSize={{ base: "md", sm: "lg" }} color="white" m={0}>
                {name}
              </Heading>

              {organizer.user_id === currentUserId && (
                <Badge colorPalette="green" variant="outline" fontSize="xs" ml="auto">
                  You
                </Badge>
              )}
            </HStack>
          );
        })}
      </VStack>
    </>
  );
}
