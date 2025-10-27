import { IconButton } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";

import RoundModal from "./RoundModal";
import { handleUpdateRoundDetails } from "../../../handlers/round/handleRoundRow";
import { toaster } from "../../ui/toaster";

import type { Round } from "../../../types/Round";

interface EditRoundDetailsButtonProps {
  round: Round;
  setRound: (round: Round) => void;
  rounds?: Round[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
}

export default function EditRoundDetailsButton({ round, setRound, rounds, setRounds }: EditRoundDetailsButtonProps) {
  async function onAdminClick(
    name: string,
    advancing: number,
    nextRoundId: number | undefined,
    parentRoundId: number | undefined,
    pointsPerStage: string | undefined
  ) {
    const updatedRound = await handleUpdateRoundDetails(
      round.id,
      name,
      advancing,
      nextRoundId,
      parentRoundId,
      pointsPerStage
    );

    setRound(updatedRound);
    setRounds((prev) =>
      prev.some(r => r.id === updatedRound.id)
        ? prev.map(r => r.id === updatedRound.id ? updatedRound : r) // update
        : [...prev, updatedRound] // add new
    )

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
      trigger={button}
      onSubmitForm={onAdminClick}
    />
  );
}