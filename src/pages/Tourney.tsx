import { VStack, StackSeparator, Box, Heading, Text } from "@chakra-ui/react"
import { Link, useParams } from "react-router-dom";

import getSupabaseTable from '../hooks/getSupabaseTable';
import type { Tourney } from '../types/tourney';

function TourneyPage() {
    const { tourneyId } = useParams();
    const { data: tourneys, loading, error } = getSupabaseTable<Tourney>(
        'tourneys',
        { column: 'id', value: tourneyId }
    );

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (tourneys.length === 0) return (
        <>
        <Link to="/">Return Home</Link>
        <p>Tourney ID not found.</p>
        </>
    );

    let tourney = tourneys[0];

    return (
        <>
        <title>{tourney.name}</title>
        <VStack separator={<StackSeparator />}>
            <Box>
                <Heading mb={2}>Tournament Details</Heading>
                <Text>Name: {tourney.name}</Text>
                <Text>Type: {tourney.type}</Text>
                <Text>Status: {tourney.status}</Text>
            </Box>
            <Box>
                <Heading mb={2}>Players</Heading>
                <Text>TODO</Text>
            </Box>
            <Box>
                <Heading mb={2}>Rounds</Heading>
                <Text>TODO</Text>
            </Box>
        </VStack>
        </>
    )
}

export default TourneyPage;