import { useParams } from "react-router-dom";
import { Heading, Text } from "@chakra-ui/react";

import type { Event } from "../types/Event";
import type { Tourney } from "../types/Tourney";

import getSupabaseTable from "../hooks/getSupabaseTable";
import TourneyCard from "../components/ui/TourneyCard";
import EventOverview from "../components/event/EventOverview";

function EventPage() {
  // get eventId from url path
  const { eventId } = useParams();

  // get event details from eventId
  const {
    data: event,
    loading: event_loading,
    error: event_error,
  } = getSupabaseTable<Event>("events", {
    column: "id",
    value: eventId,
  });

  // get tourneys to render @ section 3
  const {
    data: tourneys,
    loading: tourneys_loading,
    error: tourneys_error,
  } = getSupabaseTable<Tourney>("tourneys", {
    column: "event_id",
    value: eventId,
  });

  // get array check
  if (event_loading) return <Text fontSize="xl">Loading...</Text>;
  if (event_error)
    return <Text fontSize="xl">Error: {event_error.message}</Text>;

  // if eventId is INVALID
  if (event.length == 0) {
    return (
      <Text fontSize="xl">No Event found w/ associated eventId: {eventId}</Text>
    );
  }

  return (
    <>
      {/* Section 1 and 2: Hero Image & Event Overview */}
      <EventOverview event={event[0]} />

      {/* Section 3: Associated Tourneys */}
      <Heading fontSize="30px" fontWeight="bold" mt="50px" mb="50px">
        Tourneys
      </Heading>

      {/* Check if associated event has <= 1 tourneys */}
      {tourneys_loading && <Text>Loading tourneys...</Text>}
      {tourneys_error && (
        <Text color="red">Error: {tourneys_error.message}</Text>
      )}

      {/* Render Tourney Cards */}
      {!tourneys_loading &&
        !tourneys_error &&
        tourneys.map((tourney) => (
          <TourneyCard
            key={`nested-${tourney.id}`}
            row={tourney}
            keyPrefix="nested"
            isNested={false}
            adminTourneyIds={[]}
          />
        ))}
    </>
  );
}

export default EventPage;