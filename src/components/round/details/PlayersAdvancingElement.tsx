import { Text } from '@chakra-ui/react';

interface Props {
  playersAdvancing?: number | null;
  roundStatus?: string | null;
}

export default function PlayersAdvancingElement({ playersAdvancing, roundStatus }: Props) {
  const tense = roundStatus === "Complete" ? "Advanced" : "Advancing";
  return (
    <Text>Players {tense}: {playersAdvancing}</Text>
  );
}