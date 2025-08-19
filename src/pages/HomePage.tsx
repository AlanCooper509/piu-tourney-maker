import { Link } from 'react-router-dom';
import { Heading, Text, Box, VStack, HStack, Image, Flex, LinkBox, LinkOverlay } from '@chakra-ui/react';

import getSupabaseTable from '../hooks/getSupabaseTable';
import type { Tourney } from '../types/Tourney';
import { getAdminTourneyIds } from '../hooks/AdminTourneyHelpers';
import { HeroTitle } from '../components/ui/HeroTitle';

function HomePage() {
  const { data: tourneys, loading, error } = getSupabaseTable<Tourney>('tourneys');
  const { adminTourneyIds, loading: adminLoading } = getAdminTourneyIds();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  tourneys.sort((a, b) => a.id - b.id);

  const renderTourneyCard = (row: Tourney, keyPrefix: string) => (
    <LinkBox
      as="article"
      key={`${keyPrefix}-${row.id}`}
      borderWidth="1px"
      borderRadius="lg"
      p={{ base: 3, sm: 4 }}
      bg="gray.900"
      color="white"
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        shadow: 'lg',
        bg: 'gray.600',
        transform: 'scale(1.02)',
        cursor: 'pointer',
      }}
    >
      <HStack align="center">
        <Box minW={{ base: '50px', sm: '70px', md: '80px' }} minH={{ base: '50px', sm: '70px', md: '80px' }}>
          <Image
            src={`https://images.start.gg/images/tournament/776306/image-ac1496a2e656e00a6a57aa025a87b0b3.jpg`}
            alt={`${row.name} image`}
            boxSize={{ base: '50px', sm: '70px', md: '80px' }}
            objectFit="cover"
            borderRadius="md"
          />
        </Box>

        <Flex direction="column" flex="1" justify="space-between" minH={{ base: '60px', sm: '80px' }}>
          <HStack justify="space-between" w="100%" align="start">
            <LinkOverlay as={Link} to={`/tourney/${row.id}`}>
              <Heading as="h3" fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}>
                {row.name}
              </Heading>
            </LinkOverlay>

            {keyPrefix === 'my' && (
              <HStack>
                {adminLoading ? (
                  <Text fontSize={{ base: 'sm', sm: 'md' }} color="gray.300">(Loading...)</Text>
                ) : adminTourneyIds.includes(row.id) ? (
                  <Text fontSize={{ base: 'sm', sm: 'md' }} color="green.400">(Admin)</Text>
                ) : (
                  <Text fontSize={{ base: 'sm', sm: 'md' }} color="red.400">(Not Admin)</Text>
                )}
              </HStack>
            )}
          </HStack>

          <Box w="100%" mt={1}>
            <Text fontSize={{ base: 'sm', sm: 'md' }} color="gray.300" textAlign="left">
              Date: {/* Add logic here */}
            </Text>
          </Box>

          <Flex justify="flex-end" mt={2}>
            <Text fontSize={{ base: 'sm', sm: 'md' }} color="gray.300">
              ID: {row.id}
            </Text>
          </Flex>
        </Flex>
      </HStack>
    </LinkBox>
  );

  const renderAddTourneyCard = () => (
    <Flex
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="gray.400"
      borderRadius="lg"
      p={{ base: 3, sm: 4 }}
      minH={{ base: '100px', sm: '120px' }}
      shadow="sm"
      bg="gray.900"
      color="white"
      transition="all 0.2s"
      _hover={{
        shadow: 'md',
        bg: 'gray.600',
        transform: 'scale(1.02)',
        cursor: 'pointer',
      }}
      align="center"
      justify="center"
    >
      <Text fontSize={{ base: '2xl', sm: '3xl' }} color="gray.400">
        +
      </Text>
    </Flex>
  );

  return (
    <>
      <HeroTitle />

      <Heading as="h2" size="xl" mb={4}>My Tourneys</Heading>
      <VStack align="stretch" maxW="800px" mx="auto" mb={8}>
        {tourneys.map((row) => renderTourneyCard(row, 'my'))}
        {renderAddTourneyCard()}
      </VStack>

      <Heading as="h2" size="lg" mb={4}>Active Tourneys</Heading>
      <VStack align="stretch" maxW="800px" mx="auto" mb={8}>
        {tourneys.map((row) => renderTourneyCard(row, 'active'))}
      </VStack>

      <Heading as="h2" size="lg" mb={4}>Archived Tourneys</Heading>
      <VStack align="stretch" maxW="800px" mx="auto">
        {tourneys.map((row) => renderTourneyCard(row, 'archived'))}
      </VStack>

      <Box mt={12} w="100%">
        <hr style={{ borderColor: 'grey', borderWidth: '1px' }} />
        <Text textAlign="center" py={4}>yo mama</Text>
      </Box>
    </>
  );
}

export default HomePage;
