import { useState } from "react";
import { IconButton } from "@chakra-ui/react";

import DialogForm from "../../ui/DialogForm";
import GenerateSingleStreamBracketFormBody from "./GenerateSingleStreamBracketFormBody";
import onSubmitHandler from "./onSubmitHandler";
import { useCurrentTourney } from "../../../context/CurrentTourneyContext";
import { generateSingleStreamTemplate } from "../../../handlers/bracketGenerator/generateSingleStreamTemplate";

import type { PlayerTourney } from "../../../types/PlayerTourney";
import type { SingleStreamTemplateResult } from "../../../handlers/bracketGenerator/generateSingleStreamTemplate";

interface GenerateSingleStreamBracketButtonProps {
  players: PlayerTourney[] | null;
  buttonText: string;
}

export default function GenerateSingleStreamBracketButton({ players, buttonText }: GenerateSingleStreamBracketButtonProps) {
  const { tourney } = useCurrentTourney();
  const redemptionEnabled = tourney?.type === "Waterfall (Redemption)";

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [groupSize, setGroupSize] = useState(4);
  const [directAdvancers, setDirectAdvancers] = useState(1);
  const [redemptionAdvancers, setRedemptionAdvancers] = useState(1);

  const validPlayers = (players ?? []).filter(Boolean);

  let generated: SingleStreamTemplateResult | null = null;
  let generationError: string | null = null;
  try {
    if (validPlayers.length > 0) {
      generated = generateSingleStreamTemplate({
        players: validPlayers,
        groupSize,
        directAdvancers,
        redemptionAdvancers: redemptionEnabled ? redemptionAdvancers : 0,
      });
    }
  } catch (err: any) {
    generationError = err.message;
  }

  const handleSubmit = async () => {
    if (!tourney?.id || !generated) return false;

    setSubmitting(true);
    try {
      const success = await onSubmitHandler({
        tourneyId: tourney.id,
        tourneyType: tourney.type,
        template: generated.template,
        initialSeeding: generated.initialSeeding,
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
      title="Generate Bracket"
      trigger={
        <IconButton
          colorPalette="blue"
          variant="outline"
          borderWidth={2}
          size="sm"
          px={2}
          loading={open}
        >
          {buttonText}
        </IconButton>
      }
      formBody={
        <GenerateSingleStreamBracketFormBody
          players={validPlayers}
          groupSize={groupSize}
          setGroupSize={setGroupSize}
          directAdvancers={directAdvancers}
          setDirectAdvancers={setDirectAdvancers}
          redemptionEnabled={redemptionEnabled}
          redemptionAdvancers={redemptionAdvancers}
          setRedemptionAdvancers={setRedemptionAdvancers}
          generated={generated}
          generationError={generationError}
        />
      }
      showSubmit={!!generated && !!tourney?.id}
      loading={submitting}
      open={open}
      setOpen={setOpen}
      onSubmit={handleSubmit}
      onCancel={async () => { }}
    />
  );
}
