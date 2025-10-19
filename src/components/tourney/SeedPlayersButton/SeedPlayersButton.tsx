import { useState } from "react";
import { IconButton } from "@chakra-ui/react"

import DialogForm from "../../ui/DialogForm"
import SeedPlayersFormBody from "./SeedPlayersFormBody";
import type { PlayerTourney } from "../../../types/PlayerTourney";
import type { Round } from "../../../types/Round";

interface SeedPlayersButtonProps {
  players: PlayerTourney[] | null
  rounds: Round[] | null
}
export default function SeedPlayersButton({ players, rounds }: SeedPlayersButtonProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const filteredRounds = rounds?.filter(round => round.parent_round_id === null).sort((a, b) => (a.id! - b.id!)) ?? [];

  return (
    <DialogForm
      title="Seed the Players into Rounds"
      trigger={
        <IconButton
          colorPalette="blue"
          variant="outline"
          borderWidth={2}
          size="sm"
          mt={2}
          px={2}
          loading={isSeeding}
        >
          Seed Players
        </IconButton>
      }
      formBody={<SeedPlayersFormBody players={players} rounds={filteredRounds} />}
      showSubmit={filteredRounds.length > 0}
      open={isSeeding}
      setOpen={setIsSeeding}
      onSubmit={async () => { return true }}
      onCancel={async () => { }}
    />
  )
}