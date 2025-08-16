import { Box, Link } from '@chakra-ui/react';
import React from 'react';

interface RoundLinkProps {
  tourneyId: number | string;
  roundId: number | string;
  roundName: string;
}

const RoundLink: React.FC<RoundLinkProps> = ({ tourneyId, roundId, roundName }) => {
  return (
    <Box fontWeight="bold">
      <Link
        href={`/tourney/${tourneyId}/round/${roundId}`}
        color="cyan.solid"
        variant="underline"
        _hover={{ color: 'cyan.focusRing' }}
        _focus={{ color: 'cyan.solid', boxShadow: 'none' }}
      >
        {roundName}
      </Link>
    </Box>
  );
};

export default RoundLink;