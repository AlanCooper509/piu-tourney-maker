import { useState } from "react";
import { IconButton } from "@chakra-ui/react"

import DialogForm from "../../ui/DialogForm"
import SeedPlayersFormBody from "./GenerateBracketFormBody";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import onSubmitHandler from "./onSubmitHandler";

import type { PlayerTourney } from "../../../types/PlayerTourney";

interface SeedPlayersButtonProps {
  players: PlayerTourney[] | null,
}
export default function GenerateBracketButton({ players }: SeedPlayersButtonProps) {
  const { tourney } = useCurrentTourney();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDoubleElimination = tourney?.type === "Double Elimination";
  const seedingData = players ? calculateSeeding(players) : null;

  const handleSubmit = async () => {
    if (!tourney?.id || !seedingData) return false;

    setSubmitting(true);
    try {
      const success = await onSubmitHandler({ 
        tourneyId: tourney.id,
        matches: seedingData.roundMatches,
        bracketSize: seedingData.bracketSize
      });
      
      if (success) {
        setOpen(false);
      }
      return success;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogForm
      title="Seed the Players into Rounds"
      trigger={
        <IconButton
          colorPalette="blue"
          variant="outline"
          borderWidth={2}
          size="sm"
          px={2}
          loading={open}
        >
          Generate Bracket
        </IconButton>
      }
      formBody={
        <SeedPlayersFormBody 
          isDoubleElimination={isDoubleElimination}
          roundMatches={seedingData?.roundMatches || []}
          playerCount={seedingData?.playerCount || 0}
          players={players || []}
        />
      }
      showSubmit={!!players?.length && !!tourney?.id}
      loading={submitting}
      open={open}
      setOpen={setOpen}
      onSubmit={handleSubmit}
      onCancel={async () => { }}
    />
  )
}

function calculateSeeding(players: PlayerTourney[]) {
  const rawPlayers = [...players].filter(Boolean);
  const seeded = rawPlayers
    .filter(p => typeof p.seed === 'number')
    .sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0));
  const unseeded = rawPlayers.filter(p => typeof p.seed !== 'number');
  
  const sortedPlayers = [...seeded, ...unseeded].map((p, i) => ({
    ...p,
    seed: i + 1 
  }));

  const playerCount = sortedPlayers.length;
  const bracketSize = 2 ** Math.ceil(Math.log2(Math.max(playerCount, 1)));
  const seedingOrder = generateSeedPositions(bracketSize);

  const roundMatches = [];
  for (let i = 0; i < seedingOrder.length; i += 2) {
    const seedA = seedingOrder[i];
    const seedB = seedingOrder[i + 1];
    const a = sortedPlayers.find((p) => p.seed === seedA) ?? null;
    const b = sortedPlayers.find((p) => p.seed === seedB) ?? null;
    roundMatches.push([a, b]);
  }

  return { roundMatches, bracketSize, playerCount };
}

/**
 * Standard seeding pattern (top vs bottom distribution)
 * Works for 2^n brackets
 */
function generateSeedPositions(size: number): number[] {
  let seeds = [1];
  while (seeds.length < size) {
    const nextSeeds = [];
    for (let i = 0; i < seeds.length; i++) {
      nextSeeds[i * 2] = seeds[i];
      nextSeeds[i * 2 + 1] = (seeds.length * 2 + 1) - seeds[i];
    }
    seeds = nextSeeds;
  }
  return seeds;
}
