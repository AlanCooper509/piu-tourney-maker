import { IconButton } from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";

import RoundModal from "./RoundModal";
import { handleUpdateRoundDetails } from "../../handlers/handleUpdateRoundDetails";
import { toaster } from "../ui/toaster";

import type { Round } from "../../types/Round";

interface EditRoundDetailsButtonProps {
  round: Round;
  setRound: (round: Round) => void;
  roundName: string;
  setRoundName: (name: string) => void;
  playersAdvancing: number;
  setPlayersAdvancing: (count: number) => void;
  admin: boolean;
  loadingAdmin: boolean;
}

export default function EditRoundDetailsButton({ round, setRound, roundName, setRoundName, playersAdvancing, setPlayersAdvancing, admin, loadingAdmin }: EditRoundDetailsButtonProps) {
  async function onAdminClick() {
    console.log(playersAdvancing);
    const updatedRound = await handleUpdateRoundDetails(round.id, roundName, playersAdvancing);
    setRound(updatedRound);

    toaster.create({
      title: "Round Updated",
      description: `Round "${updatedRound.name}" was updated successfully.`,
      type: "success",
      closable: true,
    });
  }

  const button = admin ? (
    <IconButton
      aria-label="Edit round name"
      variant="outline"
      borderWidth={2}
      size="sm"
      colorPalette="blue"
      px={2}
    >
      Edit Details<CiEdit />
    </IconButton>
  ) : null;

  return (
    <>
      {!loadingAdmin && admin && (
        <RoundModal
          roundName={roundName}
          setRoundName={setRoundName}
          playersAdvancing={playersAdvancing}
          setPlayersAdvancing={setPlayersAdvancing}
          trigger={button}
          admin={admin}
          adminLoading={loadingAdmin}
          onSubmitForm={onAdminClick}
        />
      )}
    </>
  );
}