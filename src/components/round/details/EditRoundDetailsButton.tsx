import { IconButton } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";

import RoundModal from "./RoundModal";
import { handleUpdateRoundDetails } from "../../../handlers/round/handleRoundRow";
import { toaster } from "../../ui/toaster";

import type { Round } from "../../../types/Round";
import type { RoundPool } from "../../../types/RoundPool";

interface EditRoundDetailsButtonProps {
  round: Round;
  setRound: (round: Round) => void;
  rounds?: Round[];
  roundPools?: RoundPool[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
}

export default function EditRoundDetailsButton({ round, setRound, rounds, roundPools, setRounds }: EditRoundDetailsButtonProps) {
  async function onAdminClick(
    name: string,
    pointsPerStage: string | undefined,
    roundPoolId: number | null | undefined
  ) {
    const updatedRound = await handleUpdateRoundDetails(
      round.id,
      name,
      pointsPerStage,
      roundPoolId
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
      roundPools={roundPools}
      trigger={button}
      onSubmitForm={onAdminClick}
    />
  );
}