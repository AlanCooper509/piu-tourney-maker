import { Link } from '@chakra-ui/react';
import type { Round } from "../../types/Round";

type RoundsNavbarProps = {
  rounds: Round[];
};

export default function RoundsNavbar({ rounds }: RoundsNavbarProps) {
  return (
    <nav style={{ padding: "1rem" }}>
      {rounds.map((round, index) => (
        <span key={round.id}>
          <Link
            href={`/tourney/${round.id}`}
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