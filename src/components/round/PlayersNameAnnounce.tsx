import type { PlayerRound } from "../../types/PlayerRound";

interface PlayersNameAnnounceProps {
  players: PlayerRound[] | null;
}

export default function PlayersNameAnnounce({ players }: PlayersNameAnnounceProps) {
    // add logical stuff here
    const firstPlayer = players && players.length > 0 ? players[0].player_tourneys.player_name : "No first player";
    const secondPlayer = players && players.length > 1 ? players[1].player_tourneys.player_name : "No second player";

    // render stuff here
    return (
      <>
        <br />

        {/* make the text size 16px */}
        <span style={{ padding: "8px", fontSize: "20px" }}>
          {firstPlayer.toUpperCase() + " VS " + secondPlayer.toUpperCase()}
        </span>
      </>
    );
}
