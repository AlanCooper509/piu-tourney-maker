import { IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { GrChapterNext } from "react-icons/gr";

import { toaster } from "../ui/toaster";

import type { Round } from "../../types/Round";
import handleEndRound from "../../handlers/handleEndRound";

const toasterErrorTitleText = 'Failed to End Round';

interface StartRoundButtonProps {
  tourneyId: number;
  round: Round | null;
  setRound: (round: Round | null) => void;
}

export default function EndRoundButton({ tourneyId, round, setRound }: StartRoundButtonProps) {
  const [isEnding, setIsEnding] = useState(false);
  const handleEndRoundClick = async () => {
    if (!round) return;
    if (round.status !== "In Progress") {
      toaster.create({ title: toasterErrorTitleText, description: 'Round is not currently "In Progress"', type: 'error', closable: true });
      return;
    }

    try {
      setIsEnding(true);
      const { updatedRound } = await handleEndRound({ tourneyId, round });
      setRound({ ...updatedRound[0] });
      toaster.create({
        title: "Round Ended",
        description: `Round "${round.name}" has now concluded.`,
        type: "success",
        closable: true,
      });
    } catch (err: any) {
      toaster.create({
        title: toasterErrorTitleText,
        description: err.message || "Unknown error",
        type: "error",
        closable: true,
      });
    } finally {
      setIsEnding(false);
    }
  };


  return (
    <IconButton
      px={2}
      variant="outline"
      borderWidth={2}
      size="sm"
      colorPalette="orange"
      onClick={handleEndRoundClick}
      loading={isEnding}
    >
      End Round <GrChapterNext />
    </IconButton>
  );
}