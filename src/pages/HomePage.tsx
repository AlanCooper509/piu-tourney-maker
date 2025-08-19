import { Link } from 'react-router-dom';
import { Heading, Text, Box, VStack, HStack, Image, Flex, LinkBox, LinkOverlay } from '@chakra-ui/react';

import getSupabaseTable from '../hooks/getSupabaseTable';
import type { Tourney } from '../types/Tourney';
import { getAdminTourneyIds } from '../hooks/AdminTourneyHelpers';

function HomePage() {
  const { data: tourneys, loading, error } = getSupabaseTable<Tourney>('tourneys');
  const { adminTourneyIds, loading: adminLoading } = getAdminTourneyIds();

  if (loading) return <Text fontSize="xl">Loading...</Text>;
  if (error) return <Text fontSize="xl">Error: {error.message}</Text>;

  tourneys.sort((a, b) => a.id - b.id);

  const renderTourneyCard = (row: Tourney, keyPrefix: string) => (
    <LinkBox
      as="article"
      key={`${keyPrefix}-${row.id}`}
      borderWidth="1px"
      borderRadius="lg"
      p={{ base: 4, sm: 5 }}
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
      w={{ base: '90%', md: '60%' }}
      mx="auto"
    >
      {/* Entire card is clickable */}
      <Link to={`/tourney/${row.id}`}>
        <LinkOverlay>
          <HStack align="center" w="100%">
            <Box minW={{ base: '60px', sm: '80px', md: '90px' }} minH={{ base: '60px', sm: '80px', md: '90px' }}>
              <Image
                src={'https://images.start.gg/images/tournament/776306/image-ac1496a2e656e00a6a57aa025a87b0b3.jpg'}
                alt={`${row.name} image`}
                boxSize={{ base: '60px', sm: '80px', md: '90px' }}
                objectFit="cover"
                borderRadius="md"
              />
            </Box>

            <Flex direction="column" flex="1" justify="space-between" minH={{ base: '70px', sm: '90px' }}>
              <HStack justify="space-between" w="100%" align="start">
                <Heading as="h3" fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }}>
                  {row.name}
                </Heading>

                {keyPrefix === 'my' && (
                  <HStack>
                    {adminLoading ? (
                      <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.300">(Loading...)</Text>
                    ) : adminTourneyIds.includes(row.id) ? (
                      <Text fontSize={{ base: 'md', sm: 'lg' }} color="green.400">(Admin)</Text>
                    ) : null}
                  </HStack>
                )}
              </HStack>

              <Box w="100%" mt={2}>
                <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.300" textAlign="left">
                  Date: {/* Add logic here */}
                </Text>
              </Box>

              <Flex justify="flex-end" mt={2}>
                <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.300">
                  ID: {row.id}
                </Text>
              </Flex>
            </Flex>
          </HStack>
        </LinkOverlay>
      </Link>
    </LinkBox>
  );

  const renderAddTourneyCard = () => (
    <Flex
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="gray.400"
      borderRadius="lg"
      p={{ base: 4, sm: 5 }}
      minH={{ base: '110px', sm: '130px' }}
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
      w={{ base: '90%', md: '60%' }}
      mx="auto"
    >
      <Text fontSize={{ base: '3xl', sm: '4xl' }} color="gray.400">
        +
      </Text>
    </Flex>
  );

  const renderSectionHeader = (title: string) => (
    <Box display="inline-block" bg="gray.900" px={4} py={2} borderRadius="md" mb={4}>
      <Heading as="h2" fontSize="32px" textAlign="center">
        {title}
      </Heading>
    </Box>
  );

  return (
    <>
      <Flex justify="center" w="100%">{renderSectionHeader("My Tourneys")}</Flex>
      <VStack align="stretch" w="100%" maxW="100%" mb={8}>
        {tourneys.map((row) => renderTourneyCard(row, 'my'))}
        {renderAddTourneyCard()}
      </VStack>

      <Flex justify="center" w="100%">{renderSectionHeader("Active Tourneys")}</Flex>
      <VStack align="stretch" w="100%" maxW="100%" mb={8}>
        {tourneys.map((row) => renderTourneyCard(row, 'active'))}
      </VStack>

      <Flex justify="center" w="100%">{renderSectionHeader("Archived Tourneys")}</Flex>
      <VStack align="stretch" w="100%" maxW="100%">
        {tourneys.map((row) => renderTourneyCard(row, 'archived'))}
      </VStack>

      <Box mt={12} w="100%">
        <hr style={{ borderColor: 'grey', borderWidth: '1px' }} />
        <Text textAlign="center" py={4} fontSize="lg">yo mama</Text>
      </Box>
    </>
  );
}

export default HomePage;
