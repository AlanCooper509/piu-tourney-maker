import { Link } from '@chakra-ui/react';
import type { Round } from "../../types/Round";

type RoundsNavbarProps = {
  tourneyId: number;
  rounds: Round[];
};

export default function RoundsNavbar({ tourneyId, rounds }: RoundsNavbarProps) {
  let filteredRounds = [];
  if (rounds) {
    for (const round of rounds) {
      if (round.parent_round_id === null) {
        filteredRounds.push(round);
      }
    }
  }
  return (
    <nav style={{ padding: "1rem" }}>
      {filteredRounds.map((round, index) => (
        <span key={round.id}>
          <Link
            fontSize={["md", "md", "lg", "xl"]}
            href={`/tourney/${tourneyId}/round/${round.id}`}
            style={{ marginRight: "0.5rem" }}
          >
            {round.name}
          </Link>
          {index < rounds.length - 1 && <span style={{ marginRight: "0.5rem" }}>|</span>}
        </span>
      ))}
    </nav>
  );
}