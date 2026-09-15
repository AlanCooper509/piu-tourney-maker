import { Link } from '@chakra-ui/react';
import { getEntryRounds } from "../../helpers/getEntryRounds";
import type { Round } from "../../types/Round";
import type { RoundAdvancement } from "../../types/RoundAdvancement";

type RoundsNavbarProps = {
  tourneyId: number;
  rounds: Round[];
  roundAdvancements: RoundAdvancement[];
};

export default function RoundsNavbar({ tourneyId, rounds, roundAdvancements }: RoundsNavbarProps) {
  const filteredRounds = rounds ? getEntryRounds(rounds, roundAdvancements) : [];
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
          {index < filteredRounds.length - 1 && <span style={{ marginRight: "0.5rem" }}>|</span>}
        </span>
      ))}
    </nav>
  );
}