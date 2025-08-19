import { Table } from "@chakra-ui/react"
import { Box, Collapsible } from "@chakra-ui/react"

function Leaderboard() {
    const playersInfo = {
    songsList: "5",
    playerNames: [
      "Player 1",
      "Player 2",
      "Player 3"
    ],
    playerScores: [100, 200, 300]
  };

  const playersTotal = playersInfo.playerNames.length;

return (
  <>
    {Array.from({ length: playersTotal }).map((_: unknown, j: number) => (
      // display a collapsible for each player
      <Collapsible.Root key={j}>
        <Collapsible.Trigger paddingY="3" style={{ width: "100%" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        {/* Left: Ranking number */}
        <span style={{ minWidth: "2rem", textAlign: "left" }}>
          {j + 1}.</span>

        {/* Middle: Player name */}
        <span style={{ flexGrow: 1, textAlign: "center" }}>
          {playersInfo.playerNames[j] ?? `Player ${j + 1}`}</span>

        {/* Right: Player score */}
        <span style={{ minWidth: "2rem", textAlign: "right" }}>
          {playersInfo.playerScores[j] ?? 0}</span>
      </Box>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Box padding="4" borderWidth="1px">
            <Table.Root size="sm">
              <Table.Body>
                {/* display list of songs */}
                {Array.from({ length: Number(playersInfo.songsList) }).map((_: unknown, i: number) => (
                  <Table.Row key={i}>
                    <Table.ColumnHeader>Image</Table.ColumnHeader>
                    <Table.ColumnHeader>Song Name</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Score</Table.ColumnHeader>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    ))}
  </>
  )
}

export default Leaderboard