import { useParams } from "react-router-dom";
import { Box, Text, VStack, Container, Spinner, Center } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";

import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";
import type { Game } from "../types/Game";
import type { UserProfile } from "../types/UserProfile";

import { Toaster } from "../components/ui/toaster";
import getSupabaseTable from "../hooks/getSupabaseTable";
import { SpotlightEventItem } from "../components/home/SpotlightEventItem";
import EventTourneysList from "../components/event/EventTourneysList";
import EventOrganizersSection from "../components/event/EventOrganizersSection";
import { useIsAdminForEvent } from "../context/admin/AdminEventContext";
import { useAdminTourneyContext } from "../context/admin/AdminTourneyContext";
import { useCurrentEvent } from "../context/CurrentEventContext";
import { useAuth } from "../context/AuthContext";
import { useEventOrganizers } from "../hooks/useEventOrganizers";

function EventPage() {
  const { eventId } = useParams();
  const { isEventAdmin } = useIsAdminForEvent(Number(eventId));
  const { event, tourneys, setEvent, setTourneys } = useCurrentEvent();
  const { adminTourneyIds } = useAdminTourneyContext();
  const { user } = useAuth();

  // tourneys whose organizers (and admin badge) the viewer may see: all of them for event admins,
  // otherwise only the ones they're a tourney admin of
  const visibleAdminTourneyIds = useMemo(
    () => tourneys.map((t) => t.id).filter((id) => isEventAdmin || adminTourneyIds.includes(id)),
    [tourneys, isEventAdmin, adminTourneyIds]
  );

  // refetch when tourneys change, since creating a tourney also makes its creator a tourney admin
  const { organizers, loading: organizersLoading, addOrganizer } = useEventOrganizers(
    Number(eventId),
    visibleAdminTourneyIds.length > 0,
    tourneys.map((t) => t.id).join(",")
  );

  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
  } = getSupabaseTable<Event>("events", { column: "id", value: eventId });

  const {
    data: tourneysData,
    loading: tourneysLoading,
    error: tourneysError,
  } = getSupabaseTable<Tourney>("tourneys", { column: "event_id", value: eventId });

  const { data: queriedGameData } = getSupabaseTable<Game>("games");

  useEffect(() => {
    if (eventData && eventData.length > 0) {
      setEvent(eventData[0]);
    } else {
      setEvent(null);
    }
  }, [eventData, setEvent]);

  useEffect(() => {
    if (tourneysData) {
      const sorted = [...tourneysData].sort((a, b) => 
        a.start_date.localeCompare(b.start_date)
      );
      setTourneys(sorted);
    } else {
      setTourneys([]);
    }
  }, [tourneysData, setTourneys]);

  const { eventOrganizers, organizerNamesByTourney } = useMemo(() => {
    const nameOf = (o: UserProfile) =>
      `${o.display_name ?? "Unknown user"}${o.user_id === user?.id ? " (you)" : ""}`;

    const byTourney = new Map<number, string[]>();
    for (const o of organizers) {
      if (o.tourney_id === null) continue;
      byTourney.set(o.tourney_id, [...(byTourney.get(o.tourney_id) ?? []), nameOf(o)]);
    }

    return {
      // raw names here; the organizers section marks the viewer with its own badge
      eventOrganizers: organizers.filter((o) => o.tourney_id === null),
      organizerNamesByTourney: byTourney,
    };
  }, [organizers, user?.id]);

  if (eventLoading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="teal.500" />
        <Text ml={4}>Loading Event...</Text>
      </Center>
    );
  }

  if (eventError || !event) {
    return (
      <Center h="60vh">
        <Text fontSize="xl" color="red.400">Event not found.</Text>
      </Center>
    );
  }

  return (
    <Box>
      <Toaster />

      {/* SECTION 1: HERO */}
      <SpotlightEventItem event={event} showButton={false} />

      <Container maxW="container.lg" mt={12} pb={20}>
        <VStack gap={8} align="stretch">
          {/* SECTION 2: TOURNAMENTS LIST */}
          <EventTourneysList
            event={event}
            tourneys={tourneys}
            setTourneys={setTourneys}
            loading={tourneysLoading}
            error={tourneysError}
            gameData={queriedGameData ?? null}
            isEventAdmin={isEventAdmin}
            adminTourneyIds={visibleAdminTourneyIds}
            organizerNamesByTourney={organizerNamesByTourney}
          />

          {/* SECTION 3: ORGANIZERS */}
          {isEventAdmin && (
            <EventOrganizersSection
              organizers={eventOrganizers}
              loading={organizersLoading}
              currentUserId={user?.id}
              eventId={event.id}
              onAdminAdded={addOrganizer}
            />
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default EventPage;