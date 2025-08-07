import { Heading, Table } from "@chakra-ui/react"
import { useParams } from "react-router-dom";

const entries = [
  { id: 1, name: "Peter", score: 999999 },
  { id: 2, name: "Chad", score: 999999 },
  { id: 3, name: "Neo Catholicism", score: 999999 },
  { id: 4, name: "Fefemz", score: 999999 },
  { id: 5, name: "Richard", score: 999999 },
]

const sortedEntries = [...entries]
  .sort((a, b) => b.score - a.score)
  .map((entry, index) => ({
    ...entry,
    displayRank: index + 1,
  }));

function Leaderboard() {
  const { tournamentId, roundId } = useParams();

  return (
    <>
      <Heading size="2xl">Leaderboard</Heading>
      <Heading size="lg" mb="6">(Tournament Name for {tournamentId}) | (Round Name for {roundId})</Heading>
      <Table.Root size="lg" variant="outline" stickyHeader>
        <Table.ColumnGroup>
          <Table.Column htmlWidth="5%" />
          <Table.Column htmlWidth="65%" />
          <Table.Column htmlWidth="35%" />
        </Table.ColumnGroup>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Rank</Table.ColumnHeader>
            <Table.ColumnHeader>Player</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Round Score</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedEntries.map((entry) => (
            <Table.Row key={entry.id}>
              <Table.Cell textStyle="xl" textAlign="center">{entry.displayRank}</Table.Cell>
              <Table.Cell textStyle="xl">{entry.name}</Table.Cell>
              <Table.Cell textStyle="xl" textAlign="end">{entry.score.toLocaleString()}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

    </>
  )
}

export default Leaderboard
