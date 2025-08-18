import { Button } from "@chakra-ui/react";
import { useState } from "react";

import { handleStartRound } from "../../handlers/handleStartRound";
import { toaster } from "../ui/toaster";

import type { Stage } from "../../types/Stage";
import type { Round } from "../../types/Round";
import type { PlayerRound } from "../../types/PlayerRound";

const toasterErrorTitleText = 'Failed to Start Round';

interface StartRoundButtonProps {
    round: Round | null;
    setRound: (round: Round | null) => void;
    players: PlayerRound[] | null;
    stages: Stage[] | null;
}

export default function StartRoundButton({ round, setRound, players, stages }: StartRoundButtonProps) {
    const [isStarting, setIsStarting] = useState(false);
    const handleStartRoundClick = async () => {
    if (!round) return;
    if (!players || players.length < 2) {
        toaster.create({ title: toasterErrorTitleText, description: 'Need at least 2 players', type: 'error', closable: true });
        return;
    }

    if (!stages || stages.length < 1) {
        toaster.create({ title: toasterErrorTitleText, description: 'Need at least 1 stage', type: 'error', closable: true });
        return;
    }

    if (stages.every(stage => !stage.chart_pools || stage.chart_pools.length === 0)) {
        toaster.create({ title: toasterErrorTitleText, description: 'Need at least 1 chart per stage', type: 'error', closable: true });
        return;
    }

    try {
        setIsStarting(true);
        const {updatedRound} = await handleStartRound(round.id);
        setRound({...updatedRound[0]});
        toaster.create({
        title: "Round Started",
        description: `Round "${round.name}" is now in progress.`,
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
        setIsStarting(false);
    }
    };
    

    return (
        <Button colorPalette="green" onClick={handleStartRoundClick} mt={2} loading={isStarting}>
            Start Round
        </Button>
    );
}
