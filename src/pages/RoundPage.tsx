import React, { useState } from "react";
import { useParams } from "react-router-dom";

interface Player {
  id: number;
  name: string;
  seed: number;               // Player seed or ranking
}

interface Match {
  id: number;
  player1: Player;
  player2: Player | null;     // null if bye or waiting opponent
  score1?: number;            // optional score
  score2?: number;
  winnerId?: number;          // id of the winner player
}

interface Stage {
  id: number;
  name: string;
  description?: string;       // Extra info about the stage
  matches: Match[];
}

interface Round {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  stages: Stage[];
}

const RoundPage: React.FC = () => {
  const { tourneyId, roundId } = useParams<{ tourneyId: string; roundId: string }>();

  // More detailed, realistic hardcoded data
  const round: Round = {
    id: Number(roundId),
    name: `Round ${roundId} of Tournament ${tourneyId}`,
    startDate: "2025-08-10",
    endDate: "2025-08-12",
    stages: [
      {
        id: 1,
        name: "Stage 1 - Qualifiers",
        description: "Initial qualification matches with 8 players.",
        matches: [
          {
            id: 101,
            player1: { id: 1, name: "Alice Johnson", seed: 1 },
            player2: { id: 2, name: "Bob Smith", seed: 8 },
            score1: 21,
            score2: 15,
            winnerId: 1,
          },
          {
            id: 102,
            player1: { id: 3, name: "Charlie Brown", seed: 4 },
            player2: { id: 4, name: "Derek Lin", seed: 5 },
            score1: 18,
            score2: 21,
            winnerId: 4,
          },
          {
            id: 103,
            player1: { id: 5, name: "Eva Martinez", seed: 2 },
            player2: { id: 6, name: "Frank Castle", seed: 7 },
            score1: 21,
            score2: 19,
            winnerId: 5,
          },
          {
            id: 104,
            player1: { id: 7, name: "Grace Lee", seed: 3 },
            player2: { id: 8, name: "Henry Ford", seed: 6 },
            score1: 21,
            score2: 9,
            winnerId: 7,
          },
        ],
      },
      {
        id: 2,
        name: "Stage 2 - Semi Finals",
        description: "Top 4 players compete to advance to finals.",
        matches: [
          {
            id: 201,
            player1: { id: 1, name: "Alice Johnson", seed: 1 },
            player2: { id: 4, name: "Derek Lin", seed: 5 },
            score1: 21,
            score2: 17,
            winnerId: 1,
          },
          {
            id: 202,
            player1: { id: 5, name: "Eva Martinez", seed: 2 },
            player2: { id: 7, name: "Grace Lee", seed: 3 },
            score1: 20,
            score2: 22,
            winnerId: 7,
          },
        ],
      },
      {
        id: 3,
        name: "Stage 3 - Finals",
        description: "Final match to decide the tournament winner.",
        matches: [
          {
            id: 301,
            player1: { id: 1, name: "Alice Johnson", seed: 1 },
            player2: { id: 7, name: "Grace Lee", seed: 3 },
            score1: 19,
            score2: 21,
            winnerId: 7,
          },
        ],
      },
    ],
  };

  const [selectedStageId, setSelectedStageId] = useState<number>(round.stages[0].id);

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStageId(Number(e.target.value));
  };

  const selectedStage = round.stages.find((s) => s.id === selectedStageId);

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>{round.name}</h1>
      <p>
        <strong>Start Date:</strong> {round.startDate} <br />
        <strong>End Date:</strong> {round.endDate}
      </p>

      <label htmlFor="stage-select" style={{ fontWeight: "bold" }}>
        Select Stage:
      </label>
      <select
        id="stage-select"
        value={selectedStageId}
        onChange={handleStageChange}
        style={{ marginLeft: 8, padding: "0.3rem", fontSize: "1rem" }}
      >
        {round.stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.name}
          </option>
        ))}
      </select>

      {selectedStage && (
        <>
          <h2 style={{ marginTop: "1rem" }}>{selectedStage.name}</h2>
          {selectedStage.description && (
            <p style={{ fontStyle: "italic", color: "#555" }}>{selectedStage.description}</p>
          )}
          <div>
            {selectedStage.matches.length === 0 ? (
              <p>No matches available for this stage.</p>
            ) : (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {selectedStage.matches.map((match) => (
                  <li
                    key={match.id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      padding: 10,
                      marginBottom: 10,
                      maxWidth: 400,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <div>
                      <strong>
                        {match.player1.name} (Seed {match.player1.seed})
                      </strong>
                      {" vs. "}
                      {match.player2 ? (
                        <>
                          <strong>
                            {match.player2.name} (Seed {match.player2.seed})
                          </strong>
                        </>
                      ) : (
                        <em>Waiting for opponent...</em>
                      )}
                    </div>
                    {match.score1 !== undefined && match.score2 !== undefined ? (
                      <div style={{ marginTop: 6 }}>
                        Score: {match.score1} - {match.score2} | Winner:{" "}
                        {match.winnerId === match.player1.id
                          ? match.player1.name
                          : match.winnerId === match.player2?.id
                          ? match.player2.name
                          : "TBD"}
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, fontStyle: "italic" }}>
                        Match not played yet
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoundPage;
