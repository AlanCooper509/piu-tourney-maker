import { IconButton } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";

import RoundModal from "./RoundModal";
import { handleUpdateRoundDetails } from "../../../handlers/handleUpdateRoundDetails";
import { toaster } from "../../ui/toaster";

import type { Round } from "../../../types/Round";

interface EditRoundDetailsButtonProps {
  round: Round;
  setRound: (round: Round) => void;
  rounds?: Round[];
  roundName: string;
  setRoundName: (name: string) => void;
  playersAdvancing: number;
  setPlayersAdvancing: (count: number) => void;
}

export default function EditRoundDetailsButton({ round, setRound, rounds, roundName, setRoundName, playersAdvancing, setPlayersAdvancing }: EditRoundDetailsButtonProps) {
  async function onAdminClick(name: string, advancing: number, nextRoundId: number | undefined) {
    const updatedRound = await handleUpdateRoundDetails(round.id, name, advancing, nextRoundId);
    setRound(updatedRound);

    toaster.create({
      title: "Round Updated",
      description: `Round "${updatedRound.name}" was updated successfully.`,
      type: "success",
      closable: true,
    });
  }

  const button = (
    <IconButton
      aria-label="Edit round name"
      variant="outline"
      borderWidth={2}
      size="sm"
      colorPalette="blue"
      px={2}
    >
      Edit Round Details<CiEdit />
    </IconButton>
  );

  return (
    <RoundModal
      round={round}
      rounds={rounds}
      roundName={roundName}
      setRoundName={setRoundName}
      playersAdvancing={playersAdvancing}
      setPlayersAdvancing={setPlayersAdvancing}
      trigger={button}
      onSubmitForm={onAdminClick}
    />
  );
}